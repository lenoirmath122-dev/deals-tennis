/**
 * Extraction des attributs d'un accessoire (R4.3), par sous-catégorie :
 * - balles : niveau, pression, conditionnement (`lot` = nombre de balles) ;
 * - grips / surgrips : type de grip, nombre de pièces (`lot`) ;
 * - antivibrateurs : nombre de pièces ;
 * - sacs : format, contenance.
 * Protection et soins, « autres accessoires » : type seulement (pas de famille
 * prévue au référentiel).
 *
 * `type_sac` (format du sac) n'existe pas encore dans `CATEGORY_RULES` : lu ici,
 * à ajouter au rôle « différent » en R4.4 si Mathieu valide
 * (`R4_3_complement_referentiel.md`).
 */

import { SUBCATEGORY_RULES, type AccessorySubcategory } from "@/config/accessory-subcategories";
import { BALL_LEVEL_MARKERS, type AccessoryFamilyEntry } from "@/config/model-families-accessoires";
import type { FamilyEntry } from "@/config/model-families";
import { shortestAliasIn } from "./families";
import {
  ageGroupOf,
  extractEdition,
  extractGeneration,
  extractGift,
  extractVersion,
  setAttr,
  type Attributes,
} from "./shared";
import { fullNormalize, lightNormalize, phraseRegExp, removePhrase } from "./text";
import type { OfferInput } from "./types";

/** Sous-catégorie d'après le titre (mêmes règles que l'ingestion, `SUBCATEGORY_RULES`), sinon `null`. */
export function subcategoryOf(title: string): AccessorySubcategory | null {
  const lower = title.toLowerCase();
  return SUBCATEGORY_RULES.find((rule) => rule.pattern.test(lower))?.subcategory ?? null;
}

/** Sous-catégories qui ont des familles au référentiel. */
export const SUBCATEGORIES_WITH_FAMILIES: readonly AccessorySubcategory[] = [
  "balles",
  "grips_surgrips",
  "antivibrateurs",
  "sacs",
];

export function accessorySubcategory(offer: OfferInput): AccessorySubcategory | null {
  return offer.subcategory ?? subcategoryOf(offer.titre);
}

/** Formats de sac écrits dans le titre (le premier de la liste qui correspond l'emporte). */
const BAG_FORMATS: [string, RegExp][] = [
  ["thermobag", /\b(?:thermobag|thermo bag|isotherme)\b/],
  ["sac_a_dos", /\b(?:sac a dos|backpack|rackpack|back pack)\b/],
  ["duffle", /\b(?:duffle|duffel|sac de sport|holdall)\b/],
  ["housse", /\bhousse\b/],
  ["tote", /\btote\b/],
];

const num = (value: string) => Number(value.replace(",", "."));

/** Nombre de balles d'un conditionnement, ou `null` si le titre ne le donne pas. */
function ballPack(light: string): { label: string; balls: number | null; text: string } | null {
  // « Carton de 24 tubes de 3 balles » = 72 balles.
  const cartonTubes = /\bcarton (?:de )?(\d{1,3}) tubes? (?:de )?(\d{1,2})\b/.exec(light);
  if (cartonTubes) {
    const [tubes, per] = [Number(cartonTubes[1]), Number(cartonTubes[2])];
    return { label: `carton_${tubes}_tubes_de_${per}`, balls: tubes * per, text: cartonTubes[0] };
  }
  const carton = /\bcarton (?:de )?(\d{1,3})\b/.exec(light);
  if (carton) return { label: `carton_de_${carton[1]}`, balls: Number(carton[1]), text: carton[0] };
  const tube = /\btube (?:de )?(\d{1,2})\b/.exec(light);
  if (tube) return { label: `tube_de_${tube[1]}`, balls: Number(tube[1]), text: tube[0] };
  // « 3er » / « 4er » (allemand, Wilson Triniti) = tube de 3 / 4.
  const er = /(?<![0-9a-z])(\d{1,2})er\b/.exec(light);
  if (er) return { label: `tube_de_${er[1]}`, balls: Number(er[1]), text: er[0] };
  const sachet = /\b(?:sachet|baril|seau|sac) (?:de )?(\d{1,3})\b/.exec(light);
  if (sachet) return { label: `${sachet[0].split(" ")[0]}_de_${sachet[1]}`, balls: Number(sachet[1]), text: sachet[0] };
  const bipack = /\b(?:bipack|bi pack|double pack)\b/.exec(light);
  // Un bipack = deux tubes, dont le nombre de balles n'est pas écrit : pas de quantité déduite.
  if (bipack) return { label: "bipack", balls: null, text: bipack[0] };
  return null;
}

