# État actuel

**Dernière mise à jour** : 2026-09-21

## Où en est le projet

- Le **cadrage fonctionnel est clos** (D-2026-09-21-06) : `spec.md`/`plan.md` existants sont considérés comme base définitive, pas de revue complète programmée.
- Un dépôt git local existe (`git init` fait le 2026-09-21), branche `master`, aucun remote configuré, aucun push effectué.
- La documentation existante (spec, plan, modèle de données, contrats d'API, recherche technique, checklists) a été importée telle quelle puis réorganisée dans `cadrage_deals-tennis/`, sans modification de contenu.
- **Aucun code applicatif n'existe dans le dépôt** (pas de `package.json`, pas de dossier `app/`, `lib/`, `components/`).
- `tasks.md` a été repris tel quel mais entièrement décoché (D-2026-09-21-05) : il sert désormais de liste de tâches à faire, aucune n'ayant réellement commencé.

## Contenu fonctionnel déjà spécifié (à valider/confirmer, pas encore construit)

- Catalogue de bons plans tennis (raquettes, cordages, chaussures, textile, accessoires), filtrable, triable, avec pagination numérotée 24/page.
- Redirection d'affiliation via `/go/[dealId]` avec tracking de clic anonymisé (RGPD).
- Alimentation des données via workflows n8n externes, pas d'interface d'admin en V1.
- Stack visée : Next.js 14+ (App Router), TypeScript, Tailwind CSS, PostgreSQL (Neon Serverless Free Tier), déploiement Vercel/Cloudflare Pages.

## Prochaine étape

Démarrer la phase de build par la **Phase 1 de `tasks.md`** : setup du projet Next.js 14+ (TypeScript, Tailwind CSS) — T001 à T003. Une seule étape de build par conversation : ne pas enchaîner avec la Phase 2 (fondations DB) dans la même conversation.
