# Détail archivé — chantiers terminés entre le 2026-09-23 (recherche centrée article) et le 2026-09-23 (fix lien de retour vers l'accueil)

> Déplacé tel quel depuis `ETAT_ACTUEL.md` le 2026-09-24 (seuil 150 lignes dépassé, §7bis). Contenu non modifié par rapport à la version courante au moment de l'archivage. Consulter uniquement si le résumé condensé dans `ETAT_ACTUEL.md` ne suffit pas pour un point précis.

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

## Chantier « Fix recherche insensible à l'ordre des mots » (terminé le 2026-09-23, hors feuille de route)

Bug rapporté par l'utilisateur sur la fonctionnalité de suggestions cliquables (D-2026-09-23-05, livrée juste avant) : cliquer sur une suggestion ramenait parfois 0 résultat, et taper un nom d'article exact ne le trouvait pas toujours. Exemple fourni : "Babolat Antivibrateur de tennis Sonic Damp".

- Cause diagnostiquée avec des données réelles (Neon prod) : `getCatalogDeals`/`getProductSuggestions` comparaient la requête au titre/marque du deal via un `ILIKE '%texte%'` (sous-chaîne exacte de toute la requête). Le nom de produit affiché en suggestion (`brand + model`, table `products`) n'a pas toujours le même ordre de mots que le titre du deal scrappé — ex. produit réel `Babolat` + `Antivibrateur de tennis Sonic Damp` vs titre du deal `Antivibrateur de tennis Babolat Sonic Damp`. Les 3 symptômes rapportés par l'utilisateur se sont révélés être une seule et même cause (confirmé par une question de clarification avant fix).
- Fix (`lib/deals.ts`, `lib/products.ts`) : la requête est découpée en mots, chaque mot doit matcher le titre ou la marque (ILIKE), peu importe l'ordre — au lieu d'exiger toute la chaîne comme sous-chaîne unique.
- Deux approches de fix présentées et comparées à l'utilisateur avant build (mot-à-mot vs recherche plein texte PostgreSQL) — mot-à-mot retenu (plus simple, corrige le cas rapporté).
- Vérifié en réel de bout en bout : reproduction du bug en navigateur (Playwright CLI) contre la prod (Neon) avant fix, re-vérification après fix (clic sur la suggestion Sonic Damp → article trouvé). Tests de régression ajoutés (`tests/contract/catalog-query.test.ts`, `tests/contract/product-suggestions.test.ts`, cas réel Sonic Damp). `npm run lint`, `npm run build`, `npm test` (52 tests) passent tous.
- PR #24 (`fix/recherche-mot-a-mot`), poussée et créée automatiquement (protocole point 4). Note : la branche précédente (`feat/recherche-suggestions-clic`, PR #23) était déjà mergée sur `master` au moment de ce fix — nouvelle branche créée à partir de `master` à jour pour l'éviter.
- Demande connexe de l'utilisateur (sous-catégorie par couleur pour éviter la pollution des champs de recherche) **non traitée ici** — nouvelle fonctionnalité structurante, cadrée dans le chantier suivant (D-2026-09-23-06).

## Chantier « Sous-catégorie couleur » (terminé le 2026-09-23, D-2026-09-23-06, résout GAP-2026-09-23-03)

Demande explicite de l'utilisateur (rapportée en même temps que le fix de recherche mot-à-mot) : des articles ne différant que par la couleur généraient des variantes de nom polluant la recherche/les suggestions.

- Deux décisions soumises avant build : couleur = attribut affiché, pas clé d'identité produit (couleurs fusionnées comme un seul article) ; source = extraction automatique depuis le titre scrappé.
- `lib/product-matching.ts` : nouvelle fonction `extractColor` (liste de couleurs français + anglais → forme canonique française unique, les marchands mélangeant les deux) ; `extractModel` retire désormais aussi les mots de couleur reconnus. Miroir JS synchronisé dans le workflow n8n ProTennis (parsing + upsert, nouvelle colonne `deals.color`).
- Migration `004_deals_color.sql` (`deals.color`, nullable). Nouveau script `scripts/backfill-colors.ts` : recalcule modèle/couleur sur **toutes** les offres existantes (contrairement à `backfill-product-ids.ts`, limité aux offres sans `product_id`) pour fusionner les produits qui n'étaient distincts que par couleur, puis supprime les produits orphelins résultants.
- Vérifié réellement sur la prod (Neon) : migration appliquée, backfill exécuté sur 1505 offres réelles — **881 produits en doublon uniquement par couleur fusionnés** (1503 → 1322 produits). Cas concret vérifié ("Adidas Barricade 14 Homme" : 4 couleurs fusionnées sous le même produit, suggestions passées de ~14 variantes quasi-dupliquées à 9 entrées distinctes pour toute la famille "Barricade"). Un résidu non fusionné documenté comme limitation acceptée (mot de coloris propriétaire "Lucid" non reconnu — vocabulaire de couleur non exhaustif par construction).
- Portée volontairement limitée à la correction du problème rapporté : pas de filtre/badge couleur ajouté à l'UI (le titre affiché montre déjà la couleur, inchangé).
- `npm run lint`, `npm run build`, `npm test` (56 tests, 8 fichiers), `npm run test:e2e` (9 tests) passent tous.
- **GAP-2026-09-23-03 résolu.**

