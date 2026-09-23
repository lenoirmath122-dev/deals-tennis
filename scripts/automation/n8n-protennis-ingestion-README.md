# Workflow n8n : ingestion ProTennis (raquettes en déstockage)

Construit et vérifié de bout en bout le 2026-09-22 (build réel, pas une simulation) :
instance n8n locale (`npx n8n`), workflow importé via `n8n import:workflow`, exécuté
via `n8n execute` contre la vraie page ProTennis et la vraie base Neon de production.
23 offres réelles insérées, visibles sur `https://deals-tennis.vercel.app`, redirection
`/go/[dealId]` vérifiée vers l'URL produit directe (pas d'affiliation, D-2026-09-21-15).

## Import dans une instance n8n

1. Créer une credential **Postgres** nommée `Neon deals-tennis` avec l'id
   `protennis-neon-cred-001` (ou réimporter le workflow puis relier manuellement la
   credential existante à chaque nœud Postgres si l'id ne correspond pas) :
   - Host : `ep-quiet-cake-b2y021qt.c-6.eu-central-1.aws.neon.tech` (voir `DATABASE_URL` dans `.env.local`/Vercel pour la valeur à jour)
   - Database : `neondb`
   - User : `neondb_owner`
   - Password : voir `DATABASE_URL` (jamais commité)
   - Port : `5432`, SSL : `require`
2. `n8n import:workflow --input=scripts/automation/n8n-protennis-ingestion-workflow.json`
3. Le workflow est importé **désactivé** (`--activeState` non passé). L'activer dans
   l'UI n8n (ou `--activeState=fromJson`, mais le JSON ne porte pas `active: true` —
   activer explicitement) pour que le déclencheur planifié (tous les jours à 6h) tourne.

## Logique du workflow

1. **Déclencheurs** : planifié quotidien (6h) pour la production, + un déclencheur
   « Execute Workflow » qui permet aussi un lancement manuel/CLI (`n8n execute --id=...`)
   pour retester sans attendre le cron.
2. **HTTP Request** : `GET https://www.protennis.fr/5624-destockage-raquettes`, avec un
   header `Accept: text/html,...` explicite — **indispensable** : sans lui, PrestaShop
   détecte une requête « API-like » (Accept par défaut envoyé par le client HTTP de n8n)
   et renvoie un fragment JSON (`{"rendered_products_top": "..."}`) au lieu de la page
   HTML complète.
3. **Code (parsing)** : extrait chaque `<article class="product-miniature">` par regex
   (titre, marque, prix barré/prix promo, image, URL produit), calcule
   `discount_percentage`, filtre les fiches incomplètes ou sans remise réelle. Catégorie
   fixée à `raquettes` (portée de cette page ; d'autres catégories/pages ProTennis
   nécessiteraient une copie de ce workflow avec l'URL et la catégorie adaptées — pas
   fait dans cette étape, scope minimal validé avec l'utilisateur).
4. **Postgres (upsert)** : requête en deux temps dans une seule instruction SQL (CTE) —
   `WITH upserted_product AS (INSERT INTO products ... ON CONFLICT (LOWER(brand),
   LOWER(model), category) DO UPDATE ... RETURNING id)` puis
   `INSERT INTO deals (..., product_id) VALUES (..., (SELECT id FROM upserted_product))
   ON CONFLICT (merchant_id, affiliate_url) DO UPDATE ...` — nécessite la contrainte
   ajoutée par la migration `002_deals_unique_merchant_url.sql` et la table `products`
   de la migration `003_products.sql`. Le modèle (`model`) utilisé pour le rapprochement
   produit et la couleur (`color`, migration `004_deals_color.sql`) sont calculés dans
   l'étape de parsing (miroir JS de `lib/product-matching.ts`, `extractModel` et
   `extractColor` — **à garder synchronisé manuellement**, ce workflow n8n ne peut pas
   importer le code TypeScript du repo). `extractModel` retire désormais aussi la
   couleur du titre (D-2026-09-23-06) : la couleur reste un attribut par offre, pas une
   clé d'identité produit — deux couleurs du même modèle restent le même article.
   `affiliate_url` = URL produit ProTennis directe
   (pas de lien d'affiliation, ce marchand n'a pas de programme d'affiliation actif —
   D-2026-09-21-15). Résout GAP-2026-09-22-11 : chaque offre insérée/mise à jour par ce
   workflow est désormais rattachée à `product_id`, sans dépendre d'un backfill manuel.
5. **Code (regroupement)** : collecte les `affiliate_url` vues dans le passage du jour.
   Si 0 offre parsée, retourne `[]` — le nœud d'éviction suivant ne s'exécute alors pas
   du tout, ce qui évite de désactiver en masse toutes les offres ProTennis en cas de
   panne/changement de structure du site (garde-fou explicitement demandé, voir décision
   ci-dessous).
6. **Postgres (éviction)** : marque `status='expired', is_active=false` toute offre
   ProTennis déjà en base dont l'URL n'apparaît plus dans le passage du jour (produit
   vendu, promo terminée, prix redevenu normal) — ProTennis n'affiche aucune date de fin
   de promo, donc le cron d'éviction générique par `expires_at`
   (`n8n-eviction-cron.sql`) ne suffit pas pour ce marchand.

## Hébergement permanent

Le workflow tourne en continu sur une VM Oracle Cloud Free Tier
(`deals-tennis-n8n.duckdns.org`, voir GAP-2026-09-22-06 résolu) — le déclencheur
planifié (6h/jour) s'exécute réellement en production, pas seulement en local.

## Monitoring (D-2026-09-23-01)

Un dernier nœud **HTTP Request** (`Ping healthchecks.io (succes)`) est branché après
« Expirer les offres disparues ». Il envoie un `GET` vers l'URL de ping du check
healthchecks.io dédié à ce workflow (dead man's switch) **uniquement si toute la chaîne
a réussi** (scraping → upsert → éviction). Si le check ne reçoit aucun ping dans le
délai de grâce configuré (cron quotidien à 6h), healthchecks.io déclenche une alerte
email — indépendamment de l'état de n8n lui-même (ne partage pas le même point de
défaillance que l'incident GAP-2026-09-22-12 qui a motivé ce chantier).

Une exécution avec 0 offre parsée ne déclenche pas le ping (le nœud d'éviction ne
s'exécute pas sur une liste vide, cf. logique du nœud « Regrouper les URLs vues
aujourd'hui » ci-dessus) — comportement voulu : 0 offre sur un site qui en affiche
normalement des centaines est un signal d'anomalie, pas un succès à confirmer.

Vérifié réellement le 2026-09-23 : deux exécutions complètes du workflow (`n8n execute`,
site ProTennis réel + base Neon de prod réelle) terminées `status: "success"`, ping reçu
par healthchecks.io (`"data": "OK"`) après chaque run ; simulation d'échec via l'endpoint
dédié `https://hc-ping.com/<id>/fail` déclenchant réellement le passage du check à l'état
« Down » et l'envoi de l'alerte email (confirmé par l'utilisateur), puis ping de succès
renvoyé pour revenir à l'état normal.
