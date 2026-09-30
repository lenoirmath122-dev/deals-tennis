import { describe, expect, it } from "vitest";
import { compare } from "@/lib/matching/compare";
import { extractOfferAttributes, type ExtractedOffer, type OfferInput } from "@/lib/matching";

// R4.5, étape 6 (D-2026-09-30-08) : état « indéterminé », une paire piège par règle.
// Cadrage : `R4_5_etape6_indetermine.md` (§3 règle validée, §4 point 7).

type Extra = Partial<Pick<OfferInput, "merchant_sku" | "mpn" | "raw_attributes" | "subcategory">>;

const extract = (categorie: OfferInput["categorie"], marchand: string, marque: string, titre: string, extra: Extra = {}): ExtractedOffer =>
  extractOfferAttributes({ marchand, titre, marque, categorie, ...extra });

const racket = (marque: string, titre: string) => extract("raquettes", "Test", marque, titre);
const shoe = (marque: string, titre: string) => extract("chaussures", "Test", marque, titre);
const string = (marque: string, titre: string) => extract("cordages", "Test", marque, titre);
const textile = (marque: string, titre: string) => extract("textile", "Test", marque, titre);
const bag = (marque: string, titre: string) => extract("accessoires", "Test", marque, titre, { subcategory: "sacs" });

const niveau = (a: ExtractedOffer, b: ExtractedOffer) => compare(a, b).niveau;

describe("caractéristique descriptive absente d'un côté : indéterminé", () => {
  it("surface écrite d'un seul côté (« Court FF 3 », Asics)", () => {
    const a = shoe("Asics", "ASICS Court FF 3 Chaussure terre battue");
    const b = shoe("Asics", "Asics Court FF 3 Chaussure de tennis Homme");
    const result = compare(a, b);
    expect(result.niveau).toBe("indetermine");
    expect(result.differences.map((d) => d.effet)).toContain("inconnu");
  });

  it("genre écrit d'un seul côté (« Barricade 14 », adidas)", () => {
    const a = shoe("adidas", "Chaussures de tennis adidas Barricade 14 Hommes");
    const b = shoe("adidas", "Adidas Barricade 14 Chaussures Toutes Surfaces");
    expect(niveau(a, b)).toBe("indetermine");
  });

  it("génération écrite d'un seul côté, raquette", () => {
    expect(niveau(racket("Babolat", "Babolat Pure Drive Gen11"), racket("Babolat", "Babolat Pure Drive"))).toBe("indetermine");
  });

  it("cordage sans jauge ni conditionnement d'un côté (« Lynx Tour »)", () => {
    const a = string("Head", "Head Lynx Tour (200m)");
    const b = string("Head", "HEAD Lynx Tour cordages de tennis");
    expect(niveau(a, b)).toBe("indetermine");
  });

  it("textile sans nom de modèle d'un côté", () => {
    const a = textile("Lacoste", "Lacoste Polo Hommes - orange");
    const b = textile("Lacoste", "Polo Lacoste Regular Coton Hommes");
    expect(niveau(a, b)).toBe("indetermine");
  });

  it("textile : « Club 25 Tech » / « Club Tech » (millésime d'un seul côté)", () => {
    const a = textile("Head", "CLUB 25 TECH T-shirt femme");
    const b = textile("Head", "T-shirt de tennis Head Club Tech Femme");
    expect(niveau(a, b)).toBe("indetermine");
  });

  it("textile : « Short 7in » / « Short » (longueur d'un seul côté)", () => {
    const a = textile("Lotto", "Short de tennis Lotto Tech 7in Homme");
    const b = textile("Lotto", "Short de tennis Lotto Tech Homme");
    expect(niveau(a, b)).toBe("indetermine");
  });

  it("sacs : contenance écrite d'un seul côté (« Tour 25L » / « Tour XL »)", () => {
    const a = bag("Head", "Sac à dos Head Tour 25 L");
    const b = bag("Head", "Sac à dos Head Tour XL");
    expect(niveau(a, b)).toBe("indetermine");
  });
});

describe("marqueur écrit d'un seul côté : proche (inchangé)", () => {
  it("« Pure Drive Team Gen11 » / « Pure Drive Gen11 »", () => {
    expect(niveau(racket("Babolat", "Babolat Pure Drive Team Gen11"), racket("Babolat", "Babolat Pure Drive Gen11"))).toBe("proche");
  });

  it("« Endure Pro » / « Endure Pro BOA »", () => {
    expect(niveau(shoe("Head", "Head Endure Pro"), shoe("Head", "Head Endure Pro BOA"))).toBe("proche");
  });

  it("« Tie Break II » / « Tie Break »", () => {
    expect(niveau(textile("Head", "T-shirt Head Tie Break II Homme"), textile("Head", "T-shirt Head Tie Break Homme"))).toBe("proche");
  });

  it("édition RG d'un seul côté (textile)", () => {
    expect(niveau(textile("Lacoste", "T-shirt Lacoste Roland Garros Hommes"), textile("Lacoste", "T-shirt Lacoste Hommes"))).toBe("proche");
  });

  it("deux longueurs textile écrites et différentes (« 7in » / « 9in »)", () => {
    const a = textile("Lotto", "Short de tennis Lotto Tech 7in Homme");
    const b = textile("Lotto", "Short de tennis Lotto Tech 9in Homme");
    expect(niveau(a, b)).toBe("proche");
  });
});

describe("knownAloneIsDifferent : inchangé", () => {
  it("« Tour sac à chaussures » / « Tour Bag XL » : différent (B5)", () => {
    const a = bag("Head", "Sac à chaussures Head Tour");
    const b = bag("Head", "Sac Head Tour Bag XL");
    expect(niveau(a, b)).toBe("different");
  });
});

describe("ordre des verdicts : différent > proche > indéterminé", () => {
  it("surface différente écrite des deux côtés + genre absent d'un côté : proche", () => {
    const a = shoe("Asics", "Asics Court FF 3 Chaussure terre battue Homme");
    const b = shoe("Asics", "Asics Court FF 3 Chaussure toutes surfaces");
    expect(niveau(a, b)).toBe("proche");
  });

  it("genre différent + surface absente d'un côté : différent", () => {
    const a = shoe("Asics", "Asics Court FF 3 Chaussure terre battue Homme");
    const b = shoe("Asics", "Asics Court FF 3 Chaussure Femme");
    expect(niveau(a, b)).toBe("different");
  });
});
