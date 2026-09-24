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
// Une seule collection ciblée : `outlet-articles-de-tennis`. Vérifié réellement
// (2026-09-24) que c'est la seule collection Tecnifibre où les articles ont un
// vrai `compare_at_price` (prix barré) — les collections catalogue "normales"
// (raquettes-de-tennis, cordages-raquettes-tennis, etc.) n'ont quasiment aucune
// remise active. Elle couvre déjà raquettes/accessoires/textile ; Tecnifibre ne
// vend pas de chaussures (catégorie absente du site) et les cordages n'y sont
// jamais en promo au moment de la vérification (accepté à 0 article, comme pour
// Babolat/D-2026-09-24-05 — pas de sélecteur cordage forcé).
import { neon } from "@neondatabase/serverless";
import { extractColor, extractModel } from "../../lib/product-matching.ts";

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
const TYPE_MAP: Record<string, { category: string; label: string }> = {
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
  price: string;
  compare_at_price: string | null;
}

interface ShopifyProduct {
  title: string;
  handle: string;
  product_type: string;
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

  let inserted = 0;
  let skippedNoDiscount = 0;
  let skippedUnknownType = 0;
  let skippedOtherSport = 0;
  const seenUrls: string[] = [];

  for (const product of products) {
    const variant = product.variants[0];
    const price = variant ? parseFloat(variant.price) : NaN;
    const comparePrice = variant?.compare_at_price ? parseFloat(variant.compare_at_price) : NaN;

    if (!Number.isFinite(price) || !Number.isFinite(comparePrice) || comparePrice <= price) {
      skippedNoDiscount += 1;
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

    const model = extractModel(title, MERCHANT_NAME, typeInfo.category);
    const color = extractColor(title);
    const imageUrl = product.images[0]?.src;
    if (!imageUrl) {
      skippedNoDiscount += 1; // pas de champ dédié, mais même effet : offre incomplète ignorée
      continue;
    }

    const discountPercentage = Math.round(((comparePrice - price) / comparePrice) * 100);
    const affiliateUrl = `${MERCHANT_WEBSITE}/products/${product.handle}`;

    const [upsertedProduct] = await sql`
      INSERT INTO products (brand, model, category)
      VALUES (${MERCHANT_NAME}, ${model}, ${typeInfo.category})
      ON CONFLICT (LOWER(brand), LOWER(model), category)
      DO UPDATE SET brand = EXCLUDED.brand
      RETURNING id
    `;

    await sql`
      INSERT INTO deals (
        title, brand, category, image_url, original_price, discounted_price,
        discount_percentage, merchant_id, affiliate_url, status, is_active,
        color, product_id
      )
      VALUES (
        ${title}, ${MERCHANT_NAME}, ${typeInfo.category}, ${imageUrl}, ${comparePrice},
        ${price}, ${discountPercentage}, ${merchant.id}, ${affiliateUrl}, 'active', true,
        ${color}, ${upsertedProduct.id}
      )
      ON CONFLICT (merchant_id, affiliate_url) DO UPDATE SET
        title = EXCLUDED.title,
        image_url = EXCLUDED.image_url,
        original_price = EXCLUDED.original_price,
        discounted_price = EXCLUDED.discounted_price,
        discount_percentage = EXCLUDED.discount_percentage,
        status = 'active',
        is_active = true,
        color = EXCLUDED.color,
        product_id = EXCLUDED.product_id,
        updated_at = NOW()
    `;

    seenUrls.push(affiliateUrl);
    inserted += 1;
  }

  console.log(
    `${inserted} offre(s) insérée(s)/mise(s) à jour, ${skippedNoDiscount} sans remise réelle, ` +
      `${skippedUnknownType} type(s) non mappé(s), ${skippedOtherSport} hors tennis.`
  );

  // Éviction : toute offre Tecnifibre déjà en base dont l'URL n'a pas été revue
  // aujourd'hui (produit retiré de l'outlet ou promo terminée). Garde-fou :
  // ne s'exécute que si au moins une offre a été vue ce passage (même logique
  // que le workflow n8n ProTennis, GAP-2026-09-22-09/n8n-eviction).
  if (seenUrls.length > 0) {
    const evicted = await sql`
      UPDATE deals
      SET status = 'expired', is_active = false, updated_at = NOW()
      WHERE merchant_id = ${merchant.id}
        AND is_active = true
        AND NOT (affiliate_url = ANY(${seenUrls}))
      RETURNING id
    `;
    console.log(`${evicted.length} offre(s) Tecnifibre expirée(s) (disparue(s) de l'outlet).`);
  } else {
    console.log("Aucune offre vue ce passage : éviction ignorée (garde-fou anti-vidage en masse).");
  }
}

await main();
