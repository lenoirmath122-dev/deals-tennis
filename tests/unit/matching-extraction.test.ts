import { describe, expect, it } from "vitest";
import fixture from "../fixtures/r1-jeu-fige.json";
import { extractOfferAttributes, type OfferInput } from "@/lib/matching";

type FixtureOffer = OfferInput & { id: string };
const offers = new Map((fixture.offers as unknown as FixtureOffer[]).map((offer) => [offer.id, offer]));

function pair(id: number) {
  const p = fixture.pairs.find((x) => x.id === id)!;
  return [extractOfferAttributes(offers.get(p.offre_a)!), extractOfferAttributes(offers.get(p.offre_b)!)] as const;
}

const value = (r: ReturnType<typeof extractOfferAttributes>, name: string) => r.attributes[name]?.value;

function racquet(titre: string, extra: Partial<OfferInput> = {}) {
  const brand = titre.match(/(Babolat|Head|Wilson|Dunlop|Tecnifibre)/i)?.[1] ?? null;
  return extractOfferAttributes({ marchand: "Test", titre, marque: brand, categorie: "raquettes", ...extra });
}

describe("extraction raquettes : titres réels", () => {
  it("lit poids, version, tamis et famille dans un titre Tennispro.fr", () => {
    const r = racquet("Raquette de tennis Babolat Pure Drive 98 (305 Gr)");
    expect(r.famille).toBe("Pure Drive");
    expect(r.marque).toBe("Babolat");
    expect(value(r, "poids")).toBe(305);
    expect(value(r, "version")).toBe("98");
    expect(value(r, "tamis")).toBe(98);
    expect(value(r, "age_group")).toBe("adulte");
  });

  it("lit le plan de cordage sans le prendre pour une taille junior (16/19)", () => {
    const r = racquet("Raquette de tennis Babolat Pure Strike 98 16/19 (305 Gr)");
    expect(value(r, "plan_cordage")).toBe("16x19");
    expect(value(r, "age_group")).toBe("adulte");
    expect(value(r, "poids")).toBe(305);
  });

  it("lit la génération écrite (Gen 11, V14, année) et son année", () => {
    const gen = racquet("Raquette de tennis Babolat Pure Drive Lite Gen11 cordée");
    expect(value(gen, "generation")).toBe("Gen 11");
    expect(value(gen, "annee")).toBe(2025);
    expect(value(gen, "cordee")).toBe(true);
    expect(value(racquet("Raquette de tennis Wilson Pro Staff 97L V14"), "generation")).toBe("V14");
    expect(value(racquet("Raquette de tennis HEAD Extreme MP 2024"), "generation")).toBe("2024");
  });

  it("ne déduit aucune génération quand elle n'est pas écrite", () => {
    const r = racquet("Raquette de tennis Dunlop FX 500 Lite");
    expect(r.attributes.generation).toBeUndefined();
  });

  it("lit un poids écrit dans le nom du modèle (Q1) et un « + » de longueur (Q2)", () => {
    const tf = racquet("Raquette de tennis Tecnifibre Tf-x1 V2 270");
    expect(value(tf, "poids")).toBe(270);
    expect(value(tf, "generation")).toBe("V2");
    expect(value(racquet("Raquette de tennis Babolat Pure Aero + (300 Gr)"), "longueur")).toBe(27.5);
  });

  it("ne lit pas « 360+ » comme une longueur", () => {
    const r = racquet("Raquette de tennis HEAD Graphene 360+ Radical Pro (2021) Raquette de compétition non cordée");
    expect(r.famille).toBe("Radical");
    expect(r.attributes.longueur).toBeUndefined();
    expect(value(r, "cordee")).toBe(false);
  });

  it("reconnaît une raquette junior par sa taille de manche ou sa famille", () => {
    expect(value(racquet("Raquette de tennis Head Junior Novak 25"), "age_group")).toBe("enfant");
    expect(value(racquet("Head Novak 23 Raquette de Tennis"), "age_group")).toBe("enfant");
  });

  it("lit un pack sans quantité comme un lot supposé", () => {
    const r = racquet("Pack de raquettes de tennis Babolat Pure Strike 97 (310 Gr)");
    expect(value(r, "lot")).toBe(2);
    expect(r.alertes).toContain("lot_quantite_supposee");
  });

  it("lit un cadeau offert (Q12)", () => {
    const r = racquet("Raquette de tennis Babolat Pure Drive 98 (305 Gr) + sac offert");
    expect(String(value(r, "cadeau"))).toContain("offert");
    expect(value(r, "poids")).toBe(305);
  });

  it("préfère la fiche technique SportSystem au titre", () => {
    const r = racquet("Raquette de tennis Dunlop Dunlop FX 500 Lite 2026", {
      raw_attributes: {
        features: [
          { name: "Tamis", value: "645 cm² / 100 sq. in." },
          { name: "Poids (gr.)", value: "270" },
          { name: "Longueur", value: "27 in. / 68.5 cm." },
          { name: "Plan de cordage", value: "16x18" },
        ],
      },
    });
    expect(r.attributes.tamis).toEqual({ value: 100, source: "fiche_marchand" });
    expect(r.attributes.poids).toEqual({ value: 270, source: "fiche_marchand" });
    expect(r.attributes.plan_cordage).toEqual({ value: "16x18", source: "fiche_marchand" });
    expect(value(r, "longueur")).toBe(27);
    expect(value(r, "generation")).toBe("2026");
  });

  it("n'utilise jamais le poids d'expédition des variantes Tennis Point FR", () => {
    const r = racquet("Raquette de tennis HEAD Radical Team", {
      raw_attributes: { variants: [{ sku: "1", grams: 356, title: "non cordée / 1" }] },
    });
    expect(r.attributes.poids).toBeUndefined();
    expect(value(r, "cordee")).toBe(false);
  });
});

