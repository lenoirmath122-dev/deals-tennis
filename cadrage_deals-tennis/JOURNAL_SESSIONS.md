# Journal des sessions

> Sessions du 2026-09-21 au 2026-09-22 (mise en place du protocole jusqu'à la méthode technique de collecte ProTennis) déplacées telles quelles dans `archive/JOURNAL_SESSIONS_2026-09-21_a_2026-09-22-methode-protennis.md` (D-2026-09-22-09/7bis, seuil 150 lignes).
> Sessions du 2026-09-22 (suite 2) au 2026-09-23 (recherche centrée article) déplacées telles quelles dans `archive/JOURNAL_SESSIONS_2026-09-22_a_2026-09-23-recherche-article.md` (même règle, condensation du 2026-09-23).
> Sessions du 2026-09-23 (cadrage monitoring n8n) au 2026-09-23 (hauteur du hero réduite) déplacées telles quelles dans `archive/JOURNAL_SESSIONS_2026-09-23-monitoring_a_hero-hauteur.md` (même règle, condensation du 2026-09-23, chantier marchands supplémentaires).
> Sessions du 2026-09-23 (pages réglementaires) au 2026-09-23 (suggestions groupées par catégorie) déplacées telles quelles dans `archive/JOURNAL_SESSIONS_2026-09-23-reglementaire_a_suggestions-categorie.md` (même règle, condensation du 2026-09-24).
> Sessions du 2026-09-24 (Sport Outlet FR) à 2026-09-24 (pré-étape tri prix) déplacées telles quelles dans `archive/JOURNAL_SESSIONS_2026-09-24-sportoutlet_a_pre-etape-tri.md` (même règle, condensation du 2026-09-25).
> Sessions du 2026-09-25 (SEO/GEO bloc 1) au 2026-09-25 (lexique sexe/âge, session 11) déplacées telles quelles dans `archive/JOURNAL_SESSIONS_2026-09-25-seo-bloc1_a_lexique-sexe-age.md` (même règle, condensation du 2026-09-25).
> Sessions du 2026-09-25 (validation Phase 0 vrais bons plans) au 2026-09-25 (SEO/GEO bloc 3) déplacées telles quelles dans `archive/JOURNAL_SESSIONS_2026-09-25-validationPhase0_a_seo-bloc3.md` (même règle, condensation du 2026-09-26).
> Sessions du 2026-09-25 (session 13, workflow n8n gender/age_group) au 2026-09-25 (build du trigger `price_observations`, avec la note de reconstitution du 2026-09-26) déplacées telles quelles dans `archive/JOURNAL_SESSIONS_2026-09-25-n8n-gender-age_a_trigger-price-observations.md` (même règle, condensation du 2026-09-27).
> Sessions du 2026-09-26 (application prod du trigger) au 2026-09-26 (suite 5, section « Choix du modèle ») déplacées telles quelles dans `archive/JOURNAL_SESSIONS_2026-09-26-prod-trigger_a_choix-du-modele.md` (même règle, condensation du 2026-09-28).
> Sessions du 2026-09-27 (repérage cowork) au 2026-09-27 (explications avant R2) déplacées telles quelles dans `archive/JOURNAL_SESSIONS_2026-09-27-reperage_a-preparation-R2.md` (même règle, condensation du 2026-09-28).
> Sessions du 2026-09-28 (R2 démarré) au 2026-09-28 (report D-2026-09-28-03, R2 clos) déplacées telles quelles dans `archive/JOURNAL_SESSIONS_2026-09-28-R2-demarrage_a_R2-clos.md` (même règle, condensation du 2026-09-28).
> Sessions du 2026-09-28 (cadrage R3 validé) au 2026-09-28 (R3.2, `lib/ingest.ts`) déplacées telles quelles dans `archive/JOURNAL_SESSIONS_2026-09-28-cadrage-R3_a_R3-2.md` (même règle, condensation du 2026-09-29).
> Consulter les archives uniquement si le détail ci-dessous ne suffit pas.

## 2026-09-28 (session desktop Sonnet) — R3.4 fait : script Tecnifibre réécrit sur `lib/ingest.ts`

- Reprise (`/clear`, « On démarre R3.4 »). `git fetch` d'abord (§9ter) : `master` à jour, branche fraîche `feat/r3-4-tecnifibre`. Modèle actuel = recommandé (Sonnet, exécution d'une spec déjà validée).
- Lu `R3_cadrage.md`, `lib/ingest.ts`, `scripts/scraping/tecnifibre.ts`. Vérifié réellement le JSON Shopify (168 articles) : **aucun GTIN/code-barres exposé** (champ `barcode` absent), seulement `sku` par variante et `grams` (poids d'expédition) → capture de `merchant_sku` (SKU de la première variante) et `raw_attributes.variants` (libellé, SKU, grammes) sans requête supplémentaire ; le GTIN reste pour R3.12 (JSON-LD de la fiche).
- **Script réécrit** : passe par `ingestOffer` / `evictMerchantOffers` ; les 9 articles sans remise réelle (auparavant ignorés) sont gardés en `tracked` (R3-Q3) ; compteurs séparés active / tracked / exclues par motif / sans prix / sans image. `lib/ingest.ts` : `ingestOffer` renvoie maintenant le `status` (`active`/`tracked`) pour permettre ce compte (aucun autre consommateur, aucun test touché).
- **Vérifié d'abord sur une branche Neon** (`test-r3-4-tecnifibre`) : 159 actives inchangées (mêmes catégories), 9 `tracked` (2 raquettes, 7 textile) avec `original_price = discounted_price`, 9 lignes `price_observations` créées par le trigger, 9 nouveaux produits (exactement ceux des `tracked`), 0 offre sans `product_id`, sous-catégories d'accessoires renseignées (antivibrateurs, grips_surgrips, protection_soins, sacs). Relance : mêmes compteurs, historique de prix inchangé (792 avant/après). Éviction testée avec 2 offres factices (une `tracked`, une `active`) : les deux passées en `expired`. Prod non touchée pendant ces tests (vérifié).
- **Appliqué en prod après accord de Mathieu** : mêmes compteurs (159 actives / 9 tracked / 0 exclue), 168/168 avec `merchant_sku`, `raw_attributes` et `product_id`, 4726 produits (= branche), 9 lignes d'observation `tracked`. Statuts `deals` en prod : 4272 active / 338 expired / 29 invalid / 9 tracked.
- `tsc`, `eslint` propres ; `test:unit` 78 tests passent (échec préexistant sans rapport sur `tracking.test.ts`, `DATABASE_URL` non chargé par vitest).
- `JOURNAL_SESSIONS.md` dépassait 150 lignes (155) : sessions du 2026-09-27 archivées telles quelles (`archive/JOURNAL_SESSIONS_2026-09-27-reperage_a-preparation-R2.md`).
- Point noté : les scripts se lancent avec `node --env-file=.env.local` qui **n'écrase pas** un `DATABASE_URL` déjà défini dans l'environnement — permet de viser une branche Neon (`DATABASE_URL=<branche> node --env-file=.env.local scripts/scraping/<marchand>.ts`) pour les vérifications des étapes R3.5-R3.11.
- Prochaine étape : **R3.5** (Tennis Point FR) selon l'ordre proposé par `R3_cadrage.md`, ou R3.13, au choix de Mathieu. Nouvelle session Sonnet. **Arrêt** (une étape de build par conversation).

## 2026-09-28 (session desktop Opus puis Sonnet) — Questions sur R3.4, `tracked` et verdict Phase 4 noté

- Session de questions après R3.4 (aucun code). Explications données : 9 `tracked` seulement parce que le script ne lit que la collection outlet (R3-Q3, pas de catalogue complet avant Phase 4-bis) ; les offres `active` ET `tracked` alimentent `price_observations` via le trigger (statut = affichage, pas suivi du prix).
- Question de Mathieu : une offre `tracked` sans prix barré mais sous la moyenne doit-elle s'afficher ? Rien d'acté (D-2026-09-25-21 les exclut du site ; la Phase 4 prévoit un badge/filtre, pas l'apparition). Confirmé : **n'influence pas R3** (collecte seulement).
- Noté à la demande de Mathieu : GAP-2026-09-28-01 (`GAPS_OUVERTS.md`) et paragraphe « Question ouverte » en Phase 4 de `CADRAGE_vrais-bons-plans.md`. Bloquant seulement pour le cadrage de la Phase 4. Passage Opus → Sonnet à la demande de Mathieu pour cette mise à jour de doc.
- Rien de commité (les modifications s'ajoutent à la branche `feat/r3-4-tecnifibre`, dont la PR n'est pas encore ouverte).

## 2026-09-28 (session desktop Sonnet) — R3.5 : script Tennis Point FR réécrit sur `lib/ingest.ts`

- Reprise (`/clear`). Modèle actuel = recommandé (Sonnet, exécution d'une spec validée). Mathieu choisit R3.5.
- `scripts/scraping/tennis-point-fr.ts` réécrit sur `ingestOffer` / `evictMerchantOffers` (même schéma que Tecnifibre R3.4). Capture sans requête supplémentaire : `merchant_sku` (SKU de la 1re variante), `raw_attributes` (variantes : libellé, SKU, poids). Pas de `barcode` dans le JSON Shopify (vérifié sur ~1900 variantes) : GTIN pour R3.12.
- Vérifié d'abord sur la branche Neon `test-r3-5-tennis-point` (supprimée après accord de Mathieu) : 2349 actives, 0 tracked (les deux collections ne contiennent que des articles remisés, chemin `tracked` non exercé ici, mais code identique à Tecnifibre), SKU et `raw_attributes` sur 100 % des actives, relance idempotente. Puis appliqué en prod après accord : mêmes compteurs, 114 offres expirées (dérive du catalogue marchand, pas un effet du script). Prod `deals` : 4193 active / 452 expired / 29 invalid / 9 tracked.
- Bug trouvé par la vérification : le marqueur « advantage » de `SHOE_LIFESTYLE_MARKERS` excluait la On The Roger Advantage Pro (vraie chaussure de tennis, confirmé par Mathieu), déjà passée en `invalid` au backfill R3.3. Corrigé dans `checkExclusion` (« roger advantage » neutralisé avant le test) + 1 test ; relance du script en prod : offre repassée `active`. Les autres « Advantage » invalides (adidas Sport 2000) sont bien des chaussures de ville.
- `tsc`/`eslint` propres, 79 tests unitaires (même échec préexistant sur `tracking.test.ts`).
- Prochaine étape : **R3.6** (Sport 2000, GTIN exposé par Algolia) ou R3.13, au choix de Mathieu.

## 2026-09-28 (session desktop Sonnet) — R3.6 : script Sport 2000 réécrit sur `lib/ingest.ts`

- Reprise (`/clear`) : `git fetch` d'abord (PR #98 mergée, `master` mis à jour). Modèle actuel = recommandé (Sonnet, exécution d'une spec validée). Mathieu choisit R3.6.
- Question posée à Mathieu : garder ou retirer le filtre Algolia `percent_discount > 0` (le retirer ferait passer ≈ 270 articles sans remise, dont toutes les raquettes, en `tracked`). Réponse : **garder le filtre** (lecture stricte de R3-Q3) → aucun `tracked` réel ; le catalogue complet reste pour la Phase 4-bis.
- `scripts/scraping/sport2000.ts` réécrit sur `ingestOffer` / `evictMerchantOffers`. Capture sans requête supplémentaire : `ean` → `gtin`, `ref` → `merchant_sku`, `raw_attributes` (tailles, facette genre, couleur, attributs). Articles sans image désormais ignorés (comme Tennis Point FR) au lieu d'être insérés avec `image_url` nul (0 cas constaté).
- Vérifié sur la branche Neon `test-r3-6-sport2000` : 153 actives (GTIN, SKU et `raw_attributes` sur 100 %), 13 exclues « chaussure de ville » = les 13 `invalid` déjà en base, 2 expirées (dérive du catalogue), 153 observations de prix, relance idempotente (0 expirée). Puis appliqué en prod après accord de Mathieu : mêmes compteurs ; `deals` prod : 4194 active / 455 expired / 28 invalid / 9 tracked.
- Constat (GAPS, GAP-2026-09-25-11) : « bracelet » absent du motif « textile porté » (2 Bracelets restent en `accessoires`) ; lexique déjà validé, non modifié, à trancher par Mathieu.
- `tsc`/`eslint` propres ; `npm test` : mêmes 4 échecs de tests de contrat (dépendants de la base) avec et sans ce changement.
- Prochaine étape : **R3.7** (SportSystem) ou R3.13, au choix de Mathieu.

## 2026-09-29 (session desktop Sonnet) — R3.7 : script SportSystem réécrit sur `lib/ingest.ts`

- Reprise. Modèle actuel = recommandé (Sonnet, exécution d'une spec validée). Mathieu choisit R3.7. Mode auto des permissions indisponible en début de session (classifieur en erreur), permissions accordées à la main par Mathieu.
- `scripts/scraping/sportsystem.ts` réécrit sur `ingestOffer` / `evictMerchantOffers`. Inspection réelle d'une page de liste et de fiches : le `data-product` de la fiche (déjà chargée pour la marque) expose `reference` (→ `merchant_sku`), `attributes[].ean13` (→ `gtin`, renseigné sur une partie des articles seulement) et `features` (poids, tamis, plan de cordage, équilibre…) → `raw_attributes` avec les déclinaisons. Le `mpn` JSON-LD recopie la référence marchand : non capturé. Décodage de secours windows-1252 pour les fiches non UTF-8 (« cm² »).
- Filtre par pages promo conservé (R3-Q3) : les cartes à prix de base <= prix passent désormais à `ingestOffer` (`tracked` possible) au lieu d'être ignorées, mais aucune n'a été constatée (0 `tracked`).
- Vérifié sur la branche Neon `test-r3-7-sportsystem` (créée le matin même, intacte) : 764 actives (SKU 749, GTIN 302, `raw_attributes` 764, caractéristiques 658, 0 caractère corrompu), 15 expirées (dont 11 nouvelles = dérive du catalogue), relance idempotente (0 expirée). Puis appliqué en prod après accord de Mathieu : mêmes compteurs ; `deals` prod : 4190 active / 466 expired / 28 invalid / 9 tracked.
- `tsc`/`eslint` propres ; `npm test` non relancé.
- Prochaine étape : **R3.8** (Babolat) ou R3.13, au choix de Mathieu.

## 2026-09-29 (session desktop Sonnet) — R3.8 : script Babolat réécrit sur `lib/ingest.ts`

- Reprise. Modèle actuel = recommandé (Sonnet, exécution d une spec validée). Mathieu : « On continue R3.8 ».
- `scripts/scraping/babolat.ts` réécrit sur `ingestOffer` / `evictMerchantOffers`. Inspection réelle : `data-pid` de la carte = `sku` = `mpn` du JSON-LD (référence marchand, `merchant_sku` ; `mpn` non capturé) ; aucun GTIN ni code-barres dans la fiche. `raw_attributes` = étiquette, bénéfices, coloris de la carte (sans requête supplémentaire). Aucune promo : les articles sans remise passent en `tracked` (R3-Q3) au lieu d être ignorés.
- Défaut préexistant corrigé : la 1re page d une catégorie renvoie 23 blocs pour `sz=24` (raquettes : 23/24/24/20 = 91), ce qui déclenchait l arrêt `< PAGE_SIZE` ; arrêt désormais sur page vide + dédoublonnage par URL. Raquettes passent de 23 à 91.
- Incident de session : un premier patch scripté a transformé des `\s` en `s` (titres « tenni », « Boo t » sur la branche) ; détecté à la vérification en base, corrigé, relancé. Rien en prod avant correction.
- Vérifié sur la branche Neon `test-r3-8-babolat` : 350 tracked (SKU 350, `raw_attributes` 350, GTIN 0, 0 titre cassé, 0 sans produit, relance idempotente), 20 expirées. Appliqué en prod après accord de Mathieu (branche supprimée) : Babolat 350 tracked / 20 expired ; `deals` prod : 4190 active / 185 expired / 28 invalid / 359 tracked.
- `tsc`/`eslint` propres ; `npm test` non relancé.
- Prochaine étape : **R3.9** (Tennispro.fr) ou R3.13, au choix de Mathieu.

## 2026-09-29 (session desktop Sonnet) — R3.9 : script Tennispro.fr réécrit sur `lib/ingest.ts`

- Reprise. Modèle actuel = recommandé (Sonnet, exécution d une spec validée). Mathieu : « On reprend R3.9 ».
- `scripts/scraping/tennispro.ts` réécrit sur `lib/ingest.ts` ; `merchant_sku` = identifiant Magento de la carte (675/675, aussi suffixe de l'URL), `mpn` lu dans le `dataLayer` de la page catégorie (279/675, soit 41 % : le `dataLayer` ne couvre que les 10 premiers articles de chaque page de 25 ; le reste relève de R3.12), `raw_attributes` (identifiant Magento, coloris, taille, marque et nom bruts) sans requête en plus ; aucun GTIN (R0). Toutes les offres de l'outlet ont un prix barré : 0 `tracked` réel, le chemin `tracked` (carte sans prix public) est codé mais non exercé sur des données réelles. Vérifié sur branche Neon `test-r3-9-tennispro` puis en prod : Tennispro.fr 675 active / 13 expired / 11 invalid ; 11 offres exclues (`accessoire_hors_sujet` : médailles, mug, cahier). Relance d'idempotence non faite (upsert sur `merchant_id, affiliate_url`, comme R3.7/R3.8).
- Inspection réelle (1 requête, robots.txt respecté) de `outlet/accessoires.html` : 25 cartes, toutes avec prix public ; `view_product_N` = identifiant Magento ; `dataLayer.push({"products":[...]})` avec `magento_id`, `mpn`, `color`, `size` pour 10 cartes sur 25.
- Passage réel sur la branche Neon : ~40 min (crawl-delay 60 s, 7 catégories), puis identique en prod. Le lancement prod a d abord été refusé par le classifieur du mode auto (écriture en base partagée) ; règle `Bash(node --env-file=.env.local scripts/scraping/tennispro.ts)` ajoutée dans `.claude/settings.local.json` (non versionné) à la demande de Mathieu, puis lancement.
- `deals` prod : 4203 active / 198 expired / 28 invalid / 359 tracked. `tsc`/`eslint` propres ; `npm test` : mêmes 4 échecs préexistants (`catalog-query`, `product-suggestions`), identiques sans le changement.
- Prochaine étape : **R3.10** (Head) ou R3.13, au choix de Mathieu.

## 2026-09-29 (session desktop Sonnet) — R3.10 : script Head réécrit sur `lib/ingest.ts`

- Reprise. `git fetch` : branche locale en retard (PR #103 mergée), passage sur `master` à jour. Modèle actuel = recommandé (Sonnet). Mathieu a choisi R3.10 (question posée, réponse reçue).
- Inspection réelle (Playwright) : cartes Head = 48 par page, prix présents sur 8 cartes seulement au chargement de la page 1 (hydratation client pour le reste), `data-index` = identifiant Magento, SKU = suffixe numérique de l'URL (absent pour balles et quelques accessoires), pas de GTIN/mpn, `__NEXT_DATA__` limité à 8 articles en page 1 (non utilisé), aucune remise sur raquettes, cordages, chaussures.
- Décision mineure (raisonnement ci-dessus, non structurante) : `merchant_sku` = SKU seulement, jamais l'identifiant interne (celui-ci va dans `raw_attributes`), pour ne pas mélanger deux identifiants dans la même colonne.
- Vérifié sur branche Neon puis en prod : 523 offres Head (100 active, 423 tracked, 1 expired), 0 doublon, une observation de prix par offre. `deals` prod : 4237 active / 199 expired / 28 invalid / 782 tracked. Le lancement prod n'a pas été bloqué (règle `mcp__claude_ai_Neon__run_sql` déjà en place ; le script est lancé via `node`, sans blocage constaté).
- Prochaine étape : **R3.11** (Amazon) ou R3.13, au choix de Mathieu.

## 2026-09-29 (session desktop Sonnet) — R3.11 : script Amazon réécrit sur `lib/ingest.ts`

- Reprise. `git fetch` : PR #104 (R3.10) mergée, passage sur `master` à jour. Modèle actuel = recommandé (Sonnet). Mathieu a choisi R3.11 (question posée, réponse reçue) et demandé de vérifier que les liens d'affiliation sont bien pris en compte : confirmé dans le code (`?tag=${AMAZON_ASSOCIATE_TAG}`, garde sur la variable, clé d'upsert `merchant_id, affiliate_url`) et `AMAZON_ASSOCIATE_TAG` présent dans `.env.local`.
- Décision mineure (non structurante) : `merchant_sku` = ASIN, jamais dans `gtin` ; filtres de pertinence Amazon conservés, seul le filtre « sans remise » disparaît (→ `tracked`, R3-Q3).
- Vérifié sur branche Neon puis en prod (accord de Mathieu pour l'application prod et la suppression de la branche) : 41 active + 12 tracked, tous `?tag=` et SKU = ASIN, 0 doublon. `deals` prod : 4241 active / 206 expired / 28 invalid / 794 tracked.
- Prochaine étape : **R3.13** ou **R3.12**, au choix de Mathieu.

## 2026-09-29 (session desktop Sonnet) — R3.12 : enrichissement par fiche (GTIN, mpn)

- Reprise. Modèle actuel = recommandé (Sonnet, R3.12 marquée Sonnet dans `R3_cadrage.md`). R3.11 déjà fusionnée (#105), branche `feat/r3-12-enrichissement` depuis `master`.
- Inspection réelle des fiches : Tennis Point FR = `ProductGroup.hasVariant[].gtin` (un par variante) ; Tecnifibre = `Product.offers[].gtin13` ; Tennispro.fr = `dataLayer.push({"product":{…"mpn"}})`. robots.txt : aucun délai pour Tennis Point FR (2 s de politesse), 1 s Tecnifibre, 60 s Tennispro.
- Décisions mineures (non structurantes) : périmètre raquettes + chaussures (celui du coût mesuré en R0 §1bis) ; `gtin` = GTIN de la 1re variante qui en a un (cohérent avec `merchant_sku`), tous dans `raw_attributes.enrichissement.variants` ; marqueur `enrichissement` même si la fiche ne donne rien (une seule lecture par offre) ; pas de marqueur sur erreur réseau (retenté), arrêt après 5 échecs consécutifs. Un GTIN doit être numérique de 8, 12, 13 ou 14 chiffres (le `barcode` de 11 chiffres de Shopify Tecnifibre est rejeté).
- Défaut découvert : `upsertDeal` écrasait `gtin`, `mpn` et `raw_attributes` à chaque passage, ce qui aurait effacé l’enrichissement au scraping suivant. Corrigé (`COALESCE` sur `gtin`/`mpn`, fusion jsonb de `raw_attributes`) ; vérifié : un passage complet de `tecnifibre.ts` conserve les 19 GTIN et les 25 marqueurs.
- Vérifié sur branche Neon `test-r3-12-enrichissement` (Tecnifibre 19/25, Tennis Point FR 2/3, Tennispro 2/2, relance à 0 fiche) puis en prod après accord de Mathieu : Tecnifibre 19/25, Tennis Point FR 494/510, Tennispro 150/150 (aucun échec). `deals` prod inchangé : 4241 active / 206 expired / 28 invalid / 794 tracked. Branche supprimée.
- À noter pour R4 : le `mpn` Tennispro vaut parfois le `sku` interne (ex. fiche Dunlop FX 500 : sku = mpn = 10335789) ; à traiter au rapprochement, non filtré ici. Une fiche Tennis Point FR expose `mpn` = `sku` (non capturé).
- `tsc`/`eslint` propres ; 86 tests unitaires passent (dont 6 nouveaux) ; `tracking.test.ts` échoue sous `test:unit` faute de `DATABASE_URL` (préexistant).
- Prochaine étape : **R3.13** (filtre UI des sous-catégories).

## 2026-09-29 (session cloud) — R3.13 : filtre des sous-catégories d'accessoires, R3 terminé

- Reprise dans la session cloud (demande de Mathieu : « on reprend avec R3.13 »). Branche locale en retard de 14 PR (R3.1 à R3.12 faites entretemps en desktop) : resynchronisée sur `origin/master`. Un brouillon non commité de `scripts/scraping/sportsystem.ts` (ancienne tentative de R3.7, remplacée par la PR #101) mis de côté dans un `git stash`, pas commité.
- Modèle : Opus au lieu de Sonnet recommandé (R3.13 marquée Sonnet dans `R3_cadrage.md`) ; écart non signalé en début de tâche, noté ici conformément à CLAUDE.md.
- Construit : `SUBCATEGORY_VALUES` / `SUBCATEGORY_LABELS` / `isValidSubcategory` (`lib/filters.ts`), valeur d'URL `autres` pour `subcategory IS NULL` ; `buildCatalogHref` garde `subcategory` seulement si `category=accessoires` ; condition SQL dans `getCatalogDeals` (paramétrée) ; `getAccessorySubcategoriesWithDeals` (sous-catégories avec offres visibles) ; composant `SubcategoryFilter` (réutilise `FilterPills`, exporté de `gender-age-filter.tsx`) ; `subcategory` transmise par la recherche, le tri, la pagination et le bandeau de notification.
- Vérifié : `tsc`/`eslint` propres ; 105 tests unitaires passent (10 nouveaux, dont un test d'alignement liste UI / type de config / CHECK de la migration 007) ; `tracking.test.ts` exige `DATABASE_URL` (préexistant, passe avec une URL factice). Requêtes vérifiées en lecture seule sur la prod : 305 accessoires visibles = sacs 151 + protection_soins 63 + grips_surgrips 30 + autres 28 + balles 27 + antivibrateurs 6 ; `accessoires_cordage` (0 offre) masquée. `next build` compile ; le pré-rendu de `/sitemap.xml` échoue sans vraie base (attendu, la CI a `DATABASE_URL`). **Rendu visuel non vérifié** (pas de base accessible au serveur de dev dans cette session).
- GAP-2026-09-25-11 résolu (étapes 1 à 6 faites) et retiré de `GAPS_OUVERTS.md` ; GAP-2026-09-25-19 mis à jour (R3 fait).
- **R3 terminé.** Prochaine étape : **R4** (moteur en mode fantôme), à cadrer d'abord, sur Opus.
- **Relecture Opus de R3.13 (demande de Mathieu), même session** : un défaut corrigé. Les suggestions de recherche ignorent la sous-catégorie ; cliquer sur une suggestion depuis « Balles » (ex. un sac Pure Aero) relançait la recherche avec le filtre Balles, donc 0 résultat. Désormais un clic sur une suggestion abandonne la sous-catégorie ; une recherche tapée la garde (comme sexe et âge). Test de contrat ajouté (`tests/contract/catalog-query.test.ts` : filtre `sacs`, `autres`, sous-catégorie ignorée hors accessoires et valeur inconnue ignorée) ; il demande la vraie base, donc non lancé ici (la CI ne lance que les tests unitaires). Limite connue, laissée telle quelle : les pills proposées ne tiennent pas compte des filtres sexe, âge et recherche actifs (une pill peut mener à une liste vide, qui affiche alors l'état vide habituel).


## 2026-09-29 (session cloud, Opus) — Cadrage de R4

- Explication à Mathieu du fonctionnement de R3 et de son état réel (requêtes en lecture seule sur la prod) : capture opérationnelle sur les 8 marchands, mais passages lancés à la main uniquement (Phase 2 non construite), clé produit texte inchangée (5 produits multi-marchands), 2 GTIN seulement partagés entre marchands. Exemple Pure Aero vérifié : titres différents entre Babolat et SportSystem, et Pure Aero absente de Tennis Point FR / Amazon (pages promo seulement).
- Cadrage R4 rédigé : `R4_cadrage.md`. Mesures faites avec les fichiers `config/` de R2 (script jetable, scratchpad, lecture seule) : reconnaissance de famille 92 % raquettes, 98 % cordages et chaussures, 0 % textile (57 % des offres) ; 104 familles chez ≥ 2 marchands ; non-reconnus surtout les nouveautés du site Head. Génération rarement écrite → la règle stricte bloque « identique » (R4-Q4). `grams` Tennis Point FR = poids d'expédition (corrige R0 §1). Référence SportSystem : contradiction R1 §8.3 / R3.7 à vérifier (R4-Q7).
- Questions posées une par une (demande de Mathieu), avec leurs implications : toutes les propositions retenues (D-2026-09-29-01).
- Aucune modification de code ni de base. **Prochaine étape : R4.1**, nouvelle session Sonnet.

## 2026-09-29 (session cloud, Sonnet) — R4.1 : jeu R1 figé, banc de mesure, migration écrite (non appliquée)

- Reprise. Modèle actuel = recommandé (Sonnet, exécution d'une spec validée, R4.1 marquée Sonnet dans `R4_cadrage.md`). Mathieu : « On attaque R4.1 ».
- Jeu R1 figé : les 134 références de paires (123 offres distinctes, certaines partagées entre paires) retrouvées en prod par marchand + titre exact (lecture seule). Règle de choix quand plusieurs offres ont le même titre : prix remisé identique au CSV, puis statut `active`, puis la plus ancienne. Trois prix ont dérivé (Tennis Point FR) mais le titre suffit à identifier l'offre. Fixture `tests/fixtures/r1-jeu-fige.json` : par offre `marchand`, `titre`, `marque`, `categorie`, `statut`, `gtin`, `mpn`, `merchant_sku`, `raw_attributes` ; par paire la décision finale (32 identiques / 15 proches / 20 différents, `R1_mesure.md` §10) et la sortie de l'algorithme actuel mesurée en R1.
- Banc de mesure `tests/unit/r1-banc-mesure.test.ts` (sans base) : rejoue `extractModel` + `normalizeProductKey` sur la fixture ; 5 tests passent : jeu complet, sortie identique à la référence pour les 67 paires, précision 5/8, rappel 5/32, inter-marchands 2/29. `tsc` et `eslint` propres.
- Migration `scripts/migrations/008_match_engine_tables.sql` écrite : `match_runs`, `match_offer_attributes`, `match_models`, `match_offer_links` (R4-Q1), additive, `ON DELETE CASCADE` depuis `match_runs` pour le recalcul complet. Choix de conception non dictés par le cadrage (à revoir en R4.4 si besoin) : clés `(run_id, deal_id)`, `method` limitée à gtin / reference / signature / approche, `score` entre 0 et 1, signature unique par passage.
- **Incident : le connecteur Neon s'est déconnecté (réauthentification demandée) juste avant l'essai de la migration sur une branche.** Migration donc ni testée ni appliquée. À faire : rétablir le connecteur, tester sur une branche Neon, appliquer en prod avec l'accord de Mathieu, supprimer la branche.
- Prochaine étape : finir R4.1 (application de la migration), puis **R4.2**.

## 2026-09-29 (session cloud, suite) — R4.1 terminé : migration 008 appliquée en prod

- Point d'étape demandé par Mathieu (« on en est où ? ») : constat que la branche portait 4 commits R4 faits dans une autre session ; GitHub renvoyait des erreurs 503 (état des PR non vérifiable). Question posée à Mathieu : appliquer la migration 008 en prod puis supprimer la branche de test `test-r4-1-match-tables` ; réponse **oui**.
- **Erreur de ma part, corrigée dans la même session** : j'ai affirmé un instant que cette branche n'existait pas, sans avoir vérifié. Elle existait : créée par Mathieu depuis la console Neon à 14h27 UTC, avec la migration déjà appliquée dessus. Vérifié avant d'agir (`list_branches`), rien n'a été fait sur la base de l'affirmation fausse.
- Essai sur la branche : structure conforme au fichier (7 index, 14 contraintes, clés étrangères en cascade), insertion réelle d'un passage complet (run, attributs, modèle, lien) puis suppression du run : plus aucune ligne enfant ; `method = 'mauvaise-methode'` rejeté. Branche de test polluée seulement par cet essai, supprimée ensuite.
- Application en prod par une transaction unique (6 instructions, tout ou rien) sur la branche `main` ; résultat identique à la branche testée (4 tables, 7 index, 14 contraintes, 0 ligne) ; `deals` inchangé (5269 lignes, 4241 `active`, 794 `tracked`). Branche `test-r4-1-match-tables` supprimée ; il ne reste que `main`.
- **R4.1 terminé.** Prochaine étape : **R4.2** (extraction des attributs raquettes + cordages, `lib/matching/`, Sonnet), dans une nouvelle session.


## 2026-09-29 (session cloud, Sonnet) — R4.2 : extraction des attributs raquettes + cordages

- Reprise (« On reprend 4.2 »). Modèle actuel = recommandé (Sonnet, R4.2 marquée Sonnet dans `R4_cadrage.md`).
- Construit `lib/matching/` (fonctions pures, sans base) : `text.ts` (normalisation), `families.ts` (alias le plus long, même marque et catégorie, `BRAND_ALIASES` pris en compte), `shared.ts` (GTIN valide, `mpn` recopié du SKU écarté, lot, cadeau, génération, version, édition), `racquets.ts`, `strings.ts`, `index.ts` (`extractOfferAttributes`). Chaque attribut garde sa source (`fiche_marchand` pour la fiche SportSystem, sinon `titre_description`). Non lus volontairement : le poids `grams` de Tennis Point FR (poids d'expédition), toute génération non écrite (jamais déduite).
- Attributs : famille, version, génération (+ année), tamis, poids, plan de cordage, longueur (pouces, « + » = 27,5), junior, cordée, édition, lot, cadeau ; cordages : jauge (mm, ou centièmes après le nom), longueur (m), conditionnement (≤ 13 m garniture, sinon bobine), matière. Longueur < 5 m jugée fausse (alerte `longueur_douteuse`, paire R1 67).
- Défaut trouvé et corrigé en cours : « 16/19 » lu comme taille junior 19 (âge désormais lu après retrait du plan de cordage).
- Tests : `tests/unit/matching-extraction.test.ts` (24) ; les 63 offres raquettes/cordages du jeu R1 sont toutes reconnues, les pièges des paires (3, 4, 7, 11, 38, 45, 64…) sont séparés par le bon attribut. `tsc` et `eslint` propres ; 124 tests unitaires passent (`tracking.test.ts` exige `DATABASE_URL`, préexistant).
- Vérifié en lecture seule sur la prod : référence SportSystem (R4-Q7) et non-reconnus Head raquettes → `R4_2_complement_referentiel.md`, **à valider par Mathieu** ; aucune écriture en base, référentiel inchangé.
- Limite : liste complète des non-reconnus sur toute la prod pas faite ici (pas de `DATABASE_URL` dans le processus, résultats SQL non exportables) ; elle sortira du rapport de passage de R4.4.
- Prochaine étape : réponses de Mathieu (compléments Head, copie SportSystem → `mpn`), puis **R4.3** (chaussures + accessoires).

## 2026-09-29 (même session, Opus) — R4.2 : décisions de Mathieu et relecture

- Passage sur Opus à la demande de Mathieu (« Tu me conseilles quoi ? »), décision à valider. Conseil donné et retenu (**D-2026-09-29-02**) : six familles Head ajoutées au référentiel ; référence SportSystem lue par le moteur au lieu d'être copiée dans `mpn` (révision de R4-Q7, aucune écriture en base).
- Code : `referencesFabricant` (liste avec source) remplace `referenceFabricant` ; `mpn` nettoyé + `reference` de chaque variante SportSystem.
- Relecture Opus du code R4.2, trois défauts corrigés : (1) un nom collé aux chiffres n'était pas reconnu ou perdait sa version (« SX300 », « FX500 », « T-Fight 300S » : la limite lettres/chiffres compte désormais comme limite de mot, et l'alias retiré avant de lire la version est le plus court présent) ; (2) « livraison offerte » aurait été lu comme un cadeau ; (3) classe de caractères inutile dans la lecture « cordée ». Tests ajoutés (130 tests unitaires passent, `tsc`/`eslint` propres).
- Points laissés pour R4.4 (comparaison) : (a) le tamis de la fiche SportSystem peut différer d'un pouce de l'annonce du fabricant (Pure Aero Rafa : « 640 cm² / 99 sq. in. », vendue en 100) ; une tolérance casserait Pure Strike 97 / 98 (paire R1 4), donc à traiter au cas par cas dans le rapport ; (b) les jauges américaines (« RPM Blast 17 ») ne sont pas lues (conversion en mm non fiable selon la marque) : jauge inconnue → « proche » ; (c) les nouvelles règles de limite de mot n'ont été vérifiées que sur le jeu R1 et les tests, pas sur toute la prod (rapport de passage R4.4).
- Prochaine étape : **R4.3** (chaussures + accessoires), nouvelle session Sonnet.

## 2026-09-29 (session cloud, Sonnet) — R4.3 : extraction des attributs chaussures + accessoires

- Reprise (« On reprend à R4.3 »). Modèle actuel = recommandé (Sonnet, R4.3 marquée Sonnet dans `R4_cadrage.md`).
- `lib/matching/` : `shoes.ts` (genre, âge, surface, largeur, génération, version, édition), `accessories.ts` (balles : niveau, pression, conditionnement en nombre de balles ; grips : type et pièces ; antivibrateurs ; sacs : format, contenance), `families.ts` choisit le référentiel par catégorie (`familiesFor`) et, pour les accessoires, restreint aux familles de la sous-catégorie ; `index.ts` prend en charge chaussures et accessoires (textile : R4.5).
- Genre : fiche Sport 2000 (`donnees_structurees`) sinon titre, alerte si contradiction ; marqueurs d'une lettre du référentiel ignorés.
- Tests : `tests/unit/matching-extraction-r43.test.ts` (14) ; toutes les offres chaussures et sacs / grips / balles / antivibrateurs du jeu R1 sont reconnues, pièges des paires 14, 16, 20, 24, 26, 33, 37, 49, 51, 53, 61, 22-23 séparés par le bon attribut. Un test R4.2 (catégorie refusée) passe du cas chaussures au cas textile. 145 tests unitaires passent, `tsc` et `eslint` propres.
- Complément du référentiel et points à valider : `R4_3_complement_referentiel.md` (surface « CL », attribut `type_sac`, lecture de `lot`).
- Limite : pas de mesure sur toute la prod (pas de `DATABASE_URL`, mot de passe privilégié non demandé) ; la liste des non-reconnus sortira du rapport de passage R4.4.
- Prochaine étape : réponses de Mathieu sur `R4_3_complement_referentiel.md`, puis **R4.4** (comparaison, cascade, script fantôme, rapport), Sonnet.

## 2026-09-29 (session cloud, Sonnet) — R4.4 : comparaison, cascade, regroupement, script fantôme, rapport

- Reprise (« On reprend R4.4 »). Modèle actuel = recommandé (Sonnet, R4.4 marquée Sonnet dans `R4_cadrage.md`). Réponses de Mathieu sur `R4_3_complement_referentiel.md` non reçues : `type_sac` ajouté provisoirement, listé à valider.
- `lib/matching/compare.ts` : `compare(a, b)` → identique / proche / différent (+ méthode, conflit, comparable, différences) ; étape 1 GTIN puis référence fabricant (contradiction franche = conflit, jamais fusionné), étape 2 rôles de `CATEGORY_RULES`, règle des générations (R4-Q4 mixte), poids ±10 g ; `signature()` construite pour que même signature ⇔ identique à l'étape 2 (testé sur les 123 offres du jeu R1). `cluster.ts` : composantes connexes GTIN / référence / signature, attributs canoniques par source la plus fiable, conflits et modèles incohérents signalés, déterministe. `report.ts` : compteurs, couverture publiée deux fois (R4-Q3), blocages par cause, non-reconnus par marque, CSV. `scripts/matching/shadow-run.ts` (`npm run match:shadow -- [--dry-run] [--out] [--keep-runs]`) : lit `active` + `tracked`, écrit les 4 tables `match_*` en un passage complet (nettoyé en cascade si échec), supprime les passages précédents. Imports de `lib/matching/` passés en relatifs `.ts` (le script tourne sous `node`, sans alias `@/`).
- **Première mesure sur le jeu R1** : précision **9/10** (5/8 avant), rappel **9/32** (5/32), inter-marchands **8/29** (2/29), aucune paire « différent » fusionnée. Un seul faux positif : paire 14, alias `s logo damp` du référentiel. Objectif 95 % non atteint sur ce jeu ; correction proposée (`R4_4_complement_referentiel.md` §3.1). Rappel plafonné par l'information absente (textile 7, génération 8, attributs inconnus d'un côté 3, cordages 4, genre 1), pas par l'extraction : une seule paire « atteignable » manquée (63), corrigée (jauge lue dans la fiche SportSystem).
- Choix hors cadrage à valider : attributs requis des cordages (jauge, conditionnement) et des balles (nombre), garniture 11-13 m regroupée, `lot` absent = 1, `generationUnique` (aucune famille marquée), `type_sac`. Voir `R4_4_complement_referentiel.md`.
- Tests : `matching-compare.test.ts` (41), `r4-4-mesure-r1.test.ts` (11), 3 tests de jauge fiche ; 200 tests unitaires passent, `tsc` et `eslint` propres (`tracking.test.ts` exige `DATABASE_URL`, préexistant).
- **Suite de session** : Mathieu valide tous les points proposés (« je valide tout ») et demande de lancer le passage moi-même. Paire 14 corrigée : alias `s logo damp` remplacé par la version « S », `version` « proche » pour les accessoires → précision R1 **9/9**, rappel 9/32, inter-marchands 8/29.
- **Premier passage** : essai sur la branche Neon `test-r4-4-passage` (écriture complète vérifiée, `deals` inchangé : 5269 lignes), puis écriture en prod (`match_*` seulement, `deals` inchangé : 4241 `active`, 794 `tracked`). Chaîne de connexion obtenue par le connecteur Neon, passée en variable d'environnement de la commande, non écrite dans le dépôt. Résultat (`R4_4_rapport_passage.md`) : 1 456 modèles, **90 modèles ≥ 2 marchands (5 avant), 71 en `active`** ; 1 912 / 2 206 offres reconnues hors textile ; 11 conflits, 0 modèle incohérent. Passage final réécrit après la dernière règle (un seul passage en base).
- Prochaine étape : **R4.5** (textile + étape 3, Opus), nouvelle session ; décider le levier « valeur dominante » et lister les familles `generationUnique` à partir des blocages du rapport.


## 2026-09-29 (session cloud, Opus) — Contrôle de R4.1 à R4.4 et ajout de la phase de correction R4.4-bis

- Demande de Mathieu : vérifier les étapes R4.1 à R4.4, les données issues des tests et leur cohérence avec l'objectif du site. Modèle actuel = recommandé (Opus : revue, interprétation de données réelles).
- Aucune modification du code ni de la base pendant le contrôle : requêtes en lecture seule sur la prod (connecteur Neon, tables `match_*` et `deals`) et une sonde vitest temporaire, supprimée.
- **Conforme** : 200 tests unitaires, `tsc` et `eslint` propres (`tracking.test.ts` : `DATABASE_URL`, préexistant) ; jeu R1 figé (67 paires, 123 offres) et banc 5/8, 5/32, 2/29 ; un seul passage en prod, chiffres identiques au rapport (2 206 / 1 456 / 1 912) ; `deals` inchangé (4 241 `active`, 794 `tracked`).
- **Relecture des 90 modèles multi-marchands** : 5 faux regroupements (précision ≈ 94 %) : Alu Power Rough / Alu Power, Sensation Control / Comfort, Revolt Evo / Revolt Court, Vapor Pro 3 PRM / standard, Hydrosorb Comfort / Hydrosorb. Cordages : 5 des 9 modèles à plusieurs offres faux (RPM Team + Soft + Hurricane, RPM Rough + Power, West Gut MT 20 + MT 14…). Cas discutable : Avacourt 2 Y-3 réunie avec l'Avacourt 2 standard (conforme à la règle « édition = variante »).
- **Défauts confirmés** : D1 `version` absent de `CATEGORY_RULES.cordages` (RPM Blast / RPM Soft → « identique ») ; D2 « All Court » lu comme version « Court » (8 offres) ; D3 « PRM » non reconnu comme Premium (17 offres Nike) ; D4 Hydrosorb Comfort absent du référentiel ; D5 indicateur « modèles incohérents » aveugle (il réutilise `compare()`).
- **Tests** : le jeu R1 ne contient aucune paire de ces formes ; le 9/9 a été obtenu en corrigeant la paire 14 sur ce même jeu, et 9 rapprochements trouvés sont trop peu pour démontrer 95 %.
- **Raquettes** (précisé à la demande de Mathieu) : 21 modèles multi-marchands, tous SportSystem / Tennispro.fr par référence ; 0 GTIN partagé ; blocage A (génération non écrite : Head 0 / 135) et blocage B (même génération, mais poids / tamis / plan connus d'un seul côté : 29 paires Babolat / SportSystem, ex. Pure Drive Gen 11). GAP-2026-09-29-01 ouvert.
- **Décision de Mathieu (D-2026-09-29-03)** : phase de correction **R4.4-bis** ajoutée à la feuille de route avant R4.5 (`R4_cadrage.md` §4). Détail complet : `R4_4_controle.md`.
- Prochaine étape : **R4.4-bis**. Questions C-Q1 à C-Q4 à Mathieu d'abord, puis exécution en Sonnet.


## 2026-09-29 (session cloud, Sonnet) — R4.4-bis : décisions C-Q1 à C-Q4 et corrections de code

- Reprise de session : modèle actuel Sonnet, recommandé Sonnet (état) puis exécution d'une spec validée. Questions C-Q1 à C-Q4 posées une par une à Mathieu, toutes tranchées dans le sens recommandé (`DECISIONS_FONCTIONNELLES.md`, D-2026-09-29-03).
- Corrections D1 à D5, Y-3 séparée, blocage B levé ; C-Q4 vérifié sur le web (Sensation Comfort = intitulé européen du Sensation 16, équivalence à confirmer). Jeu R1 : 12/12, rappel 12/32, inter-marchands 11/29, 0 faux positif. 211 tests unitaires, `tsc`, `eslint` propres. Détail : `R4_4_controle.md` §8.
- Incident : l'outil Bash a été indisponible plusieurs tours (contrôle de sécurité sans verdict) ; aucun impact sur le dépôt, les tests ont été lancés après reprise.
- Aucune écriture en base pendant cette session.
- Prochaine étape : paires pièges dans un jeu versionné, GTIN par déclinaison (lecture seule), puis nouveau passage sur branche Neon (accord de Mathieu avant la prod), relecture des modèles multi-marchands et des ~45 paires de raquettes gagnées.
- Passage à blanc en prod (`--dry-run`, lecture seule) : 103 modèles multi-marchands (90 avant), 35 raquettes (21), cordages 3/3 justes ; D2, D3 et D4 disparus ; `modeles-multi-marchands.csv` ajouté au script. À vérifier : « x2 » des raquettes, 2 modèles divergents ; relecture complète des chaussures non faite (`R4_4_controle.md` §8.1). Chaîne de connexion passée en variable d'environnement, non écrite dans le dépôt.
- « x2 » des raquettes corrigé (pack de 2 confirmé sur la fiche prod), nouveau passage à blanc et relecture complète des 103 modèles multi-marchands : aucun faux regroupement repéré (précision observée 103/103, avant ≈ 94 %). 213 tests unitaires, `tsc` propres. Écriture en prod non faite : accord de Mathieu demandé (`R4_4_controle.md` §8.2).
- Paires pièges versionnées (11 paires, titres réels, `tests/fixtures/r4-4-bis-paires-pieges.json`) et GTIN par déclinaison (lecture seule) : 16 EAN multi-marchands, tous en chaussures, tous déjà réunis ; rien pour les raquettes (Babolat, Head, Tennispro.fr sans GTIN). 224 tests. Reste : accord de Mathieu pour écrire le passage en prod (tables `match_*`).
- Passage complet **écrit sur la branche Neon `test-r4-4bis-passage`** (1 454 modèles, 1 912 liens, `deals` inchangé) ; **écriture en prod refusée par le contrôle de sécurité** (« Production Deploy », malgré l'accord de Mathieu dans la conversation), non contournée. Prod : toujours le passage R4.4. À faire par Mathieu ou après ajout d'une règle de permission : `DATABASE_URL=<prod> npm run match:shadow`. `R4_4_rapport_passage.md` mis à jour avec les chiffres de la branche. PR ouverte pour R4.4-bis.


## 2026-09-29 (session desktop, Sonnet) — R4.4-bis : écriture du passage en prod

- Modèle actuel Sonnet, recommandé Sonnet (exécution d'une spec validée).
- Règle de permission minimale `Bash(node scripts/matching/shadow-run.ts:*)` dans `.claude/settings.json` (branche `chore/permission-match-shadow`, PR à ouvrir par Mathieu, non fusionnée).
- Passage à blanc en prod (`--dry-run`) : 5 035 offres lues, 1 454 modèles, 103 multi-marchands, 77 en active seulement, 1 912 liens : aucun écart avec l'attendu.
- Écriture réelle `npm run match:shadow` : passage `e249074a-8bb6-4f0d-b905-e240d1a80b1f`, 1 454 modèles, 1 912 liens ; ancien passage supprimé par le script.
- Vérification Neon (lecture seule, prod) : match_runs 1, match_models 1 454, match_offer_links 1 912, match_offer_attributes 2 206 ; deals inchangé (4 241 active, 794 tracked, 5 269).
- Branche Neon `test-r4-4bis-passage` : peut être supprimée (non supprimée). Prochaine étape : R4.5.


## 2026-09-29 (session cloud, Opus) — R4.5 : cadrage du textile et de l'étape 3

- Modèle actuel Opus, recommandé Opus (cadrage, interprétation de données réelles).
- Branche Git remise au niveau de master (R4.4-bis déjà fusionné, #112 à #114). Branche Neon `test-r4-4bis-passage` supprimée avec l'accord de Mathieu.
- Lecture seule sur la prod (connecteur Neon) : 2 829 offres textiles `active` + `tracked` ; Tennis Point FR 1 749 sans aucune référence ; références fabricant chez SportSystem, Sport 2000, Head, Babolat, Tecnifibre, Tennispro.fr (adidas).
- Mesures : 15 modèles réunis par la référence de style, tous justes (adidas JG0994 « Club » = « SW Stretch Woven », paire R1 17 ; Lacoste TH8917 « Core Performance » = « Sport Ultra Dry ») ; par le titre, 35 modèles exactement égaux chez ≥ 2 marchands, 316 paires proches dont 205 avec un mot en plus d'un seul côté ; prix d'origine divergent dans 7 groupes sur 35 (indice seulement).
- Une tentative de lecture par script local avec la chaîne de connexion a été refusée par le contrôle de sécurité ; les données ont été lues par le connecteur Neon. Rien n'a été écrit en base à part la suppression de la branche.
- Livrable : `R4_5_cadrage.md` (questions T-Q1 à T-Q7 ; découpage R4.5-a, R4.5-b, R4.5-c).
- Réponses de Mathieu aux questions T-Q1 à T-Q7 : toutes les propositions retenues (D-2026-09-29-04). Reclassement de la paire R1 17 laissé à R4.5-a (le jeu R1 figé des tests doit changer en même temps).
- Prochaine étape : exécution de R4.5-a en Sonnet (nouvelle session).


## 2026-09-29 (session cloud, Sonnet) — R4.5-a : extraction textile, référence de style, signature

- Reprise de session : modèle actuel Opus, recommandé Sonnet (exécution d'une spec validée, `R4_5_cadrage.md`) ; question posée à Mathieu, qui est passé sur Sonnet avant de commencer.
- Lecture seule sur la prod (connecteur Neon) pour établir le lexique : marchands et marques par volume, fréquence des mots des 2 829 titres, titres réels des paires pièges, référence de style vérifiée (15 groupes multi-marchands, tous justes ; les références SportSystem d'adidas sont des codes de coloris, égalité sur le code entier). Aucune écriture en base, aucun passage `match:shadow`.
- Code : `config/textile-lexicon.ts` (types, genre, âge, coloris, mots neutres, éditions, marques dont la référence est fiable), `lib/matching/textile.ts` (extraction), branchement dans `index.ts` (famille = `marque|type|textile`, le nom de modèle est l'attribut `modele`) et `compare.ts` (textile : `modele` requis ; en étape 1 les écarts lus dans le titre ne contredisent pas la référence ; signature sans suffixe d'offre quand la génération n'est pas écrite). `matching-rules.ts` : attributs textile `millesime`, `numero`, `longueur` (proche). Rapport et script : libellés, `ENGINE_VERSION` « r4.5-a-textile ».
- Choix d'exécution : type de tête de Sport 2000 = libellé de rayon, le vrai type est le dernier ; « Top », « capuche » et « survêtement » sont des indices faibles ; un chiffre seul dans un short Nike ou adidas (5 à 10) est une longueur ; « Carlito » seul n'est pas une édition (ligne Bidi Badu) ; titre sans type ou marque illisible = non reconnu (jamais rapproché par le titre) ; modèle sans nom lisible = jamais « identique ».
- **Point à valider par Mathieu** : « Club 25 Tech » / « Club Tech » et « Tie Break II » / « Tie Break » (millésime ou numéro écrit d'un seul côté) donnent « proche », comme le tableau du cadrage (§2.3) et ses paires pièges (§4) l'exigent. La règle Q6 de D-2026-09-28-02 (« année écrite d'un seul côté → identique ») ne joue donc plus pour le textile ; `GENERATION_RULES.textile` est inchangée mais ne reçoit plus ces marqueurs.
- Jeu R1 : paire 17 reclassée « identique » (T-Q1) ; fixture, banc de mesure de l'algorithme actuel (5/33, inter-marchands 2/30) et mesure du moteur mis à jour : **précision 20/20, rappel 20/33**, inter-marchands 19/30, 0 faux positif, les 11 paires textile au verdict attendu. Nouvelles fixtures : `r4-5-paires-textile.json` (11 paires pièges + 6 cas de référence). 266 tests unitaires passent (`tracking.test.ts` échoue sans `DATABASE_URL`, comme avant), `tsc` et `eslint` propres.
- Non fait, à R4.5-b : lexique non vérifié sur l'ensemble des 2 829 titres (échantillon de 110 relu à la main) ; le passage à blanc en prod et la relecture des modèles multi-marchands le feront.
- Prochaine étape : **R4.5-b** (Sonnet).


## 2026-09-29 (session cloud, Sonnet) — R4.5-b : étape 3 en file de revue, passage à blanc textile

- Modèle actuel Sonnet, recommandé Sonnet (exécution d'une spec validée, `R4_5_cadrage.md` §3.3 et §7).
- Code : `lib/matching/approx.ts` (`scoreModelNames`, `reviewTextilePairs`) : paires de modèles de même marque, type, genre et âge, noms de gamme différents, au moins deux marchands ; score = mots communs / mots distincts, mot distinctif connu (`TEXTILE_REVIEW_DISTINCTIVE_WORDS` : pleat, pro, slam, ann) ×0,25, mots secondaires (`TEXTILE_REVIEW_SOFT_WORDS`, vide au départ) score ≥ 0,9, prix d'origine en indice (+0,1 si ≤ 5 %, −0,15 si > 15 %). Seuil de revue 0,4. Aucune fusion, liens à score 1 inchangés. `EngineOffer.prixOrigine`, `revue-textile.csv` et compteurs dans `report.ts`, script `shadow-run.ts` (lit `original_price`, `ENGINE_VERSION` « r4.5-b-textile »). Tests : `matching-approx.test.ts` (9).
- Pas de `DATABASE_URL` dans cette session : les 2 829 offres textiles (`active` + `tracked`) ont été lues en lecture seule par le connecteur Neon, puis le moteur a tourné en local (script hors dépôt). Rien écrit en base, aucun `match:shadow`. `rapport-passage/revue-textile.csv` généré ainsi ; les autres fichiers du rapport (R4.4) ne sont pas régénérés.
- Résultat : 70 modèles textiles multi-marchands (0 avant), 118 paires en revue (60 ≥ 0,6). Relecture des 70 : aucun faux regroupement certain ; à confirmer par Mathieu : Nike Flex Victory / Victory 7in, Flex Advantage / Advantage 7in (références partagées), Djokovic Dubai / RG (édition divergente). Les 3 paires à score 1,0 sont des ordres de mots (« Tie Break » / « Break Tie », « Freelift Pro » / « Pro Freelift ») : pas fusionnées par l'étape 2 (nom comparé dans l'ordre), en tête de la file.
- Défaut corrigé : Tecnifibre « Pantalon de tennis … Legging » typé pantalon (`TEXTILE_REFINES` : pantalon → legging, collant, corsaire).
- Lexique des mots neutres : non complété (les mots en plus de la file sont à trancher par Mathieu, cadrage §3.3).
- 275 tests unitaires passent (`tracking.test.ts` échoue sans `DATABASE_URL`, comme avant), `tsc` et `eslint` propres.
- Prochaine étape : Mathieu tranche `revue-textile.csv` et les 3 cas ; puis écriture du passage en prod (accord de Mathieu) ; puis R4.5-c (Opus).

## 2026-09-29 (session cloud) — Consigne de séquence pour R4.5-b

- Demande de Mathieu : les 3 points ouverts se tranchent **en Opus, à la prochaine session, avant la PR**. Lecture retenue : les 3 modèles Nike « à confirmer » relevés à la relecture des 70 modèles textiles multi-marchands de R4.5-b (Flex Victory / Victory 7in, Flex Advantage / Advantage 7in, Djokovic Dubai / RG : réunis par la référence de style, titres divergents). À corriger si Mathieu pensait à d'autres points.
- État : PR #116 (R4.5-a) déjà fusionnée ; R4.5-b (commit `6e2b8fb`) est sur la branche `claude/cloud-credit-usage-bqgtxs`, **aucune PR ouverte pour l'instant, à ne pas ouvrir avant ces décisions**. Le point « millésime ou numéro écrit d'un seul côté » soulevé dans la PR #116 reste à confirmer aussi (règle Q6 de D-2026-09-28-02 non applicable au textile).
- Prochaine étape : session Opus, trancher les 3 modèles Nike (puis la file `revue-textile.csv`), puis PR de R4.5-b.


## 2026-09-29 (session cloud, Opus) — R4.5-b : les 3 cas « à confirmer » tranchés (D-2026-09-29-05)

- Modèle actuel Opus, recommandé Opus (interprétation de données réelles, décision de Mathieu).
- Relecture des données du passage à blanc (dump lu en lecture seule par la session précédente) : les cas Victory 7 et Advantage 7 réunissent deux générations Nike (Flex / Dri-FIT) aux références de style différentes ; même défaut sur **Victory 9**, non repéré. « Djokovic Dubai / RG » est du Lacoste avec une même référence GH5219, chez un seul marchand. Dans la file, la paire Head score 1,0 « TIE-BREAK » / « BREAK II TIE- » est en fait Tie Break II.
- Décisions de Mathieu : références Nike différentes → proche ; même référence → identique malgré le nom de tournoi ; Tie Break II à refuser. Détail et consignes de code dans D-2026-09-29-05.
- Aucun code modifié, aucune écriture en base.
- Prochaine étape : session **Sonnet** pour coder D-2026-09-29-05, relancer le passage à blanc et relire ; puis PR de R4.5-b ; puis décisions de Mathieu sur `revue-textile.csv`. Le point « millésime écrit d'un seul côté » (PR #116) reste ouvert.
