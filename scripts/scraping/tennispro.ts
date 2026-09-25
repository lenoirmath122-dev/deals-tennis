// Scraping local gratuit — Tennispro.fr (D-2026-09-24-02/05, GAP-2026-09-24-02).
//
// Exécution manuelle à la demande sur la machine de l'utilisateur, pas de cron.
// Site Magento 1 en rendu SSR classique (pas de JS requis pour lire le catalogue).
//
// robots.txt vérifié réellement (2026-09-25) : `Crawl-delay: 60` pour
// `User-agent: *`, aucune clause interdisant les pages `/outlet/*.html` ni le
// paramètre `?p=` de pagination (seuls `?limit=`, `?order=`, `?dir=`, `?cat=`,
// `?color=`, `?w_*=`, `?price_from=`/`?price_to=` sont interdits — non utilisés
// ici). Ce script respecte le délai de 60s entre deux requêtes HTTP en toute
// circonstance (throttledFetch ci-dessous) — ne jamais paralléliser les fetch.
// La page d'accueil renvoie un défi anti-bot Cloudflare (403) mais les pages
// catégorie outlet elles-mêmes sont accessibles normalement (200, SSR complet).
//
// Sept pages outlet (une par grande catégorie du site, cf. sitemap.xml),
// mappées vers les 5 catégories internes (raquettes/cordages/chaussures/
// textile/accessoires — sacs et balles n'ont pas de catégorie dédiée, mappés
// vers accessoires comme déjà fait pour Tecnifibre). `outlet/materiel-club.html`
// et `outlet/padel.html` hors périmètre (matériel club, autre sport).
//
// Sécurité multi-sports : le site vend aussi du padel/badminton, un produit
// badminton a été trouvé mélangé dans la page outlet accessoires pendant la
// vérification (2026-09-25) — même filet de sécurité que ProTennis/Tecnifibre
// (GAP-2026-09-22-09) appliqué sur le titre ET l'URL.
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { neon } from "@neondatabase/serverless";
import { extractColor, extractModel } from "../../lib/product-matching.ts";

const execFileAsync = promisify(execFile);

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const sql = neon(process.env.DATABASE_URL);

const MERCHANT_NAME = "Tennispro.fr";
const MERCHANT_SLUG = "tennispro";
const MERCHANT_WEBSITE = "https://www.tennispro.fr";
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";
const CRAWL_DELAY_MS = 60_000; // robots.txt : Crawl-delay: 60 (User-agent: *)
const MAX_PAGES_PER_CATEGORY = 10; // garde-fou, chaque page fait ~5 au 2026-09-25

const OTHER_SPORTS_PATTERN = /squash|padel|badminton|pickleball/i;

interface TypeEntry {
  prefix: string;
  label: string;
}

interface CategoryConfig {
  urlPath: string;
  dbCategory: string;
  entries: TypeEntry[]; // du préfixe le plus long au plus court
  defaultLabel: string;
}