describe("extraction cordages : titres réels", () => {
  function string(titre: string, marque: string, extra: Partial<OfferInput> = {}) {
    return extractOfferAttributes({ marchand: "Test", titre, marque, categorie: "cordages", ...extra });
  }

  it("lit jauge, longueur, conditionnement et version", () => {
    const r = string("Bobine de cordage de tennis Luxilon Big Banger Alu Power Rough 1.25mm (220 Metres)", "Luxilon");
    expect(r.famille).toBe("Alu Power");
    expect(value(r, "version")).toBe("Rough");
    expect(value(r, "jauge")).toBe(1.25);
    expect(value(r, "longueur")).toBe(220);
    expect(value(r, "conditionnement")).toBe("bobine");
  });

  it("lit une garniture de 12 mètres", () => {
    const r = string("Cordage de tennis Luxilon Big Banger Alu Power (12 Metres)", "Luxilon");
    expect(value(r, "conditionnement")).toBe("garniture");
  });

  it("rattache une marque Wilson au cordage Luxilon et lit la jauge en centièmes", () => {
    const r = string("Wilson Cordages pour Raquette Luxilon, Alu Power 125, Rouleau de 12,2 mètres, Bleu, 1,25 mm", "Wilson");
    expect(r.marque).toBe("Luxilon");
    expect(r.famille).toBe("Alu Power");
    expect(value(r, "jauge")).toBe(1.25);
    expect(value(r, "longueur")).toBe(12.2);
  });

  it("signale une longueur incohérente au lieu de la garder (R1 paire 67)", () => {
    const r = string("WILSON Cordages pour Raquette Luxilon, 4G, Rouleau de 2 mètres, Couleur Or, 1,25 mm", "Luxilon");
    expect(r.famille).toBe("4G");
    expect(r.attributes.longueur).toBeUndefined();
    expect(r.alertes).toContain("longueur_douteuse");
  });

  it("laisse la longueur inconnue quand le titre n'en donne pas", () => {
    const r = string("Head RIP Control", "Head");
    expect(r.famille).toBe("Rip Control");
    expect(r.attributes.longueur).toBeUndefined();
    expect(r.attributes.conditionnement).toBeUndefined();
  });
});

