# État actuel

**Dernière mise à jour** : 2026-09-21

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
- `tasks.md` : T001-T008 cochées.

## Contenu fonctionnel déjà spécifié (à valider/confirmer, pas encore construit)

- Catalogue de bons plans tennis (raquettes, cordages, chaussures, textile, accessoires), filtrable, triable, avec pagination numérotée 24/page.
- Redirection d'affiliation via `/go/[dealId]` avec tracking de clic anonymisé (RGPD).
- Alimentation des données via workflows n8n externes, pas d'interface d'admin en V1.
- Stack réelle : Next.js 16.3.5 (App Router), React 19, TypeScript, Tailwind CSS v4, PostgreSQL (Neon Serverless, provisionné), déploiement Vercel/Cloudflare Pages (pas encore configuré).

## Prochaine étape

Démarrer la **Phase 3 de `tasks.md`** (User Story 1 — MVP : `getCatalogDeals`, `DealCard`, `DealGrid`, `Pagination`, page catalogue) — T009 à T015, dans une conversation dédiée.
