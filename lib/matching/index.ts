/**
 * Extraction des attributs d'une offre pour le moteur de rapprochement (R4.2).
 *
 * Périmètre : raquettes et cordages (R4.2), chaussures et accessoires (R4.3) ;
 * textile : R4.5. Fonctions pures, sans base ni réseau ; le script qui lit `deals` et
 * écrit les tables `match_*` viendra en R4.4.
 */

import { extractAccessoryAttributes, accessorySubcategory, SUBCATEGORIES_WITH_FAMILIES } from "./accessories";
import type { AccessoryFamilyEntry } from "@/config/model-families-accessoires";
import { familyKey, recognizeFamily } from "./families";
import { extractRacquetAttributes } from "./racquets";
import { extractShoeAttributes } from "./shoes";
import { cleanGtin, manufacturerReferences, residualTerms, setAttr, type Attributes } from "./shared";
import { extractStringAttributes } from "./strings";
import { fullNormalize } from "./text";
import type { ExtractedOffer, OfferInput } from "./types";

export type { ExtractedAttribute, ExtractedOffer, OfferInput } from "./types";
export { familyKey } from "./families";

/** Catégories couvertes par cette version de l'extraction. */
export const SUPPORTED_CATEGORIES = ["raquettes", "cordages", "chaussures", "accessoires"] as const;

export function isSupportedCategory(category: string): boolean {
  return (SUPPORTED_CATEGORIES as readonly string[]).includes(category);
}

export function extractOfferAttributes(offer: OfferInput): ExtractedOffer {
  if (!isSupportedCategory(offer.categorie)) {
    throw new Error(`Catégorie non prise en charge par l'extraction R4.3 : ${offer.categorie}`);
  }

  const attrs: Attributes = {};
  const alertes: string[] = [];
  const subcategory = offer.categorie === "accessoires" ? accessorySubcategory(offer) : null;
  // Accessoires : seules les familles de la sous-catégorie de l'offre sont candidates.
  const match = recognizeFamily(
    fullNormalize(offer.titre),
    offer.marque,
    offer.categorie,
    undefined,
    offer.categorie === "accessoires"
      ? (e) => subcategory !== null && (e as AccessoryFamilyEntry).subcategory === subcategory
      : undefined,
  );
  const entry = match?.entry ?? null;
  const alias = match?.alias ?? null;

  if (offer.categorie === "raquettes") extractRacquetAttributes(offer, entry, alias, attrs, alertes);
  else if (offer.categorie === "cordages") extractStringAttributes(offer, entry, alias, attrs, alertes);
  else if (offer.categorie === "chaussures") extractShoeAttributes(offer, entry, alias, attrs, alertes);
  else extractAccessoryAttributes(offer, entry, alias, subcategory, attrs, alertes);

  const gtin = cleanGtin(offer.gtin);
  const referencesFabricant = manufacturerReferences(offer);
  if (offer.categorie === "cordages") setAttr(attrs, "age_group", "adulte", "titre_description");

  const marque = entry?.brand ?? offer.marque;
  let nonReconnu: ExtractedOffer["nonReconnu"] = null;
  if (!entry) {
    const brandKnown = Boolean(offer.marque) && fullNormalize(offer.marque!) !== "sportsystem";
    const noFamilyPlanned =
      offer.categorie === "accessoires" && (subcategory === null || !SUBCATEGORIES_WITH_FAMILIES.includes(subcategory));
    nonReconnu = {
      reason: noFamilyPlanned ? "sans_famille_prevue" : brandKnown ? "famille_inconnue" : "marque_inconnue",
      termes: residualTerms(offer.titre, offer.marque),
    };
  }

  return {
    categorie: offer.categorie,
    marque,
    familyKey: entry ? familyKey(entry) : null,
    famille: entry?.family ?? null,
    subcategory,
    alias,
    attributes: attrs,
    gtin,
    referencesFabricant,
    nonReconnu,
    alertes,
  };
}
