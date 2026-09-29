/**
 * Règles de tolérance du rapprochement multi-niveaux (R2, v1).
 *
 * Source : §5 de `cadrage_deals-tennis/CADRAGE_rapprochement-multi-niveaux.md`
 * et décisions D-2026-09-26-01, D-2026-09-27-05/06/07, D-2026-09-28-02
 * (réponses de Mathieu aux questions Q1-Q6 et Q12), D-2026-09-28-03
 * (réponses aux questions Q13-Q20, chaussures et accessoires).
 *
 * Statut : validé par Mathieu (D-2026-09-28-02 et D-2026-09-28-03, 2026-09-28).
 * Lu par le moteur en mode fantôme (`lib/matching/compare.ts`, R4.4).
 *
 * Lecture : pour deux offres de la même famille, chaque attribut a un « rôle » :
 * - `variante` : sans effet sur la comparaison (même modèle) ;
 * - `proche`   : une différence donne « modèle proche », affiché avec mention ;
 * - `different`: une différence donne « produit différent ».
 * Un attribut inconnu d'un côté ne permet jamais « identique » s'il est
 * discriminant (`proche` ou `different`) : le cas devient « proche » ou part en
 * revue (principe R3 : un faux rapprochement coûte plus qu'un rapprochement manqué).
 */

import type { DealCategory } from "@/types/database";

export type AttributeRole = "variante" | "proche" | "different";

export type MatchLevel = "identique" | "proche" | "different";

/** Unité de comparaison des prix quand le conditionnement varie (principe R5). */
export type UnitType = "metre" | "balle" | "unite";

export interface NumericTolerance {
  /** Écart absolu jusqu'auquel la différence est une simple variante. */
  variante: number;
  /** Écart absolu jusqu'auquel la différence donne « proche » ; au-delà, « différent ». */
  proche: number;
}

export interface CategoryRules {
  /** Rôle de chaque attribut extrait (liste de départ du §6). */
  attributes: Record<string, AttributeRole>;
  /**
   * Exceptions par valeur d'attribut (ex. l'édition « Premium » des
   * chaussures est « proche » alors que les autres éditions sont
   * « variante », Q15/D-2026-09-28-03). Valeurs comparées normalisées
   * (minuscules). Absent = pas d'exception, le rôle de `attributes` s'applique.
   */
  attributeValueOverrides?: Record<string, Record<string, AttributeRole>>;
  /** Tolérances chiffrées, par attribut numérique. */
  numeric?: Record<string, NumericTolerance>;
  /** Unité de comparaison des prix, si le conditionnement varie. */
  unitType?: UnitType;
  /**
   * Unité de comparaison des prix par sous-catégorie, quand elle diffère de
   * `unitType` (accessoires : balles comparées à la balle, Q17). Clé =
   * `AccessorySubcategory`, non importé ici pour éviter un cycle.
   */
  unitTypeBySubcategory?: Record<string, UnitType>;
  /** Règle appliquée à la génération / collection (voir `GENERATION_RULES`). */
  generationRule: GenerationRuleId;
  /** Remarques pour la relecture, sans effet sur le code. */
  notes?: string[];
}

/**
 * Règle des générations.
 * - `standard` (D-2026-09-26-01, sacs inclus d'après D-2026-09-27-07) :
 *   différente et vérifiée des deux côtés → différent ; inconnue d'un côté →
 *   proche ; identique seulement si confirmée des deux côtés ou génération
 *   unique sur le marché.
 * - `textile` (D-2026-09-27-06, affiné par Q6/D-2026-09-28-02) : même modèle
 *   sans génération différente écrite → identique ; année ou collection écrite
 *   d'un seul côté → identique (§`attributes.edition` traite l'édition
 *   spéciale nommée séparément, voir plus bas) ; génération ou collection
 *   explicitement différente → proche.
 */
export type GenerationRuleId = "standard" | "textile";

export const GENERATION_RULES: Record<
  GenerationRuleId,
  {
    confirmeeIdentique: MatchLevel;
    verifieeDifferente: MatchLevel;
    inconnueUnCote: MatchLevel;
    nonEcriteDesDeuxCotes: MatchLevel;
  }
