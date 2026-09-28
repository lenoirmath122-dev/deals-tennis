/**
 * Référentiel de familles de modèles — chaussures (R2, passe 2 — PROPOSITION).
 *
 * Source : §7 du cadrage rapprochement, Q10 de D-2026-09-28-02 (passe R2
 * chaussures + accessoires avant R3). Méthode et questions Q13-Q20 :
 * `cadrage_deals-tennis/R2_referentiel.md` §7.
 *
 * Statut : proposé par Claude Code le 2026-09-28 à partir des titres réels en
 * base (898 offres chaussures, toutes offres), à valider par Mathieu. Aucune
 * fiche marchand consultée : les sites marchands sont bloqués par la politique
 * réseau de la session cloud qui a produit ce fichier. Aucun code ne le lit
 * encore (R4).
 *
 * Mêmes conventions que `model-families.ts` (aliases normalisés, alias le plus
 * long, générations seulement observées). Particularités des chaussures :
 * - le **numéro** qui suit le nom est une génération (Barricade 13 / 14,
 *   Gel-Resolution X, Rush Pro 4.5 / 5) : règle des générations standard
 *   (D-2026-09-26-01), voir Q14 ;
 * - la **surface** est un attribut « proche » (Q3), jamais une version ;
 * - le **genre** et l'**âge** (junior, GS, K, Kid, Jr) sont « différent » ;
 * - les **éditions joueur ou premium** sont listées en `editions` (Q15).
 */

import type { FamilyEntry } from "./model-families";

/** Marqueurs de surface lus dans les titres (attribut `surface`, proche). */
export const SHOE_SURFACE_MARKERS: Record<string, string[]> = {
  terre_battue: ["terre battue", "clay", "cly", "oc", "omni clay"],
  toutes_surfaces: ["toutes surfaces", "all court", "ac", "hc", "hard court"],
  gazon: ["gazon", "grass"],
  gazon_synthetique: ["sand grass", "omni", "moquette"],
  padel: ["padel"],
};

/** Marqueurs de genre (attribut `genre`, différent). */
export const SHOE_GENDER_MARKERS: Record<string, string[]> = {
  homme: ["homme", "hommes", "men", "m"],
  femme: ["femme", "femmes", "women", "lady", "w"],
};

/** Marqueurs junior (attribut `age_group`, différent). */
export const SHOE_JUNIOR_MARKERS = ["junior", "jr", "enfant", "enfants", "kid", "kids", "gs", "k", "c", "boy", "girl", "garcon", "fille", "velcro"];

/** Marqueurs de largeur (attribut `largeur`, différent). */
export const SHOE_WIDTH_MARKERS = ["wide", "pieds larges", "large"];

/**
 * Chaussures de ville ou de loisir vues dans la catégorie (Q13) : pas de
 * famille proposée tant que leur place dans le catalogue n'est pas tranchée.
 */
export const SHOE_LIFESTYLE_MARKERS = ["stan smith", "breaknet", "grand court", "advantage", "baskets", "sneakers", "lifestyle"];

const TITRES = "titres en base (2026-09-28)";

