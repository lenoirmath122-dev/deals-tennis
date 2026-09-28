// Scraping local gratuit — Tecnifibre (D-2026-09-24-02/05, GAP-2026-09-24-02).
//
// Exécution manuelle à la demande sur la machine de l'utilisateur, pas de cron.
// Tecnifibre est un site Shopify en rendu SSR (D-2026-09-24-03) : plutôt que de
// parser le HTML (comme ProTennis), ce script utilise l'endpoint JSON public
// standard de toute vitrine Shopify (`/collections/<handle>/products.json`,
// non authentifié, non listé dans les Disallow de robots.txt) — même principe
// "HTTP + parsing" acté, juste appliqué à une réponse structurée plutôt qu'à du
// HTML, ce qui est plus robuste. Aucune clause anti-scraping dans les CGU.
//
// Découverte D-2026-09-25-19 (GAP-2026-09-25-15, étape 2) : contrairement aux
// 6 autres marchands, ce script n'appelait jamais extractGender/extractAgeGroup
// ni n'écrivait ces colonnes — corrigé (lecture de body_html comme second
// signal d'âge : le "T-Fight Club 25" cité dans le GAP est un produit Tecnifibre).
//
// R3.4 (`cadrage_deals-tennis/R3_cadrage.md`) : réécrit pour passer par
// `lib/ingest.ts` (upsert products/deals, statut active/tracked, exclusions,
// sous-catégorie, unité, corrections de marque, éviction avec garde-fou 50 %).
// Capture ajoutée sans requête supplémentaire : `merchant_sku` (SKU de la
// première variante) et `raw_attributes` (variantes : libellé, SKU, poids
// d'expédition). Le JSON Shopify n'expose ni GTIN ni code-barres (vérifié le
// 2026-09-28 sur les 168 articles) : le GTIN reste pour R3.12 (JSON-LD de la
// fiche produit). Les articles vus sans remise réelle sont désormais gardés en
// `status='tracked'` au lieu d'être ignorés (R3-Q3).
//
// Une seule collection ciblée : `outlet-articles-de-tennis`. Vérifié réellement
// (2026-09-24) que c'est la seule collection Tecnifibre où les articles ont un
// vrai `compare_at_price` (prix barré) — les collections catalogue "normales"
// (raquettes-de-tennis, cordages-raquettes-tennis, etc.) n'ont quasiment aucune
// remise active. Elle couvre déjà raquettes/accessoires/textile ; Tecnifibre ne
// vend pas de chaussures (catégorie absente du site) et les cordages n'y sont
// jamais en promo au moment de la vérification (accepté à 0 article, comme pour
// Babolat/D-2026-09-24-05 — pas de sélecteur cordage forcé).
import { neon } from "@neondatabase/serverless";
import { evictMerchantOffers, ingestOffer } from "../../lib/ingest.ts";
import type { DealCategory } from "../../types/database.ts";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const sql = neon(process.env.DATABASE_URL);

const MERCHANT_NAME = "Tecnifibre";
const MERCHANT_SLUG = "tecnifibre";
const MERCHANT_WEBSITE = "https://www.tecnifibre.com";
const COLLECTION_HANDLE = "outlet-articles-de-tennis";
const PAGE_SIZE = 250;
const MAX_PAGES = 5; // garde-fou, la collection compte ~170 articles au 2026-09-24

// Sécurité : Tecnifibre vend aussi du squash/padel/pickleball sur d'autres
// collections ; cette collection outlet est censée être 100% tennis, mais on
// garde le même filet de sécurité que ProTennis (GAP-2026-09-22-09) au cas où.
const OTHER_SPORTS_PATTERN = /squash|padel|badminton|pickleball/i;

// product_type Shopify -> {catégorie interne, libellé FR utilisé dans le titre}.
// Convention reprise des titres déjà en base (ex. "Raquette de tennis Wilson...",
// "Sac de tennis Babolat...") pour rester cohérent avec les autres marchands.
const TYPE_MAP: Record<string, { category: DealCategory; label: string }> = {
  Raquette: { category: "raquettes", label: "Raquette de tennis" },
  Cordage: { category: "cordages", label: "Cordage de tennis" },
  Sac: { category: "accessoires", label: "Sac de tennis" },
  Grips: { category: "accessoires", label: "Grip de tennis" },
  Antivibrateur: { category: "accessoires", label: "Antivibrateur de tennis" },
  Protection: { category: "accessoires", label: "Protection de tennis" },
  "Tee-shirt": { category: "textile", label: "T-shirt de tennis" },
  Polo: { category: "textile", label: "Polo de tennis" },
  Short: { category: "textile", label: "Short de tennis" },
  Pantalon: { category: "textile", label: "Pantalon de tennis" },
  Sweat: { category: "textile", label: "Sweat de tennis" },
  Veste: { category: "textile", label: "Veste de tennis" },
  Jupe: { category: "textile", label: "Jupe de tennis" },
  Robe: { category: "textile", label: "Robe de tennis" },
  Chaussettes: { category: "textile", label: "Chaussettes de tennis" },
};

