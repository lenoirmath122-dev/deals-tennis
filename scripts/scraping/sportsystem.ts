// Scraping local gratuit — SportSystem (D-2026-09-24-02/05, GAP-2026-09-24-02).
//
// Exécution manuelle à la demande sur la machine de l'utilisateur, pas de cron.
// Site PrestaShop en rendu SSR classique. robots.txt vérifié réellement
// (2026-09-25) : ne bloque ni les pages catégorie/promo ni la pagination
// `?page=`, pas de `Crawl-delay`. CGV vérifiées : clause standard de propriété
// intellectuelle sur textes/images (même catégorie que les autres marchands
// déjà scrapés), rien de spécifique anti-scraping.
//
// Le site sépare explicitement tennis et padel au niveau des pages (ex.
// `raquettes-tennis-promo-459` vs `raquettes-padel-promo-861`) — 8 pages
// promo dédiées au tennis couvrent les 5 catégories internes. Pas de page
// promo dédiée aux accessoires hors sacs : accepté à 0 article pour les
// autres accessoires (même logique que Tecnifibre/Babolat pour les
// sous-catégories vides).
//
// Découverte en cours de build : la marque n'est PAS un champ structuré sur
// les pages de listing (contrairement à ProTennis) et le premier mot du titre
// n'est pas fiable (ex. cordages "4S (200m)", "RPM Blast (200m)" — vérifié
// réellement via la fiche produit que la marque réelle est Tecnifibre/Babolat,
// absente du titre). Décision explicite de l'utilisateur (2026-09-25) : une
// requête supplémentaire par produit retenu vers la fiche produit, dont le
// JSON-LD (`schema.org/Product`) expose `brand.name` de façon fiable — plus
// lent (~700 requêtes) mais correct, préféré à l'heuristique rapide mais fausse.
//
// Les pages promo homme/femme/enfant permettent de déduire le sexe/la tranche
// d'âge même quand le titre marchand ne le mentionne pas explicitement (ex.
// beaucoup de chaussures homme/femme n'ont pas le mot dans le titre) : un
// indice est ajouté au titre construit à partir de la page d'origine, plus
// fiable que de compter uniquement sur le lexique de `extractGender`/
// `extractAgeGroup` appliqué au titre brut marchand.
//
// R3.7 (`cadrage_deals-tennis/R3_cadrage.md`) : réécrit pour passer par
// `lib/ingest.ts` (upsert products/deals, statut active/tracked, exclusions,
// sous-catégorie, unité, corrections de marque, éviction avec garde-fou 50 %).
// Capture ajoutée sans requête supplémentaire : la fiche produit, déjà chargée
// pour la marque, expose dans son `data-product` la référence marchand
// (`reference` -> `merchant_sku`), l'EAN par déclinaison (`attributes[].ean13`
// -> `gtin`, renseigné seulement sur une partie des articles, jamais sur les
// sacs) et les caractéristiques (poids, tamis, plan de cordage, équilibre...)
// gardées dans `raw_attributes`. Le JSON-LD `mpn` recopie la référence
// marchand (pas une vraie référence fabricant) : non capturé en `mpn`. Les
// pages restent des pages promo (R3-Q3) : le catalogue complet est pour la
// Phase 4-bis, `tracked` n'apparaît que si une carte a un prix de base <= prix.
import { neon } from "@neondatabase/serverless";
import { evictMerchantOffers, ingestOffer } from "../../lib/ingest.ts";
import type { DealCategory } from "../../types/database.ts";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const sql = neon(process.env.DATABASE_URL);

const MERCHANT_NAME = "SportSystem";
const MERCHANT_SLUG = "sportsystem";
const MERCHANT_WEBSITE = "https://www.sportsystem.fr";
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";
const REQUEST_DELAY_MS = 200; // pas de Crawl-delay dans robots.txt, délai de politesse minimal
const MAX_PAGES_PER_CATEGORY = 10; // garde-fou

const OTHER_SPORTS_PATTERN = /squash|padel|badminton|pickleball/i;

interface TypeEntry {
  keyword: string;
  label: string;
}

interface CategoryConfig {
  urlSlug: string; // page promo dédiée tennis
  dbCategory: DealCategory;
  entries: TypeEntry[];
  defaultLabel: string;
  genderHint?: "Homme" | "Femme";
  ageHint?: "Enfant";
}

