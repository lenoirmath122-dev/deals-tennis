// Fonction d'ingestion partagée (R3.2, `cadrage_deals-tennis/R3_cadrage.md` §3).
//
// Construite ici, mais pas encore utilisée par les 8 scripts de scraping —
// leur réécriture est R3.4 à R3.11 (une étape par marchand, un vrai passage
// à chaque fois). Cette étape ne modifie ni migration ni base de données :
// R3.1 (migration `deals`) est faite (PR #92), et le backfill des offres déjà
// en base est R3.3.
//
// Couvre le §1 de `R3_cadrage.md` : statut `active`/`tracked` (D-2026-09-25-21),
// sous-catégorie d'accessoires + déplacement du textile porté (GAP-2026-09-25-11),
// exclusions à l'ingestion (JOOLA, chaussures de ville, hors sujet accessoires —
// R3-Q4), corrections de marque (R2_referentiel.md §4), quantité unitaire
// (lots, mètres, balles, pièces), éviction avec garde-fou 50% (R3-Q5).
import type { NeonQueryFunction } from "@neondatabase/serverless";
import type { DealCategory } from "../types/database.ts";
import type { UnitType } from "../config/matching-rules.ts";
import {
  SUBCATEGORY_RULES,
  type AccessorySubcategory,
  type SubcategoryRule,
} from "../config/accessory-subcategories.ts";
import { SHOE_LIFESTYLE_MARKERS } from "../config/model-families-chaussures.ts";
import { BRAND_ALIASES } from "../config/model-families.ts";
import {
  extractAgeGroup,
  extractColor,
  extractGender,
  extractModel,
  type AgeGroup,
  type Gender,
} from "./product-matching.ts";

type Sql = NeonQueryFunction<false, false>;

// ---------------------------------------------------------------------------
// 1. Exclusions à l'ingestion (R3-Q4, D-2026-09-28-02 Q11, D-2026-09-28-03 Q13/Q20)
// ---------------------------------------------------------------------------

export type ExclusionReason = "joola" | "chaussure_ville" | "accessoire_hors_sujet";

function matchSubcategoryRule(title: string): SubcategoryRule | undefined {
  const normalized = title.toLowerCase();
  return SUBCATEGORY_RULES.find((rule) => rule.pattern.test(normalized));
}

/**
 * Articles jamais insérés à l'ingestion (comptés dans les compteurs du
 * passage, jamais en base) : JOOLA (raquettes de tennis de table, Q11),
 * chaussures de ville (Q13), accessoires hors sujet (Q20). Les offres déjà en
 * base sous ces cas passent en `status='invalid'` au backfill (R3.3), pas
 * supprimées.
 */
export function checkExclusion(
  title: string,
  brand: string,
  category: DealCategory
): ExclusionReason | null {
  if (category === "raquettes" && brand.trim().toLowerCase() === "joola") {
    return "joola";
  }

  if (category === "chaussures") {
    // « The Roger Advantage » (On) est une vraie chaussure de tennis, alors que
    // « Advantage » seul désigne la ligne de ville d'adidas.
    const normalized = title.toLowerCase().replace("roger advantage", "");
    if (SHOE_LIFESTYLE_MARKERS.some((marker) => normalized.includes(marker))) {
      return "chaussure_ville";
    }
  }

  if (category === "accessoires" && matchSubcategoryRule(title)?.action === "exclure") {
    return "accessoire_hors_sujet";
  }

  return null;
}

// ---------------------------------------------------------------------------
// 2. Sous-catégorie d'accessoires + déplacement du textile porté (GAP-2026-09-25-11, Q20)
// ---------------------------------------------------------------------------

export interface CategoryResolution {
  /** Peut devenir "textile" pour le textile porté (casquettes, poignets…). */
  category: DealCategory;
  subcategory: AccessorySubcategory | null;
}

export function resolveCategory(title: string, category: DealCategory): CategoryResolution {
  if (category !== "accessoires") {
    return { category, subcategory: null };
  }

  const rule = matchSubcategoryRule(title);
  if (rule?.action === "deplacer_textile") {
    return { category: "textile", subcategory: null };
  }

  return { category: "accessoires", subcategory: rule?.subcategory ?? null };
}

// ---------------------------------------------------------------------------
// 3. Corrections de marque (R2_referentiel.md §4)
// ---------------------------------------------------------------------------

