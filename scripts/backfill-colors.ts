// D-2026-09-23-06 : la couleur n'est plus incluse dans `products.model`. Ce script
// recalcule modèle + couleur pour TOUTES les offres existantes (pas seulement celles
// sans product_id, contrairement à backfill-product-ids.ts) afin de fusionner les
// produits qui n'étaient distincts que par couleur, et de peupler `deals.color`.
// Les lignes `products` qui se retrouvent sans aucune offre rattachée après fusion
// sont supprimées.
import { neon } from "@neondatabase/serverless";
import { extractColor, extractModel } from "../lib/product-matching.ts";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const sql = neon(process.env.DATABASE_URL);

const deals = await sql`
  SELECT id, title, brand, category FROM deals
`;

console.log(`${deals.length} offre(s) à retraiter.`);

let updated = 0;

for (const deal of deals) {
  const model = extractModel(deal.title, deal.brand, deal.category);
  const color = extractColor(deal.title);

  const [product] = await sql`
    INSERT INTO products (brand, model, category)
    VALUES (${deal.brand}, ${model}, ${deal.category})
    ON CONFLICT (LOWER(brand), LOWER(model), category)
    DO UPDATE SET brand = EXCLUDED.brand
    RETURNING id
  `;

  await sql`
    UPDATE deals SET product_id = ${product.id}, color = ${color} WHERE id = ${deal.id}
  `;

  updated += 1;
}

console.log(`${updated} offre(s) mise(s) à jour (product_id + color).`);

const orphans = await sql`
  DELETE FROM products
  WHERE id NOT IN (SELECT DISTINCT product_id FROM deals WHERE product_id IS NOT NULL)
  RETURNING id
`;

console.log(`${orphans.length} produit(s) orphelin(s) supprimé(s) (fusionnés dans un autre produit).`);
