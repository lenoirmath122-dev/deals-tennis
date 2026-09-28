// Scraping local gratuit — Sport 2000 (D-2026-09-24-02/05, GAP-2026-09-24-02).
//
// Exécution manuelle à la demande sur la machine de l'utilisateur, pas de cron.
// robots.txt vérifié réellement (2026-09-25) : permissif sur les pages taxon
// tennis utilisées ici (seuls /login*, /register*, /cart/ bloqués). CGV/mentions
// légales interdisent explicitement le "gratte-pages"/bot (D-2026-09-22-01) —
// risque contractuel déjà assumé par l'utilisateur (D-2026-09-24-03/04/05).
//
// Découverte en cours de build (2026-09-25) qui change la méthode technique
// actée en D-2026-09-24-03 ("Playwright nécessaire") : le catalogue est en
// réalité chargé côté client via Algolia InstantSearch, avec une clé API
// "search-only" publique exposée dans le bundle JS (design normal d'Algolia —
// cette clé est faite pour être publique, lecture seule, pas un bypass d'une
// protection). Interroger directement l'endpoint Algolia en HTTP simple donne
// les mêmes données qu'un navigateur rendu, sans dépendance Playwright — même
// principe que le choix JSON Shopify pour Tecnifibre (plus robuste qu'un
// parsing HTML/JS). Vérifié réellement via curl brut (sans session navigateur).
//
// Taxonomie Sport 2000 (family_ids Algolia, vérifiés réellement en parcourant
// chaque page catégorie sous /taxons/.../selection-tennis-sport-2000/) :
//   raquettes-tennis=1693, vetements-tennis=1686, chaussures-tennis=1690,
//   accessoires-tennis/balles-tennis=1692, accessoires-tennis/sacs-tennis=1694,
//   accessoires-tennis/equipements-tennis=1695 (cordages + grips/antivibrateurs
//   mélangés, aucun taxon dédié cordage — mapping D-2026-09-24-05 : mot-clé
//   "cordage"/"bobine" sur le libellé pour distinguer cordages vs accessoires).
// Le taxon parent "accessoires-tennis" (1691) n'est jamais interrogé directement
// (il inclurait à nouveau raquettes/balles/sacs/équipements en doublon).
//
// Aucune offre avec percent_discount=0 n'est ingérée (contrairement à Babolat,
// où l'absence totale de promo avait justifié une exception D-2026-09-24-05) :
// Sport 2000 a un volume de vraies remises suffisant (171 articles constatés
// sur chaussures/textile/équipements au moment de la vérification), donc pas
// besoin de forcer l'ingestion à 0%.
//
// R3.6 (`cadrage_deals-tennis/R3_cadrage.md`) : réécrit pour passer par
// `lib/ingest.ts` (upsert products/deals, statut active/tracked, exclusions,
// sous-catégorie, unité, corrections de marque, éviction avec garde-fou 50 %).
// Capture ajoutée sans requête supplémentaire : Algolia expose le code-barres
// (`ean` -> `gtin`, vérifié le 2026-09-28) et la référence marchand (`ref` ->
// `merchant_sku`) ; `raw_attributes` garde tailles, facette genre, couleur et
// attributs Algolia. Le filtre `percent_discount > 0` reste côté Algolia
// (R3-Q3 : on ne change pas ce que le script récupère, réponse de Mathieu le
// 2026-09-28) : seuls les hits à prix initial <= prix qui passent quand même le
// filtre sont gardés en `status='tracked'` au lieu d'être ignorés ; le
// catalogue complet reste pour la Phase 4-bis.
import { neon } from "@neondatabase/serverless";
import { evictMerchantOffers, ingestOffer } from "../../lib/ingest.ts";
import type { DealCategory } from "../../types/database.ts";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const sql = neon(process.env.DATABASE_URL);

const MERCHANT_NAME = "Sport 2000";
const MERCHANT_SLUG = "sport2000";
const MERCHANT_WEBSITE = "https://www.sport2000.fr";
const IMAGE_HOST = "https://img.sport2000.fr";

const ALGOLIA_APP_ID = "604535R4DX";
const ALGOLIA_SEARCH_KEY = "f173a66037574432c7fedd51e22e7715"; // clé publique "search-only" exposée par le site
const ALGOLIA_URL = `https://${ALGOLIA_APP_ID.toLowerCase()}-dsn.algolia.net/1/indexes/*/queries`;
const ALGOLIA_INDEX = "products";
const REQUEST_DELAY_MS = 300;
const HITS_PER_PAGE = 200; // garde-fou, ~103 articles max constaté par catégorie au 2026-09-25

const OTHER_SPORTS_PATTERN = /squash|padel|badminton|pickleball/i;