const CATEGORIES: CategoryConfig[] = [
  {
    urlSlug: "raquettes-tennis-promo-459",
    dbCategory: "raquettes",
    entries: [],
    defaultLabel: "Raquette de tennis",
  },
  {
    urlSlug: "bobines-cordages-promo-465",
    dbCategory: "cordages",
    entries: [{ keyword: "bobine", label: "Bobine de cordage de tennis" }],
    defaultLabel: "Cordage de tennis",
  },
  {
    urlSlug: "chaussures-tennis-homme-promo-470",
    dbCategory: "chaussures",
    entries: [],
    defaultLabel: "Chaussures de tennis",
    genderHint: "Homme",
  },
  {
    urlSlug: "chaussures-tennis-femme-promo-471",
    dbCategory: "chaussures",
    entries: [],
    defaultLabel: "Chaussures de tennis",
    genderHint: "Femme",
  },
  {
    urlSlug: "chaussures-tennis-enfants-promo-472",
    dbCategory: "chaussures",
    entries: [],
    defaultLabel: "Chaussures de tennis",
    ageHint: "Enfant",
  },
  {
    urlSlug: "vetements-tennis-homme-promo-467",
    dbCategory: "textile",
    entries: [
      { keyword: "tee-shirt", label: "T-shirt de tennis" },
      { keyword: "t-shirt", label: "T-shirt de tennis" },
      { keyword: "polo", label: "Polo de tennis" },
      { keyword: "débardeur", label: "Débardeur de tennis" },
      { keyword: "short", label: "Short de tennis" },
      { keyword: "pantalon", label: "Pantalon de tennis" },
      { keyword: "leggings", label: "Legging de tennis" },
      { keyword: "sweat", label: "Sweat de tennis" },
      { keyword: "veste", label: "Veste de tennis" },
      { keyword: "doudoune", label: "Doudoune de tennis" },
      { keyword: "chaussettes", label: "Chaussettes de tennis" },
      { keyword: "casquette", label: "Casquette de tennis" },
      { keyword: "visière", label: "Visière de tennis" },
    ],
    defaultLabel: "Vêtement de tennis",
    genderHint: "Homme",
  },
  {
    urlSlug: "vetements-de-tennis-femme-promo-468",
    dbCategory: "textile",
    entries: [
      { keyword: "tee-shirt", label: "T-shirt de tennis" },
      { keyword: "t-shirt", label: "T-shirt de tennis" },
      { keyword: "polo", label: "Polo de tennis" },
      { keyword: "débardeur", label: "Débardeur de tennis" },
      { keyword: "brassière", label: "Brassière de tennis" },
      { keyword: "shorty", label: "Shorty de tennis" },
      { keyword: "short", label: "Short de tennis" },
      { keyword: "jupe", label: "Jupe de tennis" },
      { keyword: "robe", label: "Robe de tennis" },
      { keyword: "pantalon", label: "Pantalon de tennis" },
      { keyword: "leggings", label: "Legging de tennis" },
      { keyword: "sweat", label: "Sweat de tennis" },
      { keyword: "veste", label: "Veste de tennis" },
      { keyword: "doudoune", label: "Doudoune de tennis" },
      { keyword: "chaussettes", label: "Chaussettes de tennis" },
      { keyword: "casquette", label: "Casquette de tennis" },
      { keyword: "visière", label: "Visière de tennis" },
    ],
    defaultLabel: "Vêtement de tennis",
    genderHint: "Femme",
  },
  {
    urlSlug: "vetements-tennis-enfant-promo-469",
    dbCategory: "textile",
    entries: [
      { keyword: "tee-shirt", label: "T-shirt de tennis" },
      { keyword: "t-shirt", label: "T-shirt de tennis" },
      { keyword: "polo", label: "Polo de tennis" },
      { keyword: "short", label: "Short de tennis" },
      { keyword: "jupe", label: "Jupe de tennis" },
      { keyword: "pantalon", label: "Pantalon de tennis" },
      { keyword: "leggings", label: "Legging de tennis" },
      { keyword: "sweat", label: "Sweat de tennis" },
      { keyword: "veste", label: "Veste de tennis" },
    ],
    defaultLabel: "Vêtement de tennis",
    ageHint: "Enfant",
  },
  {
    urlSlug: "sacs-tennis-promo-463",
    dbCategory: "accessoires",
    entries: [
      { keyword: "thermobag", label: "Sac isotherme de tennis" },
      { keyword: "sac à dos", label: "Sac à dos de tennis" },
      { keyword: "sac de sport", label: "Sac de sport de tennis" },
    ],
    defaultLabel: "Sac de tennis",
  },
];

