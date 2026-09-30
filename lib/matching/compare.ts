/**
 * Comparaison de deux offres et signature de modèle (R4.4).
 *
 * Fonctions pures. Cascade du cadrage (§8) :
 * 1. GTIN identique, puis référence fabricant partagée → « identique », sauf
 *    contradiction franche des attributs (conflit : jamais fusionné) ;
 * 2. même famille, attributs discriminants comparés selon `config/matching-rules.ts`.
 * L'étape 3 (correspondance approchée avec score) viendra en R4.5.
 *
 * Principe R3 : un faux rapprochement coûte plus qu'un rapprochement manqué. Un
 * attribut discriminant connu d'un côté seulement ne permet jamais « identique ».
 * Un attribut absent des deux côtés est traité comme égal (sauf la génération, qui a
 * sa règle). `signature()` est construite pour que deux offres de même signature soient
 * exactement celles que `compare()` juge « identique » à l'étape 2.
 */

import { ACCESSORY_FAMILIES } from "../../config/model-families-accessoires.ts";
import { SHOE_FAMILIES } from "../../config/model-families-chaussures.ts";
import { MODEL_FAMILIES } from "../../config/model-families.ts";
import {
  CATEGORY_RULES,
  COMMON_ATTRIBUTES,
  GENERATION_RULES,
  type AttributeRole,
  type MatchLevel,
} from "../../config/matching-rules.ts";
import { TEXTILE_STYLE_DISTINCT_BRANDS } from "../../config/textile-lexicon.ts";
import { familyKey } from "./families.ts";
import type { ExtractedOffer } from "./types.ts";

/**
 * Textile, étape 1 (T-Q1, D-2026-09-29-04) : la référence de style identifie l'article, quels que
 * soient les titres. Ces attributs sont lus dans le titre : leur écart ne contredit pas la référence.
 */
const TEXTILE_TITLE_ONLY_ATTRIBUTES = new Set(["modele", "edition", "millesime", "numero", "longueur", "sous_gamme"]);

/**
 * Références de style d'une offre textile dont la marque en change à chaque génération
 * (`TEXTILE_STYLE_DISTINCT_BRANDS`, D-2026-09-29-05) ; vide pour toute autre offre.
 * La marque est celle de la clé de famille (`marque|type|textile`).
 */
export function distinctStyleReferences(offer: ExtractedOffer): string[] {
  if (offer.categorie !== "textile" || offer.familyKey === null) return [];
  if (!TEXTILE_STYLE_DISTINCT_BRANDS.includes(offer.familyKey.split("|")[0])) return [];
  const out = new Set<string>();
  for (const ref of offer.referencesFabricant) {
    const normalized = normalizeReference(ref.value);
    if (normalized) out.add(normalized);
  }
  return [...out].sort();
}

/** Deux offres d'une marque « à style distinct » aux références connues des deux côtés, sans référence commune. */
function styleReferenceDifference(a: ExtractedOffer, b: ExtractedOffer): Difference | null {
  const ra = distinctStyleReferences(a);
  const rb = distinctStyleReferences(b);
  if (ra.length === 0 || rb.length === 0 || ra.some((r) => rb.includes(r))) return null;
  return { attribut: "reference_style", a: ra.join("+"), b: rb.join("+"), effet: "proche" };
}

export type CompareMethod = "gtin" | "reference" | "signature";

export interface Difference {
  attribut: string;
  a: string | null;
  b: string | null;
  /** `inconnu` : connu d'un seul côté (jamais « identique »). */
  effet: "inconnu" | "proche" | "different";
}

export interface CompareResult {
  niveau: MatchLevel;
  /** Étape qui a établi « identique » ; `null` sinon. */
  methode: CompareMethod | null;
  /** GTIN ou référence partagés mais contradiction des familles ou des attributs. */
  conflit: boolean;
  /** Faux si une des offres n'a pas de famille reconnue (ou catégorie non couverte) et aucun identifiant commun. */
  comparable: boolean;
  differences: Difference[];
}

const SEVERITY: Record<Difference["effet"], number> = { inconnu: 1, proche: 1, different: 2 };

const FAMILY_BY_KEY = new Map(
  [...MODEL_FAMILIES, ...SHOE_FAMILIES, ...ACCESSORY_FAMILIES].map((entry) => [familyKey(entry), entry]),
);

/** Sacs : règle des générations `standard` sans la levée « génération unique par défaut ». */
function defaultSingleGeneration(offer: ExtractedOffer): boolean {
  return offer.categorie === "cordages" || (offer.categorie === "accessoires" && offer.subcategory !== "sacs");
}

