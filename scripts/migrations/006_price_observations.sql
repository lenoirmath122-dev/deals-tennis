-- Migration 006: historique de prix (D-2026-09-25-22, Phase 1 de
-- CADRAGE_vrais-bons-plans.md).
--
-- Une ligne par (deal_id, jour). Alimentée par un trigger Postgres
-- `AFTER INSERT OR UPDATE` sur `deals`, qui upsert quand
-- `status IN ('active', 'tracked')` — une éviction (passage à `expired`)
-- n'écrit rien. Le jour d'observation est calculé en heure de Paris.
--
-- Référence de schéma uniquement : ce fichier n'est PAS applicable via
-- `scripts/migrate.ts` (découpage naïf du SQL sur `;\n`, incompatible avec
-- un corps de fonction PL/pgSQL contenant ses propres `;`). Appliqué via
-- `scripts/setup-price-observations.ts`, qui envoie chaque instruction
-- de ce fichier comme une requête atomique (même schéma que
-- scripts/retrait-protennis.ts pour la migration 005bis ProTennis).

CREATE TABLE price_observations (
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  observed_on DATE NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  merchant_list_price NUMERIC(10, 2),
  in_stock BOOLEAN,
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (deal_id, observed_on)
);

CREATE INDEX idx_price_observations_deal_id
ON price_observations (deal_id, observed_on DESC);

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
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_deals_price_observation
AFTER INSERT OR UPDATE ON deals
FOR EACH ROW
EXECUTE FUNCTION record_price_observation();
