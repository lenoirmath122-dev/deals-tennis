# Points ouverts

## GAP-2026-09-23-05 — Marchands supplémentaires : en attente du résultat d'une recherche externe de programmes d'affiliation (OUVERT)

Suite à D-2026-09-23-09 : 6 candidats au scraping direct (Private Sport Shop, Tennis Pro, Wilson, Babolat, Yonex, Head) ont tous été écartés après vérification réelle (robots.txt/CGU, protection anti-bot technique pour Wilson, SPA JS pour Private Sport Shop — voir la décision pour le détail par marchand). L'utilisateur a choisi de rechercher de nouveaux marchands tennis avec un programme d'affiliation public via un outil externe (« cowork ») plutôt que d'assumer un risque supplémentaire de scraping direct.

**Bloquant sur** : action de l'utilisateur hors de cette session (recherche cowork) ; à rapporter en résultat au début d'une prochaine conversation.

**Statut** : ouvert au 2026-09-23.

---

## GAP-2026-09-23-04 — Mauvaise marque associée à un produit ProTennis (« Head » au lieu de « Babolat ») (OUVERT, mineur)

Découvert en vérifiant le fix du plafond de suggestions (D-2026-09-23-08) : le produit dont le titre scrappé est « Protection raquette de tennis Babolat Super Tape » (catégorie accessoires, marchand ProTennis) est enregistré en base avec `brand = 'Head'` alors qu'il s'agit visiblement d'un article Babolat. Conséquence mineure observée : ce produit remonte dans les suggestions de la recherche « Babolat » (correspondance sur le mot dans `model`) alors que sa fiche affiche la marque Head.

**Cause non investiguée** : à vérifier si le titre ProTennis lui-même contient une erreur (article mal classé côté marchand) ou si l'extraction de marque (`lib/product-matching.ts`) a mal identifié la marque sur ce titre précis.

**Bloquant sur** : rien dans l'immédiat — un seul produit concerné, impact cosmétique (suggestion visible dans la mauvaise recherche). À traiter au fil de l'eau ou lors d'un futur passage sur la qualité des données produit.

**Statut** : ouvert au 2026-09-23.

---

## GAP-2026-09-23-03 — Sous-catégorie couleur pour ne pas polluer la recherche/le nom d'article (RÉSOLU)

Demande explicite de l'utilisateur (rapportée en même temps que le bug de recherche insensible à l'ordre des mots) : certains articles n'ont de différence que la couleur, ce qui génère des variantes de nom qui polluent les champs de recherche/suggestions.

