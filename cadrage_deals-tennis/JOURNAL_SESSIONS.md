# Journal des sessions

## 2026-09-21 — Mise en place du protocole de travail

- L'utilisateur a communiqué son protocole de travail complet pour le projet (cadrage préalable, décisions soumises explicitement, une étape de build par conversation, vérification avec données réelles, flux git via PR, traçabilité des points ouverts) — voir D-2026-09-21-01.
- Constat : le dossier contenait déjà de la documentation spec-kit (spec, plan, tasks, data-model, research, quickstart, checklists, contracts) mais pas de dépôt git ni de structure de cadrage.
- Décisions actées avec confirmation explicite de l'utilisateur :
  - D-2026-09-21-02 : réorganisation de la documentation existante dans `cadrage_deals-tennis/`.
  - D-2026-09-21-03 : initialisation d'un dépôt git local (`git init`), deux commits (import brut, puis restructuration), pas de remote, pas de push.
- Point ouvert soulevé : `tasks.md` contient des cases cochées qui ne correspondent à aucun code réel (GAP-2026-09-21-01) — à trancher par l'utilisateur.
- **Aucune étape de build n'a été démarrée** dans cette conversation (conforme au protocole : le cadrage n'est pas encore clos).
- Prochaine étape : non tranchée, à soumettre explicitement à l'utilisateur (voir ETAT_ACTUEL.md).
- Ajout ultérieur dans la même session : politique d'archivage des fichiers de suivi définie et actée (D-2026-09-21-04). Dossier `archive/` créé (vide). `INDEX.md` mis à jour pour la référencer.

## 2026-09-21 (suite) — Clôture du cadrage fonctionnel

- Reprise de session, protocole de reprise appliqué (INDEX → ETAT_ACTUEL → GAPS_OUVERTS → journal).
- Deux décisions structurantes soumises et actées par l'utilisateur :
  - D-2026-09-21-05 : `tasks.md` repris tel quel mais entièrement décoché, liens vers l'ancien emplacement corrigés. Ferme GAP-2026-09-21-01.
  - D-2026-09-21-06 : cadrage fonctionnel considéré clos, pas de revue complète de `spec.md`/`plan.md`.
- **Aucune étape de build n'a été démarrée** dans cette conversation (travail de cadrage/documentation uniquement).
- Prochaine étape : Phase 1 de `tasks.md` (setup Next.js + TypeScript + Tailwind), à traiter dans une conversation dédiée.

## 2026-09-21 (suite 2) — Phase 1 : setup du projet Next.js (T001-T003)

- Reprise de session, protocole de reprise appliqué (ETAT_ACTUEL → GAPS_OUVERTS → dernière entrée du journal).
- Décision structurante soumise et actée : D-2026-09-21-07 — `create-next-app` (dernière version) scaffold par défaut Next.js 16.3.5 / React 19 / Tailwind CSS v4 (config CSS-first, pas de `tailwind.config.ts`), divergeant du libellé littéral de T001. L'utilisateur a choisi de garder Tailwind v4 tel quel plutôt que de downgrader vers v3.
- `create-next-app` refusant de scaffolder dans un dossier non vide (présence de `cadrage_deals-tennis/`), le projet a été généré dans un sous-dossier temporaire puis déplacé à la racine du dépôt (historique git non affecté, aucun commit du sous-dossier temporaire).
- T001 : projet Next.js/TypeScript/Tailwind v4 initialisé, `package.json` renommé `deals-tennis`.
- T002 : dépendances runtime (`@neondatabase/serverless`, `lucide-react`, `clsx`, `tailwind-merge`) et testing (`vitest`, `@playwright/test`) installées. Conflit de peer dependency résolu en montant `@types/node` de `^20` à `^24` (aligné sur Node 24 installé localement).

## 2026-09-21 (suite N) — Chantier V2 n°1 : Déploiement production

- Reprise de session, protocole de reprise appliqué. Utilisateur invité à choisir le prochain chantier V2 parmi la liste validée (D-2026-09-21-09) → « Déploiement production ».
- Décision structurante soumise et actée : D-2026-09-21-10 — CLI Vercel direct (pas de lien GitHub, réservé au chantier 2 CI), réutilisation de l'instance Neon existante comme base prod, domaine par défaut `*.vercel.app`.
- `vercel link --yes` : projet Vercel `lenoir-nba/deals-tennis` créé et lié. `DATABASE_URL` ajouté en variable d'environnement Production (Sensitive) sur Vercel.
- `vercel --prod` : build réussi, déploiement `READY`, alias production `https://deals-tennis.vercel.app`.
- Vérification manuelle bout en bout avec données réelles sur l'URL de production : catalogue affiché (offres réelles), redirection `/go/[dealId]` testée (307 + clic loggé dans `click_events`, base prod = base dev). Ligne de clic de vérification supprimée après contrôle, nettoyage vérifié (0 ligne résiduelle liée au test).
- Chantier 1 terminé et clos.
- Prochaine étape : non tranchée, à soumettre explicitement à l'utilisateur en début de prochaine conversation (chantiers 2 à 12 restants, voir D-2026-09-21-09).
- T003 : `.env.example` créé avec `DATABASE_URL`. `.gitignore` corrigé (`.env*` excluait aussi `.env.example` par erreur — ajout d'une exception `!.env.example`).
- Vérification : `npm run lint` et `npm run build` passent tous les deux sans erreur (un warning Next.js sans rapport, sur un `package.json` situé hors du dépôt dans `C:\dev`, non modifié).
- `tasks.md` : T001, T002, T003 cochées, avec précision sur le choix Tailwind v4 pour T001.
- **Une seule étape de build traitée dans cette conversation** (Phase 1 uniquement, conforme au protocole) — pas d'enchaînement sur la Phase 2 (fondations DB).
- Prochaine étape : Phase 2 de `tasks.md` (T004-T008, fondations DB), à traiter dans une conversation dédiée. Nécessitera une instance Neon réelle pour la vérification avec données réelles.

## 2026-09-21 (suite 3) — Phase 2 : fondations DB (T004-T008)

- Reprise de session, protocole de reprise appliqué (ETAT_ACTUEL → GAPS_OUVERTS → dernière entrée du journal).
- Décision structurante soumise et actée : instance Neon provisionnée via le compte Neon existant de l'utilisateur (pas via Marketplace Vercel), création du projet `deals-tennis` (id `floral-mountain-74046188`, région `aws-eu-central-1`) faite par Claude avec le CLI `neonctl` déjà authentifié sur le compte de l'utilisateur.
- T004 : migration SQL écrite (`scripts/migrations/001_init_schema.sql`) conforme à `data-model.md`, appliquée sur l'instance réelle via un script `scripts/migrate.ts` (exécution Node 24 native TypeScript, `npm run db:migrate`). Un bug de découpage des instructions SQL (un commentaire d'en-tête fusionné avec le premier `CREATE TABLE` faisait perdre toute la table `merchants`) a été détecté à la première exécution échouée, corrigé, puis la migration a été rejouée avec succès. Vérification directe en base (tables, index, contraintes CHECK) conforme.
- T005 : seed (`scripts/seed.ts`, `npm run db:seed`) : 3 marchands, 10 offres couvrant les 5 catégories avec mélange actif/expiré. Donnée conservée en base sur décision explicite de l'utilisateur (ce n'est pas une donnée éphémère de test mais le jeu de données de développement prévu par la tâche).
- T006 : types TypeScript (`types/database.ts`) alignés champ à champ sur `data-model.md`.
- T007 : `lib/db.ts` utilisant `neon()` (mode one-shot fetch) après vérification du README/CONFIG.md réellement installés du package `@neondatabase/serverless` (v1.1.0) — cohérent avec le socle Node.js/Fluid Compute (pas besoin du runtime edge).
- T008 : `app/layout.tsx` mis à jour (`lang="fr"`, métadonnées SEO dédiées) ; `app/globals.css` laissé tel quel (pas de charte graphique définie).
- Vérification : `npm run lint` et `npm run build` passent sans erreur.
- **Une seule étape de build traitée dans cette conversation** (Phase 2 uniquement, conforme au protocole) — pas d'enchaînement sur la Phase 3.
- Prochaine étape : Phase 3 de `tasks.md` (T009-T015, User Story 1 / MVP : catalogue paginé), à traiter dans une conversation dédiée.

