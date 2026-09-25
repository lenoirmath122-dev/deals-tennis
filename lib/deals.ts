import { sql } from "@/lib/db";
import {
  isValidCategory,
  isValidGender,
  isValidAgeGroup,
  sanitizeSearchQuery,
  type CatalogSort,
} from "@/lib/filters";
import type { CatalogResponse, DealCardData, DealDetail } from "@/types/database";

const PER_PAGE = 24;

const DEAL_CARD_FIELDS = `
  d.id,
  d.title,
  d.brand,
  d.category,
  d.image_url,
  d.original_price::float AS original_price,
  d.discounted_price::float AS discounted_price,
  d.discount_percentage,
  d.created_at,
  d.expires_at,
  json_build_object(
    'id', m.id,
    'name', m.name,
    'slug', m.slug,
    'logo_url', m.logo_url
  ) AS merchant
`;

export interface GetCatalogDealsParams {
  category?: string;
  gender?: string;
  age_group?: string;
  sort?: CatalogSort;
  q?: string;
  page?: number;
}

function dealsOrderByClause(sort: CatalogSort | undefined): string {
  switch (sort) {
    case "discount":
      return "d.discount_percentage DESC, d.created_at DESC";
    case "price_asc":
      return "d.discounted_price ASC, d.created_at DESC";
    case "price_desc":
      return "d.discounted_price DESC, d.created_at DESC";
    default:
      return "d.created_at DESC";
  }
}

function groupedDealsOrderByClause(sort: CatalogSort | undefined): string {
  switch (sort) {
    case "discount":
      return "sub.discount_percentage DESC, sub.created_at DESC";
    case "price_asc":
      return "sub.discounted_price ASC, sub.created_at DESC";
    case "price_desc":
      return "sub.discounted_price DESC, sub.created_at DESC";
    default:
      return "sub.created_at DESC";
  }
}

export async function getCatalogDeals(
  params: GetCatalogDealsParams
): Promise<CatalogResponse> {
  const page = Math.max(1, params.page || 1);
  const offset = (page - 1) * PER_PAGE;

  const conditions = [
    `d.status = 'active'`,
    `d.is_active = true`,
    `(d.expires_at IS NULL OR d.expires_at > NOW())`,
  ];
  const queryParams: unknown[] = [];
  let paramIndex = 1;

  if (params.category && isValidCategory(params.category) && params.category !== "all") {
    conditions.push(`d.category = $${paramIndex++}`);
    queryParams.push(params.category);
  }

  let needsProductJoin = false;

  if (params.gender && isValidGender(params.gender) && params.gender !== "all") {
    conditions.push(`p.gender = $${paramIndex++}`);
    queryParams.push(params.gender);
    needsProductJoin = true;
  }

  if (params.age_group && isValidAgeGroup(params.age_group) && params.age_group !== "all") {
    conditions.push(`p.age_group = $${paramIndex++}`);
    queryParams.push(params.age_group);
    needsProductJoin = true;
  }

  const searchQuery = sanitizeSearchQuery(params.q);
  const searchWords = searchQuery.length > 0 ? searchQuery.split(/\s+/).filter(Boolean) : [];
  if (searchWords.length > 0) {
    const wordConditions = searchWords.map((word) => {
      const idx = paramIndex++;
      queryParams.push(`%${word}%`);
      return `(d.title ILIKE $${idx} OR d.brand ILIKE $${idx})`;
    });
    conditions.push(`(${wordConditions.join(" AND ")})`);
  }

  const whereClause = conditions.join(" AND ");
  const isGrouped = searchQuery.length > 0;
  const productJoin = needsProductJoin ? "LEFT JOIN products p ON d.product_id = p.id" : "";

  if (isGrouped) {
    return getGroupedCatalogDeals({
      whereClause,
      queryParams,
      page,
      offset,
      sort: params.sort,
      productJoin,
    });
  }

  const orderByClause = dealsOrderByClause(params.sort);

  const countQuery = `
    SELECT COUNT(*)::int AS total
    FROM deals d
    ${productJoin}
    WHERE ${whereClause}
  `;
  const countResult = await sql.query(countQuery, queryParams);
  const total = (countResult[0]?.total as number) || 0;

  const dataQuery = `
    SELECT ${DEAL_CARD_FIELDS}
    FROM deals d
    JOIN merchants m ON d.merchant_id = m.id
    ${productJoin}
    WHERE ${whereClause}
    ORDER BY ${orderByClause}
    LIMIT ${PER_PAGE} OFFSET ${offset}
  `;

  const rows = await sql.query(dataQuery, queryParams);

  return {
    deals: rows as DealCardData[],
    pagination: {
      current_page: page,
      total_pages: Math.ceil(total / PER_PAGE),
      total_deals: total,
      has_previous: page > 1,
      has_next: page * PER_PAGE < total,
      per_page: PER_PAGE,
    },
  };
}

