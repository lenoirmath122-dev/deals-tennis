import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { compare, signature } from "@/lib/matching/compare";
import { buildModels, type EngineOffer } from "@/lib/matching/cluster";
import { buildReport } from "@/lib/matching/report";
import { extractOfferAttributes, isSupportedCategory, type ExtractedOffer } from "@/lib/matching";

// Première mesure R4.4 : le moteur (étapes 1 et 2) sur le jeu R1 figé, à comparer à
// l'algorithme actuel (précision 5/8, rappel 5/32, inter-marchands 2/29, `r1-banc-mesure.test.ts`).
// Les valeurs ci-dessous sont l'état mesuré ; elles bougeront avec les règles (R4.5, R4.6).

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
type Pair = { id: number; attendu: "identique" | "proche" | "différent"; offre_a: string; offre_b: string };

const fixture = JSON.parse(readFileSync(join(import.meta.dirname, "../fixtures/r1-jeu-fige.json"), "utf-8")) as {
  pairs: Pair[];
  offers: Offer[];
};
const offersById = new Map(fixture.offers.map((o) => [o.id, o]));

const extracted = new Map<string, ExtractedOffer>();
for (const o of fixture.offers) {
  if (!isSupportedCategory(o.categorie)) continue;
  extracted.set(
    o.id,
    extractOfferAttributes({
      marchand: o.marchand,
      titre: o.titre,
      marque: o.marque,
      categorie: o.categorie as ExtractedOffer["categorie"],
      gtin: o.gtin,
      mpn: o.mpn,
      merchant_sku: o.merchant_sku,
      raw_attributes: o.raw_attributes,
    }),
  );
}

function predictedLevel(pair: Pair) {
  const a = extracted.get(pair.offre_a);
  const b = extracted.get(pair.offre_b);
  return a && b ? compare(a, b).niveau : null; // null : textile, R4.5
}

function measure(pairs: Pair[]) {
  let vp = 0;
  let fp = 0;
  let identical = 0;
  for (const pair of pairs) {
    const predicted = predictedLevel(pair) === "identique";
    const isIdentical = pair.attendu === "identique";
    if (isIdentical) identical++;
    if (predicted && isIdentical) vp++;
    else if (predicted) fp++;
  }
  return { vp, fp, identical };
}

describe("moteur R4.4 sur le jeu R1", () => {
  it("précision 9/9 et rappel 9/32 (algorithme actuel : 5/8 et 5/32)", () => {
    expect(measure(fixture.pairs)).toEqual({ vp: 9, fp: 0, identical: 32 });
  });

  it("inter-marchands : précision 8/8 et rappel 8/29 (algorithme actuel : 2/29)", () => {
    const inter = fixture.pairs.filter((p) => offersById.get(p.offre_a)!.marchand !== offersById.get(p.offre_b)!.marchand);
    expect(measure(inter)).toEqual({ vp: 8, fp: 0, identical: 29 });
  });

  it("aucun faux positif (la paire 14, « S Logo Damp », est « proche » grâce à la version « S »)", () => {
    const falsePositives = fixture.pairs.filter((p) => predictedLevel(p) === "identique" && p.attendu !== "identique");
    expect(falsePositives).toEqual([]);
  });

  it("aucune paire « différent » n'est jugée identique (les pièges 28, 29, 33, 38, 43 sont évités)", () => {
    for (const pair of fixture.pairs.filter((p) => p.attendu === "différent")) {
      expect(predictedLevel(pair)).not.toBe("identique");
    }
  });

  it("paires textile : non prises en charge avant R4.5 (7 identiques et 2 proches manquées)", () => {
    const textile = fixture.pairs.filter((p) => predictedLevel(p) === null);
    expect(textile.filter((p) => p.attendu === "identique")).toHaveLength(7);
    expect(textile.filter((p) => p.attendu === "proche")).toHaveLength(2);
  });

  it("un « proche » attendu n'est jamais jugé « différent » (hors gourde sans famille)", () => {
    for (const pair of fixture.pairs.filter((p) => p.attendu === "proche")) {
      const a = extracted.get(pair.offre_a);
      const b = extracted.get(pair.offre_b);
      if (!a || !b) continue;
      const result = compare(a, b);
      if (result.comparable) expect(result.niveau).not.toBe("different");
    }
  });
});

describe("cohérence signature / comparaison", () => {
  it("deux offres de même signature sont identiques, et inversement à l'étape 2", () => {
    const entries = [...extracted.entries()];
    for (let i = 0; i < entries.length; i++) {
      for (let j = i + 1; j < entries.length; j++) {
        const [idA, a] = entries[i];
        const [idB, b] = entries[j];
        if (a.categorie !== b.categorie) continue;
        const sa = signature(a, idA);
        const sb = signature(b, idB);
        const result = compare(a, b);
        const sameSignature = sa !== null && sa === sb;
        if (sameSignature) expect(result.niveau, `${idA} / ${idB}`).toBe("identique");
        if (result.methode === "signature") expect(sameSignature, `${idA} / ${idB}`).toBe(true);
      }
    }
  });
});

describe("regroupement et rapport sur le jeu R1", () => {
  const engineOffers: EngineOffer[] = fixture.offers
    .filter((o) => extracted.has(o.id))
    .map((o) => ({ dealId: o.id, marchand: o.marchand, statut: o.statut, titre: o.titre, extracted: extracted.get(o.id)! }));
  const result = buildModels(engineOffers);

  it("fusionne au moins les paires trouvées et ne fusionne aucune paire « différent »", () => {
    const modelOf = (id: string) => result.links.get(id)?.modelIndex;
    for (const pair of fixture.pairs) {
      if (!extracted.has(pair.offre_a) || !extracted.has(pair.offre_b)) continue;
      const together = modelOf(pair.offre_a) !== undefined && modelOf(pair.offre_a) === modelOf(pair.offre_b);
      if (predictedLevel(pair) === "identique") expect(together).toBe(true);
      if (pair.attendu === "différent") expect(together, `paire ${pair.id}`).toBe(false);
    }
  });

  it("aucun conflit ni modèle incohérent sur le jeu R1", () => {
    expect(result.conflicts).toEqual([]);
    expect(result.incoherent).toEqual([]);
  });

  it("le rapport publie la couverture deux fois et les compteurs du passage", () => {
    const report = buildReport({
      engineVersion: "test",
      offers: engineOffers,
      unsupported: fixture.offers.filter((o) => !extracted.has(o.id)).map((o) => ({ categorie: o.categorie, statut: o.statut })),
      result,
      brandOf: (id) => offersById.get(id)!.marque,
    });
    expect(report.counters.offres_lues).toBe(fixture.offers.length);
    expect(report.counters.modeles).toBe(result.models.length);
    expect(report.counters.modeles_multi_marchands).toBeGreaterThanOrEqual(8);
    expect(report.markdown).toContain("Modèles avec ≥ 2 marchands (active + tracked)");
    expect(report.markdown).toContain("Modèles avec ≥ 2 marchands en active seulement");
    expect(report.csv.conflits.split("\n")[0]).toBe("type;deal_a;titre_a;deal_b;titre_b;detail");
  });

  it("deux passages sur les mêmes données donnent le même résultat", () => {
    const again = buildModels([...engineOffers].reverse());
    expect(again.models).toEqual(result.models);
  });
});
