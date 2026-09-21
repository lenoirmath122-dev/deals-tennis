import { sql } from "@/lib/db";
import type { CatalogResponse, DealCardData } from "@/types/database";

const PER_PAGE = 24;

export interface GetCatalogDealsParams {
  category?: string;
  sort?: "newest" | "discount";
  q?: string;
  page?: number;
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

  if (params.category && params.category !== "all") {
    conditions.push(`d.category = $${paramIndex++}`);
    queryParams.push(params.category);
  }

  if (params.q && params.q.trim().length > 0) {
    conditions.push(`(d.title ILIKE $${paramIndex} OR d.brand ILIKE $${paramIndex})`);
    paramIndex++;
    queryParams.push(`%${params.q.trim()}%`);
  }

  const whereClause = conditions.join(" AND ");
  const orderByClause =
    params.sort === "discount"
      ? "d.discount_percentage DESC, d.created_at DESC"
      : "d.created_at DESC";

  const countQuery = `SELECT COUNT(*)::int AS total FROM deals d WHERE ${whereClause}`;
  const countResult = await sql.query(countQuery, queryParams);
  const total = (countResult[0]?.total as number) || 0;

  const dataQuery = `
    SELECT
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
    FROM deals d
    JOIN merchants m ON d.merchant_id = m.id
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
