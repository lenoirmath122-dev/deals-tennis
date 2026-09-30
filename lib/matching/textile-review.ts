/**
 * Textile, étape 3 (R4.5-b, T-Q4 de D-2026-09-29-04) : correspondance approchée en file de revue.
 *
 * Aucune fusion : le score classe des paires de modèles que l'étape 2 n'a pas réunis (même marque,
 * même type précis, même genre et même âge, marchands différents) pour que Mathieu les valide ou
 * les refuse. Chaque décision enrichit ensuite le lexique (`config/textile-lexicon.ts`). Fonction pure.
 */

import { compare, modelWords } from "./compare.ts";
import type { ClusterResult, EngineOffer } from "./cluster.ts";

export interface TextileReviewRow {
  score: number;
  famille: string;
  marchandA: string;
  titreA: string;
  prixA: number | null;
  marchandB: string;
  titreB: string;
  prixB: number | null;
  motsCommuns: string[];
  motsEnPlusA: string[];
  motsEnPlusB: string[];
  /** Écarts relevés par `compare()` (marqueurs, longueur…) et indices retenus dans le score. */
  raison: string;
}

/** En dessous, la paire n'entre pas dans la file. */
export const REVIEW_MIN_SCORE = 0.4;
/** Plafond de lignes du fichier (les mieux classées d'abord). */
export const REVIEW_MAX_ROWS = 3000;

// Même forme que `compare()` : mots triés (l'ordre écrit par le marchand ne compte pas).
const words = modelWords;

/** Écart de prix d'origine : indice seulement (T-Q5), jamais une barrière. */
function priceGap(a: number | null, b: number | null): number {
  if (a === null || b === null || a <= 0 || b <= 0) return 0;
  return Math.abs(a - b) / Math.max(a, b);
}

/** Score d'une paire déjà retenue : part de mots communs du nom de modèle, moins les indices défavorables. */
export function textileReviewScore(input: {
  motsA: string[];
  motsB: string[];
  genreInconnuUnCote: boolean;
  ecartPrix: number;
}): number {
  const a = new Set(input.motsA);
  const b = new Set(input.motsB);
  const common = [...a].filter((w) => b.has(w)).length;
  const union = new Set([...a, ...b]).size;
  if (common === 0 || union === 0) return 0;
  // Même nom de modèle : seuls les marqueurs (millésime, édition, longueur) diffèrent, écart déjà « proche ».
  let score = a.size === b.size && common === a.size ? 0.9 : common / union;
  if (input.genreInconnuUnCote) score -= 0.1;
  if (input.ecartPrix > 0.3) score -= 0.2;
  else if (input.ecartPrix > 0.15) score -= 0.1;
  return Math.max(0, Math.round(score * 100) / 100);
}

export function buildTextileReview(offers: EngineOffer[], result: ClusterResult): TextileReviewRow[] {
  const byId = new Map(offers.map((o) => [o.dealId, o]));

  // Modèles textiles, regroupés par famille (marque|type|textile).
  const byFamily = new Map<string, EngineOffer[][]>();
  for (const model of result.models) {
    if (model.category !== "textile" || model.familyKey === null) continue;
    const members = model.members.map((id) => byId.get(id)!).filter((o) => o.extracted.familyKey === model.familyKey);
    if (members.length === 0) continue;
    const list = byFamily.get(model.familyKey) ?? [];
    list.push(members);
    byFamily.set(model.familyKey, list);
  }

  const rows: TextileReviewRow[] = [];
  for (const [family, models] of byFamily) {
    for (let i = 0; i < models.length; i++) {
      for (let j = i + 1; j < models.length; j++) {
        // Une paire d'offres de marchands différents, une par modèle.
        let pair: [EngineOffer, EngineOffer] | null = null;
        find: for (const x of models[i]) {
          for (const y of models[j]) {
            if (x.marchand !== y.marchand) {
              pair = [x, y];
              break find;
            }
          }
        }
        if (pair === null) continue;
        const [x, y] = pair;
        const motsA = words(x.extracted.attributes.modele?.value as string | undefined);
        const motsB = words(y.extracted.attributes.modele?.value as string | undefined);
        if (motsA.length === 0 || motsB.length === 0) continue;

        const result = compare(x.extracted, y.extracted);
        if (result.niveau === "identique") continue;
        // Génération différente déjà connue, pas à valider : numéro écrit d'un seul côté ou différent
        // (« Tie Break II », D-2026-09-29-05), références de style Nike différentes (Flex / Dri-FIT).
        if (result.differences.some((d) => d.attribut === "numero" || d.attribut === "reference_style")) continue;
        // Genre ou âge différents : différent, toujours (§3.2). Écart de modèle : c'est justement ce que le score mesure.
        const hard = result.differences.filter((d) => d.attribut !== "modele" && d.effet === "different");
        if (hard.length > 0) continue;
        const genreUnknown = result.differences.some((d) => d.attribut === "genre" && d.effet === "inconnu");

        const prixA = x.prixOrigine ?? null;
        const prixB = y.prixOrigine ?? null;
        const gap = priceGap(prixA, prixB);
        const score = textileReviewScore({ motsA, motsB, genreInconnuUnCote: genreUnknown, ecartPrix: gap });
        if (score < REVIEW_MIN_SCORE) continue;

        const setB = new Set(motsB);
        const setA = new Set(motsA);
        const notes = result.differences.filter((d) => d.attribut !== "modele").map((d) => `${d.attribut}: ${d.a ?? "?"} | ${d.b ?? "?"}`);
        if (gap > 0.15) notes.push(`prix d'origine ${Math.round(gap * 100)} % d'écart`);
        rows.push({
          score,
          famille: family,
          marchandA: x.marchand,
          titreA: x.titre,
          prixA,
          marchandB: y.marchand,
          titreB: y.titre,
          prixB,
          motsCommuns: motsA.filter((w) => setB.has(w)),
          motsEnPlusA: motsA.filter((w) => !setB.has(w)),
          motsEnPlusB: motsB.filter((w) => !setA.has(w)),
          raison: notes.join(" ; "),
        });
      }
    }
  }
  return rows
    .sort((p, q) => q.score - p.score || (p.titreA < q.titreA ? -1 : p.titreA > q.titreA ? 1 : p.titreB < q.titreB ? -1 : 1))
    .slice(0, REVIEW_MAX_ROWS);
}
