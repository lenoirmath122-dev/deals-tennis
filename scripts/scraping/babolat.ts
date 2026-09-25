// Scraping local gratuit — Babolat (D-2026-09-24-02/04/05, GAP-2026-09-24-02).
//
// Exécution manuelle à la demande sur la machine de l'utilisateur, pas de cron.
// CGU Babolat interdisent explicitement la collecte automatisée en masse —
// risque contractuel déjà signalé et assumé consciemment par l'utilisateur
// (D-2026-09-24-01/02/03). robots.txt vérifié réellement (2026-09-25) : les
// pages catégorie `/fr/tennis/*.html` utilisées ici ne sont pas interdites
// (seuls des paramètres de filtre/tri/panier/compte/recherche le sont, non
// utilisés ici).
//
// Aucune promotion trouvée sur le site au moment de la vérification (comme au
// 2026-09-24) : `discount_percentage = 0` accepté pour toutes les offres,
// conformément à la décision D-2026-09-24-05 (prix de référence à retravailler
// plus tard, hors périmètre de cette étape).
//
// Découverte en cours de build (2026-09-25) qui affine la méthode actée en
// D-2026-09-24-04 ("rendu JS, Playwright nécessaire") : le HTML brut renvoyé
// par une requête HTTP simple contient en réalité déjà les cartes produit
// complètes (prix, nom via l'attribut `alt` de l'image, lien) — vérifié
// réellement via `curl`. Mieux : le site (Salesforce Commerce Cloud) expose un
// endpoint de pagination AJAX public non authentifié
// (`/on/demandware.store/.../Search-ShowAjax?cgid=...&start=...&sz=...`) qui
// renvoie le même balisage que la page complète — utilisé ici directement pour
// toutes les pages plutôt que de driver un navigateur, cohérent avec le choix
// déjà fait pour Sport 2000 (D-2026-09-25-06). Aucun Playwright en exécution.
//
// Pagination réelle par catégorie (vérifiée le 2026-09-25, `sz=24` par page) :
// la page HTML statique ne montre que le premier lot (jusqu'à 24 articles),
// masquant le reste — ex. chaussures affiche 24 en HTML brut mais compte 90
// articles réels au total une fois toutes les pages AJAX récupérées. Ce script
// pagine systématiquement jusqu'à une page renvoyant moins de `PAGE_SIZE`
// articles.
//
// Périmètre catégorie -> cgid Babolat (vérifié réellement, un id par page) :
// raquettes=B2C_NAVIGATION_TENNIS_RACKETS, cordages=..._STRINGS,
// chaussures=..._SHOES, textile=..._APPAREL. Pour les accessoires, Babolat a
// plusieurs sous-catégories dédiées au lieu d'une seule (découverte en cours
// de build, hors du périmètre à une seule URL initialement figé en
// D-2026-09-24-05) : accessoires textiles (casquettes/chaussettes/bandeaux),
// grips, surgrips, accessoires raquette (antivibrateurs, housses...) et sacs —
// décision mineure tranchée seule (même nature que le choix Sport
// 2000/Tecnifibre) : les 5 pages sont toutes scrapées et mappées vers
// `accessoires` plutôt que de se limiter à une seule, pour refléter fidèlement
// le catalogue réel du marchand.
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

const MERCHANT_NAME = "Babolat";
const MERCHANT_SLUG = "babolat";
const MERCHANT_WEBSITE = "https://www.babolat.com";
const AJAX_URL =
  "https://www.babolat.com/on/demandware.store/Sites-babolateu-Site/fr_FR/Search-ShowAjax";
const PAGE_SIZE = 24;
const MAX_PAGES = 10; // garde-fou, catégorie la plus large (chaussures) ~90 articles au 2026-09-25
const REQUEST_DELAY_MS = 500;

const OTHER_SPORTS_PATTERN = /squash|padel|badminton|pickleball/i;

interface CategoryConfig {
  cgid: string;
  dbCategory: string;
  label: string;
}

