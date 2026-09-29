// Enrichissement par fiche produit (R3.12, `cadrage_deals-tennis/R3_cadrage.md` R3-Q2).
//
// Fonctions pures de lecture d'une fiche HTML déjà téléchargée : aucune requête
// ni écriture ici (le script `scripts/scraping/enrich-fiches.ts` s'en charge).
//
// Sources vérifiées réellement le 2026-09-29 :
// - Tennis Point FR : JSON-LD `ProductGroup.hasVariant[]`, un `gtin` par variante.
// - Tecnifibre : JSON-LD `Product.offers[]`, un `gtin13` par offre (variante).
// - Tennispro.fr : `dataLayer.push({"product":{…,"mpn":"…"}})` dans le HTML.

export interface VariantIdentifier {
  sku: string | null;
  gtin: string | null;
}

// Un GTIN valide est numérique de 8, 12, 13 ou 14 chiffres (GTIN-8/12/13/14).
const GTIN_PATTERN = /^\d{8}$|^\d{12,14}$/;

function cleanGtin(value: unknown): string | null {
  if (typeof value !== "string" && typeof value !== "number") return null;
  const text = String(value).trim();
  return GTIN_PATTERN.test(text) ? text : null;
}

function cleanText(value: unknown): string | null {
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

function readJsonLdBlocks(html: string): unknown[] {
  const blocks: unknown[] = [];
  for (const match of html.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/g)) {
    try {
      blocks.push(JSON.parse(match[1]));
    } catch {
      // bloc illisible (ex. jeton de configuration mal formé) : on l'ignore
    }
  }
  return blocks;
}

type JsonObject = Record<string, unknown>;

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  return value === undefined || value === null ? [] : [value];
}

/**
 * Identifiants (SKU + GTIN) des variantes d'une fiche, dans l'ordre de la
 * fiche. Lit `ProductGroup.hasVariant[].gtin` (Tennis Point FR) et
 * `Product.offers[].gtin13` / `gtin` (Tecnifibre). Une variante sans GTIN
 * valide est gardée avec `gtin: null` (le SKU reste utile).
 */
export function parseVariantIdentifiers(html: string): VariantIdentifier[] {
  const variants: VariantIdentifier[] = [];

  for (const block of readJsonLdBlocks(html)) {
    if (!isObject(block)) continue;
    const type = block["@type"];

    if (type === "ProductGroup") {
      for (const variant of asArray(block.hasVariant)) {
        if (!isObject(variant)) continue;
        variants.push({
          sku: cleanText(variant.sku),
          gtin: cleanGtin(variant.gtin ?? variant.gtin13),
        });
      }
    } else if (type === "Product") {
      for (const offer of asArray(block.offers)) {
        if (!isObject(offer)) continue;
        variants.push({
          sku: cleanText(offer.sku),
          gtin: cleanGtin(offer.gtin13 ?? offer.gtin),
        });
      }
    }
  }

  return variants;
}

/**
 * Référence fabricant d'une fiche Tennispro.fr, lue dans
 * `dataLayer.push({"product":{…,"mpn":"…"}})`. Retourne `null` si absente ou
 * vide. Le `mpn` de Tennispro peut valoir le `sku` (identifiant interne du
 * marchand) : la fonction le rapporte tel quel, le rapprochement (R4) décide
 * de son usage.
 */
export function parseTennisproMpn(html: string): string | null {
  const match = html.match(/dataLayer\.push\(\{"product":(\{[^{}]*\})/);
  if (!match) return null;

  try {
    const product = JSON.parse(match[1]) as { mpn?: unknown };
    return cleanText(product.mpn);
  } catch {
    return null;
  }
}
