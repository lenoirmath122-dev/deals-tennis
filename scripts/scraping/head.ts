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
// - raquettes : /shop-tennis/racquets
// - cordages : /shop-tennis/strings
// - chaussures : /shop-footwear/{men,women,junior}/tennis (pages dédiées
//   100% tennis, séparées de padel/squash/racquetball/pickleball côté
//   marchand)
// - textile : /shop-sportswear/summer — page "Tennis and Padel" du marchand,
//   vérifiée réellement 100% tennis sur l'échantillon parcouru (aucune
//   occurrence padel), contrairement à /shop-sportswear/men|women
//   (générique ski/snowboard, écarté) et /shop-sportswear/junior (mélange
//   ski/tennis non différencié, décision mineure : écarté plutôt que de
//   risquer de contaminer le catalogue avec du ski junior)
// - accessoires : /shop-tennis/{balls,bags,grips,accessories}
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
// `.price-lineThrough-63N`, image = `img` de la carte.
//
// R3.10 (`cadrage_deals-tennis/R3_cadrage.md`) : réécrit pour passer par
// `lib/ingest.ts` (upsert products/deals, statut active/tracked, exclusions,
// sous-catégorie, unité, corrections de marque, éviction avec garde-fou 50 %).
// Une carte sans prix barré est désormais gardée en `status='tracked'` (R3-Q3)
// au lieu d'être ignorée. Vérifié le 2026-09-29 (DOM live) :
// - Hydratation : la page 1 d'une catégorie n'a que 8 cartes pourvues d'un prix
//   au chargement, les autres (jusqu'à 48 par page) reçoivent leur prix après
//   hydratation côté client. L'ancien script lisait juste après le premier
//   sélecteur : il pouvait manquer des cartes. Le script fait défiler la page
//   et attend que les cartes portent leur prix avant de lire.
// - Pagination : 48 cartes par page, `?page=N`. Le nombre de pages n'est plus
//   figé : arrêt sur première page de moins de 48 cartes ou vide (même
//   correction que Babolat, R3.8). `MAX_PAGES_PER_CATEGORY` reste un plafond.
// - `merchant_sku` = suffixe numérique de l'URL (`/product/iprestige-mp-2-0-2026-239826`,
//   identique au `sku` Magento du `__NEXT_DATA__`) quand il existe ; les
//   produits à URL sans suffixe (balles, quelques accessoires) restent sans SKU.
//   `data-index` de la carte (identifiant Magento interne, présent sur toutes
//   les cartes) va dans `raw_attributes.externalId` : c'est un autre
//   identifiant que le SKU, ils ne sont pas mélangés dans la même colonne.
// - Ni GTIN ni référence fabricant sur la carte ni dans le JSON-LD de la
//   catégorie (un simple fil d'Ariane) ; le `__NEXT_DATA__` de la page 1 ne
//   porte que 8 articles sur 48, il n'est donc pas utilisé. Reste R3.12.
import { chromium, type Browser, type Page } from "playwright";
import { neon } from "@neondatabase/serverless";
import { evictMerchantOffers, ingestOffer } from "../../lib/ingest.ts";
import type { DealCategory } from "../../types/database.ts";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const sql = neon(process.env.DATABASE_URL);

const MERCHANT_NAME = "Head";
const MERCHANT_SLUG = "head";
const MERCHANT_WEBSITE = "https://www.head.com";
const BRAND = "Head";
const NAV_TIMEOUT_MS = 30_000;
const HYDRATION_TIMEOUT_MS = 15_000;
const PAGE_SIZE = 48; // cartes par page côté marchand (vérifié le 2026-09-29)
const MAX_PAGES_PER_CATEGORY = 10; // garde-fou, 3 pages au maximum au 2026-09-29

const OTHER_SPORTS_PATTERN = /padel|squash|badminton|pickleball/i;

interface CategoryConfig {
  urlPath: string; // relatif à /fr_FR
  dbCategory: DealCategory;
  genderHint?: "Homme" | "Femme";
  ageHint?: "Enfant";
}

const CATEGORIES: CategoryConfig[] = [
  { urlPath: "shop-tennis/racquets", dbCategory: "raquettes" },
  { urlPath: "shop-tennis/strings", dbCategory: "cordages" },
  { urlPath: "shop-footwear/men/tennis", dbCategory: "chaussures", genderHint: "Homme" },
  { urlPath: "shop-footwear/women/tennis", dbCategory: "chaussures", genderHint: "Femme" },
  { urlPath: "shop-footwear/junior/tennis", dbCategory: "chaussures", ageHint: "Enfant" },
  { urlPath: "shop-sportswear/summer", dbCategory: "textile" },
  { urlPath: "shop-tennis/balls", dbCategory: "accessoires" },
  { urlPath: "shop-tennis/bags", dbCategory: "accessoires" },
  { urlPath: "shop-tennis/grips", dbCategory: "accessoires" },
  { urlPath: "shop-tennis/accessories", dbCategory: "accessoires" },
];

interface ScrapedProduct {
  url: string;
  name: string;
  image: string | null;
  price: number;
  originalPrice: number | null; // null : pas de prix barré (offre `tracked`)
  externalId: string | null;
}

interface CategoryPage {
  cards: number; // nombre de cartes vues sur la page, prix lus ou non
  products: ScrapedProduct[];
}

