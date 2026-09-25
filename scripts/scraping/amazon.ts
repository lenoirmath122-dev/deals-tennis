// Scraping local gratuit — Amazon (D-2026-09-24-02/04/05, GAP-2026-09-24-02).
//
// Exécution manuelle à la demande sur la machine de l'utilisateur, pas de cron.
// Amazon Partenaires (programme d'affiliation dont l'utilisateur est déjà
// membre) interdit explicitement le scraping automatisé dans ses CGU — risque
// contractuel déjà signalé et assumé consciemment (D-2026-09-24-01/02/03,
// même famille de risque que Babolat/Sport 2000/SportSystem/Tennispro.fr/Head).
//
// Pas de page catégorie fixe côté Amazon (marketplace généraliste) : recherche
// par mot-clé, un mot-clé par catégorie interne, tranché en D-2026-09-24-05 :
// "raquette de tennis", "cordage tennis", "chaussures de tennis",
// "vêtement de tennis", "accessoire tennis".
//
// Rendu : une requête HTTP simple (curl/fetch) reçoit un 503 (comportement
// anti-bot déjà documenté en D-2026-09-24-04) ; un vrai navigateur Playwright
// non headless passe sans blocage, aucun captcha rencontré en vérifiant
// réellement (2026-09-25). Comme Head, seul marchand de ce chantier à
// nécessiter Playwright plutôt que du HTTP simple.
//
// Sélecteurs vérifiés réellement (2026-09-25, DOM live, plusieurs mots-clés) —
// affinent ceux esquissés en D-2026-09-24-05 : carte = `[data-asin]` non vide,
// titre = attribut `aria-label` du `h2[aria-label]` de la carte (plus fiable
// que le texte du premier `h2 span`, qui correspond parfois au `h2` "marque"
// séparé quand celui-ci existe — `h2.s-line-clamp-1`, vérifié présent mais pas
// systématiquement selon les fiches, donc non utilisé pour la marque : voir
// extractAmazonBrand ci-dessous, qui utilise le premier mot du titre, marque
// toujours en tête sur les fiches Amazon.fr observées). Prix/remise scopés à
// l'intérieur de `[data-cy="price-recipe"]` (bloc dédié à la carte, évite de
// capter un prix à l'unité ou un prix sans rapport ailleurs dans la carte) :
// prix actuel = `.a-price:not(.a-text-price) .a-offscreen`, prix de référence
// = `.a-price.a-text-price[data-a-strike="true"] .a-offscreen` (l'attribut
// `data-a-strike="true"` est indispensable : un `.a-price.a-text-price` sans
// cet attribut existe sur certaines fiches sans rapport avec une remise,
// donnant un "prix de référence" inférieur au prix actuel si on l'utilise
// sans cette condition — découvert et corrigé en vérifiant réellement contre
// des fiches où price > refPrice, incohérent). Lien produit reconstruit depuis
// l'ASIN (`amazon.fr/dp/{asin}`) plutôt que gardé tel quel (paramètres de
// tracking/session qui changeraient à chaque passage, cassant l'idempotence
// de l'upsert `ON CONFLICT (merchant_id, affiliate_url)`).
//
// Filtre positif supplémentaire (décision mineure, propre à Amazon) : contrairement
// aux autres marchands qui exposent des pages catégorie déjà scopées tennis,
// la recherche Amazon renvoie aussi du bruit hors sujet (ex. porte-clés
// multi-sports sans rapport, vu réellement sur "accessoire tennis") — un
// article est retenu seulement si son titre contient le mot "tennis" (en plus
// du filet de sécurité multi-sports habituel qui exclut padel/squash/
// badminton/pickleball, étendu ici à "tennis de table"/"ping-pong" — trouvés
// réellement mélangés aux résultats "raquette de tennis").
//
// Pas de page produit à visiter pour la marque (contrairement à SportSystem) :
// extractAmazonBrand compare le titre à une liste de marques connues plutôt
// que de prendre le premier mot du titre — approche naïve essayée puis
// abandonnée en cours de build (voir plus bas), remplacée depuis par un filtre
// d'exclusion sur marque reconnue (D-2026-09-25-16, voir plus bas).
//
// Tag d'affiliation Amazon Partenaires (AMAZON_ASSOCIATE_TAG, .env.local,
// jamais committé) ajouté en paramètre `?tag=` sur chaque lien — sans lui,
// aucune commission n'est attribuée à l'utilisateur.
import { chromium, type Browser, type Page } from "playwright";
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
if (!process.env.AMAZON_ASSOCIATE_TAG) {
  throw new Error("AMAZON_ASSOCIATE_TAG is not set");
}

