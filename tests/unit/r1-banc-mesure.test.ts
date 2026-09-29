import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { extractModel, normalizeProductKey } from "@/lib/product-matching";

// Banc de mesure R4.1 : rejoue l'algorithme actuel (clé texte de
// `lib/product-matching.ts`) sur le jeu R1 figé, sans base de données, et
// retrouve la mesure de référence de `R1_mesure.md` (§9 et §10).

type Offer = {
  id: string;
  marchand: string;
  titre: string;
  marque: string;
  categorie: string;
  statut: string;
  gtin: string | null;
  mpn: string | null;
  merchant_sku: string | null;
  raw_attributes: Record<string, unknown> | null;
};

type Pair = {
  id: number;
  attendu: "identique" | "proche" | "différent";
  niveau: string;
  piege: string;
  algo_reference: "rapproché" | "non rapproché";
  offre_a: string;
  offre_b: string;
};

const fixture = JSON.parse(
  readFileSync(join(import.meta.dirname, "../fixtures/r1-jeu-fige.json"), "utf-8")
) as { pairs: Pair[]; offers: Offer[] };

const offersById = new Map(fixture.offers.map((offer) => [offer.id, offer]));

function currentKey(offer: Offer): string {
  return normalizeProductKey({
    brand: offer.marque,
    model: extractModel(offer.titre, offer.marque, offer.categorie),
    category: offer.categorie,
  });
}

function measure(pairs: Pair[]) {
  let vp = 0;
  let fp = 0;
  let fn = 0;
  for (const pair of pairs) {
    const matched =
      currentKey(offersById.get(pair.offre_a)!) === currentKey(offersById.get(pair.offre_b)!);
    const identical = pair.attendu === "identique";
    if (matched && identical) vp++;
    else if (matched) fp++;
    else if (identical) fn++;
  }
  return { vp, fp, fn, matched: vp + fp, identical: vp + fn };
}

describe("jeu R1 figé", () => {
  it("contient les 67 paires validées : 33 identiques / 14 proches / 20 différents (paire 17 reclassée en R4.5-a)", () => {
    const count = (label: string) => fixture.pairs.filter((p) => p.attendu === label).length;
    expect(fixture.pairs).toHaveLength(67);
    expect(count("identique")).toBe(33);
    expect(count("proche")).toBe(14);
    expect(count("différent")).toBe(20);
  });

  it("référence 123 offres distinctes, toutes présentes", () => {
    expect(fixture.offers).toHaveLength(123);
    for (const pair of fixture.pairs) {
      expect(offersById.has(pair.offre_a)).toBe(true);
      expect(offersById.has(pair.offre_b)).toBe(true);
    }
  });
});

describe("banc de mesure : algorithme actuel sur le jeu R1", () => {
  it("rejoue la sortie mesurée en R1 (rapproché / non rapproché) pour chaque paire", () => {
    const ecarts = fixture.pairs
      .filter((pair) => {
        const matched =
          currentKey(offersById.get(pair.offre_a)!) === currentKey(offersById.get(pair.offre_b)!);
        return (matched ? "rapproché" : "non rapproché") !== pair.algo_reference;
      })
      .map((pair) => pair.id);
    expect(ecarts).toEqual([]);
  });

  it("retrouve la précision 5/8 et le rappel 5/33 sur le jeu complet (5/32 avant la reclassification de la paire 17)", () => {
    const result = measure(fixture.pairs);
    expect(result.vp).toBe(5);
    expect(result.matched).toBe(8);
    expect(result.identical).toBe(33);
  });

  it("retrouve 2/30 sur les seules paires inter-marchands identiques", () => {
    const interMerchants = fixture.pairs.filter(
      (pair) =>
        offersById.get(pair.offre_a)!.marchand !== offersById.get(pair.offre_b)!.marchand
    );
    const result = measure(interMerchants);
    expect(result.vp).toBe(2);
    expect(result.identical).toBe(30);
  });
});
