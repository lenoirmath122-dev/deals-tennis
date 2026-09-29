/**
 * Étape 3 du textile (R4.5-b, D-2026-09-29-04, T-Q4 et T-Q5) : correspondance approchée en file de
 * revue. Le score ne fusionne rien : il classe les paires de modèles de même marque, type, genre et
 * âge dont seul le nom de gamme diffère, les plus probables en premier. Fonction pure.
 */

import { CONFIDENCE_THRESHOLDS } from "../../config/matching-rules.ts";
import { TEXTILE_REVIEW_DISTINCTIVE_WORDS, TEXTILE_REVIEW_SOFT_WORDS } from "../../config/textile-lexicon.ts";
import { compare } from "./compare.ts";
import type { ClusterResult, EngineOffer } from "./cluster.ts";

export interface ReviewPair {
  famille: string;
  a: { dealId: string; marchand: string; titre: string; modele: string; prix: number | null };
  b: { dealId: string; marchand: string; titre: string; modele: string; prix: number | null };
  score: number;
  /** Mots présents d'un seul côté. */
  motsEnPlus: string[];
  /** Explication du score, pour la relecture. */
  indices: string[];
}

const words = (modele: string) => new Set(modele.split(" ").filter(Boolean));

/** Écart relatif de deux prix d'origine ; `null` si l'un est inconnu. */
function priceGap(a: number | null, b: number | null): number | null {
  if (!a || !b) return null;
  return Math.abs(a - b) / Math.max(a, b);
}

const median = (values: number[]): number | null => {
  if (values.length === 0) return null;
  const sorted = [...values].sort((x, y) => x - y);
  return sorted[Math.floor(sorted.length / 2)];
};

/**
 * Score entre 0 et 1 de deux noms de gamme : part de mots communs, nature des mots en plus
 * (distinctif : score très bas ; « mou » : score haut), prix d'origine en simple indice (T-Q5).
 */
export function scoreModelNames(
  modeleA: string,
  modeleB: string,
  prixA: number | null,
  prixB: number | null,
): { score: number; motsEnPlus: string[]; indices: string[] } {
  const a = words(modeleA);
  const b = words(modeleB);
  const common = [...a].filter((w) => b.has(w));
  const extras = [...a, ...b].filter((w) => !(a.has(w) && b.has(w)));
  const union = new Set([...a, ...b]).size;
  const indices: string[] = [`${common.length}/${union} mots communs`];
  let score = union === 0 ? 0 : common.length / union;

  const distinctive = extras.filter((w) => TEXTILE_REVIEW_DISTINCTIVE_WORDS.includes(w));
  if (distinctive.length > 0) {
    score *= 0.25;
    indices.push(`mot distinctif : ${distinctive.join(", ")}`);
  } else if (extras.length > 0 && common.length > 0 && extras.every((w) => TEXTILE_REVIEW_SOFT_WORDS.includes(w))) {
    score = Math.max(score, 0.9);
    indices.push(`mots en plus jugés secondaires : ${extras.join(", ")}`);
  }
  // Un mot en plus d'un seul côté (l'autre nom est inclus dans le premier) est le cas le plus fréquent.
  if (extras.length > 0 && (common.length === a.size || common.length === b.size)) indices.push("un nom contient l'autre");

  const gap = priceGap(prixA, prixB);
  if (gap !== null) {
    if (gap <= 0.05) {
      score += 0.1;
      indices.push("prix d'origine proches");
    } else if (gap > 0.15) {
      score -= 0.15;
      indices.push(`prix d'origine éloignés (${Math.round(gap * 100)} %)`);
    }
  }
  return { score: Math.round(Math.min(1, Math.max(0, score)) * 100) / 100, motsEnPlus: extras, indices };
}

/**
 * Paires de modèles textiles à relire : même famille (marque + type), genre et âge identiques, noms
 * de gamme différents, au moins deux marchands en jeu. Triées par score décroissant, sous le seuil
 * de revue : rien.
 */
export function reviewTextilePairs(
  offers: EngineOffer[],
  result: ClusterResult,
  threshold: number = CONFIDENCE_THRESHOLDS.review ?? 0.4,
): ReviewPair[] {
  const byId = new Map(offers.map((o) => [o.dealId, o]));
  const byFamily = new Map<string, { rep: EngineOffer; merchants: Set<string>; prix: number | null }[]>();
  for (const model of result.models) {
    if (model.category !== "textile" || model.familyKey === null) continue;
    const members = model.members.map((id) => byId.get(id)!);
    const rep = members.find((m) => m.extracted.familyKey !== null && m.extracted.attributes.modele);
    if (!rep) continue;
    const entry = {
      rep,
      merchants: new Set(members.map((m) => m.marchand)),
      prix: median(members.map((m) => m.prixOrigine).filter((p): p is number => typeof p === "number" && p > 0)),
    };
    const list = byFamily.get(model.familyKey) ?? [];
    list.push(entry);
    byFamily.set(model.familyKey, list);
  }

  const pairs: ReviewPair[] = [];
  for (const [familyKey, list] of byFamily) {
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const [x, y] = [list[i], list[j]];
        // Deux modèles d'un même unique marchand ne se rapprochent pas entre marchands.
        if (x.merchants.size === 1 && y.merchants.size === 1 && [...x.merchants][0] === [...y.merchants][0]) continue;
        const r = compare(x.rep.extracted, y.rep.extracted);
        if (!r.differences.some((d) => d.attribut === "modele" && d.effet === "different")) continue;
        if (r.differences.some((d) => d.attribut === "genre" || d.attribut === "age_group" || (d.effet === "different" && d.attribut !== "modele"))) continue;
        const modeleA = String(x.rep.extracted.attributes.modele.value);
        const modeleB = String(y.rep.extracted.attributes.modele.value);
        const { score, motsEnPlus, indices } = scoreModelNames(modeleA, modeleB, x.prix, y.prix);
        if (score < threshold) continue;
        const side = (e: typeof x, modele: string) => ({
          dealId: e.rep.dealId,
          marchand: [...e.merchants].sort().join(" + "),
          titre: e.rep.titre,
          modele,
          prix: e.prix,
        });
        pairs.push({ famille: familyKey, a: side(x, modeleA), b: side(y, modeleB), score, motsEnPlus, indices });
      }
    }
  }
  return pairs.sort((p, q) => q.score - p.score || (p.a.titre < q.a.titre ? -1 : 1));
}