const sql = neon(process.env.DATABASE_URL);

const MERCHANT_NAME = "Amazon";
const MERCHANT_SLUG = "amazon";
const MERCHANT_WEBSITE = "https://www.amazon.fr";
const ASSOCIATE_TAG = process.env.AMAZON_ASSOCIATE_TAG;
const NAV_TIMEOUT_MS = 30_000;

const OTHER_SPORTS_PATTERN =
  /padel|squash|badminton|pickleball|tennis\s+de\s+table|ping.?pong|tischtennis/i;
const TENNIS_WORD_PATTERN = /tennis/i;

// Filtre marque (D-2026-09-25-16) : suite à des articles hors sujet remontés par
// l'utilisateur sur le catalogue en prod (ex. GAP-2026-09-25-12, décoration de
// gâteau "tennis"), décision de ne garder qu'une offre Amazon si sa marque est
// reconnue — reconnue = déjà présente parmi les offres actives des autres
// marchands du catalogue au moment du scraping (requête dynamique, voir
// fetchKnownBrands ci-dessous), pas une liste figée dans ce fichier. Une offre
// dont aucune marque connue n'est trouvée en tête du titre est exclue
// (auparavant : conservée avec `brand = 'Générique'` — ce comportement a été
// explicitement abandonné par l'utilisateur au profit d'un filtrage plus strict
// "à la source", quitte à réduire le volume Amazon).
//
// Découverte en cours du tout premier build de ce script (historique, toujours
// valable pour le principe de correspondance) : prendre le premier mot du titre
// comme marque produit des faux positifs massifs sur les fiches de petits
// vendeurs sans marque affichée en tête — le titre commence alors par un mot
// générique du produit ("Lot", "Support", "Polo", "Robe", "Jupes"...), pas une
// marque. Sur les 42 offres du premier passage réel, 18/42 (43%) avaient une
// "marque" absurde de ce type — corrigé par une comparaison à une liste de
// marques connues (`startsWith`) plutôt qu'un mot pris au hasard.

interface CategoryConfig {
  keyword: string;
  dbCategory: string;
}

const CATEGORIES: CategoryConfig[] = [
  { keyword: "raquette de tennis", dbCategory: "raquettes" },
  { keyword: "cordage tennis", dbCategory: "cordages" },
  { keyword: "chaussures de tennis", dbCategory: "chaussures" },
  { keyword: "vêtement de tennis", dbCategory: "textile" },
  { keyword: "accessoire tennis", dbCategory: "accessoires" },
];

interface ScrapedProduct {
  asin: string;
  title: string;
  image: string | null;
  price: number;
  originalPrice: number;
}

async function fetchKnownBrands(): Promise<string[]> {
  const rows = await sql`
    SELECT DISTINCT d.brand
    FROM deals d
    JOIN merchants m ON m.id = d.merchant_id
    WHERE m.slug != ${MERCHANT_SLUG}
      AND d.status = 'active'
      AND d.is_active = true
      AND d.brand IS NOT NULL
      AND d.brand <> 'Générique'
  `;
  return rows
    .map((row) => row.brand as string)
    .sort((a, b) => b.length - a.length);
}

function extractAmazonBrand(title: string, knownBrands: string[]): string | null {
  const normalized = title.trim().toLowerCase();
  for (const brand of knownBrands) {
    if (normalized.startsWith(brand.toLowerCase())) {
      return brand;
    }
  }
  return null;
}

