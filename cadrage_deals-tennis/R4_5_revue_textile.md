# R4.5 — Relecture de la file de revue textile (`revue-textile.csv`)

Étape 2 de l'ordre de D-2026-09-29-07 / D-2026-09-30-03. Session Opus du 2026-09-30. Décision : D-2026-09-30-04.

## 1. Données relues

- File produite par un passage à blanc en prod (lecture seule, 5 035 offres) avec le code de `master` à `bb82bdd` (D-2026-09-29-05 compris, engine `r4.5-b-nike`) : **215 paires**, identique au passage de la session précédente.
- Pour chaque offre de la file : GTIN, `mpn`, `merchant_sku` et variantes lus en base (lecture seule).
- Fiches Tennis Point FR : GTIN par taille lus dans le JSON-LD de la page (une requête par fiche, espacées), croisés avec les EAN SportSystem et Sport 2000 : 50 paires comparables, **1 GTIN commun**. SportSystem ne donne qu'un EAN par offre : une absence de GTIN commun ne prouve pas que les articles diffèrent.
- Le site Head bloque les requêtes simples (contrôle anti-robot) : les paires Head « à confirmer » n'ont pas pu être vérifiées sur la fiche.

Fichier complet : [`R4_5_revue_textile.csv`](./R4_5_revue_textile.csv) (colonnes `proposition_claude` et `motif` ajoutées). **Les verdicts ligne à ligne sont des propositions de Claude Code** : Mathieu a tranché les arbitrages du §4, il n'a pas relu chaque ligne ; la colonne `decision_mathieu` reste vide.

## 2. Bilan

| Proposition | Paires |
|---|---|
| identique (sûr) | 18 |
| identique? (à confirmer sur la fiche) | 5 |
| proche (différence connue : édition, longueur, génération) | 73 |
| proche? (proche par la règle, peut-être le même article) | 8 |
| différent | 104 |
| incertain | 7 |

Sur les 35 paires notées 0,9, 9 sont identiques : le score seul ne permet pas de réunir (T-Q4 confirmé).

## 3. Constats

1. **Références qui tranchent.**
   - Tecnifibre : référence = style + coloris + taille (`22GRAT` + `SA` + `51`, `25POPI` + `SA` + `51`) ; 3 paires identiques par la partie style (lignes 13, 106, 125). C'est la vérification sur les données demandée par D-2026-09-29-07 point 3.
   - Head : le SKU du site (6 chiffres) est aussi la partie style de la référence SportSystem (`814431-WHDB`). Il distingue Club 22 (8114xx / 8144xx), Club 25 Tech (8117xx / 8147xx) et Club Original (8118xx / 8148xx). « Club Tech » sans année chez SportSystem est un Club 22 Tech.
   - Lacoste : 5 paires « Ultra-Dry », 5 références TH différentes (Ultra-Dry est une matière, pas un modèle).
   - Babolat : SKU différents sur 3 paires « Exercise » (Exercise Tee, Message, Graphic).
2. **Tennis Point FR omet parfois l'édition** : son « Freelift Pro T-shirt noir » a un GTIN commun avec le « Freelift Pro Open d'Australie 2026 noir » de SportSystem (ligne 27). La règle « édition écrite d'un seul côté → proche » laisse donc passer de vrais identiques quand un marchand ne l'écrit pas ; seuls un GTIN ou une référence les retrouvent (étape 7).
3. **Défauts de lecture** : ordre des mots (« BREAK II TIE- », ligne 17), chiffres romains (« Tech IV » / « Tech 4 », ligne 18), RG et Paris lus comme deux éditions (lignes 159, 171), débardeur Tecnifibre « Team Tank-top » classé t-shirt (ligne 198), genre « Homme W » chez Tennispro (ligne 76).
4. **À vérifier dans le code (étape 5)** : 3 t-shirts adidas junior « Club » / « Club Climacool » à prix égal (lignes 24, 54, 56) ne sont pas réunis par l'étape 2 ter de D-2026-09-30-01.
5. **Collections propres aux marchands** : Tennis Point FR préfixe « Vision » aux articles Head (Rainbow, Slice II) alors que Head vend aussi un « Vision T-shirt » ; Head nomme ses pantalons et shorts Club « Rosie », « Byron », « Ann » chez les revendeurs mais pas sur son site. Pas de règle générale proposée : ces cas relèvent des alias validés en lot (GAP-2026-09-27-02, R5).

## 4. Arbitrages (D-2026-09-30-04)

| Question | Réponse de Mathieu |
|---|---|
| Règles à coder | Ordre des mots ignoré (« II » reste marqueur de génération) ; chiffres romains = arabes ; RG = Paris dans le lexique des éditions ; Lacoste traitée comme Nike (références de style différentes → proche) |
| 18 identiques sûres | Consignées seulement (ce fichier) ; pas de liste de liens manuels avant R5 |
| 20 paires à confirmer | Non réunies ; reprises à l'étape 7 (investigation des indéterminés) |
| Exclusion de la file par numéro (question de la session précédente) | Règle gardée ; « 3 bandes » en sous-gamme et longueurs en pouces hors Nike / adidas corrigées à l'étape 5, avec paires pièges |

## 5. Pistes non décidées, pour l'étape 4

- Lire les GTIN des fiches Tennis Point FR pour le textile (l'enrichissement R3.12 ne vise que raquettes et chaussures) : seul moyen de retrouver les éditions non écrites (§3 point 2). Coût à mesurer.
- Ajouter Head et Babolat aux marques à référence de style distincte, comme Lacoste : à vérifier sur l'ensemble des données de l'étape 4, pas seulement sur cette file.
