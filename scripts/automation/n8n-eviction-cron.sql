-- n8n workflow: éviction automatique des bons plans expirés (T031, Phase 6 / US4)
--
-- Ce script n'est PAS exécuté par l'application Next.js. Il documente la requête à
-- coller dans un nœud "Postgres" d'un workflow n8n planifié en cron horaire
-- (expression `0 * * * *`), utilisant la chaîne de connexion Neon directe
-- (cf. cadrage_deals-tennis/contracts/ingestion-contract.md, section 3).
--
-- Effet : toute offre dont l'échéance est dépassée passe status='expired' et
-- is_active=false, ce qui la fait disparaître du catalogue (lib/deals.ts filtre sur
-- status='active' AND is_active=true) et fait basculer /go/[dealId] sur
-- /?notification=deal-expired pour les liens déjà partagés (app/go/[dealId]/route.ts).

UPDATE deals
SET
  status = 'expired',
  is_active = false,
  updated_at = NOW()
WHERE
  status = 'active'
  AND (
    (expires_at IS NOT NULL AND expires_at <= NOW())
    OR is_active = false
  );

-- ---------------------------------------------------------------------------
-- Format de charge utile pour l'ingestion de nouveaux bons plans (nœud n8n en
-- amont, avant ce cron d'éviction), reproduit ici à titre de référence rapide.
-- Source normative : cadrage_deals-tennis/contracts/ingestion-contract.md, section 2.
-- ---------------------------------------------------------------------------
--
-- {
--   "title": "Raquette Head Speed Pro 2024",
--   "brand": "Head",
--   "category": "raquettes",
--   "image_url": "https://img.tennis-warehouse-europe.com/products/HSPR24.jpg",
--   "original_price": 280.00,
--   "discounted_price": 189.90,
--   "discount_percentage": 32,
--   "merchant_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
--   "affiliate_url": "https://ad.zanox.com/ppc/?12345678&ulp=https://tennis-point.fr/head-speed-pro",
--   "status": "active",
--   "is_active": true,
--   "expires_at": "2026-10-15T23:59:59Z"
-- }
--
-- Règles de calcul obligatoires côté n8n avant insertion/upsert dans `deals` :
--   1. discount_percentage = ROUND(((original_price - discounted_price) / original_price) * 100)
--   2. category strictement normalisée en minuscules parmi :
--      raquettes, cordages, chaussures, textile, accessoires
--   3. original_price DOIT être strictement supérieur à discounted_price
