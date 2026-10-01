import { describe, expect, it } from "vitest";
import { buildModels, type EngineOffer } from "@/lib/matching/cluster";
import { compare } from "@/lib/matching/compare";
import { extractOfferAttributes } from "@/lib/matching";
import { REVIEW_MIN_SCORE, buildTextileReview, textileReviewScore } from "@/lib/matching/textile-review";

// Textile, étape 3 (R4.5-b) : file de revue sans fusion (T-Q4 de D-2026-09-29-04). Titres réels (prod, 2026-09-30).

type Row = [dealId: string, marchand: string, marque: string, titre: string, prix?: number];

function review(rows: Row[]) {
  const offers: EngineOffer[] = rows.map(([dealId, marchand, marque, titre, prix]) => ({
    dealId,
    marchand,
    statut: "active",
    titre,
    prixOrigine: prix ?? null,
    extracted: extractOfferAttributes({ marchand, titre, marque, categorie: "textile" }),
  }));
  const result = buildModels(offers);
  return { offers, result, rows: buildTextileReview(offers, result) };
}

describe("score de l'étape 3", () => {
  it("mêmes mots : haut ; un mot en plus : plus bas ; aucun mot commun : nul", () => {
    const base = { genreInconnuUnCote: false, ecartPrix: 0 };
    expect(textileReviewScore({ ...base, motsA: ["club"], motsB: ["club"] })).toBe(0.9);
    expect(textileReviewScore({ ...base, motsA: ["club"], motsB: ["club", "pleat"] })).toBe(0.5);
    expect(textileReviewScore({ ...base, motsA: ["club"], motsB: ["pro"] })).toBe(0);
  });

  it("le prix d'origine est un indice, pas une barrière (T-Q5)", () => {
    const base = { motsA: ["club"], motsB: ["club"], genreInconnuUnCote: false };
    expect(textileReviewScore({ ...base, ecartPrix: 0.2 })).toBe(0.8);
    expect(textileReviewScore({ ...base, ecartPrix: 0.5 })).toBe(0.7);
    expect(textileReviewScore({ ...base, ecartPrix: 0.5 })).toBeGreaterThan(REVIEW_MIN_SCORE);
  });
});

describe("file de revue textile", () => {
  const { result, rows } = review([
    ["1", "Tennis Point FR", "adidas", "Vêtement de tennis adidas Club Jupe Femmes - blanc", 40],
    ["2", "Tennispro.fr", "Adidas", "Jupe de tennis Adidas Femme Club Pleat", 50],
    ["3", "Tennis Point FR", "adidas", "Vêtement de tennis adidas Pro Jupe Femmes-noir", 65],
    ["4", "Tennispro.fr", "Adidas", "Jupe de tennis Adidas Femme Pro Londres", 65],
    ["5", "Tennis Point FR", "adidas", "Vêtement de tennis adidas Club Jupe Hommes - blanc", 40],
    ["6", "Tennis Point FR", "adidas", "Vêtement de tennis adidas Club Jupe Femmes - noir", 40],
    ["7", "Tennis Point FR", "Head", "Vêtement de tennis HEAD Tie-Break T-shirt Femmes - bleu clair, blanc", 60],
    ["8", "Tennis Point FR", "Head", "Vêtement de tennis HEAD Tie-Break II T-shirt Femmes - abricot, blanc", 60],
  ]);
  const pairOf = (a: string, b: string) => rows.find((r) => r.titreA.includes(a) && r.titreB.includes(b));

  it("classe la paire à un mot en plus (Club / Club Pleat) sans rien fusionner", () => {
    const pair = rows.find((r) => r.motsEnPlusA.includes("pleat") || r.motsEnPlusB.includes("pleat"));
    expect(pair).toBeDefined();
    // 0,5 pour le mot en plus, moins 0,1 pour 20 % d'écart de prix d'origine (40 € / 50 €).
    expect(pair!.score).toBe(0.4);
    // Aucune fusion : Club et Club Pleat restent deux modèles.
    expect(result.links.get("1")!.modelIndex).not.toBe(result.links.get("2")!.modelIndex);
  });

  it("propose l'édition écrite d'un seul côté (Pro / Pro Londres), au score le plus haut", () => {
    const pair = pairOf("Pro Jupe", "Pro Londres");
    expect(pair).toBeDefined();
    expect(pair!.score).toBe(0.9);
    expect(pair!.raison).toContain("edition");
  });

  it("ne propose jamais deux marchands identiques, ni des genres différents", () => {
    for (const r of rows) expect(r.marchandA).not.toBe(r.marchandB);
    expect(rows.some((r) => r.titreA.includes("Hommes") || r.titreB.includes("Hommes"))).toBe(false);
  });

  it("Tie Break II (D-2026-09-29-05) : autre génération, refusée avant la file, titre ordonné ou non", () => {
    for (const headTitle of ["TIE-BREAK II- T-shirt de tennis femme", "BREAK II TIE- T-shirt de tennis femme"]) {
      const { rows: gen } = review([
        ["a", "Tennis Point FR", "Head", "Vêtement de tennis HEAD Tie-Break T-shirt Femmes - violet", 60],
        ["b", "Head", "Head", headTitle, 60],
      ]);
      expect(gen).toEqual([]);
    }
  });

  it("classe par score décroissant", () => {
    const scores = rows.map((r) => r.score);
    expect(scores).toEqual([...scores].sort((a, b) => b - a));
  });
});