describe("identifiants", () => {
  it("garde un GTIN valide et écarte un code de 11 chiffres", () => {
    expect(racquet("Raquette de tennis Head Extreme MP", { gtin: "724794624258" }).gtin).toBe("724794624258");
    expect(racquet("Raquette de tennis Head Extreme MP", { gtin: "12345678901" }).gtin).toBeNull();
  });

  it("écarte un mpn recopié de la référence marchand", () => {
    const r = racquet("Raquette de tennis Dunlop FX 500 Lite", { mpn: "10335789", merchant_sku: "10335789" });
    expect(r.referenceFabricant).toBeNull();
    expect(racquet("Raquette de tennis Dunlop FX 500 Lite", { mpn: "10369906", merchant_sku: "846865" }).referenceFabricant).toBe("10369906");
  });
});

describe("non-reconnus", () => {
  it("liste les termes d'une famille absente du référentiel", () => {
    const r = racquet("Raquette de tennis Head Zorglub Sinner 2026");
    expect(r.familyKey).toBeNull();
    expect(r.nonReconnu?.reason).toBe("famille_inconnue");
    expect(r.nonReconnu?.termes).toContain("sinner");
  });

  it("refuse les catégories non prises en charge", () => {
    expect(() =>
      extractOfferAttributes({ marchand: "Test", titre: "Chaussures", marque: "Asics", categorie: "chaussures" }),
    ).toThrow();
  });
});

describe("jeu R1 figé : toutes les raquettes et cordages sont reconnus", () => {
  const supported = [...offers.values()].filter((o) => o.categorie === "raquettes" || o.categorie === "cordages");

  it("reconnaît la famille de chacune des offres", () => {
    expect(supported.length).toBe(63);
    const unknown = supported.filter((o) => !extractOfferAttributes(o).familyKey).map((o) => o.titre);
    expect(unknown).toEqual([]);
  });

  it("donne la même famille aux deux offres des paires « identique »", () => {
    const identical = fixture.pairs.filter((p) => p.attendu === "identique" && ["raquettes", "cordages"].includes(offers.get(p.offre_a)!.categorie));
    expect(identical.length).toBeGreaterThan(10);
    for (const p of identical) {
      const a = extractOfferAttributes(offers.get(p.offre_a)!);
      const b = extractOfferAttributes(offers.get(p.offre_b)!);
      expect({ paire: p.id, famille: a.familyKey }).toEqual({ paire: p.id, famille: b.familyKey });
    }
  });

  it("sépare les pièges de la paire par l'attribut attendu", () => {
    const [a3, b3] = pair(3);
    expect([value(a3, "generation"), value(b3, "generation")]).toEqual(["V2", "V3"]);
    const [a4, b4] = pair(4);
    expect([value(a4, "tamis"), value(b4, "tamis")]).toEqual([98, 97]);
    const [a7, b7] = pair(7);
    expect([a7.attributes.generation, value(b7, "generation")]).toEqual([undefined, "2026"]);
    const [a11, b11] = pair(11);
    expect([value(a11, "version"), value(b11, "version")]).toEqual(["19", "25"]);
    const [a45, b45] = pair(45);
    expect([a45.attributes.plan_cordage, value(b45, "plan_cordage")]).toEqual([undefined, "18x20"]);
    const [a64, b64] = pair(64);
    expect([value(a64, "longueur"), value(b64, "longueur")]).toEqual([220, 200]);
    const [a38, b38] = pair(38);
    expect([value(a38, "conditionnement"), b38.attributes.conditionnement]).toEqual(["bobine", undefined]);
  });

  it("retrouve les paires identiques dont les attributs concordent (paires 5, 12, 39, 40, 41, 65, 66)", () => {
    for (const id of [5, 12, 39, 40, 41, 65, 66]) {
      const [a, b] = pair(id);
      for (const name of ["version", "tamis", "poids", "plan_cordage", "jauge", "edition", "generation"]) {
        const av = value(a, name);
        const bv = value(b, name);
        if (av !== undefined && bv !== undefined) expect({ id, name, av }).toEqual({ id, name, av: bv });
      }
    }
  });
});
