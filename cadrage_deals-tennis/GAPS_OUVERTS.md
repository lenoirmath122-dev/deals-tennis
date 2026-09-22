# Points ouverts

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

## GAP-2026-09-21-04 — Photo de terrain (fond hero) pas encore fournie (OUVERT)

Le chantier « Charte graphique / design system » (D-2026-09-21-13) prévoit un fond de section hero en photo de terrain (gazon ou terre battue), à fournir par l'utilisateur. Aucun fichier reçu à ce jour — l'application des tokens de charte à `app/globals.css`/aux composants ne peut pas inclure le vrai fond tant que l'image n'est pas fournie (un placeholder devra être utilisé en attendant si le build démarre avant réception).

**Bloquant sur** : action de l'utilisateur (fournir le fichier image).

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

## GAP-2026-09-22-08 — Rapprochement produit multi-marchands : direction actée, implémentation restant à construire (OUVERT)

Suite à D-2026-09-22-05, puis élevé par l'utilisateur au rang d'axe central du produit (comparaison de prix multi-marchands). **Direction actée en D-2026-09-22-06** : table `products` (marque+modèle+catégorie) + `deals.product_id` nullable, rapprochement par extraction marque/modèle depuis le titre (aucune référence fabricant/EAN disponible chez les marchands vérifiés). Page d'accueil reste centrée deal, recherche devient centrée article, détail d'un deal affiche les autres offres du même article.

**Reste à faire** : construire la table `products`, l'algorithme de parsing marque/modèle, la migration des `deals` existants, l'évolution du contrat de recherche, et le rendu du détail d'un deal (voir GAP-2026-09-22-10 pour la modalité page/popup). Aucun code écrit à ce stade — cadrage uniquement.

**Bloquant sur** : rien — c'est la prochaine étape de build actée avec l'utilisateur (avant l'élargissement du scraping ProTennis à toutes les catégories).

**Statut** : ouvert au 2026-09-22 (direction actée, implémentation à faire).

---

## GAP-2026-09-22-09 — Contamination multi-sports du scraping ProTennis élargi (OUVERT)

ProTennis est un site multi-sports (tennis, padel, squash, badminton, pickleball). La décision D-2026-09-22-05 (élargissement du scraping à toutes les catégories du site) mentionnait ces autres sports sans que ce soit un choix de périmètre produit confirmé — `deals.category` a une contrainte `CHECK` limitée aux 5 catégories tennis (`data-model.md`), et `spec.md` définit deals-tennis comme un catalogue tennis. Un exemple concret trouvé pendant l'inspection : la page `/5624-destockage-raquettes` (déjà scrapée aujourd'hui) contient au moins un produit squash (balles Dunlop) mêlé aux raquettes de tennis.

**Bloquant sur** : décision utilisateur — exclure explicitement les autres sports au moment du build de l'élargissement (filtre sur la catégorie/breadcrumb du produit), ou élargir volontairement le périmètre du site à d'autres sports (changement de `spec.md`, hors décision actuelle).

**Statut** : ouvert au 2026-09-22.

---

## GAP-2026-09-22-10 — Détail d'un deal : page dédiée ou popup ? (OUVERT)

D-2026-09-22-06 acte que le clic sur un deal doit permettre de voir les autres offres marchandes du même article, mais la modalité d'affichage (page dédiée type `/deal/[id]` vs popup/modale sur le catalogue) n'est pas tranchée — l'utilisateur a explicitement dit "on verra" sur ce point.

**Bloquant sur** : décision utilisateur, à trancher au moment du build de cette fonctionnalité (impact sur le routing Next.js, le SEO potentiel d'une page dédiée, la complexité d'implémentation).

**Statut** : ouvert au 2026-09-22.
