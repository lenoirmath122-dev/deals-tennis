// Scraping local gratuit — Tennis Point FR (D-2026-09-24-02/04, GAP-2026-09-24-02).
//
// Exécution manuelle à la demande sur la machine de l'utilisateur, pas de cron.
// Ce marchand est aussi candidat à un programme d'affiliation Awin (#13266,
// GAP-2026-09-21-03) : le scraping local s'applique dès maintenant en attendant
// l'acceptation de la candidature (D-2026-09-24-04, décision 4), sera remplacé
// par le flux Awin si/quand elle est acceptée.
//
// Découverte en cours de build (2026-09-25) qui remplace la méthode notée en
// D-2026-09-24-04 ("Algolia, rendu JS/Playwright nécessaire") : robots.txt
// réel identifie explicitement le site comme une boutique Shopify standard
// ("Shopify storefront. Public product, collection, page ... HTML is
// crawlable"), pas d'Algolia. Même principe que Tecnifibre : endpoint JSON
// public `/collections/<handle>/products.json`, aucun Playwright en exécution.
// robots.txt vérifié réellement : aucune interdiction sur les pages collection
// utilisées ici. CGV vérifiées (page "conditions-generales-de-vente") :
// aucune clause anti-scraping.
//
// Plutôt que les pages catégorie tennis (très fragmentées par marque/souscatégorie,
// aucune collection "raquettes-de-tennis" de premier niveau trouvée), ce script
// cible directement les deux collections promotionnelles du site ("10% Sale" -
// aktion-10-sale, ~2457 articles ; "15% Deal" - aktion-deal, ~14 articles
// supplémentaires non présents dans la première) : mêmes principe que la
// collection outlet unique de Tecnifibre, déjà filtrées côté marchand sur des
// articles en promo. Vérifié réellement (2026-09-25) : le catalogue de ces
// deux collections est 100% tennis (aucune occurrence padel/squash/badminton/
// pickleball dans les titres sur les ~2470 articles), le filet de sécurité
// multi-sports est conservé par cohérence avec les autres marchands.
//
// Le champ Shopify `vendor` donne la marque directement (fiable, pas
// d'heuristique nécessaire, contrairement à SportSystem). Le `product_type`
// Shopify mappe vers nos 5 catégories internes (TYPE_MAP ci-dessous) ; les
// types non tennis-spécifiques (chaussures de plage/tongs "Shoes", balles
// géantes gonflables "Giant balls", matériel fitness générique "Coach
// equipment"/"Fitness accessories", "Swimwear", "Sports bags"/"Towels" non
// spécifiquement tennis) sont ignorés (skippedUnknownType), même logique que
// Tecnifibre pour les product_type non mappés.
//
// Découverte D-2026-09-25-11 (hors périmètre initial, traitée dans cette même
// conversation) : les titres de ce marchand utilisent systématiquement le
// pluriel français ("Hommes"/"Femmes"/"Enfants"), non reconnu par le lexique
// partagé extractGender/extractAgeGroup avant cette étape — lexique étendu au
// pluriel dans lib/product-matching.ts (décision explicitement soumise à
// l'utilisateur, impact rétroactif sans régression sur les autres marchands).
import { neon } from "@neondatabase/serverless";
import {
  extractAgeGroup,
  extractColor,
  extractGender,
  extractModel,
} from "../../lib/product-matching.ts";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const sql = neon(process.env.DATABASE_URL);

const MERCHANT_NAME = "Tennis Point FR";
const MERCHANT_SLUG = "tennis-point-fr";
const MERCHANT_WEBSITE = "https://www.tennis-point.fr";
const COLLECTION_HANDLES = ["aktion-10-sale", "aktion-deal"];
const PAGE_SIZE = 250;
const MAX_PAGES = 15; // garde-fou, ~10 pages observées sur aktion-10-sale au 2026-09-25

const OTHER_SPORTS_PATTERN = /padel|squash|badminton|pickleball/i;

interface TypeInfo {
  category: string;
  label: string;
}

// product_type Shopify -> {catégorie interne, libellé FR utilisé dans le titre}.
const TYPE_MAP: Record<string, TypeInfo> = {
  "Tennis rackets": { category: "raquettes", label: "Raquette de tennis" },
  "String reels": { category: "cordages", label: "Cordage de tennis" },
  "Tennis shoes": { category: "chaussures", label: "Chaussures de tennis" },
  Outerwear: { category: "textile", label: "Vêtement de tennis" },
  Jackets: { category: "textile", label: "Vêtement de tennis" },
  Underwear: { category: "textile", label: "Vêtement de tennis" },
  Socks: { category: "textile", label: "Vêtement de tennis" },
  "Tennis balls": { category: "accessoires", label: "Balle de tennis" },
  "Racket bags": { category: "accessoires", label: "Sac de tennis" },
  Backpacks: { category: "accessoires", label: "Sac de tennis" },
  Wristbands: { category: "accessoires", label: "Accessoire de tennis" },
  Overgrips: { category: "accessoires", label: "Accessoire de tennis" },
  "Replacement grips": { category: "accessoires", label: "Accessoire de tennis" },
  "Racket accessories": { category: "accessoires", label: "Accessoire de tennis" },
  Headgear: { category: "accessoires", label: "Accessoire de tennis" },
  Bandages: { category: "accessoires", label: "Accessoire de tennis" },
  Accessories: { category: "accessoires", label: "Accessoire de tennis" },
};

