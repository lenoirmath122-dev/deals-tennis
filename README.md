# Tennisdeals

Catalogue de bons plans tennis (raquettes, cordages, chaussures, textile, accessoires) : offres de plusieurs marchands regroupées par article, avec prix barré, remise et lien affilié. Site en production : <https://deals-tennis.vercel.app>.

## Stack

Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, PostgreSQL (Neon), déploiement Vercel. Les offres sont collectées par des scripts lancés à la main (`scripts/scraping/`, socle `lib/ingest.ts`).

## Commandes utiles

Prérequis : un fichier `.env.local` avec `DATABASE_URL`.

```bash
npm run dev            # serveur de développement
npm run lint           # eslint
npm run test:unit      # tests unitaires
npm run build          # build de production
npm run db:migrate     # applique les migrations SQL
npm run scrape:<marchand>   # ex. scrape:tecnifibre, scrape:head, scrape:amazon
npm run match:shadow   # moteur de rapprochement en mode fantôme (lecture seule)
```

## Documentation de suivi

Point d'entrée et protocole de reprise : [`cadrage_deals-tennis/INDEX.md`](./cadrage_deals-tennis/INDEX.md).
