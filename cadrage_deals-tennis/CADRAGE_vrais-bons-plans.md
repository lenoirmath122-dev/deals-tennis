# Cadrage — Données autonomes et « vrais bons plans »

> Document de cadrage à placer dans `cadrage_deals-tennis/`.
> Il fait suite à l'audit technique du 2026-09-25, dont il reprend les constats.
> Il décrit **quoi** construire et **dans quel ordre**. Le **comment** reste à l'appréciation de Claude Code, qui doit confronter ce document au code réel.

---

## 0. Règles de travail pour Claude Code

1. **Ce document n'est pas une vérité absolue.** Il a été rédigé à partir de l'audit, pas à partir d'une lecture directe du code. Si une instruction contredit l'existant, est irréaliste ou peut être faite plus simplement, **signale-le avant d'agir** au lieu d'appliquer à la lettre.
2. **Une phase à la fois.** Chaque phase se termine par un **arrêt pour validation humaine**. Ne jamais enchaîner deux phases sans accord explicite.
3. **Pas de migration destructive sur la prod sans test préalable** sur une branche Neon. Toute migration doit être additive (nouvelles tables ou colonnes, pas de suppression) sauf accord explicite.
4. **Réutiliser les conventions du projet :** numérotation des migrations (`scripts/migrations/00X_*.sql`), journal des décisions (`D-AAAA-MM-JJ-NN`), écarts connus (`GAP-AAAA-MM-JJ-NN`), mise à jour de `ETAT_ACTUEL.md` à la fin de chaque phase.
5. **Ce que tu ne peux pas faire seul** (accès SSH à la VM Oracle, modification du workflow n8n, identifiants d'API) : prépare des livrables prêts à appliquer (fichiers, commandes, instructions pas à pas) et liste-les clairement comme **actions humaines requises**.
6. **Tests.** Toute logique nouvelle (calcul de verdict, contrôles de cohérence, rapprochement) est couverte par des tests unitaires.

---

## 1. Principes produit (décisions actées)

| # | Principe | Conséquence technique |
|---|---|---|
| P1 | Le prix barré affiché par le marchand **n'est pas une source de vérité**. | `original_price` reste un champ d'affichage secondaire. Le verdict « vrai bon plan » repose uniquement sur notre historique observé. |
| P2 | L'historique de prix est enregistré **au niveau de l'offre** (`deal`), pas du produit. | Corriger un rapprochement produit ne détruit jamais d'historique. L'agrégation par produit se fait à la lecture. |
| P3 | **En cas de doute, ne pas publier.** | Une donnée incohérente part en quarantaine au lieu d'être affichée. Une offre manquante coûte moins qu'un faux bon plan. |
| P4 | On affiche ce qu'on sait réellement. | Formulation type « prix le plus bas vu depuis N jours », jamais « -X % sur le prix habituel » tant que l'historique ne couvre pas les prix hors promo. |
| P5 | Le site doit tourner seul au quotidien et **alerter** quand il a besoin d'un humain. | Tout run est tracé, toute anomalie remonte dans une file de revue unique. |

---

## 2. Constats de départ (audit du 2026-09-25)

- **Historique de prix absent.** Chaque upsert écrase les prix, et `updated_at` est réécrit à chaque passage.
- **Vraie remise non vérifiée.** `discount_percentage` est calculé depuis le prix barré du marchand. Le seul filtre existant élimine les offres sans prix barré (`skippedNoDiscount`).
- **8 marchands sur 9 scrapés à la main**, sans cron ni trace des runs. ProTennis tourne via n8n (quotidien), mais ses logs sont inaccessibles depuis le repo.
- **Rapprochement produit par clé texte** `(LOWER(brand), LOWER(model), category)`. Seuls 7,4 % des produits ont plus d'une offre active. Un faux rapprochement est connu (GAP-2026-09-23-04) et 881 doublons avaient déjà dû être corrigés.
- **`click_events`** est alimentée (27 lignes) mais n'est exploitée nulle part.
- **Aucune mise en avant éditoriale** n'existe.
- **Biais important :** les scrapers ne voient les articles **que lorsqu'ils sont en promo**. Un historique construit uniquement sur ces observations mesure « le prix promo habituel », pas le prix normal.

---

## 3. Phases

### Phase 0 — Alignement (aucun code)

**Objectif :** vérifier que ce cadrage est applicable tel quel.

- Relire ce document en le confrontant au repo et à la base.
- Lister les désaccords, simplifications possibles et risques non identifiés.
- Proposer un découpage en tâches pour les phases 1 et 2, avec estimation.
- Pour chacun des 9 marchands, indiquer si la page scrapée liste **aussi** des articles sans remise, ce qui permettrait d'enregistrer leur prix sans coût supplémentaire.

**Arrêt :** validation du plan.

---

### Phase 1 — Collecte de l'historique de prix (priorité absolue)

**Pourquoi en premier :** le compteur des 90 jours démarre au premier enregistrement. Chaque jour de retard est perdu.

**Livrables :**

1. Migration : table `price_observations`.
   - Une ligne par `(deal_id, observed_on)` (clé primaire), avec au minimum `price` (prix payé), `merchant_list_price` (prix barré affiché, informatif), `in_stock` si disponible, `first_seen_at` et `last_seen_at`.
   - L'upsert du même jour met à jour le prix et `last_seen_at` (plusieurs runs par jour restent idempotents).
2. **Une fonction d'ingestion partagée** (par exemple `lib/ingest.ts`) qui centralise l'upsert `deals` + l'upsert `price_observations`. Les 8 scripts locaux l'utilisent au lieu de dupliquer le SQL.
3. Là où c'est gratuit (constat de la phase 0), **enregistrer aussi les articles sans remise** dans `price_observations`. Ces articles ne doivent pas apparaître comme deals actifs sur le site. Proposer le mécanisme le plus simple (par exemple une offre `status` dédié ou un flag), en respectant les contraintes CHECK existantes.
4. **ProTennis (n8n) :** spécification exacte du nœud Postgres à ajouter au workflow (requête SQL prête à coller, emplacement dans le flux). → **Action humaine requise.**

**Critères d'acceptation :**
- Un run de chaque script local crée une ligne par offre vue dans `price_observations`.
- Relancer le même script le même jour ne crée aucune ligne en double.
- Aucune régression sur l'upsert `deals` et l'éviction existante.

**Arrêt :** validation, puis application de la migration en prod.

---

### Phase 2 — Cadence automatique et traçabilité des runs

**Livrables :**

1. Migration : table `ingestion_runs`.
   - `merchant_id`, `started_at`, `finished_at`, `status` (`running|success|partial|failed`), `seen_count`, `upserted`, `evicted`, `skipped_no_discount`, `error`.
   - Chaque script ouvre une ligne au démarrage et la ferme à la fin, y compris en cas d'erreur.
2. **Garde-fou d'éviction renforcé :** en plus du cas « 0 URL vue », ne pas évincer si `seen_count` chute de plus de 50 % par rapport au dernier run réussi du même marchand. Le run passe en `partial` et remonte en alerte.
3. **Scripts exécutables sans intervention** (headless, variables d'environnement, code de sortie non nul en cas d'échec).
4. **Kit de déploiement pour la VM Oracle :** script d'installation (Node, Playwright, dépendances), fichiers de timers systemd (ou crontab) avec horaires **étalés** (1 passage par jour et par marchand minimum, 2 pour les gros catalogues), procédure de mise à jour du code. → **Action humaine requise** pour l'installation.
5. **Requête d'alerte** prête pour n8n : marchands sans run `success` depuis plus de 36 h, et runs `partial`/`failed` des dernières 24 h.
6. **Amazon :** ne pas modifier le scraper. Documenter l'option API officielle du programme Partenaires (prérequis, identifiants nécessaires) comme décision à prendre. → **Décision humaine requise.**

**Critères d'acceptation :**
- Chaque run, réussi ou non, laisse une trace complète dans `ingestion_runs`.
- Une simulation de chute de 60 % des offres vues ne déclenche aucune éviction.
- Le kit de déploiement est documenté pas à pas.

**Arrêt :** validation, puis déploiement sur la VM.

---

### Phase 3 — Qualité des données

**3a. Contrôles de cohérence et quarantaine** (dans la fonction d'ingestion partagée)

Une offre est mise en quarantaine (non publiée, conservée pour revue) si, par exemple :
- son prix varie de plus de 60 % par rapport à la dernière observation de la même offre ;
- sa remise dépasse 80 % ;
- son prix sort des bornes plausibles de sa catégorie (bornes à définir dans un fichier de configuration, pas en dur).

Les seuils sont des points de départ, à ajuster. Le mécanisme de quarantaine doit respecter les contraintes existantes sur `deals.status` (proposer la solution la plus simple).

**3b. Audit des doublons produits** (script en lecture seule, sortie CSV)

1. Marque incohérente entre `products.brand` et `deals.brand` des offres rattachées (cas GAP-2026-09-23-04).
2. Quasi-doublons : même marque et même catégorie, `model` très proches (`pg_trgm`, `similarity > 0.8`, seuil ajustable).
3. Même marchand avec plusieurs offres sur un même produit.
4. Écart de prix suspect : offre la plus chère supérieure à 2 fois la moins chère au sein d'un produit.
5. Âge ou genre contradictoires entre les titres des offres d'un même produit.

**3c. Corrections**
- Migration : table `product_merges (from_id, to_id, reason, merged_at)` pour tracer et pouvoir annuler une fusion.
- Script de fusion qui applique les corrections validées (les cas ambigus sont tranchés par un humain).
- **Chaque cas corrigé devient un test** de `lib/product-matching.ts`.
- Résoudre GAP-2026-09-23-04.

**Critères d'acceptation :**
- Le rapport CSV est produit et relu.
- Les fusions validées sont appliquées et tracées.
- Les nouveaux tests passent.

**Arrêt :** revue du CSV avant toute fusion.

---

### Phase 4 — Verdict « vrai bon plan »

**Prérequis :** au moins 30 jours de collecte depuis la phase 1. Le code peut être écrit avant, mais **l'affichage reste désactivé** (feature flag) tant que l'historique est insuffisant.

**Livrables :**

1. Vue matérialisée `product_deal_verdict`, rafraîchie après chaque vague de scrapes :
   - agrégation par produit et par jour du **meilleur prix tous marchands confondus** ;
   - sur les 90 derniers jours, hors jour courant : médiane et plus bas ;
   - seuils de confiance : au moins 14 jours observés sur une période d'au moins 30 jours ;
   - verdict positif si le prix du jour est **inférieur ou égal au plus bas** observé, **ou** inférieur ou égal à **90 % de la médiane**.
   - Tous les seuils sont dans un fichier de configuration.
2. Exclusion des offres en quarantaine et des marchands dont le dernier run n'est pas `success`.
3. Affichage sur le site, derrière feature flag :
   - badge et formulation conformes au principe P4 (« prix le plus bas vu depuis N jours ») ;
   - mention du nombre de jours de suivi ;
   - filtre « vrais bons plans uniquement ».

**Critères d'acceptation :**
- Tests unitaires du calcul (historique insuffisant, trous de données, plusieurs marchands, prix gonflé avant promo).
- Aucun badge affiché pour un produit sous les seuils de confiance.

**Arrêt :** revue d'un échantillon de verdicts avant activation.

---

### Phase 5 — Supervision

**Livrables :**

1. **Page d'administration protégée** (non publique) :
   - par marchand : dernier run, statut, offres vues, taux d'éviction, taux de rejet et de quarantaine ;
   - tendance sur 30 jours.
2. **File de revue unique**, regroupant :
   - offres en quarantaine ;
   - doublons suspects (audit hebdomadaire) ;
   - runs en échec ou partiels.
   Chaque élément peut être validé ou rejeté depuis cette page.
3. **Planification hebdomadaire** de l'audit des doublons, avec alerte si le nombre de suspects augmente.
4. Première **agrégation de `click_events`** (clics par produit, par catégorie, sur 7 et 30 jours), pour préparer la phase 6.

**Objectif de charge :** environ 1 h de revue par semaine, hors réparation d'un scraper cassé.

---

### Phase 6 — Sélection représentative (vitrine) — plus tard

À lancer quand les phases 1 à 5 tournent et que l'historique dépasse 30 jours.

- Fichier de configuration des **références et marques prioritaires** par catégorie, révisé à chaque saison.
- Score de sélection combinant : verdict positif (obligatoire), priorité éditoriale, diversité (catégorie × genre × gamme de prix), puis popularité via `click_events` quand le volume le permet.
- Une courte phrase d'accroche par produit sélectionné, factuelle et basée sur les données (« prix le plus bas vu depuis 74 jours »).

À cadrer en détail le moment venu.

---

## 4. Ce qui restera humain

- Réparer un scraper cassé (changement de site, anti-bot).
- Trancher les cas ambigus de la file de revue.
- Maintenir la VM, les dépendances et les programmes d'affiliation.
- Ajouter un nouveau marchand.
- Réviser les priorités éditoriales à chaque saison.

## 5. Calendrier indicatif

| Phase | Effort estimé | Remarque |
|---|---|---|
| 0 | quelques heures | aucune modification du code |
| 1 | ~1 jour | à démarrer immédiatement |
| 2 | 1–2 jours | + installation sur la VM par un humain |
| 3 | ~1 jour | + revue humaine du CSV |
| 4 | ~1 jour | activation au plus tôt 30 jours après la phase 1 |
| 5 | 1–2 jours | |
| 6 | à cadrer | |

Estimations indicatives, à réviser en phase 0.
