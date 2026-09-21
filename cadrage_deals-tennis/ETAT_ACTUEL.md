# État actuel

**Dernière mise à jour** : 2026-09-21 (Phase 4)

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

## Contenu fonctionnel déjà spécifié (à valider/confirmer, pas encore construit)

- Catalogue de bons plans tennis (raquettes, cordages, chaussures, textile, accessoires), filtrable, triable, avec pagination numérotée 24/page.
- Redirection d'affiliation via `/go/[dealId]` avec tracking de clic anonymisé (RGPD).
- Alimentation des données via workflows n8n externes, pas d'interface d'admin en V1.
- Stack réelle : Next.js 16.3.5 (App Router), React 19, TypeScript, Tailwind CSS v4, PostgreSQL (Neon Serverless, provisionné), déploiement Vercel/Cloudflare Pages (pas encore configuré).

## Prochaine étape

Démarrer la **Phase 5 de `tasks.md`** (User Story 3 : redirection d'affiliation `/go/[dealId]` avec tracking de clic anonymisé RGPD), dans une conversation dédiée.
