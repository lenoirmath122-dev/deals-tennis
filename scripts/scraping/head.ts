// Scraping local gratuit — Head (D-2026-09-24-02/03/04, GAP-2026-09-24-02).
//
// Exécution manuelle à la demande sur la machine de l'utilisateur, pas de cron.
// Site Magento SSR classique côté "shop", mais protégé par un checkpoint
// anti-bot Vercel : vérifié réellement (2026-09-25), une requête `curl`/`fetch`
// simple (même avec un User-Agent de navigateur) reçoit systématiquement la
// page "Vercel Security Checkpoint" (429), y compris sur robots.txt en
// `/fr_fr/` ; en revanche un vrai navigateur (Playwright, non headless) charge
// toutes les pages normalement, aucun blocage rencontré. Confirme la
// découverte de D-2026-09-24-03 : Playwright nécessaire pour ce marchand,
// contrairement aux autres scripts de ce chantier (HTTP simple suffisant).
//
// robots.txt re-vérifié réellement à `https://www.head.com/robots.txt`
// (racine, pas `/fr_fr/robots.txt` qui répond 404) : le blocage total
// (`Disallow: /`) documenté en D-2026-09-23-09 n'existe plus — le fichier
// actuel est un robots.txt Magento standard (répertoires techniques,
// checkout, compte client... aucune interdiction sur les pages catégorie
// `/shop-tennis/*`, `/shop-footwear/*`, `/shop-sportswear/*` utilisées ici).
// CGU ("Terms of Use") vérifiées réellement : clause générale interdisant de
// « modifier, adapter, reproduire ou altérer le Site internet ou son contenu
// ou d'intégrer le Site internet ou son contenu à un autre site internet » —
// même catégorie de risque contractuel déjà assumée pour Babolat/Sport 2000/
// SportSystem/Tennispro.fr/Amazon (D-2026-09-24-03/04), pas une escalade.
//
// Périmètre des pages, vérifié réellement en Playwright (2026-09-25) :
// - raquettes : /shop-tennis/racquets (3 pages)
// - cordages : /shop-tennis/strings (1 page)
// - chaussures : /shop-footwear/{men,women,junior}/tennis (pages dédiées
//   100% tennis, séparées de padel/squash/racquetball/pickleball côté
//   marchand — 1 page chacune)
// - textile : /shop-sportswear/summer (4 pages) — page "Tennis and Padel"
//   du marchand, vérifiée réellement 100% tennis sur l'échantillon parcouru
//   (aucune occurrence padel), contrairement à /shop-sportswear/men|women
//   (générique ski/snowboard, écarté) et /shop-sportswear/junior (mélange
//   ski/tennis non différencié, décision mineure : écarté plutôt que de
//   risquer de contaminer le catalogue avec du ski junior)
// - accessoires : /shop-tennis/{balls,bags,grips,accessories} (bags et
//   accessories paginées sur 2 pages, balls/grips 1 page)
// Filet de sécurité multi-sports conservé par cohérence (padel/squash/
// badminton/pickleball), même si ces pages sont déjà scopées tennis par le
// marchand — même logique que les autres marchands déjà scrapés.
//
// Marque unique du site (Head), pas d'heuristique nécessaire. Les titres
// scrappés sont déjà auto-descriptifs ("HEAD Hybrid Spin cordages de
// tennis", "HEAD Sac de tennis Team M") : utilisés tels quels, sans préfixe
// de libellé construit (contrairement à SportSystem/Tennis Point FR où le
// nom brut ne suffisait pas). Un indice de sexe/âge (Homme/Femme/Enfant) est
// ajouté au titre construit à partir de la page d'origine pour les
// catégories chaussures (même mécanisme que SportSystem), en plus du
// lexique `extractGender`/`extractAgeGroup` déjà appliqué au titre brut.
//
// Sélecteurs de carte produit vérifiés réellement (2026-09-25, DOM live) :
// carte = `.productCard-root-JO3`, lien produit = premier
// `a[href*="/product/"]` non aria-hidden, prix actuel =
// `.price-finalPrice-J0H`, prix barré (présent seulement si vraie promo) =
// `.price-lineThrough-63N`, image = `img` de la carte. Une offre sans prix
// barré est ignorée (`skippedNoDiscount`), même logique que Babolat/
// Tecnifibre/Tennis Point FR.
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

const sql = neon(process.env.DATABASE_URL);

const MERCHANT_NAME = "Head";
const MERCHANT_SLUG = "head";
const MERCHANT_WEBSITE = "https://www.head.com";
const BRAND = "Head";
const NAV_TIMEOUT_MS = 30_000;

const OTHER_SPORTS_PATTERN = /padel|squash|badminton|pickleball/i;

interface CategoryConfig {
  urlPath: string; // relatif à /fr_FR
  dbCategory: string;
  pages: number; // nombre de pages vérifié réellement au cadrage
  genderHint?: "Homme" | "Femme";
  ageHint?: "Enfant";
}

