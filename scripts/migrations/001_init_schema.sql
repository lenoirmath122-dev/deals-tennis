-- Migration 001: schema initial (merchants, deals, click_events)
-- Voir cadrage_deals-tennis/data-model.md pour la spécification complète.

CREATE TABLE merchants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  logo_url TEXT,
  website_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  brand VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  image_url TEXT NOT NULL,
  original_price NUMERIC(10, 2) NOT NULL,
  discounted_price NUMERIC(10, 2) NOT NULL,
  discount_percentage INTEGER NOT NULL,
  merchant_id UUID NOT NULL REFERENCES merchants(id),
  affiliate_url TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT category_check CHECK (category IN ('raquettes', 'cordages', 'chaussures', 'textile', 'accessoires')),
  CONSTRAINT status_check CHECK (status IN ('active', 'expired', 'invalid')),
  CONSTRAINT price_validity CHECK (original_price > 0 AND discounted_price > 0 AND discounted_price <= original_price),
  CONSTRAINT discount_check CHECK (discount_percentage >= 0 AND discount_percentage <= 100)
);

CREATE TABLE click_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  device_type VARCHAR(20) NOT NULL DEFAULT 'unknown',
  referrer_url TEXT,
  clicked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 1. Index de filtrage des offres actives valides
CREATE INDEX idx_deals_active_status
ON deals (status, is_active, expires_at);

-- 2. Index composite pour l'affichage par défaut (nouveautés en premier)
CREATE INDEX idx_deals_created_at_desc
ON deals (created_at DESC)
WHERE status = 'active' AND is_active = true;

-- 3. Index composite pour le tri par réduction
CREATE INDEX idx_deals_discount_desc
ON deals (discount_percentage DESC)
WHERE status = 'active' AND is_active = true;

-- 4. Index composites par catégorie
CREATE INDEX idx_deals_category_created
ON deals (category, created_at DESC)
WHERE status = 'active' AND is_active = true;

CREATE INDEX idx_deals_category_discount
ON deals (category, discount_percentage DESC)
WHERE status = 'active' AND is_active = true;

-- 5. Index Full-Text Search (recherche textuelle instantanée sur titre et marque)
CREATE INDEX idx_deals_fts
ON deals USING GIN (to_tsvector('french', title || ' ' || brand));

-- 6. Index de suivi des clics
CREATE INDEX idx_click_events_deal_date
ON click_events (deal_id, clicked_at DESC);
