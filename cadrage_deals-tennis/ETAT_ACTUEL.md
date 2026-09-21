# État actuel

**Dernière mise à jour** : 2026-09-21

## Où en est le projet

- Le **cadrage fonctionnel est clos** (D-2026-09-21-06) : `spec.md`/`plan.md` existants sont considérés comme base définitive, pas de revue complète programmée.
- Un dépôt git local existe (`git init` fait le 2026-09-21), branche `master`, aucun remote configuré, aucun push effectué.
- La documentation existante (spec, plan, modèle de données, contrats d'API, recherche technique, checklists) a été importée telle quelle puis réorganisée dans `cadrage_deals-tennis/`, sans modification de contenu.
- **Phase 1 de `tasks.md` (setup projet) terminée** (T001-T003) : projet Next.js 16.3.5 / TypeScript / Tailwind CSS v4 scaffoldé à la racine du dépôt, dépendances runtime (@neondatabase/serverless, lucide-react, clsx, tailwind-merge) et testing (vitest, @playwright/test) installées, `.env.example` créé avec `DATABASE_URL`. Tailwind v4 adopté (config CSS-first, pas de `tailwind.config.ts`) — voir D-2026-09-21-07. `npm run lint` et `npm run build` passent.
- `tasks.md` a été repris tel quel mais entièrement décoché (D-2026-09-21-05), puis T001-T003 recochées à l'issue de cette étape.

## Contenu fonctionnel déjà spécifié (à valider/confirmer, pas encore construit)

- Catalogue de bons plans tennis (raquettes, cordages, chaussures, textile, accessoires), filtrable, triable, avec pagination numérotée 24/page.
- Redirection d'affiliation via `/go/[dealId]` avec tracking de clic anonymisé (RGPD).
- Alimentation des données via workflows n8n externes, pas d'interface d'admin en V1.
- Stack réelle : Next.js 16.3.5 (App Router), React 19, TypeScript, Tailwind CSS v4, PostgreSQL (Neon Serverless Free Tier, pas encore provisionné), déploiement Vercel/Cloudflare Pages (pas encore configuré).

## Prochaine étape

Démarrer la **Phase 2 de `tasks.md`** (fondations DB : migration SQL, seed, types, client Neon, layout de base) — T004 à T008, dans une conversation dédiée. Nécessitera une instance Neon Serverless réelle (pas encore provisionnée) pour la vérification avec données réelles prévue par le protocole.