/**
 * Corrige les anomalies de marque relevées en R2 (`R2_referentiel.md` §4) :
 * casse « HEAD »/« Head », marque « SPORTSYSTEM » lue à la place de la vraie
 * marque sur des raquettes (les offres textile SPORTSYSTEM du marchand,
 * elles, sont correctes — non touchées), Luxilon/Lacoste enregistrés sous
 * Wilson/Tecnifibre (`BRAND_ALIASES`).
 */
export function correctBrand(rawBrand: string, title: string, category: DealCategory): string {
  const brand = rawBrand.trim();
  const lowerBrand = brand.toLowerCase();

  if (lowerBrand === "head") {
    return "Head";
  }

  if (lowerBrand === "sportsystem" && category === "raquettes") {
    const match = title.match(/sportsystem\s+([a-zàâäéèêëïîôöùûüç]+)/i);
    if (match) {
      const real = match[1];
      return real[0].toUpperCase() + real.slice(1).toLowerCase();
    }
    return brand;
  }

  const lowerTitle = title.toLowerCase();
  for (const [key, alias] of Object.entries(BRAND_ALIASES)) {
    const [aliasBrand, aliasCategory, keyword] = key.split("/");
    if (!keyword) continue; // clé "sportsystem" seule, traitée ci-dessus
    if (lowerBrand === aliasBrand && category === aliasCategory && lowerTitle.includes(keyword)) {
      return alias.canonical;
    }
  }

  return brand;
}

// ---------------------------------------------------------------------------
// 4. Quantité unitaire (lots, mètres, balles, pièces) — R3-Q1
// ---------------------------------------------------------------------------

export interface UnitInfo {
  unitQuantity: number | null;
  unitType: UnitType | null;
}

const METER_PATTERN = /(\d+(?:[.,]\d+)?)\s*m(?:[eè]tres?)?\b/i;
const BALL_PACK_PATTERN = /(?:tube|carton|sachet|baril|sac) de (\d+)/i;
const LOT_PATTERN = /\bx\s?(\d+)\b/i;

/**
 * Quantité comparable au conditionnement (R3-Q1, principe R5 du cadrage) :
 * longueur en mètres pour les cordages (garniture/bobine), nombre de balles
 * pour la sous-catégorie balles, nombre de pièces pour un lot d'accessoires
 * (Q18 : x3/x12/x30/x60). `null`/`null` si rien trouvé dans le titre.
 */
export function extractUnitInfo(
  title: string,
  category: DealCategory,
  subcategory: AccessorySubcategory | null
): UnitInfo {
  if (category === "cordages") {
    const match = title.match(METER_PATTERN);
    if (match) {
      return { unitQuantity: parseFloat(match[1].replace(",", ".")), unitType: "metre" };
    }
    return { unitQuantity: null, unitType: null };
  }

  if (category === "accessoires" && subcategory === "balles") {
    if (/\bbipack\b/i.test(title)) {
      return { unitQuantity: 2, unitType: "balle" };
    }
    const match = title.match(BALL_PACK_PATTERN);
    if (match) {
      return { unitQuantity: parseInt(match[1], 10), unitType: "balle" };
    }
    return { unitQuantity: null, unitType: null };
  }

  if (category === "accessoires") {
    const match = title.match(LOT_PATTERN);
    if (match) {
      return { unitQuantity: parseInt(match[1], 10), unitType: "unite" };
    }
    return { unitQuantity: null, unitType: null };
  }

  return { unitQuantity: null, unitType: null };
}

// ---------------------------------------------------------------------------
// 5. Statut `active` / `tracked` (D-2026-09-25-21)
// ---------------------------------------------------------------------------

export interface PriceResolution {
  status: "active" | "tracked";
  isActive: boolean;
  originalPrice: number;
  discountedPrice: number;
  discountPercentage: number;
}

/**
 * Un article vu sans remise réelle est capturé quand même (utile pour
 * l'historique de prix, D-2026-09-25-21) mais en `status='tracked'`,
 * `is_active=false`, `original_price = discounted_price` — jamais un booléen
 * séparé. Exclu du site partout par construction (comparaison exacte
 * `status = 'active'`, vérifiée en R3.1).
 */