> = {
  standard: {
    confirmeeIdentique: "identique",
    verifieeDifferente: "different",
    inconnueUnCote: "proche",
    // Sauf génération unique sur le marché (à porter par le référentiel, §7).
    nonEcriteDesDeuxCotes: "proche",
  },
  textile: {
    confirmeeIdentique: "identique",
    verifieeDifferente: "proche",
    // Q6 (D-2026-09-28-02) : année ou collection écrite d'un seul côté →
    // identique (paire R1 n° 58). Une édition spéciale nommée (RG, Wimbledon,
    // US Open…, paire R1 n° 59) est traitée séparément par
    // `CATEGORY_RULES.textile.attributes.edition` (→ proche), pas ici.
    inconnueUnCote: "identique",
    nonEcriteDesDeuxCotes: "identique",
  },
};

/**
 * Sources admises pour vérifier un attribut, de la plus fiable à la moins
 * fiable (§6). La source retenue est conservée avec l'attribut extrait.
 */
export const ATTRIBUTE_SOURCES = [
  "gtin",
  "mpn",
  "donnees_structurees", // JSON-LD, JSON Shopify, Algolia
  "fiche_marchand", // fiche technique, filtres
  "titre_description",
] as const;

/** Attributs qui séparent toujours deux produits, toutes catégories. */
export const COMMON_ATTRIBUTES: Record<string, AttributeRole> = {
  marque: "different",
  famille: "different",
  age_group: "different", // adulte / enfant (raquette junior, chaussure enfant…)
  coloris: "variante",
  // Q12 (D-2026-09-28-02) : lot de N articles identiques = produit différent,
  // prix à l'unité affiché, jamais de « meilleur prix » entre un lot et l'unité.
  lot: "different",
  // Q12 : article + cadeau offert (« 6 cordages offerts », « sac offert ») =
  // même modèle, cadeau indiqué sur l'offre.
  cadeau: "variante",
};

