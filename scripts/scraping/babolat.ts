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
// R3.8 (`cadrage_deals-tennis/R3_cadrage.md`) : réécrit pour passer par
// `lib/ingest.ts` (upsert products/deals, statut active/tracked, exclusions,
// sous-catégorie, unité, corrections de marque, éviction avec garde-fou 50 %).
// Aucune promotion sur le site (vérifié 2026-09-24, 2026-09-25 et 2026-09-29) :
// aucun élément de prix barré (`c-price__list` ou équivalent) n'existe dans le
// balisage tant qu'un produit n'est pas réellement en promo. Les articles sans
// remise, auparavant ignorés (D-2026-09-24-05), sont désormais gardés en
// `status='tracked'` (R3-Q3, D-2026-09-25-21) : exclus du site, mais prix
// suivi pour l'historique. Le prix barré, lui, n'a jamais été observé (classe
// `c-price__list` déduite par convention SFCC).
// Capture ajoutée sans requête supplémentaire : `merchant_sku` = `data-pid` de
// la carte (identique au `sku` et au `mpn` du JSON-LD de la fiche, vérifié le
// 2026-09-29 : `mpn` non capturé, il recopie la référence marchand) et
// `raw_attributes` (étiquette « Nouveau », bénéfices, coloris de la carte).
// Aucun GTIN/EAN dans la fiche (JSON-LD sans `gtin`, aucun code-barres dans la
// page) : il reste pour R3.12 s'il est retrouvé ailleurs.
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
// Pagination réelle par catégorie (vérifiée le 2026-09-25, `sz=24` par page ;
// corrigée en R3.8 : arrêt sur page vide, la première page peut compter 23 blocs) :
// la page HTML statique ne montre que le premier lot (jusqu'à 24 articles),
// masquant le reste — ex. chaussures affiche 24 en HTML brut mais compte 90
// articles réels au total une fois toutes les pages AJAX récupérées. Ce script
// pagine systématiquement jusqu'à une page sans article.
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
import { evictMerchantOffers, ingestOffer } from "../../lib/ingest.ts";
import type { DealCategory } from "../../types/database.ts";

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
  dbCategory: DealCategory;
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
  pid: string;
  label: string | null;
  benefits: string[];
  colors: string[];
  url: string;
  name: string;
  price: number;
  listPrice: number | null;
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
  // Prix barré : absent du balisage tant qu'aucune promo n'est active (vérifié
  // réellement le 2026-09-25 sur les 8 sous-catégories, 0 occurrence). Classe
  // `c-price__list` déduite par convention SFCC (miroir de `c-price__sales`) —
  // non observée en conditions réelles faute de produit en promo, à confirmer
  // le jour où Babolat lance une vraie promotion.
  const listPriceMatch = block.match(/class="c-price__list[^"]*"[^>]*content="([\d.]+)"/);
  const srcsetMatch = block.match(/data-srcset="([^"]+)"/);
  const pidMatch = block.match(/^<div class="product" data-pid="([^"]+)"/);
  const labelMatch = block.match(/class="c-product-tile__label link[^>]*>\s*([^<]+?)\s*</);
  const benefits = [...block.matchAll(/benefit__text">\s*([^<]+?)\s*</g)].map((m) => decodeEntities(m[1]));
  const colors = [...block.matchAll(/aria-label="Coloris ([^"]+)"/g)].map((m) => decodeEntities(m[1]));

  if (!hrefMatch || !altMatch || !priceMatch) {
    return null;
  }

  return {
    pid: pidMatch ? pidMatch[1] : "",
    label: labelMatch ? decodeEntities(labelMatch[1]) : null,
    benefits,
    colors,
    url: `${MERCHANT_WEBSITE}${hrefMatch[1]}`,
    name: decodeEntities(altMatch[1].trim()).replace(/\s+/g, " "),
    price: parseFloat(priceMatch[1]),
    listPrice: listPriceMatch ? parseFloat(listPriceMatch[1]) : null,
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
  const all = new Map<string, ScrapedProduct>();

  for (let page = 0; page < MAX_PAGES; page += 1) {
    const start = page * PAGE_SIZE;
    if (page > 0) await sleep(REQUEST_DELAY_MS);

    const html = await fetchCategoryPage(cgid, start);
    const blocks = splitProductBlocks(html);
    for (const block of blocks) {
      const product = parseProduct(block);
      if (product) all.set(product.url, product);
    }

    // Arrêt sur page vide, pas sur page incomplète : la première page d'une
    // catégorie peut renvoyer 23 blocs pour `sz=24` (raquettes, constaté le
    // 2026-09-29 : 23 puis 24/24/20, soit 91 articles), ce qui coupait la
    // lecture après la première page.
    if (blocks.length === 0) break;
    if (page === MAX_PAGES - 1) {
      console.warn(`  ATTENTION : ${cgid} a atteint MAX_PAGES (${MAX_PAGES}), des articles ont peut-être été manqués.`);
    }
  }

  return [...all.values()];
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

      const outcome = await ingestOffer(sql, {
        title,
        brand: MERCHANT_NAME,
        category: category.dbCategory,
        imageUrl: product.image ?? "",
        originalPrice: product.listPrice ?? product.price,
        discountedPrice: product.price,
        merchantId: merchant.id,
        affiliateUrl: product.url,
        merchantSku: product.pid || null,
        rawAttributes: {
          label: product.label,
          benefits: product.benefits,
          colors: product.colors,
        },
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
    console.log(`  ${categoryCount} offre(s) retenue(s) pour ${category.dbCategory} (${category.cgid}).`);
  }

  const excludedTotal = Object.values(excluded).reduce((sum, n) => sum + n, 0);
  console.log(
    `${active} offre(s) active(s), ${tracked} offre(s) suivie(s) sans remise (tracked), ` +
      `${excludedTotal} exclue(s) ${JSON.stringify(excluded)}, ${skippedOtherSport} hors tennis, ` +
      `${skippedUnparsable} non parsable(s).`
  );

  // Éviction : garde-fous (0 URL vue, moins de la moitié des offres connues
  // revues) dans `evictMerchantOffers` (R3-Q5).
  const eviction = await evictMerchantOffers(sql, merchant.id, seenUrls);
  if (eviction.guard === "aucune_url_vue") {
    console.log("Aucune offre vue ce passage : éviction ignorée (garde-fou anti-vidage en masse).");
  } else if (eviction.guard === "moins_de_moitie") {
    console.log("Moins de la moitié des offres connues revues : éviction ignorée (garde-fou 50 %).");
  } else {
    console.log(`${eviction.evicted} offre(s) Babolat expirée(s) (disparue(s) du catalogue).`);
  }
}

await main();
