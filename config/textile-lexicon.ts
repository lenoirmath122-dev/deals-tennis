/**
 * Lexique du textile pour le moteur de rapprochement (R4.5-a).
 *
 * Source : `cadrage_deals-tennis/R4_5_cadrage.md` (§3.2, D-2026-09-29-04) et relecture des titres
 * réels de la prod (2 829 offres `active` + `tracked`, 2026-09-29, lecture seule).
 *
 * Il n'y a pas de référentiel de familles pour le textile (décision Q10) : le « modèle » est lu
 * dans le titre, en retirant tout ce qui n'est pas le nom de la gamme (type, marque, genre,
 * coloris, saison, mots neutres, marqueurs). Tout mot qui reste fait partie du nom du modèle :
 * un mot inconnu bloque « identique » (principe R3), il n'est jamais deviné neutre.
 *
 * Toutes les valeurs sont écrites sous la forme de `fullNormalize` : minuscules, sans accents,
 * ponctuation remplacée par une espace. Plusieurs mots = suite de mots.
 */

/** Types de vêtements (liste fermée, §3.2). `weak` : indice faible, ne l'emporte jamais sur un type sûr. */
export const TEXTILE_TYPES = [
  "tshirt",
  "haut_manches_longues",
  "debardeur",
  "crop_top",
  "polo",
  "jupe",
  "jupe_short",
  "short",
  "robe",
  "sweat",
  "sweat_capuche",
  "veste",
  "gilet",
  "pantalon",
  "survetement",
  "legging",
  "collant",
  "corsaire",
  "calecon",
  "brassiere",
  "chaussettes",
  "casquette",
  "visiere",
  "bandeau",
  "poignet",
  "manchon",
] as const;
export type TextileType = (typeof TEXTILE_TYPES)[number];

export const TEXTILE_TYPE_PHRASES: Record<TextileType, string[]> = {
  tshirt: ["t shirt", "tee shirt", "tshirt", "tee", "shirt", "maillot"],
  haut_manches_longues: ["haut manches longues", "t shirt manches longues", "manches longues", "long sleeve", "longsleeve", "ls"],
  debardeur: ["debardeur", "tank top", "tank", "singlet", "muscle tank"],
  crop_top: ["crop top", "cropped top"],
  polo: ["polo shirt", "polo"],
  jupe: ["jupe", "skirt", "skrt"],
  jupe_short: ["jupe short", "jupe culotte", "skort", "skorts"],
  short: ["short", "shorts", "shrt", "bermuda", "bermudas", "shorty"],
  robe: ["robe", "dress"],
  sweat: ["sweat shirt", "sweatshirt", "sweat", "sweater", "pull", "pullover", "fleece top"],
  sweat_capuche: ["sweat a capuche", "sweat capuche", "hood sweat", "hoodie", "hoody", "sweat hood"],
  veste: ["veste de survetement", "veste", "jacket", "blouson", "coupe vent", "windbreaker"],
  gilet: ["gilet", "cardigan"],
  pantalon: ["pantalon de survetement", "pantalon", "pant", "pants", "jogging", "jogger", "joggers", "trousers"],
  survetement: [],
  legging: ["legging", "leggings"],
  collant: ["collant", "collants", "tight", "tights"],
  corsaire: ["corsaire", "capri", "scapri"],
  calecon: ["calecon", "calecons", "boxer", "boxers"],
  brassiere: ["soutien gorge sport", "soutien gorge", "brassiere", "sports bra", "bra"],
  chaussettes: ["chaussettes", "chaussette", "socks", "sock"],
  casquette: ["casquette", "cap"],
  visiere: ["visiere", "visor"],
  bandeau: ["bandeau", "headband", "bandana"],
  poignet: ["poignet", "poignets", "wristband", "wristbands"],
  manchon: ["arm sleeve", "manchon", "manchons"],
};

/**
 * Indices faibles : un type qui n'est écrit qu'ainsi est retenu, mais il cède devant tout type sûr
 * (« Top » seul = t-shirt, Nike « Advantage Top » ; « capuche » seul ; « survêtement » seul).
 */
export const TEXTILE_WEAK_PHRASES: Record<string, TextileType> = {
  top: "tshirt",
  capuche: "sweat_capuche",
  survetement: "survetement",
};

/** Type plus précis qui l'emporte quand les deux sont écrits (« T-shirt … Ls » = manches longues). */
export const TEXTILE_REFINES: Partial<Record<TextileType, TextileType[]>> = {
  tshirt: ["haut_manches_longues"],
  sweat: ["sweat_capuche"],
  jupe: ["jupe_short"],
  // R4.5-b : Tecnifibre écrit « Pantalon de tennis … Legging » (libellé de rayon puis vrai type).
  pantalon: ["legging", "collant", "corsaire"],
};

/**
 * Marchands dont le type de tête est un libellé de rayon et où le vrai type est écrit en dernier
 * (Sport 2000 : « T-shirt Homme M NKCT DF ADVTG POLO » = un polo).
 */
export const TEXTILE_TYPE_LAST_MERCHANTS = ["Sport 2000"];