interface ShopifyVariant {
  title: string;
  sku: string | null;
  grams: number | null;
  price: string;
  compare_at_price: string | null;
}

interface ShopifyProduct {
  title: string;
  handle: string;
  product_type: string;
  body_html: string | null;
  variants: ShopifyVariant[];
  images: { src: string }[];
}

function titleCase(raw: string): string {
  return raw
    .toLowerCase()
    .split(" ")
    .map((word) => (word.length > 0 ? word[0].toUpperCase() + word.slice(1) : word))
    .join(" ");
}

async function fetchAllProducts(): Promise<ShopifyProduct[]> {
  const all: ShopifyProduct[] = [];

  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const url = `${MERCHANT_WEBSITE}/collections/${COLLECTION_HANDLE}/products.json?limit=${PAGE_SIZE}&page=${page}`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0", Accept: "application/json" },
    });

    if (!res.ok) {
      throw new Error(`Échec HTTP ${res.status} sur ${url}`);
    }

    const data = (await res.json()) as { products: ShopifyProduct[] };
    all.push(...data.products);

    if (data.products.length < PAGE_SIZE) break;
  }

  return all;
}

async function main() {
  console.log(`Récupération de la collection ${COLLECTION_HANDLE}...`);
  const products = await fetchAllProducts();
  console.log(`${products.length} article(s) trouvé(s) dans la collection.`);

  const [merchant] = await sql`
    INSERT INTO merchants (name, slug, website_url)
    VALUES (${MERCHANT_NAME}, ${MERCHANT_SLUG}, ${MERCHANT_WEBSITE})
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
    RETURNING id
  `;

  let active = 0;
  let tracked = 0;
  let skippedNoPrice = 0;
  let skippedNoImage = 0;
  let skippedUnknownType = 0;
  let skippedOtherSport = 0;
  const excluded: Record<string, number> = {};
  const seenUrls: string[] = [];

  for (const product of products) {
    const variant = product.variants[0];
    const price = variant ? parseFloat(variant.price) : NaN;
    const comparePrice = variant?.compare_at_price ? parseFloat(variant.compare_at_price) : NaN;

    if (!Number.isFinite(price)) {
      skippedNoPrice += 1;
      continue;
    }

    const typeInfo = TYPE_MAP[product.product_type];
    if (!typeInfo) {
      skippedUnknownType += 1;
      console.log(`  type non mappé ignoré : "${product.product_type}" (${product.title})`);
      continue;
    }

    const title = `${typeInfo.label} ${MERCHANT_NAME} ${titleCase(product.title)}`;

    if (OTHER_SPORTS_PATTERN.test(title)) {
      skippedOtherSport += 1;
      continue;
    }

    const imageUrl = product.images[0]?.src;
    if (!imageUrl) {
      skippedNoImage += 1;
      continue;
    }

    const affiliateUrl = `${MERCHANT_WEBSITE}/products/${product.handle}`;

    const outcome = await ingestOffer(sql, {
      title,
      brand: MERCHANT_NAME,
      category: typeInfo.category,
      imageUrl,
      originalPrice: comparePrice,
      discountedPrice: price,
      merchantId: merchant.id,
      affiliateUrl,
      description: product.body_html ?? undefined,
      merchantSku: variant.sku || null,
      rawAttributes: {
        variants: product.variants.map((v) => ({
          title: v.title,
          sku: v.sku || null,
          grams: v.grams ?? null,
        })),
      },
    });

    if (!outcome.inserted) {
      excluded[outcome.reason] = (excluded[outcome.reason] ?? 0) + 1;
      console.log(`  exclu (${outcome.reason}) : ${title}`);
      continue;
    }

    seenUrls.push(affiliateUrl);
    if (outcome.status === "active") active += 1;
    else tracked += 1;
  }

  const excludedTotal = Object.values(excluded).reduce((sum, n) => sum + n, 0);
  console.log(
    `${active} offre(s) active(s), ${tracked} offre(s) suivie(s) sans remise (tracked), ` +
      `${excludedTotal} exclue(s) ${JSON.stringify(excluded)}, ${skippedNoPrice} sans prix, ` +
      `${skippedNoImage} sans image, ${skippedUnknownType} type(s) non mappé(s), ` +
      `${skippedOtherSport} hors tennis.`
  );

  // Éviction : toute offre Tecnifibre `active`/`tracked` dont l'URL n'a pas été
  // revue aujourd'hui (produit retiré de l'outlet). Garde-fous dans
  // `evictMerchantOffers` : aucune éviction si 0 URL vue, ni si moins de la
  // moitié des offres `active`+`tracked` connues ont été revues (R3-Q5).
  const eviction = await evictMerchantOffers(sql, merchant.id, seenUrls);
  if (eviction.guard === "aucune_url_vue") {
    console.log("Aucune offre vue ce passage : éviction ignorée (garde-fou anti-vidage en masse).");
  } else if (eviction.guard === "moins_de_moitie") {
    console.log("Moins de la moitié des offres connues revues : éviction ignorée (garde-fou 50 %).");
  } else {
    console.log(`${eviction.evicted} offre(s) Tecnifibre expirée(s) (disparue(s) de l'outlet).`);
  }
}

await main();