export const SHOE_FAMILIES: FamilyEntry[] = [
  // ───────────────────────────── adidas ─────────────────────────────
  {
    brand: "adidas",
    category: "chaussures",
    family: "Adizero Ubersonic",
    aliases: ["adizero ubersonic", "ubersonic"],
    generations: [{ label: "5", markers: ["5"], source: TITRES }],
    editions: ["Pegula"],
    statut: "observe",
    notes: ["« Junior Ubersonic » et « Ubersonic Kid » : ligne junior (âge différent)."],
  },
  { brand: "adidas", category: "chaussures", family: "Adizero Cybersonic", aliases: ["adizero cybersonic", "cybersonic"], generations: [{ label: "2", markers: ["2"], source: TITRES }], statut: "observe" },
  {
    brand: "adidas",
    category: "chaussures",
    family: "Defiant Speed",
    aliases: ["defiant speed", "dfiant speed"],
    generations: [{ label: "2", markers: ["2"], source: TITRES }],
    editions: ["Zverev"],
    statut: "observe",
    notes: ["« Dfiant Speed 2 » : faute de frappe d'un marchand, gardée en alias."],
  },
  {
    brand: "adidas",
    category: "chaussures",
    family: "Barricade",
    aliases: ["barricade"],
    generations: [
      { label: "13", markers: ["13"], source: TITRES },
      { label: "14", markers: ["14"], source: TITRES },
    ],
    editions: ["Tsitsipas", "Pegula"],
    statut: "a_confirmer",
    notes: [
      "« Barricade Leather 13 » et « ASMC Barricade » (adidas by Stella McCartney) : version ou édition ? À vérifier sur les fiches (Q16).",
      "« Barricade pieds larges » : largeur différente.",
    ],
  },
  { brand: "adidas", category: "chaussures", family: "Courtjam Control", aliases: ["courtjam control"], generations: [{ label: "3", markers: ["3"], source: TITRES }], statut: "observe" },
  { brand: "adidas", category: "chaussures", family: "Solematch Control", aliases: ["solematch control"], generations: [{ label: "2", markers: ["2"], source: TITRES }], statut: "observe" },
  { brand: "adidas", category: "chaussures", family: "Courtflash Speed", aliases: ["courtflash speed"], generations: [{ label: "2", markers: ["2"], source: TITRES }], statut: "observe" },
  {
    brand: "adidas",
    category: "chaussures",
    family: "Courtflash",
    aliases: ["courtflash"],
    excludes: ["courtflash speed"],
    statut: "observe",
    notes: ["Surtout junior (« Courtflash K », « Courtflash Kid Velcro ») ; « CF » = Cloudfoam, à confirmer."],
  },
  {
    brand: "adidas",
    category: "chaussures",
    family: "Gamecourt",
    aliases: ["gamecourt"],
    generations: [
      { label: "2", markers: ["2"], source: TITRES },
      { label: "3", markers: ["3"], source: TITRES },
    ],
    statut: "observe",
  },
  {
    brand: "adidas",
    category: "chaussures",
    family: "Avacourt",
    aliases: ["avacourt"],
    generations: [
      { label: "2", markers: ["2"], source: TITRES },
      { label: "3", markers: ["3"], source: TITRES },
    ],
    statut: "observe",
    notes: ["« Avacourt3 » (collé) : la normalisation doit séparer lettres et chiffres."],
  },
  { brand: "adidas", category: "chaussures", family: "Avaflash", aliases: ["avaflash"], generations: [{ label: "2", markers: ["2"], source: TITRES }], statut: "observe" },
  { brand: "adidas", category: "chaussures", family: "Avaluxe", aliases: ["avaluxe"], statut: "observe" },
  { brand: "adidas", category: "chaussures", family: "Game Spec", aliases: ["game spec", "gamespec"], generations: [{ label: "2", markers: ["2"], source: TITRES }], statut: "observe" },
  { brand: "adidas", category: "chaussures", family: "Stella Court", aliases: ["stella court"], statut: "observe" },
  { brand: "adidas", category: "chaussures", family: "Netcourt", aliases: ["netcourt"], junior: true, statut: "observe" },

  // ───────────────────────────── Asics ─────────────────────────────
  {
    brand: "Asics",
    category: "chaussures",
    family: "Gel-Resolution",
    aliases: ["gel resolution"],
    generations: [{ label: "X", markers: ["x"], source: TITRES }],
    editions: ["Night Energy", "Open d'Australie"],
    statut: "observe",
    notes: ["« GS » = junior (Grade School)."],
  },
  {
    brand: "Asics",
    category: "chaussures",
    family: "Gel-Challenger",
    aliases: ["gel challenger"],
    generations: [
      { label: "14", markers: ["14"], source: TITRES },
      { label: "15", markers: ["15"], source: TITRES },
    ],
    statut: "observe",
  },
  { brand: "Asics", category: "chaussures", family: "Gel-Dedicate", aliases: ["gel dedicate"], generations: [{ label: "8", markers: ["8"], source: TITRES }], statut: "observe" },
  {
    brand: "Asics",
    category: "chaussures",
    family: "Gel-Game",
    aliases: ["gel game"],
    generations: [
      { label: "9", markers: ["9"], source: TITRES },
      { label: "10", markers: ["10"], source: TITRES },
    ],
    statut: "observe",
    notes: ["Surtout junior (« GS »). À ne pas confondre avec « Game FF »."],
  },
  {
    brand: "Asics",
    category: "chaussures",
    family: "Game FF",
    aliases: ["game ff"],
    excludes: ["gel game"],
    statut: "observe",
    notes: ["« Game FF Clay OC » : OC = Omni Clay, marqueur de surface."],
  },
  { brand: "Asics", category: "chaussures", family: "Court FF", aliases: ["court ff"], generations: [{ label: "3", markers: ["3"], source: TITRES }], statut: "observe" },
  {
    brand: "Asics",
    category: "chaussures",
    family: "Solution Speed FF",
    aliases: ["gel solution speed ff", "solution speed ff"],
    generations: [
      { label: "3", markers: ["3"], source: TITRES },
      { label: "4", markers: ["4"], source: TITRES },
    ],
    editions: ["Night Energy"],
    statut: "observe",
    notes: ["Le préfixe « Gel » est parfois écrit, parfois non : même famille."],
  },
  { brand: "Asics", category: "chaussures", family: "Solution Swift FF", aliases: ["gel solution swift ff", "solution swift ff"], generations: [{ label: "2", markers: ["2"], source: TITRES }], statut: "observe" },

  // ───────────────────────────── Babolat ─────────────────────────────
  {
    brand: "Babolat",
    category: "chaussures",
    family: "Jet Tere",
    aliases: ["jet tere"],
    generations: [{ label: "2", markers: ["2"], source: TITRES }],
    editions: ["Wimbledon"],
    statut: "a_confirmer",
    notes: ["« Jet Tere 2 Premium » : version ou édition ? À vérifier (Q16)."],
  },
  {
    brand: "Babolat",
    category: "chaussures",
    family: "Jet Mach",
    aliases: ["jet mach"],
    generations: [
      { label: "3", markers: ["3"], source: TITRES },
      { label: "4", markers: ["4"], source: TITRES },
    ],
    editions: ["Wimbledon", "Spectra"],
    statut: "observe",
  },
  { brand: "Babolat", category: "chaussures", family: "Jet Viva", aliases: ["jet viva"], statut: "observe" },
  {
    brand: "Babolat",
    category: "chaussures",
    family: "SFX",
    aliases: ["sfx"],
    generations: [
      { label: "4", markers: ["4"], source: TITRES },
      { label: "Evo", markers: ["evo"], source: TITRES },
    ],
    statut: "a_confirmer",
    notes: ["« SFX 4 » et « SFX Evo » (« SFX Evo 2025 ») : deux générations ou deux lignes ? À vérifier (Q16)."],
  },
  {
    brand: "Babolat",
    category: "chaussures",
    family: "Propulse",
    aliases: ["propulse"],
    versions: ["Fury", "Blast", "Storm"],
    generations: [{ label: "3", markers: ["3"], source: "titres « Propulse Fury 3 », « Propulse Junior 3 AC »" }],
    statut: "observe",
    notes: ["« Propulse » sans version : surtout junior (« Propulse AC Junior Boy »)."],
  },
  { brand: "Babolat", category: "chaussures", family: "Pulsion", aliases: ["pulsion"], junior: true, statut: "observe", notes: ["« Pulsion All Court Kid » : junior."] },
  { brand: "Babolat", category: "chaussures", family: "Sensa", aliases: ["sensa"], statut: "observe" },
  { brand: "Babolat", category: "chaussures", family: "Movea", aliases: ["movea"], statut: "observe" },

  // ───────────────────────────── Diadora, Fila, Joma ─────────────────────────────
  { brand: "Diadora", category: "chaussures", family: "Blushield Torneo", aliases: ["blushield torneo"], generations: [{ label: "3", markers: ["3"], source: TITRES }], statut: "observe" },
  {
    brand: "Diadora",
    category: "chaussures",
    family: "Speed Blushield Fly",
    aliases: ["speed blushield fly"],
    generations: [
      { label: "4 +", markers: ["4 +"], source: TITRES },
      { label: "5", markers: ["5"], source: TITRES },
    ],
    excludes: ["blushield torneo"],
    statut: "observe",
  },
  {
    brand: "Diadora",
    category: "chaussures",
    family: "B.Icon",
    aliases: ["b icon", "bicon"],
    generations: [
      { label: "2", markers: ["2"], source: TITRES },
      { label: "3", markers: ["3"], source: TITRES },
    ],
    statut: "observe",
  },
  {
    brand: "Diadora",
    category: "chaussures",
    family: "Speed Challenge",
    aliases: ["s challenge", "speed challenge"],
    generations: [
      { label: "5 SL", markers: ["5 sl"], source: TITRES },
      { label: "6 SL", markers: ["6 sl"], source: TITRES },
    ],
    statut: "a_confirmer",
    notes: ["« S. Challenge » lu comme « Speed Challenge » : à confirmer."],
  },
  {
    brand: "Diadora",
    category: "chaussures",
    family: "Trofeo",
    aliases: ["trofeo"],
    generations: [
      { label: "3", markers: ["3"], source: TITRES },
      { label: "4", markers: ["4"], source: TITRES },
    ],
    statut: "observe",
  },
  { brand: "Fila", category: "chaussures", family: "Axilus", aliases: ["axilus"], versions: ["FX"], generations: [{ label: "3", markers: ["3"], source: TITRES }], statut: "observe" },
  { brand: "Fila", category: "chaussures", family: "Campo", aliases: ["campo"], statut: "observe" },
  { brand: "Fila", category: "chaussures", family: "Premio", aliases: ["premio"], statut: "observe" },
  { brand: "Joma", category: "chaussures", family: "Electric", aliases: ["electric"], statut: "observe" },
  { brand: "Joma", category: "chaussures", family: "Rapid", aliases: ["rapid"], statut: "observe" },
  { brand: "Joma", category: "chaussures", family: "Roland", aliases: ["roland lady", "roland"], statut: "observe", notes: ["« Lady » = femme (genre)."] },
  { brand: "Joma", category: "chaussures", family: "Set", aliases: ["set lady"], statut: "observe" },
  { brand: "Joma", category: "chaussures", family: "Ace", aliases: ["ace"], statut: "observe" },

  // ───────────────────────────── Head ─────────────────────────────
  {
    brand: "Head",
    category: "chaussures",
    family: "Sprint",
    aliases: ["sprint"],
    versions: ["Pro", "Team", "Court", "Evo", "Velcro"],
    generations: [
      { label: "3.0", markers: ["3 0", "3.0"], source: TITRES },
      { label: "4.0", markers: ["4 0", "4.0"], source: TITRES },
    ],
    statut: "observe",
    notes: ["« Sprint Velcro » : junior probable (fermeture velcro)."],
  },
  {
    brand: "Head",
    category: "chaussures",
    family: "Revolt",
    aliases: ["revolt"],
    versions: ["Pro", "Court", "Evo"],
    generations: [
      { label: "4.5", markers: ["4 5", "4.5"], source: TITRES },
      { label: "5.0", markers: ["5 0", "5.0"], source: TITRES },
    ],
    statut: "observe",
  },
  { brand: "Head", category: "chaussures", family: "Endure Pro", aliases: ["endure pro"], versions: ["BOA"], statut: "observe", notes: ["« BOA » (système de laçage) classé en version : à confirmer."] },

  // ───────────────────────────── K-Swiss ─────────────────────────────
  { brand: "K-Swiss", category: "chaussures", family: "Express Light", aliases: ["express light"], generations: [{ label: "3", markers: ["3"], source: TITRES }], statut: "observe" },
  {
    brand: "K-Swiss",
    category: "chaussures",
    family: "Court Express",
    aliases: ["court express"],
    versions: ["Strap"],
    generations: [{ label: "2", markers: ["2"], source: TITRES }],
    statut: "observe",
    notes: ["« Omni » = marqueur de surface ; « Strap » (scratch) = junior probable."],
  },
  {
    brand: "K-Swiss",
    category: "chaussures",
    family: "Hypercourt",
    aliases: ["hypercourt"],
    versions: ["Express", "Supreme", "Pinnacle"],
    generations: [
      { label: "2", markers: ["2"], source: TITRES },
      { label: "3", markers: ["3"], source: TITRES },
    ],
    statut: "observe",
  },
  {
    brand: "K-Swiss",
    category: "chaussures",
    family: "Ultrashot",
    aliases: ["ultrashot"],
    versions: ["Light", "Team"],
    generations: [
      { label: "2", markers: ["2"], source: "titre « Ultrashot Team 2 »" },
      { label: "4", markers: ["4"], source: "titre « Ultrashot 4 »" },
    ],
    statut: "observe",
  },

  // ───────────────────────────── Lacoste, Lotto, Mizuno ─────────────────────────────
  { brand: "Lacoste", category: "chaussures", family: "AG-LT", aliases: ["ag lt"], versions: ["Lite", "Pro", "Ultra"], editions: ["Medvedev", "RG"], statut: "observe" },
  {
    brand: "Lotto",
    category: "chaussures",
    family: "Mirage",
    aliases: ["mirage"],
    versions: ["100", "200", "300", "500"],
    generations: [{ label: "II", markers: ["ii", "2"], source: "titres « Mirage 100 II », « Mirage 100 2 » ; R1 paire 33 (Mirage 100 / 100 II)" }],
    statut: "observe",
    notes: [
      "Le nombre (100 / 200 / 300 / 500) est le niveau de gamme (version), « II » la génération.",
      "« SPD » et « PRT » : sens non vérifié (speed ? print ?), à confirmer.",
    ],
  },
  {
    brand: "Lotto",
    category: "chaussures",
    family: "Raptor Hyperpulse",
    aliases: ["raptor hyperpulse"],
    versions: ["100", "300"],
    generations: [{ label: "III", markers: ["iii"], source: TITRES }],
    statut: "observe",
  },
  {
    brand: "Mizuno",
    category: "chaussures",
    family: "Wave Exceed",
    aliases: ["wave exceed"],
    versions: ["Tour", "Court", "Light"],
    generations: [
      { label: "5", markers: ["5"], source: TITRES },
      { label: "6", markers: ["6"], source: TITRES },
      { label: "7", markers: ["7"], source: TITRES },
    ],
    statut: "observe",
    notes: ["Générations vues sur Tour (5, 6, 7) et Light (2)."],
  },
  { brand: "Mizuno", category: "chaussures", family: "Wave Enforce", aliases: ["wave enforce"], versions: ["Tour", "Court"], generations: [{ label: "2", markers: ["2"], source: TITRES }], statut: "observe" },
  { brand: "Mizuno", category: "chaussures", family: "Break Shot", aliases: ["break shot"], generations: [{ label: "5", markers: ["5"], source: TITRES }], statut: "observe" },

  // ───────────────────────────── New Balance, On ─────────────────────────────
  { brand: "New Balance", category: "chaussures", family: "996", aliases: ["fuelcell 996", "996"], generations: [{ label: "v6", markers: ["v6"], source: TITRES }], statut: "observe" },
  { brand: "New Balance", category: "chaussures", family: "796", aliases: ["fuelcell 796", "796"], generations: [{ label: "v5", markers: ["v5"], source: TITRES }], statut: "observe" },
  { brand: "New Balance", category: "chaussures", family: "696", aliases: ["696"], generations: [{ label: "v6", markers: ["v6"], source: TITRES }], statut: "observe" },
  { brand: "New Balance", category: "chaussures", family: "Coco", aliases: ["coco"], versions: ["CG2", "Delray"], statut: "observe" },
  { brand: "New Balance", category: "chaussures", family: "CT Rally", aliases: ["ct rally"], statut: "observe" },
  { brand: "On", category: "chaussures", family: "The Roger Pro", aliases: ["the roger pro", "roger pro"], generations: [{ label: "2", markers: ["2"], source: TITRES }], excludes: ["the roger advantage"], statut: "observe" },
  { brand: "On", category: "chaussures", family: "The Roger Advantage", aliases: ["the roger advantage", "roger advantage"], versions: ["Pro"], statut: "observe" },

  // ───────────────────────────── Nike ─────────────────────────────
  {
    brand: "Nike",
    category: "chaussures",
    family: "Vapor Pro",
    aliases: ["zoom vapor pro", "vapor pro"],
    generations: [{ label: "3", markers: ["3"], source: TITRES }],
    editions: ["Premium"],
    statut: "observe",
    notes: ["« Zoom » est écrit ou non selon le marchand : même famille. « PRM » = Premium, voir Q15."],
  },
  {
    brand: "Nike",
    category: "chaussures",
    family: "Vapor",
    aliases: ["zoom vapor", "vapor"],
    generations: [
      { label: "X", markers: ["x"], source: TITRES },
      { label: "12", markers: ["12"], source: TITRES },
    ],
    editions: ["Premium", "Aryna Sabalenka", "Carlos Alcaraz"],
    excludes: ["vapor pro", "vapor lite", "zoom vapor pro"],
    statut: "observe",
    notes: ["« FO » (« Vapor 12 PRM FO ») : sens non vérifié, à confirmer."],
  },
  {
    brand: "Nike",
    category: "chaussures",
    family: "Vapor Lite",
    aliases: ["vapor lite"],
    generations: [
      { label: "2", markers: ["2"], source: TITRES },
      { label: "3", markers: ["3"], source: TITRES },
    ],
    statut: "observe",
  },
  {
    brand: "Nike",
    category: "chaussures",
    family: "GP Challenge",
    aliases: ["zoom gp challenge", "gp challenge"],
    versions: ["Pro"],
    generations: [
      { label: "1", markers: ["1"], source: TITRES },
      { label: "1.5", markers: ["1 5", "1.5"], source: TITRES },
    ],
    editions: ["Premium"],
    statut: "a_confirmer",
    notes: ["« GP Challenge 1 », « 1.5 » et « Pro » : 1 et 1.5 lus comme deux générations, Pro comme une version. À vérifier (Q16)."],
  },
  {
    brand: "Nike",
    category: "chaussures",
    family: "Court Lite",
    aliases: ["zoom court lite", "court lite"],
    generations: [
      { label: "3", markers: ["3"], source: TITRES },
      { label: "4", markers: ["4"], source: TITRES },
    ],
    statut: "observe",
  },

  // ───────────────────────────── Wilson, Yonex ─────────────────────────────
  {
    brand: "Wilson",
    category: "chaussures",
    family: "Rush",
    aliases: ["rush"],
    versions: ["Pro", "Lite", "Tour", "Pro Ace", "Pro Lite"],
    generations: [
      { label: "4.0", markers: ["4 0", "4.0"], source: TITRES },
      { label: "4.5", markers: ["4 5", "4.5"], source: TITRES },
      { label: "5", markers: ["5"], source: TITRES },
    ],
    statut: "observe",
    notes: ["« Rush Pro Jr », « Rush Pro Ace Jr » : junior."],
  },
  { brand: "Wilson", category: "chaussures", family: "Intrigue", aliases: ["intrigue"], versions: ["Pro", "Tour", "Lite"], statut: "observe" },
  { brand: "Wilson", category: "chaussures", family: "Kaos", aliases: ["kaos"], versions: ["Comp", "Swift"], generations: [{ label: "2.0", markers: ["2 0", "2.0"], source: "titre « Kaos Comp 2.0 »" }], statut: "observe" },
  { brand: "Wilson", category: "chaussures", family: "Court Glide", aliases: ["court glide", "courtglide"], statut: "observe" },
  { brand: "Yonex", category: "chaussures", family: "Eclipsion", aliases: ["eclipsion"], generations: [{ label: "5", markers: ["5"], source: TITRES }], statut: "observe" },
  { brand: "Yonex", category: "chaussures", family: "AD Accel", aliases: ["power cushion ad accel", "ad accel"], statut: "observe", notes: ["« Power Cushion » = technologie d'amorti Yonex, préfixe facultatif."] },
  { brand: "Yonex", category: "chaussures", family: "Sonicage", aliases: ["sonicage"], generations: [{ label: "3", markers: ["3"], source: TITRES }], statut: "observe", notes: ["« Sonicage Wide » : largeur différente."] },
];