/** Marchand dont le coloris suit le genre, après un tiret (« … Femmes - bleu foncé, blanc »). */
export const TEXTILE_COLOR_AFTER_GENDER_MERCHANTS = ["Tennis Point FR"];

// ── Genre et âge ─────────────────────────────────────────────────────────────

export const TEXTILE_GENDER_WORDS = {
  homme: ["homme", "hommes", "men", "man", "mens", "masculin"],
  femme: ["femme", "femmes", "women", "woman", "womens", "lady", "ladies", "dame", "dames", "feminin"],
  mixte: ["unisexe", "unisex", "mixte"],
} as const;

/** Garçon / fille : genre + âge enfant. */
export const TEXTILE_YOUTH_GENDER_WORDS = {
  homme: ["garcon", "garcons", "boy", "boys"],
  femme: ["fille", "filles", "girl", "girls"],
} as const;

/** Âge enfant sans genre. */
export const TEXTILE_JUNIOR_WORDS = ["junior", "juniors", "enfant", "enfants", "kid", "kids", "jeune", "jeunes"];

/** Codes de genre d'une lettre chez Sport 2000 (« M NKCT … », « W NKCT … », « G NKCT … »). */
export const TEXTILE_GENDER_LETTER_CODES = ["m", "w", "g", "b"];

// ── Coloris, saisons ─────────────────────────────────────────────────────────

/** Coloris (français et anglais des titres), retirés du nom et gardés comme variante. */
export const TEXTILE_COLOR_WORDS = [
  "blanc", "blanche", "blancs", "noir", "noire", "noirs", "bleu", "bleue", "bleus", "rouge", "rouges", "vert", "verte",
  "verts", "vertes", "gris", "grise", "grises", "jaune", "jaunes", "orange", "oranges", "rose", "roses", "violet",
  "violette", "violets", "marron", "beige", "creme", "ecru", "kaki", "olive", "marine", "turquoise", "mauve", "lilas",
  "sauge", "corail", "ocre", "aqua", "azur", "cardinal", "bordeaux", "fuchsia", "argent", "dore", "petrol", "petrole",
  "anthracite", "abricot", "lemon", "citron", "menthe", "mint", "berry", "silver", "white", "black", "blue", "red",
  "green", "grey", "gray", "yellow", "pink", "purple", "brown", "navy", "multicouleur", "multicolore", "vieux", "fonce",
  "fonces", "clair", "claire", "clairs", "fluo", "vif", "pale", "ciel", "royal", "sable", "camel", "taupe", "cerise",
  "framboise", "peche", "saumon", "lavande", "indigo", "cobalt", "ivoire", "carbone", "charbon", "acier", "glace",
  "bronze", "casse", "nuit", "coloris", "couleur", "couleurs",
];

/** Saisons et collections : gardées comme variante, jamais comparées (D-2026-09-27-06). */
export const TEXTILE_SEASON_WORDS = [
  "printemps", "automne", "ete", "hiver", "spring", "summer", "fall", "winter", "collection",
];

// ── Mots neutres ─────────────────────────────────────────────────────────────

/** Suites de mots neutres, retirées avant tout (technologies de tissu, mentions de coupe). */
export const TEXTILE_NEUTRAL_PHRASES = [
  "vetement de tennis",
  "accessoire de tennis",
  "de tennis",
  "dri fit",
  "dry fit",
  "therma fit",
  "with built in bra",
  "avec soutien gorge integre",
  "avec shorty integre",
  "shorty integre",
  "3 stripes",
  "heat rdy",
];

/** Mots neutres : ils n'identifient pas un modèle et sont retirés du nom. */
export const TEXTILE_NEUTRAL_WORDS = [
  // Liaison
  "de", "du", "des", "la", "le", "les", "l", "un", "une", "et", "ou", "avec", "sans", "pour", "en", "au", "aux", "a",
  "the", "and", "for", "of",
  // Généralités des titres marchands
  "tennis", "court", "vetement", "vetements", "accessoire", "accessoires",
  // Tissus et technologies (Nike, adidas)
  "df", "nkct", "nikecourt", "mnk", "aeroready", "climacool", "climalite", "primeblue", "primegreen", "3stripes", "3s",
  // Écritures de rayon propres à certains marchands
  "sw",
  // « Pantalon survêtement » : le type est le pantalon, « survêtement » le précise (indice faible seulement seul)
  "survetement",
];

/** Suites retirées seulement avec la marque (SportSystem : « Tecnifibre Tech » est le tissu, pas la gamme). */
export const TEXTILE_BRAND_NEUTRAL_PHRASES: Record<string, string[]> = {
  tecnifibre: ["tecnifibre tech"],
};

/** Abréviations Nike de Sport 2000 (`M NKCT DF ADVTG POLO`), lues avant tout. */
export const TEXTILE_ABBREVIATIONS: Record<string, string> = {
  advtg: "advantage",
  adv: "advantage",
  vctry: "victory",
};

/** Suites à souder en un mot avant la lecture du type (« cap sleeve » n'est pas une casquette). */
export const TEXTILE_GLUED_PHRASES: Record<string, string> = {
  "cap sleeve": "capsleeve",
};

