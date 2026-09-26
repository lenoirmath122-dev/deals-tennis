# Cadrage — Données autonomes et « vrais bons plans »

> Document de cadrage à placer dans `cadrage_deals-tennis/`.
> Il fait suite à l'audit technique du 2026-09-25, dont il reprend les constats.
> Il décrit **quoi** construire et **dans quel ordre**. Le **comment** reste à l'appréciation de Claude Code, qui doit confronter ce document au code réel.

---

## 0. Règles de travail pour Claude Code

1. **Ce document n'est pas une vérité absolue.** Il a été rédigé à partir de l'audit, pas à partir d'une lecture directe du code. Si une instruction contredit l'existant, est irréaliste ou peut être faite plus simplement, **signale-le avant d'agir** au lieu d'appliquer à la lettre.
2. **Une phase à la fois.** Chaque phase se termine par un **arrêt pour validation humaine**. Ne jamais enchaîner deux phases sans accord explicite.
3. **Pas de migration destructive sur la prod sans test préalable** sur une branche Neon. Toute migration doit être additive (nouvelles tables ou colonnes, pas de suppression) sauf accord explicite.
4. **Réutiliser les conventions du projet :** numérotation des migrations (`scripts/migrations/00X_*.sql`), journal des décisions (`D-AAAA-MM-JJ-NN`), écarts connus (`GAP-AAAA-MM-JJ-NN`), mise à jour de `ETAT_ACTUEL.md` à la fin de chaque phase.
5. **Ce que tu ne peux pas faire seul** (accès SSH à la VM Oracle, modification du workflow n8n, identifiants d'API) : prépare des livrables prêts à appliquer (fichiers, commandes, instructions pas à pas) et liste-les clairement comme **actions humaines requises**.
6. **Tests.** Toute logique nouvelle (calcul de verdict, contrôles de cohérence, rapprochement) est couverte par des tests unitaires.

---

## 1. Principes produit (décisions actées)

| # | Principe | Conséquence technique |
|---|---|---|
| P1 | Le prix barré affiché par le marchand **n'est pas une source de vérité**. | `original_price` reste un champ d'affichage secondaire. Le verdict « vrai bon plan » repose uniquement sur notre historique observé. |
| P2 | L'historique de prix est enregistré **au niveau de l'offre** (`deal`), pas du produit. | Corriger un rapprochement produit ne détruit jamais d'historique. L'agrégation par produit se fait à la lecture. |
| P3 | **En cas de doute, ne pas publier.** | Une donnée incohérente part en quarantaine au lieu d'être affichée. Une offre manquante coûte moins qu'un faux bon plan. |
| P4 | On affiche ce qu'on sait réellement. | Formulation type « prix le plus bas vu depuis N jours », jamais « -X % sur le prix habituel » tant que l'historique ne couvre pas les prix hors promo. |
| P5 | Le site doit tourner seul au quotidien et **alerter** quand il a besoin d'un humain. | Tout run est tracé, toute anomalie remonte dans une file de revue unique. |

---

## 2. Constats de départ (audit du 2026-09-25)

- **Historique de prix absent.** Chaque upsert écrase les prix, et `updated_at` est réécrit à chaque passage.
- **Vraie remise non vérifiée.** `discount_percentage` est calculé depuis le prix barré du marchand. Le seul filtre existant élimine les offres sans prix barré (`skippedNoDiscount`).
- **8 marchands sur 9 scrapés à la main**, sans cron ni trace des runs. ProTennis tourne via n8n (quotidien), mais ses logs sont inaccessibles depuis le repo.
- **Rapprochement produit par clé texte** `(LOWER(brand), LOWER(model), category)`. Seuls 7,4 % des produits ont plus d'une offre active. Un faux rapprochement est connu (GAP-2026-09-23-04) et 881 doublons avaient déjà dû être corrigés.
- **`click_events`** est alimentée (27 lignes) mais n'est exploitée nulle part.
- **Aucune mise en avant éditoriale** n'existe.
- **Biais important :** les scrapers ne voient les articles **que lorsqu'ils sont en promo**. Un historique construit uniquement sur ces observations mesure « le prix promo habituel », pas le prix normal.

---

## 3. Phases

### Phase 0 — Alignement (aucun code)

**Objectif :** vérifier que ce cadrage est applicable tel quel.

- Relire ce document en le confrontant au repo et à la base.
- Lister les désaccords, simplifications possibles et risques non identifiés.
- Proposer un découpage en tâches pour les phases 1 et 2, avec estimation.
- Pour chacun des 9 marchands, indiquer si la page scrapée liste **aussi** des articles sans remise, ce qui permettrait d'enregistrer leur prix sans coût supplémentaire.

**Arrêt :** validation du plan.

---

### Phase 1 — Collecte de l'historique de prix (priorité absolue)

**Pourquoi en premier :** le compteur des 90 jours démarre au premier enregistrement. Chaque jour de retard est perdu.

**Livrables :**

1. Migration : table `price_observations`.
   - Une ligne par `(deal_id, observed_on)` (clé primaire), avec au minimum `price` (prix payé), `merchant_list_price` (prix barré affiché, informatif), `in_stock` si disponible, `first_seen_at` et `last_seen_at`.
   - L'upsert du même jour met à jour le prix et `last_seen_at` (plusieurs runs par jour restent idempotents).
2. **Une fonction d'ingestion partagée** (par exemple `lib/ingest.ts`) qui centralise l'upsert `deals` + l'upsert `price_observations`. Les 8 scripts locaux l'utilisent au lieu de dupliquer le SQL.
3. Là où c'est gratuit (constat de la phase 0), **enregistrer aussi les articles sans remise** dans `price_observations`. Ces articles ne doivent pas apparaître comme deals actifs sur le site. Proposer le mécanisme le plus simple (par exemple une offre `status` dédié ou un flag), en respectant les contraintes CHECK existantes.
4. **ProTennis (n8n) :** spécification exacte du nœud Postgres à ajouter au workflow (requête SQL prête à coller, emplacement dans le flux). → **Action humaine requise.**

**Critères d'acceptation :**
- Un run de chaque script local crée une ligne par offre vue dans `price_observations`.
- Relancer le même script le même jour ne crée aucune ligne en double.
- Aucune régression sur l'upsert `deals` et l'éviction existante.

**Arrêt :** validation, puis application de la migration en prod.

---

### Phase 2 — Cadence automatique et traçabilité des runs

**Livrables :**

1. Migration : table `ingestion_runs`.
   - `merchant_id`, `started_at`, `finished_at`, `status` (`running|success|partial|failed`), `seen_count`, `upserted`, `evicted`, `skipped_no_discount`, `error`.
   - Chaque script ouvre une ligne au démarrage et la ferme à la fin, y compris en cas d'erreur.
2. **Garde-fou d'éviction renforcé :** en plus du cas « 0 URL vue », ne pas évincer si `seen_count` chute de plus de 50 % par rapport au dernier run réussi du même marchand. Le run passe en `partial` et remonte en alerte.
3. **Scripts exécutables sans intervention** (headless, variables d'environnement, code de sortie non nul en cas d'échec).
4. **Kit de déploiement pour la VM Oracle :** script d'installation (Node, Playwright, dépendances), fichiers de timers systemd (ou crontab) avec horaires **étalés** (1 passage par jour et par marchand minimum, 2 pour les gros catalogues), procédure de mise à jour du code. → **Action humaine requise** pour l'installation.
5. **Requête d'alerte** prête pour n8n : marchands sans run `success` depuis plus de 36 h, et runs `partial`/`failed` des dernières 24 h.
6. **Amazon :** ne pas modifier le scraper. Documenter l'option API officielle du programme Partenaires (prérequis, identifiants nécessaires) comme décision à prendre. → **Décision humaine requise.**

**Critères d'acceptation :**
- Chaque run, réussi ou non, laisse une trace complète dans `ingestion_runs`.
- Une simulation de chute de 60 % des offres vues ne déclenche aucune éviction.
- Le kit de déploiement est documenté pas à pas.

**Arrêt :** validation, puis déploiement sur la VM.

---

### Phase 3 — Qualité des données

**3a. Contrôles de cohérence et quarantaine** (dans la fonction d'ingestion partagée)

Une offre est mise en quarantaine (non publiée, conservée pour revue) si, par exemple :
- son prix varie de plus de 60 % par rapport à la dernière observation de la même offre ;
- sa remise dépasse 80 % ;
- son prix sort des bornes plausibles de sa catégorie (bornes à définir dans un fichier de configuration, pas en dur).

Les seuils sont des points de départ, à ajuster. Le mécanisme de quarantaine doit respecter les contraintes existantes sur `deals.status` (proposer la solution la plus simple).

**3b. Audit des doublons produits** (script en lecture seule, sortie CSV)

1. Marque incohérente entre `products.brand` et `deals.brand` des offres rattachées (cas GAP-2026-09-23-04).
2. Quasi-doublons : même marque et même catégorie, `model` très proches (`pg_trgm`, `similarity > 0.8`, seuil ajustable).
3. Même marchand avec plusieurs offres sur un même produit.
4. Écart de prix suspect : offre la plus chère supérieure à 2 fois la moins chère au sein d'un produit.
5. Âge ou genre contradictoires entre les titres des offres d'un même produit.

**3c. Corrections**
- Migration : table `product_merges (from_id, to_id, reason, merged_at)` pour tracer et pouvoir annuler une fusion.
- Script de fusion qui applique les corrections validées (les cas ambigus sont tranchés par un humain).
- **Chaque cas corrigé devient un test** de `lib/product-matching.ts`.
- Résoudre GAP-2026-09-23-04.

**Critères d'acceptation :**
- Le rapport CSV est produit et relu.
- Les fusions validées sont appliquées et tracées.
- Les nouveaux tests passent.

**Arrêt :** revue du CSV avant toute fusion.

---

### Phase 4 — Verdict « vrai bon plan »

**Prérequis :** au moins 30 jours de collecte depuis la phase 1. Le code peut être écrit avant, mais **l'affichage reste désactivé** (feature flag) tant que l'historique est insuffisant.

**Livrables :**

1. Vue matérialisée `product_deal_verdict`, rafraîchie après chaque vague de scrapes :
   - agrégation par produit et par jour du **meilleur prix tous marchands confondus** ;
   - sur les 90 derniers jours, hors jour courant : médiane et plus bas ;
   - seuils de confiance : au moins 14 jours observés sur une période d'au moins 30 jours ;
   - verdict positif si le prix du jour est **inférieur ou égal au plus bas** observé, **ou** inférieur ou égal à **90 % de la médiane**.
   - Tous les seuils sont dans un fichier de configuration.
2. Exclusion des offres en quarantaine et des marchands dont le dernier run n'est pas `success`.
3. Affichage sur le site, derrière feature flag :
   - badge et formulation conformes au principe P4 (« prix le plus bas vu depuis N jours ») ;
   - mention du nombre de jours de suivi ;
   - filtre « vrais bons plans uniquement ».

**Critères d'acceptation :**
- Tests unitaires du calcul (historique insuffisant, trous de données, plusieurs marchands, prix gonflé avant promo).
- Aucun badge affiché pour un produit sous les seuils de confiance.

**Arrêt :** revue d'un échantillon de verdicts avant activation.

---

### Phase 4-bis — Amorçage des prix de référence au lancement (conception uniquement)

**À réaliser après** la mise en place du scraping automatisé (Phase 2) et du rapprochement produit multi-niveaux (R5, voir `CADRAGE_rapprochement-multi-niveaux.md`). Rien à construire dans l'immédiat — cette section cadre l'objectif et les sources autorisées pour quand le chantier démarrera.

**Objectif :** pouvoir afficher un verdict dès le lancement du site, sans attendre les 30 jours d'historique interne requis par la Phase 4.

**Sources autorisées, par ordre de préférence :**
1. Prix hors promo publiés sur les sites des marques (Babolat, Head, Tecnifibre), via les articles au statut `tracked` (D-2026-09-25-21) : prix public conseillé.
2. Prix hors promo du même modèle chez un autre marchand — nécessite le rapprochement multi-niveaux (R5).
3. API officielle payante Keepa pour Amazon, seulement si Amazon reste dans le périmètre : décision humaine, coût à estimer avant tout usage.
4. Toute autre source, seulement via une API officielle dont les conditions autorisent explicitement cet usage commercial. Ces conditions doivent être vérifiées et documentées avant de proposer la source.

**Exclu sans accord juridique explicite préalable :** scraper l'historique de prix d'Idealo, de Ledenicheur, ou de tout autre comparateur — conditions d'utilisation et droit des bases de données.

**Règles :**
- Stockage dans une table séparée `external_price_references` (modèle, source, prix, date, type de référence) — **jamais** dans `price_observations`, qui reste réservée à notre propre historique observé (principe P1).
- Utilisée uniquement en secours, quand l'historique interne n'atteint pas les seuils de confiance de la Phase 4.
- Affichage explicite de la source (« prix conseillé par la marque », « prix chez X »), visuellement distinct du badge basé sur notre historique.
- Abandon automatique produit par produit dès que son historique interne atteint les seuils de la Phase 4 — la source externe ne prend jamais le pas sur une donnée interne suffisante.

**Hors périmètre de cette section :** le design détaillé de l'affichage, l'implémentation, et la décision sur Keepa/Amazon (à trancher le moment venu).

---

### Phase 5 — Supervision

**Livrables :**

1. **Page d'administration protégée** (non publique) :
   - par marchand : dernier run, statut, offres vues, taux d'éviction, taux de rejet et de quarantaine ;
   - tendance sur 30 jours.
2. **File de revue unique**, regroupant :
   - offres en quarantaine ;
   - doublons suspects (audit hebdomadaire) ;
   - runs en échec ou partiels.
   Chaque élément peut être validé ou rejeté depuis cette page.
3. **Planification hebdomadaire** de l'audit des doublons, avec alerte si le nombre de suspects augmente.
4. Première **agrégation de `click_events`** (clics par produit, par catégorie, sur 7 et 30 jours), pour préparer la phase 6.

**Objectif de charge :** environ 1 h de revue par semaine, hors réparation d'un scraper cassé.

---

### Phase 6 — Sélection représentative (vitrine) — plus tard

À lancer quand les phases 1 à 5 tournent et que l'historique dépasse 30 jours.

- Fichier de configuration des **références et marques prioritaires** par catégorie, révisé à chaque saison.
- Score de sélection combinant : verdict positif (obligatoire), priorité éditoriale, diversité (catégorie × genre × gamme de prix), puis popularité via `click_events` quand le volume le permet.
- Une courte phrase d'accroche par produit sélectionné, factuelle et basée sur les données (« prix le plus bas vu depuis 74 jours »).

À cadrer en détail le moment venu.

---

## 4. Ce qui restera humain

- Réparer un scraper cassé (changement de site, anti-bot).
- Trancher les cas ambigus de la file de revue.
- Maintenir la VM, les dépendances et les programmes d'affiliation.
- Ajouter un nouveau marchand.
- Réviser les priorités éditoriales à chaque saison.

## 5. Calendrier indicatif

| Phase | Effort estimé | Remarque |
|---|---|---|
| 0 | quelques heures | aucune modification du code |
| 1 | ~1 jour | à démarrer immédiatement |
| 2 | 1–2 jours | + installation sur la VM par un humain |
| 3 | ~1 jour | + revue humaine du CSV |
| 4 | ~1 jour | activation au plus tôt 30 jours après la phase 1 |
| 5 | 1–2 jours | |
| 6 | à cadrer | |

Estimations indicatives, à réviser en phase 0.

---

## 6. Amendements post Phase 0 (2026-09-25)

Phase 0 validée par l'utilisateur, avec les changements de périmètre et précisions suivants — actés dans `DECISIONS_FONCTIONNELLES.md` (D-2026-09-25-20 à -23), détail complet là-bas. Résumé ici pour que ce document reste la référence à jour du plan.

### 6.1 Retrait de ProTennis du périmètre (D-2026-09-25-20)

ProTennis est retiré du projet : aucun filtre de vraie remise n'y est appliqué, contraire au positionnement « vrais bons plans ». Le projet se recentre sur les 8 marchands scrapés localement (Tecnifibre, Tennispro.fr, SportSystem, Sport 2000, Babolat, Tennis Point FR, Head, Amazon). ProTennis pourra être réintégré plus tard, une fois son propre filtre de vraie remise construit — ce retrait n'est pas un jugement définitif sur le marchand, seulement un retrait tant qu'il n'est pas conforme au principe P1/P3 de ce cadrage.

Séquence de retrait, arrêt avant toute suppression définitive :
1. Inventaire complet (code, workflow n8n exporté, SQL, README, contrats, tests, docs, ligne `merchants`, `deals`, `products` orphelins, `click_events` liés) — **cette conversation, aucune suppression**.
2. Export d'archive (CSV) des `deals`/`products`/`click_events` ProTennis.
3. Retrait immédiat du site : passage des offres ProTennis en `expired`.
4. Après validation utilisateur : suppression définitive en migration (deals, produits orphelins, `click_events`, ligne `merchants`), puis suppression du code/docs devenus inutiles.
5. Vérification que `/go/[dealId]` sur une ancienne offre ProTennis redirige proprement.
6. Mise à jour de `ETAT_ACTUEL.md`.

Toutes les phases 1 à 6 de ce document (historique de prix, cadence automatique, qualité des données, verdict, supervision, vitrine) s'appliquent désormais aux 8 marchands restants uniquement, jusqu'à réintégration éventuelle de ProTennis.

### 6.2 Décision A.1 — Statut `tracked` pour les articles vus sans remise (D-2026-09-25-21)

Un article vu sans remise (utile pour construire l'historique de prix, cf. section 3 point 3 de la Phase 1) est enregistré comme une ligne `deals` à part entière avec `status='tracked'`, `is_active=false`, `original_price = discounted_price` — **pas** un booléen séparé.

- `tracked` est exclu du site par défaut partout : catalogue, recherche groupée, `/go/[dealId]`, comptages, pages produit. Chaque requête concernée doit être vérifiée et listée explicitement (voir GAP dédié une fois le build commencé).
- L'éviction (garde-fou 50 %, cf. Phase 2 point 2) s'applique aussi aux offres `tracked` non revues lors d'un passage de scraping.
- Une offre peut passer de `tracked` à `active` et inversement d'un jour sur l'autre, selon que la remise du jour est réelle ou non.

### 6.3 Phase 1 précisée — historique par trigger (D-2026-09-25-22)

En complément (pas en remplacement) de la fonction d'ingestion partagée (`lib/ingest.ts`) déjà prévue en section 3 Phase 1 : l'écriture de `price_observations` se fait via un **trigger Postgres `AFTER INSERT OR UPDATE` sur `deals`**, qui upsert `(deal_id, jour_observation)` quand `NEW.status IN ('active', 'tracked')`. Une éviction (passage à `expired`) n'écrit rien dans `price_observations` — ce n'est ni un `INSERT` ni un changement de prix observé, c'est une disparition.

- Le jour d'observation est calculé en heure de Paris (pas UTC), pour que la notion de « jour » corresponde à un jour calendaire côté utilisateur/scraping, quelle que soit l'heure d'exécution des scripts.
- Le trigger doit se déclencher même quand un `ON CONFLICT ... DO UPDATE` ne change aucune valeur (les 8 scripts locaux et le futur ProTennis font tous un upsert quotidien, parfois avec un prix identique au jour précédent) — à vérifier explicitement en construisant le trigger, pas supposé.
- Tout coût ou risque (performance, verrous) du trigger sur les upserts à fort volume (ex. Tennis Point FR, 2427 offres) doit être signalé avant d'appliquer en prod.
- Séquence de validation : branche Neon d'abord, application en prod seulement après accord explicite.
- Une fois le trigger vérifié : migration de `lib/ingest.ts` (fonction d'ingestion partagée) puis des 8 scripts un par un vers cette fonction, capture des articles sans remise (statut `tracked`) pour les 6 marchands où c'est gratuit d'après l'audit de phase 0 (à confirmer marchand par marchand, hors Sport 2000 et hors mode rayon d'Amazon, qui n'exposent pas cette information sans requête supplémentaire).

### 6.4 Phase 2 reconstruite — n8n uniquement orchestrateur (D-2026-09-25-23)

Principe non négociable, tiré directement de la dérive ProTennis (logique de scraping/rapprochement dupliquée dans des nœuds n8n plutôt que dans le code versionné) : **n8n ne fait plus que l'orchestration**. Les 8 scripts TypeScript du dépôt restent l'unique source de vérité pour le scraping, le rapprochement et les calculs. n8n gère uniquement :
- le planning (lancement de `npm run scrape:<marchand>` sur la VM, horaires étalés) ;
- le suivi (lecture de `ingestion_runs`) ;
- les alertes (marchand sans run `success` depuis 36 h, runs `partial`/`failed`).

Livrables (précisent/étendent la Phase 2 de la section 3) :
- `ingestion_runs` + garde-fou d'éviction à 50 % (inchangé par rapport à la section 3).
- Scripts exécutables sans intervention (headless, code de sortie non nul en cas d'échec) — déjà en partie vrai pour les scripts Playwright (Head, Amazon), à vérifier explicitement en mode headless pur.
- Kit d'installation VM (Node, Playwright, dépôt, variables d'environnement, procédure de mise à jour).
- Workflows n8n exportés en JSON dans le dépôt (comme l'était `n8n-protennis-ingestion-workflow.json`, mais désormais limités au rôle d'orchestrateur).
- Recommandation sur le mécanisme de lancement des scripts depuis n8n (nœud SSH vers la VM, Execute Command, ou autre), en tenant compte du fait que n8n tourne potentiellement dans Docker sur cette même VM.
- Liste de vérifications à faire par l'utilisateur sur la VM avant le build : type d'instance (CPU/RAM/architecture), mode d'installation et version de n8n, test de chaque scraper depuis l'IP de la VM (risque de blocage anti-bot, en particulier Amazon).

#### Checklist VM Oracle — à faire par Mathieu avant le build de la Phase 2 (préparée le 2026-09-26, aucun code Phase 2 avant ce rapport)

Connexion de référence connue (GAP-2026-09-22-12) : `ssh opc@145.241.173.33` — Claude Code n'a pas d'accès SSH à cette VM dans les sessions passées (`Permission denied (publickey)`), toutes les commandes ci-dessous sont donc à exécuter par Mathieu et à rapporter (copier-coller la sortie suffit, pas besoin de résumer).

**1. Type d'instance (CPU / RAM / architecture)**
```
lscpu | grep -E 'Architecture|CPU\(s\)|Model name'
free -h
df -h /
```
Pourquoi : détermine si la VM peut faire tourner Playwright (Head, Amazon — gourmand en RAM, ~500 Mo-1 Go par instance de navigateur) en plus de n8n déjà en place. Oracle Cloud Free Tier propose deux profils très différents (Ampere A1 arm64, ou VM.Standard.E2.1.Micro x86 1 Go RAM) — l'architecture (arm64 vs x86_64) conditionne aussi si les binaires Playwright standards s'installent sans compilation supplémentaire.

**2. Mode d'installation et version de n8n**
```
docker ps --filter name=n8n
docker exec opc-n8n-1 n8n --version
docker inspect opc-n8n-1 --format '{{.Config.Image}}'
cat ~/docker-compose.yml 2>/dev/null || find / -maxdepth 4 -iname "docker-compose*.yml" 2>/dev/null
```
Pourquoi : confirme que n8n tourne bien en Docker (déjà supposé d'après les commandes de déploiement connues, `docker restart opc-n8n-1`) et sous quelle image/version exacte — détermine le mécanisme de lancement des scripts (le point du cadrage principal juste au-dessus, « nœud SSH vers la VM, Execute Command, ou autre ») : si n8n est dans un conteneur séparé du reste de la VM, un simple nœud "Execute Command" n8n ne verra pas le dépôt Node installé sur l'hôte, il faudra un nœud SSH vers l'hôte ou monter le dépôt en volume Docker.

**3. Node.js et dépôt sur l'hôte (hors conteneur n8n)**
```
node --version
npm --version
git --version
ls -la ~/deals-tennis 2>/dev/null || echo "dépôt absent"
```
Pourquoi : les 8 scripts (`npm run scrape:<marchand>`) doivent pouvoir tourner directement sur l'hôte (ou dans un conteneur dédié) indépendamment de n8n — vérifie si le kit d'installation VM (livrable déjà acté ci-dessus) part d'une VM vierge ou d'un hôte qui a déjà Node.

**4. Accès SSH depuis n8n vers l'hôte (ou alternative)**
```
docker exec opc-n8n-1 which ssh
docker exec opc-n8n-1 ls -la /root/.ssh 2>/dev/null || echo "pas de clé SSH dans le conteneur n8n"
docker inspect opc-n8n-1 --format '{{json .Mounts}}'
```
Pourquoi : si n8n tourne dans son propre conteneur Docker, il n'a par défaut ni accès SSH à l'hôte ni au système de fichiers de l'hôte (sauf volume monté explicitement) — cette vérification tranche directement entre les deux mécanismes de lancement possibles (nœud SSH n8n→hôte avec une clé dédiée à créer, vs volume partagé + nœud Execute Command).

**5. Test réel de chaque scraper depuis l'IP de la VM (risque de blocage anti-bot)**
Depuis l'hôte de la VM (pas depuis la machine locale de Mathieu), avec le dépôt cloné et `.env.local`/`DATABASE_URL` configurés comme en local :
```
npm run scrape:tecnifibre
npm run scrape:tennispro
npm run scrape:sportsystem
npm run scrape:sport2000
npm run scrape:babolat
npm run scrape:tennis-point-fr
npm run scrape:head
npm run scrape:amazon
```
Pourquoi : l'IP de la VM Oracle est différente de celle utilisée pour tous les builds précédents (machine locale de Mathieu) — les marchands avec protection anti-bot connue (Head : checkpoint Vercel ; Amazon : blocage 503 hors Playwright ; Tennispro.fr : 403 Cloudflare sur `fetch` natif, contourné par `curl`) peuvent se comporter différemment depuis une IP de datacenter cloud (souvent davantage suspectée qu'une IP résidentielle/mobile). Un scraper qui passe en local peut échouer depuis la VM — à constater réellement, pas supposé. Head et Amazon utilisent Playwright : vérifier que `npx playwright install --with-deps chromium` (ou équivalent) s'exécute sans erreur sur l'architecture de la VM (point 1) avant de lancer ces deux scripts.

**Ce que Claude Code fera de ces résultats** : uniquement une fois ces 5 points rapportés, le build de la Phase 2 (kit d'installation, workflows n8n orchestrateurs, mécanisme de lancement) pourra être cadré précisément — pas avant, conformément à la demande explicite de ne pas coder cette phase tant que ce rapport n'est pas fait.

### 6.5 Ordre de traitement

1. Inventaire ProTennis + archive + passage en `expired` (cette conversation : inventaire uniquement, arrêt pour validation avant l'export/le passage en expired).
2. Trigger `price_observations`.
3. Suppression définitive de ProTennis (après validation de l'inventaire/archive).
4. Statut `tracked` + `lib/ingest.ts`.
5. Phase 2 n8n reconstruite.

Nouvelle branche partie de `master`, sans toucher aux modifications en pause de GAP-2026-09-25-15 (étape 4, en cours dans le répertoire de travail principal).
