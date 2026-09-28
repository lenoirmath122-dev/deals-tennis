/**
 * Règles de tolérance du rapprochement multi-niveaux (R2, v1 — PROPOSITION).
 *
 * Source : §5 de `cadrage_deals-tennis/CADRAGE_rapprochement-multi-niveaux.md`
 * et décisions D-2026-09-26-01, D-2026-09-27-05/06/07.
 *
 * Statut : proposé par Claude Code le 2026-09-28, à valider par Mathieu
 * (§0 du cadrage : toute connaissance tennis est validée avant d'être acquise).
 * Aucun code ne lit encore ce fichier : il sera consommé par le moteur en R4.
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
  /** Tolérances chiffrées, par attribut numérique. */
  numeric?: Record<string, NumericTolerance>;
  /** Unité de comparaison des prix, si le conditionnement varie. */
  unitType?: UnitType;
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
 * - `textile` (D-2026-09-27-06) : même modèle sans génération différente écrite
 *   → identique ; génération ou collection explicitement différente → proche.
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
    // Q6 : génération ou édition écrite d'un seul côté. Proposé « proche », par
    // analogie avec la paire R1 n° 59 (Freelift Pro « RG », D-2026-09-27-07).
    inconnueUnCote: "proche",
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
};

export const CATEGORY_RULES: Record<DealCategory, CategoryRules> = {
  raquettes: {
    attributes: {
      grip: "variante",
      cordee: "variante", // cordée / non cordée
      poids: "proche", // voir `numeric.poids`
      tamis: "different", // 98 / 100 / 107…
      version: "different", // Lite / Tour / Team / Plus / S Lite…
      plan_cordage: "different", // 16x19 / 18x20
      longueur: "different", // standard / +0,5 pouce (« Plus »)
    },
    numeric: {
      // Poids non cordé, en grammes. ±10 g = proche (§5) ; au-delà = différent.
      poids: { variante: 0, proche: 10 },
    },
    generationRule: "standard",
    notes: [
      "Q1 : un poids écrit entre parenthèses par le marchand (paire R1 n° 2) est traité comme précision de fiche. Poids identique des deux côtés = variante ; écart ≤ 10 g sans changement de version = proche ; > 10 g = différent.",
      "Q2 : plan de cordage et longueur ajoutés en « différent » (absents du §5). Exemple R1 n° 6 : FX 500 Lite 16x18 contre 16/19.",
    ],
  },
  chaussures: {
    attributes: {
      pointure: "variante",
      surface: "proche", // terre battue / toutes surfaces / gazon
      genre: "different",
      largeur: "different", // version large (« wide »)
      version: "different", // ex. Gel-Resolution / Gel-Resolution Clay : voir Q3
    },
    generationRule: "standard",
    notes: [
      "Q3 : la surface est souvent écrite dans le nom (« Clay »). Elle compte comme attribut « proche », pas comme une version différente.",
    ],
  },
  cordages: {
    attributes: {
      jauge: "proche", // D-2026-09-27-05
      conditionnement: "different", // garniture / bobine
      longueur: "different",
      matiere: "different",
    },
    unitType: "metre",
    generationRule: "standard",
    notes: [
      "Jauge au choix dans la fiche (même jauge disponible des deux côtés) = variante (§5).",
      "Q4 : garniture et bobine sont deux produits différents, mais leur prix est aussi affiché au mètre (principe R5). Le « meilleur prix » n'est jamais écrit entre les deux (R6).",
    ],
  },
  accessoires: {
    attributes: {
      type: "different", // balles / surgrip / sac / antivibrateur…
      conditionnement: "different", // tube de 4, carton de 72, lot de 3 surgrips…
      pression: "different", // balles avec / sans pression
      contenance: "different", // sacs : nombre de raquettes
    },
    unitType: "unite",
    generationRule: "standard",
    notes: [
      "Balles : comparaison à la balle (unitType « balle » à appliquer quand type = balles).",
      "Sacs : règle des générations standard, « identique » seulement pour exactement la même référence (D-2026-09-27-07).",
      "Q5 : pression et contenance ajoutées en « différent » (absentes du §5).",
    ],
  },
  textile: {
    attributes: {
      taille: "variante",
      type: "different", // t-shirt / short / robe…
      genre: "different",
      modele: "different",
    },
    generationRule: "textile",
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