const CATEGORIES: CategoryConfig[] = [
  { cgid: "B2C_NAVIGATION_TENNIS_RACKETS", dbCategory: "raquettes", label: "Raquette de tennis" },
  { cgid: "B2C_NAVIGATION_TENNIS_STRINGS", dbCategory: "cordages", label: "Cordage de tennis" },
  { cgid: "B2C_NAVIGATION_TENNIS_SHOES", dbCategory: "chaussures", label: "Chaussures de tennis" },
  { cgid: "B2C_NAVIGATION_TENNIS_APPAREL", dbCategory: "textile", label: "Vêtement de tennis" },
  {
    cgid: "B2C_NAVIGATION_TENNIS_APPAREL_ACCESSORIES",
    dbCategory: "accessoires",
    label: "Accessoire de tennis",
  },
  { cgid: "B2C_NAVIGATION_TENNIS_GRIPS", dbCategory: "accessoires", label: "Grip de tennis" },
  { cgid: "B2C_NAVIGATION_TENNIS_OVERGRIPS", dbCategory: "accessoires", label: "Surgrip de tennis" },
  { cgid: "B2C_NAVIGATION_TENNIS_ACCESSORIES", dbCategory: "accessoires", label: "Accessoire de tennis" },
  { cgid: "B2C_NAVIGATION_TENNIS_BAGS", dbCategory: "accessoires", label: "Sac de tennis" },
];

// Entités HTML nommées rencontrées dans les titres produits (accents français).
// Pas de librairie de parsing HTML dans ce dépôt (convention regex, voir
// tennispro.ts/tecnifibre.ts) — décodage minimal suffisant pour ce marchand.
const ENTITY_MAP: Record<string, string> = {
  eacute: "é",
  egrave: "è",
  ecirc: "ê",
  euml: "ë",
  agrave: "à",
  acirc: "â",
  auml: "ä",
  ccedil: "ç",
  ocirc: "ô",
  ouml: "ö",
  oacute: "ó",
  ntilde: "ñ",
  ucirc: "û",
  uuml: "ü",
  ugrave: "ù",
  amp: "&",
  quot: '"',
  apos: "'",
  rsquo: "'",
  nbsp: " ",
};

