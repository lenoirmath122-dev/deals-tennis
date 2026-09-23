# Journal des sessions

> Sessions du 2026-09-21 au 2026-09-22 (mise en place du protocole jusqu'à la méthode technique de collecte ProTennis) déplacées telles quelles dans `archive/JOURNAL_SESSIONS_2026-09-21_a_2026-09-22-methode-protennis.md` (D-2026-09-22-09/7bis, seuil 150 lignes).
> Sessions du 2026-09-22 (suite 2) au 2026-09-23 (recherche centrée article) déplacées telles quelles dans `archive/JOURNAL_SESSIONS_2026-09-22_a_2026-09-23-recherche-article.md` (même règle, condensation du 2026-09-23).
> Consulter les archives uniquement si le détail ci-dessous ne suffit pas.

## 2026-09-23 (suite 5) — Scroll dans les menus de suggestions de recherche + rattrapage PR en conflit

- Reprise de session (`/clear`). Demande hors feuille de route de l'utilisateur : ajouter un scroll dans les menus de suggestions de recherche pour ne pas être limité en hauteur.
- Décision mineure tranchée seule (autorisé par le protocole) : `max-h-72 overflow-y-auto` sur les deux niveaux du menu (catégories, articles) dans `components/search-bar.tsx`.
- Vérifié réellement au navigateur (Playwright CLI) contre les données réelles de prod (Neon) : recherche « de » → catégorie « Textile » (302 correspondances) → menu tronqué visuellement, `scrollHeight` (412px) > `clientHeight` (286px), `overflow-y: auto` confirmé actif par capture d'écran et lecture des dimensions DOM. `npm run lint`, `npm run build`, `npm test` (60 tests) passent tous.
- Commit du scroll ajouté par-dessus le commit local du chantier précédent (resté non poussé, session d'avant arrêtée avant l'étape 4 du protocole), branche `feat/recherche-suggestions-categorie` poussée, PR #27 créée.
- GitHub a signalé des conflits sur #27. Diagnostic : le commit initial du chantier précédent (« suggestions groupées par catégorie ») dupliquait, avec un SHA différent, ce que la PR #26 avait déjà mergé en squash entretemps — 3e occurrence du même schéma (voir mémoire feedback méthode de travail, §4). Résolu en recréant une branche propre (`fix/scroll-suggestions`) depuis `master` à jour, cherry-pick du seul commit de scroll (aucun conflit), nouvelle PR #28. PR #27 fermée sans merge (commentaire explicatif laissé).
- Branche `feat/recherche-suggestions-categorie` laissée en place (suppression jamais automatique sans confirmation au cas par cas, protocole point 4) — à supprimer côté utilisateur ou sur confirmation explicite.
- `ETAT_ACTUEL.md` mis à jour (chantier « Suggestions groupées par catégorie »).
- Prochaine étape : retour à la feuille de route, chantier « Charte graphique / design system » — à confirmer explicitement en début de prochaine conversation.

## 2026-09-23 (suite) — Cadrage du monitoring n8n (D-2026-09-23-01, GAP-2026-09-23-01)

- Reprise de session (`/clear`), protocole appliqué (ETAT_ACTUEL → GAPS_OUVERTS). Constat en route : le diff « recherche centrée article + détail deal » noté « non commité » dans `ETAT_ACTUEL.md` avait en fait été mergé entretemps (PR #16, `c3ed96c`) — corrigé.
- Prochaine étape soumise explicitement à l'utilisateur : chantier « Observabilité/monitoring » (n°11 de D-2026-09-21-09) choisi, périmètre restreint au monitoring du cron n8n ProTennis (déclencheur : GAP-2026-09-22-12).
- Trois mécanismes d'alerte présentés et comparés en détail (avantages/inconvénients) à la demande de l'utilisateur : dead man's switch externe (healthchecks.io), vérification côté app (Vercel Cron + email), alerte native n8n (2e workflow). Recommandation donnée (option 1, découplage du point de défaillance observé) et suivie par l'utilisateur.
- **D-2026-09-23-01** actée : healthchecks.io retenu.
- **Aucune étape de build n'a été démarrée** dans cette conversation, conformément au protocole (une étape de build par conversation) — l'utilisateur a explicitement demandé de reporter la mise en œuvre à une conversation dédiée.
- `GAPS_OUVERTS.md` : nouveau `GAP-2026-09-23-01` ouvert (mécanisme décidé, build restant). `DECISIONS_FONCTIONNELLES.md` et `ETAT_ACTUEL.md` mis à jour.
- Prochaine étape : construire le monitoring n8n (GAP-2026-09-23-01) — création du compte/check healthchecks.io par l'utilisateur, ajout du nœud HTTP de ping au workflow n8n, vérification réelle bout en bout.

## 2026-09-23 (suite 2) — Feuille de route confirmée (pas de build)

- Reprise de session, état d'avancement général demandé par l'utilisateur (résumé donné : MVP/prod/n8n opérationnels, bloquants identifiés : photo hero, monitoring, marchand unique).
- Ordre des 4 prochains chantiers confirmé explicitement par l'utilisateur : (1) monitoring n8n, (2) charte graphique, (3) ajout de marchands, (4) reste (CGU/mentions légales, SEO, accessibilité...). Consigné dans `ETAT_ACTUEL.md`.
- **Aucune étape de build n'a été démarrée** dans cette conversation, conformément au protocole.
- Prochaine étape : construire le monitoring n8n (GAP-2026-09-23-01) — étape 1 de la feuille de route, à traiter en conversation dédiée.

## 2026-09-23 (suite 3) — Monitoring n8n construit et vérifié de bout en bout (GAP-2026-09-23-01 résolu)

- Reprise de session (`/clear`), protocole appliqué. Commit des 4 fichiers de cadrage laissés non committés par la session précédente sur une branche dédiée (`docs/cadrage-monitoring-n8n`), pas de push sans demande explicite.
- URL de ping healthchecks.io fournie par l'utilisateur (compte/check créés côté utilisateur). Nœud HTTP Request ajouté à `scripts/automation/n8n-protennis-ingestion-workflow.json`, branché après le nœud d'éviction (ping uniquement si toute la chaîne réussit).
- Vérification réelle en local : port 5679 occupé par un serveur n8n déjà lancé en tâche de fond lors d'une tentative précédente — arrêté pour libérer le port, puis deux exécutions `n8n execute` réelles (site ProTennis + base Neon de prod réels) terminées `status: success`, ping reçu par healthchecks.io (`"data": "OK"`) à chaque fois. Simulation d'échec via l'endpoint dédié `/fail` : check passé à "Down", alerte email réellement déclenchée et **confirmée par l'utilisateur** (seule vérification qu'il devait faire lui-même, accès à sa boîte mail) ; ping de succès renvoyé ensuite pour revenir à l'état normal.
- Déploiement sur l'instance n8n permanente (VM Oracle) : accès SSH redonné par l'utilisateur (clé `ssh-key-2026-09-22.key` placée dans le repo, `*.key` ajouté à `.gitignore` par précaution avant toute autre action). Deux actions bloquées par le classificateur auto-mode (accès SSH puis commande de republication du workflow) débloquées après confirmation explicite de l'utilisateur à chaque fois. Workflow réimporté, republié (`n8n publish:workflow`), conteneur redémarré, `active: true` confirmé par export, fichiers temporaires nettoyés sur la VM.
- Effet de bord découvert en vérifiant `npm test` après les runs réels : les `UPDATE` du workflow ont changé l'ordre physique des lignes en base, exposant un `LIMIT 1` sans `ORDER BY` dans `tests/contract/deal-detail.test.ts` (dépendait implicitement d'un ordre de résultat non garanti). Signalé à l'utilisateur comme diff sans rapport avec le monitoring avant correction (protocole point 4) ; correctif validé et appliqué (titre précis au lieu d'un `ILIKE` large).
- `npm run lint`, `npm run build`, `npm test` (46 tests) passent tous sans erreur.
- **GAP-2026-09-23-01 résolu.**
- Question posée par l'utilisateur en cours de session : possibilité d'autorisation permanente pour les actions bloquées par l'auto-mode — répondu qu'une règle de permission durable est possible via `.claude/settings.json` (skill `update-config`), proposé pour une prochaine fois sans interrompre le déploiement en cours.
- Prochaine étape : chantier « Charte graphique / design system » (étape 2 de la feuille de route), toujours bloqué sur GAP-2026-09-21-04 (photo hero) — comment avancer malgré ce blocage à soumettre explicitement en début de prochaine conversation.

## 2026-09-23 (suite 4) — Section hero construite et vérifiée (GAP-2026-09-21-04 résolu)

- Reprise de session (`/clear`), protocole appliqué (ETAT_ACTUEL → GAPS_OUVERTS → dernier journal) : chantier « Charte graphique / design system » identifié comme prochaine étape, toujours bloqué sur la photo hero.
- L'utilisateur a fourni 3 photos de test dans `public/hero/` (dossier créé en amont sur sa demande). Les 3 comparées et présentées avec analyse (format, ton, cohérence avec la charte actée) ; recommandation donnée (photo aérienne `simone-viani`, format paysage large, tons désaturés adaptés à la superposition de texte) et validée par l'utilisateur sans modification.
- **D-2026-09-23-02** actée : choix de la photo hero. **GAP-2026-09-21-04 résolu.**
- Confirmation explicite demandée et obtenue avant de démarrer le build (construction de la section hero, étape de build unique de cette conversation).
- Build réalisé : nouveau composant `components/hero.tsx` (image plein cadre `next/image`, overlay dégradé pour lisibilité, titre + accroche repris de l'ancien `<h1>` du catalogue), intégré dans `app/(catalog)/page.tsx`.
- Vérification réelle : `npm run lint`, `npm run build`, `npm test` (46 tests) passent tous. Rendu contrôlé au navigateur via Playwright (serveur `next dev` de vérification, port 3001 — 3000 déjà occupé par un autre processus, non touché) : desktop et mobile (390×844), texte lisible, overlay cohérent. Captures d'écran temporaires et fichiers Playwright supprimés après contrôle ; serveur de vérification arrêté (port 3001 confirmé libéré).
- Diff non committé, laissé à la revue de l'utilisateur (conforme au protocole). Point signalé : la branche courante (`docs/cadrage-monitoring-n8n`) correspond à un chantier déjà mergé — une nouvelle branche sera nécessaire avant tout commit de ce travail.
- Prochaine étape : non tranchée — reste du chantier charte graphique (spacing/layout, style de la nav inspiration Aceternity) ou autre chantier de la feuille de route, à soumettre explicitement en début de prochaine conversation.

## 2026-09-23 (suite 5) — Push + PR de la section hero, nouvelle règle git automatique (D-2026-09-23-03)

- Push de `feat/hero-section` et création de la PR #18 demandés explicitement par l'utilisateur, exécutés.
- L'utilisateur a ensuite demandé que push + création de PR en fin d'étape de build se fassent désormais **automatiquement**, sans redemander confirmation à chaque fois.
- **D-2026-09-23-03** actée : modifie le point 4 (Git) du protocole (D-2026-09-21-01). Le merge reste manuel (décision de l'utilisateur après CI). Actions destructrices (reset --hard, force-push, suppression de branche) restent soumises à confirmation au cas par cas.
- Mis à jour : `DECISIONS_FONCTIONNELLES.md`, `INDEX.md` (règles de travail), mémoire persistante `feedback_methode_travail.md`.

## 2026-09-23 (suite 6) — Découverte du décalage prod/Git, connexion Vercel↔GitHub (GAP-2026-09-23-02, D-2026-09-23-04)

- Reprise de session (`/clear`). L'utilisateur signale que la section hero n'apparaît pas sur la prod (`https://deals-tennis.vercel.app`).
- Investigation (API Vercel MCP) : PR #18 bien mergée sur `master`, mais **le projet Vercel n'avait jamais été connecté à GitHub** — un seul déploiement production existait, datant du 21/09 (`source: "cli"`), donc PR #16 (recherche centrée article) et PR #18 (hero) n'étaient jamais arrivées en prod non plus. **GAP-2026-09-23-02** ouvert.
- L'utilisateur a connecté le repo depuis le dashboard Vercel (settings/git du projet). Clarifié un doute de sa part : le bouton "Connect" qui disparaît pour les autres repos listés est normal (un projet Vercel = une seule connexion Git), pas une déconnexion d'un autre projet.
- Un "Redeploy" tenté par l'utilisateur a en réalité re-servi l'ancien snapshot CLI (`source: "redeploy"`), pas le dernier commit `master` — la connexion seule ne redéploie pas rétroactivement.
- Tentative de déclencher un déploiement propre via l'API (`create_deployment`) bloquée deux fois : d'abord par le classificateur auto-mode ("Production Deploy"), puis par une erreur 403 (token MCP non autorisé sur le scope d'équipe `lenoir-nba` — problème d'authentification du connecteur, pas de l'action elle-même).
- Décision prise avec l'utilisateur : commit trivial + merge manuel pour déclencher le déploiement via le webhook Git maintenant actif (PR #19 créée, conforme à D-2026-09-23-03).
- Premier déploiement preview déclenché par ce push confirmé `source: "git"` (le webhook fonctionne), mais en échec de build (`npm run build` exit 1). Diagnostiqué via `filter_project_envs` : `DATABASE_URL` n'était configurée que pour `production`, jamais `preview` — même cause que GAP-2026-09-21-02 côté CI. **D-2026-09-23-04** actée avec l'utilisateur : `DATABASE_URL` étendue à `preview` via `edit_project_env` (jamais lue en clair, variable `sensitive`). Confirmé que le check obligatoire au merge (`build-and-test`) n'inclut pas le check `Vercel`, donc ceci ne bloque pas la PR.
- En documentant cette étape, découvert un problème distinct : **D-2026-09-23-03** (push+PR automatiques, décidée en fin de conversation précédente) avait été poussée sur `feat/hero-section` **après** que la PR #18 ait déjà été mergée par l'utilisateur — jamais arrivée sur `master`. Récupérée par `git cherry-pick` sur la branche de la PR #19 (`docs/vercel-git-deploy-gap`), qui porte donc maintenant le commit déclencheur + D-2026-09-23-03 + D-2026-09-23-04.
- Aucune étape de build produit n'a été réalisée dans cette conversation (uniquement config Vercel + documentation) — cohérent avec le protocole.
- L'utilisateur a mergé la PR #19 **avant** que les commits de documentation (D-2026-09-23-03 rattrapée + D-2026-09-23-04 + archivage du journal) n'aient été poussés — même schéma de course que pour la PR #18 (le squash merge n'a capturé que le premier commit de la branche). Repéré immédiatement après coup.
- **Vérifié réellement sur la prod** après ce merge (commit `b179aa2`, premier vrai déploiement production depuis Git) : section hero visible, recherche groupée par article fonctionnelle (`?q=Pure%20Aero`, badge « 2 offres »). **GAP-2026-09-23-02 résolu**, confirmé.
- Les commits de documentation manquants récupérés (`git cherry-pick` depuis `docs/vercel-git-deploy-gap`, toujours présente côté remote) sur une nouvelle branche `fix/rattrapage-decisions-manquees`, avec mise à jour finale du statut de GAP-2026-09-23-02 (résolu, vérifié).
- **Point de méthode retenu pour la suite** : quand une PR reste ouverte après un push initial, vérifier son statut de merge avant d'y ajouter des commits supplémentaires plutôt que de supposer qu'elle est encore ouverte — l'utilisateur mergeant souvent très vite après la création de la PR.
- Prochaine étape : une fois `fix/rattrapage-decisions-manquees` mergée, reprendre la feuille de route (reste du chantier charte graphique, ou chantier suivant) — à soumettre explicitement en début de prochaine conversation.

## 2026-09-23 (suite 7) — Hauteur du hero réduite (décision mineure)

- L'utilisateur a signalé que l'image du hero (PR #18) prenait trop de hauteur, demandé une réduction d'au moins 30%. Ajustement mineur du CSS (`components/hero.tsx`), pas de décision structurante — traité directement sans passer par `DECISIONS_FONCTIONNELLES.md`.
- Deux passes de réduction, chacune validée visuellement par l'utilisateur de son côté : `280/360px` → `196/250px`, puis `196/250px` → `150/190px` (mobile/desktop), soit ~46% de moins au total.
- Commit sur une branche dédiée (`fix/hero-hauteur-reduite`, créée depuis `master` pour ne pas mélanger avec la PR #20 alors en cours) : lint clean, push + PR #21 automatiques (D-2026-09-23-03). PR mise à jour (merge de `master`) après que la PR #20 a été mergée entre-temps, puis mergée par l'utilisateur.
- Aucune étape de build produit distincte de cet ajustement n'a été réalisée dans cette conversation.
- Prochaine étape : suite du chantier « Charte graphique / design system » (spacing/layout, style de la nav) — à soumettre explicitement en début de prochaine conversation.

## 2026-09-23 (suite 8) — Recherche par suggestions cliquables au lieu du filtrage en direct (D-2026-09-23-05)

- Reprise de session (`/clear`). L'utilisateur demande directement un changement de comportement de la recherche (hors feuille de route, qui prévoyait la charte graphique) : le filtrage en direct à chaque frappe hache l'expérience ; il veut des suggestions d'articles cliquables, la recherche ne se déclenchant qu'au clic sur la loupe, à l'appui sur Entrée, ou au clic sur une suggestion.
- Écart de feuille de route signalé à l'utilisateur avant de commencer ; questions de clarification posées (source des suggestions, comportement au clic, présence d'une icône loupe) — répondu : suggestions = titres d'articles (table `products`), clic sur suggestion = lance la recherche avec ce texte, icône loupe ajoutée.
- Build réalisé (étape unique de cette conversation) : `lib/products.ts` (nouveau, `getProductSuggestions`), `app/api/products/suggest/route.ts` (nouveau), `components/search-bar.tsx` réécrit (plus de debounce-navigation à chaque frappe, dropdown de suggestions, formulaire avec icône loupe).
- Tests ajoutés/adaptés : `tests/contract/product-suggestions.test.ts` (nouveau, 4 tests) ; `tests/e2e/catalog.spec.ts` — les 2 tests recherche existants adaptés (appui sur Entrée requis désormais), nouveau test du flux suggestion → recherche.
- Un test e2e a d'abord échoué (`element(s) not found` sur la suggestion) — diagnostiqué comme un délai de première connexion Neon plus long que le timeout par défaut (5s) via une session Playwright manuelle (endpoint confirmé fonctionnel par ailleurs) ; corrigé en portant le timeout de cette assertion à 10s. Un serveur `next dev` orphelin d'une session précédente (PID 19400, port 3001) bloquait le lancement des tests e2e — confirmation demandée à l'utilisateur avant de le terminer, obtenue, tué.
- Vérification réelle complète : `npm run lint`, `npm run build`, `npm test` (50 tests, 8 fichiers), `npm run test:e2e` (10 tests) tous verts. Comportement contrôlé manuellement au navigateur (Playwright CLI, serveur de vérification dédié port 3123, arrêté après contrôle) contre les données réelles de prod (Neon) pour les 3 déclencheurs — le catalogue reste bien non filtré pendant la frappe dans les 3 cas.
- Commit sur une nouvelle branche dédiée (`feat/recherche-suggestions-clic`, l'ancienne branche ne convenant pas), ne contenant que les fichiers liés à cette étape (les 2 photos hero laissées non stagées, hors sujet et pas de mon fait). Push + création de PR automatiques (D-2026-09-23-03) : **PR #23**.
- **D-2026-09-23-05** actée et construite. Consignée dans `DECISIONS_FONCTIONNELLES.md` et `ETAT_ACTUEL.md`.
- Prochaine étape : retour à la feuille de route — chantier « Charte graphique / design system » (étape 2), à confirmer explicitement en début de prochaine conversation.

## 2026-09-23 (suite 9) — Fix recherche insensible à l'ordre des mots (bug rapporté par l'utilisateur)

- Reprise de session (`/clear`). L'utilisateur rapporte 3 symptômes sur la recherche (suggestions ne mènent à rien / recherche exacte parfois infructueuse / demande de sous-catégorie couleur) avec un exemple concret (Babolat Antivibrateur de tennis Sonic Damp).
- Diagnostic avec données réelles (Neon prod, requêtes directes) : `ILIKE '%requête%'` sur toute la chaîne, alors que le nom produit (suggestions) et le titre du deal scrappé n'ont pas le même ordre de mots. Reproduit en navigateur (Playwright CLI) avant tout fix : clic sur la suggestion → 0 résultat.
- Clarification demandée à l'utilisateur sur le point 1 (ambigu) : confirmé qu'il s'agit du même symptôme que le point 4 (suggestion cliquée sans résultat), pas d'un problème distinct d'affichage du menu.
- Deux décisions soumises avant build : approche de fix (mot-à-mot retenu vs plein texte PostgreSQL) et traitement de la demande de sous-catégorie couleur (reportée à une conversation dédiée, conformément au protocole une étape/conversation — nouveau GAP-2026-09-23-03 ouvert).
- Fix appliqué (`lib/deals.ts`, `lib/products.ts`), vérifié en réel après coup (même clic → article trouvé), tests de régression ajoutés, lint/build/tests passants.
- Branche précédente (`feat/recherche-suggestions-clic`) déjà mergée (PR #23) — nouvelle branche `fix/recherche-mot-a-mot` créée depuis `master` à jour, PR #24 poussée et créée automatiquement.
- Prochaine étape : cadrage de la sous-catégorie couleur (GAP-2026-09-23-03) ou reprise de la feuille de route (charte graphique), au choix de l'utilisateur en début de prochaine conversation.

## 2026-09-23 (suite 10) — Sous-catégorie couleur (D-2026-09-23-06, résout GAP-2026-09-23-03)

- Reprise de session (`/clear`). GAP-2026-09-23-03 soumis explicitement comme point en attente ; l'utilisateur a demandé à le traiter en premier.
- Deux décisions structurantes soumises avant tout build : (1) la couleur reste un attribut affiché, pas une clé d'identité produit (couleurs fusionnées comme un seul article) ; (2) extraction automatique depuis le titre scrappé (plutôt que pas d'extraction).
- Build : `lib/product-matching.ts` étendu (`extractColor`, retrait des mots de couleur — français + anglais, marchands mélangeant les deux — du modèle dans `extractModel`), migration `004_deals_color.sql` (`deals.color`), nouveau script `scripts/backfill-colors.ts` (recalcule modèle/couleur sur **toutes** les offres, pas seulement celles sans `product_id`, pour fusionner les produits qui n'étaient distincts que par couleur), miroir JS + upsert SQL du workflow n8n ProTennis mis à jour en parallèle.
- Vérification réelle bout en bout sur la prod (Neon) : migration appliquée directement (GAP-2026-09-22-07 toujours non résolu, même contournement que pour 002), backfill exécuté sur 1505 offres réelles — **881 produits en doublon uniquement par couleur fusionnés/supprimés** (1503 → 1322 produits), confirmé par un cas concret ("Adidas Barricade 14 Homme" : 4 titres couleur différents désormais sous le même `product_id`, un seul résidu non fusionné faute de mot-clé couleur reconnu — "Lucid", limitation documentée et acceptée). Suggestions vérifiées sur ce cas réel (avant/après : ~14 variantes quasi-dupliquées → 9 entrées distinctes). `npm run lint`, `npm run build`, `npm test` (56 tests, 8 fichiers), `npm run test:e2e` (9 tests) tous verts après le backfill.
- Portée volontairement limitée : pas de filtre/badge couleur ajouté à l'UI (non demandé, le titre affiché reste inchangé et montre déjà la couleur) — uniquement la correction de la pollution recherche/suggestions décrite dans le GAP.
- Push + création de PR automatiques (D-2026-09-23-03) : branche `feat/sous-categorie-couleur`.
- **D-2026-09-23-06 actée et construite. GAP-2026-09-23-03 résolu.**
- Prochaine étape : retour à la feuille de route — chantier « Charte graphique / design system » (étape 2, spacing/layout et/ou nav), à confirmer explicitement en début de prochaine conversation.

## 2026-09-23 (suite 11) — Suggestions de recherche groupées par catégorie (D-2026-09-23-07)

- Reprise de session (`/clear`). Demande explicite de l'utilisateur, hors feuille de route : les suggestions de recherche (liste plate triée alphabétiquement) doivent se regrouper par catégorie (raquettes, cordages, etc.), les noms d'articles n'apparaissant qu'après clic sur une catégorie ; touche Entrée reste inchangée (filtre texte seul).
- Décision structurante soumise avant build (deux questions ciblées) : (1) clic catégorie reste dans le menu déroulant (2e niveau d'articles) plutôt que de naviguer directement ; (2) clic sur un article final inclut la catégorie choisie dans l'URL de recherche (`category=X&q=texte`), pas texte seul. **D-2026-09-23-07 actée.**
- Build : `lib/filters.ts` (`CATEGORY_LABELS` partagé), `lib/products.ts` (`getSuggestionCategories`, `getProductSuggestions` avec filtre catégorie optionnel), `app/api/products/suggest/route.ts` (bascule 1er/2e niveau), `components/search-bar.tsx` (menu à deux niveaux).
- Vérification réelle bout en bout : `npm run lint`, `npm run build`, `npm test` (60 tests), `npm run test:e2e` (9 tests) tous verts. Flux complet contrôlé au navigateur (Playwright CLI) contre la prod (Neon) : « babolat » → catégories avec compteurs réels → clic Raquettes → articles → clic article → `?category=raquettes&q=...` ; Entrée seule → `?q=...` sans catégorie.
- Un flake e2e initial (timeout 10s tout juste dépassé sur le premier test de la suite, cold-start Turbopack) diagnostiqué et confirmé non reproductible (test isolé puis suite complète, deux fois verts).
- Branche précédente (`feat/sous-categorie-couleur`) déjà mergée (PR #25) — nouvelle branche `feat/recherche-suggestions-categorie` créée depuis `master` à jour.
- Prochaine étape : retour à la feuille de route — chantier « Charte graphique / design system » (étape 2), à confirmer explicitement en début de prochaine conversation (sauf nouvelle demande hors feuille de route).