/** Attributs comparés (hors `variante`), avec leur rôle : commun + catégorie. */
function discriminantRoles(category: ExtractedOffer["categorie"]): Record<string, AttributeRole> {
  const roles: Record<string, AttributeRole> = {};
  const all = { ...COMMON_ATTRIBUTES, ...(CATEGORY_RULES[category]?.attributes ?? {}) };
  for (const [name, role] of Object.entries(all)) {
    // Marque et famille sont portées par la clé de famille ; la génération a sa règle.
    if (role === "variante" || name === "marque" || name === "famille") continue;
    roles[name] = role;
  }
  return roles;
}

/** Longueurs de garniture (12 m, 12,2 m…) regroupées en une valeur. */
const GARNITURE_METERS = { min: 11, max: 13 };

/**
 * Attributs qui doivent être connus pour dire « identique » : absents des deux côtés, ils ne
 * prouvent rien (paire R1 25 : garnitures Head Rip Control sans jauge écrite, la jauge est un
 * choix de la fiche ; nombre de balles non écrit). Ailleurs, absent des deux côtés = égal.
 */
function requiredAttributes(offer: ExtractedOffer): string[] {
  // Textile : un titre sans nom de gamme lisible ne prouve rien (modèle non identifié).
  if (offer.categorie === "textile") return ["modele"];
  if (offer.categorie === "cordages") return ["jauge", "conditionnement"];
  if (offer.categorie === "accessoires" && offer.subcategory === "balles") return ["lot"];
  return [];
}

/** Noms des attributs discriminants d'une catégorie (pour les attributs canoniques d'un modèle). */
export function discriminantAttributeNames(category: ExtractedOffer["categorie"]): string[] {
  return Object.keys(discriminantRoles(category));
}

/** Valeur d'un attribut sous forme de texte comparable, ou `null` si inconnue. */
function token(offer: ExtractedOffer, name: string): string | null {
  const attr = offer.attributes[name];
  if (attr === undefined) {
    // Lot absent = 1 article, sauf les balles où le nombre n'est pas toujours écrit.
    if (name === "lot" && !(offer.categorie === "accessoires" && offer.subcategory === "balles")) return "1";
    return null;
  }
  const value = String(attr.value).toLowerCase();
  // Garniture : 12 m et 12,2 m sont la même garniture (paire R1 66).
  if (name === "longueur" && offer.categorie === "cordages" && typeof attr.value === "number") {
    if (attr.value >= GARNITURE_METERS.min && attr.value <= GARNITURE_METERS.max) return "12";
  }
  // Plusieurs jauges au choix : seule la première est lue, on ne prétend pas savoir laquelle.
  if (name === "jauge" && offer.alertes.includes("jauges_multiples")) return `${value}*`;
  return value;
}

/** Génération : l'année (si connue) identifie mieux que le libellé (`a2023` ou `lgen 6`). */
function generationToken(offer: ExtractedOffer): string | null {
  const year = offer.attributes.annee?.value;
  const label = offer.attributes.generation?.value;
  if (year !== undefined) return `a${year}`;
  return label === undefined ? null : `l${String(label).toLowerCase()}`;
}

function isSingleGeneration(offer: ExtractedOffer): boolean {
  if (offer.familyKey && FAMILY_BY_KEY.get(offer.familyKey)?.generationUnique) return true;
  return defaultSingleGeneration(offer);
}

function roleFor(category: ExtractedOffer["categorie"], name: string, base: AttributeRole, a: string, b: string) {
  const overrides = CATEGORY_RULES[category]?.attributeValueOverrides?.[name];
  if (!overrides) return base;
  const roles = [overrides[a], overrides[b]].filter((r): r is AttributeRole => r !== undefined);
  return roles.includes("different") ? "different" : roles.includes("proche") ? "proche" : base;
}

/** Raquettes : caractéristiques qui découlent de la version et de la génération chez le fabricant. */
const DERIVED_RACQUET_ATTRIBUTES = ["poids", "tamis", "plan_cordage", "longueur"];

/**
 * C-Q3 (D-2026-09-29-03, « blocage B » de `R4_4_controle.md` §5) : famille, version et génération
 * écrites et égales des deux côtés → une caractéristique connue d'un seul côté ne bloque plus
 * « identique ». Elle reste bloquante si elle est connue des deux côtés et différente.
 */
export function derivedAttributesRelaxed(a: ExtractedOffer, b: ExtractedOffer): boolean {
  if (a.categorie !== "raquettes" || a.familyKey === null || a.familyKey !== b.familyKey) return false;
  const ga = generationToken(a);
  return ga !== null && ga === generationToken(b) && token(a, "version") === token(b, "version");
}