**Résolution (D-2026-09-23-06)** : couleur retenue comme attribut affiché (pas clé d'identité produit) extrait automatiquement du titre scrappé. `lib/product-matching.ts` (`extractColor`, `extractModel` nettoyé), migration `004_deals_color.sql`, `scripts/backfill-colors.ts`, workflow n8n ProTennis mis à jour. Vérifié réellement sur la prod : 881 produits en doublon uniquement par couleur fusionnés (1503 → 1322). Voir `ETAT_ACTUEL.md` pour le détail.

**Statut** : résolu le 2026-09-23.

---

## GAP-2026-09-23-02 — Prod restée figée sur le déploiement CLI du 2026-09-21, jamais reconnectée à Git (RÉSOLU)

En vérifiant pourquoi la section hero (PR #18) n'apparaissait pas sur `https://deals-tennis.vercel.app`, découvert que le projet Vercel n'avait **jamais** été connecté au dépôt GitHub depuis sa création (D-2026-09-21-10 : déploiement initial volontairement fait via CLI, le lien Git devait être traité au chantier CI mais ne l'a jamais été — seuls les checks GitHub Actions l'ont été). Conséquence : la prod tournait sur l'unique déploiement du 21/09, ratant tout ce qui a été mergé depuis (PR #16 recherche centrée article, PR #18 hero).

**Résolution** : l'utilisateur a connecté le repo `lenoirmath122-dev/deals-tennis` à Vercel (branche `master`) depuis le dashboard. Un premier "Redeploy" tenté par l'utilisateur a re-servi l'ancien snapshot CLI (`source: "redeploy"`, pas un vrai pull Git) ; un premier déploiement preview parti du webhook Git a confirmé la connexion active mais échoué au build (`DATABASE_URL` absente de l'environnement preview — voir D-2026-09-23-04). Le merge de la PR #19 (commit déclencheur) a produit le premier vrai déploiement production depuis Git (`source: "git"`, commit `b179aa2`).

Vérifié réellement sur `https://deals-tennis.vercel.app` après ce déploiement : section hero visible (photo + overlay), recherche groupée par article fonctionnelle (`?q=Pure%20Aero` affiche le badge « 2 offres »).

**Statut** : résolu le 2026-09-23.

---

## GAP-2026-09-21-01 — `tasks.md` coché mais aucun code correspondant (RÉSOLU)

`cadrage_deals-tennis/tasks.md` listait des tâches marquées `[x]` sans aucun code réel correspondant, et des liens pointant vers `C:/Users/lenoi/mon-projet/specs/...` (un autre projet).

**Résolution (D-2026-09-21-05)** : toutes les cases ont été décochées (`[x]` → `[ ]`), les liens corrigés pour pointer vers `cadrage_deals-tennis/`. `tasks.md` reflète maintenant une liste de tâches à faire, aucune n'étant réellement commencée.

**Statut** : résolu le 2026-09-21.

---

## GAP-2026-09-21-03 — Pas de compte Awin publisher, datafeed non vérifiable (OUVERT)

Tennis Point FR (Awin #13266) et Padel-Point FR (Awin #25160) annoncent un flux de données produit (datafeed) dans les avantages de leur programme Awin, mais le format exact (CSV/XML, champs, fréquence) n'est visible qu'après création d'un compte affilié Awin et acceptation de la candidature sur chacun des deux programmes. Aucun compte Awin n'existe à ce jour.

**Bloquant sur** : action de l'utilisateur, hors périmètre de Claude Code (création de compte, informations d'entreprise/paiement, candidature aux programmes).

**Statut** : ouvert au 2026-09-21.

---

## GAP-2026-09-21-02 — Pas de dossier `hooks`/CI configuré pour la protection de branche (RÉSOLU)

Le protocole prévoit un flux branche → PR → CI → merge une fois une protection de branche en place, mais aucun remote GitHub/CI n'est encore configuré.

**Résolution (chantier CI + protection de branche, D-2026-09-21-11)** : dépôt GitHub privé `lenoirmath122-dev/deals-tennis` créé et lié en `origin`. Workflow GitHub Actions (`.github/workflows/ci.yml`) exécutant lint + build + tests unitaires (`npm run test:unit`, nouveau script scoping vitest à `tests/unit/`) sur chaque push/PR vers `master`, avec `DATABASE_URL` en secret repo (requis même sans tests de contrat : `lib/db.ts` évalue la connexion Neon au chargement du module, donc `next build` échoue sans cette variable). Protection de branche `master` activée : check `build-and-test` obligatoire avant merge, force-push et suppression de branche interdits. Merge squash uniquement + suppression automatique de la branche source configurés sur le repo (conforme au protocole point 4).

**Statut** : résolu le 2026-09-21.

---

## GAP-2026-09-21-05 — Méthode technique de scraping (n8n HTTP node vs Playwright) et fréquence non tranchées (RÉSOLU)

Suite à D-2026-09-21-16, une liste candidate de revendeurs a été actée pour le scraping direct. **Résolu (D-2026-09-22-01)** : `robots.txt` et CGV/mentions légales vérifiés réellement pour Tennispro.fr, Sport 2000, SportSystem, ProTennis, Decathlon — ProTennis retenu comme premier marchand (portée minimale : titre/prix/catégorie, image hotlinkée depuis le marchand, pas de description/visuel copié). **Résolu (D-2026-09-22-02)** : méthode technique (nœud HTTP Request n8n + parsing HTML, pas de Playwright) et fréquence (1 fois par jour) tranchées.

**Statut** : résolu le 2026-09-22.

---

## GAP-2026-09-22-06 — Pas d'hébergement permanent pour n8n (RÉSOLU)

Le workflow n8n ProTennis (`scripts/automation/n8n-protennis-ingestion-workflow.json`) avait été construit et vérifié avec une instance n8n **locale et temporaire** (`npx n8n`, arrêtée après vérification). Aucune instance n8n ne tournait en continu.

**Résolution (D-2026-09-22-04)** : VM Oracle Cloud Free Tier provisionnée (`n8n-server`, `VM.Standard.A1.Flex`, 1 OCPU/6 Go, Oracle Linux 9, IP publique éphémère `145.241.173.33`, région `eu-paris-1`). Docker + Docker Compose installés. n8n déployé derrière un reverse proxy Caddy avec certificat HTTPS automatique (Let's Encrypt) sur le sous-domaine gratuit `deals-tennis-n8n.duckdns.org` (DuckDNS). Accès protégé par authentification basique (identifiant `admin`, mot de passe généré, communiqué à l'utilisateur — non stocké dans le dépôt) en plus du compte propriétaire n8n créé par l'utilisateur. Credential Postgres `Neon deals-tennis` créée manuellement dans l'UI n8n (jamais transmise en clair via un outil, bloqué explicitement par la protection anti-fuite d'identifiants de Claude Code — créée par l'utilisateur en suivant les valeurs de `.env.local`). Workflow ProTennis importé (`n8n import:workflow`), testé manuellement avec succès (23 offres, `updated_at` confirmé en base Neon de prod au moment du test), puis **activé** — le déclencheur planifié quotidien (6h) tourne maintenant réellement en continu.

**Statut** : résolu le 2026-09-22.

---

## GAP-2026-09-22-07 — `scripts/migrate.ts` non idempotent (OUVERT, mineur)

Le runner de migration (`scripts/migrate.ts`, `npm run db:migrate`) réapplique **tous** les fichiers de `scripts/migrations/` à chaque exécution, sans table de suivi des migrations déjà appliquées. La migration `002_deals_unique_merchant_url.sql` a dû être appliquée manuellement (hors `db:migrate`) pour cette raison — relancer `npm run db:migrate` échouerait sur `001_init_schema.sql` (`CREATE TABLE` sur des tables déjà existantes). Sans impact aujourd'hui (fait rare), mais à corriger avant d'ajouter une 3e migration si le problème doit être évité à nouveau.

**Bloquant sur** : rien dans l'immédiat — amélioration technique à planifier, pas une décision utilisateur.

**Statut** : ouvert au 2026-09-22.

---

## GAP-2026-09-22-08 — Rapprochement produit multi-marchands : fondation, recherche et détail deal construits (RÉSOLU)

Suite à D-2026-09-22-05, puis élevé par l'utilisateur au rang d'axe central du produit (comparaison de prix multi-marchands). **Direction actée en D-2026-09-22-06** : table `products` (marque+modèle+catégorie) + `deals.product_id` nullable, rapprochement par extraction du modèle depuis le titre (la marque vient en réalité de `deals.brand`, déjà fiable). Page d'accueil reste centrée deal, recherche devient centrée article, détail d'un deal affiche les autres offres du même article.

**Résolution complète (2026-09-23)** : fondation (table `products`, backfill), intégration au workflow n8n (GAP-2026-09-22-11), recherche groupée par `product_id` en mode recherche (D-2026-09-22-11), page détail `/deal/[dealId]` (D-2026-09-22-10, résout aussi GAP-2026-09-22-10) — tous construits et vérifiés bout en bout avec des données réelles de production. Voir `ETAT_ACTUEL.md` pour le détail.

**Statut** : résolu le 2026-09-23.

---

## GAP-2026-09-22-11 — Le workflow n8n ProTennis ne peuple pas `product_id` sur les nouvelles offres (RÉSOLU)

Le backfill de `deals.product_id` (GAP-2026-09-22-08) avait été appliqué une seule fois, manuellement, sur les 33 deals existants au 2026-09-22. Le workflow n8n ProTennis actif insérait/mettait à jour des offres sans jamais renseigner `product_id`.

**Résolution** : requête d'upsert du workflow réécrite en CTE — `WITH upserted_product AS (INSERT INTO products ... ON CONFLICT (LOWER(brand), LOWER(model), category) DO UPDATE ... RETURNING id)` puis `INSERT INTO deals (..., product_id) VALUES (..., (SELECT id FROM upserted_product)) ON CONFLICT (merchant_id, affiliate_url) DO UPDATE SET ..., product_id = EXCLUDED.product_id`. Le modèle (`model`) est calculé dans l'étape de parsing du workflow via un miroir JS de `lib/product-matching.ts` (`extractModel` — à garder synchronisé manuellement, ce workflow ne peut pas importer le code TypeScript du repo).

Vérifié réellement : (1) requête SQL testée directement contre la base Neon de prod avec un deal factice — nouveau produit créé au premier passage, `product_id` réutilisé à l'identique au second passage (idempotence), aucun doublon créé, données de test supprimées après contrôle ; (2) miroir JS comparé aux 23 offres ProTennis réelles déjà rattachées — 0 écart avec `lib/product-matching.ts` ; (3) workflow réimporté et publié sur l'instance n8n permanente (VM Oracle), déclenché manuellement depuis l'UI n8n — les 23 offres réelles mises à jour, `product_id` peuplé à 100% (23/23), marque/modèle cohérents contrôlés en base.

**Point découvert en cours de vérification (hors scope de ce GAP, documenté séparément)** : le workflow était en réalité **inactif** sur l'instance permanente au moment de reprendre cette étape, alors qu'`ETAT_ACTUEL.md` (D-2026-09-22-04) indiquait qu'il avait été activé — voir GAP-2026-09-22-12.

**Statut** : résolu le 2026-09-22.

---

## GAP-2026-09-22-09 — Contamination multi-sports du scraping ProTennis élargi (RÉSOLU)

ProTennis est un site multi-sports (tennis, padel, squash, badminton, pickleball). La décision D-2026-09-22-05 (élargissement du scraping à toutes les catégories du site) mentionnait ces autres sports sans que ce soit un choix de périmètre produit confirmé — `deals.category` a une contrainte `CHECK` limitée aux 5 catégories tennis (`data-model.md`), et `spec.md` définit deals-tennis comme un catalogue tennis. Un exemple concret trouvé pendant l'inspection : la page `/5624-destockage-raquettes` (déjà scrapée aujourd'hui) contient au moins un produit squash (balles Dunlop) mêlé aux raquettes de tennis.

