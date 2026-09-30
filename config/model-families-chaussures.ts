/**
 * Référentiel de familles de modèles — chaussures (R2, passe 2).
 *
 * Source : §7 du cadrage rapprochement, Q10 de D-2026-09-28-02 (passe R2
 * chaussures + accessoires avant R3). Méthode et questions Q13-Q20 :
 * `cadrage_deals-tennis/R2_referentiel.md` §7. Réponses de Mathieu :
 * D-2026-09-28-03.
 *
 * Statut : validé par Mathieu (D-2026-09-28-03, 2026-09-28), à partir des
 * titres réels en base (898 offres chaussures, toutes offres). Les cas Q16
 * ont été vérifiés sur les fiches marchand/fabricant (session desktop, réseau
 * ouvert, 2026-09-28) ; voir les notes de chaque famille. Aucun code ne le
 * lit encore (R4).
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
  // Étape 7 : « carpet » (Head Sprint) et « tapis » = moquette.
  gazon_synthetique: ["sand grass", "omni", "moquette", "carpet", "tapis"],
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
 * Chaussures de ville ou de loisir vues dans la catégorie (Q13, D-2026-09-28-03) :
 * exclues à l'ingestion (R3) comme hors tennis, jamais de famille.
 */
export const SHOE_LIFESTYLE_MARKERS = ["stan smith", "breaknet", "grand court", "advantage", "baskets", "sneakers", "lifestyle"];

const TITRES = "titres en base (2026-09-28)";

/**
 * Éditions lues pour toutes les familles d'une marque (étape 5, A2, D-2026-09-30-07) : collaborations qui
 * changent le produit (C-Q2). Clé = marque normalisée (`fullNormalize`). Rôle : `attributeValueOverrides.edition`
 * de `config/matching-rules.ts` (Y-3 et ASMC : « différent »).
 */