/** Différences d'attributs entre deux offres de même famille (sans les identifiants). */
function attributeDifferences(a: ExtractedOffer, b: ExtractedOffer): Difference[] {
  const category = a.categorie;
  const rules = CATEGORY_RULES[category];
  const out: Difference[] = [];
  const relaxed = derivedAttributesRelaxed(a, b);

  for (const [name, base] of Object.entries(discriminantRoles(category))) {
    const ta = token(a, name);
    const tb = token(b, name);
    if (ta === null && tb === null) {
      if (requiredAttributes(a).includes(name)) out.push({ attribut: name, a: null, b: null, effet: "inconnu" });
      continue;
    }

    if (ta === null || tb === null) {
      if (relaxed && DERIVED_RACQUET_ATTRIBUTES.includes(name)) continue;
      out.push({ attribut: name, a: ta, b: tb, effet: "inconnu" });
      continue;
    }
    if (ta === tb) continue;

    const tolerance = rules.numeric?.[name];
    const na = a.attributes[name]?.value;
    const nb = b.attributes[name]?.value;
    if (tolerance && typeof na === "number" && typeof nb === "number") {
      const gap = Math.abs(na - nb);
      if (gap <= tolerance.variante) continue;
      out.push({ attribut: name, a: ta, b: tb, effet: gap <= tolerance.proche ? "proche" : "different" });
      continue;
    }
    const role = roleFor(category, name, base, ta, tb);
    if (role === "variante") continue;
    out.push({ attribut: name, a: ta, b: tb, effet: role });
  }

  // Attributs « variante » avec exception de valeur (édition Premium des chaussures) :
  // pris en compte seulement quand une des valeurs fait exception.
  for (const [name, overrides] of Object.entries(rules.attributeValueOverrides ?? {})) {
    if (discriminantRoles(category)[name]) continue;
    const ta = a.attributes[name] ? String(a.attributes[name].value).toLowerCase() : null;
    const tb = b.attributes[name] ? String(b.attributes[name].value).toLowerCase() : null;
    if (ta === tb) continue;
    const roleA = ta !== null ? overrides[ta] : undefined;
    const roleB = tb !== null ? overrides[tb] : undefined;
    const role = [roleA, roleB].includes("different") ? "different" : [roleA, roleB].includes("proche") ? "proche" : null;
    if (role === "different" || role === "proche") out.push({ attribut: name, a: ta, b: tb, effet: role });
  }

  return out;
}

function generationDifference(a: ExtractedOffer, b: ExtractedOffer): Difference | null {
  const rule = GENERATION_RULES[CATEGORY_RULES[a.categorie].generationRule];
  const ga = generationToken(a);
  const gb = generationToken(b);
  const asEffet = (level: MatchLevel): Difference["effet"] | null =>
    level === "identique" ? null : level === "proche" ? "proche" : "different";

  if (ga === null && gb === null) {
    if (isSingleGeneration(a) && isSingleGeneration(b)) return null;
    const effet = asEffet(rule.nonEcriteDesDeuxCotes);
    return effet ? { attribut: "generation", a: null, b: null, effet } : null;
  }
  if (ga === null || gb === null) {
    const effet = asEffet(rule.inconnueUnCote);
    return effet ? { attribut: "generation", a: ga, b: gb, effet } : null;
  }
  if (ga === gb) return null;
  // Une année face à un libellé du référentiel sans année : on ne peut pas dire que c'est différent.
  const inconclusive = ga[0] !== gb[0];
  const effet = inconclusive ? "proche" : asEffet(rule.verifieeDifferente);
  return effet ? { attribut: "generation", a: ga, b: gb, effet } : null;
}

function worst(differences: Difference[]): MatchLevel {
  const max = Math.max(0, ...differences.map((d) => SEVERITY[d.effet]));
  return max === 2 ? "different" : max === 1 ? "proche" : "identique";
}

/** Référence normalisée : majuscules et chiffres seulement ; trop courte ou sans chiffre = inutilisable. */
export function normalizeReference(value: string): string | null {
  const ref = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
  return ref.length >= 5 && /\d/.test(ref) ? ref : null;
}

function sharedReference(a: ExtractedOffer, b: ExtractedOffer): boolean {
  const refs = new Set(a.referencesFabricant.map((r) => normalizeReference(r.value)).filter(Boolean));
  return b.referencesFabricant.some((r) => {
    const n = normalizeReference(r.value);
    return n !== null && refs.has(n);
  });
}

