/**
 * Regroupement des offres en modèles (R4.4), fonction pure.
 *
 * Cascade : étape 1 (même GTIN, puis même référence fabricant, sauf conflit), étape 2
 * (même signature famille + attributs discriminants). Les composantes connexes de ces
 * liens forment les modèles. Déterministe : offres triées par identifiant, deux passages
 * sur les mêmes données donnent les mêmes modèles.
 */

import { ATTRIBUTE_SOURCES, CATEGORY_RULES } from "../../config/matching-rules.ts";
import {
  compare,
  derivedAttributesRelaxed,
  discriminantAttributeNames,
  distinctStyleReferences,
  normalizeReference,
  signature,
  type CompareMethod,
} from "./compare.ts";
import type { ExtractedAttribute, ExtractedOffer } from "./types.ts";

export interface EngineOffer {
  dealId: string;
  marchand: string;
  /** Statut en base (`active`, `tracked`) : sert à la couverture publiée deux fois (R4-Q3). */
  statut: string;
  titre: string;
  /** Prix d'origine : indice de l'étape 3 textile seulement (R4.5-b). */
  prixOrigine?: number | null;
  extracted: ExtractedOffer;
}

export interface EngineModel {
  signature: string;
  familyKey: string | null;
  category: ExtractedOffer["categorie"];
  canonical: Record<string, ExtractedAttribute>;
  /** Identifiants des offres, triés. */
  members: string[];
}

export interface OfferLink {
  modelIndex: number;
  method: CompareMethod;
  /** Étapes 1 et 2 sont exactes : score 1 (l'étape 3 donnera des scores inférieurs, R4.5). */
  score: number;
}

export interface ClusterConflict {
  kind: "gtin" | "reference";
  a: string;
  b: string;
  detail: string;
}

export interface ClusterResult {
  models: EngineModel[];
  /** Offre → lien ; les offres sans famille reconnue ni identifiant partagé n'ont pas de lien. */
  links: Map<string, OfferLink>;
  conflicts: ClusterConflict[];
  /** Modèles dont deux membres se contredisent (fusion par identifiant + signature en désaccord). */
  incoherent: { model: number; a: string; b: string; detail: string }[];
  /** Modèles dont les membres n'ont pas la même valeur extraite pour un attribut discriminant (D5). */
  divergences: { model: number; attribut: string; valeurs: string[] }[];
  /**
   * Textile, marques à style distinct (D-2026-09-29-05) : offres sans référence dont le titre
   * correspond à plusieurs groupes de références. Rattachées à aucun : « proches » de chacun.
   */
  ambiguousWithoutReference: { dealId: string; references: string[] }[];
}

const METHOD_RANK: Record<CompareMethod, number> = { gtin: 3, reference: 2, signature: 1 };
const INCOHERENCE_PAIR_LIMIT = 40;
/** Textile, étape 2 ter : écart de prix d'origine maximal pour réunir deux groupes à sous-gamme différente. */
const SUBRANGE_PRICE_TOLERANCE = 0.1;

function medianPrice(group: EngineOffer[]): number | null {
  const prices = group.map((o) => o.prixOrigine).filter((p): p is number => typeof p === "number" && p > 0).sort((a, b) => a - b);
  if (prices.length === 0) return null;
  const mid = Math.floor(prices.length / 2);
  return prices.length % 2 ? prices[mid] : (prices[mid - 1] + prices[mid]) / 2;
}

class UnionFind {
  private parent = new Map<string, string>();
  find(x: string): string {
    let root = x;
    while ((this.parent.get(root) ?? root) !== root) root = this.parent.get(root)!;
    this.parent.set(x, root);
    return root;
  }
  union(a: string, b: string) {
    const ra = this.find(a);
    const rb = this.find(b);
    if (ra !== rb) this.parent.set(ra < rb ? rb : ra, ra < rb ? ra : rb);
  }
}

function sourceRank(source: string): number {
  const rank = (ATTRIBUTE_SOURCES as readonly string[]).indexOf(source);
  return rank === -1 ? ATTRIBUTE_SOURCES.length : rank;
}

