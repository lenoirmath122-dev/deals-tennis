# R3 — Capture à l'ingestion : cadrage et découpage (2026-09-28)

> Étape R3 du §10 de `CADRAGE_rapprochement-multi-niveaux.md`, avec la Phase 1 et le §6 de `CADRAGE_vrais-bons-plans.md`. **Cadrage uniquement, aucun code.** Proposition de Claude Code, à valider par Mathieu (questions R3-Q1 à R3-Q6, §4).

## 1. Ce que R3 doit livrer (déjà acté)

| Élément | Source |
|---|---|
| Fonction d'ingestion partagée `lib/ingest.ts`, utilisée par les 8 scripts | Cadrage principal, Phase 1 point 2 ; D-2026-09-25-22 |
| Statut `tracked` pour les articles vus sans remise (`is_active=false`, `original_price = discounted_price`), exclu du site partout, évincé comme les autres | D-2026-09-25-21 |
| Capture du GTIN, du `mpn`, des attributs bruts disponibles et de la quantité unitaire | §10 R3 du cadrage rapprochement ; R0 §1 / §1bis |
| Sous-catégories d'accessoires (`deals.subcategory`, 6 valeurs dont `protection_soins`, lexique v2) | D-2026-09-25-15, D-2026-09-28-03 ; GAP-2026-09-25-11 étapes 1 à 4 |
| Exclusions à l'ingestion : JOOLA (tennis de table), chaussures de ville, hors sujet accessoires | D-2026-09-28-02 (Q11), D-2026-09-28-03 (Q13, Q20) |
| Textile porté (casquettes, visières, poignets, bandeaux, chaussettes) déplacé des accessoires vers la catégorie textile | D-2026-09-28-03 (Q20) |
| Anomalies de marque à corriger à l'ingestion (SPORTSYSTEM, HEAD / Head, Luxilon sous Wilson, L23 sous Tecnifibre) | `R2_referentiel.md` §4 |
| Réécriture des 8 scripts **un par un**, vérifiée à chaque fois sur un vrai passage | §10 R3 |

Déjà en place : le trigger `price_observations` (D-2026-09-25-22, en prod), qui écrit l'historique pour `active` et `tracked`.

## 2. État du code (lu le 2026-09-28)

- Les 8 scripts (`scripts/scraping/*.ts`, 2 683 lignes) dupliquent le même SQL : upsert `products` par la clé texte `(lower(brand), lower(model), category)`, upsert `deals` sur `(merchant_id, affiliate_url)`, puis éviction `status='expired'` des offres **actives** non revues (garde-fou : aucune éviction si 0 URL vue).
- Chaque script **ignore** les articles sans remise (`skippedNoDiscount`) et les hors tennis.
- `deals.status_check` n'autorise que `active`, `expired`, `invalid` : `tracked` demande une migration.
- Le site filtre les statuts dans 3 fichiers : `lib/deals.ts`, `lib/products.ts`, `app/go/[dealId]/route.ts` (16 occurrences de `status = 'active'` / `is_active`). Chaque requête devra être vérifiée une par une (D-2026-09-25-21).
- Les extracteurs (marque, modèle, genre, âge, couleur) sont dans `lib/product-matching.ts`. Les 4 fichiers `config/` de R2 ne sont lus par aucun code.
- Les tests unitaires utilisent vitest (`npm run test:unit`).

