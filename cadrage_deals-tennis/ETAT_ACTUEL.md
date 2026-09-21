# État actuel

**Dernière mise à jour** : 2026-09-21 (Phase 3)

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
- `tasks.md` : T001-T015 cochées.

## Contenu fonctionnel déjà spécifié (à valider/confirmer, pas encore construit)

- Catalogue de bons plans tennis (raquettes, cordages, chaussures, textile, accessoires), filtrable, triable, avec pagination numérotée 24/page.
- Redirection d'affiliation via `/go/[dealId]` avec tracking de clic anonymisé (RGPD).
- Alimentation des données via workflows n8n externes, pas d'interface d'admin en V1.
- Stack réelle : Next.js 16.3.5 (App Router), React 19, TypeScript, Tailwind CSS v4, PostgreSQL (Neon Serverless, provisionné), déploiement Vercel/Cloudflare Pages (pas encore configuré).

## Prochaine étape

Démarrer la **Phase 4 de `tasks.md`** (User Story 2 : filtrage par catégorie, recherche par mot-clé, tri) — T016 à T021, dans une conversation dédiée.