## Chantier « Suggestions de recherche groupées par catégorie » (terminé le 2026-09-23, D-2026-09-23-07)

Demande explicite de l'utilisateur, hors feuille de route : les suggestions de recherche (D-2026-09-23-05) étaient une liste plate triée alphabétiquement, peu lisible quand une marque couvre plusieurs catégories (ex. « babolat »).

- Décision soumise et actée avant build (D-2026-09-23-07) : menu de suggestions à deux niveaux, sans navigation. 1er niveau = catégories ayant au moins un article correspondant (avec compteur) ; clic sur une catégorie → 2e niveau, noms d'articles de cette catégorie dans le même menu. Clic sur un article → recherche texte + catégorie (`/?category=X&q=texte`). Touche Entrée : comportement inchangé (texte seul, toutes catégories).
- `lib/filters.ts` : `CATEGORY_LABELS` extrait de `components/category-filter.tsx` (désormais partagé avec `search-bar.tsx`).
- `lib/products.ts` : nouvelle fonction `getSuggestionCategories(q)` (catégories + compteur, ordonnées selon `DEAL_CATEGORIES`) ; `getProductSuggestions(q, category?)` accepte désormais un filtre catégorie optionnel.
- `app/api/products/suggest/route.ts` : bascule entre les deux niveaux selon la présence d'un paramètre `category` valide dans la requête.
- `components/search-bar.tsx` : menu à deux niveaux (catégories → articles, avec bouton retour), état réinitialisé au niveau catégories à chaque nouvelle frappe.
- Tests : `tests/contract/product-suggestions.test.ts` (+7 tests : `getSuggestionCategories`, filtre catégorie de `getProductSuggestions`), `tests/e2e/catalog.spec.ts` mis à jour (le test suggestions clique désormais catégorie puis article, vérifie `category=raquettes` dans l'URL finale).
- Vérifié réellement : `npm run lint`, `npm run build`, `npm test` (60 tests, 8 fichiers), `npm run test:e2e` (9 tests) passent tous. Flux complet contrôlé au navigateur (Playwright CLI) contre les données réelles de prod (Neon) : saisie « babolat » → catégories Raquettes/Cordages/... avec compteurs réels, clic Raquettes → liste d'articles + bouton retour, clic article → navigation `?category=raquettes&q=...` ; touche Entrée seule → `?q=...` sans catégorie (inchangé).
- Nouvelle branche `feat/recherche-suggestions-categorie` créée depuis `master` à jour (la branche précédente, `feat/sous-categorie-couleur`, était déjà mergée — PR #25). Mergé depuis (PR #26).

Ajout ultérieur, conversation suivante, hors feuille de route : demande explicite de l'utilisateur d'un scroll sur les deux niveaux du menu de suggestions (pas de limite de hauteur visible). `components/search-bar.tsx` : `max-h-72 overflow-y-auto` sur les deux `<ul>`. Vérifié réellement au navigateur (Playwright CLI, données réelles Neon) : recherche « de » → catégorie « Textile » (302 correspondances) → liste tronquée visuellement, `scrollHeight` (412px) > `clientHeight` (286px), `overflow-y: auto` actif. `npm run lint`, `npm run build`, `npm test` (60 tests) passent tous. PR #28 (`fix/scroll-suggestions`).
- Incident git rencontré (3e occurrence du même schéma, voir mémoire feedback) : le commit initial de ce chantier était resté local, non poussé, à la fin de la session précédente (arrêtée avant l'étape 4 du protocole). Une PR construite par-dessus (#27, branche `feat/recherche-suggestions-categorie` avec le commit du scroll ajouté) s'est retrouvée en conflit car ce commit initial dupliquait (contenu identique, SHA différent) ce que la PR #26 avait déjà mergé en squash entretemps. Résolu en recréant une branche propre (`fix/scroll-suggestions`) depuis `master` à jour, cherry-pick du seul commit de scroll, nouvelle PR #28 ; #27 fermée sans merge.

## Fix « Plafond de 8 suggestions par catégorie » (terminé le 2026-09-23, D-2026-09-23-08)

Bug rapporté par l'utilisateur juste après le fix du scroll (PR #28, déjà mergée) : dans le menu de suggestions à deux niveaux, certains articles réels (ex. « BABOLAT RPM TEAM 125 BOBINE 200m ») n'apparaissaient jamais même en scrollant.

- Cause diagnostiquée : `getProductSuggestions` (`lib/products.ts`) avait un `LIMIT 8` en dur hérité de l'ancienne liste plate (D-2026-09-23-05) — le scroll ne peut afficher que ce qui a été chargé, or la requête SQL ne remontait jamais plus de 8 lignes.
- Fix (D-2026-09-23-08) : suppression du plafond, la requête retourne tous les articles correspondants de la catégorie.
- Effet de bord découvert : le test `product-suggestions.test.ts` (« matches on brand as well as model ») supposait à tort que toute suggestion correspondant à « Babolat » commence par « babolat » — hypothèse fausse en présence de données réelles (produit « Head Protection raquette de tennis Babolat Super Tape », voir GAP-2026-09-23-04), masquée jusqu'ici par le plafond de 8. Assertion corrigée (`startsWith` → `includes`, reflète l'intention réelle du test : correspondance sur marque OU modèle, pas préfixe).
- Vérifié réellement au navigateur (Playwright CLI, données réelles Neon) : recherche « babolat » → catégorie « Cordages » → « Babolat RPM TEAM 125 BOBINE 200m » présent après scroll, clic → navigation `?category=cordages&q=...` correcte. `npm run lint`, `npm run build`, `npm test` (60 tests), `npm run test:e2e` (9 tests) passent tous.
- **GAP-2026-09-23-04 ouvert** (donnée produit erronée découverte en marge, hors scope de ce fix).
- PR #29 (`fix/limite-suggestions-articles`).

## Chantier « Pages réglementaires » (terminé le 2026-09-23, D-2026-09-23-10)

Reprise du point 4 de la feuille de route (« mentions légales/CGU, disclosure affiliation, SEO, accessibilité »), jamais détaillé jusqu'ici. SEO et accessibilité restent hors périmètre de cette étape.

- Périmètre soumis et confirmé par l'utilisateur : mentions légales, CGU, politique de confidentialité/cookies, disclosure affiliation. Source du contenu : rédigé directement par Claude Code (texte standard/générique, pas une rédaction par un professionnel du droit — signalé explicitement à l'utilisateur), faute de compétence juridique côté utilisateur.
- Faits confirmés par l'utilisateur avant rédaction : éditeur particulier (Mathieu Lenoir, `lenoir.math122@gmail.com`), hébergement Vercel + base Neon, domaine `deals-tennis.vercel.app` uniquement (pas de domaine personnalisé acté), aucun outil d'analytics/tracking tiers installé (vérifié dans le code), modèle d'affiliation via `/go/[dealId]` (marchand actif : ProTennis).
- 4 nouvelles pages statiques : `app/mentions-legales/page.tsx`, `app/cgu/page.tsx`, `app/confidentialite/page.tsx`, `app/affiliation/page.tsx`, toutes construites sur un composant partagé `components/legal-page.tsx` (titre, date de mise à jour, sections).
- Politique de confidentialité rédigée à partir d'une lecture réelle du code de tracking (`lib/tracking.ts`, `app/go/[dealId]/route.ts`) : seules des statistiques anonymes de clic sont enregistrées (type d'appareil, page de référence interne), aucune adresse IP ni identifiant utilisateur — pas seulement une affirmation générique.
- `components/footer.tsx` (nouveau) : lien vers les 4 pages, intégré à `app/layout.tsx` sur tout le site.
- Vérifié réellement : `npm run lint`, `npm run build` (les 4 pages générées en statique `○`), `npm test` (60 tests) passent tous. Serveur de vérification dédié (port 3123) : les 4 routes répondent 200, titres `<title>` corrects, liens du footer présents sur la page d'accueil, contenu attendu présent (nom de l'éditeur, mention absence de traceur), serveur arrêté après contrôle.
- **D-2026-09-23-10 actée et construite.**

## Fix « Lien de retour vers l'accueil » (terminé le 2026-09-23, hors feuille de route)

Demande explicite de l'utilisateur juste après le chantier « Pages réglementaires » : depuis ces pages il n'y avait aucun moyen de revenir à l'accueil, et le nom du site dans le footer n'était pas cliquable.

- `components/footer.tsx` : le texte « Deals Tennis » du footer redevient un lien vers `/`.
- `components/legal-page.tsx` : ajout d'un lien « ← Retour à l'accueil » en haut de chaque page réglementaire.
- La PR #31 (pages réglementaires) était déjà mergée en squash au moment de cette demande — nouvelle branche `fix/retour-accueil` créée depuis `master` à jour pour éviter le conflit déjà rencontré par le passé (protocole git, point 4).
- Vérifié réellement : `npm run lint`, `npm run build`, `npm test` (60 tests) passent tous. Serveur de vérification dédié (port 3123) : lien footer vers `/` présent (`href="/"`), lien « Retour à l'accueil » présent sur `/mentions-legales` ; serveur arrêté après contrôle.
- PR #32 (`fix/retour-accueil`), poussée et créée automatiquement.