// La page 1 ne porte que 8 prix au chargement : les autres cartes se
// remplissent après hydratation. On fait défiler pour la déclencher, puis on
// attend (sans échouer) que chaque carte porte son prix. Une carte qui n'en a
// toujours pas (ex. « Hybrid Spin set », sans prix affiché) est ignorée.
async function scrapeCategoryPage(page: Page, url: string): Promise<CategoryPage> {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: NAV_TIMEOUT_MS });
  const hasCards = await page
    .waitForSelector(".productCard-root-JO3", { timeout: NAV_TIMEOUT_MS })
    .then(() => true)
    .catch(() => false);
  if (!hasCards) return { cards: 0, products: [] };

  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 700) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 120));
    }
  });
  await page
    .waitForFunction(
      () => {
        const cards = document.querySelectorAll(".productCard-root-JO3");
        return (
          cards.length > 0 &&
          [...cards].every((card) => card.querySelector(".price-finalPrice-J0H"))
        );
      },
      undefined,
      { timeout: HYDRATION_TIMEOUT_MS }
    )
    .catch(() => undefined);

  return page.evaluate(() => {
    const cards = [...document.querySelectorAll(".productCard-root-JO3")];
    const products: {
      url: string;
      name: string;
      image: string | null;
      price: number;
      originalPrice: number | null;
      externalId: string | null;
    }[] = [];

    const parsePrice = (raw: string | null): number => {
      if (!raw) return NaN;
      const cleaned = raw.replace(/[^\d,.\s]/g, "").replace(/\s/g, "").replace(",", ".");
      return parseFloat(cleaned);
    };

    for (const card of cards) {
      const link = card.querySelector<HTMLAnchorElement>('a[href*="/product/"]:not([aria-hidden])');
      const priceEl = card.querySelector(".price-finalPrice-J0H");
      const lineThroughEl = card.querySelector(".price-lineThrough-63N");
      const img = card.querySelector("img");

      if (!link || !priceEl) continue;

      products.push({
        url: link.getAttribute("href") ?? "",
        name: link.textContent?.trim().replace(/\s+/g, " ") ?? "",
        image: img?.getAttribute("src") ?? null,
        price: parsePrice(priceEl.textContent),
        originalPrice: lineThroughEl ? parsePrice(lineThroughEl.textContent) : null,
        externalId: card.getAttribute("data-index"),
      });
    }

    return { cards: cards.length, products };
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
  let active = 0;
  let tracked = 0;
  const excluded: Record<string, number> = {};
  let skippedOtherSport = 0;
  let skippedUnparsable = 0;
  let withSku = 0;
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

      for (let pageNum = 1; pageNum <= MAX_PAGES_PER_CATEGORY; pageNum += 1) {
        const url =
          pageNum === 1
            ? `${MERCHANT_WEBSITE}/fr_FR/${config.urlPath}`
            : `${MERCHANT_WEBSITE}/fr_FR/${config.urlPath}?page=${pageNum}`;

        const { cards, products } = await scrapeCategoryPage(page, url);

        for (const product of products) {
          if (
            !product.url ||
            !product.name ||
            !Number.isFinite(product.price) ||
            product.price <= 0
          ) {
            skippedUnparsable += 1;
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

          // Un prix barré incohérent (≤ prix courant ou illisible) équivaut à
          // « pas de remise » : `resolvePrice` le traite en `tracked`.
          const originalPrice =
            product.originalPrice !== null &&
            Number.isFinite(product.originalPrice) &&
            product.originalPrice > product.price
              ? product.originalPrice
              : product.price;

          const merchantSku = product.url.match(/-(\d+)$/)?.[1] ?? null;
          if (merchantSku) withSku += 1;

          const outcome = await ingestOffer(sql, {
            title,
            brand: BRAND,
            category: config.dbCategory,
            imageUrl: product.image ?? "",
            originalPrice,
            discountedPrice: product.price,
            merchantId: merchant.id,
            affiliateUrl,
            merchantSku,
            rawAttributes: {
              externalId: product.externalId,
              merchantName: product.name,
              sourcePage: config.urlPath,
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
          categoryCount += 1;
        }

        // Dernière page : moins d'une page pleine (ou vide). Le nombre de pages
        // n'est pas figé, le catalogue dérive (cf. Babolat, R3.8).
        if (cards < PAGE_SIZE) break;
      }

      console.log(`  ${categoryCount} offre(s) retenue(s) pour ${config.urlPath}.`);
    }
  } finally {
    await browser?.close();
  }

  const excludedTotal = Object.values(excluded).reduce((sum, n) => sum + n, 0);
  console.log(
    `${active} offre(s) active(s), ${tracked} offre(s) suivie(s) sans remise (tracked), ` +
      `${excludedTotal} exclue(s) ${JSON.stringify(excluded)}, ${skippedOtherSport} hors tennis, ` +
      `${skippedUnparsable} carte(s) sans prix lisible, ${withSku} avec SKU.`
  );

  // Éviction : garde-fous (0 URL vue, moins de la moitié des offres connues
  // revues) dans `evictMerchantOffers` (R3-Q5).
  const eviction = await evictMerchantOffers(sql, merchant.id, seenUrls);
  if (eviction.guard === "aucune_url_vue") {
    console.log("Aucune offre vue ce passage : éviction ignorée (garde-fou anti-vidage en masse).");
  } else if (eviction.guard === "moins_de_moitie") {
    console.log("Moins de la moitié des offres connues revues : éviction ignorée (garde-fou 50 %).");
  } else {
    console.log(`${eviction.evicted} offre(s) Head expirée(s) (disparue(s) des pages catégorie).`);
  }
}

await main();