describe("Bermuda n'est pas un short (relecture R4.5-b)", () => {
  const bermuda = extractOfferAttributes({ marchand: "Head", titre: "CLUB Bermuda homme", marque: "Head", categorie: "textile" });
  const short = extractOfferAttributes({ marchand: "Head", titre: "CLUB Short homme", marque: "Head", categorie: "textile" });
  it("deux types distincts, donc différent", () => {
    expect(bermuda.familyKey).toBe("head|bermuda|textile");
    expect(short.familyKey).toBe("head|short|textile");
    expect(compare(bermuda, short).niveau).toBe("different");
  });
});

describe("sous-gamme adidas (3-Stripes, Climacool) : jamais réunie, en file de revue (D-2026-09-30-01, D-2026-09-30-11)", () => {
  const models = (rows: Row[]) => {
    const { result } = review(rows);
    return (id: string) => result.links.get(id)!.modelIndex;
  };
  const plain = (id: string, prix: number): Row => [id, "Tennis Point FR", "adidas", "Vêtement de tennis adidas Club T-shirt Hommes - bleu foncé", prix];
  const stripes = (id: string, prix: number): Row => [id, "Sport 2000", "ADIDAS", "Vêtement de tennis ADIDAS Tee-Shirt Tennis Homme Club 3Stripes Homme", prix];

  it("écart de prix ≤ 10 % : plus réunis par le prix (la signature ne réunit plus en textile), proposés en file de revue", () => {
    const { result, rows } = review([plain("1", 35), stripes("2", 37)]);
    expect(result.links.get("1")!.modelIndex).not.toBe(result.links.get("2")!.modelIndex);
    expect(rows).toHaveLength(1);
    expect(rows[0].raison).toContain("sous_gamme");
  });

  it("écart de prix > 10 % (35 € / 40 €) : modèles distincts, proposés en file de revue", () => {
    const { result, rows } = review([plain("1", 35), stripes("2", 40)]);
    expect(result.links.get("1")!.modelIndex).not.toBe(result.links.get("2")!.modelIndex);
    expect(rows).toHaveLength(1);
    expect(rows[0].raison).toContain("sous_gamme");
  });

  it("prix inconnu d'un côté : distincts", () => {
    const model = models([plain("1", 35), ["2", "Sport 2000", "ADIDAS", "Vêtement de tennis ADIDAS Tee-Shirt Tennis Homme Club Climacool Homme"]]);
    expect(model("1")).not.toBe(model("2"));
  });

  it("deux sous-gammes différentes (3-Stripes / Climacool) : jamais réunies", () => {
    const model = models([stripes("1", 35), ["2", "Sport 2000", "ADIDAS", "Vêtement de tennis ADIDAS Tee-Shirt Tennis Homme Club Climacool Homme", 35]]);
    expect(model("1")).not.toBe(model("2"));
  });
});

describe("Nike Victory : « Flouncy » est neutre (relecture R4.5-b)", () => {
  it("la jupe avec ou sans Flouncy est le même article", () => {
    const a = extractOfferAttributes({ marchand: "Tennis Point FR", titre: "Vêtement de tennis Nike Dri-Fit Victory Flouncy Jupe Femmes-sauge", marque: "Nike", categorie: "textile" });
    const b = extractOfferAttributes({ marchand: "Tennis Point FR", titre: "Vêtement de tennis Nike Dri-FIT Victory Jupe Femmes-rosé", marque: "Nike", categorie: "textile" });
    expect(compare(a, b).niveau).toBe("identique");
  });
});
