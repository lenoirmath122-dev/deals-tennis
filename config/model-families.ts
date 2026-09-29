/**
 * Référentiel de familles de modèles (R2, v1, raquettes et cordages).
 *
 * Source : §7 de `cadrage_deals-tennis/CADRAGE_rapprochement-multi-niveaux.md`.
 * Méthode d'amorçage : `cadrage_deals-tennis/R2_referentiel.md`. Réponses de
 * Mathieu aux questions Q1-Q12 (raquettes/cordages) : D-2026-09-28-02.
 *
 * Statut : validé par Mathieu (D-2026-09-28-02, 2026-09-28), à partir des
 * titres réels en base (toutes offres, actives ou non). Cinq correspondances
 * (Q9) restées en attente ont été vérifiées sur les fiches marchand le
 * 2026-09-28 (voir les notes des familles concernées : L23, Synthetic Gut,
 * Element, Sidewinder, RF 01). Aucun code ne lit encore ce fichier : il sera
 * consommé par le moteur en R4.
 * Les alias proposés par la file de revue y sont ajoutés en lot, après
 * validation (D-2026-09-28-01) : jamais d'écriture depuis l'application.
 *
 * Conventions :
 * - `aliases` sont écrits sous forme normalisée : minuscules, accents retirés,
 *   tirets / barres / soulignés remplacés par un espace, espaces multiples
 *   réduits. Le « + » est conservé (Pure Drive + ≠ Pure Drive).
 * - Une famille se reconnaît par l'alias le plus long trouvé dans le titre
 *   (« blade feel » l'emporte sur « blade »). `excludes` liste les alias
 *   d'autres familles qui contiennent celui-ci, pour mémoire.
 * - `versions` : déclinaisons au niveau « modèle » à l'intérieur de la famille.
 *   Deux versions différentes = produit différent (§5 : tamis, Lite / Tour /
 *   Team / Plus, plan de cordage, junior). Sans version écrite = version
 *   standard de la famille.
 * - `generations` : seulement les correspondances **observées** (dans un même
 *   titre, ou vérifiées sur une fiche en R1 — source indiquée). Rien n'est
 *   déduit de mémoire : une génération absente ici est « inconnue » et la
 *   règle des générations (D-2026-09-26-01) s'applique.
 * - `editions` : séries spéciales ou coloris nommés (voir question Q7 de
 *   `R2_referentiel.md`).
 * - `statut` : `observe` (vu tel quel en base) ou `a_confirmer` (hypothèse
 *   de Claude Code signalée dans `notes`).
 */

import type { DealCategory } from "@/types/database";

export interface Generation {
  /** Libellé canonique (ex. « Gen 11 »). */
  label: string;
  /** Marqueurs rencontrés dans les titres, normalisés. */
  markers: string[];
  /** Année commerciale, seulement si observée avec le marqueur. */
  year?: number;
  /** Où la correspondance a été observée. */
  source: string;
}

export interface FamilyEntry {
  brand: string;
  category: DealCategory;
  family: string;
  aliases: string[];
  versions?: string[];
  generations?: Generation[];
  editions?: string[];
  /** Ligne junior : l'âge est un attribut « différent » (COMMON_ATTRIBUTES). */
  junior?: boolean;
  /**
   * Génération unique sur le marché (R4-Q4) : lève la règle « génération non écrite des
   * deux côtés → proche » pour les raquettes, chaussures et sacs. Aucune famille n'est
   * marquée à ce jour : la liste est à proposer à Mathieu sur les données du rapport.
   */
  generationUnique?: boolean;
  excludes?: string[];
  statut: "observe" | "a_confirmer";
  notes?: string[];
}

/**
 * Marques enregistrées sous un autre nom en base. La famille reste rattachée
 * à la marque du fabricant du produit.
 */
export const BRAND_ALIASES: Record<string, { canonical: string; note: string }> = {
  "wilson/cordages/luxilon": {
    canonical: "Luxilon",
    note: "Amazon enregistre les cordages Luxilon sous la marque Wilson (propriétaire de Luxilon). Paires R1 66 et 67.",
  },
  "wilson/cordages/element": {
    canonical: "Luxilon",
    note: "Cordage Luxilon Element vendu sous la marque Wilson sur Amazon (Q9, D-2026-09-28-02, vérifié sur wilson.com le 2026-09-28).",
  },
  "tecnifibre/raquettes/lacoste": {
    canonical: "Lacoste",
    note: "Raquette Lacoste L23 fabriquée par Tecnifibre, enregistrée sous Tecnifibre chez un marchand et Lacoste chez un autre.",
  },
  sportsystem: {
    canonical: "(marque lue dans le titre)",
    note: "Marque mal extraite : « SPORTSYSTEM Babolat Evo Aero Lite Gén2 ». Anomalie de données, voir R2_referentiel.md.",
  },
};