## 2026-09-21 (suite 4) — Phase 3 : User Story 1 / MVP catalogue paginé (T009-T015)

- Reprise de session, protocole de reprise appliqué (ETAT_ACTUEL → GAPS_OUVERTS → dernière entrée du journal). Étape soumise et confirmée par l'utilisateur avant de démarrer.
- Vérification préalable de la doc réellement installée avant codage : `node_modules/next/dist/docs` (searchParams asynchrone en promesse dans Next 16) et `node_modules/@neondatabase/serverless/CONFIG.md` (`sql.query(text, params)` pour construire du SQL dynamique avec placeholders numérotés, distinct du tagged template `sql\`...\``).
- T011 : `lib/deals.ts` implémente `getCatalogDeals` fidèlement au contrat `catalog-query-api.md`.
- Correction mineure auto-décidée (documentée, pas de décision structurante) : `types/database.ts` avait un `CatalogResponse` posé en Phase 2 qui ne correspondait pas au contrat (`total`/`page`/`pageSize` au lieu de l'objet `pagination`) ; corrigé pour matcher le contrat normatif, sans impact car rien ne le consommait encore.
- T012-T014 : composants `DealCard`, `DealGrid` (avec état vide), `Pagination` (numérotée avec ellipses). Choix technique auto-décidé : `<img>` natif plutôt que `next/image` pour les visuels produits, car les domaines d'images marchandes sont arbitraires (alimentés par des workflows n8n externes) et ne peuvent pas être préconfigurés dans `remotePatterns`.
- Décision de périmètre notée (pas une décision structurante nouvelle, découle de la lecture stricte de `tasks.md`/du contrat) : la carte d'offre n'a pas de bouton d'action cliquable en Phase 3 — `/go/[dealId]` n'existe pas encore (US3/Phase 5) et `DealCardData` n'expose pas `affiliate_url`, conformément à FR-006 (ne jamais exposer de lien d'affiliation direct).
- T015 : `app/(catalog)/page.tsx` créé, remplace le placeholder `create-next-app` (`app/page.tsx` supprimé, aucune route dupliquée).
- T009 : `tests/unit/deals.test.ts` pour les helpers `lib/format.ts` (`formatPrice`, `formatDiscountBadge`, `formatFreshnessLabel`) — 6 tests. Un premier échec dû à l'espace insécable (U+00A0) inséré par `Intl.NumberFormat('fr-FR')` a été identifié et corrigé dans les assertions.
- T010 : `tests/contract/catalog-query.test.ts` exécuté contre l'instance Neon réelle (pas de mock) : pagination `per_page=24`, tri `created_at DESC` vérifié, absence des 3 offres expirées du seed confirmée.
- Mise en place de `vitest.config.mts` (config native ESM, alias `@/*`) et du script `npm test` (`node --env-file=.env.local node_modules/vitest/vitest.mjs run`, cohérent avec le pattern déjà utilisé par `db:migrate`/`db:seed`).
- Vérification bout en bout avec données réelles (protocole point 3) : serveur `next dev` lancé (port 3000 déjà occupé par un processus tiers non lié au projet, serveur démarré sur le port 3001), page `/` inspectée via `curl` — 7 offres actives affichées avec prix/réduction/fraîcheur/marchand corrects, les 3 offres expirées absentes, pagination masquée à raison (1 seule page), état vide correct vérifié sur `/?page=2`. Serveur arrêté et fichiers temporaires de vérification nettoyés après contrôle.
- `npm run lint`, `npm run build` et `npm test` passent tous les trois sans erreur ni warning.
- `tasks.md` : T009-T015 cochées.
- **Une seule étape de build traitée dans cette conversation** (Phase 3 uniquement, conforme au protocole) — pas d'enchaînement sur la Phase 4.
- Prochaine étape : Phase 4 de `tasks.md` (T016-T021, User Story 2 : filtrage par catégorie, recherche par mot-clé, tri), à traiter dans une conversation dédiée.

## 2026-09-21 (suite 5) — Phase 4 : User Story 2 / filtrage, recherche, tri (T016-T021)