interface ShopifyVariant {
  price: string;
  compare_at_price: string | null;
}

interface ShopifyProduct {
  title: string;
  handle: string;
  vendor: string;
  product_type: string;
  variants: ShopifyVariant[];
  images: { src: string }[];
}

async function fetchCollectionProducts(handle: string): Promise<ShopifyProduct[]> {
  const all: ShopifyProduct[] = [];

  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const url = `${MERCHANT_WEBSITE}/collections/${handle}/products.json?limit=${PAGE_SIZE}&page=${page}`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0", Accept: "application/json" },
    });

    if (!res.ok) {
      throw new Error(`Échec HTTP ${res.status} sur ${url}`);
    }

    const data = (await res.json()) as { products: ShopifyProduct[] };
    all.push(...data.products);

    if (data.products.length < PAGE_SIZE) break;
    if (page === MAX_PAGES) {
      console.warn(`  ATTENTION : ${handle} a atteint MAX_PAGES (${MAX_PAGES}), des articles ont peut-être été manqués.`);
    }
  }

  return all;
}

async function main() {
  console.log(`Récupération des collections promotionnelles (${COLLECTION_HANDLES.join(", ")})...`);
  const byHandle = new Map<string, ShopifyProduct>();
  for (const collection of COLLECTION_HANDLES) {
    const products = await fetchCollectionProducts(collection);
    console.log(`  ${products.length} article(s) trouvé(s) dans ${collection}.`);
    for (const product of products) {
      byHandle.set(product.handle, product);
    }
  }
  console.log(`${byHandle.size} article(s) unique(s) au total.`);

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

  for (const product of byHandle.values()) {
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
      continue;
    }

    const brand = product.vendor.trim();
    const title = `${typeInfo.label} ${brand} ${product.title}`.replace(/\s+/g, " ").trim();

    if (OTHER_SPORTS_PATTERN.test(title)) {
      skippedOtherSport += 1;
      continue;
    }

    const model = extractModel(title, brand, typeInfo.category);
    const color = extractColor(title);
    const gender = extractGender(title);
    const ageGroup = extractAgeGroup(title);
    const imageUrl = product.images[0]?.src ?? null;
    const discountPercentage = Math.round(((comparePrice - price) / comparePrice) * 100);
    const affiliateUrl = `${MERCHANT_WEBSITE}/products/${product.handle}`;

    const [upsertedProduct] = await sql`
      INSERT INTO products (brand, model, category, gender, age_group)
      VALUES (${brand}, ${model}, ${typeInfo.category}, ${gender}, ${ageGroup})
      ON CONFLICT (LOWER(brand), LOWER(model), category)
      DO UPDATE SET
        brand = EXCLUDED.brand,
        gender = CASE WHEN products.gender = 'non_determine' THEN EXCLUDED.gender ELSE products.gender END,
        age_group = CASE WHEN products.age_group = 'adulte' AND EXCLUDED.age_group = 'enfant' THEN 'enfant' ELSE products.age_group END
      RETURNING id
    `;

    await sql`
      INSERT INTO deals (
        title, brand, category, image_url, original_price, discounted_price,
        discount_percentage, merchant_id, affiliate_url, status, is_active,
        color, product_id
      )
      VALUES (
        ${title}, ${brand}, ${typeInfo.category}, ${imageUrl}, ${comparePrice},
        ${price}, ${discountPercentage}, ${merchant.id}, ${affiliateUrl}, 'active', true,
        ${color}, ${upsertedProduct.id}
      )
      ON CONFLICT (merchant_id, affiliate_url) DO UPDATE SET
        title = EXCLUDED.title,
        brand = EXCLUDED.brand,
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

  if (seenUrls.length > 0) {
    const evicted = await sql`
      UPDATE deals
      SET status = 'expired', is_active = false, updated_at = NOW()
      WHERE merchant_id = ${merchant.id}
        AND is_active = true
        AND NOT (affiliate_url = ANY(${seenUrls}))
      RETURNING id
    `;
    console.log(`${evicted.length} offre(s) Tennis Point FR expirée(s) (disparue(s) des collections promo).`);
  } else {
    console.log("Aucune offre vue ce passage : éviction ignorée (garde-fou anti-vidage en masse).");
  }
}

await main();