export function resolvePrice(originalPrice: number, discountedPrice: number): PriceResolution {
  const hasRealDiscount =
    Number.isFinite(originalPrice) && Number.isFinite(discountedPrice) && originalPrice > discountedPrice;

  if (hasRealDiscount) {
    return {
      status: "active",
      isActive: true,
      originalPrice,
      discountedPrice,
      discountPercentage: Math.round(((originalPrice - discountedPrice) / originalPrice) * 100),
    };
  }

  const price = Number.isFinite(discountedPrice) ? discountedPrice : originalPrice;
  return {
    status: "tracked",
    isActive: false,
    originalPrice: price,
    discountedPrice: price,
    discountPercentage: 0,
  };
}

// ---------------------------------------------------------------------------
// 6. Préparation complète d'une offre brute
// ---------------------------------------------------------------------------

export interface RawOffer {
  title: string;
  brand: string;
  category: DealCategory;
  imageUrl: string;
  originalPrice: number;
  discountedPrice: number;
  merchantId: string;
  affiliateUrl: string;
  color?: string | null;
  gender?: Gender;
  ageGroup?: AgeGroup;
  /** Texte complémentaire pour l'extraction d'âge (ex. `body_html` Shopify). */
  description?: string;
  gtin?: string | null;
  mpn?: string | null;
  merchantSku?: string | null;
  /** Attributs bruts sans colonne dédiée (poids par variante, plan de cordage lu, surface…). */
  rawAttributes?: Record<string, unknown> | null;
}

export interface PreparedDeal {
  title: string;
  brand: string;
  category: DealCategory;
  subcategory: AccessorySubcategory | null;
  model: string;
  status: "active" | "tracked";
  isActive: boolean;
  originalPrice: number;
  discountedPrice: number;
  discountPercentage: number;
  unitQuantity: number | null;
  unitType: UnitType | null;
  gtin: string | null;
  mpn: string | null;
  merchantSku: string | null;
  rawAttributes: Record<string, unknown> | null;
  gender: Gender;
  ageGroup: AgeGroup;
  color: string | null;
  imageUrl: string;
  merchantId: string;
  affiliateUrl: string;
}

export type PreparedOffer =
  | { insert: true; deal: PreparedDeal }
  | { insert: false; reason: ExclusionReason };

/** Applique corrections de marque, exclusions, sous-catégorie et statut, sans toucher à la base. */
export function prepareOffer(offer: RawOffer): PreparedOffer {
  const brand = correctBrand(offer.brand, offer.title, offer.category);
  const exclusion = checkExclusion(offer.title, brand, offer.category);
  if (exclusion) {
    return { insert: false, reason: exclusion };
  }

  const { category, subcategory } = resolveCategory(offer.title, offer.category);
  const { unitQuantity, unitType } = extractUnitInfo(offer.title, category, subcategory);
  const price = resolvePrice(offer.originalPrice, offer.discountedPrice);
  const model = extractModel(offer.title, brand, category);
  const gender = offer.gender ?? extractGender(offer.title);
  const ageGroup = offer.ageGroup ?? extractAgeGroup(offer.title, category, offer.description);
  const color = offer.color ?? extractColor(offer.title);

  return {
    insert: true,
    deal: {
      title: offer.title,
      brand,
      category,
      subcategory,
      model,
      status: price.status,
      isActive: price.isActive,
      originalPrice: price.originalPrice,
      discountedPrice: price.discountedPrice,
      discountPercentage: price.discountPercentage,
      unitQuantity,
      unitType,
      gtin: offer.gtin ?? null,
      mpn: offer.mpn ?? null,
      merchantSku: offer.merchantSku ?? null,
      rawAttributes: offer.rawAttributes ?? null,
      gender,
      ageGroup,
      color,
      imageUrl: offer.imageUrl,
      merchantId: offer.merchantId,
      affiliateUrl: offer.affiliateUrl,
    },
  };
}

// ---------------------------------------------------------------------------
// 7. Écriture en base (upsert `products` + `deals`, éviction)
// ---------------------------------------------------------------------------

export async function upsertProduct(sql: Sql, deal: PreparedDeal): Promise<string> {
  const [row] = await sql`
    INSERT INTO products (brand, model, category, gender, age_group)
    VALUES (${deal.brand}, ${deal.model}, ${deal.category}, ${deal.gender}, ${deal.ageGroup})
    ON CONFLICT (LOWER(brand), LOWER(model), category)
    DO UPDATE SET
      brand = EXCLUDED.brand,
      gender = CASE WHEN products.gender = 'non_determine' THEN EXCLUDED.gender ELSE products.gender END,
      age_group = CASE WHEN products.age_group = 'adulte' AND EXCLUDED.age_group = 'enfant' THEN 'enfant' ELSE products.age_group END
    RETURNING id
  `;
  return row.id as string;
}

