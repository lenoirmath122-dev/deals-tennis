import { describe, expect, it } from "vitest";
import { compare } from "@/lib/matching/compare";
import { buildModels, type EngineOffer } from "@/lib/matching/cluster";
import { extractOfferAttributes, type ExtractedOffer, type OfferInput } from "@/lib/matching";

// R4.6-d, conventions de valeur absente (D-2026-10-07-02) : C2 (genre, chaussures Tennispro.fr) et
// C3b (jauge, cordages du site Babolat). Cadrage : `R4_6_conventions_valeur_absente.md` (§4, §6).

type Extra = Partial<Pick<OfferInput, "raw_attributes" | "affiliate_url">>;

const extract = (categorie: OfferInput["categorie"], marchand: string, marque: string, titre: string, extra: Extra = {}): ExtractedOffer =>
  extractOfferAttributes({ marchand, titre, marque, categorie, ...extra });

const shoe = (titre: string, marchand = "Tennispro.fr", extra: Extra = {}) => extract("chaussures", marchand, "Head", titre, extra);
const string = (titre: string, marchand: string) => extract("cordages", marchand, "Babolat", titre);
const niveau = (a: ExtractedOffer, b: ExtractedOffer) => compare(a, b).niveau;

describe("C2 : genre absent = homme, chaussures Tennispro.fr", () => {
  it("titre sans genre : homme, source convention", () => {
    expect(shoe("Head Sprint Pro 4.0 Clay").attributes.genre).toEqual({ value: "homme", source: "convention" });
  });

  it("réunit l'offre Tennispro.fr à une offre « Homme » d'un autre marchand", () => {
    expect(niveau(shoe("Head Sprint Pro 4.0 Clay"), shoe("Head Sprint Pro 4.0 Clay Homme", "SportSystem"))).toBe("identique");
  });

  it("jamais d'écrasement d'une valeur écrite (« Femme » reste femme)", () => {
    expect(shoe("Head Sprint Pro 4.0 Clay Femme").attributes.genre).toEqual({ value: "femme", source: "titre_description" });
  });

  it("piège : face à une offre « Femme », la supposition donne « différent »", () => {
    expect(niveau(shoe("Head Sprint Pro 4.0 Clay"), shoe("Head Sprint Pro 4.0 Clay Femme", "SportSystem"))).toBe("different");
  });

  it("enfants exclus : pas de genre supposé", () => {
    expect(shoe("Head Sprint Pro 4.0 GS Clay").attributes.genre).toBeUndefined();
    expect(shoe("Head Sprint Pro 4.0 Junior").attributes.genre).toBeUndefined();
  });

  it("piège : lettre seule « W », « M », « K » ou « C » dans le titre : pas de genre supposé", () => {
    for (const letter of ["W", "M", "K", "C"]) {
      expect(shoe(`Head Sprint Pro 4.0 ${letter} Clay`).attributes.genre).toBeUndefined();
    }
  });

  it("une lettre dans un mot ne bloque pas (« Wilson Rush Pro 4.0 Clay »)", () => {
    expect(extract("chaussures", "Tennispro.fr", "Wilson", "Wilson Rush Pro 4.0 Clay").attributes.genre?.source).toBe("convention");
  });

  it("autres marchands non concernés", () => {
    expect(shoe("Head Sprint Pro 4.0 Clay", "SportSystem").attributes.genre).toBeUndefined();
    expect(shoe("Head Sprint Pro 4.0 Clay", "Amazon").attributes.genre).toBeUndefined();
  });

  it("autres catégories non concernées", () => {
    expect(extract("raquettes", "Tennispro.fr", "Babolat", "Babolat Pure Aero 98").attributes.genre).toBeUndefined();
  });

  it("canonique : la valeur supposée n'est jamais publiée", () => {
    const engine = (rows: [string, string, string][]): EngineOffer[] =>
      rows.map(([dealId, marchand, titre]) => ({ dealId, marchand, statut: "active", titre, extracted: shoe(titre, marchand) }));
    const alone = buildModels(engine([["1", "Tennispro.fr", "Head Sprint Pro 4.0 Clay"]]));
    expect(alone.models[alone.links.get("1")!.modelIndex].canonical.genre).toBeUndefined();

    const both = buildModels(engine([
      ["1", "Tennispro.fr", "Head Sprint Pro 4.0 Clay"],
      ["2", "SportSystem", "Head Sprint Pro 4.0 Clay Homme"],
    ]));
    const model = both.models[both.links.get("1")!.modelIndex];
    expect(both.links.get("2")!.modelIndex).toBe(both.links.get("1")!.modelIndex);
    expect(model.canonical.genre).toEqual({ value: "homme", source: "titre_description" });
  });
});

describe("C3b : jauge non écrite = variante de la fiche, cordages du site Babolat", () => {
  it("sans jauge dans le titre : alerte jauge_variante_fiche, identique à une jauge écrite ailleurs", () => {
    const babolat = string("Babolat RPM Blast 12 m", "Babolat");
    expect(babolat.alertes).toContain("jauge_variante_fiche");
    expect(niveau(babolat, string("Babolat RPM Blast 1.25mm 12 m", "SportSystem"))).toBe("identique");
  });

  it("jauge écrite sur le site Babolat : règle normale (1,30 ≠ 1,25, proche)", () => {
    const babolat = string("Babolat RPM Blast 1.30mm 12 m", "Babolat");
    expect(babolat.alertes).not.toContain("jauge_variante_fiche");
    expect(niveau(babolat, string("Babolat RPM Blast 1.25mm 12 m", "SportSystem"))).toBe("proche");
  });

  it("les longueurs restent séparées (12 m ≠ 200 m)", () => {
    expect(niveau(string("Babolat RPM Blast 12 m", "Babolat"), string("Babolat RPM Blast 1.25mm 200 m", "SportSystem"))).not.toBe("identique");
  });

  it("Amazon (C3 écartée) : sans jauge, reste indéterminé", () => {
    const amazon = string("Babolat RPM Blast 12 m", "Amazon");
    expect(amazon.alertes).not.toContain("jauge_variante_fiche");
    expect(niveau(amazon, string("Babolat RPM Blast 1.25mm 12 m", "SportSystem"))).toBe("indetermine");
  });
});
