# État actuel

**Dernière mise à jour** : 2026-09-21 (Chantier V2 n°1 — Déploiement production terminé)

## Où en est le projet

- Le **cadrage fonctionnel est clos** (D-2026-09-21-06) : `spec.md`/`plan.md` existants sont considérés comme base définitive, pas de revue complète programmée.
- Un dépôt git local existe (`git init` fait le 2026-09-21), branche `master`, aucun remote configuré, aucun push effectué.
- La documentation existante (spec, plan, modèle de données, contrats d'API, recherche technique, checklists) a été importée telle quelle puis réorganisée dans `cadrage_deals-tennis/`, sans modification de contenu.
- **Phase 1 de `tasks.md` (setup projet) terminée** (T001-T003) : projet Next.js 16.3.5 / TypeScript / Tailwind CSS v4 scaffoldé à la racine du dépôt, dépendances runtime (@neondatabase/serverless, lucide-react, clsx, tailwind-merge) et testing (vitest, @playwright/test) installées, `.env.example` créé avec `DATABASE_URL`. Tailwind v4 adopté (config CSS-first, pas de `tailwind.config.ts`) — voir D-2026-09-21-07. `npm run lint` et `npm run build` passent.
- **Phase 2 de `tasks.md` (fondations DB) terminée** (T004-T008) :
  - Instance Neon Serverless réelle provisionnée sur le compte Neon existant de l'utilisateur (projet `deals-tennis`, id `floral-mountain-74046188`, région `aws-eu-central-1`), `DATABASE_URL` dans `.env.local` (non versionné).
  - Migration SQL (`scripts/migrations/001_init_schema.sql`) appliquée via `npm run db:migrate` : tables `merchants`, `deals`, `click_events`, 7 index et 4 contraintes CHECK conformes à `data-model.md`, vérifiés directement en base.
  - Seed (`scripts/seed.ts`) exécuté via `npm run db:seed` : 3 marchands, 10 offres couvrant les 5 catégories avec mélange actif/expiré, conservé en base comme jeu de données de développement (décision utilisateur : ne pas nettoyer, ce n'est pas une donnée éphémère de vérification mais le jeu de données prévu par T005).
  - `types/database.ts` (Merchant, Deal, ClickEvent, CatalogResponse), `lib/db.ts` (client `neon()` one-shot pour Server Components/Route Handlers) créés.
  - `app/layout.tsx` mis à jour : `lang="fr"`, métadonnées SEO dédiées au catalogue tennis. `app/globals.css` laissé au thème Tailwind v4 par défaut (aucune charte graphique définie à ce stade).
  - `npm run lint` et `npm run build` passent.
- **Phase 3 de `tasks.md` (User Story 1 — MVP catalogue) terminée** (T009-T015) :
  - `lib/deals.ts` : `getCatalogDeals` conforme au contrat `catalog-query-api.md` (filtre actif/non expiré, tri `created_at DESC` par défaut, pagination 24/page), via `sql.query()` du driver `@neondatabase/serverless`.
  - `types/database.ts` complété avec `MerchantSummary`, `DealCardData`, `CatalogPagination` et `CatalogResponse` alignés sur le contrat (le `CatalogResponse` posé en Phase 2 ne correspondait pas au contrat — corrigé sans impact, rien ne le consommait encore).
  - `lib/format.ts` : helpers `formatPrice` (EUR, `Intl.NumberFormat('fr-FR')`), `formatDiscountBadge`, `formatDate`, `formatFreshnessLabel`.
  - `components/deal-card.tsx`, `components/deal-grid.tsx` (avec état vide), `components/pagination.tsx` (numérotée avec ellipses, liens `?page=X`).
  - `app/(catalog)/page.tsx` : page catalogue Server Component (remplace le placeholder `create-next-app` `app/page.tsx`, supprimé).
  - Carte d'offre sans bouton d'action cliquable pour l'instant (volontaire : `/go/[dealId]` n'existe pas encore côté US3/Phase 5, et `DealCardData` n'expose pas `affiliate_url` — conforme à FR-006).
  - Tests ajoutés : `tests/unit/deals.test.ts` (helpers de formatage, 6 tests) et `tests/contract/catalog-query.test.ts` (contre l'instance Neon réelle : pagination 24/page, tri décroissant, exclusion des offres expirées du seed). `vitest.config.mts` créé, script `npm test` ajouté.
  - Vérification manuelle bout en bout : serveur `next dev` lancé, page `/` inspectée via `curl` — 7 offres actives affichées avec prix/réduction/fraîcheur/marchand corrects, les 3 offres expirées du seed absentes, pagination masquée à raison (1 seule page avec 7 offres), état vide correct sur `/?page=2`. Serveur arrêté après vérification.
  - `npm run lint`, `npm run build` et `npm test` passent tous les trois.
- **Phase 4 de `tasks.md` (User Story 2 — filtrage, recherche, tri) terminée** (T016-T021) :
  - `lib/filters.ts` : `isValidCategory` (valide `'all'` + les 5 catégories, rejette toute autre valeur) et `sanitizeSearchQuery` (trim, `""` si vide/null/undefined), extraits pour être testables unitairement.
  - `lib/deals.ts` : `getCatalogDeals` utilise désormais ces helpers (catégorie invalide ignorée silencieusement plutôt que forcée en filtre SQL renvoyant zéro résultat — décision mineure auto-décidée, pas structurante).
  - `lib/catalog-url.ts` : helper `buildCatalogHref` centralisant la construction des URLs `/?category=...&sort=...&q=...&page=...`, omettant les valeurs par défaut pour garder des URLs propres (FR-009).
  - `components/category-filter.tsx` : pills de catégorie en `Link` (Server Component, pas de JS requis), scroll horizontal, état actif via `aria-selected`.
  - `components/search-bar.tsx` : Client Component, champ de recherche instantanée avec debounce 300 ms (valeur non spécifiée par le contrat, choix par défaut raisonnable), `router.push` vers l'URL mise à jour ; remonte proprement au changement de `q` externe via `key={q}` côté page plutôt qu'un effet de synchronisation (évite un warning ESLint react-hooks sur `setState` en effet).
  - `components/sort-dropdown.tsx` : Client Component, `<select>` natif à deux options (Nouveautés / Plus forte réduction), navigation via `router.push`.
  - `components/pagination.tsx` : mis à jour pour préserver `category`/`sort`/`q` dans les liens de page (bug potentiel évité : sans ça, changer de page aurait réinitialisé les filtres actifs).
  - `components/deal-grid.tsx` : état vide différencié — message générique si catalogue vide, message "aucun résultat pour ce filtre" + lien de réinitialisation si un filtre/recherche est actif (conforme à l'edge case "Catégorie sans offre active" de `spec.md`).
  - `app/(catalog)/page.tsx` : lit et valide `category`/`sort`/`q`/`page` depuis les search params, branche les 3 nouveaux composants dans l'en-tête, passe les filtres à `DealGrid`/`Pagination`.
  - Tests ajoutés : `tests/unit/filters.test.ts` (9 tests, `isValidCategory` + `sanitizeSearchQuery`).
  - Vérification manuelle bout en bout : serveur `next dev` lancé (port 3001), vérifié via `curl` — filtre catégorie (`?category=chaussures`, pill active correcte), recherche insensible à la casse (`?q=babolat` → 2 résultats titre+marque), tri par réduction (`?sort=discount` → 35/33/31/31/30/30/25%, ordre décroissant confirmé, différent du tri par défaut), catégorie invalide (`?category=DROP%20TABLE`) ne fait pas planter la page (200, traité comme "all"), état vide avec message de réinitialisation sur recherche sans résultat. Serveur arrêté et processus nettoyé après contrôle.
  - `npm run lint`, `npm run build` et `npm test` (17 tests, 3 fichiers) passent tous les trois sans erreur.
- `tasks.md` : T001-T021 cochées.
- **Phase 5 de `tasks.md` (User Story 3 — redirection trackée vers le marchand partenaire) terminée** (T022-T026) :
  - `lib/tracking.ts` : `resolveDeviceType` (algorithme repris tel quel du contrat `redirection-api.md`), `cleanReferrerUrl` (ne garde le chemin+query du `Referer` que si même origine que la requête, sinon `null` — protège contre la fuite d'URL externe et le RGPD), `recordClickEvent` (insertion dans `click_events`).
  - `app/go/[dealId]/route.ts` : Route Handler `GET` conforme au contrat `redirection-api.md` — valide le format UUID (sinon traité comme cas 3), recherche l'offre (`affiliate_url`, `status`, `is_active`, `expires_at`), branche sur les 3 cas (actif → 307 vers `affiliate_url` + log clic ; expiré/invalide → 307 vers `/?notification=deal-expired`, aucun clic loggé ; inexistant → 307 vers `/?notification=deal-not-found`), toutes les réponses avec `Cache-Control: no-store, no-cache, must-revalidate` (choix mineur auto-décidé d'uniformiser sur les 3 cas plutôt que de suivre littéralement le contrat qui ne précise pas d'en-tête pour le cas 3 — cohérent avec l'objectif de ne jamais mettre en cache une redirection).
  - `components/deal-card.tsx` : toute la carte est désormais un lien `<a href="/go/[dealId]" target="_blank" rel="noopener noreferrer">` (choix mineur auto-décidé : ouverture dans un nouvel onglet pour ne pas faire perdre la position dans le catalogue, non spécifié par le contrat).
  - Tests ajoutés : `tests/unit/tracking.test.ts` (10 tests : résolution du type d'appareil + nettoyage du referrer) et `tests/contract/redirection.test.ts` (contre l'instance Neon réelle, 3 tests : redirection + log de clic pour une offre active, redirection sans log pour une offre expirée/inactive, redirection pour un id inexistant). Le test de redirection active insère une vraie ligne dans `click_events` à chaque exécution et la supprime explicitement à la fin du test (nettoyage vérifié par double exécution de `npm test`, 0 ligne résiduelle).
  - Vérification manuelle bout en bout avec données réelles : serveur `next dev` lancé (port 3001), `curl` sur une offre active (307 + `Location` = `affiliate_url` réel + clic inséré en base avec `device_type='mobile'` et `referrer_url` nettoyé), sur une offre expirée du seed (307 vers `/?notification=deal-expired`, aucun clic inséré), sur un UUID inexistant et une chaîne malformée (307 vers `/?notification=deal-not-found` dans les deux cas). Lignes de `click_events` créées pendant la vérification manuelle supprimées explicitement après contrôle, table revérifiée à 0 ligne. Serveur et processus arrêtés après contrôle.
  - `npm run lint`, `npm run build` et `npm test` (30 tests, 5 fichiers) passent tous les trois sans erreur.
- `tasks.md` : T001-T026 cochées.
- **Phase 6 de `tasks.md` (User Story 4 — éviction automatique des offres expirées) terminée** (T027-T031) :
  - T027 (test de contrat pour la redirection d'une offre expirée) et T028 (détection d'expiration dans le Route Handler) étaient déjà couverts par le travail de Phase 5 : `app/go/[dealId]/route.ts` gère déjà les 3 cas (actif / expiré-invalide / introuvable) et `tests/contract/redirection.test.ts` teste déjà explicitement le cas expiré → `/?notification=deal-expired` sans log de clic. Décision mineure auto-décidée : pas de duplication dans un nouveau fichier `tests/contract/expiration.test.ts`, le contrat est déjà vérifié par un test réel contre l'instance Neon.
  - `components/notification-banner.tsx` (Client Component, `T029`) : bandeau non-bloquant affiché quand `?notification=deal-expired` ou `?notification=deal-not-found` est présent dans l'URL, avec bouton de fermeture qui retire le paramètre via `router.replace` (préserve `category`/`sort`/`q` grâce à `buildCatalogHref`). Toute autre valeur de `notification` est ignorée silencieusement (pas de bandeau, pas d'erreur).
  - `app/(catalog)/page.tsx` (`T030`) : lit `notification` depuis les search params et intègre `NotificationBanner` au-dessus du catalogue.
  - `scripts/automation/n8n-eviction-cron.sql` (`T031`) : documente la requête SQL d'éviction horaire à coller dans le nœud Postgres n8n (reprise telle quelle du contrat `ingestion-contract.md`), avec un exemple de payload d'ingestion en commentaire pour référence rapide.
  - Vérification manuelle bout en bout : serveur `next dev` lancé (port 3001), `curl` sur `/?notification=deal-expired` et `/?notification=deal-not-found` — message correct affiché dans les deux cas ; `/` sans paramètre — aucun bandeau ; `/?notification=bogus` — aucun bandeau, page toujours 200 (pas de crash sur valeur inconnue). Serveur et processus `next dev` arrêtés après contrôle (vérifié par `curl` renvoyant code `000`).
  - `npm run lint`, `npm run build` et `npm test` (30 tests, 5 fichiers, inchangé) passent tous les trois sans erreur.
- `tasks.md` : T001-T031 cochées.
- **Phase 7 de `tasks.md` (Polish & Cross-Cutting Concerns) terminée** (T032-T034) :
  - `public/placeholders/{raquettes,cordages,chaussures,textile,accessoires,default}.svg` : placeholders SVG neutres créés, un par catégorie + un générique.
  - `components/deal-image.tsx` (nouveau Client Component, extrait de `deal-card.tsx` qui reste un Server Component) : gère `onError` sur `<img>`, bascule vers le placeholder de la catégorie de l'offre si l'image marchande casse.
  - Playwright configuré (`playwright.config.ts`, serveur `next dev` sur le port 3100 dédié aux tests e2e, projet `chromium`), script `test:e2e` ajouté (`node --env-file=.env.local ...`, même pattern que `npm test`).
  - `tests/e2e/catalog.spec.ts` (6 tests) : affichage du catalogue, filtrage par catégorie (pills `role="tab"`), recherche par mot-clé, tri par réduction, redirection `/go/[dealId]` + log de clic (vérifié directement contre l'instance Neon réelle via `lib/db.ts`, ligne de test supprimée après coup), bannière de notification pour offre expirée.
  - Point technique découvert en cours de session : `next dev` lancé deux fois en parallèle sur des ports différents (serveur de test Playwright + un `npm run build` concurrent) a corrompu le fichier généré `.next/dev/types/routes.d.ts` (JS invalide), faisant échouer `npm run build` avec des erreurs TypeScript sans rapport avec le code applicatif. Résolu en supprimant `.next/` (dossier généré, jamais versionné) et en relançant le build — aucun code source affecté.
  - T034 : scénarios de `quickstart.md` rejoués manuellement avec un serveur `next dev` dédié (port 3101) sur données réelles — catalogue par défaut (7 offres actives), filtre catégorie chaussures (2 résultats), recherche "Babolat" (2 résultats), tri par réduction (ordre décroissant confirmé : -35%, -33%, -31%, -31%, -30%), bannière `deal-expired`/`deal-not-found` (texte correct, apostrophe HTML-encodée `&#x27;` constatée en `curl` brut — normal, pas un bug). Serveur de vérification arrêté et confirmé injoignable (`curl` → `000`) après contrôle.
  - `npm run lint`, `npm run build`, `npm test` (30 tests) et `npm run test:e2e` (6 tests) passent tous sans erreur.
- `tasks.md` : T001-T034 cochées — **toutes les tâches de `tasks.md` sont maintenant terminées.**

## Contenu fonctionnel déjà spécifié (à valider/confirmer, pas encore construit)

- Catalogue de bons plans tennis (raquettes, cordages, chaussures, textile, accessoires), filtrable, triable, avec pagination numérotée 24/page.
- Redirection d'affiliation via `/go/[dealId]` avec tracking de clic anonymisé (RGPD).
- Alimentation des données via workflows n8n externes, pas d'interface d'admin en V1.
- Stack réelle : Next.js 16.3.5 (App Router), React 19, TypeScript, Tailwind CSS v4, PostgreSQL (Neon Serverless, provisionné), déploiement Vercel/Cloudflare Pages (pas encore configuré).

- **Chantier 1 (Déploiement production) terminé** (D-2026-09-21-10) :
  - Méthode actée : CLI Vercel direct (pas de lien GitHub, réservé au chantier 2), réutilisation de l'instance Neon existante comme base prod, domaine par défaut `*.vercel.app`.
  - Projet Vercel créé et lié : `lenoir-nba/deals-tennis` (`.vercel/project.json`, non versionné).
  - `DATABASE_URL` configuré comme variable d'environnement Production sur Vercel (type Sensitive), valeur reprise de `.env.local`.
  - Déploiement production effectué : `vercel --prod`, build Next.js 16.3.5 réussi, état `READY`. URL de production : `https://deals-tennis.vercel.app`.
  - Vérification manuelle bout en bout sur l'URL de production réelle : page catalogue 200 OK, offres réelles affichées (Babolat, Wilson…), redirection `/go/[dealId]` testée sur une offre réelle → 307 + `Location` correcte vers l'`affiliate_url`, clic loggé dans `click_events` (base prod = base dev, partagée). Ligne de clic de vérification supprimée après contrôle, table revérifiée (script temporaire `scripts/tmp-verify-cleanup.mjs` créé puis supprimé).
  - `.gitignore` mis à jour par `vercel link` (ajout de `.vercel` et d'une entrée `.env*` redondante avec l'entrée existante, sans impact).

## Prochaine étape

`tasks.md` (MVP) est intégralement terminé (T001-T034) et vérifié de bout en bout. Chantier 1 (Déploiement production) terminé. La **liste des chantiers V2 post-MVP est validée** (D-2026-09-21-09), 11 chantiers restants :

2. Protection de branche + CI · 3. Validation à l'échelle · 4. Automatisation n8n (scraping/collecte) · 5. Workflow n8n d'éviction horaire · 6. Mentions légales / politique de confidentialité · 7. Disclosure liens d'affiliation · 8. Charte graphique / design system · 9. SEO · 10. Accessibilité · 11. Observabilité/monitoring · 12. Gestion des marchands (probablement absorbé par le chantier 4).

Détail complet de chaque point : voir D-2026-09-21-09 dans `DECISIONS_FONCTIONNELLES.md`.

**Ordre retenu (D-2026-09-21-11)** : chantier « CI + protection de branche » traité en premier parmi les 11 restants. L'ordre des chantiers suivants reste à arbitrer au fur et à mesure.

**Étape suivante** : cadrer le chantier « CI + protection de branche » (contenu détaillé : dépôt distant GitHub, workflow CI lint/build/test, règles de protection de la branche `master`/`main`, flux branche → PR → CI → merge) — à soumettre explicitement en conversation dédiée, ne pas déduire seul le contenu détaillé avant confirmation.
