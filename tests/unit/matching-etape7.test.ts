import { describe, expect, it } from "vitest";
import { compare, signature } from "@/lib/matching/compare";
import { buildModels, type EngineOffer } from "@/lib/matching/cluster";
import { extractOfferAttributes, type ExtractedOffer, type OfferInput } from "@/lib/matching";

// R4.5, étape 7 (D-2026-09-30-09) : réduction des indéterminés à la source, une paire piège par règle.
// Cadrage : `R4_5_etape7_indetermines.md` (§8 point 6) ; R4.5-c : `R4_5_c_generation_unique.md` (D-2026-09-30-02).

type Extra = Partial<Pick<OfferInput, "subcategory" | "affiliate_url" | "original_price">>;

const extract = (categorie: OfferInput["categorie"], marchand: string, marque: string, titre: string, extra: Extra = {}): ExtractedOffer =>
  extractOfferAttributes({ marchand, titre, marque, categorie, ...extra });

const racket = (marque: string, titre: string) => extract("raquettes", "Test", marque, titre);
const shoe = (marque: string, titre: string, marchand = "Test", extra: Extra = {}) => extract("chaussures", marchand, marque, titre, extra);
const string = (marque: string, titre: string, marchand = "Test", extra: Extra = {}) => extract("cordages", marchand, marque, titre, extra);

const niveau = (a: ExtractedOffer, b: ExtractedOffer) => compare(a, b).niveau;
const value = (o: ExtractedOffer, name: string) => o.attributes[name]?.value;

describe("§8.1 : défauts d'extraction et de comparaison", () => {
  it("« Ultra 100L V4.0 » / « Ultra 100L V5 Roland Garros 2026 » : V4 ≠ V5, différent", () => {
    const v4 = racket("Wilson", "Wilson Ultra 100L V4.0");
    const v5 = racket("Wilson", "Wilson Ultra 100L V5 Roland Garros 2026");
    expect(value(v4, "generation")).toBe("V4");
    expect(value(v5, "generation")).toBe("V5");
    expect(value(v5, "annee")).toBe(2026);
    expect(niveau(v4, v5)).toBe("different");
  });

  it("une année face à un libellé sans année reste indéterminée (« Ultra V5 » / « Ultra 2026 »)", () => {
    expect(niveau(racket("Wilson", "Wilson Ultra 100L V5"), racket("Wilson", "Wilson Ultra 100L 2026"))).toBe("indetermine");
  });

  it("même libellé des deux côtés, l'année en plus d'un seul : identique", () => {
    expect(niveau(racket("Wilson", "Wilson Ultra 100L V5"), racket("Wilson", "Wilson Ultra 100L V5 Roland Garros 2026"))).toBe("identique");
  });

  it("Head Sprint « 3.5 » lue comme génération, comme « 4.0 »", () => {
    const evo35 = shoe("Head", "Head Sprint Evo 3.5 Chaussures de tennis Homme");
    const evo40 = shoe("Head", "Head Sprint Evo 4.0 Chaussures de tennis Homme");
    const junior = shoe("Head", "HEAD SPRINT 3.5 JUNIOR");
    expect(value(evo35, "generation")).toBe("3.5");
    expect(value(junior, "generation")).toBe("3.5");
    expect(niveau(evo35, evo40)).toBe("different");
  });

  it("« Carpet » et « tapis » : même surface", () => {
    const carpet = shoe("Head", "HEAD Sprint 4.0 Carpet Chaussures de tennis enfant");
    const tapis = shoe("Head", "HEAD Sprint Pro 3.5 tapis Men");
    expect(value(carpet, "surface")).toBe("gazon_synthetique");
    expect(value(tapis, "surface")).toBe("gazon_synthetique");
  });

  it("« Sprint 4.0 Carpet » / « Sprint 4.0 terre battue » : jamais réunis (surface différente)", () => {
    const carpet = shoe("Head", "Head Sprint Pro 4.0 Carpet Chaussures de tennis Homme");
    const clay = shoe("Head", "Head Sprint Pro 4.0 terre battue Chaussures de tennis Homme");
    expect(niveau(carpet, clay)).toBe("proche");
  });

  it("« Strap » lu comme version : « Sprint Strap 4.0 » ≠ « Sprint 4.0 »", () => {
    const strap = shoe("Head", "HEAD Sprint Strap 4.0 Chaussures de tennis enfant");
    const plain = shoe("Head", "HEAD Sprint 4.0 Chaussures de tennis enfant");
    expect(value(strap, "version")).toBe("Strap");
    expect(niveau(strap, plain)).toBe("proche");
    expect(niveau(strap, shoe("Head", "HEAD Sprint Pro 4.0 Chaussures de tennis enfant"))).toBe("different");
  });
});

