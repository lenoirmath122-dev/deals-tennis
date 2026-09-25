const CATEGORY_PREFIXES: Record<string, string[]> = {
  raquettes: ["Raquette de tennis "],
  cordages: ["Cordage de tennis "],
  chaussures: ["Chaussures de tennis ", "Chaussure de tennis "],
  accessoires: ["Balles de tennis Carton ", "Balles de tennis ", "Sac de tennis "],
};

/**
 * Mots de couleur reconnus (français + anglais, les marchands mélangent les deux
 * dans les titres scrappés) vers une forme canonique unique en français. Liste non
 * exhaustive par construction (ex. noms de coloris propriétaires type "Aurora Ink") —
 * une couleur non reconnue reste dans le titre/modèle, voir GAP dédié si besoin.
 */
const COLOR_WORD_MAP: Record<string, string> = {
  noir: "Noir",
  noire: "Noir",
  blanc: "Blanc",
  blanche: "Blanc",
  gris: "Gris",
  grise: "Gris",
  bleu: "Bleu",
  bleue: "Bleu",
  rouge: "Rouge",
  vert: "Vert",
  verte: "Vert",
  jaune: "Jaune",
  orange: "Orange",
  rose: "Rose",
  violet: "Violet",
  violette: "Violet",
  marron: "Marron",
  beige: "Beige",
  turquoise: "Turquoise",
  bordeaux: "Bordeaux",
  kaki: "Kaki",
  corail: "Corail",
  marine: "Marine",
  doré: "Doré",
  dorée: "Doré",
  argenté: "Argenté",
  argentée: "Argenté",
  argent: "Argent",
  multicolore: "Multicolore",
  white: "Blanc",
  black: "Noir",
  grey: "Gris",
  gray: "Gris",
  blue: "Bleu",
  red: "Rouge",
  green: "Vert",
  yellow: "Jaune",
  pink: "Rose",
  purple: "Violet",
  silver: "Argent",
  gold: "Doré",
  brown: "Marron",
};

const CONNECTOR_PATTERN = /\b(and|et)\b/gi;

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function findColorTokens(title: string): { canonical: string; index: number }[] {
  const matches: { canonical: string; index: number }[] = [];

  for (const [word, canonical] of Object.entries(COLOR_WORD_MAP)) {
    const regex = new RegExp(`\\b${escapeRegExp(word)}\\b`, "gi");
    let match: RegExpExecArray | null;
    while ((match = regex.exec(title)) !== null) {
      matches.push({ canonical, index: match.index });
    }
  }

  return matches.sort((a, b) => a.index - b.index);
}

/**
 * Extrait la (les) couleur(s) mentionnée(s) dans le titre, dans leur ordre
 * d'apparition et sans doublon (ex. "White And Black" -> "Blanc Noir"), ou
 * `null` si aucune couleur reconnue n'est présente.
 */
export function extractColor(title: string): string | null {
  const tokens = findColorTokens(title);
  if (tokens.length === 0) {
    return null;
  }

  const seen = new Set<string>();
  const ordered: string[] = [];
  for (const token of tokens) {
    if (!seen.has(token.canonical)) {
      seen.add(token.canonical);
      ordered.push(token.canonical);
    }
  }

  return ordered.join(" ");
}

function stripColorWords(text: string): string {
  let result = text;

  for (const word of Object.keys(COLOR_WORD_MAP)) {
    result = result.replace(new RegExp(`\\b${escapeRegExp(word)}\\b`, "gi"), " ");
  }

  result = result.replace(CONNECTOR_PATTERN, " ");
  // Nettoie les séparateurs devenus orphelins après retrait des couleurs qu'ils reliaient (ex. "White/Brown").
  result = result.replace(/\s*[/&]\s*/g, " ");

  return result;
}

/**
 * Extrait le modèle d'un article à partir du titre marchand et de sa marque
 * (déjà connue de façon fiable, ex: `deals.brand`). Ne fait aucune supposition
 * sur la marque elle-même — seul le titre est nettoyé des mentions de marque,
 * de catégorie, de variante de cordage et de couleur (D-2026-09-23-06 : la
 * couleur n'est pas une clé d'identité produit, voir extractColor) qui ne
 * distinguent pas deux produits différents.
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

  model = stripColorWords(model);

  return model.replace(/\s+/g, " ").trim();
}

export type Gender = "homme" | "femme" | "mixte" | "non_determine";
export type AgeGroup = "adulte" | "enfant";

// Pluriel français inclus (D-2026-09-25-11) : Tennis Point FR utilise
// systématiquement "Hommes"/"Femmes"/"Enfants", que \b seul ne capture pas
// (la limite de mot échoue entre le radical et le "s" final).
const FEMALE_PATTERN = /\b(femmes?|filles?|lady)\b/i;
const MALE_PATTERN = /\b(hommes?|garcons?|garçons?)\b/i;
const CHILD_PATTERN = /\b(enfants?|junior|jr|kids?|filles?|garcons?|garçons?)\b/i;

// Tailles de manche en pouces standard du secteur pour les raquettes juniors
// (19/21/23/25/26 ; 27+ = adulte). Souvent la seule indication d'âge dans le
// titre marchand, sans mot-clé enfant/junior (D-2026-09-25-19). Scopée à la
// catégorie raquettes : un nombre isolé dans ce jeu n'a pas le même sens dans
// les autres catégories (jauge de cordage, pointure, etc.).
const RACQUET_JUNIOR_SIZE_PATTERN = /\b(19|21|23|25|26)\b/;

/**
 * Extrait le sexe visé par l'article à partir du titre marchand (D-2026-09-25-03,
 * lexique vérifié sur les titres réels de prod). `mixte` si les deux groupes de
 * mots-clés sont présents, `non_determine` si aucun.
 */
export function extractGender(title: string): Gender {
  const female = FEMALE_PATTERN.test(title);
  const male = MALE_PATTERN.test(title);

  if (female && male) return "mixte";
  if (female) return "femme";
  if (male) return "homme";
  return "non_determine";
}

/**
 * Extrait la tranche d'âge visée par l'article à partir du titre marchand
 * (D-2026-09-25-03). Pas de valeur `non_determine` : un titre sans mot-clé
 * enfant est considéré adulte par défaut. Pour la catégorie raquettes
 * (D-2026-09-25-19), une taille de manche en pouces junior (19/21/23/25/26)
 * vaut aussi indication enfant, en l'absence de tout mot-clé.
 *
 * `description` (D-2026-09-25-19, étape 2) : second signal optionnel — le
 * texte de la description produit (ex. `body_html` Shopify) est simplement
 * concaténé au titre avant application des mêmes motifs, plutôt que traité
 * séparément. Gratuit pour Tecnifibre/Tennis Point FR (déjà dans le payload
 * JSON récupéré).
 */
export function extractAgeGroup(title: string, category?: string, description?: string): AgeGroup {
  const text = description ? `${title} ${description}` : title;
  if (CHILD_PATTERN.test(text)) return "enfant";
  if (category === "raquettes" && RACQUET_JUNIOR_SIZE_PATTERN.test(text)) return "enfant";
  return "adulte";
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
