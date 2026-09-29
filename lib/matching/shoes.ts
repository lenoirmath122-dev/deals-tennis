/**
 * Extraction des attributs d'une chaussure (R4.3) : genre, âge, surface,
 * largeur, génération (numéro après le nom, Q14), version, édition.
 *
 * Sources : `gender` de la fiche Sport 2000 (`donnees_structurees`), sinon le
 * titre. La pointure et le coloris sont des variantes : non lus.
 */

import {
  SHOE_GENDER_MARKERS,
  SHOE_JUNIOR_MARKERS,
  SHOE_SURFACE_MARKERS,
  SHOE_WIDTH_MARKERS,
} from "../../config/model-families-chaussures.ts";
import type { FamilyEntry } from "../../config/model-families.ts";
import { shortestAliasIn } from "./families.ts";
import { extractEdition, extractGeneration, extractVersion, setAttr, type Attributes } from "./shared.ts";
import { escapeRegExp, fullNormalize, phraseRegExp, removePhrase } from "./text.ts";
import type { OfferInput } from "./types.ts";

/**
 * Marqueurs ajoutés à ceux du référentiel, vus sur les titres du jeu R1 :
 * « CL » (Sport 2000, « Barricade 13 M CL » = clay) et « unisexe ». À intégrer
 * au référentiel si Mathieu valide (`R4_3_complement_referentiel.md`).
 */
const EXTRA_SURFACE_MARKERS: Record<string, string[]> = { terre_battue: ["cl"] };
const MIXED_GENDER_MARKERS = ["mixte", "unisexe", "unisex"];

/** Marqueurs d'une lettre du référentiel (« m », « w », « k », « c ») : trop ambigus dans un titre. */
const usable = (marker: string) => marker.length > 1;

/** Position du premier marqueur présent dans `text`, ou -1. */
function firstPosition(text: string, markers: string[]): number {
  let best = -1;
  for (const raw of markers) {
    const marker = fullNormalize(raw);
    if (!usable(marker)) continue;
    const found = phraseRegExp(marker).exec(text);
    if (found && (best === -1 || found.index < best)) best = found.index;
  }
  return best;
}

function genderFromSheet(value: unknown): "homme" | "femme" | "mixte" | null {
  if (typeof value !== "string") return null;
  const v = fullNormalize(value);
  if (/^(homme|hommes|men|masculin)$/.test(v)) return "homme";
  if (/^(femme|femmes|women|feminin)$/.test(v)) return "femme";
  if (/^(mixte|unisexe|unisex)$/.test(v)) return "mixte";
  return null;
}

export function extractShoeAttributes(
  offer: OfferInput,
  entry: FamilyEntry | null,
  alias: string | null,
  attrs: Attributes,
  alertes: string[],
): { residual: string } {
  let text = fullNormalize(offer.titre);

  // Genre : fiche Sport 2000, sinon titre. Les deux genres écrits = mixte.
  const sheetGender = genderFromSheet(offer.raw_attributes?.gender);
  const male = firstPosition(text, SHOE_GENDER_MARKERS.homme) >= 0;
  const female = firstPosition(text, SHOE_GENDER_MARKERS.femme) >= 0;
  const mixed = firstPosition(text, MIXED_GENDER_MARKERS) >= 0;
  if (sheetGender) setAttr(attrs, "genre", sheetGender, "donnees_structurees");
  else if (mixed || (male && female)) setAttr(attrs, "genre", "mixte", "titre_description");
  else if (male) setAttr(attrs, "genre", "homme", "titre_description");
  else if (female) setAttr(attrs, "genre", "femme", "titre_description");
  if (sheetGender && ((male && sheetGender === "femme") || (female && sheetGender === "homme"))) {
    alertes.push("genre_titre_different_de_la_fiche");
  }

  // Âge : mots du référentiel, ligne junior de la famille, « K » collé au nom (« Barricade K »).
  const kAfterName = alias !== null && new RegExp(`${escapeRegExp(alias)} k(?![a-z0-9])`).test(text);
  const junior =
    Boolean(entry?.junior) || kAfterName || firstPosition(text, SHOE_JUNIOR_MARKERS) >= 0;
  setAttr(attrs, "age_group", junior ? "enfant" : "adulte", "titre_description");

  // Surface : le premier marqueur écrit l'emporte ; deux surfaces différentes = alerte.
  const surfaces = Object.entries(SHOE_SURFACE_MARKERS)
    .map(([surface, markers]) => ({
      surface,
      position: firstPosition(text, [...markers, ...(EXTRA_SURFACE_MARKERS[surface] ?? [])]),
    }))
    .filter((s) => s.position >= 0)
    .sort((a, b) => a.position - b.position);
  if (surfaces.length > 0) {
    setAttr(attrs, "surface", surfaces[0].surface, "titre_description");
    if (surfaces.length > 1) alertes.push("surfaces_multiples");
  }

  // Largeur.
  if (firstPosition(text, SHOE_WIDTH_MARKERS) >= 0) setAttr(attrs, "largeur", "large", "titre_description");

  // Génération (numéro après le nom, Q14), puis famille retirée avant version et édition.
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