describe("§8.3 : URL du site Head (chaussures)", () => {
  const headUrl = "https://www.head.com/fr_FR/product/sprint-pro-4-0-sf-clay-men-bkte-273116";

  it("« Head Sprint Pro 4.0 SF Caly » (URL `sf-clay-men`) / « Sprint Pro 4.0 Clay Homme » : identique", () => {
    const head = shoe("Head", "HEAD Sprint Pro 4.0 SF Caly Chaussures de tennis hommes Homme", "Head", { affiliate_url: headUrl });
    const other = shoe("Head", "Head Sprint Pro 4.0 Clay Homme");
    expect(head.attributes.surface).toEqual({ value: "terre_battue", source: "url" });
    expect(niveau(head, other)).toBe("identique");
  });

  it("surface et genre lus dans l'URL quand le titre est muet, mot par mot (`women` ≠ `men`)", () => {
    const women = shoe("Head", "HEAD Sprint Team 4.0 Chaussures de tennis", "Head", {
      affiliate_url: "https://www.head.com/fr_FR/product/sprint-team-4-0-clay-women-cwlg-274456",
    });
    expect(women.attributes.genre).toEqual({ value: "femme", source: "url" });
    expect(women.attributes.surface).toEqual({ value: "terre_battue", source: "url" });
    const men = shoe("Head", "HEAD Sprint Team 4.0 Chaussures de tennis", "Head", {
      affiliate_url: "https://www.head.com/fr_FR/product/sprint-team-4-0-carpet-men-nvcg-273426",
    });
    expect(men.attributes.genre).toEqual({ value: "homme", source: "url" });
    expect(men.attributes.surface).toEqual({ value: "gazon_synthetique", source: "url" });
  });

  it("le titre l'emporte sur l'URL", () => {
    const head = shoe("Head", "HEAD Sprint Pro 4.0 Chaussures de tennis femmes Femme", "Head", { affiliate_url: headUrl });
    expect(head.attributes.genre).toEqual({ value: "femme", source: "titre_description" });
  });

  it("l'URL d'un autre marchand n'est pas lue", () => {
    const other = shoe("Head", "HEAD Sprint Pro 4.0 Chaussures de tennis", "Tennispro.fr", { affiliate_url: headUrl });
    expect(other.attributes.surface).toBeUndefined();
    expect(other.attributes.genre).toBeUndefined();
  });
});

describe("§8.4 : cordages, conditionnement lu sur le prix d'origine", () => {
  it("cordage Head 15 € sans conditionnement / même cordage « 12 m » : pas d'indéterminé sur le conditionnement", () => {
    const bare = string("Head", "Head Hawk 1.25mm cordage de tennis", "Test", { original_price: 15 });
    const set = string("Head", "Head Hawk 1.25mm 12 m", "Test");
    expect(bare.attributes.conditionnement).toEqual({ value: "garniture", source: "prix" });
    // Reste la longueur (12 m écrite d'un seul côté), hors de cette règle : elle n'est pas déduite du prix.
    expect(compare(bare, set).differences.map((d) => d.attribut)).toEqual(["longueur"]);
    expect(niveau(bare, string("Head", "Head Hawk 1.25mm cordage de tennis", "Test", { original_price: 17 }))).toBe("identique");
  });

  it("bobine à partir de 90 €", () => {
    const reel = string("Head", "Head Hawk 1.25mm cordage de tennis", "Test", { original_price: 120 });
    expect(reel.attributes.conditionnement).toEqual({ value: "bobine", source: "prix" });
  });

  it("cordage à 60 € sans conditionnement : conditionnement inconnu, alerte, indéterminé", () => {
    const grey = string("Head", "Head Hawk 1.25mm cordage de tennis", "Test", { original_price: 60 });
    expect(grey.attributes.conditionnement).toBeUndefined();
    expect(grey.alertes).toContain("conditionnement_prix_incertain");
    expect(compare(grey, string("Head", "Head Hawk 1.25mm 12 m")).differences.map((d) => d.attribut)).toContain("conditionnement");
    expect(niveau(grey, string("Head", "Head Hawk 1.25mm 12 m"))).toBe("indetermine");
  });

  it("sans prix : conditionnement inconnu, alerte", () => {
    const none = string("Head", "Head Hawk 1.25mm cordage de tennis");
    expect(none.attributes.conditionnement).toBeUndefined();
    expect(none.alertes).toContain("conditionnement_prix_incertain");
  });

  it("le titre l'emporte sur le prix", () => {
    const set = string("Head", "Head Hawk 1.25mm 12 m", "Test", { original_price: 120 });
    expect(set.attributes.conditionnement).toEqual({ value: "garniture", source: "titre_description" });
  });
});

