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
// la recherche par mot-clé Amazon renvoie aussi du bruit hors sujet (ex.
// porte-clés multi-sports sans rapport, vu réellement sur "accessoire tennis")
// — un article est retenu seulement si son titre contient le mot "tennis" (en
// plus du filet de sécurité multi-sports habituel qui exclut padel/squash/
// badminton/pickleball, étendu ici à "tennis de table"/"ping-pong" — trouvés
// réellement mélangés aux résultats "raquette de tennis"). Ce filtre positif
// ne s'applique qu'en mode recherche par mot-clé : les rayons Amazon
// (raquettes/cordages/chaussures, voir ci-dessous) sont déjà scopés tennis par
// Amazon lui-même (même principe que les pages catégorie des autres
// marchands), un titre de rayon n'a pas toujours le mot "tennis" au sens
// strict (ex. "Asics Gel-Dedicate 9").
//
// Build révisé (2026-09-25, D-2026-09-25-18, résout GAP-2026-09-25-13) :
// suite au volume sous le seuil de 30 après le filtre marque connue
// (D-2026-09-25-16), 7 pistes vérifiées réellement sur amazon.fr (Playwright)
// en cadrage puis reconfirmées en tout début de ce build. Retenu :
// - Raquettes (node 340151031), cordages (node 488345031), chaussures homme
//   (node 1765284031) et chaussures femme (node 1765106031, retrouvé en cours
//   de build — seul le nœud homme avait été noté en cadrage — en descendant
//   l'arborescence Amazon Mode > Femme > Chaussures > Baskets et chaussures
//   de sport > Chaussures de sport > Tennis) : rayon + facette native "Tous
//   les rabais" (`p_n_deal_type:26902977031`, ID global vérifié sur les 4
//   rayons), ratio de vraie remise très supérieur à la recherche par mot-clé
//   (18-29 cartes avec prix barré sur 24-48 vérifiées réellement selon le
//   rayon, contre ~50% en recherche simple). Mêmes sélecteurs DOM que la
//   recherche par mot-clé (`h2[aria-label]`, `[data-cy="price-recipe"]`),
//   revérifiés réellement sur ces pages rayon.
// - Accessoires et textile restent en recherche par mot-clé (pas de gain net
//   prouvé côté rayon pour ces catégories, textile trop fragmenté côté
//   Amazon) — pagination ajoutée (`&page=2`, fonctionne réellement, vérifié)
//   pour augmenter le volume.
// - Indice de sexe ajouté au titre pour les rayons chaussures homme/femme
//   (même mécanisme que Head/SportSystem) : le rayon connaît le sexe même
//   quand le titre du produit ne le précise pas explicitement.
// - Wilson ajouté à la liste des marques reconnues (marque tennis notoire,
//   vendue sur Amazon, absente aujourd'hui du filtre dynamique car non vendue
//   par un autre marchand actif du catalogue) — voir EXTRA_KNOWN_BRANDS.
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

const DEAL_FACET = "p_n_deal_type:26902977031";
const PAGES_PER_SOURCE = 2;

interface RayonSource {
  node: number;
  genderHint?: "Homme" | "Femme";
}

interface CategoryConfig {
  dbCategory: string;
  mode: "rayon" | "keyword";
  rayons?: RayonSource[];
  keyword?: string;
}

const CATEGORIES: CategoryConfig[] = [
  { dbCategory: "raquettes", mode: "rayon", rayons: [{ node: 340151031 }] },
  { dbCategory: "cordages", mode: "rayon", rayons: [{ node: 488345031 }] },
  {
    dbCategory: "chaussures",
    mode: "rayon",
    rayons: [
      { node: 1765284031, genderHint: "Homme" },
      { node: 1765106031, genderHint: "Femme" },
    ],
  },
  { dbCategory: "textile", mode: "keyword", keyword: "vêtement de tennis" },
  { dbCategory: "accessoires", mode: "keyword", keyword: "accessoire tennis" },
];

interface ScrapedProduct {
  asin: string;
  title: string;
  image: string | null;
  price: number;
  originalPrice: number;
}

// Marques tennis notoires vendues sur Amazon mais absentes du catalogue
// dynamique (aucun autre marchand actif ne les vend actuellement) — revisable
// additivement si d'autres cas similaires sont trouvés (D-2026-09-25-18).
const EXTRA_KNOWN_BRANDS = ["Wilson"];

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
  return [...rows.map((row) => row.brand as string), ...EXTRA_KNOWN_BRANDS].sort(
    (a, b) => b.length - a.length
  );
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

function buildRayonUrl(node: number, pageNum: number): string {
  return `${MERCHANT_WEBSITE}/s?rh=n:${node},${DEAL_FACET}&page=${pageNum}`;
}

function buildKeywordUrl(keyword: string, pageNum: number): string {
  return `${MERCHANT_WEBSITE}/s?k=${encodeURIComponent(keyword)}&page=${pageNum}`;
}

async function scrapeSearchUrl(page: Page, url: string): Promise<ScrapedProduct[]> {
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
      let categoryCount = 0;
      const seenAsins = new Set<string>();

      type Source = { url: string; genderHint?: "Homme" | "Femme"; label: string };
      const sources: Source[] = [];
      if (config.mode === "rayon") {
        for (const rayon of config.rayons!) {
          for (let p = 1; p <= PAGES_PER_SOURCE; p++) {
            sources.push({
              url: buildRayonUrl(rayon.node, p),
              genderHint: rayon.genderHint,
              label: `rayon ${rayon.node} page ${p}`,
            });
          }
        }
      } else {
        for (let p = 1; p <= PAGES_PER_SOURCE; p++) {
          sources.push({
            url: buildKeywordUrl(config.keyword!, p),
            label: `"${config.keyword}" page ${p}`,
          });
        }
      }

      for (const source of sources) {
        console.log(`Recherche ${source.label}...`);
        const products = await scrapeSearchUrl(page, source.url);

        for (const product of products) {
          if (seenAsins.has(product.asin)) continue;
          seenAsins.add(product.asin);

          if (!Number.isFinite(product.price) || product.price <= 0) {
            skippedUnparsable += 1;
            continue;
          }

          if (!Number.isFinite(product.originalPrice) || product.originalPrice <= product.price) {
            skippedNoDiscount += 1;
            continue;
          }

          const genderSuffix = source.genderHint ? ` ${source.genderHint}` : "";
          const title = `${product.title}${genderSuffix}`.replace(/\s+/g, " ").trim();

          if (config.mode === "keyword" && !TENNIS_WORD_PATTERN.test(title)) {
            skippedNotTennis += 1;
            continue;
          }

          if (OTHER_SPORTS_PATTERN.test(title)) {
            skippedOtherSport += 1;
            continue;
          }

          const brand = extractAmazonBrand(title, knownBrands);
          if (brand === null) {
            skippedUnknownBrand += 1;
            continue;
          }

          const affiliateUrl = `${MERCHANT_WEBSITE}/dp/${product.asin}?tag=${ASSOCIATE_TAG}`;
          const model = extractModel(title, brand, config.dbCategory);
          const color = extractColor(title);
          const gender = extractGender(title);
          const ageGroup = extractAgeGroup(title, config.dbCategory);
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
              ${title}, ${brand}, ${config.dbCategory}, ${product.image}, ${product.originalPrice},
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

      console.log(`  ${categoryCount} offre(s) retenue(s) pour "${config.dbCategory}".`);
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
