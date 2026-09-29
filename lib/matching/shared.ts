/** Briques communes à l'extraction raquettes et cordages (R4.2). */

import type { FamilyEntry, Generation } from "@/config/model-families";
import { extractAgeGroup } from "@/lib/product-matching";
import type { AttributeSource, AttributeValue, ExtractedAttribute, OfferInput } from "./types";
import { fullNormalize, lightNormalize, phraseRegExp, removePhrase } from "./text";

export type Attributes = Record<string, ExtractedAttribute>;

export function setAttr(attrs: Attributes, name: string, value: AttributeValue, source: AttributeSource) {
  attrs[name] = { value, source };
}

/** GTIN valide : 8, 12, 13 ou 14 chiffres (règle R3.12). */
export function cleanGtin(value: string | null | undefined): string | null {
  if (!value) return null;
  const digits = value.trim();
  return /^\d+$/.test(digits) && [8, 12, 13, 14].includes(digits.length) ? digits : null;
}

/**
 * Référence fabricant : `mpn`, sauf recopie de la référence marchand
 * (Tennispro.fr : le `mpn` vaut parfois le `sku` interne, journal R3.12).
 */
export function cleanMpn(offer: OfferInput): string | null {
  const mpn = offer.mpn?.trim();
  if (!mpn) return null;
  if (offer.merchant_sku && mpn === offer.merchant_sku.trim()) return null;
  return mpn;
}

/**
 * Toutes les références fabricant de l'offre, sans doublon.
 *
 * SportSystem : la `reference` de chaque variante est la référence fabricant
 * (vérifié en R4.2 sur la prod, Head / Babolat / Tecnifibre retrouvées dans le
 * `mpn` d'autres marchands). Lue ici plutôt que recopiée dans `mpn` (décision
 * du 2026-09-29, révision de R4-Q7) : une référence par variante (Dunlop :
 * varie avec la taille de manche), aucune écriture en base. `merchant_sku`
 * seulement sans variantes, et jamais s'il concatène plusieurs références.
 */
export function manufacturerReferences(offer: OfferInput): { value: string; source: AttributeSource }[] {
  const out: { value: string; source: AttributeSource }[] = [];
  const add = (value: string | null | undefined, source: AttributeSource) => {
    const v = value?.trim();
    if (v && !out.some((r) => r.value === v)) out.push({ value: v, source });
  };
  add(cleanMpn(offer), "mpn");
  if (offer.marchand === "SportSystem") {
    const variants = offer.raw_attributes?.variants;
    const refs = Array.isArray(variants)
      ? variants.map((v) => (v && typeof v === "object" ? (v as { reference?: unknown }).reference : null))
      : [];
    for (const ref of refs) if (typeof ref === "string") add(ref, "fiche_marchand");
    if (refs.length === 0 && offer.merchant_sku && !/[-/]/.test(offer.merchant_sku)) {
      add(offer.merchant_sku, "fiche_marchand");
    }
  }
  return out;
}

/** Fiche technique SportSystem (`raw_attributes.features`) : nom → valeur. */
export function sportSystemFeatures(offer: OfferInput): Record<string, string> {
  const features = offer.raw_attributes?.features;
  const out: Record<string, string> = {};
  if (!Array.isArray(features)) return out;
  for (const item of features) {
    if (item && typeof item === "object" && "name" in item && "value" in item) {
      out[lightNormalize(String((item as { name: unknown }).name))] = String((item as { value: unknown }).value);
    }
  }
  return out;
}

/** Cherche une fonction de la fiche dont le nom commence par `prefix` (normalisé). */
export function feature(features: Record<string, string>, prefix: string): string | null {
  for (const [name, value] of Object.entries(features)) {
    if (name.startsWith(prefix)) return value;
  }
  return null;
}

/** Lot : « Pack de 2 raquettes », « lot de 3 », « 2 x cordages ». Q12 : lot = produit différent. */
export function extractLot(light: string): { count: number; text: string; assumed: boolean } | null {
  const numbered =
    /\b(?:pack|lot|set|paquet)\s+de\s+(\d{1,3})\b/.exec(light) ??
    /\b(\d{1,3})\s?x\s+(?:raquettes?|cordages?|balles?|grips?|surgrips?)\b/.exec(light);
  if (numbered) {
    const count = Number(numbered[1]);
    if (count >= 2) return { count, text: numbered[0], assumed: false };
  }
  // « Pack de raquettes » sans quantité : au moins 2 articles (paire R1 n° 44, pack de 2).
  const pack = /\b(?:pack|lot)\s+de\s+(?:raquettes?|cordages?)\b/.exec(light);
  if (pack) return { count: 2, text: pack[0], assumed: true };
  return null;
}

/** Cadeau offert (Q12) : « 6 cordages offerts », « sac offert ». Renvoie le texte et le titre sans lui. */
export function extractGift(light: string): { text: string; rest: string } | null {
  const match = /(?:\+\s*|avec\s+)?(?:\d+\s+)?[a-z]+(?:\s+[a-z]+)?\s+offert(?:e|s|es)?\b/.exec(light);
  // « livraison offerte » n'est pas un cadeau joint à l'article.
  if (!match || /livraison|frais de port/.test(match[0])) return null;
  return { text: match[0].trim(), rest: `${light.slice(0, match.index)} ${light.slice(match.index + match[0].length)}` };
}

