import { describe, expect, it } from "vitest";
import fixture from "../fixtures/r1-jeu-fige.json";
import { extractOfferAttributes, type OfferInput } from "@/lib/matching";

type FixtureOffer = OfferInput & { id: string };
const offers = new Map((fixture.offers as unknown as FixtureOffer[]).map((o) => [o.id, o]));
const pair = (id: number) => {
  const p = fixture.pairs.find((x) => x.id === id)!;
  return [extractOfferAttributes(offers.get(p.offre_a)!), extractOfferAttributes(offers.get(p.offre_b)!)] as const;
};
const value = (r: ReturnType<typeof extractOfferAttributes>, name: string) => r.attributes[name]?.value;

function shoe(titre: string, marque: string, extra: Partial<OfferInput> = {}) {
  return extractOfferAttributes({ marchand: "Test", titre, marque, categorie: "chaussures", ...extra });
}
function accessory(titre: string, marque: string) {
  return extractOfferAttributes({ marchand: "Test", titre, marque, categorie: "accessoires" });
}

describe("extraction chaussures", () => {
  it("sépare le genre (paires R1 16 et 24) et laisse le genre absent quand il n'est pas écrit (49)", () => {
    for (const id of [16, 24]) {
      const [a, b] = pair(id);
      expect([value(a, "genre"), value(b, "genre")].sort()).toEqual(["femme", "homme"]);
      expect(a.famille).toBe(b.famille);
    }
    const [a, b] = pair(49);
    expect(value(a, "genre") === undefined || value(b, "genre") === undefined).toBe(true);
  });

  it("lit la surface (paires 51 et 53) et « CL » comme terre battue", () => {
    for (const id of [51, 53]) {
      const [a, b] = pair(id);
      expect(value(a, "surface")).not.toBe(value(b, "surface"));
    }
    expect(value(shoe("Chaussures de tennis ADIDAS Homme Barricade 13 M CL Homme", "ADIDAS"), "surface")).toBe("terre_battue");
  });

  it("lit le numéro après le nom comme génération (Q14), pas comme version (paire 33)", () => {
    const [a, b] = pair(33);
    expect(value(a, "generation")).toBeDefined();
    expect(value(b, "generation")).toBeUndefined();
    expect(value(shoe("Chaussures de tennis adidas Barricade 14 Terre Battue", "adidas"), "generation")).toBe("14");
  });

  it("reconnaît une chaussure junior (paire 20), y compris « K » collé au nom", () => {
    const [a, b] = pair(20);
    expect(value(a, "age_group")).toBe("enfant");
    expect(value(b, "age_group")).toBe("enfant");
    expect(value(shoe("Chaussures de tennis adidas Courtflash K", "adidas"), "age_group")).toBe("enfant");
  });

  it("préfère le genre de la fiche Sport 2000 et signale un titre contradictoire", () => {
    const r = shoe("Chaussures de tennis ASICS Femme Gel-Resolution X", "ASICS", { raw_attributes: { gender: "HOMME" } });
    expect(r.attributes.genre).toEqual({ value: "homme", source: "donnees_structurees" });
    expect(r.alertes).toContain("genre_titre_different_de_la_fiche");
  });

  it("lit la largeur et ne lit pas « m » ou « w » comme un genre", () => {
    const r = shoe("Chaussures de tennis adidas Barricade 13 M Wide", "adidas");
    expect(value(r, "largeur")).toBe("large");
    expect(value(r, "genre")).toBeUndefined();
  });
});

describe("extraction accessoires", () => {
  it("balles : le conditionnement sépare tube et carton (paire 37), en nombre de balles", () => {
    const [tube, carton] = pair(37);
    expect(value(tube, "lot")).toBe(3);
    expect(value(carton, "lot")).toBe(72);
    expect(value(carton, "conditionnement")).toBe("carton_24_tubes_de_3");
    expect(tube.famille).toBe(carton.famille);
  });

  it("balles : niveau, pression, « 4er »", () => {
    const stage = accessory("Balles de tennis Dunlop Stage 2 Orange Tube de 3", "Dunlop");
    expect(value(stage, "niveau")).toBe("stage_2");
    expect(value(accessory("Balles de tennis Wilson Triniti 4er sans pression", "Wilson"), "pression")).toBe("sans_pression");
    expect(value(accessory("Balles de tennis Wilson Triniti 4er", "Wilson"), "lot")).toBe(4);
  });

  it("grips : même grip chez deux marchands (paire 26), type et nombre de pièces", () => {
    const [a, b] = pair(26);
    expect(a.famille).toBe("Syntec");
    expect(value(a, "version")).toBe(value(b, "version"));
    expect(value(a, "typeGrip")).toBe("grip");
    const sur = accessory("Surgrip de tennis Tennispro Tacky Pro 2.0 X30", "Tennispro");
    expect(value(sur, "typeGrip")).toBe("surgrip");
    expect(value(sur, "lot")).toBe(30);
    expect(value(sur, "generation")).toBe("2.0");
  });

  it("antivibrateurs : Tecnifibre Logo Damp reconnu chez deux marchands (paire 14)", () => {
    const [a, b] = pair(14);
    expect(a.famille).toBe("Logo Damp");
    expect(b.famille).toBe("Logo Damp");
    expect(value(a, "edition")).toBe("Tricolore");
  });

  it("sacs : format et contenance, génération V3 écrite (paire 61)", () => {
    const [a, b] = pair(61);
    expect(value(a, "type_sac")).toBe("sac_a_dos");
    expect(value(b, "type_sac")).toBe("sac_a_dos");
    expect(value(a, "generation")).toBe("V3");
    expect(value(b, "generation")).toBe("V3");
    const bag = accessory("Sac de tennis Babolat Pure Drive Thermobag 12 raquettes", "Babolat");
    expect(value(bag, "type_sac")).toBe("thermobag");
    expect(value(bag, "contenance")).toBe("12 raquettes");
  });

  it("sacs : la génération non écrite n'est pas déduite (paires 22 et 23)", () => {
    for (const id of [22, 23]) {
      const [a, b] = pair(id);
      expect(a.famille).toBe("Tour Endurance");
      expect(value(a, "generation")).toBeUndefined();
      expect(value(b, "generation")).toBeUndefined();
    }
  });

  it("un alias court d'une autre sous-catégorie n'est pas retenu (grip « Team » ≠ sac Wilson Team)", () => {
    const r = accessory("Grip de tennis Wilson Team", "Wilson");
    expect(r.famille).not.toBe("Team (sacs)");
  });

  it("sous-catégorie sans famille prévue : non reconnu normal, type seulement", () => {
    const r = accessory("Genouillère de tennis Bauerfeind Sports Knee Support", "Bauerfeind");
    expect(r.subcategory).toBe("protection_soins");
    expect(r.nonReconnu?.reason).toBe("sans_famille_prevue");
    expect(value(r, "type")).toBe("protection_soins");
  });
});

describe("jeu R1 chaussures + accessoires", () => {
  it("toutes les offres chaussures et sacs / grips / balles / antivibrateurs du jeu ont une famille", () => {
    for (const o of fixture.offers as unknown as FixtureOffer[]) {
      if (o.categorie !== "chaussures" && o.categorie !== "accessoires") continue;
      const r = extractOfferAttributes(o);
      if (r.subcategory === "protection_soins" || (o.categorie === "accessoires" && r.nonReconnu?.reason === "sans_famille_prevue")) continue;
      expect(r.famille, o.titre).not.toBeNull();
    }
  });
});