function decodeEntities(text: string): string {
  return text
    .replace(/&([a-zA-Z]+);/g, (match, name: string) => ENTITY_MAP[name] ?? match)
    .replace(/&#(\d+);/g, (_match, code: string) => String.fromCharCode(parseInt(code, 10)));
}

interface ScrapedProduct {
  url: string;
  name: string;
  price: number;
  image: string | null;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function splitProductBlocks(html: string): string[] {
  const re = /<div class="product" data-pid="/g;
  const indices: number[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    indices.push(m.index);
  }

  const blocks: string[] = [];
  for (let i = 0; i < indices.length; i += 1) {
    const start = indices[i];
    const end = i + 1 < indices.length ? indices[i + 1] : html.length;
    blocks.push(html.slice(start, end));
  }
  return blocks;
}

function bestSrcsetUrl(srcset: string): string | null {
  const entries = [...srcset.matchAll(/(\S+)\s+(\d+)w/g)].map((m) => ({
    url: m[1],
    width: parseInt(m[2], 10),
  }));
  if (entries.length === 0) return null;
  return entries.sort((a, b) => b.width - a.width)[0].url;
}

function parseProduct(block: string): ScrapedProduct | null {
  const hrefMatch = block.match(/href="(\/fr\/[^"]+\.html)"/);
  const altMatch = block.match(/class="c-product-tile__tile-image tile-image[^>]*alt="([^"]*)"/);
  const priceMatch = block.match(/class="c-price__value[^"]*"[^>]*content="([\d.]+)"/);
  const srcsetMatch = block.match(/data-srcset="([^"]+)"/);

  if (!hrefMatch || !altMatch || !priceMatch) {
    return null;
  }

  return {
    url: `${MERCHANT_WEBSITE}${hrefMatch[1]}`,
    name: decodeEntities(altMatch[1].trim()).replace(/\s+/g, " "),
    price: parseFloat(priceMatch[1]),
    image: srcsetMatch ? bestSrcsetUrl(srcsetMatch[1]) : null,
  };
}

async function fetchCategoryPage(cgid: string, start: number): Promise<string> {
  const url = `${AJAX_URL}?cgid=${cgid}&start=${start}&sz=${PAGE_SIZE}`;
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!res.ok) {
    throw new Error(`Échec HTTP ${res.status} sur ${url}`);
  }
  return res.text();
}

async function fetchAllProducts(cgid: string): Promise<ScrapedProduct[]> {
  const all: ScrapedProduct[] = [];

  for (let page = 0; page < MAX_PAGES; page += 1) {
    const start = page * PAGE_SIZE;
    if (page > 0) await sleep(REQUEST_DELAY_MS);

    const html = await fetchCategoryPage(cgid, start);
    const blocks = splitProductBlocks(html);
    for (const block of blocks) {
      const product = parseProduct(block);
      if (product) all.push(product);
    }

    if (blocks.length < PAGE_SIZE) break;
    if (page === MAX_PAGES - 1) {
      console.warn(`  ATTENTION : ${cgid} a atteint MAX_PAGES (${MAX_PAGES}), des articles ont peut-être été manqués.`);
    }
  }

  return all;
}

async function main() {
  const [merchant] = await sql`
    INSERT INTO merchants (name, slug, website_url)
    VALUES (${MERCHANT_NAME}, ${MERCHANT_SLUG}, ${MERCHANT_WEBSITE})
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
    RETURNING id
  `;

  let inserted = 0;
  let skippedUnparsable = 0;
  let skippedOtherSport = 0;
  const seenUrls: string[] = [];

  for (const category of CATEGORIES) {
    console.log(`Récupération de ${category.cgid}...`);
    const products = await fetchAllProducts(category.cgid);
    console.log(`  ${products.length} article(s) trouvé(s).`);

    let categoryCount = 0;
    for (const product of products) {
      if (!Number.isFinite(product.price) || product.price <= 0) {
        skippedUnparsable += 1;
        continue;
      }

      const title = `${category.label} ${MERCHANT_NAME} ${product.name}`.replace(/\s+/g, " ").trim();

      if (OTHER_SPORTS_PATTERN.test(title)) {
        skippedOtherSport += 1;
        continue;
      }

      const model = extractModel(title, MERCHANT_NAME, category.dbCategory);
      const color = extractColor(title);
      const gender = extractGender(title);
      const ageGroup = extractAgeGroup(title);
      // D-2026-09-24-05 : aucune promo active constatée sur le site, ingéré à
      // 0% de réduction (prix de référence à retravailler plus tard).
      const price = product.price;

      const [upsertedProduct] = await sql`
        INSERT INTO products (brand, model, category, gender, age_group)
        VALUES (${MERCHANT_NAME}, ${model}, ${category.dbCategory}, ${gender}, ${ageGroup})
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
          ${title}, ${MERCHANT_NAME}, ${category.dbCategory}, ${product.image}, ${price},
          ${price}, 0, ${merchant.id}, ${product.url}, 'active', true,
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

      seenUrls.push(product.url);
      inserted += 1;
      categoryCount += 1;
    }
    console.log(`  ${categoryCount} offre(s) retenue(s) pour ${category.dbCategory} (${category.cgid}).`);
  }

  console.log(
    `${inserted} offre(s) insérée(s)/mise(s) à jour au total, ${skippedUnparsable} non parsable(s), ` +
      `${skippedOtherSport} hors tennis.`
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
    console.log(`${evicted.length} offre(s) Babolat expirée(s) (disparue(s) du catalogue).`);
  } else {
    console.log("Aucune offre vue ce passage : éviction ignorée (garde-fou anti-vidage en masse).");
  }
}

await main();