// Facette "gender" Algolia -> indice ajouté au titre pour que l'heuristique
// existante (extractGender/extractAgeGroup, D-2026-09-25-03) le reconnaisse.
// "cadet(te)"/"bébé" ne font pas partie du lexique retenu : on les fait
// retomber sur les mots déjà reconnus ("Junior"/"Enfant") plutôt que d'étendre
// le lexique partagé (décision structurante hors périmètre de cette étape).
const GENDER_FACET_HINTS: Record<string, string | null> = {
  HOMME: "Homme",
  FEMME: "Femme",
  UNISEXE: null,
  ENFANT: "Enfant",
  "JUNIOR GARCON": "Junior Garçon",
  "JUNIOR FILLE": "Junior Fille",
  CADET: "Junior Garçon",
  CADETTE: "Junior Fille",
  "CADET UNISEXE": "Junior",
  "BEBE GARCON": "Enfant Garçon",
  "BEBE FILLE": "Enfant Fille",
  "BEBE UNISEXE": "Enfant",
};

interface CategoryConfig {
  familyId: number;
  dbCategory: DealCategory;
  label: string; // préfixe canonique inséré dans le titre construit
  knownPrefixes: string[]; // variantes de préfixe déjà présentes dans les libellés marchand (évite la duplication)
}

const RAQUETTES: CategoryConfig = {
  familyId: 1693,
  dbCategory: "raquettes",
  label: "Raquette de tennis",
  knownPrefixes: ["raquette de tennis "],
};
const CHAUSSURES: CategoryConfig = {
  familyId: 1690,
  dbCategory: "chaussures",
  label: "Chaussures de tennis",
  knownPrefixes: ["chaussures de tennis ", "chaussure de tennis ", "chaussures tennis ", "chaussures "],
};
const TEXTILE: CategoryConfig = {
  familyId: 1686,
  dbCategory: "textile",
  label: "Vêtement de tennis",
  knownPrefixes: [],
};
const BALLES: CategoryConfig = {
  familyId: 1692,
  dbCategory: "accessoires",
  label: "Balle de tennis",
  knownPrefixes: ["balles de tennis ", "balle de tennis "],
};
const SACS: CategoryConfig = {
  familyId: 1694,
  dbCategory: "accessoires",
  label: "Sac de tennis",
  knownPrefixes: ["sac de tennis ", "sacs de tennis "],
};
// Équipements (1695) : pas une CategoryConfig unique, le mapping cordages/accessoires
// se fait au cas par cas sur chaque hit (voir resolveEquipementConfig ci-dessous).
const EQUIPEMENTS_FAMILY_ID = 1695;
const CORDAGES: CategoryConfig = {
  familyId: EQUIPEMENTS_FAMILY_ID,
  dbCategory: "cordages",
  label: "Cordage de tennis",
  knownPrefixes: ["cordage de tennis ", "cordage "],
};
const ACCESSOIRES_EQUIPEMENT: CategoryConfig = {
  familyId: EQUIPEMENTS_FAMILY_ID,
  dbCategory: "accessoires",
  label: "Accessoire de tennis",
  knownPrefixes: [],
};

const CORDAGE_KEYWORD_PATTERN = /cordage|bobine/i;