**Résolution (D-2026-09-22-08)** : le scraping cible exclusivement les pages catégories tennis identifiées par leur slug (`973-raquette-de-tennis`, `977-cordage-raquette-tennis`, `974-chaussure-de-tennis`, `975-vetement-de-tennis`, `978-accessoire-tennis`, `979-balle-tennis`, `976-bagagerie-tennis`), jamais une page toutes-catégories du site. Un filtre de sécurité supplémentaire écarte toute fiche dont le titre contient `squash`, `padel`, `badminton` ou `pickleball` (insensible à la casse), au cas où une fiche hors tennis se glisserait malgré tout sur une page tennis (comme observé dans l'exemple ci-dessus).

**Statut** : résolu le 2026-09-22.

---

## GAP-2026-09-22-10 — Détail d'un deal : page dédiée ou popup ? (RÉSOLU)

D-2026-09-22-06 acte que le clic sur un deal doit permettre de voir les autres offres marchandes du même article, mais la modalité d'affichage (page dédiée type `/deal/[id]` vs popup/modale sur le catalogue) n'était pas tranchée.

**Résolution (D-2026-09-22-10)** : page dédiée `/deal/[dealId]`. Construite et vérifiée le 2026-09-23 — voir `ETAT_ACTUEL.md`.

**Statut** : résolu le 2026-09-23.

---

## GAP-2026-09-22-12 — Le workflow n8n ProTennis était inactif sur l'instance permanente malgré D-2026-09-22-04 (RÉSOLU)

En reprenant l'étape GAP-2026-09-22-11, une vérification réelle sur l'instance n8n permanente (VM Oracle, `n8n export:workflow --id=protennis-ingestion-wf-001`) a montré `active: false`, alors qu'`ETAT_ACTUEL.md` documentait le workflow comme activé le 2026-09-22 (D-2026-09-22-04). Cause non investiguée (redémarrage du conteneur ayant réinitialisé l'état ? erreur lors de l'activation initiale ?) — non déterminée, hors scope de cette étape.

**Résolution** : réactivé via `n8n publish:workflow --id=protennis-ingestion-wf-001` (commande actuelle, `update:workflow` étant dépréciée dans cette version 2.40.5 de n8n) puis conteneur redémarré (`docker restart opc-n8n-1`, nécessaire pour que le changement prenne effet selon le message de la CLI). Log de démarrage confirmé : `Processed 0 draft workflows, 1 published workflows.` Exécution manuelle réelle déclenchée ensuite depuis l'UI n8n par l'utilisateur, confirmée en base (23/23 offres mises à jour).

**Point non couvert par cette résolution** : la cause de la désactivation n'est pas connue — si elle se reproduit (ex. après un redémarrage de VM), le cron quotidien de 6h pourrait à nouveau ne pas tourner sans que personne ne le remarque (pas d'alerte configurée). Rejoint le chantier « Observabilité/monitoring » (n°11 de la liste D-2026-09-21-09, non commencé) — une alerte sur l'absence d'exécution quotidienne y aurait sa place.

