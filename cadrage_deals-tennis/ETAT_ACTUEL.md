# État actuel

**Dernière mise à jour** : 2026-09-21

## Où en est le projet

- Le projet est en phase de **cadrage**, pas encore clos.
- Un dépôt git local existe désormais (`git init` fait le 2026-09-21), branche `master`, aucun remote configuré, aucun push effectué.
- La documentation existante (spec, plan, modèle de données, contrats d'API, recherche technique, checklists) a été importée telle quelle puis réorganisée dans `cadrage_deals-tennis/`, sans modification de contenu.
- **Aucun code applicatif n'existe dans le dépôt** (pas de `package.json`, pas de dossier `app/`, `lib/`, `components/`). Le fichier `tasks.md` liste des tâches cochées `[x]` (schéma DB, composants Next.js, etc.) qui ne correspondent à aucun fichier réel présent — voir [GAPS_OUVERTS.md](./GAPS_OUVERTS.md).

## Contenu fonctionnel déjà spécifié (à valider/confirmer, pas encore construit)

- Catalogue de bons plans tennis (raquettes, cordages, chaussures, textile, accessoires), filtrable, triable, avec pagination numérotée 24/page.
- Redirection d'affiliation via `/go/[dealId]` avec tracking de clic anonymisé (RGPD).
- Alimentation des données via workflows n8n externes, pas d'interface d'admin en V1.
- Stack visée : Next.js 14+ (App Router), TypeScript, Tailwind CSS, PostgreSQL (Neon Serverless Free Tier), déploiement Vercel/Cloudflare Pages.

## Prochaine étape

**Non tranchée — à soumettre explicitement à l'utilisateur en début de prochaine conversation.** Candidats possibles (backlog, à confirmer, ne pas choisir seul) :
1. Valider/re-confirmer que la spec (`spec.md`) et le plan technique (`plan.md`) existants reflètent toujours ce que l'utilisateur veut, avant de les considérer comme base de cadrage définitive.
2. Décider si `tasks.md` doit être régénéré (les cases cochées sont trompeuses) ou repris tel quel comme simple liste de tâches à refaire.
3. Si le cadrage fonctionnel est jugé suffisant : démarrer la phase de build par le setup du projet (Next.js + config) comme première étape isolée.
