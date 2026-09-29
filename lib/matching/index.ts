/**
 * Extraction des attributs d'une offre pour le moteur de rapprochement (R4.2).
 *
 * Périmètre : raquettes et cordages (chaussures et accessoires : R4.3, textile :
 * R4.5). Fonctions pures, sans base ni réseau ; le script qui lit `deals` et
 * écrit les tables `match_*` viendra en R4.4.
 */

import { familyKey, recognizeFamily } from "./families";
import { extractRacquetAttributes } from "./racquets";
import { cleanGtin, cleanMpn, residualTerms, setAttr, type Attributes } from "./shared";
import { extractStringAttributes } from "./strings";
import { fullNormalize } from "./text";
import type { ExtractedOffer, OfferInput } from "./types";

export type { ExtractedAttribute, ExtractedOffer, OfferInput } from "./types";
export { familyKey } from "./families";

/** Catégories couvertes par cette version de l'extraction. */
export const SUPPORTED_CATEGORIES = ["raquettes", "cordages"] as const;

export function isSupportedCategory(category: string): boolean {
  return (SUPPORTED_CATEGORIES as readonly string[]).includes(category);
}

export function extractOfferAttributes(offer: OfferInput): ExtractedOffer {
  if (!isSupportedCategory(offer.categorie)) {
    throw new Error(`Catégorie non prise en charge par l'extraction R4.2 : ${offer.categorie}`);
  }

  const attrs: Attributes = {};
  const alertes: string[] = [];
  const match = recognizeFamily(fullNormalize(offer.titre), offer.marque, offer.categorie);
  const entry = match?.entry ?? null;
  const alias = match?.alias ?? null;

  if (offer.categorie === "raquettes") extractRacquetAttributes(offer, entry, alias, attrs, alertes);
  else extractStringAttributes(offer, entry, alias, attrs, alertes);

  const gtin = cleanGtin(offer.gtin);
  const referenceFabricant = cleanMpn(offer);
  if (offer.categorie === "cordages") setAttr(attrs, "age_group", "adulte", "titre_description");

  const marque = entry?.brand ?? offer.marque;
  let nonReconnu: ExtractedOffer["nonReconnu"] = null;
  if (!entry) {
    const brandKnown = Boolean(offer.marque) && fullNormalize(offer.marque!) !== "sportsystem";
    nonReconnu = {
      reason: brandKnown ? "famille_inconnue" : "marque_inconnue",
      termes: residualTerms(offer.titre, offer.marque),
    };
  }

  return {
    categorie: offer.categorie,
    marque,
    familyKey: entry ? familyKey(entry) : null,
    famille: entry?.family ?? null,
    alias,
    attributes: attrs,
    gtin,
    referenceFabricant,
    nonReconnu,
    alertes,
  };
}
