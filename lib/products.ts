import { sql } from "@/lib/db";
import { sanitizeSearchQuery } from "@/lib/filters";

const MAX_SUGGESTIONS = 8;
const MIN_QUERY_LENGTH = 2;

export async function getProductSuggestions(rawQuery: string | undefined | null): Promise<string[]> {
  const query = sanitizeSearchQuery(rawQuery);
  if (query.length < MIN_QUERY_LENGTH) {
    return [];
  }

  const words = query.split(/\s+/).filter(Boolean);
  const wordConditions = words
    .map((_, i) => `(p.brand ILIKE $${i + 1} OR p.model ILIKE $${i + 1})`)
    .join(" AND ");

  const rows = await sql.query(
    `
      SELECT DISTINCT p.brand || ' ' || p.model AS suggestion
      FROM products p
      JOIN deals d ON d.product_id = p.id
      WHERE d.status = 'active'
        AND d.is_active = true
        AND (d.expires_at IS NULL OR d.expires_at > NOW())
        AND (${wordConditions})
      ORDER BY suggestion
      LIMIT ${MAX_SUGGESTIONS}
    `,
    words.map((word) => `%${word}%`)
  );

  return (rows as { suggestion: string }[]).map((row) => row.suggestion);
}
