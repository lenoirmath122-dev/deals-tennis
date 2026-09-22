-- Migration 003: table `products` (rapprochement multi-marchands)
--
-- Direction actée en D-2026-09-22-06 : aucun marchand n'expose de référence
-- fabricant/EAN exploitable, le rapprochement d'un même article vendu par
-- plusieurs marchands se fait par extraction marque/modèle depuis le titre
-- (marque = `deals.brand`, déjà fiable côté marchand ; modèle = titre nettoyé,
-- voir lib/product-matching.ts). `deals.product_id` reste nullable : une offre
-- peut exister sans rapprochement encore fait.

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand VARCHAR(100) NOT NULL,
  model VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT products_category_check CHECK (
    category IN ('raquettes', 'cordages', 'chaussures', 'textile', 'accessoires')
  )
);

-- Unicité insensible à la casse : "Babolat"/"babolat" ne doivent pas créer deux produits.
CREATE UNIQUE INDEX idx_products_brand_model_category
ON products (LOWER(brand), LOWER(model), category);

ALTER TABLE deals
ADD COLUMN product_id UUID REFERENCES products(id);

CREATE INDEX idx_deals_product_id ON deals (product_id);
