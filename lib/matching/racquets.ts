/**
 * Extraction des attributs d'une raquette (R4.2).
 *
 * Sources, de la plus fiable à la moins fiable (`ATTRIBUTE_SOURCES`) : fiche
 * technique SportSystem (`fiche_marchand`), puis titre (`titre_description`).
 * Le poids `grams` des variantes Tennis Point FR est un poids d'expédition :
 * jamais utilisé (R4_cadrage.md §2.3).
 */

import type { FamilyEntry } from "../../config/model-families.ts";
import {
  ageGroupOf,
  extractCorded,
  extractEdition,
  extractGeneration,
  extractGift,
  extractLot,
  feature,
  readVersionAndStripAlias,
  setAttr,
  sportSystemFeatures,
  type Attributes,
} from "./shared.ts";
import { fullNormalize, lightNormalize } from "./text.ts";
import type { OfferInput } from "./types.ts";

const WEIGHT_RANGE = { min: 230, max: 340 };
const HEAD_SIZE_RANGE = { min: 85, max: 135 };

/** Plan de cordage : « 16x19 », « 16/19 », « 18*20 » (le `*` est déjà devenu `x`). */
const STRING_PATTERN = /(?<![0-9])(1[4-9]|20)\s?[x/]\s?(1[6-9]|2[0-3])(?![0-9])/;

/** Taille d'une raquette enfant, en pouces (17 à 26) : nombre isolé, « Jr.25 » compris (le point est une espace). */
const JUNIOR_SIZE_PATTERN = /(?<![0-9a-z])(1[7-9]|2[0-6])(?![0-9a-z])/;

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
  // « x2 » collé à la fin du modèle = pack de 2 raquettes (Babolat « Pure Aero 98 x2 », 599,95 € = 2 × 299,95 €,
  // référence différente). Lu seulement pour les raquettes : « 16x19 » est exclu (chiffre avant le « x »).
  const packSuffix = /(?<![a-z0-9])x(\d)(?![a-z0-9])/.exec(light);
  const lot =
    extractLot(light) ??
    (packSuffix && Number(packSuffix[1]) >= 2 ? { count: Number(packSuffix[1]), text: packSuffix[0], assumed: false } : null);
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
  else if (plusLength) setAttr(attrs, "longueur", 27.5, "titre_marqueur");

  const cleanedForAge = light;
  const age = ageGroupOf(cleanedForAge, entry, "raquettes");

  // À partir d'ici : texte de famille (alias, versions, générations).
  let text = fullNormalize(light);

  const generation = extractGeneration(text, entry);
  if (generation.label) setAttr(attrs, "generation", generation.label, "titre_description");
  if (generation.year) setAttr(attrs, "annee", generation.year, "titre_description");
  if (generation.marker) text = fullNormalize(text.replace(generation.marker, " "));

  // L'alias de famille est retiré : ses chiffres (« tf 40 », « l23 ») ne sont ni tamis ni poids.
  const stripped = readVersionAndStripAlias(text, entry, alias);
  text = stripped.text;
  const version = stripped.version;
  if (version) setAttr(attrs, "version", version, "titre_description");
  const editionResult = extractEdition(text, entry);
  if (editionResult) {
    setAttr(attrs, "edition", editionResult.edition, "titre_description");
    text = editionResult.rest;
  }

  // Raquette enfant (B1, D-2026-09-30-07) : un nombre de 17 à 26, isolé ou collé à « jr. », est la
  // longueur en pouces. Marqueur écrit du titre, jamais levé par C-Q3 ; deux tailles différentes = « proche ».
  if (age === "enfant" && !attrs.longueur) {
    const size = JUNIOR_SIZE_PATTERN.exec(text);
    if (size) {
      setAttr(attrs, "longueur", Number(size[1]), "titre_marqueur");
      text = `${text.slice(0, size.index)} ${text.slice(size.index + size[0].length)}`.replace(/\s+/g, " ").trim();
    }
  }

  // Tamis lu dans la version (« 98 », « 100 Pro », « Team 103 »), sinon dans un nombre isolé.
  if (!attrs.tamis) {
    const source = version ? fullNormalize(version) : "";
    const fromVersion = /(?<![0-9])(\d{2,3})(?![0-9])/.exec(source);
    if (fromVersion && inRange(Number(fromVersion[1]), HEAD_SIZE_RANGE)) {
      setAttr(attrs, "tamis", Number(fromVersion[1]), "titre_description");
    }
  }

  // Poids écrit dans le nom du modèle (T-Fight 300, Tempo 270, Q1) : poids ordinaire.
  const bareNumbers = [...text.matchAll(/(?<![0-9a-z])(\d{2,3})(?![0-9a-z])/g)].map((m) => Number(m[1]));
  if (!attrs.poids) {
    const fromVersion = version ? Number(/(?<![0-9])(\d{3})(?![0-9])/.exec(fullNormalize(version))?.[1]) : NaN;
    const candidate = inRange(fromVersion, WEIGHT_RANGE) ? fromVersion : bareNumbers.find((n) => inRange(n, WEIGHT_RANGE));
    if (candidate !== undefined) setAttr(attrs, "poids", candidate, "titre_description");
  }
  if (!attrs.tamis) {
    const candidate = bareNumbers.find((n) => inRange(n, { min: 90, max: 115 }));
    if (candidate !== undefined) setAttr(attrs, "tamis", candidate, "titre_description");
  }

  // Âge lu sur le titre sans plan de cordage ni poids (« 16/19 » ne contient pas la taille junior 19).
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
