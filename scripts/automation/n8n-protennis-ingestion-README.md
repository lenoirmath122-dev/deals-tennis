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
   produit est calculé dans l'étape de parsing (miroir JS de `lib/product-matching.ts`,
   `extractModel` — **à garder synchronisé manuellement**, ce workflow n8n ne peut pas
   importer le code TypeScript du repo). `affiliate_url` = URL produit ProTennis directe
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

## Point ouvert : hébergement permanent

Cette étape a été construite et vérifiée avec une instance n8n **locale et temporaire**
(`npx n8n`, arrêtée après vérification) — aucune instance n8n ne tourne en continu.
Pour que le déclencheur planifié (6h/jour) s'exécute réellement en production, il faudra
héberger n8n en continu (n8n Cloud, VPS, ou la machine de l'utilisateur qui resterait
allumée) — décision non prise à ce stade, voir `GAPS_OUVERTS.md`.