const CATEGORIES: CategoryConfig[] = [
  {
    urlPath: "outlet/raquettes.html",
    dbCategory: "raquettes",
    entries: [
      { prefix: "PACK DE 2 RAQUETTES", label: "Pack de raquettes de tennis" },
      { prefix: "PACK DE RAQUETTES", label: "Pack de raquettes de tennis" },
      { prefix: "RAQUETTE", label: "Raquette de tennis" },
    ],
    defaultLabel: "Raquette de tennis",
  },
  {
    urlPath: "outlet/cordages.html",
    dbCategory: "cordages",
    entries: [
      { prefix: "BOBINE", label: "Bobine de cordage de tennis" },
      { prefix: "CORDAGE", label: "Cordage de tennis" },
    ],
    defaultLabel: "Cordage de tennis",
  },
  {
    urlPath: "outlet/chaussures.html",
    dbCategory: "chaussures",
    entries: [{ prefix: "CHAUSSURES", label: "Chaussures de tennis" }],
    defaultLabel: "Chaussures de tennis",
  },
  {
    urlPath: "outlet/vetements.html",
    dbCategory: "textile",
    entries: [
      { prefix: "T-SHIRT", label: "T-shirt de tennis" },
      { prefix: "POLO", label: "Polo de tennis" },
      { prefix: "ROBE", label: "Robe de tennis" },
      { prefix: "JUPE", label: "Jupe de tennis" },
      { prefix: "PANTALON", label: "Pantalon de tennis" },
      { prefix: "DEBARDEUR", label: "Débardeur de tennis" },
      { prefix: "SWEAT", label: "Sweat de tennis" },
      { prefix: "SHORT", label: "Short de tennis" },
      { prefix: "VESTE", label: "Veste de tennis" },
      { prefix: "CHAUSSETTES", label: "Chaussettes de tennis" },
    ],
    defaultLabel: "Vêtement de tennis",
  },
  {
    urlPath: "outlet/accessoires.html",
    dbCategory: "accessoires",
    entries: [
      { prefix: "SURGRIPS", label: "Surgrip de tennis" },
      { prefix: "GRIP", label: "Grip de tennis" },
      { prefix: "JONC", label: "Jonc de tennis" },
      { prefix: "GOURDE", label: "Gourde de tennis" },
      { prefix: "TAPIS", label: "Tapis de tennis" },
      { prefix: "ANTIVIBRATEUR", label: "Antivibrateur de tennis" },
      { prefix: "PROTECTION", label: "Protection de tennis" },
    ],
    defaultLabel: "Accessoire de tennis",
  },
  {
    urlPath: "outlet/sacs.html",
    dbCategory: "accessoires",
    entries: [
      { prefix: "THERMO-BAG", label: "Sac isotherme de tennis" },
      { prefix: "SAC A DOS DE TENNIS", label: "Sac à dos de tennis" },
      { prefix: "SAC A DOS", label: "Sac à dos de tennis" },
      { prefix: "SAC DE TENNIS", label: "Sac de tennis" },
      { prefix: "SAC TENNIS", label: "Sac de tennis" },
      { prefix: "SAC", label: "Sac de tennis" },
    ],
    defaultLabel: "Sac de tennis",
  },
  {
    urlPath: "outlet/balles.html",
    dbCategory: "accessoires",
    entries: [],
    defaultLabel: "Balles de tennis",
  },
];