export const MODEL_FAMILIES: FamilyEntry[] = [
  // ───────────────────────────── RAQUETTES — Babolat ─────────────────────────────
  {
    brand: "Babolat",
    category: "raquettes",
    family: "Pure Aero",
    aliases: ["pure aero", "pureaero"],
    versions: ["98", "Lite", "S Lite", "Team", "Rafa Origin"],
    generations: [
      { label: "Gen 9", markers: ["gen 9", "gen9"], year: 2026, source: "titres « Pure Aero 98 Gen 9 2026 », « Pure Aero Lite Gén 9 2026 »" },
    ],
    editions: ["Rafa"],
    excludes: ["pure aero junior", "evo aero", "boost aero", "aero junior"],
    statut: "observe",
    notes: [
      "Q7 (D-2026-09-28-02) : « Rafa » est une édition (variante) ; « Rafa Origin » reste une version (spécifications propres, produit différent).",
      "Q2 (D-2026-09-28-02) : le « + » (longueur) n'est plus une version — comparé par l'attribut `longueur` (proche).",
    ],
  },
  {
    brand: "Babolat",
    category: "raquettes",
    family: "Pure Drive",
    aliases: ["pure drive", "puredrive"],
    versions: ["98", "107", "Lite", "S Lite", "Team"],
    generations: [
      { label: "Gen 11", markers: ["gen 11", "gen11"], year: 2025, source: "titres « Pure Drive 98 Gén 11 2025 », « Pure Drive Gen 11 2025 »" },
    ],
    editions: ["Spectra Edition", "Wimbledon"],
    excludes: ["evo drive", "boost drive", "drive junior"],
    statut: "observe",
    notes: [
      "« S-Lite » et « S Lite » : même version.",
      "Q2 (D-2026-09-28-02) : « Pure Drive + » n'est plus une version distincte (rallongée) — comparé par l'attribut `longueur` (proche).",
      "Paire R1 29 : deux générations (réf. 101551 Gen11, 101474 2023) sous le même titre « Pure Drive 98 (305 Gr) » ; seule la référence fabricant les sépare.",
    ],
  },
  {
    brand: "Babolat",
    category: "raquettes",
    family: "Pure Strike",
    aliases: ["pure strike", "purestrike"],
    versions: ["97", "98", "100", "Lite", "Team"],
    generations: [
      { label: "Gen 4", markers: ["gen 4", "gen4"], source: "R1 paire 5 : réf. 101576 / GTIN 3324922083345 = Pure Strike 100 16/20 Gen4 (babolat.com)" },
    ],
    excludes: ["evo strike", "boost strike"],
    statut: "observe",
    notes: [
      "Q2 (D-2026-09-28-02) : le plan de cordage (16x19 / 18x20, écrit « 16/19 », « 16x19 » ou « 16*19 » selon le marchand) n'est plus une version — comparé par l'attribut `plan_cordage` (proche). Ex. « 98 16x19 » et « 98 18x20 » sont maintenant la même version « 98 ».",
      "Tamis absent du titre (« Pure Strike 18x20 » sans tamis) : tamis inconnu, à rapprocher au mieux en « proche ».",
    ],
  },
  {
    brand: "Babolat",
    category: "raquettes",
    family: "Evo Aero",
    aliases: ["evo aero"],
    versions: ["Lite"],
    generations: [{ label: "Gen 2", markers: ["gen2", "gen 2"], source: "titres « Evo Aero Lite Gen2 »" }],
    editions: ["Pink"],
    statut: "observe",
  },
  {
    brand: "Babolat",
    category: "raquettes",
    family: "Evo Drive",
    aliases: ["evo drive"],
    versions: ["115", "Lite", "Tour"],
    generations: [{ label: "Gen 2", markers: ["gen2", "gen 2"], source: "titres « Evo Drive Gen2 Cordée »" }],
    editions: ["White", "Femme"],
    statut: "observe",
    notes: ["Q7 (D-2026-09-28-02) : « Femme » (270 g) est un coloris (édition), pas une version — le poids (270 g) est comparé par l'attribut `poids` (Q1)."],
  },
  {
    brand: "Babolat",
    category: "raquettes",
    family: "Evo Strike",
    aliases: ["evo strike"],
    generations: [{ label: "Gen 2", markers: ["gen2", "gen 2"], source: "titres « Evo Strike Gen2 Cordée »" }],
    excludes: ["boost strike"],
    statut: "observe",
    notes: [
      "Deux poids vus : 280 g « (new) » et 290 g. Écart de 10 g sans version écrite : cas d'école pour Q1 et la règle des générations.",
    ],
  },
  {
    brand: "Babolat",
    category: "raquettes",
    family: "Boost Aero",
    aliases: ["boost aero"],
    editions: ["White", "Pink", "Wimbledon"],
    statut: "observe",
    notes: ["Q8 (D-2026-09-28-02) : une famille par ligne (éclaté de l'ancien regroupement « Boost »)."],
  },
  {
    brand: "Babolat",
    category: "raquettes",
    family: "Boost Drive",
    aliases: ["boost drive"],
    editions: ["White", "Pink", "Wimbledon"],
    statut: "observe",
    notes: ["Q8 (D-2026-09-28-02) : une famille par ligne (éclaté de l'ancien regroupement « Boost »)."],
  },
  {
    brand: "Babolat",
    category: "raquettes",
    family: "Boost Strike",
    aliases: ["boost strike"],
    editions: ["White", "Pink", "Wimbledon"],
    statut: "observe",
    notes: ["Q8 (D-2026-09-28-02) : une famille par ligne (éclaté de l'ancien regroupement « Boost »)."],
  },
  {
    brand: "Babolat",
    category: "raquettes",
    family: "Pure Aero Junior",
    aliases: ["pure aero junior", "aero junior"],
    versions: ["25", "26"],
    generations: [{ label: "Gen 9", markers: ["gen9", "gen 9"], source: "titre « Pure Aero Junior 26 Gen9 »" }],
    junior: true,
    statut: "observe",
  },
  {
    brand: "Babolat",
    category: "raquettes",
    family: "Drive Junior",
    aliases: ["drive junior"],
    versions: ["23", "24", "25"],
    editions: ["Red"],
    junior: true,
    statut: "observe",
  },
  {
    brand: "Babolat",
    category: "raquettes",
    family: "Carlitos Junior",
    aliases: ["carlitos junior"],
    versions: ["19", "21", "25"],
    junior: true,
    statut: "observe",
    notes: ["Q8 (D-2026-09-28-02) : une famille par ligne (éclaté de l'ancien regroupement junior Babolat)."],
  },
  {
    brand: "Babolat",
    category: "raquettes",
    family: "B Fly",
    aliases: ["b fly"],
    versions: ["19", "21", "25"],
    junior: true,
    statut: "observe",
    notes: ["Q8 (D-2026-09-28-02) : une famille par ligne (éclaté de l'ancien regroupement junior Babolat)."],
  },
  {
    brand: "Babolat",
    category: "raquettes",
    family: "Ballfighter",
    aliases: ["ballfighter"],
    versions: ["19", "21", "25"],
    junior: true,
    statut: "observe",
    notes: ["Q8 (D-2026-09-28-02) : une famille par ligne (éclaté de l'ancien regroupement junior Babolat)."],
  },
  {
    brand: "Babolat",
    category: "raquettes",
    family: "Wimbledon Junior",
    aliases: ["junior wimbledon"],
    versions: ["19", "21", "25"],
    junior: true,
    statut: "observe",
    notes: ["Q8 (D-2026-09-28-02) : une famille par ligne (éclaté de l'ancien regroupement junior Babolat)."],
  },

  // ───────────────────────────── RAQUETTES — Head ─────────────────────────────
  {
    brand: "Head",
    category: "raquettes",
    family: "Speed",
    aliases: ["speed"],
    versions: ["MP", "MP L", "MP UL", "Pro", "Team", "Team UL", "Tour", "Elite", "Pro Legend"],
    generations: [
      { label: "2022", markers: ["2022"], year: 2022, source: "titres « Speed Pro 2022 », « Speed Team 2022 » ; R1 paire 28 (réf. 233612)" },
      { label: "2026", markers: ["2026"], year: 2026, source: "titres « Speed MP 2026 » ; R1 paire 30 (réf. 232026S)" },
      { label: "Auxetic", markers: ["auxetic"], source: "titres « Speed MP Auxetic », « Speed Team UL Auxetic » — année non écrite" },
    ],
    excludes: ["graphene touch speed"],
    statut: "observe",
    notes: [
      "« Speed Team » vu à 270 g et à 285 g : deux générations probables sous un même titre (Q1).",
      "« Auxetic » : génération non datée dans les titres. Ne pas lui associer d'année sans vérification.",
    ],
  },
  {
    brand: "Head",
    category: "raquettes",
    family: "Graphene Touch Speed",
    aliases: ["graphene touch speed"],
    versions: ["XTR"],
    statut: "observe",
    notes: ["Ancienne génération de Speed vendue sous son nom d'époque. Famille séparée proposée pour éviter tout rapprochement avec « Speed »."],
  },
  {
    brand: "Head",
    category: "raquettes",
    family: "Radical",
    aliases: ["radical"],
    versions: ["MP", "Pro", "Team", "Team L"],
    generations: [
      { label: "2021 (Graphene 360+)", markers: ["graphene 360+", "2021"], year: 2021, source: "titre « Graphene 360+ Radical Pro (2021) »" },
      { label: "2023", markers: ["2023"], year: 2023, source: "titre « Radical Team 2023 »" },
      { label: "2025", markers: ["2025"], year: 2025, source: "titres « Radical MP 2025 », « Radical Team L 2025 »" },
    ],
    editions: ["Palm Tree Crew"],
    excludes: ["junior radical", "radical junior"],
    statut: "observe",
    notes: [
      "« Graphene 360+ » est à la fois un préfixe de génération et un alias : il ne doit pas créer de famille à part.",
      "Q2 (D-2026-09-28-02) : le plan de cordage 18x20 (« MP 18x20 », « Pro 18x20 ») n'est plus une version distincte — comparé par l'attribut `plan_cordage` (proche). Paire R1 n° 45 (Radical Pro 2023 16x19 / 18x20) reclassée « différent » → « proche ».",
    ],
  },
  {
    brand: "Head",
    category: "raquettes",
    family: "Extreme",
    aliases: ["extreme"],
    versions: ["MP", "MP L", "Pro", "Team", "Elite"],
    generations: [{ label: "2024", markers: ["2024"], year: 2024, source: "titres « Extreme MP 2024 », R1 paire 41" }],
    excludes: ["extreme junior"],
    statut: "observe",
    notes: ["« MP Lite » (Tennispro) = « MP L » (Tennis Point FR) : alias de version."],
  },
  {
    brand: "Head",
    category: "raquettes",
    family: "Boom",
    aliases: ["boom"],
    versions: ["MP", "MP L", "MP UL", "Pro", "Team L", "Elite"],
    generations: [
      { label: "2024", markers: ["2024"], year: 2024, source: "titres « Boom MP 2024 », « Boom Pro 2024 »" },
      { label: "2025 Neon", markers: ["neon 2025"], year: 2025, source: "R1 paire 2 (réf. 231655 = Boom MP L Neon 2025)" },
    ],
    editions: ["Alternate", "Neon"],
    excludes: ["boom junior"],
    statut: "observe",
  },
  {
    brand: "Head",
    category: "raquettes",
    family: "Gravity",
    aliases: ["gravity"],
    versions: ["MP", "MP L", "Pro", "Team", "Tour"],
    generations: [
      { label: "2023", markers: ["2023"], year: 2023, source: "titre « Gravity MP (2023) »" },
      { label: "Auxetic 2.0", markers: ["auxetic 2.0", "auxetic 2 0"], source: "titres « Gravity MP Auxetic 2.0 » — année non écrite" },
    ],
    statut: "observe",
  },
  {
    brand: "Head",
    category: "raquettes",
    family: "Instinct",
    aliases: ["instinct"],
    versions: ["MP", "Team L"],
    generations: [{ label: "2025", markers: ["2025"], year: 2025, source: "titres « Instinct MP 2025 »" }],
    statut: "observe",
  },
  {
    brand: "Head",
    category: "raquettes",
    family: "Prestige",
    aliases: ["prestige"],
    versions: ["MP"],
    statut: "observe",
  },
  {
    brand: "Head",
    category: "raquettes",
    family: "Squared",
    aliases: ["squared"],
    statut: "observe",
  },
  {
    brand: "Head",
    category: "raquettes",
    family: "Ti",
    aliases: ["ti s2", "ti s6"],
    statut: "observe",
    notes: ["Q8 (D-2026-09-28-02) : une famille par ligne (éclaté de l'ancien regroupement loisir Head)."],
  },
  {
    brand: "Head",
    category: "raquettes",
    family: "MX Spark",
    aliases: ["mx spark"],
    statut: "observe",
    notes: ["Q8 (D-2026-09-28-02) : une famille par ligne (éclaté de l'ancien regroupement loisir Head)."],
  },
  {
    brand: "Head",
    category: "raquettes",
    family: "IG Challenge",
    aliases: ["ig challenge"],
    statut: "observe",
    notes: ["Q8 (D-2026-09-28-02) : une famille par ligne (éclaté de l'ancien regroupement loisir Head)."],
  },
  {
    brand: "Head",
    category: "raquettes",
    family: "Novak",
    aliases: ["novak"],
    versions: ["17", "19", "21", "23", "25"],
    junior: true,
    statut: "observe",
    notes: [
      "Q8 (D-2026-09-28-02) : une famille par ligne (éclaté de l'ancien regroupement junior Head).",
      "R1 paire 11 : Novak 19 ≠ Novak 25 (taille = version). R1 paire 46 : « Novak 23 » Amazon contre « Novak 23 » Tennis Point FR classée « proche » (génération inconnue).",
    ],
  },
  {
    brand: "Head",
    category: "raquettes",
    family: "Coco",
    aliases: ["coco"],
    versions: ["17", "19", "21", "23", "25"],
    junior: true,
    statut: "observe",
    notes: ["Q8 (D-2026-09-28-02) : une famille par ligne (éclaté de l'ancien regroupement junior Head)."],
  },
  {
    brand: "Head",
    category: "raquettes",
    family: "Paw",
    aliases: ["paw junior"],
    versions: ["17", "19", "21", "23", "25"],
    junior: true,
    statut: "observe",
    notes: ["Q8 (D-2026-09-28-02) : une famille par ligne (éclaté de l'ancien regroupement junior Head)."],
  },
  {
    brand: "Head",
    category: "raquettes",
    family: "Extreme Junior",
    aliases: ["extreme junior"],
    versions: ["17", "19", "21", "23", "25"],
    junior: true,
    statut: "observe",
    notes: ["Q8 (D-2026-09-28-02) : une famille par ligne (éclaté de l'ancien regroupement junior Head)."],
  },
  {
    brand: "Head",
    category: "raquettes",
    family: "Radical Junior",
    aliases: ["junior radical", "radical junior"],
    versions: ["17", "19", "21", "23", "25"],
    junior: true,
    statut: "observe",
    notes: ["Q8 (D-2026-09-28-02) : une famille par ligne (éclaté de l'ancien regroupement junior Head)."],
  },
  {
    brand: "Head",
    category: "raquettes",
    family: "Boom Junior",
    aliases: ["boom junior"],
    versions: ["17", "19", "21", "23", "25"],
    junior: true,
    statut: "observe",
    notes: ["Q8 (D-2026-09-28-02) : une famille par ligne (éclaté de l'ancien regroupement junior Head)."],
  },
  {
    brand: "Head",
    category: "raquettes",
    family: "Challenge",
    aliases: ["challenge"],
    versions: ["MP", "Team", "Team L"],
    excludes: ["ig challenge"],
    statut: "observe",
    notes: ["R4.2 (validé par Mathieu le 2026-09-29) : famille absente du référentiel, vue dans les titres de prod (« HEAD Challenge MP / TEAM / TEAM L », « Challenge Team – Amazon Exclusive »). Distincte de « IG Challenge » (alias plus long) et du cordage Head « Challenge » (autre catégorie)."],
  },
  {
    brand: "Head",
    category: "raquettes",
    family: "MX Attitude",
    aliases: ["mx attitude"],
    versions: ["Comp", "Elite", "Suprm"],
    statut: "observe",
    notes: ["R4.2 (validé par Mathieu le 2026-09-29) : famille absente du référentiel, vue dans les titres de prod (« HEAD MX Attitude Comp / Elite / Suprm »). Lien possible avec « Metallix Attitude » (MX = Metallix ?) non vérifié : familles séparées, donc jamais rapprochées entre elles."],
  },
  {
    brand: "Head",
    category: "raquettes",
    family: "Metallix Attitude",
    aliases: ["metallix attitude"],
    versions: ["Pro"],
    statut: "a_confirmer",
    notes: ["R4.2 (validé par Mathieu le 2026-09-29) : famille absente du référentiel, vue dans les titres de prod (« Head Metallix Attitude Pro … pré-cordée », Amazon). Voir la note de « MX Attitude »."],
  },
  {
    brand: "Head",
    category: "raquettes",
    family: "Arthur Ashe",
    aliases: ["arthur ashe"],
    versions: ["Competition"],
    statut: "observe",
    notes: ["R4.2 (validé par Mathieu le 2026-09-29) : famille absente du référentiel, vue dans les titres de prod (« HEAD Arthur Ashe Competition »)."],
  },
  {
    brand: "Head",
    category: "raquettes",
    family: "PWR",
    aliases: ["pwr"],
    versions: ["110", "115"],
    statut: "a_confirmer",
    notes: ["R4.2 (validé par Mathieu le 2026-09-29) : famille absente du référentiel, vue dans les titres de prod (« HEAD PWR 110 / 115 »). Chiffre = tamis ou nom de modèle, non vérifié ; sans conséquence : lu comme version ou comme tamis, 110 ≠ 115 donne « différent »."],
  },
  {
    brand: "Head",
    category: "raquettes",
    family: "Spark",
    aliases: ["spark"],
    versions: ["Suprm"],
    excludes: ["mx spark"],
    statut: "observe",
    notes: ["R4.2 (validé par Mathieu le 2026-09-29) : famille absente du référentiel, vue dans les titres de prod (« HEAD Spark SUPRM »). Séparée de « MX Spark » (alias plus long) faute de vérification."],
  },

  // ───────────────────────────── RAQUETTES — Wilson ─────────────────────────────
  {
    brand: "Wilson",
    category: "raquettes",
    family: "Blade",
    aliases: ["blade"],
    versions: ["98", "98L", "100L", "104", "101 Team"],
    generations: [
      { label: "V8", markers: ["v8"], source: "titre « Blade 100L V8 »" },
      { label: "V9", markers: ["v9"], source: "titres « Blade 98 16X19 V9 »" },
      { label: "V10", markers: ["v10"], source: "titre « Blade 101 Team V10 »" },
    ],
    editions: ["Bright Neon Green"],
    excludes: ["blade feel"],
    statut: "observe",
    notes: ["Q2 (D-2026-09-28-02) : le plan de cordage (« 98 16x19 », « 98 18x20 ») n'est plus une version distincte — comparé par l'attribut `plan_cordage` (proche)."],
  },
  {
    brand: "Wilson",
    category: "raquettes",
    family: "Blade Feel",
    aliases: ["blade feel"],
    versions: ["Team 103", "RXT 105"],
    statut: "observe",
    notes: ["Gamme loisir distincte de Blade (piège de nom voisin)."],
  },
  {
    brand: "Wilson",
    category: "raquettes",
    family: "Clash",
    aliases: ["clash"],
    versions: ["100", "100 Pro", "100L", "100UL", "Team 103"],
    generations: [
      { label: "V2", markers: ["v2.0", "v2 0", "v2"], source: "titres « Clash 100 V2.0 »" },
      { label: "V3", markers: ["v3"], source: "titres « Clash 100 V3 » ; R1 paire 3 (V2 ≠ V3)" },
    ],
    editions: ["Noir", "Bright Neon Pink"],
    statut: "observe",
    notes: ["« Clash 100 L » = « Clash 100L » ; « UL » = ultra léger."],
  },
  {
    brand: "Wilson",
    category: "raquettes",
    family: "Pro Staff",
    aliases: ["pro staff"],
    versions: ["97", "97L", "97UL", "X", "Team Classic"],
    generations: [{ label: "V14", markers: ["v14"], source: "titres « Pro Staff 97 V14 » ; R1 paire 1" }],
    excludes: ["pro staff precision"],
    statut: "observe",
  },
  {
    brand: "Wilson",
    category: "raquettes",
    family: "Pro Staff Precision",
    aliases: ["pro staff precision"],
    versions: ["RXT 105"],
    statut: "observe",
    notes: ["Gamme loisir (Amazon) distincte de Pro Staff."],
  },
  {
    brand: "Wilson",
    category: "raquettes",
    family: "Ultra",
    aliases: ["ultra"],
    versions: ["100", "100L", "100UL", "99 Pro", "26 (junior)"],
    generations: [
      { label: "V4", markers: ["v4.0", "v4 0", "v4"], source: "titres « Ultra 100 V4.0 »" },
      { label: "V5", markers: ["v5"], source: "titres « Ultra 100 V5 »" },
    ],
    editions: ["Desert", "Roland Garros 2026"],
    statut: "observe",
    notes: ["« Ultra 26 V5 » est une raquette junior : la taille 26 la sépare des versions adultes."],
  },
  {
    brand: "Wilson",
    category: "raquettes",
    family: "Burn",
    aliases: ["burn"],
    versions: ["100", "100 LS", "100 ULS"],
    generations: [{ label: "V5", markers: ["v5", "v 5"], source: "titres « Burn 100 LS V 5 »" }],
    statut: "observe",
  },
  {
    brand: "Wilson",
    category: "raquettes",
    family: "Shift",
    aliases: ["shift"],
    versions: ["99", "99L"],
    generations: [{ label: "V1", markers: ["v1"], source: "titres « Shift 99 V1 »" }],
    editions: ["Roland Garros Night Session", "US Open Edition Limitée"],
    statut: "observe",
  },
  {
    brand: "Wilson",
    category: "raquettes",
    family: "RF 01",
    aliases: ["rf 01", "rf01"],
    versions: ["Future"],
    statut: "observe",
    notes: [
      "Q9 (D-2026-09-28-02, vérifié 2026-09-28 sur wilson.com/tennis-warehouse.com) : « RF 01 Future » est une version plus légère de RF 01, mais en taille adulte standard (27 in, 98 sq in) — pas une raquette junior (taille réduite). Reste classée en version, pas en `junior`.",
    ],
  },
  {
    brand: "Wilson",
    category: "raquettes",
    family: "Pro Open",
    aliases: ["pro open"],
    statut: "observe",
    notes: ["Q8 (D-2026-09-28-02) : une famille par ligne (éclaté de l'ancien regroupement loisir Wilson)."],
  },
  {
    brand: "Wilson",
    category: "raquettes",
    family: "Hyper",
    aliases: ["hyper 2.3"],
    statut: "observe",
    notes: ["Q8 (D-2026-09-28-02) : une famille par ligne (éclaté de l'ancien regroupement loisir Wilson)."],
  },
  {
    brand: "Wilson",
    category: "raquettes",
    family: "Six.One",
    aliases: ["six one"],
    statut: "observe",
    notes: ["Q8 (D-2026-09-28-02) : une famille par ligne (éclaté de l'ancien regroupement loisir Wilson)."],
  },
  {
    brand: "Wilson",
    category: "raquettes",
    family: "Fusion",
    aliases: ["fusion xl"],
    statut: "observe",
    notes: ["Q8 (D-2026-09-28-02) : une famille par ligne (éclaté de l'ancien regroupement loisir Wilson)."],
  },
  {
    brand: "Wilson",
    category: "raquettes",
    family: "Intrigue",
    aliases: ["intrigue"],
    versions: ["Jr 19"],
    statut: "observe",
    notes: ["Q8 (D-2026-09-28-02) : une famille par ligne (éclaté de l'ancien regroupement loisir Wilson). « Intrigue Jr 19 » est junior (age_group different, COMMON_ATTRIBUTES)."],
  },
  {
    brand: "Wilson",
    category: "raquettes",
    family: "Tour Slam",
    aliases: ["tour slam"],
    statut: "observe",
    notes: ["Q8 (D-2026-09-28-02) : une famille par ligne (éclaté de l'ancien regroupement loisir Wilson)."],
  },
  {
    brand: "Wilson",
    category: "raquettes",
    family: "Impact",
    aliases: ["impact"],
    statut: "observe",
    notes: ["Q8 (D-2026-09-28-02) : une famille par ligne (éclaté de l'ancien regroupement loisir Wilson)."],
  },
  {
    brand: "Wilson",
    category: "raquettes",
    family: "Roland Garros Elite (junior)",
    aliases: ["roland garros elite"],
    versions: ["23"],
    junior: true,
    statut: "observe",
  },

  // ───────────────────────────── RAQUETTES — Tecnifibre ─────────────────────────────
  {
    brand: "Tecnifibre",
    category: "raquettes",
    family: "T-Fight",
    aliases: ["t fight", "tfight"],
    versions: ["S"],
    generations: [
      { label: "Isoflex / ISO", markers: ["isoflex", "iso"], source: "titres « T-Fight 300 Isoflex », « T-Fight 315 ISO » — année non écrite" },
      { label: "2025", markers: ["2025"], year: 2025, source: "titres « T-Fight 300 2025 »" },
    ],
    editions: ["300 IG"],
    excludes: ["t fight club", "t fight team", "t fight tour"],
    statut: "observe",
    notes: [
      "Q1 (D-2026-09-28-02) : les poids (255/270/280/285/300/305/315) ne sont plus des versions — comparés par l'attribut `poids` (± 10 g = proche, au-delà = différent). Seule la ligne « S » (300S/305S/315S) reste une version à part.",
      "Q7 (D-2026-09-28-02) : « 300 IG » (Iga Swiatek) est une édition, pas une version.",
    ],
  },
  {
    brand: "Tecnifibre",
    category: "raquettes",
    family: "TF-X1",
    aliases: ["tf x1", "tfx1"],
    generations: [{ label: "V2", markers: ["v2"], source: "titres « TF X1 270 V2 », « Tf-x1 V2 270 » ; R1 paire 12" }],
    statut: "observe",
    notes: [
      "Ordre des mots variable : « TF X1 270 V2 » = « Tf-x1 V2 270 » (R1 paire 12, identique).",
      "Q1 (D-2026-09-28-02) : les poids (255/270/275/300/305) ne sont plus des versions — comparés par l'attribut `poids`.",
    ],
  },
  {
    brand: "Tecnifibre",
    category: "raquettes",
    family: "Tempo",
    aliases: ["tempo"],
    generations: [{ label: "V2", markers: ["v2"], source: "titres « Tempo 270 V2 »" }],
    excludes: ["tempo iga"],
    statut: "observe",
    notes: ["Q1 (D-2026-09-28-02) : les poids (255/265/270/275/285, ex. Tempo 270 / 275) ne sont plus des versions — comparés par l'attribut `poids`."],
  },
  {
    brand: "Tecnifibre",
    category: "raquettes",
    family: "Tempo Iga (junior)",
    aliases: ["tempo iga"],
    versions: ["19", "24"],
    junior: true,
    statut: "observe",
  },
  {
    brand: "Tecnifibre",
    category: "raquettes",
    family: "T-Fit",
    aliases: ["t fit"],
    versions: ["Speed"],
    generations: [{ label: "2023", markers: ["2023"], year: 2023, source: "titres « T-fit 275 2023 »" }],
    statut: "observe",
    notes: ["Q1 (D-2026-09-28-02) : les poids (275/290) ne sont plus des versions — comparés par l'attribut `poids`."],
  },
  {
    brand: "Tecnifibre",
    category: "raquettes",
    family: "TF-40",
    aliases: ["tf 40", "tf40"],
    versions: ["315"],
    statut: "observe",
    notes: ["Q2 (D-2026-09-28-02) : le plan de cordage (16x19 / 18x20) n'est plus une version distincte — comparé par l'attribut `plan_cordage` (proche)."],
  },
  {
    brand: "Tecnifibre",
    category: "raquettes",
    family: "Fire",
    aliases: ["fire"],
    versions: ["S"],
    statut: "observe",
    notes: ["Q1 (D-2026-09-28-02) : les poids (255/270/285/300) ne sont plus des versions — comparés par l'attribut `poids`. Seule la ligne « S » (305S) reste une version à part."],
  },
  {
    brand: "Tecnifibre",
    category: "raquettes",
    family: "T-Fight junior (Club, Team, Tour)",
    aliases: ["t fight club", "t fight team", "t fight tour"],
    versions: ["Club 17", "Club 19", "Club 23", "Club 25", "Team 24", "Team 25", "Team 26", "Tour 25", "Tour 26"],
    junior: true,
    statut: "observe",
  },
  {
    brand: "Lacoste",
    category: "raquettes",
    family: "L23",
    aliases: ["l23"],
    versions: ["L"],
    statut: "observe",
    notes: [
      "Q9 (D-2026-09-28-02, vérifié 2026-09-28 sur sportsystem.fr, tecnifibre.com, tenniswarehouse-europe.com) : « L23 L » (Lacoste, SportSystem) = « L23 Light » (Tecnifibre) — même référence fabricant 18LACL23L, même poids (275 g), même tamis (100 sq in / 645 cm²), même plan de cordage (16x19). « L » et « Light » sont deux écritures de la même version, pas deux versions.",
    ],
  },

  // ───────────────────────────── RAQUETTES — Dunlop ─────────────────────────────
  {
    brand: "Dunlop",
    category: "raquettes",
    family: "CX",
    aliases: ["cx"],
    versions: ["200", "200 LS", "200 OS", "200 Tour", "400", "400 Tour", "Team 100"],
    statut: "observe",
    notes: [
      "R1 paire 8 : « CX Team 100 » des deux côtés, classée « proche » (génération introuvable).",
      "Q2 (D-2026-09-28-02) : le plan de cordage (« 200 Tour 16x19 », « 200 Tour 18x20 ») n'est plus une version distincte — comparé par l'attribut `plan_cordage` (proche).",
    ],
  },
  {
    brand: "Dunlop",
    category: "raquettes",
    family: "FX",
    aliases: ["fx"],
    versions: ["500", "500 LS", "500 Lite", "500 Super Lite", "500 Tour", "700"],
    generations: [{ label: "2026", markers: ["2026"], year: 2026, source: "titres « FX 500 Lite 2026 » ; R1 paire 6 (réf. 10369906, plan 16x18)" }],
    statut: "observe",
    notes: ["R1 paires 6 et 7 : « FX 500 Lite » sans année ≠ « FX 500 Lite 2026 » (génération antérieure, plan 16x19)."],
  },
  {
    brand: "Dunlop",
    category: "raquettes",
    family: "SX",
    aliases: ["sx", "sx300"],
    versions: ["300", "300 LS", "300 Lite", "300 Tour", "Team 100"],
    generations: [{ label: "2025", markers: ["2025"], year: 2025, source: "titres « SX300 2025 »" }],
    statut: "observe",
    notes: ["« SX300 » (collé) = « Sx 300 » : la normalisation doit séparer lettres et chiffres."],
  },
  {
    brand: "Dunlop",
    category: "raquettes",
    family: "LX",
    aliases: ["lx"],
    versions: ["800", "1000"],
    statut: "observe",
  },
  {
    brand: "Dunlop",
    category: "raquettes",
    family: "Tristorm",
    aliases: ["tristorm"],
    versions: ["Pro 100 Lite", "Team 100"],
    statut: "observe",
  },

  // ───────────────────────────── RAQUETTES — Prince, Pro Kennex, Yonex ─────────────────────────────
  {
    brand: "Prince",
    category: "raquettes",
    family: "Beast",
    aliases: ["beast"],
    editions: ["LTD rouge", "Pink"],
    statut: "observe",
    notes: [
      "Q1 (D-2026-09-28-02) : les poids (265/280/300, tamis 100 constant) ne sont plus des versions — comparés par l'attribut `poids`.",
      "Q7 (D-2026-09-28-02) : « LTD rouge » (« Beast 100 265 LTD ») est une édition.",
    ],
  },
  {
    brand: "Prince",
    category: "raquettes",
    family: "Tour Carbon",
    aliases: ["tour carbon"],
    versions: ["P", "L"],
    statut: "observe",
    notes: ["Q1 (D-2026-09-28-02) : les poids (275/290, tamis 100 constant) ne sont plus des versions — comparés par l'attribut `poids`. « P » et « L » restent des versions à part."],
  },
  { brand: "Prince", category: "raquettes", family: "Warrior", aliases: ["warrior"], versions: ["100"], statut: "observe" },
  { brand: "Prince", category: "raquettes", family: "Ripcord", aliases: ["ripcord"], versions: ["100"], statut: "observe" },
  { brand: "Prince", category: "raquettes", family: "O3 Legacy", aliases: ["o3 legacy"], versions: ["105"], statut: "observe" },
  {
    brand: "Prince",
    category: "raquettes",
    family: "Neon",
    aliases: ["neon"],
    statut: "observe",
    notes: ["Q1 (D-2026-09-28-02) : les poids (275/290) ne sont plus des versions — comparés par l'attribut `poids`."],
  },
  {
    brand: "Prince",
    category: "raquettes",
    family: "Skulls",
    aliases: ["skulls"],
    statut: "observe",
    notes: ["Q1 (D-2026-09-28-02) : les poids (275/290) ne sont plus des versions — comparés par l'attribut `poids`."],
  },
  {
    brand: "Prince",
    category: "raquettes",
    family: "Ace Face (junior)",
    aliases: ["ace face"],
    versions: ["19", "25", "26"],
    junior: true,
    statut: "observe",
  },
  {
    brand: "Pro Kennex",
    category: "raquettes",
    family: "Ki 5",
    aliases: ["ki 5", "ki5"],
    statut: "observe",
    notes: ["Q1 (D-2026-09-28-02) : les poids (260/270) ne sont plus des versions — comparés par l'attribut `poids`."],
  },
  {
    brand: "Pro Kennex",
    category: "raquettes",
    family: "Black Ace",
    aliases: ["black ace"],
    versions: ["105", "Pro"],
    statut: "observe",
    notes: ["Q1 (D-2026-09-28-02) : les poids (285/300) ne sont plus des versions — comparés par l'attribut `poids`. « 105 » (tamis) et « Pro » restent des versions à part."],
  },
  {
    brand: "Pro Kennex",
    category: "raquettes",
    family: "Q+",
    aliases: ["q+"],
    versions: ["15 Light", "15 Pro", "Tour", "Tour Pro"],
    statut: "observe",
    notes: ["Q1 (D-2026-09-28-02) : le poids de « Tour Pro » (315/325) n'est plus une version distincte — comparé par l'attribut `poids`."],
  },
  {
    brand: "Yonex",
    category: "raquettes",
    family: "VCore",
    aliases: ["vcore"],
    versions: ["Alpha L"],
    statut: "observe",
  },

  // ───────────────────────────── CORDAGES — Babolat ─────────────────────────────
  {
    brand: "Babolat",
    category: "cordages",
    family: "RPM",
    aliases: ["rpm"],
    versions: ["Blast", "Soft", "Rough", "Power", "Team", "Hurricane"],
    statut: "observe",
    notes: [
      "« RPM Hurricane » = ancien « Pro Hurricane Tour » (écrit dans un titre Tennispro) : alias de version « pro hurricane tour ». R1 paire 65.",
      "Chaque version est un cordage différent (Blast ≠ Soft). Longueur (6 / 12 / 100 / 200 m) = conditionnement, jamais une version.",
    ],
  },
  {
    brand: "Babolat",
    category: "cordages",
    family: "Addixion+",
    aliases: ["addixion+", "addixion +", "addixion"],
    statut: "observe",
  },
  { brand: "Babolat", category: "cordages", family: "Xcel", aliases: ["xcel"], statut: "observe" },
  { brand: "Babolat", category: "cordages", family: "Xalt", aliases: ["xalt"], statut: "observe" },
  { brand: "Babolat", category: "cordages", family: "Xplore", aliases: ["xplore"], statut: "observe" },
  { brand: "Babolat", category: "cordages", family: "Touch VS", aliases: ["touch vs"], statut: "observe" },
  { brand: "Babolat", category: "cordages", family: "Pro Last", aliases: ["pro last"], statut: "observe" },
  { brand: "Babolat", category: "cordages", family: "Magic Force", aliases: ["magic force"], statut: "observe" },
  {
    brand: "Babolat",
    category: "cordages",
    family: "Synthetic Gut",
    aliases: ["synthetic gut"],
    versions: ["Force"],
    statut: "observe",
    notes: [
      "Q9 (D-2026-09-28-02, vérifié 2026-09-28 sur tennispro.fr) : « Synthetic Gut Force » (âme unique très solide + 2 filaments enveloppants) et « Synthetic Gut » (boyau synthétique multifilament longévité) ont des fiches produit différentes — confirmé produit différent, pas seulement supposé.",
    ],
  },

  // ───────────────────────────── CORDAGES — Head ─────────────────────────────
  {
    brand: "Head",
    category: "cordages",
    family: "Hawk",
    aliases: ["hawk"],
    versions: ["Touch", "Power", "Tour", "Tour Rpet"],
    statut: "observe",
    notes: ["Q9 (D-2026-09-28-02) : « Hawk Tour Rpet » (polyester recyclé) est une version à part, distincte de « Tour »."],
  },
  {
    brand: "Head",
    category: "cordages",
    family: "Lynx",
    aliases: ["lynx"],
    versions: ["Touch", "Tour"],
    statut: "observe",
  },
  { brand: "Head", category: "cordages", family: "Sonic Pro", aliases: ["sonic pro"], statut: "observe" },
  { brand: "Head", category: "cordages", family: "Velocity MLT", aliases: ["velocity mlt", "velocity"], statut: "observe" },
  { brand: "Head", category: "cordages", family: "Reflex MLT", aliases: ["reflex mlt", "reflex"], statut: "observe" },
  {
    brand: "Head",
    category: "cordages",
    family: "Rip Control",
    aliases: ["rip control"],
    statut: "observe",
    notes: ["R1 paires 25 et 38 : jauge souvent absente du titre, garniture / bobine à lire dans la longueur."],
  },
  { brand: "Head", category: "cordages", family: "Intellitour", aliases: ["intellitour"], statut: "observe" },
  { brand: "Head", category: "cordages", family: "Challenge", aliases: ["challenge"], statut: "observe" },
  { brand: "Head", category: "cordages", family: "Synthetic Gut PPS", aliases: ["synthetic gut pps"], statut: "observe" },

  // ───────────────────────────── CORDAGES — Luxilon ─────────────────────────────
  {
    brand: "Luxilon",
    category: "cordages",
    family: "Alu Power",
    aliases: ["big banger alu power", "alu power"],
    versions: ["Rough", "Soft", "Spin"],
    editions: ["Black"],
    statut: "observe",
    notes: [
      "« Alu Power » = « Big Banger Alu Power » (R1 paires 63 et 66, identiques).",
      "« Black » traité comme coloris (R1 paire 32, identique).",
      "« Alu Power 125 » (Amazon) : 125 = jauge 1,25 mm, pas une version.",
    ],
  },
  {
    brand: "Luxilon",
    category: "cordages",
    family: "4G",
    aliases: ["4g"],
    versions: ["Soft", "Rough"],
    editions: ["Black"],
    statut: "observe",
    notes: ["R1 paire 67 : l'offre Amazon indique « Rouleau de 2 mètres » pour une bobine, titre non fiable sur la longueur."],
  },
  { brand: "Luxilon", category: "cordages", family: "Big Banger Original", aliases: ["big banger original"], statut: "observe" },
  { brand: "Luxilon", category: "cordages", family: "Eco", aliases: ["eco"], versions: ["Rough", "Spin"], statut: "observe" },
  { brand: "Luxilon", category: "cordages", family: "Adrenaline", aliases: ["adrenaline"], statut: "observe" },
  {
    brand: "Luxilon",
    category: "cordages",
    family: "Element",
    aliases: ["element"],
    statut: "observe",
    notes: [
      "Q9 (D-2026-09-28-02, vérifié 2026-09-28 sur wilson.com) : « Wilson Element » (Amazon) est le cordage Luxilon Element, vendu sous la marque Wilson (propriétaire de Luxilon) — même mécanisme que `BRAND_ALIASES` (\"wilson/cordages/element\").",
    ],
  },

  // ───────────────────────────── CORDAGES — autres marques ─────────────────────────────
  {
    brand: "Gosen",
    category: "cordages",
    family: "Sidewinder",
    aliases: ["sidewinder", "eggpower sidewinder", "eggpower"],
    statut: "observe",
    notes: [
      "Q9 (D-2026-09-28-02, vérifié 2026-09-28 sur gosen.com.au/tennis-warehouse.com) : « Sidewinder » est le nom du même cordage que « Eggpower » (nom d'origine japonais) — même produit, pas deux, confirmé (Mathieu avait d'abord répondu « deux cordages différents » puis était revenu dessus).",
    ],
  },
  { brand: "Gosen", category: "cordages", family: "G Tour", aliases: ["g tour"], versions: ["1", "2", "3"], statut: "observe" },
  { brand: "Gosen", category: "cordages", family: "Micro Super", aliases: ["micro super"], statut: "observe" },
  { brand: "Gosen", category: "cordages", family: "Polybreak", aliases: ["polybreak"], statut: "observe" },
  { brand: "Gosen", category: "cordages", family: "Polylon Comfort", aliases: ["polylon comfort", "polylon"], statut: "observe" },
  { brand: "Gosen", category: "cordages", family: "Tecgut Multi CX", aliases: ["tecgut multi cx", "tecgut"], statut: "observe" },
  {
    brand: "Gosen",
    category: "cordages",
    family: "Umishima AK",
    aliases: ["umishima ak", "umishima"],
    versions: ["Control", "Pro Multi", "Pro Multi CX"],
    statut: "observe",
  },
  { brand: "Dunlop", category: "cordages", family: "Explosive", aliases: ["explosive"], versions: ["Bite", "Spin", "Tour"], statut: "observe" },
  {
    brand: "Tecnifibre",
    category: "cordages",
    family: "Black Code",
    aliases: ["black code"],
    editions: ["Fire", "Lime"],
    statut: "observe",
    notes: ["Q7 (D-2026-09-28-02) : « Fire » et « Lime » sont des coloris (édition, variante)."],
  },
  { brand: "Tecnifibre", category: "cordages", family: "4S", aliases: ["4s"], statut: "observe" },
  { brand: "Tecnifibre", category: "cordages", family: "TGV", aliases: ["tgv"], statut: "observe" },
  {
    brand: "West Gut",
    category: "cordages",
    family: "MT",
    aliases: ["mt"],
    versions: ["14 Polyflex", "17 Poly Black", "18 Poly Black Penta", "19 Plus Power", "20 Hexa Spin"],
    statut: "observe",
  },
  { brand: "Wilson", category: "cordages", family: "Sensation", aliases: ["sensation"], versions: ["Control", "Comfort"], statut: "observe", notes: ["C-Q4 (D-2026-09-29-03) vérifié le 2026-09-29 (tenniswarehouse-europe.com, fiche « Wilson Sensation Comfort 1.30/16 String Reel - 200m ») : « Comfort » est l'intitulé européen du Sensation 16 de base (Wilson US : « Sensation 16 »), distinct de Control. Version ajoutée : Comfort ≠ Control ; Comfort face à « Sensation » sans version = proche (jamais identique) tant que l'équivalence n'est pas validée."] },
  { brand: "Wilson", category: "cordages", family: "Revolve Spin", aliases: ["revolve spin", "revolve"], statut: "observe" },
  { brand: "Wilson", category: "cordages", family: "NXT", aliases: ["nxt"], statut: "observe" },
  { brand: "Kirschbaum", category: "cordages", family: "Max Power", aliases: ["max power"], versions: ["Rough"], statut: "observe" },
  { brand: "Prince", category: "cordages", family: "Synthetic Gut Duraflex", aliases: ["synthetic gut duraflex", "duraflex"], statut: "observe" },
  { brand: "Pro's Pro", category: "cordages", family: "Black Force", aliases: ["black force"], statut: "observe" },
  { brand: "Yonex", category: "cordages", family: "PolyTour", aliases: ["polytour", "poly tour"], versions: ["Pro"], statut: "observe" },
];
