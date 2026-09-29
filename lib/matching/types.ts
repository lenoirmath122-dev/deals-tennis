/**
 * Types de l'extraction d'attributs du moteur de rapprochement (R4.2).
 *
 * Fonctions pures : aucune lecture de base, aucun accès réseau. Les noms
 * d'attributs suivent `config/matching-rules.ts` (`CATEGORY_RULES`,
 * `COMMON_ATTRIBUTES`).
 */

import type { ATTRIBUTE_SOURCES } from "@/config/matching-rules";
import type { DealCategory } from "@/types/database";

export type AttributeSource = (typeof ATTRIBUTE_SOURCES)[number];

export type AttributeValue = string | number | boolean;

export interface ExtractedAttribute {
  value: AttributeValue;
  /** D'où vient la valeur (la plus fiable disponible, §6 du cadrage). */
  source: AttributeSource;
}

/** Ce que l'extraction lit d'une offre (colonnes de `deals`, sans dépendance à la base). */
export interface OfferInput {
  marchand: string;
  titre: string;
  marque: string | null;
  categorie: DealCategory;
  gtin?: string | null;
  mpn?: string | null;
  merchant_sku?: string | null;
  raw_attributes?: Record<string, unknown> | null;
}

export type UnrecognizedReason = "famille_inconnue" | "marque_inconnue";

export interface ExtractedOffer {
  categorie: DealCategory;
  /** Marque canonique (celle du référentiel si la famille est reconnue). */
  marque: string | null;
  /** `marque|famille|catégorie`, clé stable de la famille reconnue. */
  familyKey: string | null;
  famille: string | null;
  /** Alias de famille trouvé dans le titre (le plus long). */
  alias: string | null;
  attributes: Record<string, ExtractedAttribute>;
  /** GTIN valide (8, 12, 13 ou 14 chiffres), sinon null. */
  gtin: string | null;
  /**
   * Références fabricant (recopie de la référence marchand écartée) ; plusieurs
   * quand la fiche en donne une par variante (SportSystem).
   */
  referencesFabricant: { value: string; source: AttributeSource }[];
  /** Renseigné seulement si la famille n'est pas reconnue. */
  nonReconnu: { reason: UnrecognizedReason; termes: string[] } | null;
  /** Points douteux à relire (ex. `longueur_douteuse`), sans effet sur la comparaison. */
  alertes: string[];
}
