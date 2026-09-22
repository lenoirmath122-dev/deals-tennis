-- Migration 002: contrainte d'unicité (merchant_id, affiliate_url) sur `deals`
--
-- Nécessaire pour l'upsert fiable des offres scrapées par les workflows n8n
-- d'ingestion externe (cf. cadrage_deals-tennis/contracts/ingestion-contract.md) :
-- l'URL produit du marchand sert de clé stable pour identifier « la même offre »
-- d'un passage de scraping à l'autre, en l'absence d'identifiant interne partagé.

ALTER TABLE deals
ADD CONSTRAINT deals_merchant_affiliate_url_key UNIQUE (merchant_id, affiliate_url);