export type CordedState = "cordee" | "non_cordee";

export function extractCorded(light: string): CordedState | null {
  if (/\bnon\s+corde?e?s?\b/.test(light)) return "non_cordee";
  if (/\bcorde?e?s?\b/.test(light)) return "cordee";
  return null;
}

/**
 * Génération : marqueur listé par le référentiel pour la famille (le plus long
 * l'emporte), sinon motifs génériques (« Gen 11 », « V14 »), sinon année.
 * `text` est le titre normalisé (`fullNormalize`).
 */
export function extractGeneration(
  text: string,
  entry: FamilyEntry | null,
): { generation: Generation | null; label: string | null; year: number | null; marker: string | null } {
  let best: { generation: Generation; marker: string } | null = null;
  for (const generation of entry?.generations ?? []) {
    for (const raw of generation.markers) {
      const marker = fullNormalize(raw);
      if (phraseRegExp(marker).test(text) && (!best || marker.length > best.marker.length)) {
        best = { generation, marker };
      }
    }
  }
  const yearMatch = /(?<![a-z0-9])(20[12]\d)(?![a-z0-9])/.exec(text);
  const yearInTitle = yearMatch ? Number(yearMatch[1]) : null;

  if (best) {
    return {
      generation: best.generation,
      label: best.generation.label,
      year: best.generation.year ?? yearInTitle,
      marker: best.marker,
    };
  }
  const gen = /(?<![a-z0-9])gen(?:eration)?\s?(\d{1,2})(?![a-z0-9])/.exec(text);
  if (gen) return { generation: null, label: `Gen ${gen[1]}`, year: yearInTitle, marker: gen[0] };
  const v = /(?<![a-z0-9])v(\d{1,2})(?: 0)?(?![a-z0-9])/.exec(text);
  if (v) return { generation: null, label: `V${v[1]}`, year: yearInTitle, marker: v[0] };
  if (yearInTitle !== null) return { generation: null, label: String(yearInTitle), year: yearInTitle, marker: yearMatch![0] };
  return { generation: null, label: null, year: null, marker: null };
}

/** Synonymes de version observés (notes du référentiel), avant comparaison. */
const VERSION_SYNONYMS: [RegExp, string][] = [
  [/(?<![a-z0-9])mp lite(?![a-z0-9])/g, "mp l"],
  [/(?<![a-z0-9])mp light(?![a-z0-9])/g, "mp l"],
  [/(?<![a-z0-9])pro hurricane tour(?![a-z0-9])/g, "hurricane"],
  [/(?<![a-z0-9])light(?![a-z0-9])/g, "lite"],
];

export function applyVersionSynonyms(text: string): string {
  return VERSION_SYNONYMS.reduce((acc, [pattern, replacement]) => acc.replace(pattern, replacement), text);
}

/**
 * Version : la plus longue version du référentiel présente dans `text`.
 * Renvoie aussi le texte sans elle, pour ne pas la relire comme tamis ou poids.
 */
export function extractVersion(text: string, entry: FamilyEntry | null): { version: string; rest: string } | null {
  if (!entry?.versions) return null;
  const candidates = [...entry.versions]
    .map((version) => ({ version, normalized: applyVersionSynonyms(fullNormalize(version)) }))
    .sort((a, b) => b.normalized.length - a.normalized.length);
  const haystack = applyVersionSynonyms(text);
  for (const { version, normalized } of candidates) {
    if (phraseRegExp(normalized).test(haystack)) {
      return { version, rest: removePhrase(haystack, normalized) };
    }
  }
  return null;
}

/** Édition nommée (Q7) présente dans le texte. */
export function extractEdition(text: string, entry: FamilyEntry | null): { edition: string; rest: string } | null {
  if (!entry?.editions) return null;
  const candidates = [...entry.editions]
    .map((edition) => ({ edition, normalized: fullNormalize(edition) }))
    .sort((a, b) => b.normalized.length - a.normalized.length);
  for (const { edition, normalized } of candidates) {
    if (phraseRegExp(normalized).test(text)) return { edition, rest: removePhrase(text, normalized) };
  }
  return null;
}

export function ageGroupOf(title: string, entry: FamilyEntry | null, category: string): "adulte" | "enfant" {
  if (entry?.junior) return "enfant";
  return extractAgeGroup(title, category);
}

/** Mots retirés d'un titre pour lister les termes non reconnus (marchands : préfixes de catégorie). */
const NOISE_WORDS = new Set([
  "raquette", "raquettes", "cordage", "cordages", "bobine", "pack", "tennis", "de", "du", "la", "le", "les", "des", "et",
  "en", "pour", "avec", "gr", "g", "cordee", "cordees", "non", "competition", "rouleau", "metres", "metre", "m", "mm",
  "a", "the", "and", "for", "of", "new", "raquete",
  "chaussure", "chaussures", "balle", "balles", "sac", "grip", "surgrip", "antivibrateur", "accessoire", "homme",
  "hommes", "femme", "femmes", "men", "women", "toutes", "surfaces", "surface", "terre", "battue", "junior", "enfant",
]);

export function residualTerms(title: string, brand: string | null): string[] {
  const brandWords = new Set(brand ? fullNormalize(brand).split(" ") : []);
  return fullNormalize(title)
    .split(" ")
    .filter((word) => word && !NOISE_WORDS.has(word) && !brandWords.has(word) && !/^\d+$/.test(word));
}
