# Points ouverts

## GAP-2026-09-25-19 — Produits multi-marchands distincts : 10 → 1 (OUVERT)

Point de départ chiffré du chantier de rapprochement produit multi-niveaux
(`cadrage_deals-tennis/CADRAGE_rapprochement-multi-niveaux.md`).

Nombre de produits présents chez **2 marchands distincts ou plus, avec des
offres actives** (`GROUP BY product_id HAVING COUNT(DISTINCT merchant_id) >= 2`,
distinct de la métrique « produits avec 2+ offres actives tous marchands
confondus » citée en GAP-2026-09-25-18, qui reste à 445 après retrait
ProTennis) : **10 avant le retrait de ProTennis → 1 après**. C'est cette
métrique-ci, pas les 445, qui mesure si la comparaison entre marchands —
l'un des deux différenciateurs du site — fonctionne réellement.

Cause : le rapprochement actuel repose sur une clé texte
`LOWER(brand)|LOWER(model)|category` dérivée du titre nettoyé, qui varie
trop d'un marchand à l'autre (ordre des mots, année, poids, mentions
commerciales) pour matcher entre marchands.

**Reste à faire** : chantier R0 à R5 décrit dans
`CADRAGE_rapprochement-multi-niveaux.md` (diagnostic, jeu de référence,
référentiel de modèles, capture à l'ingestion, moteur en mode fantôme,
bascule). Objectif : précision ≥ 95 % sur « même modèle », couverture
multi-marchands mesurée à chaque étape contre ce point de départ (1).

**R0 fait (2026-09-26)** : diagnostic complet, aucune modification —
voir `R0_diagnostic-rapprochement.md`. Résumé : un seul marchand (Sport
2000) expose un vrai GTIN/EAN sans requête supplémentaire ; aucun des 8
scripts ne capture aujourd'hui GTIN/mpn/SKU/quantité unitaire ; 24
exemples réels de rapprochements manqués trouvés en base, dont 4 pièges
(versions/tamis/taille junior/genre différents malgré une similarité
textuelle élevée) confirmant la nécessité de vérifier les attributs
structurés avant fusion (§3 R2/R3) ; proposition de migration additive
(`product_families`, colonnes d'attributs nullables sur `products`,
`mpn`/`unit_quantity`/`unit_type` sur `deals`, `product_merges`).

**Complément R0 fait (2026-09-26)** : vérification réelle du GTIN/EAN sur
la page produit (requête HTTP supplémentaire) pour les 7 marchands hors
Sport 2000 — voir §1bis de `R0_diagnostic-rapprochement.md`. Résultat :
Tennis Point FR et Tecnifibre exposent un vrai GTIN en JSON-LD sur la
fiche produit (non visible dans le flux Shopify déjà utilisé par les
scripts), portant à 3/8 marchands le nombre de sources GTIN fiables.
SportSystem/Babolat/Tennispro.fr confirmés sans GTIN. Head et Amazon non
testables sans Playwright (anti-bot dès la requête simple). Coût estimé
si limité aux raquettes/chaussures et aux 2 marchands avec gain réel :
~556 requêtes supplémentaires par run (majoritairement Tennis Point FR,
455 chaussures).

**R1 fait (2026-09-26)** : CSV de 24 paires candidates généré
(`R1_jeu-reference-candidat.csv`, reprise des exemples R0 §3, prix réels
vérifiés en base), avec la proposition Claude Code (11 identiques, 8
proches, 5 différents) et une colonne `decision_mathieu` vide. Mesure de
l'algorithme actuel sur ces 24 paires : 0/24 rapprochées (attendu par
construction, voir §5 de `R0_diagnostic-rapprochement.md`).

**R1 corrigé et complété (2026-09-26, session de correction)** : CSV
porté à 38 paires — corrections demandées par Mathieu (paire 10 → différent,
« L » = Lite chez Head ; note de la paire 20 reformulée), prix des paires
13/15/16 retrouvés en base (les titres du CSV initial avaient été
reconstruits depuis le modèle et ne correspondaient à aucune offre),
colonnes `niveau` (offre / variante / modèle), `piege`, `statut_prix`,
`algo_actuel`, `cle_algo_a`/`cle_algo_b` ajoutées. 8 paires témoins que
l'algorithme actuel rapproche (les 3 seuls produits inter-marchands en base
+ 5 fusions chez un même marchand) et 6 pièges supplémentaires. Mesure
réelle de `lib/product-matching.ts` : précision 5/8 (62,5 %), rappel 5/18
(27,8 %) sur « même modèle » ; faux positifs = générations différentes sous
un titre identique (Tennispro) et jauge indéterminable. Détail dans
`R1_mesure.md`.

**Bloquant sur** : validation par Mathieu du CSV R1 (colonne
`decision_mathieu`), puis complément du jeu jusqu'à 50-100 paires (§9 du
cadrage) avant de construire la cascade R2/R3.

**Statut** : ouvert au 2026-09-26 — R0 + complément terminés, CSV R1
(38 paires, mesuré) prêt pour validation de Mathieu.

---

## GAP-2026-09-26-01 — n8n : `N8N_BASIC_AUTH_*` encore pris en compte en 2.40.5 ? (OUVERT)

Le `docker-compose.yml` de la VM Oracle définit une authentification basique
via `N8N_BASIC_AUTH_*`. À vérifier (lecture seule) : ces variables sont-elles
encore lues par la version installée (2.40.5), ou ignorées depuis la gestion
d'utilisateurs intégrée de n8n ? Si elles sont ignorées, la protection
réelle de l'interface repose sur autre chose qu'on ne connaît pas encore.
Ne toucher ni au mot de passe ni au `docker-compose.yml` dans ce cadre.
Voir §6.4 de `CADRAGE_vrais-bons-plans.md`.

**Statut** : ouvert au 2026-09-26, à traiter au build de la Phase 2 (ou
avant, sur demande).

---

## GAP-2026-09-26-02 — VM Oracle sous Oracle Linux 9.8 : installation de Playwright à évaluer (OUVERT)

`cat /etc/os-release` (2026-09-26) : Oracle Linux Server 9.8 (famille EL9,
`dnf`). `npx playwright install --with-deps` ne vise que Ubuntu/Debian et ne
fonctionnera pas tel quel. Piste à évaluer (pas une décision) : faire
tourner les scrapers dans l'image Docker officielle de Playwright
(multi-arch, arm64), Docker étant déjà présent sur l'hôte. Voir §6.4 de
`CADRAGE_vrais-bons-plans.md` pour les points à évaluer.

**Statut** : ouvert au 2026-09-26, à trancher au build de la Phase 2
(point 5 de la checklist VM).

---

## GAP-2026-09-25-15 — Raquettes juniors mal classées `adulte` : correction cadrée, reste tout le code (OUVERT)

Suite à D-2026-09-25-19 : deux exemples réels signalés par l'utilisateur (Tecnifibre « T-Fight Club 25 », Head « Coco 25 » via Tennis Point FR) — raquettes juniors identifiées uniquement par leur taille en pouces (25") dans le nom de gamme, sans mot-clé enfant/junior dans le titre marchand, retombant sur `age_group = adulte` par défaut. Deux corrections actées : heuristique taille en pouces (19/21/23/25/26 = enfant, 27+ = adulte) pour la catégorie raquettes, tous marchands ; lecture de la description produit comme second signal, gratuite pour Tecnifibre/Tennis Point FR (déjà dans le payload Shopify récupéré), avec requête HTTP supplémentaire par produit pour les 6 autres marchands (coût accepté par l'utilisateur).