/**
 * Mode recherche (D-2026-09-22-06/17) : les résultats sont regroupés par article
 * (deals.product_id, ou l'id du deal lui-même s'il n'a pas encore de product_id) pour
 * n'afficher qu'une carte par article, avec l'offre la moins chère comme représentante.
 */
async function getGroupedCatalogDeals({
  whereClause,
  queryParams,
  page,
  offset,
  sort,
  productJoin,
}: {
  whereClause: string;
  queryParams: unknown[];
  page: number;
  offset: number;
  sort?: CatalogSort;
  productJoin: string;
}): Promise<CatalogResponse> {
  const groupOrderByClause = groupedDealsOrderByClause(sort);

  const countQuery = `
    SELECT COUNT(DISTINCT COALESCE(d.product_id::text, d.id::text))::int AS total
    FROM deals d
    ${productJoin}
    WHERE ${whereClause}
  `;
  const countResult = await sql.query(countQuery, queryParams);
  const total = (countResult[0]?.total as number) || 0;

  const dataQuery = `
    SELECT
      sub.id, sub.title, sub.brand, sub.category, sub.image_url,
      sub.original_price, sub.discounted_price, sub.discount_percentage,
      sub.created_at, sub.expires_at, sub.merchant, sub.offer_count
    FROM (
      SELECT
        ${DEAL_CARD_FIELDS},
        COUNT(*) OVER (PARTITION BY COALESCE(d.product_id::text, d.id::text))::int AS offer_count,
        ROW_NUMBER() OVER (
          PARTITION BY COALESCE(d.product_id::text, d.id::text)
          ORDER BY d.discounted_price ASC, d.created_at DESC
        ) AS rn
      FROM deals d
      JOIN merchants m ON d.merchant_id = m.id
      ${productJoin}
      WHERE ${whereClause}
    ) sub
    WHERE sub.rn = 1
    ORDER BY ${groupOrderByClause}
    LIMIT ${PER_PAGE} OFFSET ${offset}
  `;

  const rows = await sql.query(dataQuery, queryParams);

  return {
    deals: rows as DealCardData[],
    pagination: {
      current_page: page,
      total_pages: Math.ceil(total / PER_PAGE),
      total_deals: total,
      has_previous: page > 1,
      has_next: page * PER_PAGE < total,
      per_page: PER_PAGE,
    },
  };
}

export async function getDealDetail(
  dealId: string
): Promise<DealDetail | "not-found" | "expired"> {
  const rows = await sql.query(
    `
      SELECT ${DEAL_CARD_FIELDS}, d.status, d.is_active, d.expires_at, d.product_id
      FROM deals d
      JOIN merchants m ON d.merchant_id = m.id
      WHERE d.id = $1
    `,
    [dealId]
  );

  if (rows.length === 0) {
    return "not-found";
  }

  const row = rows[0] as DealCardData & {
    status: string;
    is_active: boolean;
    expires_at: string | null;
    product_id: string | null;
  };

  const isValid =
    row.status === "active" &&
    row.is_active === true &&
    (row.expires_at === null || new Date(row.expires_at) > new Date());

  if (!isValid) {
    return "expired";
  }

  const deal: DealCardData = {
    id: row.id,
    title: row.title,
    brand: row.brand,
    category: row.category,
    image_url: row.image_url,
    original_price: row.original_price,
    discounted_price: row.discounted_price,
    discount_percentage: row.discount_percentage,
    merchant: row.merchant,
    created_at: row.created_at,
    expires_at: row.expires_at,
  };

  let otherOffers: DealCardData[] = [];
  if (row.product_id) {
    const otherRows = await sql.query(
      `
        SELECT ${DEAL_CARD_FIELDS}
        FROM deals d
        JOIN merchants m ON d.merchant_id = m.id
        WHERE d.product_id = $1
          AND d.id != $2
          AND d.status = 'active'
          AND d.is_active = true
          AND (d.expires_at IS NULL OR d.expires_at > NOW())
        ORDER BY d.discounted_price ASC
      `,
      [row.product_id, dealId]
    );
    otherOffers = otherRows as DealCardData[];
  }

  return { deal, otherOffers };
}