async function scrapeKeyword(page: Page, keyword: string): Promise<ScrapedProduct[]> {
  const url = `${MERCHANT_WEBSITE}/s?k=${encodeURIComponent(keyword)}`;
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: NAV_TIMEOUT_MS });
  await page.waitForSelector("[data-asin]", { timeout: NAV_TIMEOUT_MS });
  await page.waitForTimeout(1500);

  return page.evaluate(() => {
    const cards = [...document.querySelectorAll("[data-asin]")].filter(
      (c) => c.getAttribute("data-asin") && c.querySelector("h2[aria-label]")
    );
    const seen = new Set<string>();
    const results: {
      asin: string;
      title: string;
      image: string | null;
      price: number;
      originalPrice: number;
    }[] = [];

    const parsePrice = (raw: string | null): number => {
      if (!raw) return NaN;
      const cleaned = raw.replace(/[^\d,.\s]/g, "").replace(/\s/g, "").replace(",", ".");
      return parseFloat(cleaned);
    };

    for (const card of cards) {
      const asin = card.getAttribute("data-asin")!;
      if (seen.has(asin)) continue;
      seen.add(asin);

      const titleEl = card.querySelector("h2[aria-label]");
      const title = titleEl?.getAttribute("aria-label")?.trim() ?? "";
      const priceRecipe = card.querySelector('[data-cy="price-recipe"]');
      const priceEl = priceRecipe?.querySelector(".a-price:not(.a-text-price) .a-offscreen");
      const refEl = priceRecipe?.querySelector(
        '.a-price.a-text-price[data-a-strike="true"] .a-offscreen'
      );
      const link =
        priceRecipe?.querySelector('a[href*="/dp/"]')?.getAttribute("href") ??
        card.querySelector('h2[aria-label] a[href*="/dp/"]')?.getAttribute("href") ??
        null;
      const image = card.querySelector<HTMLImageElement>("img.s-image")?.src ?? null;

      if (!title || !link) continue;

      results.push({
        asin,
        title,
        image,
        price: parsePrice(priceEl?.textContent ?? null),
        originalPrice: parsePrice(refEl?.textContent ?? null),
      });
    }

    return results;
  });
}

async function main() {
  const [merchant] = await sql`
    INSERT INTO merchants (name, slug, website_url)
    VALUES (${MERCHANT_NAME}, ${MERCHANT_SLUG}, ${MERCHANT_WEBSITE})
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
    RETURNING id
  `;

  const knownBrands = await fetchKnownBrands();
  console.log(`${knownBrands.length} marque(s) connue(s) chargée(s) depuis la base (référence dynamique).`);

  let browser: Browser | undefined;
  let inserted = 0;
  let skippedNoDiscount = 0;
  let skippedOtherSport = 0;
  let skippedNotTennis = 0;
  let skippedUnparsable = 0;
  let skippedUnknownBrand = 0;
  const seenUrls: string[] = [];

  try {
    browser = await chromium.launch({ headless: false });
    const page = await browser.newPage({
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
    });

    for (const config of CATEGORIES) {
      console.log(`Recherche "${config.keyword}"...`);
      let categoryCount = 0;

      const products = await scrapeKeyword(page, config.keyword);

      for (const product of products) {
        if (!Number.isFinite(product.price) || product.price <= 0) {
          skippedUnparsable += 1;
          continue;
        }

        if (!Number.isFinite(product.originalPrice) || product.originalPrice <= product.price) {
          skippedNoDiscount += 1;
          continue;
        }

        if (!TENNIS_WORD_PATTERN.test(product.title)) {
          skippedNotTennis += 1;
          continue;
        }

        if (OTHER_SPORTS_PATTERN.test(product.title)) {
          skippedOtherSport += 1;
          continue;
        }

        const brand = extractAmazonBrand(product.title, knownBrands);
        if (brand === null) {
          skippedUnknownBrand += 1;
          continue;
        }

        const affiliateUrl = `${MERCHANT_WEBSITE}/dp/${product.asin}?tag=${ASSOCIATE_TAG}`;
        const model = extractModel(product.title, brand, config.dbCategory);
        const color = extractColor(product.title);
        const gender = extractGender(product.title);
        const ageGroup = extractAgeGroup(product.title);
        const discountPercentage = Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) * 100
        );

        const [upsertedProduct] = await sql`
          INSERT INTO products (brand, model, category, gender, age_group)
          VALUES (${brand}, ${model}, ${config.dbCategory}, ${gender}, ${ageGroup})
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
            ${product.title}, ${brand}, ${config.dbCategory}, ${product.image}, ${product.originalPrice},
            ${product.price}, ${discountPercentage}, ${merchant.id}, ${affiliateUrl}, 'active', true,
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
        categoryCount += 1;
      }

      console.log(`  ${categoryCount} offre(s) retenue(s) pour "${config.keyword}".`);
    }
  } finally {
    await browser?.close();
  }

  console.log(
    `${inserted} offre(s) insérée(s)/mise(s) à jour au total, ${skippedNoDiscount} sans remise réelle, ` +
      `${skippedNotTennis} sans le mot "tennis" dans le titre, ${skippedOtherSport} hors tennis, ` +
      `${skippedUnknownBrand} marque non reconnue, ${skippedUnparsable} bloc(s) non parsable(s).`
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
    console.log(`${evicted.length} offre(s) Amazon expirée(s) (disparue(s) des résultats de recherche).`);
  } else {
    console.log("Aucune offre vue ce passage : éviction ignorée (garde-fou anti-vidage en masse).");
  }
}

await main();