**Reste à faire, dans l'ordre (une étape de build par conversation)** :
1. ~~Heuristique taille en pouces dans `lib/product-matching.ts`~~ **FAIT** (2026-09-25) : `extractAgeGroup(title, category?)` prend désormais un second paramètre `category` optionnel, applique le motif `\b(19|21|23|25|26)\b` uniquement quand `category === "raquettes"`. Correction par rapport au cadrage initial : contrairement à ce qui était supposé, les 6 scripts de scraping (+ Amazon) ont dû être touchés d'une ligne chacun pour passer leur catégorie à l'appel (`config.dbCategory` / `typeInfo.category` / `category.dbCategory`) — `extractAgeGroup(title)` sans catégorie reste possible (compat `scripts/backfill-gender-age.ts`, non touché, hors périmètre ici) et se comporte comme avant (jamais enfant via taille). 5 tests unitaires ajoutés dans `tests/unit/product-matching.test.ts`, dont les deux exemples réels signalés par l'utilisateur (Tecnifibre T-Fight Club 25, Head Coco 25). `tsc`/lint/tests unitaires/build vérifiés clean.
2. ~~Lecture de la description (`body_html`) dans `scripts/scraping/tecnifibre.ts` et `scripts/scraping/tennis-point-fr.ts`~~ **FAIT** (2026-09-25) : `extractAgeGroup(title, category?, description?)` prend un troisième paramètre optionnel — titre et description concaténés avant application des mêmes motifs (décision explicite, pas de logique séparée). Découverte en cours d'étape : `tecnifibre.ts` n'appelait jamais `extractGender`/`extractAgeGroup` et n'écrivait pas les colonnes `gender`/`age_group` (contrairement aux 6 autres marchands) — corrigé dans cette même étape (décision explicite), sinon le "T-Fight Club 25" cité en exemple dans ce GAP restait non résolu. 3 tests unitaires ajoutés. `tsc`/lint/tests unitaires/build vérifiés clean.
3. ~~Backfill des raquettes déjà en base de prod mal classées~~ **FAIT** (2026-09-25) : l'utilisateur a confirmé le périmètre « raquettes + vérifier les autres catégories » avant de construire. Investigation réelle contre la base Neon de prod : 24 offres hors raquettes avec un nombre isolé 19-26 dans le titre examinées manuellement (millésimes/tailles de gamme comme "Short ... 23", "Cordage MT 19 Plus Power", jamais une taille de raquette) — confirme que restreindre l'heuristique à la catégorie raquettes (étape 1) était le bon choix, aucune extension nécessaire ailleurs. `scripts/backfill-racquet-junior-size.ts` (`npm run db:backfill-racquet-junior-size`) : recalcule `age_group` uniquement pour les produits `category='raquettes'` actuellement `adulte`, même règle de réconciliation que le backfill initial (upgrade `adulte`→`enfant` uniquement, jamais l'inverse). Vérifié réellement contre la prod : 619 produits raquettes `adulte` examinés, 30 basculés vers `enfant` (Wilson Clash/Ultra/Blade 25-26, Babolat Pure Aero/Strike 26, Tecnifibre T-Fight Tour 26, etc. — vraies gammes junior confirmées par le nom de modèle), relancé une deuxième fois (0 nouveau basculement, idempotent), échantillon contrôlé directement en base (HEAD "Coco 25" bien passé à `enfant`, l'un des deux exemples cités par l'utilisateur en D-2026-09-25-19). **Découverte non corrigée, hors périmètre de cette étape** : Tecnifibre "T-fight Club 17" reste `adulte` — la taille 17" (raquette pour très jeune enfant) n'est pas couverte par `RACQUET_JUNIOR_SIZE_PATTERN` (19/21/23/25/26 seulement), gap dans le motif déjà mergé aux étapes 1-2, voir GAP-2026-09-25-17 (mineur, nouveau). `tsc`/lint/build clean.
4. **Gelée, intégrée à R3** (2026-09-26) : extension aux 6 autres marchands (SportSystem, Sport 2000, Babolat, Tennispro.fr, Head, Amazon) via une requête HTTP supplémentaire par fiche produit. Ne plus traiter isolément — R3 (`CADRAGE_rapprochement-multi-niveaux.md` §10) réécrit les 8 scripts un par un de toute façon (capture GTIN/mpn/attributs bruts + statut `tracked`) ; cette lecture de description sera ajoutée dans la même passe pour ne réécrire chaque script qu'une seule fois.
5. **Close, obsolète** (2026-09-26) : miroir JS du workflow n8n ProTennis — sans objet depuis le retrait définitif de ProTennis (`scripts/automation/n8n-protennis-ingestion-workflow.json` supprimé du dépôt).

**Bloquant sur** : étape 4 attend R0-R2 (voir GAP-2026-09-25-19) avant d'être traitée dans le cadre de R3.

**Statut** : ouvert au 2026-09-26 — étapes 1 à 3 faites, étape 4 gelée/rattachée à R3, étape 5 close (obsolète).

---

## GAP-2026-09-25-17 — Raquettes 17" (très jeune enfant) non couvertes par l'heuristique taille en pouces (OUVERT, mineur)

Découvert en vérifiant le backfill de GAP-2026-09-25-15 étape 3 (voir ci-dessus) : `RACQUET_JUNIOR_SIZE_PATTERN` (`lib/product-matching.ts`, étape 1) ne reconnaît que 19/21/23/25/26 pouces. Or au moins un modèle réel en base ("Tecnifibre T-fight Club 17") existe en taille 17" — une taille encore plus petite, pour de très jeunes enfants, en usage réel chez les fabricants de raquettes (Babolat/Wilson/Tecnifibre proposent tous une gamme junior commençant à 17" ou 19" selon la marque). Ce produit reste classé `age_group = adulte`.

**Bloquant sur** : rien dans l'immédiat — impact d'un produit isolé constaté (pas de recherche exhaustive faite). Étendre le motif à `17` est une modification du code déjà mergé aux étapes 1-2 (GAP-2026-09-25-15) — décision mineure a priori (ajouter une valeur à une liste déjà actée), mais pas tranchée seule ici pour rester dans le périmètre de l'étape 3 (backfill, pas modification de l'heuristique). À trancher/construire dans une prochaine étape courte.

**Statut** : ouvert au 2026-09-25.

---

## GAP-2026-09-25-14 — Amazon : comparer le prix Amazon au prix barré déjà connu chez d'autres marchands (CLOS, rejeté)

Suite à D-2026-09-25-16 (filtre marque connue) : le volume Amazon réel après filtrage est tombé à 11 offres (sous le seuil de 30 de D-2026-09-24-04), en grande partie parce que la majorité des fiches Amazon sur ces mots-clés n'ont pas de remise propre affichée par Amazon lui-même (154/233 fiches candidates exclues pour cette raison au dernier passage, filtre inchangé depuis le premier build). L'utilisateur a proposé une piste : pour Amazon spécifiquement, ingérer aussi les fiches sans remise propre, et calculer une "réduction" en comparant le prix Amazon au prix de référence (`original_price`) déjà connu pour le même article chez un autre marchand (via le rapprochement produit, `product_id`), plutôt que d'exiger un prix barré publié par Amazon lui-même.