const CATEGORIES: CategoryConfig[] = [
  { urlPath: "shop-tennis/racquets", dbCategory: "raquettes", pages: 3 },
  { urlPath: "shop-tennis/strings", dbCategory: "cordages", pages: 1 },
  {
    urlPath: "shop-footwear/men/tennis",
    dbCategory: "chaussures",
    pages: 1,
    genderHint: "Homme",
  },
  {
    urlPath: "shop-footwear/women/tennis",
    dbCategory: "chaussures",
    pages: 1,
    genderHint: "Femme",
  },
  {
    urlPath: "shop-footwear/junior/tennis",
    dbCategory: "chaussures",
    pages: 1,
    ageHint: "Enfant",
  },
  { urlPath: "shop-sportswear/summer", dbCategory: "textile", pages: 4 },
  { urlPath: "shop-tennis/balls", dbCategory: "accessoires", pages: 1 },
  { urlPath: "shop-tennis/bags", dbCategory: "accessoires", pages: 2 },
  { urlPath: "shop-tennis/grips", dbCategory: "accessoires", pages: 1 },
  { urlPath: "shop-tennis/accessories", dbCategory: "accessoires", pages: 2 },
];

interface ScrapedProduct {
  url: string;
  name: string;
  image: string | null;
  price: number;
  originalPrice: number;
}

async function scrapeCategoryPage(page: Page, url: string): Promise<ScrapedProduct[]> {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: NAV_TIMEOUT_MS });
  await page.waitForSelector(".productCard-root-JO3", { timeout: NAV_TIMEOUT_MS });

  return page.evaluate(() => {
    const cards = [...document.querySelectorAll(".productCard-root-JO3")];
    const results: {
      url: string;
      name: string;
      image: string | null;
      price: number;
      originalPrice: number;
    }[] = [];

    for (const card of cards) {
      const link = card.querySelector<HTMLAnchorElement>('a[href*="/product/"]:not([aria-hidden])');
      const priceEl = card.querySelector(".price-finalPrice-J0H");
      const lineThroughEl = card.querySelector(".price-lineThrough-63N");
      const img = card.querySelector("img");

      if (!link || !priceEl) continue;
      if (!lineThroughEl) continue; // pas de vraie remise, cf. logique Babolat/Tecnifibre

      const parsePrice = (raw: string | null): number => {
        if (!raw) return NaN;
        const cleaned = raw.replace(/[^\d,.\s]/g, "").replace(/\s/g, "").replace(",", ".");
        return parseFloat(cleaned);
      };

      results.push({
        url: link.getAttribute("href") ?? "",
        name: link.textContent?.trim().replace(/\s+/g, " ") ?? "",
        image: img?.getAttribute("src") ?? null,
        price: parsePrice(priceEl.textContent),
        originalPrice: parsePrice(lineThroughEl.textContent),
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

  let browser: Browser | undefined;
  let inserted = 0;
  let skippedNoDiscount = 0;
  let skippedOtherSport = 0;
  let skippedUnparsable = 0;
  const seenUrls: string[] = [];

  try {
    browser = await chromium.launch({ headless: false });
    const page = await browser.newPage({
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
    });

    for (const config of CATEGORIES) {
      console.log(`Récupération de ${config.urlPath}...`);
      let categoryCount = 0;

      for (let pageNum = 1; pageNum <= config.pages; pageNum += 1) {
        const url =
          pageNum === 1
            ? `${MERCHANT_WEBSITE}/fr_FR/${config.urlPath}`
            : `${MERCHANT_WEBSITE}/fr_FR/${config.urlPath}?page=${pageNum}`;

        const products = await scrapeCategoryPage(page, url);

        for (const product of products) {
          if (!product.url || !product.name) {
            skippedUnparsable += 1;
            continue;
          }

          if (
            !Number.isFinite(product.price) ||
            !Number.isFinite(product.originalPrice) ||
            product.originalPrice <= product.price
          ) {
            skippedNoDiscount += 1;
            continue;
          }

          const genderSuffix = config.genderHint ? ` ${config.genderHint}` : "";
          const ageSuffix = config.ageHint ? ` ${config.ageHint}` : "";
          const title = `${product.name}${genderSuffix}${ageSuffix}`.replace(/\s+/g, " ").trim();

          if (OTHER_SPORTS_PATTERN.test(title) || OTHER_SPORTS_PATTERN.test(product.url)) {
            skippedOtherSport += 1;
            continue;
          }

          const affiliateUrl = product.url.startsWith("http")
            ? product.url
            : `${MERCHANT_WEBSITE}${product.url}`;

          const model = extractModel(title, BRAND, config.dbCategory);
          const color = extractColor(title);
          const gender = extractGender(title);
          const ageGroup = extractAgeGroup(title, config.dbCategory);
          const discountPercentage = Math.round(
            ((product.originalPrice - product.price) / product.originalPrice) * 100
          );

          const [upsertedProduct] = await sql`
            INSERT INTO products (brand, model, category, gender, age_group)
            VALUES (${BRAND}, ${model}, ${config.dbCategory}, ${gender}, ${ageGroup})
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
              ${title}, ${BRAND}, ${config.dbCategory}, ${product.image}, ${product.originalPrice},
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
      }

      console.log(`  ${categoryCount} offre(s) retenue(s) pour ${config.urlPath}.`);
    }
  } finally {
    await browser?.close();
  }

  console.log(
    `${inserted} offre(s) insérée(s)/mise(s) à jour au total, ${skippedNoDiscount} sans remise réelle, ` +
      `${skippedOtherSport} hors tennis, ${skippedUnparsable} bloc(s) non parsable(s).`
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
    console.log(`${evicted.length} offre(s) Head expirée(s) (disparue(s) des pages catégorie).`);
  } else {
    console.log("Aucune offre vue ce passage : éviction ignorée (garde-fou anti-vidage en masse).");
  }
}

await main();
