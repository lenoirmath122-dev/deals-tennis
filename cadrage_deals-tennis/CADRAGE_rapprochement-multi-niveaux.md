# Cadrage — Rapprochement multi-niveaux entre marchands

> Complément de `CADRAGE_vrais-bons-plans.md`, à placer dans le même dossier.
> Il **remplace les phases 3b et 3c** du cadrage principal (audit et fusion des doublons) et **modifie l'ordre de la phase 1** (voir §10).
> Comme le premier, ce document décrit **quoi** construire. Le **comment** reste à confronter au code réel : tout désaccord doit être signalé avant d'agir.

---

## 0. Règles de travail

Les règles de la section 0 du cadrage principal s'appliquent sans changement : une phase à la fois avec arrêt pour validation, migrations additives testées d'abord sur une branche Neon, conventions `D-…`/`GAP-…`, mise à jour de `ETAT_ACTUEL.md`, tests pour toute logique nouvelle.

Règle supplémentaire propre à ce chantier : **tout ce qui relève de la connaissance du tennis** (règles de tolérance, référentiel de modèles, jeu de référence) est **proposé** par Claude Code puis **validé par Mathieu**. Ne jamais considérer ces éléments comme acquis sans validation.

---

## 1. Constat

- Sur tout le catalogue, les produits proposés par **au moins deux marchands distincts** étaient **10** avant le retrait de ProTennis. Il en reste **1**.
- Les ~445 produits « multi-offres » correspondent surtout à plusieurs offres **chez le même marchand** (variantes de couleur ou de taille, ou faux rapprochements).
- Cause probable : la clé `LOWER(brand)|LOWER(model)|category` repose sur le titre nettoyé. Chaque marchand formule ses titres différemment (ordre des mots, année, poids, mentions commerciales), donc la clé ne correspond presque jamais d'un marchand à l'autre.
- Conséquence : la comparaison entre marchands, l'un des deux différenciateurs du site, ne fonctionne pas aujourd'hui.

## 2. Besoin métier

Dans le tennis, deux offres peuvent être :

1. **Le même article** : même modèle, seule la variante change (grip, pointure, coloris).
2. **Des modèles proches** : un acheteur peut les considérer comme interchangeables (par exemple une raquette à 300 g et une autre à 305 g, ou une génération 2023 face à une 2025).
3. **Des produits différents**, même s'ils portent un nom voisin (Pure Aero et Pure Aero Lite, cordage en 1,25 et en 1,30).

Le rapprochement doit distinguer ces trois cas, et l'affichage doit toujours dire lequel s'applique.

## 3. Principes

| # | Principe |
|---|---|
| R1 | **Trois niveaux** : famille → modèle → variante (§4). |
| R2 | On rapproche sur des **attributs structurés**, pas sur des titres. |
| R3 | **Un faux rapprochement coûte plus cher qu'un rapprochement manqué.** Sous le seuil de confiance, rien n'est fusionné automatiquement : le cas part en file de revue. |
| R4 | L'**historique de prix et le verdict « vrai bon plan » se calculent au niveau du modèle**, jamais au niveau de la famille. |
| R5 | Les prix se comparent **à l'unité** quand le conditionnement varie (cordage au mètre, balles et surgrips à l'unité). |
| R6 | **Transparence** : « même modèle » et « modèle proche » sont toujours affichés séparément, avec la différence écrite en clair. On n'écrit jamais « meilleur prix » entre deux articles non identiques. |
| R7 | Règles de tolérance et référentiel dans des **fichiers de configuration versionnés**, pas en dur dans le code. |

## 4. Les trois niveaux

| Niveau | Exemple | Rôle |
|---|---|---|
| **Famille** | Babolat Pure Aero | Navigation et comparaison large. Porte les relations « modèle proche ». |
| **Modèle** | Pure Aero 98, 2023, 305 g, 16x19 | Unité de comparaison entre marchands. Unité de l'historique de prix et du verdict. |
| **Variante** | Grip 2, coloris jaune, cordée | Attributs de l'offre (`deals`). Sans effet sur la comparaison. |

**Orientation pour le modèle de données** (à adapter en R0, toujours de façon additive) :

- une table `product_families` (marque, nom de famille, catégorie) ;
- la table `products` actuelle devient le niveau « modèle », avec un lien vers la famille et ses attributs discriminants (génération, tamis, poids, plan de cordage, jauge, conditionnement…) ;
- sur `deals` : un champ d'attributs de variante (JSONB ou colonnes, à justifier), l'identifiant universel (`gtin`), la référence fabricant (`mpn`) si disponible, et la quantité unitaire (`unit_quantity`, `unit_type`) pour les catégories concernées ;
- la relation « modèle proche » est **calculée à la lecture** (même famille + attributs dans la tolérance), pas stockée, sauf si R0 montre une bonne raison de faire autrement.

## 5. Règles de tolérance par catégorie (v1, validée — D-2026-09-28-02)