interface ScrapedProduct {
  url: string;
  brand: string;
  name: string;
  image: string;
  price: number;
  originalPrice: number;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let lastRequestAt = 0;

// Le fetch natif de Node est bloqué (403) par la protection Cloudflare du
// site alors qu'une requête curl identique (même User-Agent, aucun autre
// spoofing) passe systématiquement — empreinte réseau différente entre les
// deux clients. Décision explicite de l'utilisateur (2026-09-25) : shell out
// vers curl plutôt qu'écarter le marchand, robots.txt autorisant déjà ces
// pages sans réserve technique.
async function throttledFetch(url: string): Promise<string> {
  const elapsed = Date.now() - lastRequestAt;
  if (lastRequestAt !== 0 && elapsed < CRAWL_DELAY_MS) {
    await sleep(CRAWL_DELAY_MS - elapsed);
  }
  lastRequestAt = Date.now();

  try {
    const { stdout } = await execFileAsync("curl", ["-sf", "-A", USER_AGENT, url], {
      maxBuffer: 20 * 1024 * 1024,
    });
    return stdout;
  } catch (err) {
    throw new Error(`Échec curl sur ${url} : ${(err as Error).message}`);
  }
}

function titleCase(raw: string): string {
  return raw
    .toLowerCase()
    .split(" ")
    .map((word) => (word.length > 0 ? word[0].toUpperCase() + word.slice(1) : word))
    .join(" ");
}

function parsePrice(raw: string): number {
  const cleaned = raw.replace(/[^\d,]/g, "").replace(",", ".");
  return parseFloat(cleaned);
}

function getMaxPage(html: string): number {
  const matches = [...html.matchAll(/\?p=(\d+)"/g)].map((m) => parseInt(m[1], 10));
  const max = matches.length > 0 ? Math.max(...matches) : 1;
  return Math.min(max, MAX_PAGES_PER_CATEGORY);
}

function splitProductBlocks(html: string): string[] {
  const indices: number[] = [];
  const re = /<li class="product item"[^>]*id="view_product_\d+"/g;
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

function parseProduct(block: string): ScrapedProduct | null {
  const urlMatch = block.match(/<a href="(https:\/\/www\.tennispro\.fr\/[^"]+\.html)"\s+title="/);
  const brandMatch = block.match(/<span class="product__brand">([^<]*)<\/span>/);
  const nameMatch = block.match(
    /<span class="product__brand">[^<]*<\/span>\s*<span>([^<]*)<\/span>/
  );
  const imageMatch = block.match(/(?:data-orig|src)="(https:\/\/media\.tennispro\.fr[^"]+)"/);
  const priceMatch = block.match(/<span class="regular-price"[^>]*>\s*<span class="price">([^<]*)<\/span>/);
  const originalPriceMatch = block.match(/<div class="public-price">([^<]*)<\/div>/);

  if (!urlMatch || !brandMatch || !nameMatch || !imageMatch || !priceMatch || !originalPriceMatch) {
    return null;
  }

  return {
    url: urlMatch[1],
    brand: brandMatch[1].trim(),
    name: nameMatch[1].trim().replace(/\s+/g, " "),
    image: imageMatch[1],
    price: parsePrice(priceMatch[1]),
    originalPrice: parsePrice(originalPriceMatch[1]),
  };
}

function resolveTypeLabel(config: CategoryConfig, name: string): { label: string; remainder: string } {
  const upperName = name.toUpperCase();
  for (const entry of config.entries) {
    if (upperName.startsWith(entry.prefix)) {
      return { label: entry.label, remainder: name.slice(entry.prefix.length).trim() };
    }
  }
  return { label: config.defaultLabel, remainder: name };
}

async function main() {
  const [merchant] = await sql`
    INSERT INTO merchants (name, slug, website_url)
    VALUES (${MERCHANT_NAME}, ${MERCHANT_SLUG}, ${MERCHANT_WEBSITE})
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
    RETURNING id
  `;

  let inserted = 0;
  let skippedNoDiscount = 0;
  let skippedOtherSport = 0;
  let skippedUnparsable = 0;
  const seenUrls: string[] = [];

  for (const category of CATEGORIES) {
    const firstUrl = `${MERCHANT_WEBSITE}/${category.urlPath}`;
    console.log(`Récupération de ${category.urlPath}...`);
    const firstHtml = await throttledFetch(firstUrl);
    const maxPage = getMaxPage(firstHtml);
    console.log(`  ${maxPage} page(s) détectée(s).`);

    const htmls = [firstHtml];
    for (let page = 2; page <= maxPage; page += 1) {
      const url = `${firstUrl}?p=${page}`;
      htmls.push(await throttledFetch(url));
    }

    let categoryCount = 0;
    for (const html of htmls) {
      const blocks = splitProductBlocks(html);
      for (const block of blocks) {
        const product = parseProduct(block);
        if (!product) {
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

        const { label, remainder } = resolveTypeLabel(category, product.name);
        const brand = titleCase(product.brand);
        const title = `${label} ${brand} ${titleCase(remainder)}`.replace(/\s+/g, " ").trim();

        if (OTHER_SPORTS_PATTERN.test(title) || OTHER_SPORTS_PATTERN.test(product.url)) {
          skippedOtherSport += 1;
          continue;
        }

        const model = extractModel(title, brand, category.dbCategory);
        const color = extractColor(title);
        const discountPercentage = Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) * 100
        );

        const [upsertedProduct] = await sql`
          INSERT INTO products (brand, model, category)
          VALUES (${brand}, ${model}, ${category.dbCategory})
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
            ${title}, ${brand}, ${category.dbCategory}, ${product.image}, ${product.originalPrice},
            ${product.price}, ${discountPercentage}, ${merchant.id}, ${product.url}, 'active', true,
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

        seenUrls.push(product.url);
        inserted += 1;
        categoryCount += 1;
      }
    }
    console.log(`  ${categoryCount} offre(s) retenue(s) pour ${category.dbCategory}.`);
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
    console.log(`${evicted.length} offre(s) Tennispro.fr expirée(s) (disparue(s) de l'outlet).`);
  } else {
    console.log("Aucune offre vue ce passage : éviction ignorée (garde-fou anti-vidage en masse).");
  }
}

await main();
