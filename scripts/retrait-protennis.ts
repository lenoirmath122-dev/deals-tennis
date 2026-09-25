// Suppression définitive de ProTennis (D-2026-09-25-20, GAP-2026-09-25-18, étape 4).
// Étapes 1-3 (inventaire, export CSV, passage en `expired`) déjà faites.
// Script dédié (pas une migration .sql générique) car l'ordre dépend de
// données lues en cours de route : le jeu de produits devenus orphelins
// à cause de ce retrait doit être capturé AVANT la suppression des deals
// ProTennis (sinon la contrainte FK deals.product_id l'empêche), mais ne
// doit contenir QUE les produits qui n'ont plus aucune offre après ce
// retrait alors qu'ils en avaient une chez ProTennis — pas les produits
// déjà orphelins avant (722 au 2026-09-25, dette de données préexistante
// et sans rapport, hors périmètre).
//
// Usage: node --env-file=<fichier> scripts/retrait-protennis.ts

import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const sql = neon(process.env.DATABASE_URL);

async function counts(label: string) {
  const [merchants] = await sql.query("SELECT count(*)::int AS n FROM merchants");
  const [products] = await sql.query("SELECT count(*)::int AS n FROM products");
  const [deals] = await sql.query("SELECT count(*)::int AS n FROM deals");
  const [clicks] = await sql.query("SELECT count(*)::int AS n FROM click_events");
  console.log(label, {
    merchants: merchants.n,
    products: products.n,
    deals: deals.n,
    click_events: clicks.n,
  });
}

async function main() {
  const [merchant] = await sql.query(
    "SELECT id FROM merchants WHERE slug = 'protennis'"
  );

  if (!merchant) {
    console.log("Aucun marchand protennis trouvé, rien à faire.");
    return;
  }

  await counts("AVANT");

  const orphanProducts = await sql.query(
    `SELECT p.id FROM products p
     WHERE EXISTS (
       SELECT 1 FROM deals d
       WHERE d.product_id = p.id AND d.merchant_id = $1
     )
     AND NOT EXISTS (
       SELECT 1 FROM deals d
       WHERE d.product_id = p.id AND d.merchant_id != $1
     )`,
    [merchant.id]
  );
  const orphanIds: string[] = orphanProducts.map((r) => (r as { id: string }).id);
  console.log(`Produits devenus orphelins à cause de ce retrait : ${orphanIds.length}`);

  const deletedClicks = await sql.query(
    "DELETE FROM click_events WHERE deal_id IN (SELECT id FROM deals WHERE merchant_id = $1) RETURNING id",
    [merchant.id]
  );
  console.log(`click_events supprimés : ${deletedClicks.length}`);

  const deletedDeals = await sql.query(
    "DELETE FROM deals WHERE merchant_id = $1 RETURNING id",
    [merchant.id]
  );
  console.log(`deals supprimés : ${deletedDeals.length}`);

  if (orphanIds.length > 0) {
    const deletedProducts = await sql.query(
      "DELETE FROM products WHERE id = ANY($1::uuid[]) RETURNING id",
      [orphanIds]
    );
    console.log(`products supprimés : ${deletedProducts.length}`);
  }

  const deletedMerchant = await sql.query(
    "DELETE FROM merchants WHERE id = $1 RETURNING id",
    [merchant.id]
  );
  console.log(`merchants supprimés : ${deletedMerchant.length}`);

  await counts("APRÈS");
}

main();