| Catégorie | Variante (sans importance) | Modèle proche (affiché avec mention) | Produit différent |
|---|---|---|---|
| Raquettes | Grip, coloris, cordée/non cordée, édition sans caractéristique différente (Q7) | Poids ±10 g (même quand le poids est écrit dans le nom du modèle, Q1), plan de cordage différent, longueur différente (« + », Q2), génération voisine | Tamis (98/100…), version Lite/Tour/Team/Plus, raquette junior, poids > 10 g d'écart |
| Chaussures | Pointure, coloris | Surface (terre battue / toutes surfaces) | Genre, modèle, version large |
| Cordages | Coloris, édition sans caractéristique différente (Q7) ; jauge au choix dans la fiche (même jauge disponible des deux côtés) | Jauge différente (D-2026-09-27-05) | Garniture ou bobine (Q4, prix aussi affiché au mètre, jamais de « meilleur prix » entre les deux), longueur (comparaison au mètre) |
| Balles | — | — | Pression (Q5), conditionnement (comparaison à la balle) |
| Sacs | Coloris | — | Contenance (Q5, nombre de raquettes) |
| Surgrips, accessoires | Coloris | — | Conditionnement (comparaison à l'unité) |
| Textile | Taille, coloris ; collection/année non écrite ou écrite d'un seul côté (D-2026-09-27-06, Q6) | Édition spéciale nommée écrite d'un seul côté (RG, Wimbledon, US Open…, Q6) ; génération ou collection explicitement différente | Modèle, genre |
| Toutes catégories | Article + cadeau offert (« 6 cordages offerts », « sac offert »), cadeau indiqué sur l'offre (Q12) | — | Lot de N articles identiques (« Pack de 2 raquettes »), prix à l'unité affiché, jamais de « meilleur prix » entre un lot et l'unité (Q12) |

**Règle des générations (décision de Mathieu, 2026-09-26, D-2026-09-26-01)** — s'applique à toutes les catégories et prime sur la mention « génération voisine » de la ligne Raquettes :

- Génération **différente et vérifiée des deux côtés** → **produit différent**. Une ancienne génération n'a pas le même prix de référence : elle ne doit pas servir de base au verdict « vrai bon plan ».
- Génération **inconnue ou non vérifiable d'un côté** → **modèle proche**. Jamais de fusion automatique.
- **Même modèle** (identique) exige que la génération soit **confirmée des deux côtés**, ou que le modèle n'ait **qu'une seule génération sur le marché**.

**Exceptions (décisions de Mathieu, 2026-09-27 et 2026-09-28)** : pour le **textile**, un même modèle sans génération différente écrite est « identique », une année/collection écrite d'un seul côté reste « identique », et une édition spéciale nommée écrite d'un seul côté donne « proche » (D-2026-09-27-06, affiné par Q6/D-2026-09-28-02) ; pour les **cordages**, une jauge différente donne « proche », pas « différent » (D-2026-09-27-05) ; pour les **raquettes**, le plan de cordage et la longueur donnent « proche » (Q2, D-2026-09-28-02).

Sources de vérification admises : référence fabricant (`mpn`), GTIN, titre, JSON-LD ou fiche marchand. La source retenue est notée pour chaque paire du jeu de référence.

Ces règles vivent dans un fichier de configuration unique et commenté (`config/matching-rules.ts`), et le référentiel de familles dans `config/model-families.ts` (§7).

## 6. Extraction des attributs

**Sources, par ordre de fiabilité :**

1. Identifiants universels : EAN/GTIN (champ `barcode` Shopify, `gtin13`/`gtin` en JSON-LD), référence fabricant (`mpn`).
2. Données structurées de la page ou de l'API du marchand (JSON-LD, JSON Shopify, Algolia).
3. Champs spécifiques au marchand (fiche technique, filtres).
4. Analyse du titre et de la description, par des règles propres à chaque catégorie.
5. **Option à décider par Mathieu** : extraction par modèle d'IA (Claude via API) **uniquement** pour les titres que les règles n'arrivent pas à décomposer, avec résultat mis en cache par titre. Prérequis : clé API, estimation du coût. À ne mettre en place que si les règles plafonnent en R4.

**Attributs par catégorie (liste de départ) :**

- Raquettes : famille, génération ou année, tamis, poids, plan de cordage, version (Lite/Tour/Team/Plus/junior), taille de grip, cordée ou non.
- Chaussures : famille, genre, surface, version large, pointure.
- Cordages : famille, jauge, longueur (garniture ou bobine), matière si utile.
- Balles et accessoires : famille, conditionnement.
- Textile : type, famille, genre, taille.

## 7. Référentiel de modèles

- Une liste des **familles par marque**, avec leurs alias et orthographes courantes (par exemple « Pure Aero », « PureAero », « PA »), et les générations connues.
- **Amorçage** : Claude Code en propose une v1 à partir de la base (termes fréquents par marque et catégorie), sous forme de fichier lisible.
- **Validation et enrichissement par Mathieu**, puis révision à chaque saison.
- Stockage : fichier de configuration versionné ou table, à justifier en R0.

## 8. Cascade de rapprochement

Pour chaque offre, du plus sûr au moins sûr :

1. **Même GTIN** qu'une offre déjà rattachée → même modèle. Confiance maximale.
2. **Famille reconnue par le référentiel + attributs discriminants identiques** → même modèle.
3. **Correspondance approchée** (similarité, attributs partiels) avec un **score de confiance** :
   - au-dessus du seuil haut → rattachement automatique ;
   - entre les deux seuils → **file de revue** ;
   - sous le seuil bas → nouveau modèle.
4. Toute fusion ou tout rattachement modifié est tracé (table `product_merges` prévue au cadrage principal), pour pouvoir revenir en arrière.

Les seuils sont dans la configuration et réglés à partir du jeu de référence.

## 9. Mesure

**Jeu de référence :**
- 50 à 100 paires d'offres de marchands différents que l'on sait **identiques** (même modèle) ;
- des paires **proches** (modèle proche au sens du §5) ;
- des **paires pièges** qui ne doivent pas être rapprochées (Pure Aero / Pure Aero Lite, 1,25 / 1,30, garniture / bobine…).
- Claude Code propose des candidates, Mathieu valide. Le jeu est versionné dans le repo et sert de test automatisé.

**Métriques :**
- **Précision** du rapprochement « même modèle » : objectif ≥ 95 %.
- **Rappel** sur le jeu de référence : à mesurer, pas d'objectif fixé au départ.
- **Couverture multi-marchands** : nombre de modèles présents chez au moins 2 marchands distincts (offres `active` ou `tracked`). Point de départ : 1.
- Toujours mesurer **l'algorithme actuel** en premier, comme base de comparaison.

## 10. Phasage et impact sur le cadrage principal

**Ordre global révisé :**

1. Retrait définitif de ProTennis (en cours).
2. Trigger `price_observations` (phase 1, étape 1 du cadrage principal) : **inchangé, reste prioritaire**. Tant que les modèles sont réorganisés, l'historique reste attaché aux offres (`deal_id`) : aucune perte.
3. **R0 à R2** ci-dessous.
4. `lib/ingest.ts` + statut `tracked` + réécriture des 8 scripts = **R3**. Cette étape attend R0–R2 pour que les scripts ne soient réécrits qu'une seule fois.
5. **R4 et R5**.
6. Phases 2 (n8n), 4 (verdict) et 5 (supervision) du cadrage principal. La phase 2 peut démarrer en parallèle de R0–R2 si besoin, car elle ne dépend pas du rapprochement.

**Étapes du chantier :**

### R0 — Diagnostic (aucune modification)
- Pour chacun des 8 marchands : GTIN/EAN disponible ? `mpn` ? JSON-LD ou données structurées ? Quels attributs sont exploitables sans requête supplémentaire ?
- Formats de titres typiques par marchand et par catégorie (quelques exemples chacun).
- 20 à 30 exemples d'articles vraisemblablement identiques chez deux marchands mais non rapprochés aujourd'hui, avec la raison de l'échec.
- Proposition d'adaptation du modèle de données (§4) au schéma réel, avec plan de migration additive.
- **Arrêt.**

### R1 — Jeu de référence
- Proposition de paires candidates (identiques, proches, pièges) sous forme de CSV lisible.
- Mathieu valide ou corrige.
- Mesure de l'algorithme actuel sur ce jeu (base de comparaison).
- **Arrêt.**

### R2 — Référentiel v1 et règles de tolérance
- Référentiel de familles par marque (§7) et fichier de règles (§5), proposés puis validés.
- **Arrêt.**

### R3 — Capture à l'ingestion
- `lib/ingest.ts` (cadrage principal, phase 1) étendu : capture du GTIN, du `mpn`, des attributs bruts disponibles et de la quantité unitaire.
- Statut `tracked` pour les articles sans remise (décision déjà actée).
- Réécriture des 8 scripts un par un, vérifiée à chaque fois.
- **Arrêt.**

### R4 — Nouveau moteur en mode fantôme
- Extraction des attributs + cascade (§8), écrivant dans les **nouvelles** structures sans rien changer à ce que le site affiche.
- Mesure sur le jeu de référence et sur la couverture multi-marchands, comparée à l'algorithme actuel.
- Si la précision est insuffisante : analyse des erreurs, et décision éventuelle sur l'option IA (§6).
- **Arrêt : décision de bascule.**

### R5 — Bascule
- Migration des produits existants vers le nouveau modèle, fusions tracées.
- Le site et la recherche utilisent familles, modèles et variantes.
- La file de revue reçoit les cas sous le seuil.
- L'affichage détaillé (page produit « même modèle / modèles proches », mentions de différence) sera cadré séparément à ce moment-là.

## 11. Hors périmètre de ce document

- Le design détaillé de l'affichage comparatif.
- L'extraction par IA, tant que la décision n'est pas prise en R4.
- L'ajout de nouveaux marchands.
