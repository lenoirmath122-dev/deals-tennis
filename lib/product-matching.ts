const CATEGORY_PREFIXES: Record<string, string[]> = {
  raquettes: ["Raquette de tennis "],
  cordages: ["Cordage de tennis "],
  chaussures: ["Chaussures de tennis ", "Chaussure de tennis "],
  accessoires: ["Balles de tennis Carton ", "Balles de tennis ", "Sac de tennis "],
};

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Extrait le modèle d'un article à partir du titre marchand et de sa marque
 * (déjà connue de façon fiable, ex: `deals.brand`). Ne fait aucune supposition
 * sur la marque elle-même — seul le titre est nettoyé des mentions de marque,
 * de catégorie et de variante de cordage qui ne distinguent pas deux produits
 * différents.
 */
export function extractModel(
  title: string,
  brand: string,
  category: string
): string {
  let model = title;

  for (const prefix of CATEGORY_PREFIXES[category] ?? []) {
    if (model.toLowerCase().startsWith(prefix.toLowerCase())) {
      model = model.slice(prefix.length);
      break;
    }
  }

  const brandPattern = new RegExp(`\\b${escapeRegExp(brand)}\\b`, "i");
  model = model.replace(brandPattern, "");

  model = model.replace(/\bnon\s+cord[ée]e?\b/gi, "");
  model = model.replace(/\bcord[ée]e?\b/gi, "");

  return model.replace(/\s+/g, " ").trim();
}

export interface ProductKey {
  brand: string;
  model: string;
  category: string;
}

/** Clé de rapprochement insensible à la casse pour regrouper deux offres sous le même produit. */
export function normalizeProductKey(key: ProductKey): string {
  return `${key.brand.toLowerCase()}|${key.model.toLowerCase()}|${key.category.toLowerCase()}`;
}