**Correction d'une idée reçue.** Le cadrage parlait d'une capture « gratuite » des articles sans remise pour 6 marchands, « d'après l'audit de phase 0 ». Aucun document ne contient ce constat marchand par marchand, et D-2026-09-25-22 demande de le vérifier au build. D'après les scripts actuels :
- Tennis Point FR, Tecnifibre, SportSystem, Babolat, Tennispro.fr, Head et Amazon comptent des articles sans remise **dans ce qu'ils récupèrent déjà**. Ce que ce compteur vaut réellement reste à mesurer lors d'un vrai passage. Amazon : 154 fiches sans remise sur 233 au dernier passage connu (D-2026-09-25-16).
- Sport 2000 les filtre dans la requête Algolia (`percent_discount > 0`, D-2026-09-25-06).
- Plusieurs scripts ne parcourent que des collections promo : ils ne verront donc que les articles sortis de promo qui y restent affichés. Le biais du cadrage principal (§2, « les scrapers ne voient les articles que lorsqu'ils sont en promo ») n'est **pas** résolu par R3. Il relève de la Phase 4-bis (amorçage des prix de référence).

## 3. Découpage proposé (une étape par conversation)

| Étape | Contenu | Réseau marchand ? | Modèle |
|---|---|---|---|
| **R3.1** | Migration additive (statut `tracked`, colonnes de capture sur `deals`, `subcategory`, voir R3-Q1) testée sur une branche Neon. Audit et correction des requêtes du site pour exclure `tracked`, avec tests. | Non (Neon seulement) | Sonnet |
| **R3.2** | `lib/ingest.ts` : upsert `products` + `deals`, choix `active` / `tracked`, exclusions, sous-catégorie (lexique v2 + famille), déplacement du textile porté, quantité unitaire (lots, mètres, balles, pièces), corrections de marque, éviction (actives **et** `tracked`), compteurs du passage. Tests unitaires sur des titres réels. | Non | Sonnet |
| **R3.3** | Backfill des offres existantes : sous-catégorie, exclusions (R3-Q4), déplacement du textile porté, quantité unitaire, corrections de marque. Branche Neon d'abord, puis prod après accord. | Non | Sonnet |
| **R3.4 à R3.11** | Réécriture d'un script par étape pour utiliser `lib/ingest.ts`, avec capture de ce que chaque source expose **sans requête supplémentaire** (GTIN Sport 2000, poids Tennis Point FR, SKU…). Vérifiée par un vrai passage : compteurs, lignes `price_observations`, offres `tracked`, aucune régression sur les offres actives. Ordre proposé : Tecnifibre (petit, Shopify), Tennis Point FR, Sport 2000, SportSystem, Babolat, Tennispro.fr, Head, Amazon. | **Oui** (desktop ou VM) | Sonnet |
| **R3.12** | Enrichissement par fiche (GTIN Tennis Point FR et Tecnifibre, `mpn` Tennispro.fr), si retenu (R3-Q2). | **Oui** | Sonnet |
| **R3.13** | Filtre secondaire des sous-catégories dans l'interface (GAP-2026-09-25-11 étape 6). | Non | Sonnet |

R3.1 à R3.3 peuvent se faire dans une session cloud (base Neon accessible, sites marchands inutiles). R3.4 et la suite demandent un vrai passage de scraping, donc la machine de Mathieu ou la VM.

## 4. Questions pour Mathieu

**R3-Q1 — Où stocker ce qui est capturé ?**
R0 §4 proposait de mettre le GTIN et les attributs sur `products` (niveau modèle), et de créer `product_families` et `product_merges`. Je propose plutôt de **tout capturer sur l'offre (`deals`)** en R3 : `gtin`, `mpn`, `merchant_sku`, `unit_quantity`, `unit_type`, `subcategory`, et un champ `raw_attributes` (jsonb) pour le reste (poids par variante, plan de cordage lu, surface…). Les tables `product_families` et `product_merges` et les colonnes de `products` seraient créées en R4, par le moteur qui les remplit.
*Raison* : en R3, `products` est encore rempli par la clé texte actuelle, qui fusionne à tort des modèles différents (Pure Drive 98 Gen 11 et 2023 sous un même titre, R1 paire 29). Poser un GTIN sur ces produits propagerait l'erreur. L'offre, elle, est une observation fiable.

**R3-Q2 — Requêtes supplémentaires par fiche (GTIN, référence fabricant)**
Coût mesuré en R0 §1bis : Tennis Point FR 533 requêtes par passage, Tecnifibre 23, et Tennispro.fr 250 fiches avec 60 s d'attente imposée entre deux requêtes (≈ 4 h par passage).
Proposé : **enrichir une seule fois par offre** (quand l'URL est nouvelle ou le champ vide), jamais à chaque passage, dans une étape séparée (R3.12) après la réécriture des scripts. Le coût devient proportionnel aux nouvelles offres (quelques dizaines par jour) au lieu du catalogue entier.

**R3-Q3 — Offres `tracked` : quel périmètre en R3 ?**
Proposé : ne capturer en `tracked` que les articles sans remise **déjà présents dans ce que chaque script récupère**, sans parcourir de page en plus. Le parcours du catalogue complet, pour connaître les prix hors promo, reste en Phase 4-bis.

**R3-Q4 — Offres exclues déjà en base** (JOOLA, chaussures de ville, hors sujet accessoires)
Proposé : à l'ingestion, **ne pas les insérer** et les compter dans les compteurs du passage. Pour les offres déjà en base, les passer en `status='invalid'` (statut déjà autorisé) plutôt que les supprimer : cela reste réversible, et l'historique de prix est conservé.

**R3-Q5 — Garde-fou d'éviction**
D-2026-09-25-21 applique l'éviction aux `tracked`. Le garde-fou « chute de plus de 50 % des offres vues » est prévu en Phase 2 (avec `ingestion_runs`). Proposé : en R3, étendre l'éviction aux `tracked` et **garder le garde-fou actuel** (aucune éviction si 0 URL vue) ; le garde-fou 50 % reste en Phase 2.
*Risque signalé* : avec les `tracked`, un passage partiel (page qui ne charge pas) pourrait expirer davantage d'offres qu'aujourd'hui. On pourrait avancer le garde-fou 50 % en R3.2 : il suffit de comparer au nombre d'offres actives et `tracked` du marchand avant le passage, sans `ingestion_runs`.

**R3-Q6 — Filtre des sous-catégories dans l'interface** (GAP-2026-09-25-11 étape 6) : dans R3 (R3.13), ou après R3 ?

## 5. Hors périmètre de R3

- Moteur de rapprochement, familles, `product_merges` : R4.
- `ingestion_runs`, cadence automatique sur la VM : Phase 2.
- Quarantaine des prix aberrants : Phase 3a.
- Prix de référence hors promo (parcours du catalogue complet) : Phase 4-bis.