export const CATEGORY_RULES: Record<DealCategory, CategoryRules> = {
  raquettes: {
    attributes: {
      grip: "variante",
      cordee: "variante", // cordée / non cordée
      poids: "proche", // voir `numeric.poids`
      tamis: "different", // 98 / 100 / 107…
      version: "different", // Lite / Tour / Team / Plus / S Lite…
      plan_cordage: "proche", // 16x19 / 18x20 (Q2, D-2026-09-28-02)
      longueur: "proche", // standard / +0,5 pouce (« Plus ») (Q2, D-2026-09-28-02)
      edition: "variante", // coloris/édition sans caractéristique différente (Q7)
    },
    numeric: {
      // Poids non cordé, en grammes. ±10 g = proche (§5) ; au-delà = différent.
      poids: { variante: 0, proche: 10 },
    },
    generationRule: "standard",
    notes: [
      "Q1 (D-2026-09-28-02) : même poids = même modèle ; écart ≤ 10 g = proche ; > 10 g = différent. Un poids écrit dans le nom du modèle (T-Fight 300 / 305, Tempo 270 / 275) compte comme un écart de poids ordinaire, pas comme une version.",
      "Q2 (D-2026-09-28-02) : plan de cordage et longueur sont « proche » tous les deux (« même modèle avec un plan de cordage différent », ex. Pure Drive / Pure Drive +). Remplace la proposition initiale « différent ».",
      "Q7 (D-2026-09-28-02) : édition ou coloris sans caractéristique différente sur la fiche = variante (Spectra, Wimbledon, White, LTD rouge, Black Code Fire/Lime…). Cas à part : Pure Aero Rafa Origin, T-Fight 300 IG (version, pas édition).",
    ],
  },
  chaussures: {
    attributes: {
      pointure: "variante",
      surface: "proche", // terre battue / toutes surfaces / gazon
      genre: "different",
      largeur: "different", // version large (« wide »)
      version: "different", // ex. Gel-Resolution / Gel-Resolution Clay : voir Q3
      // Q15 (D-2026-09-28-03) : édition joueur ou événement nommé = même
      // modèle (variante) ; « Premium »/« PRM » = proche (matériaux parfois
      // différents), voir `attributeValueOverrides` ci-dessous.
      edition: "variante",
    },
    attributeValueOverrides: {
      edition: { premium: "proche", prm: "proche" },
    },
    generationRule: "standard",
    notes: [
      "Q3 : la surface est souvent écrite dans le nom (« Clay »). Elle compte comme attribut « proche », pas comme une version différente.",
      "Q13 (D-2026-09-28-03) : chaussures de ville (Stan Smith, Breaknet, Grand Court, Advantage, Tommy Hilfiger, génériques Amazon) exclues à l'ingestion (R3), voir `SHOE_LIFESTYLE_MARKERS` dans `model-families-chaussures.ts` — jamais comparées ici.",
      "Q14 (D-2026-09-28-03) : le numéro qui suit le nom (Barricade 13/14, Gel-Challenger 14/15) est une génération, règle standard (`generationRule`), pas un attribut `version`.",
    ],
  },
  cordages: {
    attributes: {
      jauge: "proche", // D-2026-09-27-05
      conditionnement: "different", // garniture / bobine
      longueur: "different",
      matiere: "different",
      edition: "variante", // coloris/édition sans caractéristique différente (Q7)
    },
    unitType: "metre",
    generationRule: "standard",
    notes: [
      "Jauge au choix dans la fiche (même jauge disponible des deux côtés) = variante (§5).",
      "Q4 : garniture et bobine sont deux produits différents, mais leur prix est aussi affiché au mètre (principe R5). Le « meilleur prix » n'est jamais écrit entre les deux (R6).",
      "Q7 (D-2026-09-28-02) : édition ou coloris nommé sans caractéristique différente = variante (Alu Power Black, Black Code Fire/Lime…).",
    ],
  },
  accessoires: {
    attributes: {
      type: "different", // balles / surgrip / sac / antivibrateur…
      conditionnement: "different", // tube de 4, carton de 72, lot de 3 surgrips…
      pression: "different", // balles avec / sans pression
      contenance: "different", // sacs : nombre de raquettes
      // Q17 (D-2026-09-28-03) : niveau de balle (standard / Stage 1 / 2 / 3) —
      // deux balles de niveau différent ne sont jamais le même produit.
      niveau: "different",
      // Q18 (D-2026-09-28-03) : grip de remplacement ≠ surgrip, même marque/gamme.
      typeGrip: "different",
      // R4.4 (paire R1 14) : « S Logo Damp » ≠ « Logo Damp » (sens du « S » incertain) : une
      // version écrite d'un seul côté donne « proche », deux versions différentes aussi.
      version: "proche",
      // Proposé en R4.3 (`R4_3_complement_referentiel.md` §2), lu seulement s'il est écrit
      // dans le titre (thermobag / sac à dos / duffle / housse / tote) : à valider.
      type_sac: "different",
    },
    unitType: "unite", // prix à la pièce par défaut (grips, antivibrateurs…)
    unitTypeBySubcategory: {
      // Q17 : conditionnement de balles (tube, bipack, carton, sachet, baril)
      // = `lot` (COMMON_ATTRIBUTES, différent) ; prix comparé à la balle.
      balles: "balle",
    },
    generationRule: "standard",
    notes: [
      "Sacs : règle des générations standard, « identique » seulement pour exactement la même référence (D-2026-09-27-07).",
      "Q5 : pression et contenance ajoutées en « différent » (absentes du §5).",
      "Q17 : niveau de balle et conditionnement toujours « différent » ; jamais de « meilleur prix » entre deux conditionnements (comparaison au prix par balle).",
      "Q18 : nombre de pièces (x3/x12/x30/x60) = `lot` (COMMON_ATTRIBUTES, différent), prix comparé à la pièce (unitType « unite »).",
    ],
  },
  textile: {
    attributes: {
      taille: "variante",
      type: "different", // t-shirt / short / robe…
      genre: "different",
      modele: "different",
      // Édition spéciale nommée (RG, Wimbledon, US Open…) écrite d'un seul
      // côté → proche (Q6, D-2026-09-28-02, paire R1 n° 59). Distincte de
      // l'année/collection, qui reste gérée par `generationRule` (→ identique).
      edition: "proche",
    },
    generationRule: "textile",
    notes: [
      "Q6 (D-2026-09-28-02) : une mention écrite d'un seul côté est soit une année/collection (→ identique, `generationRule`), soit une édition spéciale nommée (→ proche, `attributes.edition`) — jamais « proche dans tous les cas » comme proposé initialement (contredisait la paire R1 n° 58).",
    ],
  },
};

/**
 * Seuils de confiance de la cascade §8 (étape 3, correspondance approchée).
 * Volontairement vides : ils sont réglés en R4 à partir du jeu de référence R1
 * (67 paires), pas choisis à l'avance.
 */
export const CONFIDENCE_THRESHOLDS: { autoMerge: number | null; review: number | null } = {
  autoMerge: null,
  review: null,
};