function sameBrandOrUnknown(a: ExtractedOffer, b: ExtractedOffer): boolean {
  if (!a.marque || !b.marque) return true;
  return a.marque.toLowerCase() === b.marque.toLowerCase();
}

/**
 * Signature déterministe du modèle : famille + attributs discriminants. Deux offres de
 * même signature sont « identiques » à l'étape 2. Sans génération connue dans une
 * catégorie stricte, ou avec un attribut requis inconnu, l'offre est seule de son modèle
 * (identifiant de l'offre en suffixe).
 * `null` si la famille n'est pas reconnue.
 */
export function signature(offer: ExtractedOffer, dealId: string): string | null {
  if (!offer.familyKey) return null;
  const parts = [offer.familyKey];
  for (const name of Object.keys(discriminantRoles(offer.categorie)).sort()) {
    parts.push(`${name}=${token(offer, name) ?? "-"}`);
  }
  // Attributs « variante » à exception de valeur (édition Premium).
  for (const name of Object.keys(CATEGORY_RULES[offer.categorie].attributeValueOverrides ?? {}).sort()) {
    if (discriminantRoles(offer.categorie)[name]) continue;
    const value = offer.attributes[name] ? String(offer.attributes[name].value).toLowerCase() : null;
    const overrides = CATEGORY_RULES[offer.categorie].attributeValueOverrides![name];
    parts.push(`${name}=${value !== null && overrides[value] ? value : "-"}`);
  }
  const gen = generationToken(offer);
  parts.push(`generation=${gen ?? "-"}`);
  const unverifiable = requiredAttributes(offer).some((name) => token(offer, name) === null);
  // Textile : génération non écrite = même modèle (D-2026-09-27-06) ; la règle ne bloque pas.
  const generationBlocks =
    GENERATION_RULES[CATEGORY_RULES[offer.categorie].generationRule].nonEcriteDesDeuxCotes !== "identique";
  if ((gen === null && generationBlocks && !isSingleGeneration(offer)) || unverifiable) parts.push(`#${dealId}`);
  return parts.join("|");
}

export function compare(a: ExtractedOffer, b: ExtractedOffer): CompareResult {
  const base = { conflit: false, comparable: true, methode: null, differences: [] as Difference[] };
  if (a.categorie !== b.categorie) {
    return { ...base, niveau: "different", differences: [{ attribut: "categorie", a: a.categorie, b: b.categorie, effet: "different" }] };
  }

  const familiesDiffer = a.familyKey !== null && b.familyKey !== null && a.familyKey !== b.familyKey;
  const sameGtin = a.gtin !== null && a.gtin === b.gtin;
  const method: CompareMethod | null = sameGtin ? "gtin" : sharedReference(a, b) && sameBrandOrFamily(a, b) ? "reference" : null;

  // Étape 1 : identifiant partagé. Contradiction franche = conflit, jamais « identique ».
  if (method) {
    const differences =
      a.familyKey && b.familyKey && !familiesDiffer
        ? attributeDifferences(a, b).filter((d) => a.categorie !== "textile" || !TEXTILE_TITLE_ONLY_ATTRIBUTES.has(d.attribut))
        : [];
    const generation = a.familyKey && b.familyKey && !familiesDiffer ? generationDifference(a, b) : null;
    const contradictions = differences.filter((d) => d.effet === "different");
    if (generation?.effet === "different") contradictions.push(generation);
    if (familiesDiffer) {
      return {
        ...base,
        niveau: "proche",
        conflit: true,
        differences: [{ attribut: "famille", a: a.familyKey, b: b.familyKey, effet: "different" }],
      };
    }
    if (contradictions.length > 0) return { ...base, niveau: "proche", conflit: true, differences: contradictions };
    return { ...base, niveau: "identique", methode: method, differences: [] };
  }

  // Étape 2 : même famille, attributs discriminants.
  if (a.familyKey === null || b.familyKey === null) {
    return { ...base, niveau: "different", comparable: false, differences: [] };
  }
  if (familiesDiffer) {
    return { ...base, niveau: "different", differences: [{ attribut: "famille", a: a.familyKey, b: b.familyKey, effet: "different" }] };
  }
  const differences = attributeDifferences(a, b);
  const generation = generationDifference(a, b);
  if (generation) differences.push(generation);
  const style = styleReferenceDifference(a, b);
  if (style) differences.push(style);
  const niveau = worst(differences);
  return { ...base, niveau, methode: niveau === "identique" ? "signature" : null, differences };
}

function sameBrandOrFamily(a: ExtractedOffer, b: ExtractedOffer): boolean {
  return sameBrandOrUnknown(a, b) || (a.familyKey !== null && a.familyKey === b.familyKey);
}
