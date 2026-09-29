-- Migration 008: R4.1 — tables du moteur de rapprochement en mode fantôme
-- (D-2026-09-29-01, R4-Q1, cadrage_deals-tennis/R4_cadrage.md).
--
-- Migration purement additive : quatre tables nouvelles préfixées `match_`,
-- aucune colonne ajoutée ni modifiée sur les tables existantes (`deals`,
-- `products`...). Le site ne lit pas ces tables ; rien à défaire si R4 échoue.
-- Les familles restent dans les fichiers `config/` (D-2026-09-28-01) : pas de
-- table `product_families`. La relation « modèle proche » est calculée à la
-- lecture, pas stockée. Recalcul complet à chaque passage (R4-Q2) : les
-- lignes d'un passage sont rattachées à `match_runs` et supprimées avec lui.

CREATE TABLE match_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at TIMESTAMPTZ,
  engine_version VARCHAR(50) NOT NULL,
  -- Compteurs du rapport de passage (offres lues, reconnues, modèles, liens...).
  counters JSONB
);

-- Attributs extraits par offre et par passage, chacun avec sa source
-- (`gtin`, `mpn`, `donnees_structurees`, `fiche_marchand`, `titre_description`).
CREATE TABLE match_offer_attributes (
  run_id UUID NOT NULL REFERENCES match_runs(id) ON DELETE CASCADE,
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  -- Clé texte `marque|famille|catégorie` ; NULL si la famille n'est pas reconnue.
  family_key VARCHAR(255),
  -- Attributs extraits : { "<attribut>": { "value": ..., "source": "..." } }.
  attributes JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Motif de non-reconnaissance (famille absente du référentiel, catégorie sans référentiel...).
  unrecognized_reason VARCHAR(100),
  PRIMARY KEY (run_id, deal_id)
);

CREATE INDEX idx_match_offer_attributes_family
ON match_offer_attributes (run_id, family_key);

-- Modèles du nouveau moteur : famille, attributs canoniques, signature.
CREATE TABLE match_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID NOT NULL REFERENCES match_runs(id) ON DELETE CASCADE,
  family_key VARCHAR(255),
  category VARCHAR(50) NOT NULL,
  canonical_attributes JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Signature déterministe (famille + attributs discriminants) ; unique par passage.
  signature TEXT NOT NULL,
  CONSTRAINT match_models_category_check CHECK (
    category IN ('raquettes', 'cordages', 'chaussures', 'textile', 'accessoires')
  ),
  CONSTRAINT match_models_run_signature_unique UNIQUE (run_id, signature)
);

-- Offre -> modèle, avec la méthode qui a produit le lien et son score.
CREATE TABLE match_offer_links (
  run_id UUID NOT NULL REFERENCES match_runs(id) ON DELETE CASCADE,
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  model_id UUID NOT NULL REFERENCES match_models(id) ON DELETE CASCADE,
  method VARCHAR(20) NOT NULL,
  score NUMERIC(5, 4),
  PRIMARY KEY (run_id, deal_id),
  CONSTRAINT match_offer_links_method_check CHECK (
    method IN ('gtin', 'reference', 'signature', 'approche')
  ),
  CONSTRAINT match_offer_links_score_check CHECK (score IS NULL OR (score >= 0 AND score <= 1))
);

CREATE INDEX idx_match_offer_links_model ON match_offer_links (model_id);
