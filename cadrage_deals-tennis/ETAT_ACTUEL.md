# État actuel

**Dernière mise à jour** : 2026-09-23 (Recherche par suggestions cliquables, D-2026-09-23-05)

> Détail complet du MVP (`tasks.md` T001-T034), du chantier « Déploiement production », du chantier « CI + protection de branche » et du chantier « Automatisation n8n / ProTennis » (build initial, hébergement permanent, rapprochement produit, élargissement à toutes les catégories tennis) archivé tel quel dans `archive/ETAT_ACTUEL_detail_2026-09-22.md`. Résumé ci-dessous.

## Résumé des chantiers terminés

- **MVP** (`tasks.md` T001-T034) : intégralement terminé et vérifié bout en bout avec données réelles.
- **Déploiement production** (D-2026-09-21-10) : Vercel, projet `lenoir-nba/deals-tennis`, URL `https://deals-tennis.vercel.app`, base Neon prod = base dev.
- **CI + protection de branche** : dépôt GitHub privé `lenoirmath122-dev/deals-tennis`, CI (lint/build/tests unitaires) obligatoire avant merge squash, plus de push direct sur `master` (y compris pour l'utilisateur).
- **Automatisation n8n / ProTennis** : marchand ProTennis scrapé quotidiennement (VM Oracle permanente, `deals-tennis-n8n.duckdns.org`), toutes les 5 catégories tennis couvertes (**1495 offres actives**), rapprochement produit multi-marchands opérationnel (table `products`, `deals.product_id` peuplé à 100% côté ProTennis, y compris par le workflow n8n lui-même sur les nouvelles offres).
- **Monitoring du cron n8n** (D-2026-09-23-01, GAP-2026-09-23-01) : dead man's switch healthchecks.io — nœud HTTP de ping en fin de workflow (uniquement si succès complet), alerte email si le ping quotidien manque. Vérifié réellement (ping succès + alerte déclenchée via simulation d'échec, confirmée par l'utilisateur).

## Stack réelle

Next.js 16.3.5 (App Router), React 19, TypeScript, Tailwind CSS v4, PostgreSQL (Neon Serverless), déploiement Vercel. n8n (VM Oracle Cloud Free Tier) pour l'ingestion ProTennis.

## Chantier « Charte graphique / design system » (en cours)

- Direction actée (D-2026-09-21-13) : typographie Space Grotesk, palette à deux accents (vert gazon `#1b4332` prix/CTA, terre cuite `#c1440e` badge réduction), cartes blanches/bordure fine, radius léger (6px cartes/boutons, 4px badges).
- **Tokens appliqués au code** (build, PR #3 ouverte par l'utilisateur, statut de merge non suivi par Claude Code depuis) : `app/layout.tsx` (police Space Grotesk), `app/globals.css` (tokens `--color-accent`/`--color-discount`/`--color-card-border`, `--font-sans`), rayons Tailwind par défaut (`rounded-md`/`rounded`), composants mis à jour, variantes `dark:` retirées (décision mineure — la charte actée ne définit qu'une palette claire).
- **Section hero construite et vérifiée (2026-09-23, D-2026-09-23-02, résout GAP-2026-09-21-04)** : l'utilisateur a fourni 3 photos de test dans `public/hero/`, `simone-viani-2XPHSXVT_Ls-unsplash.jpg` retenue (format paysage, tons désaturés, espace pour le texte). Nouveau composant `components/hero.tsx` (image plein cadre via `next/image`, overlay dégradé vert foncé pour la lisibilité, titre + accroche repris de l'ancien `<h1>` du catalogue) intégré en tête de `app/(catalog)/page.tsx`. Vérifié réellement : `npm run lint`, `npm run build`, `npm test` (46 tests) passent tous ; rendu contrôlé visuellement au navigateur (Playwright) en desktop et mobile (390×844) — texte lisible, overlay cohérent avec la palette actée. Mergé (PR #18).
- **Hauteur du hero réduite (2026-09-23, PR #21, décision mineure)** : l'utilisateur a trouvé l'image trop haute après mise en prod. Réduction en deux passes validées visuellement par l'utilisateur : `min-h-[280px] sm:min-h-[360px]` → `196/250px` → `150/190px` (mobile/desktop), soit ~46% de moins au total. Lint clean, pas de vérification navigateur formelle (ajustement CSS trivial, confirmé visuellement par l'utilisateur de son côté).
- Reste à cadrer/construire : spacing/layout plus poussé, style de la nav (inspiration Aceternity `resizable-navbar`/`hero-highlight`).

## Chantier « Recherche centrée article + détail deal » (terminé le 2026-09-23, résolution de GAP-2026-09-22-08/10)

Suite directe de D-2026-09-22-06 (direction produit du rapprochement multi-marchands) — construction de la recherche groupée par article et de la page de comparaison d'un deal.

- Deux décisions structurantes soumises et actées avant le build :
  - **D-2026-09-22-10** : détail d'un deal affiché sur une page dédiée `/deal/[dealId]` (pas de popup) — résout GAP-2026-09-22-10.
  - **D-2026-09-22-11** : le regroupement par article ne s'applique que lorsqu'une recherche (`q`) est active — la navigation par défaut (catégorie/tri seuls) reste une carte par deal, inchangée.
- `lib/deals.ts` : `getCatalogDeals` bascule en requête groupée par `COALESCE(product_id, id)` (fenêtrage SQL `ROW_NUMBER()`/`COUNT() OVER`, représentant = offre active la moins chère du groupe) dès qu'un terme de recherche est fourni ; pagination portant sur le nombre de groupes. `getDealDetail(dealId)` (nouveau) renvoie `"not-found"` / `"expired"` / `{ deal, otherOffers }` (autres offres actives du même `product_id`, triées par prix croissant) — signature en union plutôt qu'un simple booléen/`null`, pour permettre à l'appelant de distinguer les deux cas d'échec (nécessaire pour la bonne bannière de notification).
- `types/database.ts` : `DealCardData.offer_count?` (uniquement en mode groupé), nouveau type `DealDetail`.
- `components/deal-card.tsx` : la carte pointe vers `/deal/[id]` avec un badge « X offres » quand `offer_count > 1` ; sinon comportement inchangé (lien direct `/go/[id]`, nouvel onglet) — décision mineure auto-décidée, conséquence directe des deux décisions actées (une seule offre ne justifie pas un détour par la page de comparaison).
- `app/deal/[dealId]/page.tsx` (nouveau, Server Component) : deal principal (image, prix, marchand, CTA `/go/[dealId]`), section « Autres offres pour cet article » si présentes, redirection vers `/?notification=deal-expired` ou `/?notification=deal-not-found` selon le cas (réutilise la bannière déjà existante, cohérent avec `/go/[dealId]`).
- Bug trouvé et corrigé pendant la vérification manuelle : la page détail renvoyait toujours `deal-not-found`, y compris pour un deal expiré — corrigé en distinguant les deux cas dans `getDealDetail`.
- Tests ajoutés : `tests/contract/catalog-query.test.ts` (+3 tests, mode groupé, contre un vrai produit multi-marchand réel en base — "Babolat Pure Aero 2023", ProTennis + marchand seed), `tests/contract/deal-detail.test.ts` (nouveau, 4 tests), `tests/e2e/catalog.spec.ts` (+2 tests : recherche groupée → détail → clic vers une offre marchande dans un nouvel onglet ; détail d'un deal expiré → redirection avec bannière).
- Vérification bout en bout avec données réelles de production : recherche `?q=Pure%20Aero` affiche 1 carte groupée avec badge « 2 offres », navigation normale (`/`) inchangée (aucun badge, liens directs `/go/`), page détail testée sur le produit réel (2 offres listées), cas deal introuvable et deal expiré vérifiés (redirection + bon message).
- `npm run lint`, `npm run build`, `npm test` (50 tests, 8 fichiers) et `npm run test:e2e` (8 tests) passent tous sans erreur.
- **GAP-2026-09-22-10 résolu. GAP-2026-09-22-08 résolu** (fondation + recherche + détail tous construits et vérifiés).
- Mergé depuis (PR #16, commit `c3ed96c`) — arbre propre.

## Chantier « Observabilité : monitoring du cron n8n ProTennis » (terminé le 2026-09-23)

Déclenché par GAP-2026-09-22-12 (workflow n8n désactivé silencieusement sans alerte, cause racine non déterminée).

- **D-2026-09-23-01** : mécanisme retenu = dead man's switch externe healthchecks.io (ping HTTP du workflow n8n à chaque succès ; alerte email si le ping manque). Trois options détaillées et comparées avec l'utilisateur avant tranchage — choisi pour son découplage total de l'état de n8n (contrairement à une alerte native n8n, qui partagerait le même point de défaillance que l'incident observé).
- Build réalisé : nœud HTTP Request ajouté en fin de workflow (`scripts/automation/n8n-protennis-ingestion-workflow.json`), branché uniquement après succès complet de la chaîne (scraping → upsert → éviction) — un run à 0 offre ne déclenche pas de ping (signal d'anomalie, pas de succès).
- Vérification réelle : deux exécutions complètes du workflow (`n8n execute`, site ProTennis + base Neon de prod réels) → ping reçu par healthchecks.io ; simulation d'échec via l'endpoint `/fail` → check passé à "Down" et alerte email réellement envoyée (confirmé par l'utilisateur) ; retour à l'état normal ensuite. Déployé sur l'instance n8n permanente (VM Oracle) : réimporté, republié, conteneur redémarré, `active: true` confirmé.
- Effet de bord corrigé : les `UPDATE` réels ont exposé un `LIMIT 1` non déterministe dans `tests/contract/deal-detail.test.ts`, corrigé en ciblant un titre précis (diff sans rapport avec le monitoring, signalé à l'utilisateur avant correction).
- `.gitignore` : ajout de `*.key` (clé SSH de la VM Oracle placée dans le repo par l'utilisateur pour cette étape, jamais commitée).
- `npm run lint`, `npm run build`, `npm test` (46 tests) passent tous sans erreur.
- **GAP-2026-09-23-01 résolu.**

## Chantier « Recherche par suggestions cliquables » (terminé le 2026-09-23, D-2026-09-23-05)

Demande explicite de l'utilisateur, hors feuille de route (traitée avant la charte graphique) : le filtrage en direct à chaque frappe hachait l'expérience.

- `components/search-bar.tsx` : plus de debounce-navigation à chaque frappe. Pendant la frappe (dès 2 caractères), fetch débouncé (200ms) vers `GET /api/products/suggest?q=` affiche une liste de suggestions cliquables sous le champ. Recherche déclenchée uniquement par clic sur une suggestion, touche Entrée (formulaire), ou clic sur l'icône loupe ajoutée dans le champ.
- `lib/products.ts` (nouveau) : `getProductSuggestions(q)` — `brand + model` de la table `products`, restreint aux articles ayant au moins une offre active, 8 résultats max.
- `app/api/products/suggest/route.ts` (nouveau) : route GET appelant `getProductSuggestions`.
- Tests : `tests/contract/product-suggestions.test.ts` (nouveau, 4 tests), `tests/e2e/catalog.spec.ts` mis à jour (les 2 tests recherche existants pressent désormais Entrée après le remplissage du champ, plus attendu ; nouveau test couvrant le flux suggestion → recherche).
- Vérification bout en bout : `npm run lint`, `npm run build`, `npm test` (50 tests, 8 fichiers), `npm run test:e2e` (10 tests) passent tous. Comportement contrôlé manuellement au navigateur (Playwright CLI) contre les données réelles de prod (Neon) pour les 3 déclencheurs (suggestion, Entrée, icône loupe) : le catalogue reste non filtré pendant la frappe.
- PR #23 (`feat/recherche-suggestions-clic`), poussée et créée automatiquement (D-2026-09-23-03).

## Feuille de route (actée le 2026-09-23, ordre confirmé par l'utilisateur)

1. ~~Monitoring du cron n8n~~ — terminé le 2026-09-23 (GAP-2026-09-23-01).
2. Charte graphique / design system (chantier en cours — hero construit et ajusté, reste spacing/layout et nav).
3. Ajout de marchands supplémentaires (dépend de GAP-2026-09-21-03 — compte Awin à créer par l'utilisateur).
4. Reste (mentions légales/CGU, disclosure affiliation, SEO, accessibilité, etc. — non détaillé à ce stade).

## Prochaine étape

Retour à la feuille de route : suite du chantier « Charte graphique / design system » (étape 2) — spacing/layout plus poussé et/ou style de la nav (inspiration Aceternity), à confirmer explicitement avec l'utilisateur en début de prochaine conversation. (Note : la recherche par suggestions traitée dans une conversation précédente était un ajout hors feuille de route, demandé explicitement par l'utilisateur.)