// ── Marques ──────────────────────────────────────────────────────────────────

/**
 * Écritures de la marque dans les titres, par marque normalisée de l'offre. Toute autre marque
 * est retirée telle qu'écrite dans `marque`.
 */
export const TEXTILE_BRAND_SPELLINGS: Record<string, string[]> = {
  jlindeberg: ["jlindeberg", "j lindeberg"],
  "under armour": ["under armour", "ua"],
  "k swiss": ["k swiss", "kswiss", "ks"],
  "le coq sportif": ["le coq sportif", "lcs"],
  "sergio tacchini": ["sergio tacchini"],
  "bjorn borg": ["bjorn borg", "b borg"],
  "bidi badu": ["bidi badu"],
  "roland garros": ["roland garros"],
};

// ── Marqueurs ────────────────────────────────────────────────────────────────

/**
 * Éditions et collections de tournoi ou de joueur : écrites d'un seul côté → « proche » (T-Q3,
 * D-2026-09-29-04, comme « RG »). Clé = valeur canonique ; valeurs = écritures.
 */
export const TEXTILE_EDITIONS: Record<string, string[]> = {
  rg: ["rg", "roland garros"],
  londres: ["londres", "london", "wimbledon"],
  melbourne: ["melbourne", "open d australie", "australie", "australian open"],
  "new york": ["new york", "us open", "ny", "us series", "flushing"],
  miami: ["miami"],
  paris: ["paris"],
  turin: ["turin"],
  dubai: ["dubai"],
  madrid: ["madrid"],
  rome: ["rome"],
  shanghai: ["shanghai"],
  "indian wells": ["indian wells"],
  "monte carlo": ["monte carlo"],
  "euro clay": ["euro clay"],
  "asia tour": ["asia tour"],
  // Joueurs et créateurs associés à une capsule
  djokovic: ["djokovic"],
  sinner: ["sinner", "jannik"],
  alcaraz: ["carlos alcaraz", "alcaraz"],
  nadal: ["nadal", "rafa"],
  zverev: ["zverev"],
  tsitsipas: ["tsitsipas"],
  aliassime: ["aliassime", "auger aliassime", "auger"],
  magugu: ["thebe magugu", "magugu"],
};

/** Chiffres romains lus comme un numéro de génération (« Tie Break II », « Tech IV »). */
export const TEXTILE_ROMAN_NUMERALS: Record<string, number> = {
  ii: 2,
  iii: 3,
  iv: 4,
  vi: 6,
  vii: 7,
  viii: 8,
  ix: 9,
};

// ── Références fabricant ─────────────────────────────────────────────────────

/**
 * Marques dont la partie « style » de la référence (avant le premier tiret) identifie l'article,
 * vérifiée sur les données de prod le 2026-09-29 : 15 modèles se retrouvent chez deux marchands,
 * tous justes (adidas JG0994, Babolat 3MP2011, Head 811379, Lacoste TH8917, Nike CV2545…). Une
 * marque absente de la liste n'est pas rapprochée par référence (Tecnifibre : la référence
 * `25POWAMA5` / `25POWAMA51` mêle style, coloris et taille ; règle à établir avant de l'écrire).
 */
export const TEXTILE_STYLE_REFERENCE_BRANDS = ["adidas", "babolat", "head", "lacoste", "nike"];

/**
 * Marques dont deux références de style différentes désignent deux articles différents
 * (D-2026-09-29-05) : Nike change de référence à chaque génération (Flex CV3048 / Dri-FIT FD5380).
 * Deux offres de ces marques aux références connues et différentes sont « proches », jamais
 * « identiques », et un modèle ne contient jamais deux références de style. adidas est exclue :
 * son code désigne un coloris (§3.1 de `R4_5_cadrage.md`). Une autre marque ne s'ajoute qu'après
 * vérification sur les données.
 */
export const TEXTILE_STYLE_DISTINCT_BRANDS = ["nike"];

/**
 * Marchands dont le SKU est la référence fabricant (Sport 2000 : code fabricant ; Head : numéro
 * d'article ; Babolat : référence Babolat). Ailleurs le SKU est interne (Tennis Point FR,
 * Tennispro.fr) ou d'une forme non établie (Tecnifibre).
 */
export const TEXTILE_SKU_IS_REFERENCE_MERCHANTS = ["Sport 2000", "Head", "Babolat"];

// ── Étape 3 : file de revue (R4.5-b) ─────────────────────────────────────────

/**
 * Mots qui font un autre modèle (jugés distinctifs en revue) : une paire dont le mot en plus en fait
 * partie n'entre pas dans la file. Chaque décision de Mathieu enrichit cette liste (T-Q4).
 */
export const TEXTILE_REVIEW_DISTINCTIVE_WORDS = ["pleat", "pro", "slam", "ann"];

/**
 * Mots probablement secondaires (jugés neutres en revue) : la paire remonte en haut de la file.
 * Vide au départ ; à remplir à partir de la relecture, puis à basculer dans `TEXTILE_NEUTRAL_WORDS`.
 */
export const TEXTILE_REVIEW_SOFT_WORDS: string[] = [];
