# Journal des sessions

> Sessions du 2026-09-21 au 2026-09-22 (mise en place du protocole jusqu'à la méthode technique de collecte ProTennis) déplacées telles quelles dans `archive/JOURNAL_SESSIONS_2026-09-21_a_2026-09-22-methode-protennis.md` (D-2026-09-22-09/7bis, seuil 150 lignes).
> Sessions du 2026-09-22 (suite 2) au 2026-09-23 (recherche centrée article) déplacées telles quelles dans `archive/JOURNAL_SESSIONS_2026-09-22_a_2026-09-23-recherche-article.md` (même règle, condensation du 2026-09-23).
> Consulter les archives uniquement si le détail ci-dessous ne suffit pas.

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
