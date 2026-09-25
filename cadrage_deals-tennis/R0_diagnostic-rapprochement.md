# R0 — Diagnostic rapprochement multi-niveaux (résultats)

> Livrable de l'étape R0 décrite au §10 de `CADRAGE_rapprochement-multi-niveaux.md`. Diagnostic uniquement, **aucune modification de code ni de base** dans cette étape. Toutes les données ci-dessous viennent de requêtes réelles (base Neon de prod, endpoints publics des marchands) exécutées le 2026-09-26 — rien n'est supposé sans avoir été vérifié, et les points non vérifiés sont signalés comme tels.

---

## 1. Par marchand : identifiants et données structurées disponibles

| Marchand | Source technique | GTIN/EAN sans requête suppl. | `mpn`/SKU marchand | Autres attributs exploitables sans requête suppl. |
|---|---|---|---|---|
| **Sport 2000** | API Algolia (déjà utilisée) | **Oui, réel** — champ `ean` (GTIN-13 valide, ex. `3324922067482` pour une raquette Babolat, préfixe GS1 France cohérent) | `ref` (référence marchand, ex. `140500-100`) | `gender`, `attributes` (sport/catégorie, peu discriminant), `color` |
| **Tennis Point FR** | JSON public Shopify (déjà utilisé) | Non — le storefront Shopify ne publie pas `variants[].barcode` (confirmé vide sur plusieurs produits testés) | `variants[].sku` (motif interne 16 chiffres, ex. `0070620387600001`) | **`variants[].grams`** (poids réel par variante, ex. 4 grips d'une même raquette à 379/381/377/378 g) — précieux pour la tolérance ±10g (§5) ; `variant.title` structure déjà taille de grip et cordée/non cordée |
| **Tecnifibre** | JSON public Shopify (déjà utilisé) | Non — même limite que Tennis Point FR (`barcode` vide) | `variants[].sku` interne | `product_type` (catégorie fine), `tags` (marketing, peu utile), `body_html` (texte marketing, pas d'attributs structurés) |
| **SportSystem** | JSON-LD `schema.org/Product` sur la fiche produit (1 requête HTTP déjà faite pour la marque) | Non — pas de champ `gtin`/`gtin13` dans le JSON-LD observé | `sku`/`mpn` présents mais **identiques et = identifiant PrestaShop interne** (vérifié sur un exemple réel : Pro Kennex Q+ 15 Pro, `sku`="160315", `mpn`="160315" — même valeur, ce n'est pas la référence fabricant) | `brand.name` (déjà utilisé), `offers.availability` |
| **Babolat** | Fragment HTML AJAX (déjà utilisé) | Non trouvé sur les pages consultées (pas de JSON-LD) | `data-pid` (identifiant interne Babolat, 6 chiffres, ex. `140484`) | **Piste à confirmer en R1/R2** : la plage numérique des `data-pid` Babolat observés en catégorie raquettes (140484, 140512, 140514…) est cohérente avec le préfixe numérique du champ `ref` vu côté Sport 2000 pour des raquettes Babolat (ex. `140500-100`) — suggère que le SKU marque Babolat pourrait servir de clé de correspondance retailer↔marque *pour ce marchand spécifiquement*, à vérifier précisément (comparer le même article exact) avant de s'appuyer dessus |
| **Tennispro.fr** | HTML via `curl` (Magento 1) | **Non vérifié dans ce R0** — respect du `Crawl-delay: 60` du site (une seule requête déjà consommée sur la page catégorie pour ce diagnostic, pas de requête supplémentaire pour explorer une fiche produit) | Inconnu | À vérifier réellement en R1/R2, pas supposé ici — Magento expose généralement un SKU marchand en microdata mais un GTIN n'est pas garanti sans configuration spécifique du site |
| **Head** | Playwright (protection anti-bot Vercel) | **Non vérifié dans ce R0** — nécessite un vrai navigateur (coût élevé pour une simple exploration), reporté à R1/R2 si besoin | Inconnu | — |
| **Amazon** | Playwright, page de résultats (recherche/rayon) | Non, sur la page de résultats elle-même (DOM scraping brut, pas de données structurées) | ASIN existe mais n'a de sens que pour l'idempotence côté Amazon — ce n'est pas un GTIN universel partagé avec les autres marchands | Un GTIN existe parfois sur la fiche produit détaillée d'Amazon, mais cela impliquerait une requête supplémentaire par article — hors périmètre « sans requête supplémentaire » de ce diagnostic |

**Constat principal** : sur les 8 marchands, **un seul (Sport 2000) expose un vrai GTIN/EAN sans coût supplémentaire**, via son API Algolia déjà utilisée. C'est le seul point d'ancrage fiable pour la cascade §8 étape 1 dans l'état actuel des scripts. Aucun des 8 scripts ne capture aujourd'hui de GTIN, `mpn`, SKU marchand ni quantité unitaire — ces champs sont vus par les scripts (parfois) mais jamais lus ni stockés.

---

## 2. Formats de titres typiques (exemples réels, base de prod du 2026-09-26)

| Marchand | Catégorie | Exemple réel |
|---|---|---|
| Sport 2000 | chaussures | « Chaussures de tennis BABOLAT Femme JET TERE AC WOMEN Blanc Femme » |
| Sport 2000 | chaussures | « Chaussures de tennis ASICS Homme GEL-DEDICATE 8 Homme » |
| SportSystem | cordages | « Cordage de tennis Tecnifibre TGV (200m) » |
| SportSystem | raquettes | « Raquette de tennis Pro Kennex Ki 5 260 Kinetic » |
| Tecnifibre | textile | « Veste de tennis Tecnifibre Veste Tour Jacket Homme » |
| Tennis Point FR | textile | « Vêtement de tennis Nike Court Dri-Fit Slam Shorts Hommes - bleu clair » |
| Tennis Point FR | chaussures | « Chaussures de tennis Lotto Mirage 100 II Chaussure terre battue Femmes - blanc, beige » |
| Tennispro.fr | accessoires | « Sac à tennis Wilson Super Tour Red » |
| Tennispro.fr | cordages | « Bobine de cordage de tennis Luxilon Eco Spin (200 Metres) » |
| Head | textile | « EASY COURT T-shirt de tennis Junior » |
| Amazon | cordages | « Head 281404 16 NT Velocity Mlt Cordage pour raquette de tennis » |
| Amazon | raquettes | « Wilson Tour Slam Lite Raquette de Tennis, Technologie V-Matrix pour Débutants, Tolérance Exceptionnelle » |

**Babolat : 0 offre active au moment de ce diagnostic** (constat déjà documenté en D-2026-09-25-09 — le marchand retombe à 0 dès qu'aucune vraie promo n'est publiée ; pas une anomalie de ce diagnostic).

Confirme le constat du §1 du cadrage : chaque marchand a sa propre convention (préfixe catégorie générique côté Sport2000/SportSystem/Tennis Point FR, poids entre parenthèses côté Tennispro, référence interne Head/Amazon en tête de titre parfois numérique). Aucun format commun exploitable par une simple normalisation de texte.

---

## 3. Exemples réels de rapprochements manqués (24 exemples, requête directe sur la prod)

Généré par une requête de similarité de tokens (recouvrement de mots du champ `model`, seuil ≥ 0.3) entre offres actives de marchands différents, marque identique, catégorie identique, ne partageant pas déjà le même `product_id`. Chaque paire ci-dessous est un cas réel trouvé en base le 2026-09-26.

| # | Marque | Marchand A | Modèle A | Marchand B | Modèle B | Raison probable de l'échec |
|---|---|---|---|---|---|---|
| 1 | Wilson | Tennis Point FR | Pro Staff 97L V14 Raquette de compétition | SportSystem | Pro Staff 97L V14 | mention commerciale « Raquette de compétition » ajoutée côté Tennis Point FR |
| 2 | HEAD | Tennis Point FR | Boom MP L Neon 2025 | Tennispro.fr | Boom Mp L Neon 2025 (270 Gr) | poids entre parenthèses ajouté côté Tennispro |
| 3 | Wilson | Tennis Point FR | Clash 100 Pro V2.0 Raquette De Compétition | SportSystem | Wilson Clash 100 Pro V3 - Raquette de tennis compétition confortable | **version différente (V2.0 vs V3) malgré un score de similarité élevé — piège à ne pas fusionner, illustre R3 (§3)** |
| 4 | Babolat | Tennispro.fr | Pure Strike 98 16 19 (305 Gr) | Tennis Point FR | Pure Strike 97 | **tamis différent (98 vs 97) malgré la similarité du nom — même piège, confirme la règle §5 « tamis = produit différent »** |
| 5 | Babolat | Tennispro.fr | Pure Strike 100 16 20 (305 Gr) | Tennis Point FR | Pure Strike 100 16x20 | notation du plan de cordage différente (« 16 20 » vs « 16x20 ») + poids ajouté |
| 6 | Dunlop | Tennis Point FR | FX 500 Lite | Tennispro.fr | Fx 500 Lite (270 Gr) | poids ajouté, casse différente |
| 7 | Dunlop | Tennis Point FR | FX 500 Lite | SportSystem | Dunlop FX 500 Lite 2026 | millésime ajouté côté SportSystem |
| 8 | Dunlop | Tennis Point FR | CX Team 100 | Tennispro.fr | Cx Team 100 (275 Gr) | poids ajouté, casse différente |
| 9 | HEAD | Tennis Point FR | Radical Pro | Tennispro.fr | Radical Pro (315 Gr) | poids ajouté |
| 10 | HEAD | Tennis Point FR | Radical Team | Tennispro.fr | Radical Team L (260 Gr) | suffixe de taille de manche (« L ») + poids ajoutés |
| 11 | HEAD | Tennis Point FR | Novak 19 | Tennispro.fr | Junior Novak 25 | **taille de raquette junior différente (19" vs 25") malgré le score — encore un piège, confirme l'utilité du rapprochement au niveau modèle et pas famille** |
| 12 | Tecnifibre | Tecnifibre (site propre) | Tf-x1 V2 270 | SportSystem | TF X1 270 V2 | ordre des mots inversé (« V2 270 » vs « 270 V2 ») |
| 13 | Adidas | SportSystem | Débardeur de tennis Débardeur tennis femme Club Femme | Tennispro.fr | Débardeur de tennis Femme Club | doublon du mot-clé catégorie côté SportSystem, ordre des mots différent |
| 14 | Tecnifibre | Tennispro.fr | Antivibrateur de tennis S Logo Damp Tricolore | Tecnifibre (site propre) | Antivibrateur de tennis Logo Damp Tricolore | préfixe de taille (« S ») ajouté côté Tennispro |
| 15 | Adidas | SportSystem | Adizero Ubersonic 5 femme toutes surfaces Femme | Tennispro.fr | Femme Adizero Ubersonic 5 Toutes Surfaces | ordre des mots différent, mention du genre dupliquée côté SportSystem |
| 16 | Adidas | SportSystem | Adizero Ubersonic 5 femme toutes surfaces Femme | Tennis Point FR | Adizero Ubersonic 5 Chaussures toutes surfaces Hommes | **genre différent malgré la similarité (femme vs hommes) — encore un piège potentiel si le genre n'est pas vérifié comme attribut discriminant** |
| 17 | Adidas | Sport 2000 | Vêtement de tennis Short Homme Club Homme | SportSystem | Short de tennis Short tennis SW Club Homme | doublon du mot catégorie des deux côtés, ordre différent |
| 18 | Adidas | SportSystem | Short de tennis Short tennis junior Club Enfant | Tennispro.fr | Short de tennis Junior Club | doublon catégorie, ordre différent |
| 19 | Adidas | SportSystem | Jupe de tennis Jupe de tennis femme Adidas Club Femme | Tennispro.fr | Jupe de tennis Femme Club | doublon catégorie + marque, ordre différent |
| 20 | ADIDAS | Sport 2000 | Junior Barricade K Enfant | Tennispro.fr | Junior Barricade | suffixe de version (« K ») ajouté côté Sport 2000 |
| 21 | ADIDAS | Sport 2000 | Homme Barricade 13 M CL Homme | SportSystem | Barricade Clay Homme | notation de surface différente (« CL » vs « Clay »), numéro de génération absent côté SportSystem |
| 22 | Tecnifibre | SportSystem | Sac à dos de tennis Sac à dos Tecnifibre Backpack Tour Endurance | Tecnifibre (site propre) | Sac A Dos Tour Endurance Backpack | ordre des mots inversé, doublon catégorie côté SportSystem |
| 23 | Tecnifibre | Tecnifibre (site propre) | Sac A Dos Tour Endurance Backpack | SportSystem | Sac à dos Backpack Navy Tour Endurance | couleur insérée au milieu du titre côté SportSystem |
| 24 | Adidas | Tennispro.fr | Adizero Ubersonic 5 Terre Battue | Tennis Point FR | adizero Ubersonic 5 Chaussure terre battue Hommes | casse différente, mention du genre ajoutée côté Tennis Point FR |

**Enseignement transversal** : sur ces 24 exemples, **4 sont en réalité des pièges** (#3, #4, #11, #16 — versions, tamis, taille junior ou genre différents malgré un score de similarité textuelle élevé). Un algorithme purement textuel (similarité de titre) aurait un taux de faux positifs significatif s'il n'était pas complété par la comparaison d'attributs structurés (R2, principe §3 R2/R3) — confirme que la cascade §8 doit vérifier les attributs discriminants (tamis, génération, taille) **avant** de considérer deux offres comme le même modèle, pas seulement un score de proximité textuelle.

---

## 4. Proposition d'adaptation du modèle de données (§4) au schéma réel

Schéma actuel vérifié (`information_schema` + `pg_indexes`, base de prod, 2026-09-26) :

```
products (id uuid PK, brand varchar, model varchar, category varchar, gender varchar,
          age_group varchar, created_at timestamptz)
  UNIQUE INDEX idx_products_brand_model_category ON (lower(brand), lower(model), category)

deals (id uuid PK, title varchar, brand varchar, category varchar, image_url text,
       original_price numeric, discounted_price numeric, discount_percentage int,
       merchant_id uuid FK, affiliate_url text, status varchar, is_active boolean,
       expires_at timestamptz, created_at timestamptz, updated_at timestamptz,
       product_id uuid FK -> products, color varchar)
  UNIQUE INDEX ON (merchant_id, affiliate_url)
```

C'est exactement la clé texte décrite en §1 du cadrage (`lower(brand)|lower(model)|category`) qui empêche aujourd'hui le rapprochement inter-marchands.

**Proposition additive** (aucune colonne existante modifiée ni supprimée, migration réversible) :

1. **Nouvelle table `product_families`** — `id uuid PK, brand varchar, family_name varchar, category varchar, created_at timestamptz`, avec un index unique `(lower(brand), lower(family_name), category)`. Portera plus tard les alias/orthographes (§7) dans une table séparée `product_family_aliases` si le besoin se confirme en R2 (pas construite ici, hors périmètre R0).
2. **`products` devient le niveau « modèle »** : ajout de `family_id uuid NULL REFERENCES product_families(id)` (nullable — un produit peut exister sans famille reconnue tant que R2/R4 n'ont pas tourné), et des colonnes d'attributs discriminants **nullables**, remplies uniquement quand disponibles :
   - `gtin varchar NULL` (le seul champ vérifié disponible aujourd'hui, uniquement pour Sport 2000 — cf. §1)
   - `generation varchar NULL` (année/génération, ex. « 2025 »)
   - `head_size varchar NULL` (tamis raquettes, ex. « 98 »)
   - `weight_grams integer NULL` (poids — déjà disponible sans coût pour Tennis Point FR via `variants[].grams`, cf. §1)
   - `string_pattern varchar NULL` (plan de cordage, ex. « 16x19 »)
   - `variant_label varchar NULL` (Lite/Tour/Team/Plus/junior — déjà partiellement capté via `age_group`/le titre, mais pas comme attribut structuré dédié)
   Ces colonnes couvrent les attributs raquettes (§6) en priorité, car c'est la catégorie la plus citée dans les pièges du §3. D'autres colonnes (surface pour chaussures, jauge/longueur pour cordages…) seront ajoutées de la même façon quand R2 précisera le référentiel par catégorie — pas construites toutes d'un coup ici pour rester additif et incrémental.
3. **Sur `deals`** (niveau variante, §4) : ajout de `mpn varchar NULL`, `unit_quantity numeric NULL`, `unit_type varchar NULL` (ex. « metre », « unite » pour cordages/balles/surgrips, R5). `gtin` **n'est pas dupliqué sur `deals`** — il vit sur `products` (niveau modèle), une variante de couleur/grip du même modèle partage le même GTIN quand le marchand le fournit par variante (à confirmer marchand par marchand en R3, cf. l'exemple Tennis Point FR §1 où chaque grip a son propre SKU mais représente la même « famille » de raquette).
4. **Table `product_merges`** (déjà prévue au cadrage principal, non construite) : `id uuid PK, from_product_id uuid, to_product_id uuid, confidence_score numeric, method varchar, created_at timestamptz, reverted_at timestamptz NULL` — trace toute fusion/rattachement pour permettre un retour arrière (cascade §8 point 4).
5. **Aucune modification de la clé unique existante** `idx_products_brand_model_category` dans cette étape — elle continue de servir de garde-fou anti-doublon exact tant que R4/R5 (nouveau moteur) n'ont pas basculé le site dessus. Le nouveau moteur (R4) écrira dans les nouvelles colonnes en mode fantôme sans toucher à ce qui est affiché, conformément au §10.

**Migration** : un seul fichier SQL additif (`ALTER TABLE ... ADD COLUMN` + `CREATE TABLE product_families` + `CREATE TABLE product_merges`), testé d'abord sur une branche Neon dédiée comme pour `price_observations`, avant application en prod — à construire en R3 (capture à l'ingestion), pas dans cette étape R0.

---

## Arrêt (R0 terminé)

Conformément au §10 : **arrêt ici**, aucune validation de R1 demandée dans ce diagnostic. Prochaine étape possible : R1 (jeu de référence, 50-100 paires proposées par Claude Code puis validées par Mathieu), sur feu vert explicite.
