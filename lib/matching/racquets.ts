/**
 * Extraction des attributs d'une raquette (R4.2).
 *
 * Sources, de la plus fiable à la moins fiable (`ATTRIBUTE_SOURCES`) : fiche
 * technique SportSystem (`fiche_marchand`), puis titre (`titre_description`).
 * Le poids `grams` des variantes Tennis Point FR est un poids d'expédition :
 * jamais utilisé (R4_cadrage.md §2.3).
 */

import type { FamilyEntry } from "../../config/model-families.ts";
import { shortestAliasIn } from "./families.ts";
import {
  ageGroupOf,
  extractCorded,
  extractEdition,
  extractGeneration,
  extractGift,
  extractLot,
  extractVersion,
  feature,
  setAttr,
  sportSystemFeatures,
  type Attributes,
} from "./shared.ts";
import { fullNormalize, lightNormalize, removePhrase } from "./text.ts";
import type { OfferInput } from "./types.ts";

const WEIGHT_RANGE = { min: 230, max: 340 };
const HEAD_SIZE_RANGE = { min: 85, max: 135 };

/** Plan de cordage : « 16x19 », « 16/19 », « 18*20 » (le `*` est déjà devenu `x`). */
const STRING_PATTERN = /(?<![0-9])(1[4-9]|20)\s?[x/]\s?(1[6-9]|2[0-3])(?![0-9])/;

