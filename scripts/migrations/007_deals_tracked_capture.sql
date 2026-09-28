-- Migration 007: R3.1 — statut `tracked` et capture à l'ingestion
-- (D-2026-09-28-04, R3-Q1/Q3/Q4, cadrage_deals-tennis/R3_cadrage.md).
--
-- Statut `tracked` : article vu sans remise (D-2026-09-25-21). Exclu du
-- site partout sans aucune requête applicative à corriger — `lib/deals.ts`,
-- `lib/products.ts` et `app/go/[dealId]/route.ts` filtrent déjà
-- `status = 'active'` (comparaison exacte), jamais `status <> 'expired'` ;
-- une valeur `tracked` est donc invisible du site par construction.
--
-- Colonnes de capture : sur `deals` (niveau offre), pas `products` —
-- R3-Q1 remplace la proposition initiale de R0 §4 (gtin sur `products`),
-- `products` étant encore rempli par la clé texte actuelle qui fusionne à
-- tort des modèles différents. `raw_attributes` (jsonb) reçoit tout ce qui
-- n'a pas de colonne dédiée (poids par variante, plan de cordage lu,
-- surface...).

ALTER TABLE deals
DROP CONSTRAINT status_check;

ALTER TABLE deals
ADD CONSTRAINT status_check CHECK (status IN ('active', 'expired', 'invalid', 'tracked'));

ALTER TABLE deals
ADD COLUMN gtin VARCHAR(20),
ADD COLUMN mpn VARCHAR(100),
ADD COLUMN merchant_sku VARCHAR(100),
ADD COLUMN unit_quantity NUMERIC(10, 2),
ADD COLUMN unit_type VARCHAR(20),
ADD COLUMN subcategory VARCHAR(30),
ADD COLUMN raw_attributes JSONB;

-- Valeurs alignées sur `config/matching-rules.ts` (`UnitType`).
ALTER TABLE deals
ADD CONSTRAINT unit_type_check CHECK (unit_type IS NULL OR unit_type IN ('metre', 'balle', 'unite'));

-- Valeurs alignées sur `config/accessory-subcategories.ts` (`AccessorySubcategory`, lexique v2, D-2026-09-28-03).
ALTER TABLE deals
ADD CONSTRAINT subcategory_check CHECK (
  subcategory IS NULL OR subcategory IN (
    'sacs', 'balles', 'antivibrateurs', 'grips_surgrips', 'accessoires_cordage', 'protection_soins'
  )
);
