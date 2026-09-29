/** Normalisation de texte du moteur de rapprochement (R4.2). */

/**
 * Minuscules, accents retirés, `×` et `*` lus comme `x`. Les décimales et les
 * barres sont conservées : les plans de cordage (« 16/19 ») et les jauges
 * (« 1,25 mm ») sont lus sur ce texte avant `fullNormalize`.
 */
export function lightNormalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[×*]/g, "x")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Forme des alias du référentiel (`config/model-families.ts`) : tirets, barres,
 * soulignés, points et ponctuation remplacés par une espace, espaces réduites.
 * Le « + » est conservé (Pure Drive + ≠ Pure Drive).
 */
export function fullNormalize(value: string): string {
  return lightNormalize(value)
    .replace(/[-_/.,;:()[\]"'’|&!?]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Vrai si `needle` apparaît dans `haystack` comme mot entier (ou suite de mots). */
export function containsPhrase(haystack: string, needle: string): boolean {
  return phraseRegExp(needle).test(haystack);
}

/**
 * Expression qui reconnaît `phrase` comme mot entier. Le passage lettres /
 * chiffres compte comme une limite de mot, dedans comme aux bords : « 100 l » =
 * « 100l », « sx » se trouve dans « sx300 », la version « s » dans « 300s »
 * (les marchands collent souvent nom et chiffres : SX300, FX500, T-Fight 300S).
 */
export function phraseRegExp(phrase: string, flags = ""): RegExp {
  const tokens = phrase.split(" ").filter(Boolean);
  let source = "";
  tokens.forEach((token, i) => {
    if (i > 0) {
      const prev = tokens[i - 1].slice(-1);
      const next = token[0];
      const digitLetterBoundary = (/\d/.test(prev) && /[a-z]/.test(next)) || (/[a-z]/.test(prev) && /\d/.test(next));
      source += digitLetterBoundary ? "\\s?" : "\\s+";
    }
    source += escapeRegExp(token);
  });
  const first = tokens[0]?.[0] ?? "";
  const last = tokens.at(-1)?.slice(-1) ?? "";
  const before = /\d/.test(first) ? "(?<![0-9])" : /[a-z]/.test(first) ? "(?<![a-z])" : "(?<![a-z0-9])";
  const after = /\d/.test(last) ? "(?![0-9])" : /[a-z]/.test(last) ? "(?![a-z])" : "(?![a-z0-9])";
  return new RegExp(`${before}${source}${after}`, flags);
}

/** Retire la première occurrence de `phrase` ; renvoie le texte inchangé si absente. */
export function removePhrase(text: string, phrase: string): string {
  return text.replace(phraseRegExp(phrase), " ").replace(/\s+/g, " ").trim();
}
