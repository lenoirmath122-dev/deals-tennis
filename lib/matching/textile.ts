/**
 * Extraction des attributs d'une offre textile (R4.5-a) : type précis, genre, âge, nom de modèle,
 * marqueurs (millésime, numéro de génération, édition, longueur), coloris.
 *
 * Pas de référentiel de familles pour le textile (décision Q10) : le nom du modèle est ce qui reste
 * du titre une fois retirés tous les éléments listés dans `config/textile-lexicon.ts`. Un mot
 * inconnu reste dans le nom et bloque « identique » (principe R3). Fonctions pures.
 */

import {
  TEXTILE_ABBREVIATIONS,
  TEXTILE_BRAND_NEUTRAL_PHRASES,
  TEXTILE_BRAND_SPELLINGS,
  TEXTILE_COLOR_AFTER_GENDER_MERCHANTS,
  TEXTILE_COLOR_WORDS,
  TEXTILE_EDITIONS,
  TEXTILE_GENDER_LETTER_CODES,
  TEXTILE_GENDER_WORDS,
  TEXTILE_GLUED_PHRASES,
  TEXTILE_JUNIOR_WORDS,
  TEXTILE_NEUTRAL_PHRASES,
  TEXTILE_NEUTRAL_WORDS,
  TEXTILE_REFINES,
  TEXTILE_ROMAN_NUMERALS,
  TEXTILE_SEASON_WORDS,
  TEXTILE_SKU_IS_REFERENCE_MERCHANTS,
  TEXTILE_STYLE_REFERENCE_BRANDS,
  TEXTILE_TYPE_LAST_MERCHANTS,
  TEXTILE_TYPE_PHRASES,
  TEXTILE_TYPES,
  TEXTILE_WEAK_PHRASES,
  TEXTILE_YOUTH_GENDER_WORDS,
  type TextileType,
} from "../../config/textile-lexicon.ts";
import { manufacturerReferences, setAttr, type Attributes } from "./shared.ts";
import { fullNormalize, lightNormalize, phraseRegExp } from "./text.ts";
import type { AttributeSource, OfferInput } from "./types.ts";

export interface TextileExtraction {
  /** Marque normalisée (`fullNormalize`), ou null si absente ou mal extraite. */
  brandKey: string | null;
  type: TextileType | null;
  /** Nom du modèle : les mots qui restent, dans l'ordre (vide si le titre n'en écrit aucun). */
  modele: string;
  /** Mots restants, pour la liste des non-reconnus. */
  residual: string[];
  /** Style de la référence fabricant, par marque vérifiée (`TEXTILE_STYLE_REFERENCE_BRANDS`). */
  references: { value: string; source: AttributeSource }[];
}

type Tokens = string[];

const seq = (phrase: string): Tokens => phrase.split(" ").filter(Boolean);

/** Positions où la suite de mots `phrase` commence dans `tokens`, sans recouvrir `claimed`. */
function positionsOf(tokens: Tokens, phrase: Tokens, claimed?: boolean[]): number[] {
  const out: number[] = [];
  for (let i = 0; i + phrase.length <= tokens.length; i++) {
    if (phrase.every((word, k) => tokens[i + k] === word && !claimed?.[i + k])) {
      out.push(i);
      i += phrase.length - 1;
    }
  }
  return out;
}

/** Retire toutes les occurrences des suites de mots, la plus longue d'abord ; renvoie les suites trouvées. */
function removePhrases(tokens: Tokens, phrases: string[]): { tokens: Tokens; found: string[] } {
  let current = tokens;
  const found: string[] = [];
  for (const phrase of [...phrases].sort((a, b) => seq(b).length - seq(a).length || b.length - a.length)) {
    const words = seq(phrase);
    const starts = positionsOf(current, words);
    if (starts.length === 0) continue;
    found.push(phrase);
    const drop = new Set(starts.flatMap((s) => words.map((_, k) => s + k)));
    current = current.filter((_, i) => !drop.has(i));
  }
  return { tokens: current, found };
}

