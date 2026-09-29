// Enrichissement par fiche produit (R3.12, `cadrage_deals-tennis/R3_cadrage.md` R3-Q2).
//
// Étape séparée des scripts de scraping : lit la fiche HTML d'une offre déjà en
// base pour y prendre ce que les listes ne donnent pas, **une seule fois par
// offre** (jamais à chaque passage) :
//   - Tennis Point FR et Tecnifibre : GTIN par variante (JSON-LD de la fiche) ;
//   - Tennispro.fr : `mpn` (`dataLayer` de la fiche), pour les offres que le
//     `dataLayer` des pages catégorie n'a pas couvertes (R3.9).
// Périmètre : raquettes et chaussures (coût mesuré en R0 §1bis).
//
// « Une seule fois » : chaque offre traitée reçoit `raw_attributes.enrichissement`
// (date, variantes lues), même si la fiche n'a rien donné ; les offres portant
// ce marqueur ne sont plus jamais relues. Une erreur réseau ne pose pas de
// marqueur : l'offre sera retentée au prochain lancement.
//
// `gtin` (une seule colonne sur `deals`) = GTIN de la première variante qui en a
// un, cohérent avec `merchant_sku` (SKU de la première variante) ; tous les
// GTIN par variante sont dans `raw_attributes.enrichissement.variants`.
//
// Usage : node --env-file=.env.local scripts/scraping/enrich-fiches.ts <slug> [--limit N]
//   <slug> : tennis-point-fr | tecnifibre | tennispro
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { neon } from "@neondatabase/serverless";
import { parseTennisproMpn, parseVariantIdentifiers } from "../../lib/enrich.ts";

const execFileAsync = promisify(execFile);

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const sql = neon(process.env.DATABASE_URL);

const CATEGORIES = ["raquettes", "chaussures"];
const MAX_CONSECUTIVE_FAILURES = 5; // site qui bloque : on s'arrête plutôt que d'insister
const CURL_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

interface MerchantConfig {
  /** Délai minimal entre deux requêtes (robots.txt ou politesse). */
  delayMs: number;
  /** Champ visé : sert à ne relire que les offres où il manque. */
  target: "gtin" | "mpn";
  fetchHtml: (url: string) => Promise<string>;
}

async function fetchNative(url: string): Promise<string> {
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0", Accept: "text/html" } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

// Tennispro.fr : le fetch natif est bloqué (403) par Cloudflare, curl passe (cf. tennispro.ts).
async function fetchCurl(url: string): Promise<string> {
  const { stdout } = await execFileAsync("curl", ["-sf", "-A", CURL_USER_AGENT, url], {
    maxBuffer: 20 * 1024 * 1024,
  });
  return stdout;
}

const MERCHANTS: Record<string, MerchantConfig> = {
  "tennis-point-fr": { delayMs: 2_000, target: "gtin", fetchHtml: fetchNative },
  tecnifibre: { delayMs: 1_500, target: "gtin", fetchHtml: fetchNative }, // robots.txt : Crawl-delay: 1
  tennispro: { delayMs: 60_000, target: "mpn", fetchHtml: fetchCurl }, // robots.txt : Crawl-delay: 60
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseArgs(): { slug: string; limit: number | null } {
  const args = process.argv.slice(2);
  const slug = args.find((arg) => !arg.startsWith("--"));
  if (!slug || !(slug in MERCHANTS)) {
    throw new Error(`Marchand attendu : ${Object.keys(MERCHANTS).join(" | ")}`);
  }
  const limitIndex = args.indexOf("--limit");
  const limit = limitIndex >= 0 ? parseInt(args[limitIndex + 1], 10) : null;
  if (limit !== null && !(limit > 0)) {
    throw new Error("--limit attend un entier positif");
  }
  return { slug, limit };
}

async function main() {
  const { slug, limit } = parseArgs();
  const config = MERCHANTS[slug];

  const targetColumn = config.target === "gtin" ? sql`d.gtin` : sql`d.mpn`;
  const offers = await sql`
    SELECT d.id, d.affiliate_url
    FROM deals d
    JOIN merchants m ON m.id = d.merchant_id
    WHERE m.slug = ${slug}
      AND d.status IN ('active', 'tracked')
      AND d.category = ANY(${CATEGORIES})
      AND ${targetColumn} IS NULL
      AND d.raw_attributes -> 'enrichissement' IS NULL
    ORDER BY d.id
    ${limit === null ? sql`` : sql`LIMIT ${limit}`}
  `;
  console.log(`${slug} : ${offers.length} offre(s) à enrichir.`);

  let enriched = 0;
  let foundNothing = 0;
  let failures = 0;
  let consecutiveFailures = 0;
  let lastRequestAt = 0;

  for (const offer of offers) {
    const elapsed = Date.now() - lastRequestAt;
    if (lastRequestAt !== 0 && elapsed < config.delayMs) {
      await sleep(config.delayMs - elapsed);
    }
    lastRequestAt = Date.now();

    let html: string;
    try {
      html = await config.fetchHtml(offer.affiliate_url as string);
      consecutiveFailures = 0;
    } catch (err) {
      failures += 1;
      consecutiveFailures += 1;
      console.log(`  échec ${offer.affiliate_url} : ${(err as Error).message}`);
      if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
        console.log(`${MAX_CONSECUTIVE_FAILURES} échecs consécutifs : arrêt (site bloqué ?).`);
        break;
      }
      continue;
    }

    let gtin: string | null = null;
    let mpn: string | null = null;
    let variants: ReturnType<typeof parseVariantIdentifiers> = [];

    if (config.target === "gtin") {
      variants = parseVariantIdentifiers(html);
      gtin = variants.find((variant) => variant.gtin !== null)?.gtin ?? null;
    } else {
      mpn = parseTennisproMpn(html);
    }

    const marker = JSON.stringify({
      enrichissement: {
        date: new Date().toISOString().slice(0, 10),
        ...(config.target === "gtin" ? { variants } : {}),
      },
    });

    await sql`
      UPDATE deals
      SET gtin = COALESCE(${gtin}, gtin),
          mpn = COALESCE(${mpn}, mpn),
          raw_attributes = COALESCE(raw_attributes, '{}'::jsonb) || ${marker}::jsonb
      WHERE id = ${offer.id}
    `;

    if (gtin || mpn) enriched += 1;
    else foundNothing += 1;
  }

  console.log(
    `${slug} : ${enriched} enrichie(s), ${foundNothing} sans ${config.target} sur la fiche, ${failures} échec(s) réseau (à retenter).`
  );
}

await main();
