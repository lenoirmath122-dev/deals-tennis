/**
 * Reconnaissance de la famille d'un titre dans le référentiel (R4.2).
 *
 * Règle du référentiel : famille = alias le plus long trouvé dans le titre
 * normalisé, même marque, même catégorie (`config/model-families.ts`).
 */

import { ACCESSORY_FAMILIES } from "../../config/model-families-accessoires.ts";
import { SHOE_FAMILIES } from "../../config/model-families-chaussures.ts";
import { BRAND_ALIASES, MODEL_FAMILIES, type FamilyEntry } from "../../config/model-families.ts";
import type { DealCategory } from "../../types/database.ts";
import { fullNormalize, phraseRegExp } from "./text.ts";

export interface FamilyMatch {
  entry: FamilyEntry;
  /** Alias trouvé, sous sa forme normalisée. */
  alias: string;
}

interface AliasIndexEntry {
  entry: FamilyEntry;
  alias: string;
  regexp: RegExp;
}

export function familyKey(entry: Pick<FamilyEntry, "brand" | "family" | "category">): string {
  return `${entry.brand}|${entry.family}|${entry.category}`;
}

/** Marques que le référentiel accepte pour cette marque d'offre (cf. `BRAND_ALIASES`). */
function acceptedBrands(brand: string | null, category: DealCategory): { all: boolean; names: Set<string> } {
  const names = new Set<string>();
  const normalized = brand ? fullNormalize(brand) : "";
  if (normalized) names.add(normalized);
  // Marque mal extraite (« SPORTSYSTEM ») : la vraie marque est dans le titre.
  if (!normalized || normalized === "sportsystem") return { all: true, names };
  for (const [key, value] of Object.entries(BRAND_ALIASES)) {
    const parts = key.split("/");
    if (parts.length === 3 && parts[0] === normalized && parts[1] === category) {
      names.add(fullNormalize(value.canonical));
    }
  }
  return { all: false, names };
}

const INDEX_CACHE = new WeakMap<FamilyEntry[], Map<string, AliasIndexEntry[]>>();

function indexFor(category: DealCategory, families: FamilyEntry[]): AliasIndexEntry[] {
  let byCategory = INDEX_CACHE.get(families);
  if (!byCategory) {
    byCategory = new Map();
    INDEX_CACHE.set(families, byCategory);
  }
  let list = byCategory.get(category);
  if (!list) {
    list = [];
    for (const entry of families) {
      if (entry.category !== category) continue;
      for (const raw of entry.aliases) {
        const alias = fullNormalize(raw);
        list.push({ entry, alias, regexp: phraseRegExp(alias) });
      }
    }
    // Alias les plus longs d'abord : le premier qui correspond gagne.
    list.sort((a, b) => b.alias.length - a.alias.length);
    byCategory.set(category, list);
  }
  return list;
}

/**
 * Alias de la famille à retirer du titre avant de lire version, tamis et poids :
 * le plus court présent, pour que « sx300 » laisse la version « 300 » (alias
 * « sx » plutôt que « sx300 »). `text` est normalisé (`fullNormalize`).
 */
export function shortestAliasIn(text: string, entry: FamilyEntry): string | null {
  const found = entry.aliases
    .map((raw) => fullNormalize(raw))
    .filter((alias) => phraseRegExp(alias).test(text))
    .sort((a, b) => a.length - b.length);
  return found[0] ?? null;
}

/** Référentiel de la catégorie : un fichier par catégorie dans `config/` (textile : aucun, R4.5). */
export function familiesFor(category: DealCategory): FamilyEntry[] {
  if (category === "chaussures") return SHOE_FAMILIES;
  if (category === "accessoires") return ACCESSORY_FAMILIES;
  return MODEL_FAMILIES;
}

/**
 * Cherche la famille d'un titre déjà normalisé (`fullNormalize`).
 * `families` permet d'injecter un autre référentiel ; `accept` restreint les
 * familles candidates (accessoires : même sous-catégorie que l'offre, pour
 * qu'un alias court comme « team » ou « court » ne traverse pas les gammes).
 */
export function recognizeFamily(
  normalizedTitle: string,
  brand: string | null,
  category: DealCategory,
  families: FamilyEntry[] = familiesFor(category),
  accept?: (entry: FamilyEntry) => boolean,
): FamilyMatch | null {
  const accepted = acceptedBrands(brand, category);
  for (const { entry, alias, regexp } of indexFor(category, families)) {
    if (!accepted.all && !accepted.names.has(fullNormalize(entry.brand))) continue;
    if (accept && !accept(entry)) continue;
    if (regexp.test(normalizedTitle)) return { entry, alias };
  }
  return null;
}