**Statut** : résolu le 2026-09-22 (réactivé et vérifié) ; cause racine non déterminée, risque de récidive silencieuse noté pour le chantier observabilité.

---

## GAP-2026-09-23-01 — Monitoring du cron n8n ProTennis (RÉSOLU)

Suite à GAP-2026-09-22-12 (récidive silencieuse possible sans alerte), le mécanisme de monitoring a été discuté et tranché en **D-2026-09-23-01** : dead man's switch externe healthchecks.io (ping HTTP du workflow n8n à chaque succès, alerte email si le ping manque).

**Résolution (2026-09-23)** : nœud HTTP Request (`Ping healthchecks.io (succes)`) ajouté au workflow n8n ProTennis, branché après le nœud d'éviction — il ne se déclenche que si toute la chaîne (scraping → upsert → éviction) a réussi. Compte/check healthchecks.io créé par l'utilisateur. Déployé sur l'instance n8n permanente (VM Oracle), workflow réimporté/republié/conteneur redémarré, `active: true` confirmé.

Vérifié réellement : deux exécutions complètes du workflow (`n8n execute`, site ProTennis réel + base Neon de prod réelle) terminées avec succès, ping reçu par healthchecks.io après chaque run ; simulation d'échec via l'endpoint dédié `/fail` ayant réellement fait passer le check à l'état "Down" et déclenché l'alerte email (confirmé par l'utilisateur), puis retour à l'état normal via un ping de succès.

**Effet de bord découvert et corrigé** : les exécutions réelles du workflow (`UPDATE` sur les deals existants) ont changé l'ordre physique des lignes en base, révélant un bug préexistant dans `tests/contract/deal-detail.test.ts` (`LIMIT 1` sans `ORDER BY` sur un `ILIKE` large, non déterministe) — corrigé en ciblant le titre précis de l'article multi-marchand utilisé par le test.

**Statut** : résolu le 2026-09-23.
