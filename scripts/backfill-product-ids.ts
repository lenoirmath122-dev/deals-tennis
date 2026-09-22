import { neon } from "@neondatabase/serverless";
import { extractModel } from "../lib/product-matching.ts";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const sql = neon(process.env.DATABASE_URL);

const deals = await sql`
  SELECT id, title, brand, category
  FROM deals
  WHERE product_id IS NULL
`;

console.log(`${deals.length} offre(s) sans product_id.`);

let matched = 0;

for (const deal of deals) {
  const model = extractModel(deal.title, deal.brand, deal.category);

  const [product] = await sql`
    INSERT INTO products (brand, model, category)
    VALUES (${deal.brand}, ${model}, ${deal.category})
    ON CONFLICT (LOWER(brand), LOWER(model), category)
    DO UPDATE SET brand = EXCLUDED.brand
    RETURNING id
  `;

  await sql`
    UPDATE deals SET product_id = ${product.id} WHERE id = ${deal.id}
  `;

  matched += 1;
}

console.log(`${matched} offre(s) rattachée(s) à un produit.`);