**Pourquoi c'est structurant, pas une simple option de script** :
- Change la sémantique de `discount_percentage`/`original_price` pour un marchand : plus une remise auto-portée (publiée par le marchand), mais une comparaison inter-marchands.
- Le rapprochement produit (`product_id`) se fait aujourd'hui *pendant* l'upsert d'une offre Amazon — il faudrait pouvoir interroger le prix de référence d'un autre marchand *avant*, ce qui suppose une correspondance fiable de modèle/couleur/variante (risque de comparer deux variantes différentes du même article, ex. couleurs différentes, et d'afficher une réduction trompeuse).
- Que faire quand aucun autre marchand n'a l'article (`product_id` non trouvé) : revenir au comportement actuel (skip) ou afficher sans réduction ?

**Résolution (2026-09-25, D-2026-09-25-17)** : rejeté après discussion élargie à toute la logique du site — l'utilisateur a reconfirmé que deals-tennis reste centré sur les vraies promotions, pas un comparateur de prix. Comparer Amazon à un autre marchand ne serait pas non plus une "vraie promo" (rien publié par Amazon lui-même). Comportement actuel (D-2026-09-25-16, remise propre exigée) inchangé.

**Statut** : clos (rejeté) le 2026-09-25.

---

## GAP-2026-09-25-13 — Amazon : volume sous le seuil de 30 après le filtre marque connue (RÉSOLU)

Suite à D-2026-09-25-16 : le filtre marque connue (dynamique, basé sur les marques déjà présentes chez les autres marchands) fait tomber le volume Amazon de 42 à 11 offres actives sur le passage de vérification du 2026-09-25 — sous le seuil de 30 articles tennis actifs acté en D-2026-09-24-04 (seuil qualifié de révisable dès l'origine). Décomposition réelle du tri sur ce passage : 233 fiches candidates → 154 sans remise réelle, 39 sans le mot "tennis", 3 hors tennis, 26 marque non reconnue, 11 retenues.

La piste de comparaison inter-marchands (GAP-2026-09-25-14) a été explicitement rejetée le 2026-09-25 (D-2026-09-25-17) — ne plus la proposer comme solution.

**Résolution cadrée (2026-09-25, D-2026-09-25-18)** : 7 pistes alternatives vérifiées réellement sur amazon.fr (Playwright). Retenues pour le prochain build : rayon Amazon + facette native « Tous les rabais » (`rh=n:<node_id>,p_n_deal_type:26902977031`, ID global vérifié sur 4 rayons) pour raquettes/cordages/chaussures (gain net prouvé) ; pagination des résultats (`&page=2`, fonctionne réellement) pour toutes les catégories restées en recherche par mot-clé (accessoires, textile) ; ajout de Wilson (et marques tennis notoires similaires) à la liste de marques reconnues. Voir D-2026-09-25-18 pour le détail complet des vérifications et des pistes écartées.

**Résolution (2026-09-25, PR #61)** : build fait et vérifié réellement contre la base Neon de prod. Le nœud "Chaussures femme" retrouvé en cours de build (1765106031). Résultat : 37 offres actives (contre 11 avant), au-dessus du seuil de 30. Voir `ETAT_ACTUEL.md` pour le détail complet (répartition par catégorie, vérifications).

**Statut** : résolu le 2026-09-25.

---

## GAP-2026-09-25-12 — Amazon : un item de bruit hors sujet retenu malgré le filtre positif "tennis" (RÉSOLU, superseded par le filtre marque)

Découvert en vérifiant le build Amazon (voir `ETAT_ACTUEL.md`) : la recherche par mot-clé "accessoire tennis" a remonté « decoration de gateau tennis joyeux anniversaire joueur de tennis » (une décoration de gâteau, pas un article de sport) — le titre contient bien "tennis" plusieurs fois et aucun mot-clé d'autre sport, donc ni le filtre positif ni le filet de sécurité multi-sports ne pouvaient l'exclure.

**Résolution (2026-09-25, D-2026-09-25-16)** : le nouveau filtre marque connue exclut de fait cet article (aucune marque reconnue en tête d'un titre de décoration de gâteau) — non revérifié individuellement sur ce titre précis (l'article n'est pas revenu dans les résultats de recherche du dernier passage), mais le mécanisme qui l'aurait laissé passer n'existe plus.

**Statut** : résolu le 2026-09-25 par effet de bord de D-2026-09-25-16.

---

## GAP-2026-09-25-11 — Sous-catégories d'accessoires : cadrage fait, rattaché à R2 (OUVERT)

Suite à D-2026-09-25-15 : décisions de principe actées (nouveau champ `deals.subcategory` nullable, liste `sacs`/`balles`/`antivibrateurs`/`grips_surgrips`/`accessoires_cordage`, `NULL` pour le reste, backfill complet). Aucun code écrit dans cette conversation (cadrage uniquement). Numéroté -11 (et non -10) pour éviter une collision : GAP-2026-09-25-10 est déjà pris (conflit de nom Tennisdeals), mergé sur `master` entretemps par une autre session parallèle.

**Rattaché à R2** (2026-09-26, `CADRAGE_rapprochement-multi-niveaux.md` §10, « référentiel v1 et règles de tolérance ») : la taxonomie/sous-catégorisation relève de la même famille de travail que le référentiel de modèles v1 (§7) — traiter dans la même étape plutôt qu'isolément, pour ne pas retoucher deux fois les mêmes scripts de scraping.

**Reste à faire, dans l'ordre, une fois R2 démarré** :
1. Migration (`deals.subcategory VARCHAR` + `CHECK` limité aux 5 valeurs ou `NULL`, index si utile au filtre).
2. Fonction d'extraction (`lib/product-matching.ts`, ex. `extractAccessorySubcategory`) avec le lexique vérifié en cadrage (voir D-2026-09-25-15 pour le détail par sous-catégorie et les volumes réels constatés sur les 611 offres accessoires actives de prod).
3. Script de backfill (`scripts/backfill-accessory-subcategory.ts`) sur les offres déjà en base.
4. Mise à jour des 8 scripts de scraping (dans la même passe R3 que GAP-2026-09-25-15 étape 4) pour peupler `subcategory` dès l'ingestion.
5. ~~Mise à jour du workflow n8n ProTennis~~ — **close, obsolète** (2026-09-26) : ProTennis retiré définitivement, plus de workflow n8n ProTennis dans le dépôt.
6. UI du filtre secondaire (pills sous-catégorie, visibles uniquement quand « Accessoires » est sélectionné, incluant une option « Autres accessoires » pour `subcategory IS NULL`).

**Bloquant sur** : R0-R1 du chantier de rapprochement multi-niveaux (voir GAP-2026-09-25-19).

**Statut** : ouvert au 2026-09-26 — cadré, rattaché à R2, étape 5 close (obsolète).

---

## GAP-2026-09-25-10 — Conflit de nom : un site existant s'appelle déjà « tennisdeals » (OUVERT)

Le renommage de la marque affichée « Deals Tennis » → « Tennisdeals » (D-2026-09-25-07, PR #47, 2026-09-25) a été fait avant de vérifier qu'aucun autre site n'utilisait déjà ce nom. L'utilisateur a signalé le 2026-09-25 qu'un site nommé « tennisdeals » existe déjà. Périmètre du renommage initial rappelé : uniquement la marque affichée (header/footer, métadonnées de page, pages réglementaires, `package.json`) — l'URL Vercel (`deals-tennis.vercel.app`) et le nom du dépôt GitHub n'ont pas changé, donc rien d'irréversible côté infra.

Trois options soumises à l'utilisateur le 2026-09-25, décision explicitement reportée (« note-le simplement pour le moment ») :
1. Revenir à « Deals Tennis » (annule PR #47).
2. Choisir un nouveau nom (à définir, vérifier sa disponibilité avant adoption).
3. Garder « Tennisdeals » quand même si le site existant n'est pas un vrai concurrent direct.

**Bloquant sur** : rien dans l'immédiat côté code/infra. À trancher avant toute nouvelle communication publique sous ce nom (ex. avant de solliciter de nouveaux programmes d'affiliation sous cette marque) pour éviter d'accumuler des surfaces à renommer.

**Statut** : ouvert au 2026-09-25.

---

## GAP-2026-09-25-09 — Head : items génériques non tennis-exclusifs retenus depuis la page textile (OUVERT, mineur)

Découvert en vérifiant le build Head (voir `ETAT_ACTUEL.md`) : la page `shop-sportswear/summer` ciblée pour le textile (page "Tennis and Padel" du marchand, vérifiée 100% tennis sur l'échantillon parcouru au cadrage) contient au moins un article générique sans indice tennis explicite dans son titre — « HEAD Bandana », retenu en base (catégorie textile). Le filet de sécurité multi-sports (exclusion padel/squash/badminton/pickleball) ne peut pas l'exclure, n'ayant aucun mot-clé d'autre sport non plus.

**Bloquant sur** : rien dans l'immédiat — impact d'un article isolé sur 66 offres Head, un bandana reste un accessoire plausible pour le tennis (porté par de nombreux joueurs), pas une donnée fausse à proprement parler. Même catégorie que GAP-2026-09-23-04/GAP-2026-09-25-02/04/05 (qualité de donnée mineure, isolée) — à surveiller si le volume de ce type d'item augmente lors des passages suivants.

**Statut** : ouvert au 2026-09-25.

---

## GAP-2026-09-25-08 — Miroir JS du workflow n8n ProTennis non resynchronisé après l'extension du lexique sexe/âge au pluriel (OUVERT, mineur)

Suite à D-2026-09-25-11 : le lexique partagé `extractGender`/`extractAgeGroup` (`lib/product-matching.ts`) a été étendu pour reconnaître le pluriel français ("Hommes"/"Femmes"/"Enfants"), découverte en construisant Tennis Point FR. Le workflow n8n ProTennis (`scripts/automation/n8n-protennis-ingestion-workflow.json`) contient un miroir JS de ces mêmes regex (ajouté en D-2026-09-25-04, GAP-2026-09-25-01 point 4) qui n'a pas été mis à jour dans cette conversation (hors périmètre de cette étape).

**Bloquant sur** : rien dans l'immédiat — ProTennis utilise déjà l'extraction avant la découverte de ce gap, le miroir reste fonctionnellement correct pour le singulier (pas de régression), juste pas amélioré pour le pluriel s'il apparaît dans des titres ProTennis. À resynchroniser à la prochaine intervention sur ce workflow (ex. lors du déploiement en attente, voir GAP-2026-09-25-01 point 4).

**Statut** : ouvert au 2026-09-25.

---

## GAP-2026-09-25-07 — Chantier SEO/GEO : blocs de build restants après le bloc 3 (OUVERT)

Suite à D-2026-09-25-10 : plan en 7 blocs acté (fondations techniques, données structurées, URLs canoniques, ouverture robots IA, `llms.txt`, performance, Open Graph), un bloc par conversation dédiée. Bloc 1 terminé et vérifié (D-2026-09-25-12, PR #52). Bloc 2 (données structurées) terminé et vérifié (D-2026-09-25-13, PR #54, mergée). Bloc 3 (URLs canoniques) terminé et vérifié (D-2026-09-25-14, branche `feat/seo-canonical-catalogue`).

**Reste à faire, dans l'ordre** :
1. ~~Fondations techniques (`robots.txt`, `sitemap.xml`, métadonnées par page)~~ — fait (D-2026-09-25-12).
2. ~~Données structurées (Schema.org / JSON-LD Product/Offer)~~ — fait (D-2026-09-25-13, PR #54, mergée).
3. ~~URLs canoniques / contenu dupliqué (filtres catalogue)~~ — fait (D-2026-09-25-14) : canonical fixe vers la racine sur la page catalogue.
4. Ouverture aux robots IA (GPTBot, ClaudeBot, PerplexityBot, Google-Extended...) — décision explicite à prendre, pas encore tranchée. Prochaine étape.
5. `llms.txt`.
6. Performance / Core Web Vitals.
7. Open Graph (partage social).

Chaque bloc doit être cadré en détail (décisions structurantes propres, ex. quels crawlers IA autoriser) avant tout code, conformément au protocole général.

**Indépendant du chemin critique « vrais bons plans » / rapprochement multi-niveaux** (confirmé 2026-09-26) : ne dépend d'aucune étape R0-R5 ni des phases du cadrage `CADRAGE_vrais-bons-plans.md`, peut être repris à tout moment sans attendre.

**Bloquant sur** : rien — chantier en cours, prochaine conversation dédiée au bloc 4. Vérifier le statut de merge de la branche `feat/seo-canonical-catalogue` (bloc 3) avant de commencer.

**Statut** : ouvert au 2026-09-26.

---

## GAP-2026-09-25-06 — Babolat : mots-clés sexe anglophones ("Men"/"Women") non reconnus par le lexique extractGender (OUVERT, mineur)

Découvert en vérifiant le build Babolat (voir `ETAT_ACTUEL.md`) : la catégorie chaussures utilise des titres anglophones (« Jet Mach 4 All Court Men », « Jet Tere 2 Clay Women ») alors que le lexique partagé `extractGender`/`extractAgeGroup` (`lib/product-matching.ts`, D-2026-09-25-03) ne reconnaît que des mots français (`femme|fille|lady`, `homme|garcon|garçon`). Conséquence : ces articles retombent sur `gender = non_determine` alors que le sexe est en réalité connu depuis le titre marchand (à la différence des catégories textile/accessoires du même site, qui utilisent « Homme »/« Femme » en français et sont bien détectées).

**Bloquant sur** : rien dans l'immédiat — `non_determine` reste une valeur valide et n'exclut pas l'article du catalogue (filtre sexe/âge optionnel), juste imprécis pour ces fiches. Étendre le lexique partagé à l'anglais est une décision structurante (impacte tous les marchands déjà scrapés, pas seulement Babolat) — hors périmètre de cette étape, non tranchée seule.

**Statut** : ouvert au 2026-09-25.

---

## GAP-2026-09-25-05 — Sport 2000 : facette sexe Algolia contredisant le libellé produit sur 1 article (OUVERT, mineur)

Découvert en vérifiant le build Sport 2000 (voir `ETAT_ACTUEL.md`) : le produit « Chaussures de tennis ADIDAS Fille Advantage CF I Enfant Garçon » a la facette `gender` Algolia du marchand valant `BEBE GARCON` alors que son propre libellé produit contient « Fille » — contradiction dans les données Sport 2000 elles-mêmes (cause côté marchand, pas une erreur d'extraction). Conséquence : le titre construit contient à la fois « Fille » et « Garçon », l'heuristique (`extractGender`) retombe sur `mixte` plutôt que de trancher.

**Bloquant sur** : rien dans l'immédiat — 1 seul produit concerné sur 165 offres Sport 2000, `mixte` reste une valeur valide du filtre (pas une erreur système), juste potentiellement pas le sexe réel de l'article. Même catégorie que GAP-2026-09-23-04/GAP-2026-09-25-02 (qualité de donnée marchand mineure, isolée).

**Statut** : ouvert au 2026-09-25.

---

## GAP-2026-09-25-04 — SportSystem : 1 bloc de listing non parsable (OUVERT, mineur)

Découvert en vérifiant le build SportSystem (voir `ETAT_ACTUEL.md`) : sur les ~768 blocs produit rencontrés dans les 8 pages promo tennis, 1 seul n'a pas pu être parsé (`parseProduct` retourne `null` — un des sélecteurs regex url/prix/image n'a pas matché) et a été silencieusement ignoré (`skippedUnparsable`). Cause non investiguée (structure HTML légèrement différente sur cette fiche précise ? champ manquant ?).

**Bloquant sur** : rien dans l'immédiat — impact d'une seule offre potentiellement manquante sur 768, aucune erreur ni donnée corrompue. Même catégorie que GAP-2026-09-23-04/GAP-2026-09-25-02 (qualité de donnée mineure, isolée).

**Statut** : ouvert au 2026-09-25.

---

## GAP-2026-09-25-03 — Tests contrat dépendants de données de prod volatiles (OUVERT, mineur)

Découvert en vérifiant `npm test` avant le commit du backfill sexe/âge (aucun rapport avec ce backfill, confirmé par `git stash` — mêmes échecs sans les changements en cours) : 3 tests échouent car ils dépendent de données réelles précises en prod plutôt que de données de test isolées — `tests/contract/catalog-query.test.ts` (recherche groupée "Pure Aero") et `tests/contract/deal-detail.test.ts` (autres offres du même article) supposent qu'un produit "Pure Aero" a encore 2+ offres actives en base ; vérifié réellement (requête directe) : ce n'est plus le cas aujourd'hui (0 produit Pure Aero avec 2+ offres actives), probablement du fait du scraping quotidien (expiration/désactivation d'offres). Même catégorie de fragilité déjà rencontrée et corrigée une fois en GAP-2026-09-23-01 (effet de bord découvert) — la correction précédente ciblait un titre précis plutôt que des données générées, mais reste vulnérable à la même dérive dans le temps.

**Bloquant sur** : rien dans l'immédiat — échec isolé à `npm test` (CI utilise `npm run test:unit`, qui ne touche pas la prod et reste vert). Mais fragilise la confiance dans la suite de tests contrat au fil du temps.

**Statut** : ouvert au 2026-09-25.

---

## GAP-2026-09-25-02 — Répétition de la marque dans le titre pour un produit Tennispro.fr (OUVERT, mineur)

Découvert en vérifiant le build Tennispro.fr (voir `ETAT_ACTUEL.md`) : le produit « Sac de tennis Mouratoglou Apparel Mouratoglou Training Gym » (marque `Mouratoglou Apparel`, catégorie accessoires) a la marque qui apparaît deux fois dans le titre — une fois insérée par le script (convention `${label} ${brand} ...`), une fois déjà présente dans le nom scrappé du produit (`SAC MOURATOGLOU TRAINING GYM`, le mot « Mouratoglou » y figurant nativement, sans être le nom de marque complet `Mouratoglou Apparel`). Vérifié réellement : cas isolé (1/673 offres Tennispro.fr), pas un problème systémique — recherche sur toute la base ne trouve aucune autre offre où la chaîne de marque complète apparaît deux fois dans le titre.

**Bloquant sur** : rien dans l'immédiat — impact cosmétique sur une seule fiche. Même catégorie que GAP-2026-09-23-04 (qualité de donnée produit mineure).

**Statut** : ouvert au 2026-09-25.

---

## GAP-2026-09-25-01 — Filtre catalogue « sexe / âge » : décisions de cadrage restantes avant le premier build (OUVERT)

Suite à D-2026-09-25-01. Reste à trancher, dans une conversation dédiée de build, avant tout code :

1. ~~Modélisation exacte~~ — résolu par D-2026-09-25-02 (deux colonnes séparées `gender`/`age_group` sur `products`).
2. ~~Mots-clés de l'heuristique d'extraction~~ — résolu par D-2026-09-25-03 (lexique vérifié sur les titres réels de prod).
3. ~~Migration + backfill~~ — résolu le 2026-09-25 (D-2026-09-25-04 pour la règle de réconciliation). Migration `005_products_gender_age.sql`, `lib/product-matching.ts` (`extractGender`/`extractAgeGroup`), `scripts/backfill-gender-age.ts`. Vérifié réellement en prod : 2845 produits mis à jour, 0 conflit, répartition contrôlée par échantillon (cordages 276/276 non_determine, chaussures femme/homme bien couverts, raquettes junior détectées via "Jr"/"Enfant"). Lint/build clean ; `npm test` révèle 3 échecs préexistants sans rapport (voir GAP-2026-09-25-03). PR #41 (branche `cadrage/filtre-sexe-age-suite`, la branche `cadrage/filtre-sexe-age` initiale ayant déjà été squash-mergée sous PR #40 en cours de route — commits ré-appliqués sur une branche fraîche depuis `origin/master`).
4. ~~Intégration workflow n8n ProTennis~~ — code fait et vérifié le 2026-09-25 (voir détail ci-dessous), **déploiement sur la VM Oracle restant à faire par l'utilisateur** (pas d'accès SSH pour Claude Code dans cette session).
5. ~~UI du filtre~~ — résolu par D-2026-09-25-05 (emplacement, structure, comportement).

**Point 4 résolu (2026-09-25)** : `scripts/automation/n8n-protennis-ingestion-workflow.json` mis à jour — miroir JS de `extractGender`/`extractAgeGroup` ajouté au nœud de parsing (mêmes regex que `lib/product-matching.ts`, comparées sans écart sur les 1508 offres ProTennis réelles de prod) ; nœud d'upsert Postgres (CTE `upserted_product`) étendu avec les colonnes `gender`/`age_group` et la même règle de réconciliation que `scripts/backfill-gender-age.ts` (`gender` écrasé seulement s'il vaut encore `non_determine`, `age_group` ne peut passer que de `adulte` à `enfant`, jamais l'inverse). Requête SQL testée réellement contre la base Neon de prod avec un produit factice (2 passages simulant un conflit de sexe et une mise à niveau d'âge, comportement attendu confirmé, données de test nettoyées et nettoyage vérifié). Lint clean. **Reste à faire par l'utilisateur** : réimporter/republier le workflow sur l'instance n8n permanente (VM Oracle, `deals-tennis-n8n.duckdns.org`) et déclencher une exécution réelle pour vérifier de bout en bout sur la prod — Claude Code n'a pas d'accès SSH à cette VM dans cette session (tentative de connexion refusée, `Permission denied (publickey)`). Voir `ETAT_ACTUEL.md` pour les commandes exactes.

**Point 5 résolu (2026-09-25, D-2026-09-25-05)** : emplacement (ligne dédiée sous le filtre catégorie), structure (deux filtres sexe/âge indépendants combinables), comportement (deals sans `product_id` et produits `non_determine` exclus dès qu'un filtre est actif, y compris en mode recherche groupée) et libellés actés puis construits — voir `ETAT_ACTUEL.md` pour le détail technique et la vérification.

**Statut** : ouvert au 2026-09-25 — tous les points de code résolus (1-5) ; seul reste le déploiement du point 4 sur la VM Oracle, par l'utilisateur.

---

## GAP-2026-09-24-03 — Scraping local : sélecteurs/URLs restants à vérifier au fil de l'eau (OUVERT)

Le cadrage technique acté (D-2026-09-24-03/04/05) n'a figé des sélecteurs/URLs précis que pour Sport 2000, Babolat et Amazon. Pour Tecnifibre (traité en premier, voir ci-dessous), aucune URL/sélecteur n'avait été vérifié à l'avance — la vérification réelle (robots.txt, structure Shopify, volumes de remise par collection) a été faite directement en début de conversation de build, plutôt que dans une conversation de cadrage séparée. Il reste probablement la même situation pour Tennis Point FR, Head, Tennispro.fr, SportSystem : à vérifier réellement au moment de construire chaque script (pas de suppositions), pas besoin de conversation de cadrage dédiée si la vérification est rapide.

**Statut** : ouvert au 2026-09-24, à traiter au fil de l'eau, un marchand à la fois.

---

## GAP-2026-09-24-02 — Scraping local gratuit : cadrage technique complet, prêt pour le premier build (RÉSOLU)

Suite à D-2026-09-24-02, D-2026-09-24-03, D-2026-09-24-04 puis D-2026-09-24-05 : mécanisme retenu pour démarrer le catalogue sans affiliation — outil piloté localement sur la machine de l'utilisateur (navigateur réel, Playwright), exécuté manuellement à la demande, gratuit. Remplace le plan scrape.do (D-2026-09-24-01, abandonné).

**Périmètre définitif en trois groupes** (inchangé, voir D-2026-09-24-03/04 pour le détail par marchand) :
- **Actionnables (8)** : Tecnifibre, Tennis Point FR, Head, Tennispro.fr, SportSystem, Sport 2000, Babolat, Amazon.
- **Différés — blocage technique edge (3)** : Decathlon, Wilson, Private Sport Shop.
- **Différé — problème structurel (1)** : Yonex.

**Résolution (D-2026-09-24-05)** : mapping catégorie Sport 2000 pour les cordages (classification par mot-clé sur le titre, pas de taxon dédié) et sélecteurs précis (prix/nom/marque/URL) figés pour Sport 2000, Babolat et Amazon ; traitement de Babolat sans promo actuelle tranché (ingéré à 0% de réduction pour l'instant, retravailler le prix de référence plus tard) ; mots-clés de recherche Amazon tranchés (simples en français pour démarrer) ; lieu d'insertion en base confirmé (réutilisation du schéma `merchants`/`deals`/`products` existant).

**Décisions transverses déjà tranchées (D-2026-09-24-04)** : structure technique = un script par marchand (comme ProTennis) ; critère d'arrêt = seuil de volume par marchand, fixé à 30 articles tennis actifs répartis entre les 5 catégories, révisable plus tard.

**Statut** : résolu le 2026-09-24. Cadrage technique complet pour les 8 marchands actionnables (rendu/URLs/sélecteurs/décisions transverses). Prochaine étape : premier build (script(s) de scraping), une nouvelle conversation dédiée, à confirmer explicitement en début de session (une étape de build par conversation).

---

## GAP-2026-09-24-01 — Sport Outlet FR : datafeed obtenu et examiné, mécanisme d'ingestion à recadrer (OUVERT)

Résultat de la recherche cowork (GAP-2026-09-23-05) : Sport Outlet FR identifié comme marchand tennis avec programme d'affiliation public sur Awin. Compte Awin publisher créé par l'utilisateur et candidature au programme Sport Outlet FR **acceptée** — résout de fait le blocage compte Awin de GAP-2026-09-21-03 (au moins pour ce marchand).

**Export obtenu et examiné réellement (2026-09-24)** : datafeed généré via l'outil Awin "Create-a-Feed" (toutes colonnes cochées, CSV/`,`/gzip), téléchargé par l'utilisateur (`21502-48225-fr_FR-Default.csv.gz`, hors dépôt Git — voir `.gitignore`). URL Awin de téléchargement contient une clé API personnelle (secret), à traiter comme `DATABASE_URL` le moment venu (variable d'environnement, jamais committée). 7818 produits, 0 ligne malformée.

**Constats issus de l'examen réel** (à reprendre/creuser en détail dans la prochaine conversation de cadrage) :
- Volume de produits tennis réel très faible : ~65 lignes mentionnent "tennis" (nom ou catégorie) sur 7818, et une partie sont en fait du **tennis de table** (à exclure, symétrique au filtre squash/padel/badminton de ProTennis) — volume utile estimé à l'ordre d'une trentaine d'articles. Catalogue du marchand très majoritairement football/mode sportive.
- `product_model` est une colonne vide chez ce marchand (contrairement à l'hypothèse initiale) — extraction du modèle depuis le titre à refaire comme pour ProTennis, pas de lecture directe possible.
- Candidat pour `original_price` : `rrp_price` (peuplé, cohérent) — pas `product_price_old` (vide sur l'échantillon). Certaines lignes ont `rrp_price = "0,00"` (pas de prix de référence connu), incompatible avec la contrainte `original_price > 0` : à écarter ou traiter à part, pas à forcer.
- Format des prix incohérent entre colonnes : `search_price`/`store_price` en point décimal (`89.99`), `rrp_price` en virgule française (`139,95`) — à gérer explicitement au parsing.
- Catégorisation du marchand (`merchant_product_category_path`) ne recoupe pas directement nos 5 catégories (`raquettes`, `cordages`, `chaussures`, `textile`, `accessoires`) — mapping à définir.

**Décision de l'utilisateur (2026-09-24)** : ne pas poursuivre le cadrage technique dans cette conversation. Tout ce qui précède (logique de récupération des données, filtrage tennis vs tennis de table, mapping catégories, gestion du prix de référence) sera **recadré dans une nouvelle conversation dédiée**, pas enchaîné ici.

**Prochaine étape** : nouvelle conversation de cadrage (pas de build) sur le mécanisme d'ingestion Sport Outlet FR — reprendre les constats ci-dessus, décider du filtre tennis/tennis de table, du mapping catégories, de la règle sur `rrp_price = 0`, avant toute écriture de code.

**Statut** : ouvert au 2026-09-24.

---

## GAP-2026-09-23-06 — Amazon Partenaires : compte créé, PA-API non accessible, mode d'ajout manuel non cadré (REMPLACÉ par GAP-2026-09-24-02)

L'utilisateur a rejoint le programme Amazon Partenaires (Amazon Associates France). Vérifié réellement : PA-API (Product Advertising API) inaccessible pour l'instant — Amazon exige 3 ventes qualifiées sous 180 jours avant d'ouvrir l'accès. Scraping direct d'Amazon écarté d'emblée (CGU du programme l'interdisent explicitement, motif de résiliation du compte affilié — distinct des cas robots.txt/anti-bot déjà évalués pour d'autres marchands, voir GAP-2026-09-23-05).

Décision actée : en attendant l'éligibilité PA-API, ajouter manuellement quelques offres Amazon en base (lien produit + tag associé) pour générer du volume et atteindre les 3 ventes plus vite.

**Mise à jour 2026-09-24 (première proposition, refusée)** : suite à une proposition de l'utilisateur d'utiliser scrape.do (service de contournement actif d'anti-bot/CGU) pour Amazon + Babolat/Wilson/Head/Yonex/Tecnifibre + 2 gros revendeurs, refusé (risque pénal réel pour le contournement anti-bot actif — art. 323-1 CP — et violation CGU explicite pour Babolat/Yonex ; résiliation de compte pour Amazon). Alternative retenue à ce moment-là : mécanisme d'ajout manuel, étendu à **Amazon, Wilson, Head, Babolat** (Yonex exclu — CGU restreint tout lien entrant à sa page d'accueil, incompatible avec `/go/[dealId]`, indépendamment de la méthode de collecte). Tecnifibre + 2 gros revendeurs pas évalués.

**Mise à jour 2026-09-24 (revirement, D-2026-09-24-01)** : l'utilisateur est revenu sur ce refus dans une conversation suivante et a explicitement demandé d'utiliser scrape.do pour **Amazon, Babolat, Wilson, Head, Yonex, Tecnifibre**, en assumant consciemment le risque signalé ci-dessus. Fréquence retenue : scraping récurrent réduit, une fois par mois par marchand, le temps de démarrer (« bootstrap ») le catalogue — pas un cron quotidien comme ProTennis. Caractère explicitement temporaire (l'utilisateur veut supprimer le mécanisme après la phase de démarrage), mais le critère d'arrêt (durée, volume cible, ou alternative trouvée) n'est pas encore précisé. Le mécanisme d'ajout manuel (script `add-manual-deal.ts`, navigation supervisée) reste décrit ci-dessous à titre historique mais n'est plus l'option retenue pour ces 6 marchands — voir D-2026-09-24-01 pour le détail complet du revirement.

Ancien plan d'ajout manuel (abandonné pour ces 6 marchands par D-2026-09-24-01, conservé pour mémoire) :
- Mécanisme d'insertion envisagé : script réutilisable (option A), ex. `scripts/add-manual-deal.ts`.
- Collecte envisagée : navigation supervisée (humain présent — Claude in Chrome ou Playwright interactif avec validation à chaque étape).
- Fraîcheur du prix : pas de synchro automatique envisagée, pas d'expiration courte.

**Mise à jour 2026-09-24 (remplacement, D-2026-09-24-02)** : le plan scrape.do (payant) est abandonné au profit d'un outil de scraping local gratuit (navigateur réel piloté localement, exécution manuelle) — même logique de risque assumé, périmètre élargi (12 marchands, dont ces 6). Suite du cadrage dans **GAP-2026-09-24-02**.

**Statut** : remplacé le 2026-09-24, voir GAP-2026-09-24-02.

---

## GAP-2026-09-23-05 — Marchands supplémentaires : en attente du résultat d'une recherche externe de programmes d'affiliation (RÉSOLU)

Suite à D-2026-09-23-09 : 6 candidats au scraping direct (Private Sport Shop, Tennis Pro, Wilson, Babolat, Yonex, Head) ont tous été écartés après vérification réelle (robots.txt/CGU, protection anti-bot technique pour Wilson, SPA JS pour Private Sport Shop — voir la décision pour le détail par marchand). L'utilisateur a choisi de rechercher de nouveaux marchands tennis avec un programme d'affiliation public via un outil externe (« cowork ») plutôt que d'assumer un risque supplémentaire de scraping direct.

**Résolution (2026-09-24)** : premier résultat rapporté — Sport Outlet FR, programme Awin accepté. Suite du cadrage technique dans GAP-2026-09-24-01.

**Statut** : résolu le 2026-09-24 (premier candidat trouvé ; d'autres résultats de la recherche cowork peuvent encore être rapportés ultérieurement, traités au cas par cas si l'utilisateur en apporte).

---

## GAP-2026-09-23-04 — Mauvaise marque associée à un produit ProTennis (« Head » au lieu de « Babolat ») (OUVERT, mineur)

Découvert en vérifiant le fix du plafond de suggestions (D-2026-09-23-08) : le produit dont le titre scrappé est « Protection raquette de tennis Babolat Super Tape » (catégorie accessoires, marchand ProTennis) est enregistré en base avec `brand = 'Head'` alors qu'il s'agit visiblement d'un article Babolat. Conséquence mineure observée : ce produit remonte dans les suggestions de la recherche « Babolat » (correspondance sur le mot dans `model`) alors que sa fiche affiche la marque Head.

**Cause non investiguée** : à vérifier si le titre ProTennis lui-même contient une erreur (article mal classé côté marchand) ou si l'extraction de marque (`lib/product-matching.ts`) a mal identifié la marque sur ce titre précis.

**Bloquant sur** : rien dans l'immédiat — un seul produit concerné, impact cosmétique (suggestion visible dans la mauvaise recherche). À traiter au fil de l'eau ou lors d'un futur passage sur la qualité des données produit.

**Statut** : ouvert au 2026-09-23.

---

## GAP-2026-09-23-03 — Sous-catégorie couleur pour ne pas polluer la recherche/le nom d'article (RÉSOLU)

Demande explicite de l'utilisateur (rapportée en même temps que le bug de recherche insensible à l'ordre des mots) : certains articles n'ont de différence que la couleur, ce qui génère des variantes de nom qui polluent les champs de recherche/suggestions.

**Résolution (D-2026-09-23-06)** : couleur retenue comme attribut affiché (pas clé d'identité produit) extrait automatiquement du titre scrappé. `lib/product-matching.ts` (`extractColor`, `extractModel` nettoyé), migration `004_deals_color.sql`, `scripts/backfill-colors.ts`, workflow n8n ProTennis mis à jour. Vérifié réellement sur la prod : 881 produits en doublon uniquement par couleur fusionnés (1503 → 1322). Voir `ETAT_ACTUEL.md` pour le détail.

**Statut** : résolu le 2026-09-23.

---

## GAP-2026-09-23-02 — Prod restée figée sur le déploiement CLI du 2026-09-21, jamais reconnectée à Git (RÉSOLU)

En vérifiant pourquoi la section hero (PR #18) n'apparaissait pas sur `https://deals-tennis.vercel.app`, découvert que le projet Vercel n'avait **jamais** été connecté au dépôt GitHub depuis sa création (D-2026-09-21-10 : déploiement initial volontairement fait via CLI, le lien Git devait être traité au chantier CI mais ne l'a jamais été — seuls les checks GitHub Actions l'ont été). Conséquence : la prod tournait sur l'unique déploiement du 21/09, ratant tout ce qui a été mergé depuis (PR #16 recherche centrée article, PR #18 hero).

**Résolution** : l'utilisateur a connecté le repo `lenoirmath122-dev/deals-tennis` à Vercel (branche `master`) depuis le dashboard. Un premier "Redeploy" tenté par l'utilisateur a re-servi l'ancien snapshot CLI (`source: "redeploy"`, pas un vrai pull Git) ; un premier déploiement preview parti du webhook Git a confirmé la connexion active mais échoué au build (`DATABASE_URL` absente de l'environnement preview — voir D-2026-09-23-04). Le merge de la PR #19 (commit déclencheur) a produit le premier vrai déploiement production depuis Git (`source: "git"`, commit `b179aa2`).

Vérifié réellement sur `https://deals-tennis.vercel.app` après ce déploiement : section hero visible (photo + overlay), recherche groupée par article fonctionnelle (`?q=Pure%20Aero` affiche le badge « 2 offres »).

**Statut** : résolu le 2026-09-23.

---

## GAP-2026-09-21-01 — `tasks.md` coché mais aucun code correspondant (RÉSOLU)

`cadrage_deals-tennis/tasks.md` listait des tâches marquées `[x]` sans aucun code réel correspondant, et des liens pointant vers `C:/Users/lenoi/mon-projet/specs/...` (un autre projet).

**Résolution (D-2026-09-21-05)** : toutes les cases ont été décochées (`[x]` → `[ ]`), les liens corrigés pour pointer vers `cadrage_deals-tennis/`. `tasks.md` reflète maintenant une liste de tâches à faire, aucune n'étant réellement commencée.

**Statut** : résolu le 2026-09-21.

---

## GAP-2026-09-21-03 — Pas de compte Awin publisher, datafeed non vérifiable (PARTIELLEMENT RÉSOLU)

Tennis Point FR (Awin #13266) et Padel-Point FR (Awin #25160) annoncent un flux de données produit (datafeed) dans les avantages de leur programme Awin, mais le format exact (CSV/XML, champs, fréquence) n'est visible qu'après création d'un compte affilié Awin et acceptation de la candidature sur chacun des deux programmes.

**Mise à jour 2026-09-24** : un compte Awin publisher a été créé par l'utilisateur (voir GAP-2026-09-24-01, contexte Sport Outlet FR) — le blocage « aucun compte Awin » est levé. Reste ouvert spécifiquement pour Tennis Point FR / Padel-Point FR : candidature à ces deux programmes pas encore soumise/acceptée, datafeed toujours non vérifié pour eux.

**Bloquant sur** : action de l'utilisateur (candidature aux deux programmes depuis le compte Awin désormais actif).

**Statut** : ouvert au 2026-09-24 (compte Awin résolu, candidatures Tennis Point/Padel-Point restent à faire).

---

## GAP-2026-09-21-02 — Pas de dossier `hooks`/CI configuré pour la protection de branche (RÉSOLU)

Le protocole prévoit un flux branche → PR → CI → merge une fois une protection de branche en place, mais aucun remote GitHub/CI n'est encore configuré.

**Résolution (chantier CI + protection de branche, D-2026-09-21-11)** : dépôt GitHub privé `lenoirmath122-dev/deals-tennis` créé et lié en `origin`. Workflow GitHub Actions (`.github/workflows/ci.yml`) exécutant lint + build + tests unitaires (`npm run test:unit`, nouveau script scoping vitest à `tests/unit/`) sur chaque push/PR vers `master`, avec `DATABASE_URL` en secret repo (requis même sans tests de contrat : `lib/db.ts` évalue la connexion Neon au chargement du module, donc `next build` échoue sans cette variable). Protection de branche `master` activée : check `build-and-test` obligatoire avant merge, force-push et suppression de branche interdits. Merge squash uniquement + suppression automatique de la branche source configurés sur le repo (conforme au protocole point 4).

**Statut** : résolu le 2026-09-21.

---

## GAP-2026-09-21-05 — Méthode technique de scraping (n8n HTTP node vs Playwright) et fréquence non tranchées (RÉSOLU)

Suite à D-2026-09-21-16, une liste candidate de revendeurs a été actée pour le scraping direct. **Résolu (D-2026-09-22-01)** : `robots.txt` et CGV/mentions légales vérifiés réellement pour Tennispro.fr, Sport 2000, SportSystem, ProTennis, Decathlon — ProTennis retenu comme premier marchand (portée minimale : titre/prix/catégorie, image hotlinkée depuis le marchand, pas de description/visuel copié). **Résolu (D-2026-09-22-02)** : méthode technique (nœud HTTP Request n8n + parsing HTML, pas de Playwright) et fréquence (1 fois par jour) tranchées.

**Statut** : résolu le 2026-09-22.

---

## GAP-2026-09-22-06 — Pas d'hébergement permanent pour n8n (RÉSOLU)

Le workflow n8n ProTennis (`scripts/automation/n8n-protennis-ingestion-workflow.json`) avait été construit et vérifié avec une instance n8n **locale et temporaire** (`npx n8n`, arrêtée après vérification). Aucune instance n8n ne tournait en continu.

**Résolution (D-2026-09-22-04)** : VM Oracle Cloud Free Tier provisionnée (`n8n-server`, `VM.Standard.A1.Flex`, 1 OCPU/6 Go, Oracle Linux 9, IP publique éphémère `145.241.173.33`, région `eu-paris-1`). Docker + Docker Compose installés. n8n déployé derrière un reverse proxy Caddy avec certificat HTTPS automatique (Let's Encrypt) sur le sous-domaine gratuit `deals-tennis-n8n.duckdns.org` (DuckDNS). Accès protégé par authentification basique (identifiant `admin`, mot de passe généré, communiqué à l'utilisateur — non stocké dans le dépôt) en plus du compte propriétaire n8n créé par l'utilisateur. Credential Postgres `Neon deals-tennis` créée manuellement dans l'UI n8n (jamais transmise en clair via un outil, bloqué explicitement par la protection anti-fuite d'identifiants de Claude Code — créée par l'utilisateur en suivant les valeurs de `.env.local`). Workflow ProTennis importé (`n8n import:workflow`), testé manuellement avec succès (23 offres, `updated_at` confirmé en base Neon de prod au moment du test), puis **activé** — le déclencheur planifié quotidien (6h) tourne maintenant réellement en continu.

**Statut** : résolu le 2026-09-22.

---

## GAP-2026-09-22-07 — `scripts/migrate.ts` non idempotent (OUVERT, mineur)

Le runner de migration (`scripts/migrate.ts`, `npm run db:migrate`) réapplique **tous** les fichiers de `scripts/migrations/` à chaque exécution, sans table de suivi des migrations déjà appliquées. La migration `002_deals_unique_merchant_url.sql` a dû être appliquée manuellement (hors `db:migrate`) pour cette raison — relancer `npm run db:migrate` échouerait sur `001_init_schema.sql` (`CREATE TABLE` sur des tables déjà existantes). Sans impact aujourd'hui (fait rare), mais à corriger avant d'ajouter une 3e migration si le problème doit être évité à nouveau.

**Bloquant sur** : rien dans l'immédiat — amélioration technique à planifier, pas une décision utilisateur.

**Statut** : ouvert au 2026-09-22.

---

## GAP-2026-09-22-08 — Rapprochement produit multi-marchands : fondation, recherche et détail deal construits (RÉSOLU)

Suite à D-2026-09-22-05, puis élevé par l'utilisateur au rang d'axe central du produit (comparaison de prix multi-marchands). **Direction actée en D-2026-09-22-06** : table `products` (marque+modèle+catégorie) + `deals.product_id` nullable, rapprochement par extraction du modèle depuis le titre (la marque vient en réalité de `deals.brand`, déjà fiable). Page d'accueil reste centrée deal, recherche devient centrée article, détail d'un deal affiche les autres offres du même article.

**Résolution complète (2026-09-23)** : fondation (table `products`, backfill), intégration au workflow n8n (GAP-2026-09-22-11), recherche groupée par `product_id` en mode recherche (D-2026-09-22-11), page détail `/deal/[dealId]` (D-2026-09-22-10, résout aussi GAP-2026-09-22-10) — tous construits et vérifiés bout en bout avec des données réelles de production. Voir `ETAT_ACTUEL.md` pour le détail.

**Statut** : résolu le 2026-09-23.

---

## GAP-2026-09-22-11 — Le workflow n8n ProTennis ne peuple pas `product_id` sur les nouvelles offres (RÉSOLU)

Le backfill de `deals.product_id` (GAP-2026-09-22-08) avait été appliqué une seule fois, manuellement, sur les 33 deals existants au 2026-09-22. Le workflow n8n ProTennis actif insérait/mettait à jour des offres sans jamais renseigner `product_id`.

**Résolution** : requête d'upsert du workflow réécrite en CTE — `WITH upserted_product AS (INSERT INTO products ... ON CONFLICT (LOWER(brand), LOWER(model), category) DO UPDATE ... RETURNING id)` puis `INSERT INTO deals (..., product_id) VALUES (..., (SELECT id FROM upserted_product)) ON CONFLICT (merchant_id, affiliate_url) DO UPDATE SET ..., product_id = EXCLUDED.product_id`. Le modèle (`model`) est calculé dans l'étape de parsing du workflow via un miroir JS de `lib/product-matching.ts` (`extractModel` — à garder synchronisé manuellement, ce workflow ne peut pas importer le code TypeScript du repo).

Vérifié réellement : (1) requête SQL testée directement contre la base Neon de prod avec un deal factice — nouveau produit créé au premier passage, `product_id` réutilisé à l'identique au second passage (idempotence), aucun doublon créé, données de test supprimées après contrôle ; (2) miroir JS comparé aux 23 offres ProTennis réelles déjà rattachées — 0 écart avec `lib/product-matching.ts` ; (3) workflow réimporté et publié sur l'instance n8n permanente (VM Oracle), déclenché manuellement depuis l'UI n8n — les 23 offres réelles mises à jour, `product_id` peuplé à 100% (23/23), marque/modèle cohérents contrôlés en base.

**Point découvert en cours de vérification (hors scope de ce GAP, documenté séparément)** : le workflow était en réalité **inactif** sur l'instance permanente au moment de reprendre cette étape, alors qu'`ETAT_ACTUEL.md` (D-2026-09-22-04) indiquait qu'il avait été activé — voir GAP-2026-09-22-12.

**Statut** : résolu le 2026-09-22.

---

## GAP-2026-09-22-09 — Contamination multi-sports du scraping ProTennis élargi (RÉSOLU)

ProTennis est un site multi-sports (tennis, padel, squash, badminton, pickleball). La décision D-2026-09-22-05 (élargissement du scraping à toutes les catégories du site) mentionnait ces autres sports sans que ce soit un choix de périmètre produit confirmé — `deals.category` a une contrainte `CHECK` limitée aux 5 catégories tennis (`data-model.md`), et `spec.md` définit deals-tennis comme un catalogue tennis. Un exemple concret trouvé pendant l'inspection : la page `/5624-destockage-raquettes` (déjà scrapée aujourd'hui) contient au moins un produit squash (balles Dunlop) mêlé aux raquettes de tennis.

**Résolution (D-2026-09-22-08)** : le scraping cible exclusivement les pages catégories tennis identifiées par leur slug (`973-raquette-de-tennis`, `977-cordage-raquette-tennis`, `974-chaussure-de-tennis`, `975-vetement-de-tennis`, `978-accessoire-tennis`, `979-balle-tennis`, `976-bagagerie-tennis`), jamais une page toutes-catégories du site. Un filtre de sécurité supplémentaire écarte toute fiche dont le titre contient `squash`, `padel`, `badminton` ou `pickleball` (insensible à la casse), au cas où une fiche hors tennis se glisserait malgré tout sur une page tennis (comme observé dans l'exemple ci-dessus).

**Statut** : résolu le 2026-09-22.

---

## GAP-2026-09-22-10 — Détail d'un deal : page dédiée ou popup ? (RÉSOLU)

D-2026-09-22-06 acte que le clic sur un deal doit permettre de voir les autres offres marchandes du même article, mais la modalité d'affichage (page dédiée type `/deal/[id]` vs popup/modale sur le catalogue) n'était pas tranchée.

**Résolution (D-2026-09-22-10)** : page dédiée `/deal/[dealId]`. Construite et vérifiée le 2026-09-23 — voir `ETAT_ACTUEL.md`.

**Statut** : résolu le 2026-09-23.

---

## GAP-2026-09-22-12 — Le workflow n8n ProTennis était inactif sur l'instance permanente malgré D-2026-09-22-04 (RÉSOLU)

En reprenant l'étape GAP-2026-09-22-11, une vérification réelle sur l'instance n8n permanente (VM Oracle, `n8n export:workflow --id=protennis-ingestion-wf-001`) a montré `active: false`, alors qu'`ETAT_ACTUEL.md` documentait le workflow comme activé le 2026-09-22 (D-2026-09-22-04). Cause non investiguée (redémarrage du conteneur ayant réinitialisé l'état ? erreur lors de l'activation initiale ?) — non déterminée, hors scope de cette étape.

**Résolution** : réactivé via `n8n publish:workflow --id=protennis-ingestion-wf-001` (commande actuelle, `update:workflow` étant dépréciée dans cette version 2.40.5 de n8n) puis conteneur redémarré (`docker restart opc-n8n-1`, nécessaire pour que le changement prenne effet selon le message de la CLI). Log de démarrage confirmé : `Processed 0 draft workflows, 1 published workflows.` Exécution manuelle réelle déclenchée ensuite depuis l'UI n8n par l'utilisateur, confirmée en base (23/23 offres mises à jour).

**Point non couvert par cette résolution** : la cause de la désactivation n'est pas connue — si elle se reproduit (ex. après un redémarrage de VM), le cron quotidien de 6h pourrait à nouveau ne pas tourner sans que personne ne le remarque (pas d'alerte configurée). Rejoint le chantier « Observabilité/monitoring » (n°11 de la liste D-2026-09-21-09, non commencé) — une alerte sur l'absence d'exécution quotidienne y aurait sa place.

**Statut** : résolu le 2026-09-22 (réactivé et vérifié) ; cause racine non déterminée, risque de récidive silencieuse noté pour le chantier observabilité.

---

## GAP-2026-09-23-01 — Monitoring du cron n8n ProTennis (RÉSOLU)

Suite à GAP-2026-09-22-12 (récidive silencieuse possible sans alerte), le mécanisme de monitoring a été discuté et tranché en **D-2026-09-23-01** : dead man's switch externe healthchecks.io (ping HTTP du workflow n8n à chaque succès, alerte email si le ping manque).

**Résolution (2026-09-23)** : nœud HTTP Request (`Ping healthchecks.io (succes)`) ajouté au workflow n8n ProTennis, branché après le nœud d'éviction — il ne se déclenche que si toute la chaîne (scraping → upsert → éviction) a réussi. Compte/check healthchecks.io créé par l'utilisateur. Déployé sur l'instance n8n permanente (VM Oracle), workflow réimporté/republié/conteneur redémarré, `active: true` confirmé.

Vérifié réellement : deux exécutions complètes du workflow (`n8n execute`, site ProTennis réel + base Neon de prod réelle) terminées avec succès, ping reçu par healthchecks.io après chaque run ; simulation d'échec via l'endpoint dédié `/fail` ayant réellement fait passer le check à l'état "Down" et déclenché l'alerte email (confirmé par l'utilisateur), puis retour à l'état normal via un ping de succès.

**Effet de bord découvert et corrigé** : les exécutions réelles du workflow (`UPDATE` sur les deals existants) ont changé l'ordre physique des lignes en base, révélant un bug préexistant dans `tests/contract/deal-detail.test.ts` (`LIMIT 1` sans `ORDER BY` sur un `ILIKE` large, non déterministe) — corrigé en ciblant le titre précis de l'article multi-marchand utilisé par le test.

**Statut** : résolu le 2026-09-23.
