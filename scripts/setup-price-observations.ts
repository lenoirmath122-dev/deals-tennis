// Applique scripts/migrations/006_price_observations.sql (D-2026-09-25-22).
// Script dédié plutôt que scripts/migrate.ts : le découpage naïf de ce
// dernier sur `;\n` casserait le corps de la fonction PL/pgSQL (`$$ ... $$`
// contient ses propres `;`). Chaque instruction est envoyée comme une
// requête atomique séparée, sans découpage textuel.
//
// Usage: node --env-file=<fichier> scripts/setup-price-observations.ts

import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const sql = neon(process.env.DATABASE_URL);

async function main() {
  await sql.query(`
    CREATE TABLE price_observations (
      deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
      observed_on DATE NOT NULL,
      price NUMERIC(10, 2) NOT NULL,
      merchant_list_price NUMERIC(10, 2),
      in_stock BOOLEAN,
      first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (deal_id, observed_on)
    )
  `);
  console.log("Table price_observations créée.");

  await sql.query(`
    CREATE INDEX idx_price_observations_deal_id
    ON price_observations (deal_id, observed_on DESC)
  `);
  console.log("Index créé.");

  await sql.query(`
    CREATE OR REPLACE FUNCTION record_price_observation()
    RETURNS TRIGGER AS $$
    BEGIN
      IF NEW.status IN ('active', 'tracked') THEN
        INSERT INTO price_observations (
          deal_id, observed_on, price, merchant_list_price, first_seen_at, last_seen_at
        )
        VALUES (
          NEW.id,
          (NOW() AT TIME ZONE 'Europe/Paris')::date,
          NEW.discounted_price,
          NEW.original_price,
          NOW(),
          NOW()
        )
        ON CONFLICT (deal_id, observed_on) DO UPDATE SET
          price = EXCLUDED.price,
          merchant_list_price = EXCLUDED.merchant_list_price,
          last_seen_at = NOW();
      END IF;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql
  `);
  console.log("Fonction record_price_observation() créée.");

  await sql.query(`
    CREATE TRIGGER trg_deals_price_observation
    AFTER INSERT OR UPDATE ON deals
    FOR EACH ROW
    EXECUTE FUNCTION record_price_observation()
  `);
  console.log("Trigger trg_deals_price_observation créé.");
}

main();
