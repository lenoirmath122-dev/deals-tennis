# Journal des sessions

> Sessions du 2026-09-21 au 2026-09-22 (mise en place du protocole jusqu'à la méthode technique de collecte ProTennis) déplacées telles quelles dans `archive/JOURNAL_SESSIONS_2026-09-21_a_2026-09-22-methode-protennis.md` (D-2026-09-22-09/7bis, seuil 150 lignes). Consulter l'archive uniquement si le détail ci-dessous ne suffit pas.

## 2026-09-22 (suite 2) — Build du workflow n8n ProTennis, vérifié de bout en bout

- Reprise en début de conversation : `ETAT_ACTUEL.md` → `GAPS_OUVERTS.md` → dernière entrée du journal lus, protocole confirmé. Commit + push + merge (PR #4, squash) des mises à jour de cadrage laissées non committées par la session précédente, avant de démarrer le build.
- Question soumise (protocole) : aucune instance n8n n'existe — comment la provisionner pour construire/tester réellement ? Docker proposé, absent de la machine ; bascule sur `npx n8n` (installation npm locale, pas de conteneur), confirmé par l'utilisateur avec une préoccupation explicite sur la charge machine et le besoin d'allumage continu — clarifié que l'instance ne servirait qu'au build/test de cette étape, pas à l'hébergement permanent (question séparée, consignée en GAP).
- Deux questions structurantes soumises avant de coder (protocole, décisions non déduites seul) :
  - Fin de vie d'une offre ProTennis sans date de fin visible sur le site → option « désactiver les offres non revues au passage suivant » retenue.
  - Absence de clé d'identification stable pour l'upsert → migration `UNIQUE(merchant_id, affiliate_url)` sur `deals` proposée et validée avant application.
  - **Décision actée (D-2026-09-22-03)** regroupant ces deux points.
- Build réalisé : migration `002_deals_unique_merchant_url.sql` appliquée à la base Neon de prod (vérifiée), marchand `ProTennis` inséré réellement, workflow n8n construit nœud par nœud (HTTP Request, Code de parsing par regex, Postgres upsert, Code de regroupement, Postgres éviction), importé et exécuté via le CLI n8n (`import:workflow` / `execute`) plutôt que via navigation manuelle dans l'UI.
- Plusieurs bugs réels trouvés et corrigés pendant la vérification (pas de simulation) : header `Accept: text/html` requis (sinon PrestaShop renvoie un fragment JSON), échappement bash cassant le `queryReplacement` Postgres, format de paramètres de requête Postgres (tableau JS littéral plutôt que plusieurs `{{ }}`), cast `$2::text[]` plutôt que `$2::jsonb` pour l'éviction.
- L'exécution réelle du workflow (écriture dans la base Neon de prod) a été explicitement confirmée par l'utilisateur avant lancement — bloquée une première fois par le classificateur auto-mode (« Production Deploy »), débloquée après confirmation.
- Vérification de bout en bout avec des données réelles : 23 offres ProTennis réelles insérées et visibles sur `https://deals-tennis.vercel.app` ; idempotence confirmée ; éviction testée réellement (fausse offre insérée puis supprimée après contrôle) ; redirection `/go/[dealId]` testée (clic loggé puis supprimé après contrôle). `npm run lint`, `npm run build`, `npm test` passent.
- Instance n8n locale arrêtée après vérification (pas d'hébergement permanent — GAP-2026-09-22-06, résolu ensuite). Défaut mineur du runner de migration noté sans le corriger (GAP-2026-09-22-07, toujours ouvert).
- Livrables committés : `scripts/migrations/002_deals_unique_merchant_url.sql`, `scripts/automation/n8n-protennis-ingestion-workflow.json`, `scripts/automation/n8n-protennis-ingestion-README.md`.
- Prochaine étape : décider de l'hébergement permanent de n8n (GAP-2026-09-22-06) — à soumettre explicitement en début de prochaine conversation.

## 2026-09-22 (suite 3) — Hébergement permanent n8n construit et vérifié de bout en bout

- Reprise de session (`/clear`), protocole de reprise appliqué. Décision structurante soumise et actée (D-2026-09-22-04) : hébergement n8n sur VM Oracle Cloud Free Tier (Always Free, ARM Ampere), setup/maintenance orchestrés conjointement avec l'utilisateur (aucune compétence serveur de son côté).
- VM provisionnée par l'utilisateur via la console web (`n8n-server`, `VM.Standard.A1.Flex`, 1 OCPU/6 Go, Oracle Linux 9, région `eu-paris-1`), guidée pas à pas. Frictions Oracle réelles résolues (IP publique éphémère assignée après coup, passerelle internet ajoutée).
- Docker + Compose installés par Claude Code en SSH, ports 80/443 ouverts (OS + NSG Oracle). n8n déployé derrière Caddy (HTTPS Let's Encrypt automatique) sur `deals-tennis-n8n.duckdns.org` (DuckDNS), authentification basique en plus du compte propriétaire n8n créé par l'utilisateur.
- Protection anti-fuite d'identifiants de Claude Code a bloqué deux tentatives contenant le mot de passe Neon en clair — comportement voulu ; credential Postgres créée manuellement par l'utilisateur dans l'UI n8n.
- Workflow ProTennis importé, testé manuellement (23 offres, `updated_at` confirmé en base réelle), puis activé — le déclencheur planifié quotidien (6h) tourne désormais en continu.
- **GAP-2026-09-22-06 résolu.** Aucun changement de code applicatif (infrastructure hors dépôt uniquement).
- Prochaine étape : arbitrer le prochain chantier parmi la liste restante (D-2026-09-21-09) — à soumettre explicitement en début de prochaine conversation.

## 2026-09-22 (suite 4/5) — Élargissement du scraping ProTennis : cadrage puis redéfinition de l'axe produit (pas de build)

- Cadrage démarré pour élargir le scraping ProTennis au-delà de la page déstockage (D-2026-09-22-05) : le badge de réduction est présent sur 100% des produits du site, pas un signal distinctif — décision actée d'étendre à toutes les catégories, sans seuil de réduction minimum. GAP-2026-09-22-08 ouvert (affichage multi-marchand d'un même produit à des réductions différentes, non prioritaire tant que ProTennis est seul marchand).
- Au moment de démarrer le build, l'utilisateur a redéfini l'axe central du produit : comparaison de prix multi-marchands pour un même article (GAP-2026-09-22-08 élevé en priorité). Vérification réelle : aucun marchand n'expose de référence fabricant/EAN universelle.
- **Direction actée (D-2026-09-22-06)** : table `products` (marque+modèle+catégorie) + `deals.product_id` nullable, rapprochement par extraction du modèle depuis le titre. Page d'accueil reste centrée deal, recherche devient centrée article, détail d'un deal affiche les autres offres du même article. Modalité du détail (page vs popup) laissée ouverte (GAP-2026-09-22-10). ProTennis repéré comme multi-sports, risque de contamination hors périmètre tennis noté (GAP-2026-09-22-09).
- **Aucune étape de build n'a été démarrée** dans ces deux conversations (cadrage uniquement).
- Prochaine étape : fondation du rapprochement produit (table `products`, migration, parsing, backfill) — à traiter en conversation dédiée.

## 2026-09-22 (suite 6) — Fondation du rapprochement produit multi-marchands (table `products`)

- Reprise de session (`/clear`), protocole appliqué. Périmètre confirmé explicitement avant de coder : fondation seule (table, migration, parsing, backfill des deals existants) — recherche/détail restent des étapes séparées.
- Vérification réelle préalable : `deals.brand` déjà fiable (vient du logo marque côté ProTennis) — seul le modèle est extrait du titre (simplification mineure par rapport à D-2026-09-22-06, documentée).
- Build : migration `003_products.sql`, `lib/product-matching.ts` (`extractModel`, testé sur 6 titres réels), `scripts/backfill-product-ids.ts`.
- Vérification bout en bout avec les 33 deals réels de prod : backfill 33/33, idempotence confirmée, contrôle manuel ligne par ligne. `npm run lint`, `npm run build`, `npm test` (36 tests) passent.
- **GAP-2026-09-22-08 partiellement résolu.** **GAP-2026-09-22-11 ouvert** : le workflow n8n actif ne peuple pas `product_id` sur les nouvelles offres.
- Prochaine étape : intégrer le rapprochement au workflow n8n (GAP-2026-09-22-11) et/ou faire évoluer la recherche — ordre à soumettre explicitement.

## 2026-09-22 (suite 7) — GAP-2026-09-22-11 résolu : rapprochement produit intégré au workflow n8n ProTennis

- Reprise de session, protocole de reprise appliqué. Prochaine étape soumise explicitement à l'utilisateur (4 options) : "n8n → product_id (GAP-11)" choisi.
- Requête d'upsert du workflow (`scripts/automation/n8n-protennis-ingestion-workflow.json`) réécrite en CTE pour résoudre `product_id` au moment de l'upsert du deal, via un miroir JS de `lib/product-matching.ts` (`extractModel`) ajouté au nœud de parsing.
- Vérification réelle contre la base Neon de prod (script temporaire, supprimé après coup) : requête SQL testée avec un deal factice (nouveau produit créé, idempotence confirmée, nettoyage vérifié) ; miroir JS comparé aux 23 offres ProTennis réelles déjà rattachées (0 écart).
- Accès SSH à la VM Oracle (`opc@145.241.173.33`) obtenu de l'utilisateur pour cette étape (clé retrouvée par l'utilisateur dans ses Téléchargements). Workflow réimporté sur l'instance n8n permanente.
- Découverte en cours de route (GAP-2026-09-22-12, résolu dans cette même session) : le workflow était en réalité inactif sur l'instance permanente malgré D-2026-09-22-04. Réactivé via `n8n publish:workflow` (commande courante de n8n 2.40.5, `update:workflow` étant dépréciée) + redémarrage du conteneur (nécessaire selon la CLI elle-même pour que l'activation prenne effet).
- Exécution manuelle réelle déclenchée par l'utilisateur depuis l'UI n8n (CLI `n8n execute` impossible en parallèle du serveur déjà actif, port 5679 occupé) : 23/23 offres ProTennis réelles avec `product_id` peuplé, vérifié en base.
- `ETAT_ACTUEL.md`, `GAPS_OUVERTS.md` mis à jour. Aucune décision structurante nouvelle nécessitant une entrée `DECISIONS_FONCTIONNELLES.md`.
- Diff à committer : uniquement `scripts/automation/n8n-protennis-ingestion-workflow.json` (code) et `n8n-protennis-ingestion-README.md` (doc) — le reste de cette étape est de l'infrastructure distante hors dépôt, comme pour le chantier d'hébergement n8n précédent.
- Prochaine étape : faire évoluer la recherche pour regrouper par `product_id`, puis reprendre l'élargissement du scraping ProTennis à toutes les catégories — ordre à confirmer explicitement en début de prochaine conversation.

## 2026-09-22 (suite 8) — Élargissement du scraping ProTennis à toutes les catégories tennis (D-2026-09-22-08)

- Reprise de session, protocole appliqué. GAP-2026-09-22-09 (contamination multi-sports) tranché en premier : **résolu par exclusion stricte** plutôt qu'élargissement — scraping ciblé sur les 5 slugs de catégories tennis (+ balles/bagagerie rattachées à `accessoires`), filtre de sécurité par mots-clés (squash/padel/badminton/pickleball).
- `lib/product-matching.ts` étendu (préfixes réels par catégorie). Workflow n8n réécrit en un unique Code node parcourant les 5 pages catégories, pagination dynamique, déduplication par `affiliate_url` (2 bugs réels trouvés et corrigés : doublons dus au bloc de recommandations partagé entre pages, regex `\b...\b` ratant les marques composées comme "Bullpadel").
- Vérification réelle en trois temps (standalone Node contre le vrai site, n8n local temporaire, puis exécution réelle depuis l'UI n8n locale contre la base Neon de prod) : **1495 offres actives** sur 5 catégories, 0 fuite multi-sports, 100% avec `product_id` peuplé. Bruit résiduel accepté (0,5% de classification catégorie adjacente, documenté comme limite acceptée).
- Déployé en production sur la VM Oracle (credential réexploitée sans jamais être manipulée en clair), workflow réimporté, republié, conteneur redémarré, `active: true` confirmé.
- `npm run lint`, `npm run build`, `npm test` (39 tests) passent.
- Prochaine étape : à confirmer explicitement — candidats restants : recherche centrée article/détail deal (GAP-2026-09-22-08 reste partiellement ouvert), validation à l'échelle, mentions légales/disclosure affiliation, SEO, accessibilité, observabilité.

## 2026-09-22 (suite 9) — Seuils chiffrés pour l'archivage des fichiers de suivi

- État des lieux demandé par l'utilisateur : constat que la règle d'archivage (D-2026-09-21-04) n'avait jamais été appliquée faute de seuil chiffré — `ETAT_ACTUEL.md` (200 lignes) et `JOURNAL_SESSIONS.md` (336 lignes) bien au-delà d'une synthèse lisible, `archive/` resté vide.
- Découverte en route : une marque de conflit de stash non résolue (`>>>>>>> Stashed changes`) avait été committée par erreur dans `DECISIONS_FONCTIONNELLES.md` par le commit `cb8d3a1` (PR #12). Signalée à l'utilisateur, correction traitée en commit séparé (pas de mélange avec le sujet des seuils).
- Discussion des seuils avec l'utilisateur (options soumises explicitement) → D-2026-09-22-09 actée : `ETAT_ACTUEL.md` et `JOURNAL_SESSIONS.md` à 150 lignes, `GAPS_OUVERTS.md` sans seuil (retrait immédiat d'un gap tranché), `DECISIONS_FONCTIONNELLES.md` jamais archivé (registre consulté par référence d'ID, motif expliqué à l'utilisateur qui a confirmé après question).
- `DECISIONS_FONCTIONNELLES.md` et `INDEX.md` mis à jour. Mémoire persistante (feedback méthode de travail) mise à jour avec ces seuils.
- Deux PR ouvertes sur demande explicite : #13 (fix marque de conflit) et #14 (seuils D-2026-09-22-09). Pas encore mergées.
- **Aucune étape de build n'a été démarrée** dans cette conversation (conforme au protocole, confirmé explicitement par l'utilisateur).
- Prochaine étape : une fois les PR #13/#14 mergées, appliquer la condensation + archivage à `ETAT_ACTUEL.md` et `JOURNAL_SESSIONS.md` (déjà au-delà des seuils décidés) — dans une conversation dédiée.

## 2026-09-23 — Recherche centrée article + détail deal (D-2026-09-22-06/17, résolution de GAP-2026-09-22-08/10)

- Reprise de session (`/clear`), protocole appliqué (ETAT_ACTUEL → GAPS_OUVERTS). L'utilisateur a choisi « recherche centrée article/détail deal » comme prochaine étape.
- Deux décisions structurantes soumises et actées avant de coder :
  - **D-2026-09-22-10** : détail d'un deal affiché sur une **page dédiée** `/deal/[dealId]` (pas de popup).
  - **D-2026-09-22-11** : le regroupement par article dans le catalogue ne s'applique **que lorsqu'une recherche est active** — navigation par défaut (catégorie/tri sans `q`) inchangée, une carte = un deal.
- Build réalisé :
  - `lib/deals.ts` : `getCatalogDeals` bascule en requête groupée (fenêtrage SQL `ROW_NUMBER()`/`COUNT() OVER` par `COALESCE(product_id, id)`, représentant = offre la moins chère) dès qu'un `q` non vide est fourni ; `getDealDetail(dealId)` (nouveau) renvoie `"not-found"` / `"expired"` / `{ deal, otherOffers }` (autres offres actives du même `product_id`, triées par prix croissant).
  - `types/database.ts` : `DealCardData.offer_count?` (présent uniquement en mode groupé), nouveau type `DealDetail`.
  - `components/deal-card.tsx` : la carte pointe vers `/deal/[id]` avec un badge « X offres » quand `offer_count > 1`, sinon comportement inchangé (lien direct `/go/[id]`, nouvel onglet) — décision mineure auto-décidée découlant directement des deux décisions actées.
  - `app/deal/[dealId]/page.tsx` (nouveau) : Server Component — deal principal + CTA `/go/[dealId]`, section « Autres offres pour cet article » (si présentes), redirection vers `/?notification=deal-expired` ou `/?notification=deal-not-found` selon le cas (réutilise le mécanisme de bannière existant, cohérent avec `/go/[dealId]`).
- Bug trouvé et corrigé en cours de vérification manuelle : la page détail renvoyait toujours `deal-not-found`, y compris pour un deal expiré — corrigé en distinguant les deux cas dans `getDealDetail` (retour `"not-found" | "expired" | DealDetail` plutôt qu'un simple `null`).
- Tests ajoutés : `tests/contract/catalog-query.test.ts` (3 nouveaux tests, mode groupé, contre un vrai produit multi-marchand réel en base — "Babolat Pure Aero 2023", ProTennis + marchand seed), `tests/contract/deal-detail.test.ts` (nouveau, 4 tests), `tests/e2e/catalog.spec.ts` (2 nouveaux tests : recherche groupée → détail → clic vers une offre marchande dans un nouvel onglet ; détail d'un deal expiré → redirection avec bannière).
- Vérification bout en bout avec données réelles de production : recherche `?q=Pure%20Aero` affiche bien 1 carte groupée avec badge, navigation normale (`/`) inchangée (aucun badge, liens directs `/go/`), page détail testée sur le produit réel (2 offres, autres offres listées), cas deal introuvable et deal expiré vérifiés (redirection + bon message).
- Incident mineur : un serveur `next dev` de vérification laissé actif par erreur a bloqué le démarrage du serveur e2e (port déjà utilisé) — process arrêté, `.next/` supprimé par précaution (cohérent avec l'incident déjà documenté en Phase 7), rebuild propre confirmé avant de relancer les e2e.
- `npm run lint`, `npm run build`, `npm test` (50 tests) et `npm run test:e2e` (8 tests) passent tous sans erreur.
- **GAP-2026-09-22-10 résolu** (page dédiée actée). **GAP-2026-09-22-08 résolu** (recherche centrée article + détail deal construits et vérifiés).
- Diff non committé à la fin de cette conversation (laissé à la revue de l'utilisateur, conforme au protocole — pas de commit/push sans demande explicite).
- Prochaine étape : non tranchée — à soumettre explicitement en début de prochaine conversation. Candidats restants : élargissement scraping à d'autres marchands (dépend toujours de GAP-2026-09-21-03, Awin), validation à l'échelle, mentions légales/disclosure affiliation, SEO, accessibilité, observabilité.

## 2026-09-23 (suite) — Cadrage du monitoring n8n (D-2026-09-23-01, GAP-2026-09-23-01)

- Reprise de session (`/clear`), protocole appliqué (ETAT_ACTUEL → GAPS_OUVERTS). Constat en route : le diff « recherche centrée article + détail deal » noté « non commité » dans `ETAT_ACTUEL.md` avait en fait été mergé entretemps (PR #16, `c3ed96c`) — corrigé.
- Prochaine étape soumise explicitement à l'utilisateur : chantier « Observabilité/monitoring » (n°11 de D-2026-09-21-09) choisi, périmètre restreint au monitoring du cron n8n ProTennis (déclencheur : GAP-2026-09-22-12).
- Trois mécanismes d'alerte présentés et comparés en détail (avantages/inconvénients) à la demande de l'utilisateur : dead man's switch externe (healthchecks.io), vérification côté app (Vercel Cron + email), alerte native n8n (2e workflow). Recommandation donnée (option 1, découplage du point de défaillance observé) et suivie par l'utilisateur.
- **D-2026-09-23-01** actée : healthchecks.io retenu.
- **Aucune étape de build n'a été démarrée** dans cette conversation, conformément au protocole (une étape de build par conversation) — l'utilisateur a explicitement demandé de reporter la mise en œuvre à une conversation dédiée.
- `GAPS_OUVERTS.md` : nouveau `GAP-2026-09-23-01` ouvert (mécanisme décidé, build restant). `DECISIONS_FONCTIONNELLES.md` et `ETAT_ACTUEL.md` mis à jour.
- Prochaine étape : construire le monitoring n8n (GAP-2026-09-23-01) — création du compte/check healthchecks.io par l'utilisateur, ajout du nœud HTTP de ping au workflow n8n, vérification réelle bout en bout.

## 2026-09-23 (suite 2) — Feuille de route confirmée (pas de build)

- Reprise de session, état d'avancement général demandé par l'utilisateur (résumé donné : MVP/prod/n8n opérationnels, bloquants identifiés : photo hero, monitoring, marchand unique).
- Ordre des 4 prochains chantiers confirmé explicitement par l'utilisateur : (1) monitoring n8n, (2) charte graphique, (3) ajout de marchands, (4) reste (CGU/mentions légales, SEO, accessibilité...). Consigné dans `ETAT_ACTUEL.md`.
- **Aucune étape de build n'a été démarrée** dans cette conversation, conformément au protocole.
- Prochaine étape : construire le monitoring n8n (GAP-2026-09-23-01) — étape 1 de la feuille de route, à traiter en conversation dédiée.

## 2026-09-23 (suite 3) — Monitoring n8n construit et vérifié de bout en bout (GAP-2026-09-23-01 résolu)

- Reprise de session (`/clear`), protocole appliqué. Commit des 4 fichiers de cadrage laissés non committés par la session précédente sur une branche dédiée (`docs/cadrage-monitoring-n8n`), pas de push sans demande explicite.
- URL de ping healthchecks.io fournie par l'utilisateur (compte/check créés côté utilisateur). Nœud HTTP Request ajouté à `scripts/automation/n8n-protennis-ingestion-workflow.json`, branché après le nœud d'éviction (ping uniquement si toute la chaîne réussit).
- Vérification réelle en local : port 5679 occupé par un serveur n8n déjà lancé en tâche de fond lors d'une tentative précédente — arrêté pour libérer le port, puis deux exécutions `n8n execute` réelles (site ProTennis + base Neon de prod réels) terminées `status: success`, ping reçu par healthchecks.io (`"data": "OK"`) à chaque fois. Simulation d'échec via l'endpoint dédié `/fail` : check passé à "Down", alerte email réellement déclenchée et **confirmée par l'utilisateur** (seule vérification qu'il devait faire lui-même, accès à sa boîte mail) ; ping de succès renvoyé ensuite pour revenir à l'état normal.
- Déploiement sur l'instance n8n permanente (VM Oracle) : accès SSH redonné par l'utilisateur (clé `ssh-key-2026-09-22.key` placée dans le repo, `*.key` ajouté à `.gitignore` par précaution avant toute autre action). Deux actions bloquées par le classificateur auto-mode (accès SSH puis commande de republication du workflow) débloquées après confirmation explicite de l'utilisateur à chaque fois. Workflow réimporté, republié (`n8n publish:workflow`), conteneur redémarré, `active: true` confirmé par export, fichiers temporaires nettoyés sur la VM.
- Effet de bord découvert en vérifiant `npm test` après les runs réels : les `UPDATE` du workflow ont changé l'ordre physique des lignes en base, exposant un `LIMIT 1` sans `ORDER BY` dans `tests/contract/deal-detail.test.ts` (dépendait implicitement d'un ordre de résultat non garanti). Signalé à l'utilisateur comme diff sans rapport avec le monitoring avant correction (protocole point 4) ; correctif validé et appliqué (titre précis au lieu d'un `ILIKE` large).
- `npm run lint`, `npm run build`, `npm test` (46 tests) passent tous sans erreur.
- **GAP-2026-09-23-01 résolu.**
- Question posée par l'utilisateur en cours de session : possibilité d'autorisation permanente pour les actions bloquées par l'auto-mode — répondu qu'une règle de permission durable est possible via `.claude/settings.json` (skill `update-config`), proposé pour une prochaine fois sans interrompre le déploiement en cours.
- Prochaine étape : chantier « Charte graphique / design system » (étape 2 de la feuille de route), toujours bloqué sur GAP-2026-09-21-04 (photo hero) — comment avancer malgré ce blocage à soumettre explicitement en début de prochaine conversation.
