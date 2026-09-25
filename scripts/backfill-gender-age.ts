// D-2026-09-25-04 : peuple products.gender/age_group à partir des titres des offres
// déjà rattachées à chaque produit (deals.product_id). Règle de réconciliation :
// la première valeur déterminée rencontrée fait foi, jamais écrasée par une valeur
// différente ensuite (un vrai conflit est loggé pour investigation manuelle).
import { neon } from "@neondatabase/serverless";
import { extractGender, extractAgeGroup, type Gender, type AgeGroup } from "../lib/product-matching.ts";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const sql = neon(process.env.DATABASE_URL);

const deals = await sql`
  SELECT d.id AS deal_id, d.title, d.product_id
  FROM deals d
  WHERE d.product_id IS NOT NULL
`;

type Row = { deal_id: string; title: string; product_id: string };

const genderByProduct = new Map<string, Gender>();
const ageByProduct = new Map<string, AgeGroup>();
let genderConflicts = 0;

for (const d of deals as Row[]) {
  const gender = extractGender(d.title);
  if (gender !== "non_determine") {
    const existing = genderByProduct.get(d.product_id);
    if (existing === undefined) {
      genderByProduct.set(d.product_id, gender);
    } else if (existing !== gender) {
      genderConflicts += 1;
      console.warn(
        `CONFLIT gender produit ${d.product_id} : valeur retenue "${existing}", offre "${d.title}" donne "${gender}" (ignorée)`
      );
    }
  }

  const age = extractAgeGroup(d.title);
  if (age === "enfant") {
    const existing = ageByProduct.get(d.product_id);
    if (existing === undefined) {
      ageByProduct.set(d.product_id, age);
    }
    // age_group est binaire (enfant/adulte par défaut) : aucun conflit possible,
    // seule la première offre "enfant" est retenue.
  }
}

const productIds = await sql`SELECT id FROM products`;

let updated = 0;
for (const { id } of productIds as { id: string }[]) {
  const gender = genderByProduct.get(id) ?? "non_determine";
  const ageGroup = ageByProduct.get(id) ?? "adulte";

  await sql`
    UPDATE products SET gender = ${gender}, age_group = ${ageGroup} WHERE id = ${id}
  `;
  updated += 1;
}

console.log(`${updated} produit(s) mis à jour (gender + age_group).`);
console.log(`${genderConflicts} conflit(s) gender détecté(s) et loggé(s) ci-dessus.`);
