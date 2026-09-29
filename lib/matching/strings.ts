/**
 * Extraction des attributs d'un cordage (R4.2) : jauge, longueur, conditionnement
 * (garniture / bobine), matière, lot, cadeau, édition, version.
 */

import type { FamilyEntry } from "@/config/model-families";
import {
  extractEdition,
  extractGift,
  extractLot,
  extractVersion,
  setAttr,
  type Attributes,
} from "./shared";
import { fullNormalize, lightNormalize, removePhrase } from "./text";
import type { OfferInput } from "./types";

/** Longueur maximale d'une garniture (12 m, 12,2 m…) ; au-delà, bobine. */
const SET_MAX_METERS = 13;
/** En dessous, la longueur écrite est jugée fausse (« Rouleau de 2 mètres » pour une bobine, R1 paire 67). */
const MIN_RELIABLE_METERS = 5;

const MATERIALS: [string, RegExp][] = [
  ["boyau naturel", /\b(?:boyau naturel|natural gut)\b/],
  ["polyester", /\b(?:polyester|co ?poly|monofilament polyester)\b/],
  ["multifilament", /\bmultifilaments?\b/],
  ["hybride", /\bhybrides?\b/],
  ["kevlar", /\bkevlar\b/],
  ["nylon", /\bnylon\b/],
];

export function extractStringAttributes(
  offer: OfferInput,
  entry: FamilyEntry | null,
  alias: string | null,
  attrs: Attributes,
  alertes: string[],
): { residual: string } {
  let light = lightNormalize(offer.titre);

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

  // Jauge en millimètres : « 1.25mm », « 1,30 Mm ». Plusieurs jauges = au choix dans la fiche.
  const gauges = [...light.matchAll(/(?<![0-9])(1[.,]\d{1,2})\s?mm\b/g)].map((m) => Number(m[1].replace(",", ".")));
  if (gauges.length > 0) {
    setAttr(attrs, "jauge", gauges[0], "titre_description");
    if (new Set(gauges).size > 1) alertes.push("jauges_multiples");
    light = light.replace(/(?<![0-9])1[.,]\d{1,2}\s?mm\b/g, " ");
  }

  // Longueur en mètres : « (200 Metres) », « 12,2 mètres », « bobine 220m », « (200m) ».
  const length = /(?<![0-9.,])(\d{1,3}(?:[.,]\d{1,2})?)\s?(?:m|metres?)(?![a-z])/.exec(light);
  let meters: number | null = null;
  if (length) {
    meters = Number(length[1].replace(",", "."));
    light = light.replace(length[0], " ");
  }
  if (meters !== null && meters < MIN_RELIABLE_METERS) {
    alertes.push("longueur_douteuse");
    meters = null;
  }
  if (meters !== null) setAttr(attrs, "longueur", meters, "titre_description");

  // Garniture ou bobine : longueur, sinon mot du titre (« bobine »).
  if (meters !== null) {
    setAttr(attrs, "conditionnement", meters <= SET_MAX_METERS ? "garniture" : "bobine", "titre_description");
  } else if (/\bbobine\b|\breel\b/.test(light)) {
    setAttr(attrs, "conditionnement", "bobine", "titre_description");
  } else if (/\bgarniture\b|\bset\b/.test(light)) {
    setAttr(attrs, "conditionnement", "garniture", "titre_description");
  }

  for (const [material, pattern] of MATERIALS) {
    if (pattern.test(light)) {
      setAttr(attrs, "matiere", material, "titre_description");
      break;
    }
  }

  let text = fullNormalize(light);
  if (alias) text = removePhrase(text, alias);

  // Jauge écrite en centièmes après le nom (« Alu Power 125 » = 1,25 mm, Amazon, R1 paire 66).
  if (!attrs.jauge) {
    const centi = /(?<![0-9a-z])(1[0-4]\d)(?![0-9a-z])/.exec(text);
    if (centi) {
      setAttr(attrs, "jauge", Number(centi[1]) / 100, "titre_description");
      text = removePhrase(text, centi[1]);
    }
  }

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

  return { residual: text };
}
