-- Migration 004: colonne `color` sur `deals` (D-2026-09-23-06)
--
-- La couleur reste un attribut par offre, pas une clé d'identité produit :
-- deux couleurs du même modèle restent le même article (`products`), voir
-- lib/product-matching.ts (extractColor). Nullable : toute offre scrappée
-- avant ce chantier, ou dont le titre ne mentionne aucune couleur reconnue,
-- n'a pas de valeur.

ALTER TABLE deals
ADD COLUMN color VARCHAR(60);