describe("§8.5 : jauge des cordages Tennispro.fr et site Head", () => {
  it("« Cordage Head Hawk (12 Metres) » Tennispro.fr / « Head Hawk 1.25mm 12 m » : identique", () => {
    const tennispro = string("Head", "Cordage Head Hawk (12 Metres)", "Tennispro.fr");
    const other = string("Head", "Head Hawk 1.25mm 12 m", "SportSystem");
    expect(tennispro.alertes).toContain("jauge_variante_fiche");
    expect(niveau(tennispro, other)).toBe("identique");
  });

  it("le site Head suit la même règle", () => {
    const head = string("Head", "HEAD Hawk cordage de tennis 12 m", "Head");
    expect(niveau(head, string("Head", "Head Hawk 1.30mm 12 m", "SportSystem"))).toBe("identique");
  });

  it("jauge écrite dans le titre Tennispro.fr : règle actuelle (1,30 ≠ 1,25, proche)", () => {
    const tennispro = string("Head", "Cordage Head Hawk 1.30mm (12 Metres)", "Tennispro.fr");
    expect(tennispro.alertes).not.toContain("jauge_variante_fiche");
    expect(niveau(tennispro, string("Head", "Head Hawk 1.25mm 12 m", "SportSystem"))).toBe("proche");
  });

  it("un autre marchand sans jauge reste indéterminé", () => {
    const amazon = string("Head", "Head Hawk cordage (12 Metres)", "Amazon");
    expect(amazon.alertes).not.toContain("jauge_variante_fiche");
    expect(niveau(amazon, string("Head", "Head Hawk 1.25mm 12 m", "SportSystem"))).toBe("indetermine");
  });

  it("deux offres Tennispro.fr sans jauge : même signature, pas d'indéterminé", () => {
    const a = string("Head", "Cordage Head Hawk (12 Metres) Noir", "Tennispro.fr");
    const b = string("Head", "Cordage Head Hawk (12 Metres) Rouge", "Tennispro.fr");
    expect(niveau(a, b)).toBe("identique");
    expect(signature(a, "1")).toBe(signature(b, "2"));
  });

  describe("regroupement (étape 2 quater)", () => {
    const engine = (rows: [string, string, string][]): EngineOffer[] =>
      rows.map(([dealId, marchand, titre]) => ({ dealId, marchand, statut: "active", titre, extracted: string("Head", titre, marchand) }));
    const modelOf = (result: ReturnType<typeof buildModels>, id: string) => result.links.get(id)?.modelIndex;

    it("une seule jauge écrite chez l'autre marchand : réunies", () => {
      const result = buildModels(engine([
        ["1", "Tennispro.fr", "Cordage Head Hawk (12 Metres)"],
        ["2", "SportSystem", "Head Hawk 1.25mm 12 m"],
      ]));
      expect(modelOf(result, "1")).toBe(modelOf(result, "2"));
    });

    it("deux jauges écrites chez l'autre marchand : la jauge ne fait pas de pont", () => {
      const result = buildModels(engine([
        ["1", "Tennispro.fr", "Cordage Head Hawk (12 Metres)"],
        ["2", "SportSystem", "Head Hawk 1.25mm 12 m"],
        ["3", "SportSystem", "Head Hawk 1.30mm 12 m"],
      ]));
      expect(modelOf(result, "2")).not.toBe(modelOf(result, "3"));
      expect(modelOf(result, "1")).not.toBe(modelOf(result, "2"));
      expect(modelOf(result, "1")).not.toBe(modelOf(result, "3"));
      expect(result.incoherent).toEqual([]);
    });
  });
});

