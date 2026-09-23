import { sql } from "@/lib/db";
import { sanitizeSearchQuery } from "@/lib/filters";
import { DEAL_CATEGORIES, type CatalogCategoryFilter } from "@/lib/filters";

const MIN_QUERY_LENGTH = 2;

function wordConditions(words: string[], startIndex: number): string {
  return words
    .map((_, i) => `(p.brand ILIKE $${startIndex + i} OR p.model ILIKE $${startIndex + i})`)
    .join(" AND ");
}

export interface SuggestionCategory {
  category: string;
  count: number;
}

export async function getSuggestionCategories(rawQuery: string | undefined | null): Promise<SuggestionCategory[]> {
  const query = sanitizeSearchQuery(rawQuery);
  if (query.length < MIN_QUERY_LENGTH) {
    return [];
  }

  const words = query.split(/\s+/).filter(Boolean);

  const rows = await sql.query(
    `
      SELECT p.category, COUNT(DISTINCT p.id) AS count
      FROM products p
      JOIN deals d ON d.product_id = p.id
      WHERE d.status = 'active'
        AND d.is_active = true
        AND (d.expires_at IS NULL OR d.expires_at > NOW())
        AND (${wordConditions(words, 1)})
      GROUP BY p.category
    `,
    words.map((word) => `%${word}%`)
  );

  const counts = new Map((rows as { category: string; count: string }[]).map((row) => [row.category, Number(row.count)]));

  return DEAL_CATEGORIES.filter((category) => counts.has(category)).map((category) => ({
    category,
    count: counts.get(category)!,
  }));
}

export async function getProductSuggestions(
  rawQuery: string | undefined | null,
  category?: CatalogCategoryFilter | null
): Promise<string[]> {
  const query = sanitizeSearchQuery(rawQuery);
  if (query.length < MIN_QUERY_LENGTH) {
    return [];
  }

  const words = query.split(/\s+/).filter(Boolean);
  const params = words.map((word) => `%${word}%`);
  let categoryCondition = "";
  if (category && category !== "all") {
    categoryCondition = ` AND p.category = $${params.length + 1}`;
    params.push(category);
  }

  const rows = await sql.query(
    `
      SELECT DISTINCT p.brand || ' ' || p.model AS suggestion
      FROM products p
      JOIN deals d ON d.product_id = p.id
      WHERE d.status = 'active'
        AND d.is_active = true
        AND (d.expires_at IS NULL OR d.expires_at > NOW())
        AND (${wordConditions(words, 1)})${categoryCondition}
      ORDER BY suggestion
    `,
    params
  );

  return (rows as { suggestion: string }[]).map((row) => row.suggestion);
}