interface ScrapedProduct {
  url: string;
  name: string;
  image: string;
  price: number;
  originalPrice: number;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function politeFetch(url: string): Promise<string> {
  await sleep(REQUEST_DELAY_MS);
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) {
    throw new Error(`Échec HTTP ${res.status} sur ${url}`);
  }
  // Les fiches contiennent parfois des octets non UTF-8 (ex. "cm²" en ISO-8859-1).
  const bytes = await res.arrayBuffer();
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    return new TextDecoder("windows-1252").decode(bytes);
  }
}

function decodeEntities(raw: string): string {
  return raw
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&eacute;/g, "é")
    .replace(/&egrave;/g, "è")
    .replace(/&ecirc;/g, "ê")
    .replace(/&agrave;/g, "à")
    .replace(/&ccedil;/g, "ç")
    .replace(/&ndash;/g, "–")
    .replace(/&nbsp;/g, " ");
}

function parsePrice(raw: string): number {
  const cleaned = raw.replace(/[^\d,]/g, "").replace(",", ".");
  return parseFloat(cleaned);
}

function getMaxPage(html: string): number {
  const matches = [...html.matchAll(/\?page=(\d+)"/g)].map((m) => parseInt(m[1], 10));
  const max = matches.length > 0 ? Math.max(...matches) : 1;
  return Math.min(max, MAX_PAGES_PER_CATEGORY);
}

function scopeToProductList(html: string): string {
  const start = html.indexOf('id="js-product-list"');
  const end = html.indexOf('id="js-product-list-bottom"');
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Conteneur js-product-list introuvable ou vide — structure de page changée ?");
  }
  return html.slice(start, end);
}

function splitProductBlocks(scopedHtml: string): string[] {
  const indices: number[] = [];
  const re = /<article class="product-miniature js-product-miniature[^"]*"\s+data-id-product="(\d+)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(scopedHtml)) !== null) {
    indices.push(m.index);
  }

  const blocks: string[] = [];
  for (let i = 0; i < indices.length; i += 1) {
    const start = indices[i];
    const end = i + 1 < indices.length ? indices[i + 1] : scopedHtml.length;
    blocks.push(scopedHtml.slice(start, end));
  }
  return blocks;
}

function parseProduct(block: string): ScrapedProduct | null {
  const urlMatch = block.match(/<h3 class="m-0 mb-2 fw-bold fs-5">\s*<a href="([^"]+)"[^>]*>([^<]+)<\/a>/);
  const priceMatch = block.match(/<span class="price"\s+aria-label="Prix">\s*([\d.,\s ]+)\s*€\s*<\/span>/);
  const regularMatch = block.match(/<span class="regular-price"\s+aria-label="Prix de base">([\d.,\s ]+)\s*€<\/span>/);
  const imageMatch = block.match(/data-full-size-image-url="(https:\/\/www\.sportsystem\.fr\/[^"]+)"/);

  if (!urlMatch || !priceMatch || !regularMatch || !imageMatch) {
    return null;
  }

  return {
    url: urlMatch[1],
    name: decodeEntities(urlMatch[2].trim().replace(/\s+/g, " ")),
    image: imageMatch[1],
    price: parsePrice(priceMatch[1]),
    originalPrice: parsePrice(regularMatch[1]),
  };
}

function resolveLabel(config: CategoryConfig, name: string): string {
  const lower = name.toLowerCase();
  for (const entry of config.entries) {
    if (lower.includes(entry.keyword)) {
      return entry.label;
    }
  }
  return config.defaultLabel;
}

interface ProductDetails {
  brand: string | null;
  sku: string | null;
  gtin: string | null;
  rawAttributes: Record<string, unknown>;
}

interface DataProduct {
  reference?: string;
  features?: { name: string; value: string }[];
  attributes?: Record<string, { group?: string; name?: string; reference?: string; ean13?: string }>;
}

function parseDataProduct(html: string): DataProduct | null {
  const match = html.match(/data-product="([^"]*)"/);
  if (!match) return null;
  const json = match[1]
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
  try {
    return JSON.parse(json) as DataProduct;
  } catch {
    return null;
  }
}

async function fetchDetails(url: string): Promise<ProductDetails> {
  const html = await politeFetch(url);
  const brandMatch = html.match(/"brand"\s*:\s*\{\s*"@type"\s*:\s*"Brand"\s*,\s*"name"\s*:\s*"([^"]+)"/);
  const brand = brandMatch ? decodeEntities(brandMatch[1].trim()) : null;

  const data = parseDataProduct(html);
  const variants = Object.values(data?.attributes ?? {});
  const gtin = variants.map((v) => v.ean13?.trim()).find((e) => e && /^\d{8,14}$/.test(e)) ?? null;

  return {
    brand,
    sku: data?.reference?.trim() || null,
    gtin,
    rawAttributes: {
      features: data?.features?.map((f) => ({ name: f.name, value: f.value })) ?? null,
      variants: variants.map((v) => ({ group: v.group ?? null, name: v.name ?? null, reference: v.reference || null, ean13: v.ean13 || null })),
    },
  };
}