export function extractRacquetAttributes(
  offer: OfferInput,
  entry: FamilyEntry | null,
  alias: string | null,
  attrs: Attributes,
  alertes: string[],
): { residual: string } {
  const features = sportSystemFeatures(offer);
  let light = lightNormalize(offer.titre);

  // Lot et cadeau d'abord : leurs chiffres ne doivent pas être relus ailleurs.
  const lot = extractLot(light);
  if (lot) {
    setAttr(attrs, "lot", lot.count, "titre_description");
    if (lot.assumed) alertes.push("lot_quantite_supposee");
    light = light.replace(lot.text, " ");
  }
  const gift = extractGift(light);
  if (gift) {
    setAttr(attrs, "cadeau", gift.text, "titre_description");
    light = gift.rest;
  }

  const corded = extractCorded(light);
  const variantTitles = Array.isArray(offer.raw_attributes?.variants)
    ? (offer.raw_attributes!.variants as { title?: unknown }[]).map((v) => lightNormalize(String(v?.title ?? "")))
    : [];
  const cordedFromVariants = variantTitles.some((t) => /non cord/.test(t))
    ? "non_cordee"
    : variantTitles.some((t) => /cord/.test(t))
      ? "cordee"
      : null;
  const cordedState = corded ?? cordedFromVariants;
  if (cordedState) setAttr(attrs, "cordee", cordedState === "cordee", corded ? "titre_description" : "donnees_structurees");

  // Poids : fiche, puis « (305 Gr) », « 285 grammes ».
  const weightFeature = feature(features, "poids");
  const weightFromFeature = weightFeature ? Number(weightFeature.replace(",", ".").match(/\d+(?:\.\d+)?/)?.[0]) : NaN;
  const explicitWeight = /(?<![0-9])(\d{3})\s?(?:gr|grs|g|gramme|grammes)(?![a-z])/.exec(light);
  if (explicitWeight) light = light.replace(explicitWeight[0], " ");
  if (Number.isFinite(weightFromFeature)) setAttr(attrs, "poids", weightFromFeature, "fiche_marchand");
  else if (explicitWeight) setAttr(attrs, "poids", Number(explicitWeight[1]), "titre_description");

  // Plan de cordage.
  const stringFeature = feature(features, "plan de cordage");
  const stringInTitle = STRING_PATTERN.exec(light);
  if (stringInTitle) light = light.replace(stringInTitle[0], " ");
  const stringFromFeature = stringFeature ? STRING_PATTERN.exec(lightNormalize(stringFeature)) : null;
  if (stringFromFeature) setAttr(attrs, "plan_cordage", `${stringFromFeature[1]}x${stringFromFeature[2]}`, "fiche_marchand");
  else if (stringInTitle) setAttr(attrs, "plan_cordage", `${stringInTitle[1]}x${stringInTitle[2]}`, "titre_description");

  // Tamis : fiche (« 645 cm² / 100 sq. in. »), puis unité écrite dans le titre.
  const headFeature = feature(features, "tamis");
  const headFromFeature = headFeature ? parseHeadSize(lightNormalize(headFeature)) : null;
  const headUnit = /(?<![0-9])(\d{2,3})\s?(?:sq\.? ?in\.?|po2)/.exec(light);
  if (headFromFeature) setAttr(attrs, "tamis", headFromFeature, "fiche_marchand");
  else if (headUnit) {
    setAttr(attrs, "tamis", Number(headUnit[1]), "titre_description");
    light = light.replace(headUnit[0], " ");
  }

  // Longueur : fiche (« 27 in. / 68.5 cm. »), puis « + » écrit dans le titre (Q2).
  const lengthFeature = feature(features, "longueur");
  const lengthFromFeature = lengthFeature ? /(\d{2}(?:\.\d)?)\s?in/.exec(lightNormalize(lengthFeature)) : null;
  const plusLength = /(?<![a-z0-9+])\+(?![a-z0-9+])/.test(light);
  if (lengthFromFeature) setAttr(attrs, "longueur", Number(lengthFromFeature[1]), "fiche_marchand");
  else if (plusLength) setAttr(attrs, "longueur", 27.5, "titre_description");

  const cleanedForAge = light;

  // À partir d'ici : texte de famille (alias, versions, générations).
  let text = fullNormalize(light);

  const generation = extractGeneration(text, entry);
  if (generation.label) setAttr(attrs, "generation", generation.label, "titre_description");
  if (generation.year) setAttr(attrs, "annee", generation.year, "titre_description");
  if (generation.marker) text = fullNormalize(text.replace(generation.marker, " "));

  // L'alias de famille est retiré : ses chiffres (« tf 40 », « l23 ») ne sont ni tamis ni poids.
  const removable = entry ? shortestAliasIn(text, entry) : alias;
  if (removable) text = removePhrase(text, removable);
  const versionResult = extractVersion(text, entry);
  if (versionResult) {
    setAttr(attrs, "version", versionResult.version, "titre_description");
    text = versionResult.rest;
  }
  const editionResult = extractEdition(text, entry);
  if (editionResult) {
    setAttr(attrs, "edition", editionResult.edition, "titre_description");
    text = editionResult.rest;
  }

  // Tamis lu dans la version (« 98 », « 100 Pro », « Team 103 »), sinon dans un nombre isolé.
  if (!attrs.tamis) {
    const source = versionResult?.version ? fullNormalize(versionResult.version) : "";
    const fromVersion = /(?<![0-9])(\d{2,3})(?![0-9])/.exec(source);
    if (fromVersion && inRange(Number(fromVersion[1]), HEAD_SIZE_RANGE)) {
      setAttr(attrs, "tamis", Number(fromVersion[1]), "titre_description");
    }
  }

  // Poids écrit dans le nom du modèle (T-Fight 300, Tempo 270, Q1) : poids ordinaire.
  const bareNumbers = [...text.matchAll(/(?<![0-9a-z])(\d{2,3})(?![0-9a-z])/g)].map((m) => Number(m[1]));
  if (!attrs.poids) {
    const fromVersion = versionResult ? Number(/(?<![0-9])(\d{3})(?![0-9])/.exec(fullNormalize(versionResult.version))?.[1]) : NaN;
    const candidate = inRange(fromVersion, WEIGHT_RANGE) ? fromVersion : bareNumbers.find((n) => inRange(n, WEIGHT_RANGE));
    if (candidate !== undefined) setAttr(attrs, "poids", candidate, "titre_description");
  }
  if (!attrs.tamis) {
    const candidate = bareNumbers.find((n) => inRange(n, { min: 90, max: 115 }));
    if (candidate !== undefined) setAttr(attrs, "tamis", candidate, "titre_description");
  }

  // Âge lu sur le titre sans plan de cordage ni poids (« 16/19 » ne contient pas la taille junior 19).
  const age = ageGroupOf(cleanedForAge, entry, "raquettes");
  setAttr(attrs, "age_group", age, "titre_description");

  return { residual: text };
}

function inRange(value: number, range: { min: number; max: number }): boolean {
  return Number.isFinite(value) && value >= range.min && value <= range.max;
}

/** « 645 cm² / 100 sq. in. » → 100 ; « 645 cm2 » → 100 (arrondi). */
function parseHeadSize(text: string): number | null {
  const sqIn = /(\d{2,3})\s?sq/.exec(text);
  if (sqIn) return Number(sqIn[1]);
  const cm = /(\d{3})\s?cm/.exec(text);
  return cm ? Math.round(Number(cm[1]) / 6.4516) : null;
}