export const SHOE_BRAND_EDITIONS: Record<string, string[]> = {
  adidas: ["Y-3", "ASMC"],
};

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
    editions: ["Tsitsipas", "Pegula", "Leather"],
    statut: "observe",
    notes: [
      "Q16 vérifié (2026-09-28, adidas.com/us, tennis-warehouse.com) : « Barricade 13 Leather » est une déclinaison officielle adidas (tige cuir plutôt que mesh) du même modèle Barricade 13 — matériau différent, classée édition « proche » (même logique que Premium, Q15).",
      "Q16 vérifié (2026-09-28) : « ASMC Barricade » (adidas by Stella McCartney) est une collaboration mode construite sur la plateforme Barricade (Torsion System, semelle Repetitor) mais vendue en ligne à part, sans numéro de génération aligné sur le Barricade grand public. Classée d'abord édition « proche » par précaution ; étape 5 (A2, D-2026-09-30-07) : « différent », comme Y-3 (C-Q2 est postérieure), lue pour toutes les chaussures adidas (`SHOE_BRAND_EDITIONS`). « Leather » : « proche », comme l'écrit Q16 (B7).",
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
    // Étape 7 (relecture des fusions) : « Courtflash Kid Velcro » (fermeture à scratch) n'est pas le « Courtflash K » à lacets.
    versions: ["Velcro"],
    generationUnique: true,
    statut: "observe",
    notes: [
      "Surtout junior (« Courtflash K », « Courtflash Kid Velcro ») ; « CF » = Cloudfoam, à confirmer.",
      "R4.5-c (D-2026-09-30-02, reporté à l'étape 7, D-2026-09-30-09) : génération unique, modèle inchangé, nouveaux coloris chaque saison (SS25, AW26).",
    ],
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
    notes: [
      "« Avacourt3 » (collé) : la normalisation doit séparer lettres et chiffres.",
      "C-Q2 (D-2026-09-29-03) : « Y-3 » est une collaboration qui change le produit : modèle séparé de l'Avacourt standard (`attributeValueOverrides.edition` → différent). Étape 5 (A2) : lue pour toutes les chaussures adidas (`SHOE_BRAND_EDITIONS`), plus seulement pour l'Avacourt.",
    ],
  },
  { brand: "adidas", category: "chaussures", family: "Avaflash", aliases: ["avaflash"], generations: [{ label: "2", markers: ["2"], source: TITRES }], statut: "observe" },
  {
    brand: "adidas",
    category: "chaussures",
    family: "Avaluxe",
    aliases: ["avaluxe"],
    generationUnique: true,
    statut: "observe",
    notes: ["R4.5-c (D-2026-09-30-02, reporté à l'étape 7, D-2026-09-30-09) : génération unique (ancien nom Stella Court, aucune « Avaluxe 2 » trouvée)."],
  },
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
    generationUnique: true,
    statut: "observe",
    notes: ["« Game FF Clay OC » : OC = Omni Clay, marqueur de surface.", "R4.5-c (D-2026-09-30-02, reporté à l'étape 7, D-2026-09-30-09) : génération unique (pas de successeur numéroté)."],
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
    editions: ["Wimbledon", "Premium"],
    statut: "observe",
    notes: [
      "Q16 vérifié (2026-09-28, babolat.com) : « Jet Tere 2 Premium » est une référence distincte (30S26965B) de « Jet Tere 2 All Court » (3A0F25A649/30S24649), semelle Michelin Premium — édition « proche » (Q15, même traitement que Nike Vapor Pro Premium).",
    ],
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
    excludes: ["sfx evo"],
    generations: [{ label: "4", markers: ["4"], source: TITRES }],
    statut: "observe",
    notes: [
      "Q16 vérifié (2026-09-28, babolat.com, doittennis.com) : SFX 4 et SFX Evo sont deux lignes distinctes, pas deux générations d'un même modèle — SFX Evo (chausse 6% plus large, semelle Ortholite +20% d'épaisseur) vise débutant/intermédiaire, SFX 4 (Extra Cushion) vise joueur avancé. Séparées en deux familles.",
    ],
  },
  {
    brand: "Babolat",
    category: "chaussures",
    family: "SFX Evo",
    aliases: ["sfx evo"],
    generationUnique: true,
    statut: "observe",
    notes: [
      "Ligne à part de SFX (voir note ci-dessus, Q16/D-2026-09-28-03) : chausse plus large, orientée confort. Pas de numéro de génération vu dans les titres en base.",
      "R4.5-c (D-2026-09-30-02, reporté à l'étape 7, D-2026-09-30-09) : génération unique (nouveau modèle 2025). La génération n'est pas comparée pour cette famille (Q5) : « SFX Evo 2025 » = « SFX Evo ».",
    ],
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
  {
    brand: "Babolat",
    category: "chaussures",
    family: "Pulsion",
    aliases: ["pulsion"],
    junior: true,
    generationUnique: true,
    statut: "observe",
    notes: [
      "« Pulsion All Court Kid » : junior.",
      "R4.5-c (D-2026-09-30-02, reporté à l'étape 7, D-2026-09-30-09) : génération unique, un coloris de saison n'est pas une génération (Q2). Conséquence connue : « Pulsion 2019 » serait réuni avec « Pulsion » ; aucun titre Pulsion en base n'écrit d'année.",
    ],
  },
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
    family: "S. Challenge",
    aliases: ["s challenge"],
    generations: [
      { label: "5 SL", markers: ["5 sl"], source: TITRES },
      { label: "6 SL", markers: ["6 sl"], source: TITRES },
    ],
    statut: "observe",
    notes: [
      "Q16 vérifié (2026-09-28, diadora.com) : « S. Challenge » (ligne terre battue, suffixe « SL ») et « Speed Challenge » (ligne légère toutes surfaces, sans suffixe « SL », ex. « Speed Competition 7+ ») sont deux lignes Diadora distinctes — la lecture « S. Challenge = abréviation de Speed Challenge » proposée en R2 §7 était fausse, corrigée ici. Aucune offre « Speed Challenge » vue en base pour l'instant ; si elle apparaît, ne pas la rattacher à cette famille.",
    ],
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
    versions: ["Pro", "Team", "Court", "Evo", "Velcro", "Strap"],
    generations: [
      { label: "3.0", markers: ["3 0", "3.0", "30"], source: TITRES },
      // Étape 7 (D-2026-09-30-09) : « Sprint Evo 3.5 », « SPRINT 3.5 JUNIOR », « Sprint Pro 3.5 tapis ».
      { label: "3.5", markers: ["3 5", "3.5"], source: "titres et URL du site Head (2026-09-30)" },
      { label: "4.0", markers: ["4 0", "4.0", "40"], source: TITRES },
    ],
    statut: "observe",
    notes: [
      "« Sprint Velcro » : junior probable (fermeture velcro).",
      "Étape 5 (A3) : Sport 2000 écrit « SPRINT COURT 40 » et « SPRINT TEAM 40 » pour la 4.0 (marqueurs « 30 » et « 40 »).",
      "Étape 7 : génération 3.5 lue ; « Strap » (fermeture à scratch, modèle enfant) est une version.",
    ],
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
  {
    brand: "Head",
    category: "chaussures",
    family: "Endure Pro",
    aliases: ["endure pro"],
    versions: ["BOA"],
    generationUnique: true,
    statut: "observe",
    notes: ["« BOA » (système de laçage) classé en version : à confirmer.", "R4.5-c (D-2026-09-30-02, reporté à l'étape 7, D-2026-09-30-09) : génération unique (lancée en juillet 2025, lacets et BOA)."],
  },

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
  {
    brand: "Lacoste",
    category: "chaussures",
    family: "AG-LT",
    aliases: ["ag lt"],
    versions: ["Lite", "Pro"],
    // R4.5-c (D-2026-09-30-02, reporté à l'étape 7, D-2026-09-30-09), Q3 : « Ultra » n'existe qu'en AG-LT23 ; c'est le marqueur de cette génération, plus une version.
    generations: [{ label: "23", markers: ["ultra"], source: "R4_5_c_generation_unique.md §3 (AG-LT21 puis AG-LT23 Ultra)" }],
    editions: ["Medvedev", "RG"],
    statut: "observe",
  },
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
      "Vérifié (2026-09-28, tennis-warehouse.com) : « SPD » = Speed Sole (semelle orientée vitesse sur surfaces dures), construction différente donc marqueur de surface/version, pas une édition ; « PRT » = Printed (coloris imprimé), édition (variante).",
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
    notes: [
      "« FO » (« Vapor 12 PRM FO ») : recherche faite le 2026-09-28 (réseau ouvert), sens non trouvé dans la documentation Nike publique — reste à vérifier directement sur une fiche produit portant ce code si elle réapparaît. Sans confirmation, traité par défaut comme une variante non discriminante (aucun impact observé sur le rapprochement tant qu'aucune paire ne l'oppose à un « Vapor 12 PRM » sans FO).",
    ],
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
    statut: "observe",
    notes: [
      "Q16 vérifié (2026-09-28, nike.com, runrepeat.com) : GP Challenge 1 et 1.5 sont deux générations successives (upper retravaillé) ; GP Challenge Pro est une version d'entrée de gamme vendue en parallèle (mêmes stabilisateurs, moins de technologies premium) — confirme la lecture initiale (1/1.5 génération, Pro version).",
    ],
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
  {
    brand: "Wilson",
    category: "chaussures",
    family: "Intrigue",
    aliases: ["intrigue"],
    versions: ["Pro", "Tour", "Lite"],
    generationUnique: true,
    statut: "observe",
    notes: ["R4.5-c (D-2026-09-30-02, reporté à l'étape 7, D-2026-09-30-09) : génération unique (Intrigue Pro et Intrigue Tour, aucune 2e génération trouvée)."],
  },
  { brand: "Wilson", category: "chaussures", family: "Kaos", aliases: ["kaos"], versions: ["Comp", "Swift"], generations: [{ label: "2.0", markers: ["2 0", "2.0"], source: "titre « Kaos Comp 2.0 »" }], statut: "observe" },
  { brand: "Wilson", category: "chaussures", family: "Court Glide", aliases: ["court glide", "courtglide"], statut: "observe" },
  { brand: "Yonex", category: "chaussures", family: "Eclipsion", aliases: ["eclipsion"], generations: [{ label: "5", markers: ["5"], source: TITRES }], statut: "observe" },
  { brand: "Yonex", category: "chaussures", family: "AD Accel", aliases: ["power cushion ad accel", "ad accel"], statut: "observe", notes: ["« Power Cushion » = technologie d'amorti Yonex, préfixe facultatif."] },
  { brand: "Yonex", category: "chaussures", family: "Sonicage", aliases: ["sonicage"], generations: [{ label: "3", markers: ["3"], source: TITRES }], statut: "observe", notes: ["« Sonicage Wide » : largeur différente."] },
];