/** Coloris après le genre chez Tennis Point FR : « … Femmes - blanc, bleu foncé » → « … Femmes ». */
function cutColorAfterGender(light: string): string {
  return light.replace(/(?<![a-z])(hommes?|femmes?|filles?|garcons?|enfants?|unisexe|unisex|mixte|junior)\s*-\s*[^]*$/, "$1");
}

interface TypeCandidate {
  type: TextileType;
  start: number;
  length: number;
  weak: boolean;
}

function findTypeCandidates(tokens: Tokens): TypeCandidate[] {
  const claimed: boolean[] = tokens.map(() => false);
  const out: TypeCandidate[] = [];
  const claim = (type: TextileType, phrase: string, weak: boolean) => {
    const words = seq(phrase);
    for (const start of positionsOf(tokens, words, claimed)) {
      words.forEach((_, k) => (claimed[start + k] = true));
      out.push({ type, start, length: words.length, weak });
    }
  };
  const strong: { type: TextileType; phrase: string }[] = [];
  for (const type of TEXTILE_TYPES) for (const phrase of TEXTILE_TYPE_PHRASES[type]) strong.push({ type, phrase });
  strong.sort((a, b) => seq(b.phrase).length - seq(a.phrase).length || b.phrase.length - a.phrase.length);
  for (const { type, phrase } of strong) claim(type, phrase, false);
  for (const [phrase, type] of Object.entries(TEXTILE_WEAK_PHRASES)) claim(type, phrase, true);
  return out.sort((a, b) => a.start - b.start);
}

function chooseType(candidates: TypeCandidate[], merchant: string, alertes: string[]): TextileType | null {
  const strong = candidates.filter((c) => !c.weak);
  const pool = strong.length > 0 ? strong : candidates.filter((c) => c.weak);
  if (pool.length === 0) return null;
  const last = TEXTILE_TYPE_LAST_MERCHANTS.includes(merchant);
  let chosen = (last ? pool[pool.length - 1] : pool[0]).type;
  const refined = TEXTILE_REFINES[chosen]?.find((finer) => pool.some((c) => c.type === finer));
  if (refined) chosen = refined;
  const others = new Set(pool.map((c) => c.type).filter((t) => t !== chosen && !TEXTILE_REFINES[t]?.includes(chosen)));
  // Un type plus précis que le type retenu (« sweat » et « sweat à capuche ») n'est pas un conflit.
  for (const t of [...others]) if (TEXTILE_REFINES[chosen]?.includes(t)) others.delete(t);
  if (others.size > 0) alertes.push("types_multiples");
  return chosen;
}

/** Lot : « Pack de 3 », « 3 paires », « 2P », « x3 ». Renvoie le nombre et le texte sans lui. */
function extractTextileLot(text: string): { count: number; rest: string } | null {
  const patterns = [
    /(?<![a-z0-9])(?:pack|lot|set) de (\d{1,2})(?![a-z0-9])/,
    /(?<![a-z0-9])(\d{1,2}) ?(?:pack|packs|paires?|pairs?)(?![a-z0-9])/,
    /(?<![a-z0-9])(\d{1,2})p(?![a-z0-9])/,
    /(?<![a-z0-9])x(\d{1,2})(?![a-z0-9])/,
  ];
  for (const pattern of patterns) {
    const match = pattern.exec(text);
    if (match && Number(match[1]) >= 2) {
      return { count: Number(match[1]), rest: `${text.slice(0, match.index)} ${text.slice(match.index + match[0].length)}` };
    }
  }
  return null;
}

/** Références de style (avant le premier tiret) des marques vérifiées ; vide pour les autres. */
function styleReferences(offer: OfferInput, brandKey: string | null): TextileExtraction["references"] {
  if (!brandKey || !TEXTILE_STYLE_REFERENCE_BRANDS.includes(brandKey)) return [];
  const raw = [...manufacturerReferences(offer)];
  if (TEXTILE_SKU_IS_REFERENCE_MERCHANTS.includes(offer.marchand) && offer.merchant_sku) {
    raw.push({ value: offer.merchant_sku, source: "fiche_marchand" });
  }
  const out: TextileExtraction["references"] = [];
  for (const { value, source } of raw) {
    const style = value.trim().split("-")[0];
    if (style && !out.some((r) => r.value === style)) out.push({ value: style, source });
  }
  return out;
}

