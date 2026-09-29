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
- Aucune modification de code ni de base. **En attente des réponses de Mathieu à R4-Q1..Q8.**
