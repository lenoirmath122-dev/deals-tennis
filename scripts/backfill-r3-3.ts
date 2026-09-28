// R3.3 : backfill des offres déjà en base avec les règles construites en R3.2
// (`lib/ingest.ts`), pas encore utilisées par les 8 scripts de scraping
// (R3.4-R3.11). Voir `cadrage_deals-tennis/R3_cadrage.md` §3.
//
// Périmètre R3.3 (pas le statut active/tracked, hors périmètre — voir §3) :
// - exclusions (R3-Q4) : JOOLA, chaussures de ville, accessoires hors sujet
//   -> status='invalid' (pas supprimées, réversible, historique conservé)
// - déplacement du textile porté (casquettes, poignets...) accessoires -> textile
// - sous-catégorie d'accessoires (lexique v2)
// - quantité unitaire (mètres cordages, balles, lots)
// - corrections de marque (SPORTSYSTEM, HEAD/Head, Luxilon/Lacoste...)
//
// Un changement de marque/catégorie peut changer le modèle extrait du titre
// (`extractModel` retire le nom de marque du titre) : l'offre est alors
// reliée à un autre `products` (brand, model, category), créé si besoin.
import { neon } from "@neondatabase/serverless";
import {
  checkExclusion,
  resolveCategory,
  correctBrand,
  extractUnitInfo,
} from "../lib/ingest.ts";
import { extractModel } from "../lib/product-matching.ts";
import type { DealCategory } from "../types/database.ts";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const sql = neon(process.env.DATABASE_URL);

interface Row {
  id: string;
  title: string;
  brand: string;
  category: DealCategory;
  subcategory: string | null;
  unit_quantity: string | null; // NUMERIC vient en string du driver
  unit_type: string | null;
  product_id: string | null;
  product_model: string | null;
  gender: string | null;
  age_group: string | null;
}

const rows = (await sql`
  SELECT d.id, d.title, d.brand, d.category, d.subcategory, d.unit_quantity, d.unit_type,
         d.product_id, p.model AS product_model, p.gender, p.age_group
  FROM deals d
  LEFT JOIN products p ON d.product_id = p.id
  WHERE d.status != 'invalid'
`) as Row[];

let excluded = 0;
let brandCorrected = 0;
let categoryMoved = 0;
let subcategoryChangedCount = 0;
let unitChangedCount = 0;
let relinked = 0;
let untouched = 0;

for (const row of rows) {
  const brand = correctBrand(row.brand, row.title, row.category);
  const exclusion = checkExclusion(row.title, brand, row.category);

  if (exclusion) {
    await sql`
      UPDATE deals
      SET status = 'invalid', is_active = false, brand = ${brand}, updated_at = NOW()
      WHERE id = ${row.id}
    `;
    excluded += 1;
    if (brand !== row.brand) brandCorrected += 1;
    continue;
  }

  const { category, subcategory } = resolveCategory(row.title, row.category);
  const { unitQuantity, unitType } = extractUnitInfo(row.title, category, subcategory);
  const model = extractModel(row.title, brand, category);

  const brandChanged = brand !== row.brand;
  const categoryChanged = category !== row.category;
  const subcategoryChanged = subcategory !== row.subcategory;
  const currentUnitQuantity = row.unit_quantity === null ? null : parseFloat(row.unit_quantity);
  const unitChanged = unitQuantity !== currentUnitQuantity || unitType !== row.unit_type;
  const modelChanged = row.product_id !== null && model !== row.product_model;

  if (!brandChanged && !categoryChanged && !subcategoryChanged && !unitChanged && !modelChanged) {
    untouched += 1;
    continue;
  }

  let productId = row.product_id;
  if (brandChanged || categoryChanged || modelChanged) {
    const gender = row.gender ?? "non_determine";
    const ageGroup = row.age_group ?? "adulte";
    const [product] = await sql`
      INSERT INTO products (brand, model, category, gender, age_group)
      VALUES (${brand}, ${model}, ${category}, ${gender}, ${ageGroup})
      ON CONFLICT (LOWER(brand), LOWER(model), category)
      DO UPDATE SET brand = EXCLUDED.brand
      RETURNING id
    `;
    if (product.id !== row.product_id) relinked += 1;
    productId = product.id;
  }

  await sql`
    UPDATE deals
    SET brand = ${brand}, category = ${category}, subcategory = ${subcategory},
        unit_quantity = ${unitQuantity}, unit_type = ${unitType}, product_id = ${productId},
        updated_at = NOW()
    WHERE id = ${row.id}
  `;

  if (brandChanged) brandCorrected += 1;
  if (categoryChanged) categoryMoved += 1;
  if (subcategoryChanged) subcategoryChangedCount += 1;
  if (unitChanged) unitChangedCount += 1;
}

console.log(`${rows.length} offre(s) examinée(s) (hors status='invalid').`);
console.log(`${excluded} offre(s) passée(s) en status='invalid' (JOOLA / chaussure de ville / accessoire hors sujet).`);
console.log(`${brandCorrected} marque(s) corrigée(s).`);
console.log(`${categoryMoved} offre(s) déplacée(s) de catégorie (textile porté sorti des accessoires).`);
console.log(`${subcategoryChangedCount} sous-catégorie(s) renseignée(s)/changée(s).`);
console.log(`${unitChangedCount} quantité(s) unitaire(s) renseignée(s)/changée(s).`);
console.log(`${relinked} offre(s) relié(e)(s) à un nouveau produit (product_id changé).`);
console.log(`${untouched} offre(s) inchangée(s).`);
