/**
 * Extraction des attributs d'une offre pour le moteur de rapprochement (R4.2).
 *
 * Périmètre : raquettes et cordages (R4.2), chaussures et accessoires (R4.3), textile (R4.5-a). Fonctions pures, sans base ni réseau ; le script qui lit `deals` et
 * écrit les tables `match_*` viendra en R4.4.
 */

import { extractAccessoryAttributes, accessorySubcategory, SUBCATEGORIES_WITH_FAMILIES } from "./accessories.ts";
import type { AccessoryFamilyEntry } from "../../config/model-families-accessoires.ts";
import { familyKey, recognizeFamily } from "./families.ts";
import { extractRacquetAttributes } from "./racquets.ts";
import { extractShoeAttributes } from "./shoes.ts";
import { cleanGtin, manufacturerReferences, residualTerms, setAttr, type Attributes } from "./shared.ts";
import { extractStringAttributes } from "./strings.ts";
import { extractTextileAttributes } from "./textile.ts";
import { fullNormalize } from "./text.ts";
import type { ExtractedOffer, OfferInput } from "./types.ts";

export type { ExtractedAttribute, ExtractedOffer, OfferInput } from "./types.ts";
export { familyKey } from "./families.ts";

/** Catégories couvertes par cette version de l'extraction. */
export const SUPPORTED_CATEGORIES = ["raquettes", "cordages", "chaussures", "accessoires", "textile"] as const;

export function isSupportedCategory(category: string): boolean {
  return (SUPPORTED_CATEGORIES as readonly string[]).includes(category);
}

export function extractOfferAttributes(offer: OfferInput): ExtractedOffer {
  if (!isSupportedCategory(offer.categorie)) {
    throw new Error(`Catégorie non prise en charge par l'extraction R4.5 : ${offer.categorie}`);
  }

  const attrs: Attributes = {};
  const alertes: string[] = [];
  if (offer.categorie === "textile") return extractTextileOffer(offer, attrs, alertes);
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

/**
 * Textile (R4.5-a) : pas de référentiel de familles. La « famille » est marque + type précis
 * (`marque|type|textile`) ; le nom du modèle est un attribut (`modele`), comparé comme les autres.
 * Marque ou type illisible : offre non reconnue, jamais rapprochée par le titre.
 */
function extractTextileOffer(offer: OfferInput, attrs: Attributes, alertes: string[]): ExtractedOffer {
  const t = extractTextileAttributes(offer, attrs, alertes);
  const recognized = t.brandKey !== null && t.type !== null;
  return {
    categorie: "textile",
    marque: offer.marque,
    familyKey: recognized ? `${t.brandKey}|${t.type}|textile` : null,
    famille: recognized ? t.type : null,
    subcategory: null,
    alias: null,
    attributes: attrs,
    gtin: cleanGtin(offer.gtin),
    referencesFabricant: t.references,
    nonReconnu: recognized
      ? null
      : { reason: t.brandKey === null ? "marque_inconnue" : "famille_inconnue", termes: t.residual },
    alertes,
  };
}