/** Nombre de pièces d'un grip, surgrip ou antivibrateur : « x12 », « pack de 3 », « lot de 30 », « 12 surgrips ». */
function pieceCount(light: string): { count: number; text: string } | null {
  const patterns = [
    /(?<![a-z0-9.])x\s?(\d{1,3})(?![0-9a-z])/,
    /\b(?:pack|lot|set|paquet|boite|boite de|sachet)\s+(?:de\s+)?(\d{1,3})\b/,
    /(?<![0-9.,])(\d{1,3})\s?x?\s+(?:surgrips?|overgrips?|grips?|antivibrateurs?|dampeners?|damps?)\b/,
  ];
  for (const pattern of patterns) {
    const found = pattern.exec(light);
    if (found && Number(found[1]) >= 2) return { count: Number(found[1]), text: found[0] };
  }
  return null;
}

/** Contenance d'un sac : nombre de raquettes (« 6 raquettes », « RH9 », « 12R ») ou litres. */
function bagCapacity(light: string): { value: string; text: string } | null {
  const rackets = /(?<![0-9a-z])(\d{1,2})\s?(?:raquettes?|rackets?|r)(?![a-z])/.exec(light) ?? /\brh\s?(\d{1,2})\b/.exec(light);
  if (rackets) return { value: `${rackets[1]} raquettes`, text: rackets[0] };
  const liters = /(?<![0-9.,])(\d{2,3}(?:[.,]\d)?)\s?(?:l|litres?)(?![a-z])/.exec(light);
  if (liters) return { value: `${num(liters[1])} l`, text: liters[0] };
  return null;
}

export function extractAccessoryAttributes(
  offer: OfferInput,
  entry: FamilyEntry | null,
  alias: string | null,
  subcategory: AccessorySubcategory | null,
  attrs: Attributes,
  alertes: string[],
): { residual: string } {
  let light = lightNormalize(offer.titre);
  const family = entry as AccessoryFamilyEntry | null;

  const gift = extractGift(light);
  if (gift) {
    setAttr(attrs, "cadeau", gift.text, "titre_description");
    light = gift.rest;
  }

  if (subcategory === "balles") {
    setAttr(attrs, "type", "balles", "titre_description");
    const level = Object.entries(BALL_LEVEL_MARKERS).find(([, markers]) =>
      markers.some((m) => phraseRegExp(fullNormalize(m)).test(fullNormalize(light))),
    );
    if (level) setAttr(attrs, "niveau", level[0], "titre_description");
    else if (entry) setAttr(attrs, "niveau", "standard", "titre_description");
    if (/\b(?:sans pression|pressureless|non pressuris\w*|depressuris\w*)\b/.test(light)) {
      setAttr(attrs, "pression", "sans_pression", "titre_description");
    } else if (/\b(?:pressuris\w*|avec pression|pressurized)\b/.test(light)) {
      setAttr(attrs, "pression", "avec_pression", "titre_description");
    }
    const pack = ballPack(light);
    if (pack) {
      setAttr(attrs, "conditionnement", pack.label, "titre_description");
      if (pack.balls !== null) setAttr(attrs, "lot", pack.balls, "titre_description");
      light = light.replace(pack.text, " ");
    } else {
      alertes.push("conditionnement_inconnu");
    }
  } else if (subcategory === "grips_surgrips") {
    const surgrip = family?.typeGrip
      ? family.typeGrip === "surgrip"
      : /\b(?:surgrips?|overgrips?)\b/.test(light)
        ? true
        : /\bgrips?\b/.test(light)
          ? false
          : null;
    if (surgrip === null) alertes.push("type_grip_inconnu");
    else {
      setAttr(attrs, "type", surgrip ? "surgrip" : "grip", "titre_description");
      setAttr(attrs, "typeGrip", surgrip ? "surgrip" : "grip", "titre_description");
    }
    const pieces = pieceCount(light);
    if (pieces) {
      setAttr(attrs, "lot", pieces.count, "titre_description");
      light = light.replace(pieces.text, " ");
    }
  } else if (subcategory === "antivibrateurs") {
    setAttr(attrs, "type", "antivibrateur", "titre_description");
    const pieces = pieceCount(light);
    if (pieces) {
      setAttr(attrs, "lot", pieces.count, "titre_description");
      light = light.replace(pieces.text, " ");
    }
  } else if (subcategory === "sacs") {
    setAttr(attrs, "type", "sac", "titre_description");
    const format = BAG_FORMATS.find(([, pattern]) => pattern.test(light));
    if (format) setAttr(attrs, "type_sac", format[0], "titre_description");
    const capacity = bagCapacity(light);
    if (capacity) {
      setAttr(attrs, "contenance", capacity.value, "titre_description");
      light = light.replace(capacity.text, " ");
    }
  } else if (subcategory === "protection_soins") {
    setAttr(attrs, "type", "protection_soins", "titre_description");
  } else if (subcategory === "accessoires_cordage") {
    setAttr(attrs, "type", "accessoires_cordage", "titre_description");
  }

  setAttr(attrs, "age_group", ageGroupOf(light, entry, "accessoires"), "titre_description");

  let text = fullNormalize(light);
  const generation = extractGeneration(text, entry);
  if (generation.label) setAttr(attrs, "generation", generation.label, "titre_description");
  if (generation.year) setAttr(attrs, "annee", generation.year, "titre_description");
  if (generation.marker) text = removePhrase(text, generation.marker);

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

  return { residual: text };
}