async function main() {
  const [merchant] = await sql`
    INSERT INTO merchants (name, slug, website_url)
    VALUES (${MERCHANT_NAME}, ${MERCHANT_SLUG}, ${MERCHANT_WEBSITE})
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
    RETURNING id
  `;

  let active = 0;
  let tracked = 0;
  const excluded: Record<string, number> = {};
  let skippedOtherSport = 0;
  let skippedUnparsable = 0;
  let skippedNoBrand = 0;
  const seenUrls: string[] = [];

  for (const config of CATEGORIES) {
    const firstUrl = `${MERCHANT_WEBSITE}/${config.urlSlug}`;
    console.log(`Récupération de ${config.urlSlug}...`);
    const firstHtml = await politeFetch(firstUrl);
    const maxPage = getMaxPage(firstHtml);
    console.log(`  ${maxPage} page(s) détectée(s).`);

    const htmls = [firstHtml];
    for (let page = 2; page <= maxPage; page += 1) {
      htmls.push(await politeFetch(`${firstUrl}?page=${page}`));
    }

    let categoryCount = 0;
    for (const html of htmls) {
      const blocks = splitProductBlocks(scopeToProductList(html));
      for (const block of blocks) {
        const product = parseProduct(block);
        if (!product) {
          skippedUnparsable += 1;
          continue;
        }

        if (!Number.isFinite(product.price) || !Number.isFinite(product.originalPrice)) {
          skippedUnparsable += 1;
          continue;
        }

        if (OTHER_SPORTS_PATTERN.test(product.name) || OTHER_SPORTS_PATTERN.test(product.url)) {
          skippedOtherSport += 1;
          continue;
        }

        const details = await fetchDetails(product.url);
        const brand = details.brand;
        if (!brand) {
          skippedNoBrand += 1;
          console.log(`  marque introuvable (JSON-LD) ignorée : "${product.name}"`);
          continue;
        }

        const label = resolveLabel(config, product.name);
        const genderSuffix = config.genderHint ? ` ${config.genderHint}` : "";
        const ageSuffix = config.ageHint ? ` ${config.ageHint}` : "";
        const title = `${label} ${brand} ${product.name}${genderSuffix}${ageSuffix}`
          .replace(/\s+/g, " ")
          .trim();

        const outcome = await ingestOffer(sql, {
          title,
          brand,
          category: config.dbCategory,
          imageUrl: product.image,
          originalPrice: product.originalPrice,
          discountedPrice: product.price,
          merchantId: merchant.id,
          affiliateUrl: product.url,
          gtin: details.gtin,
          merchantSku: details.sku,
          rawAttributes: details.rawAttributes,
        });

        if (!outcome.inserted) {
          excluded[outcome.reason] = (excluded[outcome.reason] ?? 0) + 1;
          console.log(`  exclu (${outcome.reason}) : ${title}`);
          continue;
        }

        seenUrls.push(product.url);
        if (outcome.status === "active") active += 1;
        else tracked += 1;
        categoryCount += 1;
      }
    }
    console.log(`  ${categoryCount} offre(s) retenue(s) pour ${config.urlSlug}.`);
  }

  const excludedTotal = Object.values(excluded).reduce((sum, n) => sum + n, 0);
  console.log(
    `${active} offre(s) active(s), ${tracked} offre(s) suivie(s) sans remise (tracked), ` +
      `${excludedTotal} exclue(s) ${JSON.stringify(excluded)}, ${skippedOtherSport} hors tennis, ` +
      `${skippedNoBrand} sans marque identifiable, ${skippedUnparsable} bloc(s) non parsable(s).`
  );

  // Éviction : garde-fous (0 URL vue, moins de la moitié des offres connues
  // revues) dans `evictMerchantOffers` (R3-Q5).
  const eviction = await evictMerchantOffers(sql, merchant.id, seenUrls);
  if (eviction.guard === "aucune_url_vue") {
    console.log("Aucune offre vue ce passage : éviction ignorée (garde-fou anti-vidage en masse).");
  } else if (eviction.guard === "moins_de_moitie") {
    console.log("Moins de la moitié des offres connues revues : éviction ignorée (garde-fou 50 %).");
  } else {
    console.log(`${eviction.evicted} offre(s) SportSystem expirée(s) (disparue(s) des pages promo tennis).`);
  }
}

await main();
