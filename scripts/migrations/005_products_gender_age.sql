-- Migration 005: filtre catalogue sexe/âge (D-2026-09-25-01 à -04)
--
-- Deux colonnes indépendantes sur `products` (D-2026-09-25-02), extraites par
-- heuristique sur le titre marchand (D-2026-09-25-03, voir lib/product-matching.ts).
-- Pas de valeur `non_determine` pour l'âge : un article sans mot-clé enfant est
-- considéré adulte par défaut.

ALTER TABLE products
ADD COLUMN gender VARCHAR(20) NOT NULL DEFAULT 'non_determine',
ADD COLUMN age_group VARCHAR(20) NOT NULL DEFAULT 'adulte';

ALTER TABLE products
ADD CONSTRAINT products_gender_check
  CHECK (gender IN ('homme', 'femme', 'mixte', 'non_determine')),
ADD CONSTRAINT products_age_group_check
  CHECK (age_group IN ('adulte', 'enfant'));

CREATE INDEX idx_products_gender ON products (gender);
CREATE INDEX idx_products_age_group ON products (age_group);