- Reprise de session, protocole de reprise appliqué (ETAT_ACTUEL → GAPS_OUVERTS → dernière entrée du journal). Étape soumise et confirmée par l'utilisateur avant de démarrer.
- Constat : `lib/deals.ts` implémentait déjà category/sort/q depuis la Phase 3 (le contrat `catalog-query-api.md` fournissait l'implémentation complète dès le départ) ; le travail de T017 a consisté à extraire cette logique dans des fonctions pures testables plutôt qu'à la réécrire.
- Décisions mineures auto-décidées (documentées, pas structurantes) :
  - Catégorie invalide dans l'URL (`isValidCategory` false) traitée comme "aucun filtre" plutôt que transmise telle quelle au SQL (qui aurait renvoyé zéro résultat silencieusement).
  - Debounce de la recherche fixé à 300 ms (non spécifié par le contrat/la spec).
  - Synchronisation `SearchBar` avec l'URL via `key={q}` côté page plutôt qu'un `useEffect` de synchronisation (évite un warning ESLint `react-hooks/set-state-in-effect`).
  - Ajout d'un état vide différencié dans `DealGrid` (message + lien de réinitialisation) pour l'edge case "Catégorie sans offre active" de `spec.md`, non explicitement demandé par `tasks.md` mais couvert par la spec normative.
- Bug potentiel évité (pas une régression réelle, détecté avant livraison) : `components/pagination.tsx` construisait des liens `/?page=X` sans préserver `category`/`sort`/`q` — corrigé en même temps que l'intégration, sinon changer de page aurait silencieusement réinitialisé les filtres actifs.
- Nouveaux fichiers : `lib/filters.ts`, `lib/catalog-url.ts`, `components/category-filter.tsx`, `components/search-bar.tsx`, `components/sort-dropdown.tsx`, `tests/unit/filters.test.ts`.
- Fichiers modifiés : `lib/deals.ts`, `components/pagination.tsx`, `components/deal-grid.tsx`, `app/(catalog)/page.tsx`.
- Vérification bout en bout avec données réelles (protocole point 3) : serveur `next dev` sur port 3001, contrôlé via `curl` — filtre catégorie, recherche insensible à la casse sur titre/marque, tri par réduction vs nouveauté (ordres différents confirmés), résistance à une catégorie invalide (`DROP TABLE` dans l'URL, pas de crash, 200), état vide avec réinitialisation. Serveur et processus arrêtés après contrôle, fichiers temporaires de vérification supprimés.
- `npm run lint`, `npm run build` et `npm test` (17 tests, 3 fichiers) passent tous les trois sans erreur.
- `tasks.md` : T016-T021 cochées.
- **Une seule étape de build traitée dans cette conversation** (Phase 4 uniquement, conforme au protocole) — pas d'enchaînement sur la Phase 5.
- Prochaine étape : Phase 5 de `tasks.md` (User Story 3 : redirection `/go/[dealId]` avec tracking de clic anonymisé RGPD), à traiter dans une conversation dédiée.

## 2026-09-21 (suite 6) — Phase 5 : User Story 3 / redirection trackée vers le marchand (T022-T026)

- Reprise de session, protocole de reprise appliqué (ETAT_ACTUEL → GAPS_OUVERTS → dernière entrée du journal). Étape soumise et confirmée par l'utilisateur avant de démarrer.
- Vérification préalable de la doc réellement installée avant codage : `node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md` (Route Handler avec `params` en Promise) et `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/next-response.md` (`NextResponse.redirect(url, status)`).
- T024 : `lib/tracking.ts` créé — `resolveDeviceType` reprend l'algorithme du contrat `redirection-api.md` tel quel, `cleanReferrerUrl` (décision mineure auto-décidée : ne conserve le `Referer` que s'il est de même origine que la requête, sinon `null`, pour éviter de stocker une URL externe), `recordClickEvent`.
- T025 : `app/go/[dealId]/route.ts` créé, conforme aux 3 cas du contrat `redirection-api.md`. Décision mineure auto-décidée : validation du format UUID avant requête SQL (sinon Postgres lève une erreur de cast sur un id malformé) — traité comme cas 3 (bon plan inexistant). Autre décision mineure : `Cache-Control: no-store, no-cache, must-revalidate` appliqué uniformément aux 3 cas plutôt que seulement aux cas 1 et 2 comme suggéré littéralement par le contrat (le cas 3 ne précisait pas d'en-tête).
- T026 : `components/deal-card.tsx` — toute la carte enveloppée dans un lien `/go/[dealId]`, ouverture en nouvel onglet (`target="_blank"`, décision mineure auto-décidée, non spécifiée par le contrat).
- T022 : `tests/unit/tracking.test.ts` (10 tests : résolution du type d'appareil pour mobile/tablette/desktop/inconnu, nettoyage du referrer même origine/origine externe/malformé).
- T023 : `tests/contract/redirection.test.ts` (3 tests contre l'instance Neon réelle, pas de mock) : offre active → 307 + `Location`=`affiliate_url` réel + clic loggé avec bon `device_type`/`referrer_url` ; offre expirée/inactive du seed → 307 vers `/?notification=deal-expired`, aucun clic loggé ; id inexistant → 307 vers `/?notification=deal-not-found`.
- Point de vigilance identifié et corrigé en cours de session : le test de redirection active insère une vraie ligne dans `click_events` à chaque exécution de `npm test` — contrairement au reste de la suite qui ne fait que lire le seed. Le test a été corrigé pour supprimer explicitement la ligne qu'il vient de créer, vérifié en relançant `npm test` deux fois de suite et en contrôlant `click_events` à 0 ligne après coup.
- Vérification bout en bout avec données réelles (protocole point 3) : serveur `next dev` lancé (port 3001, port 3000 occupé par un processus tiers non lié au projet), `curl` sur une offre active du seed extraite depuis la page catalogue (307, `Location` = URL d'affiliation réelle, clic vérifié en base avec `device_type='mobile'` et `referrer_url` nettoyé), sur l'offre expirée "Wilson Blade 98 v9" du seed (307 vers `/?notification=deal-expired`, 0 clic loggé), sur un UUID inexistant et une chaîne malformée (307 vers `/?notification=deal-not-found` dans les deux cas). Toutes les lignes `click_events` créées pendant la vérification manuelle supprimées explicitement, table revérifiée à 0 ligne avant d'arrêter le serveur. Processus `next dev` identifié par le port en écoute (3001) et arrêté proprement en fin de session.
- `npm run lint`, `npm run build` et `npm test` (30 tests, 5 fichiers) passent tous les trois sans erreur.
- `tasks.md` : T022-T026 cochées.
- **Une seule étape de build traitée dans cette conversation** (Phase 5 uniquement, conforme au protocole) — pas d'enchaînement sur la Phase 6.
- Prochaine étape : non tranchée — Phase 6 de `tasks.md` (User Story 4 : gestion des offres expirées / bannière de notification, T027-T031) existe mais doit être explicitement soumise et confirmée par l'utilisateur en début de prochaine conversation.

## 2026-09-21 (suite 7) — Phase 6 : User Story 4 / éviction automatique des offres expirées (T027-T031)

- Reprise de session, protocole de reprise appliqué (INDEX → ETAT_ACTUEL → GAPS_OUVERTS → dernière entrée du journal). Étape soumise et confirmée par l'utilisateur avant de démarrer.
- Constat : T027 (test de contrat expiration) et T028 (détection d'expiration dans le Route Handler) étaient déjà entièrement couverts par le travail de Phase 5 (`app/go/[dealId]/route.ts` et `tests/contract/redirection.test.ts`), écrits en avance sur le découpage `tasks.md`. Décision mineure auto-décidée : ne pas dupliquer un `tests/contract/expiration.test.ts` redondant, le contrat est déjà vérifié par un test réel contre l'instance Neon.
- T029 : `components/notification-banner.tsx` créé (Client Component, dismissible via `router.replace`, préserve `category`/`sort`/`q` via `buildCatalogHref`). Gère `deal-expired` et `deal-not-found` ; toute autre valeur ignorée silencieusement sans crash.
- T030 : intégré dans `app/(catalog)/page.tsx` (lecture de `notification` depuis les search params, affiché au-dessus du catalogue).
- T031 : `scripts/automation/n8n-eviction-cron.sql` créé, reprend telle quelle la requête d'éviction horaire et l'exemple de payload d'ingestion du contrat normatif `ingestion-contract.md`, avec commentaires explicatifs (script de documentation pour n8n, non exécuté par l'application).
- Vérification bout en bout avec données réelles (protocole point 3) : serveur `next dev` lancé (port 3001), `curl` sur `/?notification=deal-expired` et `/?notification=deal-not-found` (message correct affiché dans les deux cas), sur `/` sans paramètre (aucun bandeau), sur `/?notification=bogus` (aucun bandeau, page toujours 200). Des processus `next dev` résiduels d'une session précédente ont été détectés en tentant d'arrêter le serveur (le port ne se libérait pas) — identifiés via leur ligne de commande et arrêtés explicitement ; port revérifié comme ne répondant plus (`curl` → code `000`) avant de conclure.
- `npm run lint`, `npm run build` et `npm test` (30 tests, 5 fichiers, inchangé) passent tous les trois sans erreur.
- `tasks.md` : T027-T031 cochées (T027/T028 annotées comme déjà couvertes par la Phase 5).
- **Une seule étape de build traitée dans cette conversation** (Phase 6 uniquement, conforme au protocole) — pas d'enchaînement sur la Phase 7.
- Prochaine étape : non tranchée — Phase 7 de `tasks.md` (Polish & Cross-Cutting Concerns : fallback image cassée T032, suite de tests e2e Playwright T033, validation `quickstart.md` T034) existe mais doit être explicitement soumise et confirmée par l'utilisateur en début de prochaine conversation.

## 2026-09-21 (suite 8) — Phase 7 : Polish & Cross-Cutting Concerns (T032-T034)

- Reprise de session, protocole de reprise appliqué (INDEX → ETAT_ACTUEL → GAPS_OUVERTS → dernière entrée du journal). Étape soumise et confirmée par l'utilisateur avant de démarrer.
- T032 : 6 placeholders SVG créés dans `public/placeholders/` (un par catégorie + un générique). `components/deal-image.tsx` créé (Client Component) pour gérer le fallback `onError` sur l'image — extrait de `deal-card.tsx` qui reste un Server Component (choix mineur auto-décidé : un `onError` nécessite un composant client, isoler juste l'`<img>` évite de rendre toute la carte client).
- T033 : Chromium installé via `npx playwright install chromium` (absent jusqu'ici). `playwright.config.ts` créé (webServer `next dev` dédié port 3100, projet `chromium` seul — cohérent avec l'absence de besoin cross-browser à ce stade). Script `test:e2e` ajouté sur le même pattern que `npm test` (`node --env-file=.env.local ...`, car Playwright ne charge pas `.env.local` comme Next.js le fait pour son propre serveur). `tests/e2e/catalog.spec.ts` (6 tests) : navigation catalogue, filtre catégorie, recherche, tri, redirection `/go/[dealId]` (vérifiée directement contre l'instance Neon réelle via `lib/db.ts` plutôt qu'en laissant le navigateur suivre la redirection externe vers le vrai marchand — évite un appel réseau réel vers un site tiers pendant les tests ; ligne `click_events` créée par le test supprimée explicitement après coup, sur le même modèle que `tests/contract/redirection.test.ts`), bannière de notification.
- Incident détecté et résolu en cours de session (pas une régression du code applicatif) : `npm run build` a échoué juste après l'exécution de la suite e2e avec des erreurs TypeScript dans `.next/dev/types/routes.d.ts` (fichier généré, JS invalide) — causé par deux serveurs `next dev` écrivant ce fichier en parallèle (celui de Playwright + un autre resté actif). Résolu en supprimant `.next/` (dossier généré, non versionné) puis en relançant `npm run build`, qui passe sans erreur.
- T034 : scénarios de `quickstart.md` rejoués manuellement avec un serveur `next dev` dédié (port 3101) contre des données réelles — catalogue par défaut (7 offres), filtre catégorie chaussures (2), recherche "Babolat" (2), tri par réduction (ordre décroissant vérifié), bannières `deal-expired`/`deal-not-found` (texte correct ; une vérification `curl`+`grep` initiale a semblé échouer sur l'apostrophe de "vient d'expirer" — faux négatif dû à l'encodage HTML `&#x27;` dans la réponse brute, pas un bug, confirmé en cherchant juste "expirer"). Serveur de vérification arrêté et confirmé injoignable (`curl` → `000`).
- Vérification finale : `npm run lint`, `npm run build`, `npm test` (30 tests, 5 fichiers, inchangé) et `npm run test:e2e` (6 tests, nouveau) passent tous les quatre sans erreur.
- `tasks.md` : T032-T034 cochées — **T001-T034, toutes les tâches de `tasks.md`, sont maintenant terminées.**
- **Une seule étape de build traitée dans cette conversation** (Phase 7 uniquement, conforme au protocole).
- Prochaine étape : non tranchée — `tasks.md` est intégralement terminé, aucune phase suivante n'existe dans le cadrage actuel. Le sujet à traiter ensuite (déploiement en production, ou autre chantier) doit être explicitement soumis et confirmé par l'utilisateur en début de prochaine conversation.

## 2026-09-21 (suite 9) — Ouverture du cycle de cadrage V2 (post-MVP)

- Reprise de session, protocole de reprise appliqué (INDEX → ETAT_ACTUEL → GAPS_OUVERTS → dernière entrée du journal).
- Question posée par l'utilisateur : basculer sur l'outil `specify` (GitHub spec-kit) pour ce nouveau cadrage ? Constat : `specify` est installé sur la machine (`C:\Users\lenoi\.local\bin\specify.exe`) mais jamais initialisé dans ce dépôt (pas de `.specify/`) ; la structure `cadrage_deals-tennis/` actuelle mime déjà les artefacts spec-kit mais a été importée/gérée à la main.
- Décision structurante soumise et actée : D-2026-09-21-08 — on reste en mode manuel avec le protocole existant, pas de bascule vers spec-kit (l'enchaînement automatique des commandes spec-kit entrerait en tension avec la règle "aucune décision structurante déduite seule").
- Méthode du nouveau cycle de cadrage V2 précisée par l'utilisateur : d'abord identifier la liste complète des specs à construire pour la suite du projet, puis les construire une par une, une spec par conversation.
- **Aucune étape de build ni de rédaction de spec n'a été démarrée** dans cette conversation (juste le cadrage de la méthode).
- Prochaine étape : identifier la liste complète des specs à construire pour la V2, dans une conversation dédiée.

## 2026-09-21 (suite 10) — Liste des chantiers V2 identifiée et validée

- Reprise de session, protocole de reprise appliqué.
- Commit des fichiers de suivi laissés en attente (clôture Phase 7, documentée mais pas commitée précédemment).
- Liste candidate de 12 chantiers V2 proposée à partir des zones hors-scope V1 explicites (`spec.md`/`plan.md`) et des points laissés ouverts pendant le build MVP (charte graphique jamais définie, SEO/a11y/observabilité non traités, RGPD/légal absent, GAP-2026-09-21-02 sur la CI).
- Liste validée telle quelle par l'utilisateur ("soit exhaustif" comme seule consigne) — actée en D-2026-09-21-09.
- **Aucune étape de build ni de rédaction de spec détaillée n'a été démarrée** dans cette conversation (juste l'identification de la liste, conforme à l'étape prévue).
- Prochaine étape : arbitrer l'ordre de traitement des 12 chantiers, puis cadrer le premier retenu — à soumettre explicitement en début de prochaine conversation, ne pas déduire seul.

## 2026-09-21 (suite 11) — Chantier 1 : déploiement production Vercel (entrée rétroactive)

- Session non journalisée au moment des faits — entrée ajoutée rétroactivement le 2026-09-21 à la demande de l'utilisateur pour combler l'écart de traçabilité, à partir du détail déjà présent dans `ETAT_ACTUEL.md`.
- Décision actée : D-2026-09-21-10 — méthode de déploiement : CLI Vercel direct (pas de lien GitHub, réservé au chantier CI), réutilisation de l'instance Neon existante comme base de données prod, domaine par défaut `*.vercel.app`.
- Projet Vercel créé et lié (`lenoir-nba/deals-tennis`, `.vercel/project.json` non versionné), `DATABASE_URL` configuré en variable d'environnement Production (Sensitive) sur Vercel.
- Déploiement `vercel --prod` effectué, build réussi, état `READY`. URL de production : `https://deals-tennis.vercel.app`.
- Vérification manuelle bout en bout sur l'URL de production réelle : catalogue 200 OK avec offres réelles, redirection `/go/[dealId]` testée sur une offre réelle (307 + `Location` correcte, clic loggé dans `click_events` — base prod = base dev, partagée). Ligne de clic de vérification supprimée après contrôle via un script temporaire (`scripts/tmp-verify-cleanup.mjs`), créé puis supprimé, table revérifiée.
- Commit `dc6025d` (« chore: déploiement production Vercel (chantier V2 n°1) »).
- Prochaine étape : arbitrer l'ordre des 11 chantiers restants — tranché en début de conversation suivante : Chantier « CI + protection de branche » retenu en premier.

## 2026-09-21 (suite 12) — Chantier « CI + protection de branche »

- Reprise de session, protocole de reprise appliqué (ETAT_ACTUEL → GAPS_OUVERTS → dernière entrée du journal). Entrée rétroactive du déploiement ajoutée en début de conversation (voir suite 11), commitée séparément (`da0bb12`).
- Ordre des chantiers V2 arbitré et confirmé par l'utilisateur : « CI + protection de branche » en premier — actée en D-2026-09-21-11.
- Cadrage du contenu détaillé soumis et confirmé avant toute action : plateforme GitHub, repo privé, CI limitée à lint/build/tests unitaires (tests de contrat/e2e restent manuels, dépendent de la vraie base Neon partagée dev/prod), branche protégée avec CI obligatoire avant merge, pas de review obligatoire (solo dev).
- Constat technique découvert en cours de cadrage (avant de coder) : `lib/db.ts` évalue la connexion Neon au chargement du module, donc `next build` échoue sans `DATABASE_URL` même en excluant les tests de contrat — vérifié concrètement en lançant `npm run build` sans `.env.local` présent, qui plante avec l'erreur attendue. Confirmé avec l'utilisateur que `DATABASE_URL` serait quand même nécessaire comme secret CI pour le step build.
- Script `test:unit` ajouté à `package.json` (`vitest run tests/unit`, sans `--env-file`) pour isoler les tests unitaires des tests de contrat en CI — vérifié en local (24 tests passent avec `DATABASE_URL` fourni via `--env-file=.env.local` pour l'exécution manuelle, car `lib/tracking.ts` importe `lib/db.ts` même pour les fonctions pures testées).
- `.github/workflows/ci.yml` créé (lint + build + test:unit sur push/PR vers `master`, Node 24, `DATABASE_URL` en variable d'env depuis les secrets).
- Dépôt GitHub privé `lenoirmath122-dev/deals-tennis` créé via `gh repo create --private --source=. --remote=origin`, remote `origin` ajouté (aucun remote n'existait avant).
- `git push -u origin master` : confirmé explicitement par l'utilisateur avant exécution (conforme au protocole « jamais de push sans demande explicite »).
- Secret GitHub Actions `DATABASE_URL` ajouté via `gh secret set --env-file .env.local` — action bloquée une première fois par le classifieur auto mode (écriture de secret), relancée après confirmation explicite de l'utilisateur. `VERCEL_OIDC_TOKEN` (présent dans le même `.env.local` suite à un `vercel env pull` antérieur) a été envoyé par erreur en même temps — détecté, signalé à l'utilisateur et supprimé du repo GitHub avec son accord (non utilisé par la CI).
- Réglages de merge du repo configurés (`gh repo edit`) : squash uniquement, suppression automatique de branche après merge — conforme au protocole point 4.
- Protection de branche `master` activée via l'API GitHub (`gh api -X PUT .../protection`) : check `build-and-test` obligatoire, force-push et suppression de branche interdits.
- Vérification bout en bout avec de vraies actions GitHub (protocole point 3) : PR #1 ouverte pour clôturer GAP-2026-09-21-02, CI réellement exécutée et passée (`build-and-test`, 44s), merge squash effectué avec suppression automatique de la branche confirmée.
- Point de vigilance détecté et corrigé en cours de vérification : un test de push direct sur `master` a été accepté par GitHub malgré la protection (message « Bypassed rule violations », car `enforce_admins` était à `false` — le propriétaire du repo pouvait encore bypasser la règle). Signalé à l'utilisateur, qui a confirmé l'activation de `enforce_admins=true`. Le push direct a été retesté après correction et rejeté comme attendu (`GH006: Protected branch update failed`). Le commit de test vide du premier essai (`f9eff76`, aucun fichier modifié) reste dans l'historique de `master` — pas de réécriture d'historique déjà publié.
- `npm run lint` et `npm run build` (avec `DATABASE_URL`) passent ; `npm run test:unit` (24 tests) passe.
- `GAPS_OUVERTS.md` : GAP-2026-09-21-02 clos.
- **Une seule étape de build traitée dans cette conversation** (chantier « CI + protection de branche » uniquement).
- Prochaine étape : arbitrer lequel des 10 chantiers V2 restants traiter ensuite — à soumettre explicitement en début de prochaine conversation, ne pas déduire seul. Toute contribution future à `master` doit désormais passer par une PR (plus de push direct, y compris pour l'utilisateur).

## 2026-09-21 (suite 13) — Clarification chantier « Automatisation n8n » (pas de build)

- Reprise de session, protocole de reprise appliqué (ETAT_ACTUEL → GAPS_OUVERTS → dernière entrée du journal).
- Chantier « Automatisation n8n » proposé en premier parmi les 10 restants ; l'utilisateur a demandé une explication du fonctionnement avant de trancher (qui récupère les données, qui choisit les marchands, qui trie).
- Explicité à partir du cadrage existant : le contrat `ingestion-contract.md` définit uniquement le *format d'arrivée* des données côté `deals` (payload JSON, règles de calcul, cron d'éviction) et interdit tout scraping/logique d'ingestion dans le code du site (FR-008, principe constitutionnel). Rien n'est défini sur *comment* les données sont obtenues (méthode de collecte par marchand), *qui* sont les marchands partenaires (liste vide au-delà des 3 fictifs du seed), ni les règles de tri/qualité en amont de l'insertion. Alimentation de `merchants` non couverte par le contrat actuel.
- Malentendu de l'utilisateur clarifié : n8n est un outil d'orchestration (comme Zapier/Make), il ne sait pas de lui-même quels sites regarder ni quelles offres sont pertinentes — cela doit être configuré, ce qui constitue précisément le cadrage restant à faire pour ce chantier.
- Décision de l'utilisateur : le cadrage du chantier « Automatisation n8n » (marchands ciblés, méthode de récupération par marchand, règles de qualité/tri) sera fait explicitement lors de la **prochaine conversation**, pas dans celle-ci.
- **Aucune étape de build ni de cadrage détaillé n'a été démarrée** dans cette conversation (clarification conceptuelle uniquement).
- Prochaine étape : démarrer le cadrage du chantier « Automatisation n8n » (identification des marchands partenaires visés, méthode de récupération envisageable par marchand, règles de tri/qualité) — à traiter dans la prochaine conversation.

## 2026-09-21 (suite 14) — Cadrage chantier « Automatisation n8n » : liste des marchands (pas de build)

- Reprise de session, protocole de reprise appliqué. Commit local des mises à jour de suivi de la conversation précédente (`88cba24`), pas de push.
- Cadrage démarré par la liste des marchands partenaires visés. L'utilisateur : rien n'est encore construit côté partenariats, cible aussi bien des marques que des revendeurs, demande si 10 marchands est réaliste.
- Recherche web effectuée (grandes marques : Babolat, Wilson, Head, Dunlop, Yonex ; revendeurs FR : Tennispro.fr, Sport 2000, Tennis Point, Padel-Point). Seuls **Tennis Point FR** et **Padel-Point FR** (réseau Awin) ont un programme d'affiliation public confirmé, plus **adidas FR** (Awin, généraliste sport). Aucun programme confirmé pour Babolat, Head, Dunlop, Yonex, Tennispro.fr, Sport 2000 — pas d'impossibilité, juste pas de programme public trouvé par recherche web ; une démarche manuelle (contact direct) serait nécessaire, hors périmètre de cette session.
- **Décision actée (D-2026-09-21-12)** : pas de liste figée à 10 marchands a priori. Démarrage avec les marchands confirmés (Tennis Point FR, Padel-Point FR — adidas FR à évaluer à part), liste enrichie au fil de l'eau à mesure que l'utilisateur obtient réellement l'acceptation d'un programme d'affiliation pour un nouveau marchand.
- **Aucune étape de build n'a été démarrée** dans cette conversation (cadrage uniquement, un seul sous-point du chantier n8n traité — la liste des marchands).
- Prochaine étape : méthode de récupération des offres pour Tennis Point FR / Padel-Point FR (vérifier si leur programme Awin fournit un flux produit/prix exploitable, ou s'il faut une autre méthode) — à traiter dans la prochaine conversation.

## 2026-09-21 (suite 15) — Cadrage chantier « Automatisation n8n » : méthode de récupération Tennis Point FR / Padel-Point FR (pas de build)

- Reprise de session, protocole de reprise appliqué (ETAT_ACTUEL → GAPS_OUVERTS → dernière entrée du journal).
- Recherche web effectuée sur les fiches programme Awin de Tennis Point FR (merchant #13266) et Padel-Point FR (merchant #25160) : les deux annoncent un « flux de données produit détaillée » (datafeed) parmi les avantages du programme — mécanisme standard Awin (CSV/XML via MyAwin ou Awin Datafeed API).
- Format exact du flux (champs, fréquence) non vérifiable sans compte affilié Awin réel avec candidature acceptée sur chacun des deux programmes — impossible à consulter de l'extérieur.
- Question posée explicitement à l'utilisateur (point bloquant hors périmètre Claude Code) : pas de compte Awin publisher existant à ce jour, à créer.
- **GAP-2026-09-21-03 ouvert** : datafeed non vérifiable tant que le compte Awin n'est pas créé et les candidatures acceptées — action utilisateur requise (création de compte, informations d'entreprise/paiement, candidature).
- **Aucune étape de build n'a été démarrée** dans cette conversation (cadrage uniquement, recherche + constat de blocage).
- Prochaine étape : une fois le compte Awin créé et les candidatures avancées par l'utilisateur, reprendre la vérification du datafeed réel (format, champs) pour définir la méthode d'ingestion vers `deals`/`merchants`.

## 2026-09-21 (suite 16) — Création du compte Awin publisher et candidatures (pas de build)

- Reprise de session, protocole de reprise appliqué (ETAT_ACTUEL → GAPS_OUVERTS → dernière entrée du journal).
- L'utilisateur a créé son compte Awin publisher et soumis sa candidature. Assistance apportée sur le choix des réponses du formulaire d'inscription, sans y avoir accès direct (formulaire externe, hors périmètre outillage) :
  - Canal publicitaire : **Code de réduction** (catégorie Content), défini comme canal principal — correspond exactement au fonctionnement du site (liste de réductions/promotions). **Moteur de comparaison** suggéré en complément (le catalogue permet de comparer les offres par prix/réduction entre marchands). Display/E-mail/Search et les autres sous-catégories de Content (Cashback, Contenu éditorial, Fidélisation, etc.) écartés comme non représentatifs.
  - Adresse URL de l'espace publicitaire : `https://deals-tennis.vercel.app` (seul domaine existant, déploiement de production réel).
  - Description de l'activité : texte proposé décrivant le catalogue de bons plans tennis/padel (catégories, filtrage/recherche/tri, redirection trackée vers marchand partenaire), sans chiffres d'audience (site tout juste déployé).
  - Secteur d'activité : **Sport & Loisirs** (les catégories textile/chaussures restant de l'équipement sportif tennis/padel, pas un secteur mode séparé).
- Candidature soumise par l'utilisateur (confirmation reçue). En attente de l'acceptation des programmes Tennis Point FR (#13266) et Padel-Point FR (#25160) — GAP-2026-09-21-03 toujours ouvert, aucun changement de statut à ce stade.
- **Aucune étape de build n'a été démarrée** dans cette conversation (assistance à une démarche externe uniquement).
- Prochaine étape : une fois l'acceptation reçue sur un ou les deux programmes, consulter le datafeed réel (format, champs, fréquence) pour définir la méthode d'ingestion vers `deals`/`merchants` — voir GAP-2026-09-21-03.

## 2026-09-21 (suite 17) — Candidatures Tennis Point FR / Padel-Point FR soumises (pas de build)

- Reprise de session, protocole de reprise appliqué (ETAT_ACTUEL → GAPS_OUVERTS → dernière entrée du journal). Statut Awin vérifié explicitement avec l'utilisateur : compte actif, mais aucune des deux candidatures marchand pas encore acceptée à ce stade.
- Le champ « Message » du formulaire de candidature (1000 caractères max, par marchand) a été rédigé avec assistance : présentation du site, positionnement niche tennis/padel, mention explicite du souhait d'utiliser le datafeed pour l'ingestion automatique.
- Question de fond posée par l'utilisateur : est-ce que l'affiliation vaut le coup, ou construire directement sans (récupération de données brute) ? Réponse donnée : l'affiliation reste recommandée (monétisation prévue par `/go/[dealId]`, cadre légal plus solide qu'une redirection/republication de prix sans accord) ; poursuivre les candidatures Awin en parallèle plutôt que d'abandonner l'approche, quitte à élargir la liste de marchands si ça n'aboutit pas. Pas de décision structurante nouvelle actée (juste une recommandation, la stratégie affiliation reste celle déjà actée).
- Message de relance (pour un suivi ultérieur si besoin) également rédigé, à envoyer via la messagerie interne Awin, non utilisé dans cette conversation (les candidatures venaient d'être soumises, pas encore de relance nécessaire).
- Les deux candidatures ont été soumises par l'utilisateur en fin de conversation.
- **Aucune étape de build n'a été démarrée** dans cette conversation (assistance à une démarche externe + question stratégique).
- Prochaine étape : inchangée — attendre l'acceptation d'un ou des deux programmes, puis consulter le datafeed réel pour définir la méthode d'ingestion. Voir GAP-2026-09-21-03.

## 2026-09-21 (suite 18) — Cadrage du chantier « Charte graphique / design system » (pas de build)

- Reprise de session, protocole de reprise appliqué. Statut Awin vérifié : toujours en attente sur les deux programmes, GAP-2026-09-21-03 inchangé.
- Automatisation n8n restant bloqué, l'utilisateur a choisi d'avancer sur un autre chantier de la liste D-2026-09-21-09 : « Charte graphique / design system » (n°8).
- Direction visuelle donnée d'emblée par l'utilisateur : fond de section hero en photo de terrain (gazon/terre battue, à fournir — GAP-2026-09-21-04 ouvert), design épuré ne devant pas « faire IA », inspiration Aceternity (MCP `aceternityui` consulté pour la liste de composants disponibles), pas de bords trop arrondis, cartes blanches/grises.
- Trois propositions de typographie présentées visuellement via un artefact Design (canvas avec maquette de carte de deal reprenant palette/radius envisagés) : A (Fraunces+Inter), B (Space Grotesk), C (Libre Franklin+Newsreader italique). L'utilisateur a choisi **B (Space Grotesk) « de très loin »**.
- Décision structurante actée (D-2026-09-21-13) : typographie Space Grotesk, palette à deux accents (vert gazon `#1b4332` pour prix/CTA, terre cuite `#c1440e` pour badge réduction), cartes blanches/bordure gris clair, radius léger (6px cartes/boutons, 4px badges).
- **Aucune étape de build n'a été démarrée** dans cette conversation (cadrage uniquement, conforme au protocole — l'utilisateur avait explicitement choisi ce périmètre en début de conversation).
- Prochaine étape : soit poursuivre le cadrage du chantier (spacing/layout, style des composants de nav/filtres), soit démarrer l'application des tokens à `app/globals.css` comme étape de build à part entière — à soumettre explicitement en début de prochaine conversation dédiée. Voir aussi GAP-2026-09-21-04 (photo de terrain à recevoir).

## 2026-09-21 (suite 19) — Cadrage chantier « Automatisation n8n » : lien scraping + liste de marchands candidats (pas de build)

- Reprise de session (`/clear`), protocole de reprise appliqué (ETAT_ACTUEL → GAPS_OUVERTS → dernière entrée du journal), l'utilisateur ayant demandé un point de situation général sur le scraping.
- Constat rappelé : cadrage du chantier « Charte graphique » terminé et mergé (PR #3) entre-temps ; deux décisions structurantes restaient ouvertes sur le chantier « Automatisation n8n » depuis D-2026-09-21-14 (marchands à scraper en premier, comportement du lien de destination sans affiliation).
- Les deux décisions ont été soumises explicitement via question structurée :
  - **D-2026-09-21-15** : `affiliate_url` pointe vers l'URL produit directe pour une offre scrapée sans affiliation (pas de lien d'affiliation, puisqu'il n'y en a pas) ; `/go/[dealId]` continue de logger le clic (analytics interne RGPD) sans rémunération associée.
  - **D-2026-09-21-16** : liste candidate actée en deux groupes — revendeurs multi-marques prioritaires (Tennispro.fr, Sport 2000, Decathlon, SportSystem, ProTennis, Tennis Pro), marques à évaluer séparément et non prioritaires pour ce canal (Wilson, Babolat, Yonex, Head), car un site de marque a rarement un mécanisme de promos comparable à un revendeur.
- **GAP-2026-09-21-05 ouvert** : aucun premier marchand sélectionné pour une implémentation technique concrète, `robots.txt`/CGU non vérifiés, méthode technique (n8n HTTP node vs Playwright) et fréquence non tranchées.
- **Aucune étape de build n'a été démarrée** dans cette conversation (cadrage uniquement — deux décisions structurantes actées, pas d'enchaînement sur la sélection technique du premier marchand).
- Prochaine étape : sélectionner le premier marchand à implémenter parmi la liste de revendeurs (D-2026-09-21-16), vérifier son `robots.txt`/ses CGU, puis cadrer la méthode technique de scraping et la fréquence — à soumettre explicitement en début de prochaine conversation. Voir GAP-2026-09-21-05.

## 2026-09-22 (suite 20) — Sélection du premier marchand scrapé (ProTennis) + gestion du risque juridique (pas de build)

- Reprise de session, protocole de reprise appliqué (ETAT_ACTUEL → GAPS_OUVERTS → dernière entrée du journal).
- L'utilisateur a choisi Tennispro.fr comme premier candidat naturel. Vérification réelle (curl + lecture du texte, pas de suppositions) de `robots.txt` et des CGV/mentions légales : clause explicite limitant toute reproduction à un usage personnel/privé — écarté.
- Vérification étendue aux autres candidats de D-2026-09-21-16 : Sport 2000 (clause anti-bot explicite « gratte-pages/robot/araignée »), SportSystem (reproduction texte/image « strictement interdite »), ProTennis (réserve de reproduction + clause anti-lien sans accord écrit), Decathlon (403 même en `curl` direct, anti-bot réel, écarté techniquement).
- Constat remonté explicitement à l'utilisateur : le problème dépasse un marchand isolé, quasi tous les revendeurs ont une clause CGV restrictive — question de fond posée en retour par l'utilisateur sur le risque réel (pas juste une clarification de forme, une vraie discussion sur la stratégie).
- Explication donnée : le risque juridique réel réside dans le droit sui generis du producteur de base de données (art. L341-1 CPI, extraction substantielle et répétée), pas dans les clauses CGV elles-mêmes (largement standard) ; risque concret réaliste pour un petit site niche = mise en demeure possible si repéré, procès improbable à cette échelle ; pratique de fait répandue chez les sites d'agrégation qui démarrent souvent ainsi avant de négocier une affiliation.
- Recommandation de mitigation donnée et retenue : portée de données minimale (titre/prix/catégorie, pas de description longue), respect du `Crawl-delay`, arrêt immédiat si un marchand se manifeste.
- Question sur le visuel produit : l'utilisateur a demandé confirmation de la conséquence (pas de visuel marchand en mode minimal). Option hotlink (afficher l'image depuis l'URL du marchand sans la copier/stocker) proposée et retenue, avec fallback vers les placeholders existants.
- **Décision actée (D-2026-09-22-01)** : ProTennis retenu comme premier marchand, portée minimale (titre/prix/catégorie), image hotlinkée, risque résiduel assumé explicitement, scraping direct confirmé comme canal d'appoint temporaire (D-2026-09-21-14).
- `ETAT_ACTUEL.md`, `GAPS_OUVERTS.md`, `DECISIONS_FONCTIONNELLES.md` mis à jour. GAP-2026-09-21-05 partiellement résolu (marchand sélectionné, robots.txt/CGU vérifiés) — reste ouvert sur la méthode technique (n8n HTTP node vs Playwright) et la fréquence de collecte.
- **Aucune étape de build n'a été démarrée** dans cette conversation (cadrage + vérifications réelles de robots.txt/CGV uniquement, conforme au protocole).
- Prochaine étape : cadrer la méthode technique de collecte pour ProTennis (n8n HTTP node vs Playwright) et la fréquence (caler sur `Crawl-delay: 60`) — à soumettre explicitement en début de prochaine conversation. Voir GAP-2026-09-21-05.

## 2026-09-22 (suite) — Méthode technique et fréquence de collecte tranchées pour ProTennis

- Question soumise explicitement à l'utilisateur (protocole) : méthode technique du nœud n8n (HTTP Request + parsing HTML vs Playwright/headless) et fréquence de collecte, sachant que ProTennis est en PrestaShop rendu côté serveur (contenu dans le HTML brut, pas de JS requis) et que `robots.txt` indique `Crawl-delay: 60`.
- **Décision actée (D-2026-09-22-02)** : nœud HTTP Request n8n + parsing HTML (pas de Playwright), fréquence 1 fois par jour.
- `ETAT_ACTUEL.md`, `GAPS_OUVERTS.md`, `DECISIONS_FONCTIONNELLES.md` mis à jour. **GAP-2026-09-21-05 résolu** — le cadrage du marchand ProTennis (sélection, légal, portée des données, méthode technique, fréquence) est maintenant complet.
- **Aucune étape de build n'a été démarrée** dans cette conversation (cadrage uniquement, conforme au protocole).
- Prochaine étape : construire le workflow n8n pour ProTennis (étape de build à part entière, prochaine conversation) — voir ETAT_ACTUEL.md.

## 2026-09-22 (suite 2) — Build du workflow n8n ProTennis, vérifié de bout en bout

- Reprise en début de conversation : `ETAT_ACTUEL.md` → `GAPS_OUVERTS.md` → dernière entrée du journal lus, protocole confirmé. Commit + push + merge (PR #4, squash) des mises à jour de cadrage laissées non committées par la session précédente, avant de démarrer le build.
- Question soumise (protocole) : aucune instance n8n n'existe — comment la provisionner pour construire/tester réellement ? Docker proposé, absent de la machine ; bascule sur `npx n8n` (installation npm locale, pas de conteneur), confirmé par l'utilisateur avec une préoccupation explicite sur la charge machine et le besoin d'allumage continu — clarifié que l'instance ne servirait qu'au build/test de cette étape, pas à l'hébergement permanent (question séparée, consignée en GAP).
- Deux questions structurantes soumises avant de coder (protocole, décisions non déduites seul) :
  - Fin de vie d'une offre ProTennis sans date de fin visible sur le site → option « désactiver les offres non revues au passage suivant » retenue.
  - Absence de clé d'identification stable pour l'upsert → migration `UNIQUE(merchant_id, affiliate_url)` sur `deals` proposée et validée avant application.
  - **Décision actée (D-2026-09-22-03)** regroupant ces deux points.
- Build réalisé : migration `002_deals_unique_merchant_url.sql` appliquée à la base Neon de prod (vérifiée), marchand `ProTennis` inséré réellement, workflow n8n construit nœud par nœud (HTTP Request, Code de parsing par regex, Postgres upsert, Code de regroupement, Postgres éviction), importé et exécuté via le CLI n8n (`import:workflow` / `execute`) plutôt que via navigation manuelle dans l'UI.
- Plusieurs bugs réels trouvés et corrigés pendant la vérification (pas de simulation) :
  - PrestaShop renvoie un fragment JSON au lieu de la page HTML complète quand le header `Accept` n'est pas explicitement `text/html` (comportement du client HTTP de n8n par défaut) — corrigé en forçant le header.
  - Paramétrage `queryReplacement` du nœud Postgres cassé une première fois par un problème d'échappement bash lors de la génération du JSON du workflow (les placeholders `$1`..`$9` disparaissaient silencieusement) — corrigé en générant le JSON via un script fichier plutôt qu'un `node -e` inline.
  - Format des paramètres de requête Postgres à corriger (passer un littéral de tableau JS `[$json.a, $json.b, ...]` plutôt que plusieurs `{{ }}` séparés par des virgules) pour que les valeurs soient effectivement transmises.
  - Cast `$2::jsonb` sur un tableau pour la requête d'éviction rejeté par Postgres (le driver transmet déjà un vrai tableau `text[]`) — corrigé en castant directement `$2::text[]`.
- L'exécution réelle du workflow (écriture dans la base Neon de prod, offres visibles immédiatement sur le site en production) a été explicitement confirmée par l'utilisateur avant lancement — bloquée une première fois par le classificateur auto-mode de Claude Code (« Production Deploy »), débloquée après confirmation explicite.
- Vérification de bout en bout avec des données réelles : 23 offres ProTennis réelles insérées et visibles sur `https://deals-tennis.vercel.app` ; ré-exécution confirmant l'idempotence (pas de doublons) ; test réel de l'éviction avec une fausse offre insérée puis supprimée après contrôle ; redirection `/go/[dealId]` testée sur une offre réelle (clic loggé puis supprimé après contrôle). `npm run lint`, `npm run build`, `npm test` passent.
- Instance n8n locale arrêtée après vérification (pas d'hébergement permanent — **GAP-2026-09-22-06** ouvert). Défaut mineur du runner de migration existant noté sans le corriger (**GAP-2026-09-22-07** ouvert, hors scope de cette étape).
- Livrables committés : `scripts/migrations/002_deals_unique_merchant_url.sql`, `scripts/automation/n8n-protennis-ingestion-workflow.json`, `scripts/automation/n8n-protennis-ingestion-README.md`. `ETAT_ACTUEL.md`, `GAPS_OUVERTS.md`, `DECISIONS_FONCTIONNELLES.md` mis à jour.
- Prochaine étape : décider de l'hébergement permanent de n8n pour que le workflow tourne réellement chaque jour (GAP-2026-09-22-06) — à soumettre explicitement en début de prochaine conversation.

## 2026-09-22 (suite 3) — Hébergement permanent n8n construit et vérifié de bout en bout

- Reprise de session (`/clear`), protocole de reprise appliqué. Décision structurante soumise et actée (D-2026-09-22-04) : hébergement n8n sur VM Oracle Cloud Free Tier (Always Free, ARM Ampere), setup/maintenance orchestrés conjointement avec l'utilisateur (aucune compétence serveur de son côté).
- L'utilisateur a créé le compte Oracle Cloud et provisionné la VM (`n8n-server`, `VM.Standard.A1.Flex`, 1 OCPU/6 Go, Oracle Linux 9, région `eu-paris-1`) via la console web, guidé pas à pas (Claude Code n'a pas d'accès navigateur/compte direct). Plusieurs frictions réelles de la console Oracle rencontrées et résolues : identifiant de connexion = email (pas le nom de tenancy), case "Automatically assign public IPv4 address" non fonctionnelle au moment de la création (contournée en assignant l'IP publique éphémère après coup, officiellement supporté), passerelle internet manquante par défaut (ajoutée via "Quick actions → Connect public subnet to internet").
- Connexion SSH établie par Claude Code (clé privée téléchargée par l'utilisateur), puis pris en charge : installation Docker Engine + Compose (un conflit de verrou `dnf` avec l'agent de monitoring Oracle rencontré et résolu en attendant sa fin), ouverture des ports 80/443 côté OS (`firewalld`) et côté réseau Oracle (règles Ingress ajoutées manuellement par l'utilisateur sur le NSG `ig-quick-action-NSG`, bloquant sinon tout trafic entrant malgré le firewall OS ouvert).
- Décision structurante soumise et actée : sécurisation HTTPS + authentification basique plutôt que HTTP simple (nécessite un nom de domaine) — sous-domaine gratuit DuckDNS créé par l'utilisateur (`deals-tennis-n8n.duckdns.org`).
- Déploiement Docker Compose (Caddy reverse proxy + n8n) construit et lancé par Claude Code. Certificat Let's Encrypt obtenu automatiquement par Caddy après ouverture des ports réseau. Mot de passe d'authentification basique généré aléatoirement et communiqué à l'utilisateur (jamais commité).
- Compte propriétaire n8n créé par l'utilisateur (première configuration de l'instance, propre à cette instance, sans lien avec les autres comptes).
- **Point de sécurité notable** : la protection anti-fuite d'identifiants de Claude Code a bloqué deux tentatives (écriture locale, puis écriture distante via SSH) contenant le mot de passe Neon en clair dans une commande — comportement voulu, contournement adopté : credential Postgres `Neon deals-tennis` créée manuellement par l'utilisateur dans l'UI n8n en suivant les valeurs de `.env.local`.
- Workflow ProTennis importé sur cette instance permanente (`n8n import:workflow`), exécuté manuellement depuis l'UI (la commande CLI `n8n execute` échoue sur une instance déjà démarrée en serveur, conflit de port — normal, pas un bug), vérifié en base réelle (23 offres ProTennis, `updated_at` confirmé à l'heure exacte du test via une requête directe contre la base Neon de prod). Workflow ensuite activé — le déclencheur planifié quotidien (6h) tourne désormais réellement en continu.
- **GAP-2026-09-22-06 résolu.** `ETAT_ACTUEL.md`, `GAPS_OUVERTS.md`, `DECISIONS_FONCTIONNELLES.md` mis à jour (D-2026-09-22-04).
- Aucun changement de code applicatif dans cette étape — uniquement de l'infrastructure hors dépôt (VM Oracle, DNS DuckDNS, conteneurs Docker) et les fichiers de suivi du cadrage à committer.
- Prochaine étape : si une acceptation Awin arrive sur Tennis Point FR/Padel-Point FR, consulter le datafeed réel — voir GAP-2026-09-21-03. Sinon, arbitrer le prochain chantier parmi la liste restante (D-2026-09-21-09) — à soumettre explicitement en début de prochaine conversation.

## 2026-09-22 (suite 6) — Fondation du rapprochement produit multi-marchands (table `products`)

- Reprise de session (`/clear`), protocole de reprise appliqué (ETAT_ACTUEL → GAPS_OUVERTS → dernière entrée du journal).
- Périmètre de l'étape confirmé explicitement avec l'utilisateur avant de coder (protocole) : fondation seule (table `products`, migration, parsing, backfill des deals existants) — la recherche centrée article et le rendu du détail d'un deal restent des étapes séparées, la seconde dépendant de GAP-2026-09-22-10 (page vs popup, non tranché).
- Algorithme de parsing discuté avec l'utilisateur (combiner liste de marques connues + heuristique de repli), puis simplifié après vérification réelle des données en base : `deals.brand` est déjà fiable (vient du logo marque côté ProTennis, pas du titre) — seul le modèle doit être extrait du titre. Décision mineure auto-décidée, documentée dans ETAT_ACTUEL.md.
- Build réalisé : migration `003_products.sql` (table `products`, unicité insensible à la casse, `deals.product_id` nullable), `lib/product-matching.ts` (`extractModel`) testé unitairement sur des titres réels (6 tests), `scripts/backfill-product-ids.ts` (+ script npm `db:backfill-products`).
- Ajustement technique : `tsconfig.json` — `allowImportingTsExtensions: true` ajouté pour permettre à un script Node d'importer un module `lib/*.ts` avec extension explicite (requise par l'exécution Node native, rejetée par défaut par le type-check `next build`).
- Vérification bout en bout avec les données réelles de production (migration appliquée manuellement en prod comme la 002, `db:migrate` restant non idempotent — GAP-2026-09-22-07 inchangé) : 33 deals réels backfillés (33 produits distincts créés, 0 orpheline), ré-exécution confirmant l'idempotence, contrôle manuel ligne par ligne du contenu de `products` et du lien `deals.product_id`. Scripts temporaires de vérification supprimés après contrôle.
- `npm run lint`, `npm run build` et `npm test` (36 tests, 6 fichiers) passent tous sans erreur.
- **GAP-2026-09-22-08 partiellement résolu** (fondation construite, recherche/détail restants). **GAP-2026-09-22-11 ouvert** : le workflow n8n ProTennis actif ne renseigne pas `product_id` sur les nouvelles offres qu'il insère (vérifié en lisant le workflow : les offres déjà rattachées gardent leur valeur, seules les offres réellement nouvelles arriveront avec `product_id = NULL`).
- `ETAT_ACTUEL.md`, `GAPS_OUVERTS.md` mis à jour. Aucune décision structurante nouvelle nécessitant une entrée `DECISIONS_FONCTIONNELLES.md` (simplification mineure documentée dans ETAT_ACTUEL uniquement).
- Prochaine étape : intégrer le rapprochement au workflow n8n ProTennis (GAP-2026-09-22-11) et/ou faire évoluer la recherche pour regrouper par `product_id`, ordre à soumettre explicitement en début de prochaine conversation.

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

## 2026-09-22 (suite 8) — Seuils chiffrés pour l'archivage des fichiers de suivi

- État des lieux demandé par l'utilisateur : constat que la règle d'archivage (D-2026-09-21-04) n'avait jamais été appliquée faute de seuil chiffré — `ETAT_ACTUEL.md` (200 lignes) et `JOURNAL_SESSIONS.md` (336 lignes) bien au-delà d'une synthèse lisible, `archive/` resté vide.
- Découverte en route : une marque de conflit de stash non résolue (`>>>>>>> Stashed changes`) avait été committée par erreur dans `DECISIONS_FONCTIONNELLES.md` par le commit `cb8d3a1` (PR #12). Signalée à l'utilisateur, correction traitée en commit séparé (pas de mélange avec le sujet des seuils).
- Discussion des seuils avec l'utilisateur (options soumises explicitement) → D-2026-09-22-09 actée : `ETAT_ACTUEL.md` et `JOURNAL_SESSIONS.md` à 150 lignes, `GAPS_OUVERTS.md` sans seuil (retrait immédiat d'un gap tranché), `DECISIONS_FONCTIONNELLES.md` jamais archivé (registre consulté par référence d'ID, motif expliqué à l'utilisateur qui a confirmé après question).
- `DECISIONS_FONCTIONNELLES.md` et `INDEX.md` mis à jour. Mémoire persistante (feedback méthode de travail) mise à jour avec ces seuils.
- Deux PR ouvertes sur demande explicite : #13 (fix marque de conflit) et #14 (seuils D-2026-09-22-09). Pas encore mergées.
- **Aucune étape de build n'a été démarrée** dans cette conversation (conforme au protocole, confirmé explicitement par l'utilisateur).
- Prochaine étape : une fois les PR #13/#14 mergées, appliquer la condensation + archivage à `ETAT_ACTUEL.md` et `JOURNAL_SESSIONS.md` (déjà au-delà des seuils décidés) — dans une conversation dédiée.