export async function upsertDeal(sql: Sql, deal: PreparedDeal, productId: string): Promise<void> {
  const rawAttributesJson = deal.rawAttributes ? JSON.stringify(deal.rawAttributes) : null;

  await sql`
    INSERT INTO deals (
      title, brand, category, subcategory, image_url, original_price, discounted_price,
      discount_percentage, merchant_id, affiliate_url, status, is_active,
      color, product_id, gtin, mpn, merchant_sku, unit_quantity, unit_type, raw_attributes
    )
    VALUES (
      ${deal.title}, ${deal.brand}, ${deal.category}, ${deal.subcategory}, ${deal.imageUrl},
      ${deal.originalPrice}, ${deal.discountedPrice}, ${deal.discountPercentage},
      ${deal.merchantId}, ${deal.affiliateUrl}, ${deal.status}, ${deal.isActive},
      ${deal.color}, ${productId}, ${deal.gtin}, ${deal.mpn}, ${deal.merchantSku},
      ${deal.unitQuantity}, ${deal.unitType}, ${rawAttributesJson}
    )
    ON CONFLICT (merchant_id, affiliate_url) DO UPDATE SET
      title = EXCLUDED.title,
      subcategory = EXCLUDED.subcategory,
      image_url = EXCLUDED.image_url,
      original_price = EXCLUDED.original_price,
      discounted_price = EXCLUDED.discounted_price,
      discount_percentage = EXCLUDED.discount_percentage,
      status = EXCLUDED.status,
      is_active = EXCLUDED.is_active,
      color = EXCLUDED.color,
      product_id = EXCLUDED.product_id,
      gtin = EXCLUDED.gtin,
      mpn = EXCLUDED.mpn,
      merchant_sku = EXCLUDED.merchant_sku,
      unit_quantity = EXCLUDED.unit_quantity,
      unit_type = EXCLUDED.unit_type,
      raw_attributes = EXCLUDED.raw_attributes,
      updated_at = NOW()
  `;
}

export type IngestOutcome =
  | { inserted: true; status: "active" | "tracked" }
  | { inserted: false; reason: ExclusionReason };

/** Prépare puis écrit une offre. Un script appelle cette fonction une fois par article vu. */
export async function ingestOffer(sql: Sql, offer: RawOffer): Promise<IngestOutcome> {
  const prepared = prepareOffer(offer);
  if (!prepared.insert) {
    return { inserted: false, reason: prepared.reason };
  }

  const productId = await upsertProduct(sql, prepared.deal);
  await upsertDeal(sql, prepared.deal, productId);
  return { inserted: true, status: prepared.deal.status };
}

export type EvictionGuard = "aucune_url_vue" | "moins_de_moitie";

export interface EvictionResult {
  evicted: number;
  guard: EvictionGuard | null;
}

/**
 * Éviction (`status='expired'`) des offres `active`/`tracked` d'un marchand
 * non revues au passage courant. Deux garde-fous (R3-Q5) : aucune éviction si
 * 0 URL vue (mécanisme déjà en place), ni si le passage a vu moins de la
 * moitié des offres `active`+`tracked` du marchand comptées avant le passage
 * (avancé de la Phase 2 à R3.2, sans `ingestion_runs`).
 */
export async function evictMerchantOffers(
  sql: Sql,
  merchantId: string,
  seenUrls: string[]
): Promise<EvictionResult> {
  if (seenUrls.length === 0) {
    return { evicted: 0, guard: "aucune_url_vue" };
  }

  const [{ count }] = await sql`
    SELECT COUNT(*)::int AS count
    FROM deals
    WHERE merchant_id = ${merchantId}
      AND status IN ('active', 'tracked')
  `;

  if (count > 0 && seenUrls.length < count / 2) {
    return { evicted: 0, guard: "moins_de_moitie" };
  }

  const evicted = await sql`
    UPDATE deals
    SET status = 'expired', is_active = false, updated_at = NOW()
    WHERE merchant_id = ${merchantId}
      AND status IN ('active', 'tracked')
      AND NOT (affiliate_url = ANY(${seenUrls}))
    RETURNING id
  `;

  return { evicted: evicted.length, guard: null };
}