describe("§8.7 : versions écrites par le site Head, relevées à la relecture des fusions", () => {
  const head = (titre: string) => string("Head", titre, "Head");

  it.each([
    ["Lynx", "HEAD Lynx Power 200m bobine de cordage de tennis", "HEAD Lynx 200m bobine de cordage de tennis"],
    ["Velocity MLT", "HEAD Velocity Power 200m bobine de cordage de tennis", "HEAD Velocity MLT 200m bobine de cordage de tennis"],
    ["Sonic Pro", "HEAD Sonic Pro™ Tour rPET 200m bobine de cordage de tennis", "HEAD Sonic Pro™ 200m bobine de cordage de tennis"],
    ["Hawk", "HEAD Hawk Touch Rough 200m bobine de cordage de tennis", "HEAD Hawk Touch 200m bobine de cordage de tennis"],
  ])("%s : la version n'est pas réunie à la version de base", (_famille, avecVersion, base) => {
    expect(niveau(head(avecVersion), head(base))).not.toBe("identique");
  });

  it("« Tour rEPT » (faute du site Head) = « Tour rPET »", () => {
    expect(niveau(head("HEAD Sonic Pro™ Tour rEPT 200m bobine de cordage de tennis"), head("HEAD Sonic Pro™ Tour rPET 200m bobine de cordage de tennis"))).toBe("identique");
  });

  it("Courtflash Kid Velcro ≠ Courtflash K (lacets)", () => {
    expect(niveau(shoe("adidas", "Chaussures adidas Courtflash Kid Velcro Enfant"), shoe("adidas", "Chaussures adidas Courtflash K Enfant"))).not.toBe("identique");
  });
});

describe("R4.5-c : familles à génération unique", () => {
  it("« SFX Evo 2025 » / « SFX Evo » : identique, même signature (Q5)", () => {
    const withYear = shoe("Babolat", "Babolat SFX Evo 2025 Chaussures de tennis terre battue Homme");
    const bare = shoe("Babolat", "Babolat SFX Evo Chaussures de tennis terre battue Homme");
    expect(value(withYear, "annee")).toBe(2025);
    expect(niveau(withYear, bare)).toBe("identique");
    expect(signature(withYear, "1")).toBe(signature(bare, "2"));
  });

  it("Courtflash (coloris de saison) : identique sans génération, même avec une année d'un côté", () => {
    const a = shoe("adidas", "Chaussures adidas Courtflash K Enfant");
    const b = shoe("adidas", "Chaussures adidas Courtflash K Enfant SS25");
    expect(niveau(a, b)).toBe("identique");
    expect(niveau(shoe("adidas", "Chaussures adidas Courtflash K 2025 Enfant"), a)).toBe("identique");
  });

  it.each([
    ["Head", "Head Endure Pro Chaussures de tennis Homme", "Head Endure Pro 2025 Chaussures de tennis Homme"],
    ["adidas", "adidas Avaluxe Chaussures de tennis Femme", "adidas Avaluxe 2024 Chaussures de tennis Femme"],
    ["Asics", "Asics Game FF Chaussures de tennis Homme", "Asics Game FF 2023 Chaussures de tennis Homme"],
    ["Wilson", "Wilson Intrigue Chaussures de tennis Femme", "Wilson Intrigue 2025 Chaussures de tennis Femme"],
    ["Babolat", "Babolat Pulsion All Court Kid", "Babolat Pulsion 2019 All Court Kid"],
  ])("%s : génération non comparée (%s)", (marque, titreA, titreB) => {
    expect(niveau(shoe(marque, titreA), shoe(marque, titreB))).toBe("identique");
  });

  it("Lacoste AG-LT : « Ultra » est la génération 23, plus une version", () => {
    const ultra = shoe("Lacoste", "Lacoste AG-LT23 Ultra Chaussures de tennis Homme");
    expect(value(ultra, "generation")).toBe("23");
    expect(value(ultra, "version")).toBeUndefined();
    const bare = shoe("Lacoste", "Lacoste AG-LT Ultra Chaussures de tennis Homme");
    expect(niveau(ultra, bare)).toBe("identique");
    expect(niveau(ultra, shoe("Lacoste", "Lacoste AG-LT23 Pro Chaussures de tennis Homme"))).not.toBe("identique");
  });

  it("une famille non marquée garde la règle (Barricade 13 / Barricade 14 : différent)", () => {
    expect(niveau(shoe("adidas", "adidas Barricade 13 Homme"), shoe("adidas", "adidas Barricade 14 Homme"))).toBe("different");
  });
});
