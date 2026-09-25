// GAP-2026-09-25-15 étape 3 : recorrige les produits `raquettes` déjà en base
// de prod dont `age_group` était resté à 'adulte' par défaut (backfill initial
// D-2026-09-25-04, avant l'heuristique taille en pouces de D-2026-09-25-19).
// Règle de réconciliation identique au backfill initial : une seule mise à
// niveau possible ('adulte' -> 'enfant'), jamais l'inverse.
import { neon } from "@neondatabase/serverless";
import { extractAgeGroup } from "../lib/product-matching.ts";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const sql = neon(process.env.DATABASE_URL);

const products = await sql`
  SELECT id FROM products WHERE category = 'raquettes' AND age_group = 'adulte'
`;

const deals = await sql`
  SELECT d.product_id, d.title
  FROM deals d
  JOIN products p ON d.product_id = p.id
  WHERE p.category = 'raquettes' AND p.age_group = 'adulte'
`;

const titlesByProduct = new Map<string, string[]>();
for (const row of deals as { product_id: string; title: string }[]) {
  const list = titlesByProduct.get(row.product_id) ?? [];
  list.push(row.title);
  titlesByProduct.set(row.product_id, list);
}

let updated = 0;
for (const { id } of products as { id: string }[]) {
  const titles = titlesByProduct.get(id) ?? [];
  const shouldBeChild = titles.some((t) => extractAgeGroup(t, "raquettes") === "enfant");
  if (shouldBeChild) {
    await sql`UPDATE products SET age_group = 'enfant' WHERE id = ${id}`;
    updated += 1;
  }
}

console.log(`${products.length} produit(s) raquettes examiné(s) (age_group='adulte').`);
console.log(`${updated} produit(s) basculé(s) vers 'enfant' (taille en pouces détectée).`);