/** Valeur canonique de chaque attribut : celle de la source la plus fiable, à égalité la première offre. */
function canonicalAttributes(members: EngineOffer[]): Record<string, ExtractedAttribute> {
  const category = members[0].extracted.categorie;
  const names = [...discriminantAttributeNames(category), "generation", "annee", "version"];
  const out: Record<string, ExtractedAttribute> = {};
  for (const name of new Set(names)) {
    let best: ExtractedAttribute | null = null;
    for (const member of members) {
      const attr = member.extracted.attributes[name];
      if (attr && (best === null || sourceRank(attr.source) < sourceRank(best.source))) best = attr;
    }
    if (best) out[name] = best;
  }
  return out;
}

export function buildModels(input: EngineOffer[]): ClusterResult {
  const offers = [...input].sort((a, b) => (a.dealId < b.dealId ? -1 : 1));
  const uf = new UnionFind();
  const method = new Map<string, CompareMethod>();
  const conflicts: ClusterConflict[] = [];
  const linked = new Set<string>();
  const ambiguousWithoutReference: ClusterResult["ambiguousWithoutReference"] = [];

  // D-2026-09-29-05 : un modèle ne contient jamais deux références de style d'une marque « à style
  // distinct » (Nike), y compris par transitivité. Références par composante, tenues à jour à chaque fusion.
  const styleRefs = new Map<string, Set<string>>();
  for (const offer of offers) {
    const refs = distinctStyleReferences(offer.extracted);
    if (refs.length > 0) styleRefs.set(offer.dealId, new Set(refs));
  }
  const refsOf = (id: string) => styleRefs.get(uf.find(id));
  /** Réunit deux composantes sauf si le résultat porterait deux références de style différentes. */
  const guardedUnion = (a: string, b: string): boolean => {
    const ra = uf.find(a);
    const rb = uf.find(b);
    if (ra === rb) return true;
    const sa = styleRefs.get(ra);
    const sb = styleRefs.get(rb);
    const merged = new Set([...(sa ?? []), ...(sb ?? [])]);
    if (sa && sb && merged.size > Math.max(sa.size, sb.size)) return false;
    uf.union(a, b);
    styleRefs.delete(ra);
    styleRefs.delete(rb);
    if (merged.size > 0) styleRefs.set(uf.find(a), merged);
    return true;
  };

  const note = (id: string, m: CompareMethod) => {
    linked.add(id);
    if (!method.has(id) || METHOD_RANK[m] > METHOD_RANK[method.get(id)!]) method.set(id, m);
  };

  // Étape 1 : GTIN puis références fabricant. On compare chaque offre au premier membre du groupe.
  const groups = (keysOf: (o: EngineOffer) => string[]) => {
    const map = new Map<string, EngineOffer[]>();
    for (const offer of offers) {
      for (const key of new Set(keysOf(offer))) {
        const list = map.get(key) ?? [];
        list.push(offer);
        map.set(key, list);
      }
    }
    return map;
  };
  const byGtin = groups((o) => (o.extracted.gtin ? [`${o.extracted.categorie}|${o.extracted.gtin}`] : []));
  const byReference = groups((o) =>
    o.extracted.referencesFabricant
      .map((r) => normalizeReference(r.value))
      .filter((r): r is string => r !== null)
      .map((r) => `${o.extracted.categorie}|${r}`),
  );
  for (const [kind, map] of [["gtin", byGtin], ["reference", byReference]] as const) {
    for (const members of map.values()) {
      if (members.length < 2) continue;
      const anchor = members[0];
      for (const other of members.slice(1)) {
        const result = compare(anchor.extracted, other.extracted);
        if (result.methode === "gtin" || result.methode === "reference") {
          if (guardedUnion(anchor.dealId, other.dealId)) {
            note(anchor.dealId, result.methode);
            note(other.dealId, result.methode);
          }
        } else if (result.conflit) {
          conflicts.push({
            kind,
            a: anchor.dealId,
            b: other.dealId,
            detail: result.differences.map((d) => `${d.attribut} (${d.a} | ${d.b})`).join(", "),
          });
        }
      }
    }
  }

  // Étape 2 : même signature.
  const bySignature = new Map<string, EngineOffer[]>();
  for (const offer of offers) {
    const sig = signature(offer.extracted, offer.dealId);
    if (sig === null) continue;
    const list = bySignature.get(sig) ?? [];
    list.push(offer);
    bySignature.set(sig, list);
  }
  for (const members of bySignature.values()) {
    // Signature partagée par plusieurs groupes de références de style : chaque groupe reste à part,
    // les offres sans référence ne se rattachent à aucun (elles se regroupent entre elles).
    const styled = new Set(members.filter((m) => refsOf(m.dealId)).map((m) => uf.find(m.dealId)));
    if (styled.size > 1) {
      const bare = members.filter((m) => !refsOf(m.dealId));
      for (const other of bare.slice(1)) guardedUnion(bare[0].dealId, other.dealId);
      const references = [...new Set([...styled].flatMap((root) => [...(styleRefs.get(root) ?? [])]))].sort();
      for (const member of bare) ambiguousWithoutReference.push({ dealId: member.dealId, references });
    } else {
      for (const other of members.slice(1)) guardedUnion(members[0].dealId, other.dealId);
    }
    // Les offres de famille reconnue ont toujours un modèle (au minimum le leur).
    for (const member of members) linked.add(member.dealId);
  }

  // Étape 2 bis (C-Q3) : raquettes de même famille, version et génération, dont une caractéristique
  // dérivée (poids, tamis, plan, longueur) n'est connue que d'un côté : leurs signatures diffèrent
  // mais `compare()` dit « identique ». Réunies seulement si toutes les paires des deux groupes le disent.
  const racquetsByFamily = new Map<string, EngineOffer[]>();
  for (const offer of offers) {
    if (offer.extracted.categorie !== "raquettes" || offer.extracted.familyKey === null) continue;
    const list = racquetsByFamily.get(offer.extracted.familyKey) ?? [];
    list.push(offer);
    racquetsByFamily.set(offer.extracted.familyKey, list);
  }
  for (const members of racquetsByFamily.values()) {
    for (let i = 0; i < members.length; i++) {
      for (let j = i + 1; j < members.length; j++) {
        const [x, y] = [members[i], members[j]];
        if (uf.find(x.dealId) === uf.find(y.dealId)) continue;
        if (!derivedAttributesRelaxed(x.extracted, y.extracted)) continue;
        if (compare(x.extracted, y.extracted).niveau !== "identique") continue;
        const groupX = members.filter((m) => uf.find(m.dealId) === uf.find(x.dealId));
        const groupY = members.filter((m) => uf.find(m.dealId) === uf.find(y.dealId));
        const allIdentical = groupX.every((p) => groupY.every((q) => compare(p.extracted, q.extracted).niveau === "identique"));
        if (allIdentical) uf.union(x.dealId, y.dealId);
      }
    }
  }

  // Étape 2 ter (D-2026-09-30-01, textile) : une sous-gamme écrite d'un seul côté (« Club » / « Club 3-Stripes »)
  // ne prouve pas un autre article si le prix d'origine est proche (≤ 10 %, médiane de chaque groupe) ;
  // sinon les deux groupes restent distincts. Réunis seulement si toutes les paires des deux groupes ne
  // diffèrent que par cette sous-gamme absente d'un côté.
  const textileByFamily = new Map<string, EngineOffer[]>();
  for (const offer of offers) {
    if (offer.extracted.categorie !== "textile" || offer.extracted.familyKey === null) continue;
    const list = textileByFamily.get(offer.extracted.familyKey) ?? [];
    list.push(offer);
    textileByFamily.set(offer.extracted.familyKey, list);
  }
  const onlySubrangeMissing = (x: EngineOffer, y: EngineOffer) => {
    const diffs = compare(x.extracted, y.extracted).differences;
    return diffs.length === 1 && diffs[0].attribut === "sous_gamme" && (diffs[0].a === null || diffs[0].b === null);
  };
  for (const members of textileByFamily.values()) {
    if (!members.some((m) => m.extracted.attributes.sous_gamme)) continue;
    for (let i = 0; i < members.length; i++) {
      for (let j = i + 1; j < members.length; j++) {
        const [x, y] = [members[i], members[j]];
        if (uf.find(x.dealId) === uf.find(y.dealId) || !onlySubrangeMissing(x, y)) continue;
        const groupX = members.filter((m) => uf.find(m.dealId) === uf.find(x.dealId));
        const groupY = members.filter((m) => uf.find(m.dealId) === uf.find(y.dealId));
        if (!groupX.every((p) => groupY.every((q) => onlySubrangeMissing(p, q)))) continue;
        const priceX = medianPrice(groupX);
        const priceY = medianPrice(groupY);
        if (priceX === null || priceY === null) continue;
        if (Math.abs(priceX - priceY) / Math.max(priceX, priceY) <= SUBRANGE_PRICE_TOLERANCE) guardedUnion(x.dealId, y.dealId);
      }
    }
  }

  // Composantes → modèles.
  const components = new Map<string, EngineOffer[]>();
  for (const offer of offers) {
    if (!linked.has(offer.dealId)) continue;
    const root = uf.find(offer.dealId);
    const list = components.get(root) ?? [];
    list.push(offer);
    components.set(root, list);
  }
  // Une offre non reconnue liée à personne (identifiant unique) n'a pas de modèle.
  const models: EngineModel[] = [];
  const links = new Map<string, OfferLink>();
  const usedSignatures = new Set<string>();
  const incoherent: ClusterResult["incoherent"] = [];
  const divergences: ClusterResult["divergences"] = [];

  for (const members of [...components.values()].sort((a, b) => (a[0].dealId < b[0].dealId ? -1 : 1))) {
    const recognized = members.filter((m) => m.extracted.familyKey !== null);
    if (members.length === 1 && recognized.length === 0) continue;
    // Représentant : l'offre la plus documentée (plus d'attributs), puis identifiant.
    const representative = [...(recognized.length > 0 ? recognized : members)].sort(
      (a, b) =>
        Object.keys(b.extracted.attributes).length - Object.keys(a.extracted.attributes).length ||
        (a.dealId < b.dealId ? -1 : 1),
    )[0];
    let sig = signature(representative.extracted, representative.dealId) ?? `identifiant|${representative.dealId}`;
    if (usedSignatures.has(sig)) sig = `${sig}|#${representative.dealId}`;
    usedSignatures.add(sig);

    const index = models.length;
    models.push({
      signature: sig,
      familyKey: representative.extracted.familyKey,
      category: representative.extracted.categorie,
      canonical: canonicalAttributes(recognized.length > 0 ? recognized : members),
      members: members.map((m) => m.dealId),
    });
    for (const member of members) {
      links.set(member.dealId, { modelIndex: index, method: method.get(member.dealId) ?? "signature", score: 1 });
    }

    if (recognized.length > 1) divergences.push(...findDivergences(recognized, index));

    // Cohérence : un modèle fusionné par identifiant ne doit pas contenir deux offres « différentes ».
    if (members.length > 1 && recognized.length > 1) {
      const pairs: [EngineOffer, EngineOffer][] = [];
      if (recognized.length <= INCOHERENCE_PAIR_LIMIT) {
        for (let i = 0; i < recognized.length; i++) for (let j = i + 1; j < recognized.length; j++) pairs.push([recognized[i], recognized[j]]);
      } else {
        for (const other of recognized) if (other !== representative) pairs.push([representative, other]);
      }
      for (const [x, y] of pairs) {
        const result = compare(x.extracted, y.extracted);
        if (result.niveau === "different" && result.comparable) {
          incoherent.push({
            model: index,
            a: x.dealId,
            b: y.dealId,
            detail: result.differences.map((d) => `${d.attribut} (${d.a} | ${d.b})`).join(", "),
          });
          break;
        }
      }
    }
  }
  return { models, links, conflicts, incoherent, divergences, ambiguousWithoutReference };
}

/**
 * D5 (`R4_4_controle.md`) : contrôle indépendant de `compare()`. Un modèle dont deux membres ont
 * des valeurs extraites différentes pour un même attribut discriminant (ou la version, ou une
 * édition à exception de valeur) est signalé, même si `compare()` les juge « identiques ».
 */
function findDivergences(members: EngineOffer[], model: number): ClusterResult["divergences"] {
  const category = members[0].extracted.categorie;
  const overridden = Object.keys(CATEGORY_RULES[category]?.attributeValueOverrides ?? {});
  const names = new Set([...discriminantAttributeNames(category), "version", ...overridden]);
  const out: ClusterResult["divergences"] = [];
  for (const name of names) {
    const values = new Set<string>();
    for (const member of members) {
      const attr = member.extracted.attributes[name];
      if (attr) values.add(String(attr.value).toLowerCase());
    }
    if (values.size > 1) out.push({ model, attribut: name, valeurs: [...values].sort() });
  }
  return out;
}