export function extractTextileAttributes(offer: OfferInput, attrs: Attributes, alertes: string[]): TextileExtraction {
  const brandKey = offer.marque && fullNormalize(offer.marque) !== "sportsystem" ? fullNormalize(offer.marque) || null : null;

  // 1. Texte : coloris de fin retiré (Tennis Point FR), fractions et sigles lus, mots neutres retirés.
  let light = lightNormalize(offer.titre);
  if (TEXTILE_COLOR_AFTER_GENDER_MERCHANTS.includes(offer.marchand)) light = cutColorAfterGender(light);
  let text = fullNormalize(
    light
      .replace(/(\d)\/(\d)/g, "frac$1$2") // 3/4, 1/4 (manches, zip)
      .replace(/(\d)\.0(?![0-9])/g, "$1") // « 2.0 » = 2
      .replace(/(\d)\.(\d)/g, "$1dot$2")
      .replace(/(?<![0-9])2 ?in ?1(?![0-9])/g, "2in1"),
  );
  for (const [glued, word] of Object.entries(TEXTILE_GLUED_PHRASES)) text = text.replace(phraseRegExp(glued, "g"), word);
  text = text
    .split(" ")
    .map((word) => TEXTILE_ABBREVIATIONS[word] ?? word)
    .join(" ");
  text = text.replace(/(?<![a-z0-9])\d{1,3}(?: \d{1,3})? ?(?:cm|ans|an)(?![a-z0-9])/g, " "); // tailles enfant
  for (const phrase of [...TEXTILE_NEUTRAL_PHRASES, ...(brandKey ? (TEXTILE_BRAND_NEUTRAL_PHRASES[brandKey] ?? []) : [])]) {
    text = text.replace(phraseRegExp(phrase, "g"), " ");
  }

  // 2. Lot, longueur en pouces, année.
  const lot = extractTextileLot(text);
  if (lot) {
    setAttr(attrs, "lot", lot.count, "titre_description");
    text = lot.rest;
  }
  const length = /(?<![a-z0-9])(\d{1,2}) ?(?:in|inch|inches|pouces?)(?![a-z0-9])/.exec(text);
  let longueur: number | null = null;
  if (length && Number(length[1]) >= 3 && Number(length[1]) <= 12) {
    longueur = Number(length[1]);
    text = `${text.slice(0, length.index)} ${text.slice(length.index + length[0].length)}`;
  }
  const yearMatch = /(?<![a-z0-9])(20[12]\d)(?![a-z0-9])/.exec(text);
  let millesime: number | null = null;
  if (yearMatch) {
    millesime = Number(yearMatch[1]);
    text = `${text.slice(0, yearMatch.index)} ${text.slice(yearMatch.index + yearMatch[0].length)}`;
  }
  let tokens: Tokens = text.split(" ").filter(Boolean);

  // 3. Marque.
  if (brandKey) {
    tokens = removePhrases(tokens, TEXTILE_BRAND_SPELLINGS[brandKey] ?? [brandKey]).tokens;
  }

  // 4. Type précis : tous les mots du type sont retirés du nom.
  const candidates = findTypeCandidates(tokens);
  const type = chooseType(candidates, offer.marchand, alertes);
  // Un indice faible d'un autre type reste dans le nom (« Top Ten » d'un polo Lotto).
  const typeStarts = new Set(
    candidates
      .filter((c) => !c.weak || c.type === type)
      .flatMap((c) => Array.from({ length: c.length }, (_, k) => c.start + k)),
  );
  tokens = tokens.filter((_, i) => !typeStarts.has(i));

  // 5. Genre et âge.
  const genders = new Set<string>();
  let junior = false;
  const genderOf = new Map<string, string>();
  for (const [gender, words] of Object.entries(TEXTILE_GENDER_WORDS)) for (const w of words) genderOf.set(w, gender);
  const youthOf = new Map<string, string>();
  for (const [gender, words] of Object.entries(TEXTILE_YOUTH_GENDER_WORDS)) for (const w of words) youthOf.set(w, gender);
  const sport2000 = offer.marchand === "Sport 2000";
  const letterCodes: string[] = [];
  tokens = tokens.filter((token) => {
    if (genderOf.has(token)) return genders.add(genderOf.get(token)!), false;
    if (youthOf.has(token)) return genders.add(youthOf.get(token)!), (junior = true), false;
    if (TEXTILE_JUNIOR_WORDS.includes(token)) return (junior = true), false;
    if (sport2000 && TEXTILE_GENDER_LETTER_CODES.includes(token)) return letterCodes.push(token), false;
    return true;
  });
  if (genders.size === 0 && letterCodes.length > 0) {
    // Sport 2000 : « M NKCT … » homme, « W NKCT … » femme, « G NKCT … » fille, « B NKCT … » garçon.
    const code = letterCodes[0];
    genders.add(code === "m" || code === "b" ? "homme" : "femme");
    if (code === "g" || code === "b") junior = true;
  }
  let genre: string | null = null;
  if (genders.has("mixte") || (genders.has("homme") && genders.has("femme"))) genre = "mixte";
  else if (genders.has("homme")) genre = "homme";
  else if (genders.has("femme")) genre = "femme";
  if (genders.has("homme") && genders.has("femme")) alertes.push("genres_multiples");

  // 6. Marqueurs : éditions, saisons, coloris, mots neutres.
  const editions: string[] = [];
  for (const [canonical, spellings] of Object.entries(TEXTILE_EDITIONS)) {
    const { tokens: rest, found } = removePhrases(tokens, spellings);
    if (found.length > 0) {
      editions.push(canonical);
      tokens = rest;
    }
  }
  const seasons: string[] = [];
  const colors: string[] = [];
  tokens = tokens.filter((token) => {
    if (TEXTILE_SEASON_WORDS.includes(token)) return seasons.push(token), false;
    if (TEXTILE_COLOR_WORDS.includes(token)) return colors.push(token), false;
    return !TEXTILE_NEUTRAL_WORDS.includes(token);
  });

  // 7. Numéro de génération et millésime écrits en chiffres.
  let numero: number | null = null;
  const remaining: Tokens = [];
  for (const token of tokens) {
    if (numero === null && token in TEXTILE_ROMAN_NUMERALS) numero = TEXTILE_ROMAN_NUMERALS[token];
    else if (longueur === null && (brandKey === "nike" || brandKey === "adidas") && /^\d{1,2}$/.test(token) && Number(token) >= 5 && Number(token) <= 10 && (type === "short" || type === "jupe_short")) {
      // Nike, adidas : « Short NikeCourt 9 Victory », « Short Ergo 7 » = 9 et 7 pouces.
      longueur = Number(token);
    } else if (millesime === null && /^(19|2\d)$/.test(token)) millesime = 2000 + Number(token);
    else if (numero === null && /^[1-9]$/.test(token)) numero = Number(token);
    else remaining.push(token);
  }

  const modele = remaining.join(" ");
  if (type) setAttr(attrs, "type", type, "titre_description");
  if (genre) setAttr(attrs, "genre", genre, "titre_description");
  setAttr(attrs, "age_group", junior ? "enfant" : "adulte", "titre_description");
  if (modele) setAttr(attrs, "modele", modele, "titre_description");
  if (longueur !== null) setAttr(attrs, "longueur", longueur, "titre_description");
  if (millesime !== null) setAttr(attrs, "millesime", millesime, "titre_description");
  if (numero !== null) setAttr(attrs, "numero", numero, "titre_description");
  if (editions.length > 0) setAttr(attrs, "edition", [...editions].sort().join("+"), "titre_description");
  if (colors.length > 0) setAttr(attrs, "coloris", colors.join(" "), "titre_description");
  if (seasons.length > 0) setAttr(attrs, "collection", seasons.join(" "), "titre_description");
  if (!modele) alertes.push("modele_vide");

  return { brandKey, type, modele, residual: remaining, references: styleReferences(offer, brandKey) };
}