interface AlgoliaHit {
  label: string;
  brand: string;
  price: number;
  initial_price: number;
  percent_discount: number;
  gender: string;
  image: string;
  ref?: string;
  ean?: string;
  color?: string;
  sizes?: string[];
  attributes?: Record<string, string>[];
  product_links: { sport2000?: string };
  families?: string[];
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchDiscountedHits(familyId: number): Promise<AlgoliaHit[]> {
  await sleep(REQUEST_DELAY_MS);
  const params = new URLSearchParams({
    filters: `family_ids:${familyId} AND channel_ids:sport2000 AND enable:true AND percent_discount > 0`,
    hitsPerPage: String(HITS_PER_PAGE),
    page: "0",
  }).toString();

  const res = await fetch(
    `${ALGOLIA_URL}?x-algolia-agent=Algolia%20for%20JavaScript&x-algolia-api-key=${ALGOLIA_SEARCH_KEY}&x-algolia-application-id=${ALGOLIA_APP_ID}`,
    {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: JSON.stringify({
        requests: [{ indexName: ALGOLIA_INDEX, params }],
      }),
    }
  );

  if (!res.ok) {
    throw new Error(`Échec HTTP ${res.status} sur Algolia (family_ids:${familyId})`);
  }

  const data = (await res.json()) as { results: { hits: AlgoliaHit[]; nbHits: number }[] };
  const result = data.results[0];
  if (result.nbHits > HITS_PER_PAGE) {
    console.warn(
      `  ATTENTION : ${result.nbHits} résultats pour family_ids:${familyId}, seuls les ${HITS_PER_PAGE} premiers récupérés (HITS_PER_PAGE à augmenter).`
    );
  }
  return result.hits;
}

function buildTitle(config: CategoryConfig, hit: AlgoliaHit): string {
  const rawLabel = hit.label.trim();
  const lower = rawLabel.toLowerCase();
  const matchedPrefix = config.knownPrefixes.find((p) => lower.startsWith(p));

  const genderHint = GENDER_FACET_HINTS[hit.gender] ?? null;
  const hintSuffix = genderHint ? ` ${genderHint}` : "";

  if (matchedPrefix) {
    const remainder = rawLabel.slice(matchedPrefix.length);
    return `${config.label} ${hit.brand} ${remainder}${hintSuffix}`.replace(/\s+/g, " ").trim();
  }

  return `${config.label} ${hit.brand} ${rawLabel}${hintSuffix}`.replace(/\s+/g, " ").trim();
}

function resolveEquipementConfig(hit: AlgoliaHit): CategoryConfig {
  return CORDAGE_KEYWORD_PATTERN.test(hit.label) ? CORDAGES : ACCESSOIRES_EQUIPEMENT;
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
  let skippedInvalid = 0;
  let skippedNoImage = 0;
  let skippedOtherSport = 0;
  const excluded: Record<string, number> = {};
  const seenUrls: string[] = [];

  const requests: { config: CategoryConfig | null; familyId: number; label: string }[] = [
    { config: RAQUETTES, familyId: RAQUETTES.familyId, label: "raquettes-tennis" },
    { config: CHAUSSURES, familyId: CHAUSSURES.familyId, label: "chaussures-tennis" },
    { config: TEXTILE, familyId: TEXTILE.familyId, label: "vetements-tennis" },
    { config: BALLES, familyId: BALLES.familyId, label: "balles-tennis" },
    { config: SACS, familyId: SACS.familyId, label: "sacs-tennis" },
    { config: null, familyId: EQUIPEMENTS_FAMILY_ID, label: "equipements-tennis (cordages+accessoires)" },
  ];

  for (const req of requests) {
    console.log(`Récupération de ${req.label}...`);
    const hits = await fetchDiscountedHits(req.familyId);

    let categoryCount = 0;
    for (const hit of hits) {
      const config = req.config ?? resolveEquipementConfig(hit);
      const relativeUrl = hit.product_links?.sport2000;

      if (!relativeUrl || !Number.isFinite(hit.price)) {
        skippedInvalid += 1;
        continue;
      }

      const title = buildTitle(config, hit);
      const url = `${MERCHANT_WEBSITE}${relativeUrl}`;

      if (OTHER_SPORTS_PATTERN.test(title) || OTHER_SPORTS_PATTERN.test(hit.families?.join(" ") ?? "")) {
        skippedOtherSport += 1;
        continue;
      }

      if (!hit.image) {
        skippedNoImage += 1;
        continue;
      }

      const outcome = await ingestOffer(sql, {
        title,
        brand: hit.brand.trim(),
        category: config.dbCategory,
        imageUrl: `${IMAGE_HOST}${hit.image}`,
        originalPrice: hit.initial_price,
        discountedPrice: hit.price,
        merchantId: merchant.id,
        affiliateUrl: url,
        gtin: hit.ean?.trim() || null,
        merchantSku: hit.ref?.trim() || null,
        rawAttributes: {
          sizes: hit.sizes ?? null,
          gender: hit.gender ?? null,
          color: hit.color ?? null,
          attributes: hit.attributes ?? null,
        },
      });

      if (!outcome.inserted) {
        excluded[outcome.reason] = (excluded[outcome.reason] ?? 0) + 1;
        console.log(`  exclu (${outcome.reason}) : ${title}`);
        continue;
      }

      seenUrls.push(url);
      if (outcome.status === "active") active += 1;
      else tracked += 1;
      categoryCount += 1;
    }
    console.log(`  ${categoryCount} offre(s) retenue(s) pour ${req.label}.`);
  }

  const excludedTotal = Object.values(excluded).reduce((sum, n) => sum + n, 0);
  console.log(
    `${active} offre(s) active(s), ${tracked} offre(s) suivie(s) sans remise (tracked), ` +
      `${excludedTotal} exclue(s) ${JSON.stringify(excluded)}, ${skippedInvalid} sans URL/prix, ` +
      `${skippedNoImage} sans image, ${skippedOtherSport} hors tennis.`
  );

  // Éviction : garde-fous (0 URL vue, moins de la moitié des offres connues
  // revues) dans `evictMerchantOffers` (R3-Q5).
  const eviction = await evictMerchantOffers(sql, merchant.id, seenUrls);
  if (eviction.guard === "aucune_url_vue") {
    console.log("Aucune offre vue ce passage : éviction ignorée (garde-fou anti-vidage en masse).");
  } else if (eviction.guard === "moins_de_moitie") {
    console.log("Moins de la moitié des offres connues revues : éviction ignorée (garde-fou 50 %).");
  } else {
    console.log(`${eviction.evicted} offre(s) Sport 2000 expirée(s) (disparue(s) des catégories tennis en promo).`);
  }
}

await main();
