# R4.5, étape 7 : investigation des paires indéterminées

**Session** : 2026-09-30, Opus (cadrage). Décision : D-2026-09-30-09. Report en code : Sonnet, session suivante (§8).

**Origine** : D-2026-09-29-06 (sort des indéterminés A, B ou C, catégorie par catégorie, après investigation : référence fabricant, fiche, familles à génération unique) ; D-2026-09-30-08 (état « indéterminé ») ; ordre du chantier, étape 7 (`ETAT_ACTUEL.md`).

Rappel des trois sorts : **A** laisser les paires à part (non réunies) ; **B** « identique présumé » (réunies) ; **C** validation une à une.

## 1. Matériau

- `rapport-passage-etape6-prod/indetermines.csv` : 1 690 paires (300 au plus par famille).
- Export complet en lecture seule (script jetable hors dépôt, 5 035 offres de la prod, 2026-09-30) : **22 865 paires** inter-marchands d'une même famille, dont **2 387 indéterminées** sans plafond ; GTIN de toutes les variantes (champ `gtin`, `raw_attributes.variants`, enrichissement), références, URL, prix d'origine.

| Catégorie | Paires indéterminées (rapport) | Manque principal |
|---|---|---|
| Chaussures | 694 | génération 213, surface 196, genre 152, génération + surface 112 |
| Textile | 381 | nom de modèle illisible 342 (Lacoste, Mizuno chez Tennis Point FR surtout) |
| Cordages | 214 | conditionnement + jauge + longueur 124, jauge 47 |
| Raquettes | 210 | génération + poids 115, génération 35 |
| Accessoires (sacs) | 191 | contenance, taille, type, génération |

Paires les plus nombreuses : textile SportSystem / Tennis Point FR (460), chaussures Tennis Point FR / Tennispro.fr (235), sacs Head / Tennispro.fr (213).

## 2. Les identifiants ne tranchent presque rien

- **GTIN** : 4 paires indéterminées sur 2 387 partagent un GTIN, toutes variantes confondues. Babolat, Head, Tennispro.fr et le textile de Tennis Point FR n'ont aucun GTIN.
- **Références** : déjà exploitées à l'étape 4 (SKU Babolat, Head, Sport 2000 ; `mpn` Tennispro.fr). Une paire indéterminée est par construction une paire sans référence commune.

## 3. Sort B testé : rejeté comme règle automatique

**B appliqué tel quel** (toute paire indéterminée réunie, en plus des modèles actuels) : par transitivité, 37 regroupements réunissent deux offres jugées « différent » (7 sacs, 6 chaussures, 10 cordages, 5 raquettes, 9 textile). Cause : une offre peu renseignée (« Gel-Resolution X Homme », Sport 2000) est indéterminée à la fois face à la version terre battue et à la version toutes surfaces d'un autre marchand, et sert de pont entre elles.

**B restreint aux paires sans ambiguïté** (chaque offre n'a qu'un seul modèle candidat chez l'autre marchand, et aucun identique) : 154 paires, 93 regroupements, modèles multi-marchands 234 → 298. Les 93 regroupements ont été relus un par un :

| Catégorie | Regroupements | Faux ou contradictoires | Justes probables | Incertains |
|---|---|---|---|---|
| Chaussures | 25 | 3 (Gel-Resolution X terre battue + toutes surfaces ; Sprint 4.0 Carpet + Strap 4.0 + Sprint 3.5 ; Sprint Evo 4.0 + 3.5) | 17 | 5 (surface d'un seul côté : Gel-Dedicate 8, Revolt Pro 4.5, Revolt Pro 5.0 femme…) |
| Raquettes | 33 | 3 (Speed Pro 2022 + 2026 ; Speed Team 2022 + 2026 ; Ultra 100L V4 + V5) | 22 | 8 (année d'un seul côté : Tennis Point FR vend encore des 2022 et 2023) |
| Cordages | 13 | 0 | 6 | 7 (conditionnement d'un seul côté) |
| Textile | 19 | 7 (Play Polo / Polo 150 ans ; Heritage Racquet Club / Dri-Fit ; RG Aeroready / Graphic Jeu Paris ; short Club / Ergo Gameset…) | 6 | 6 |
| Sacs | 0 | | | |

« Sans ambiguïté » veut seulement dire qu'un marchand n'a qu'une variante en rayon : l'absence d'information reste une absence. **B n'est sûr dans aucune catégorie.**

## 4. Ce qui réduit réellement les indéterminés : de nouvelles sources

### 4.1 Défauts trouvés (corrections de règles déjà décidées)

1. **`compare()`, génération** : « Ultra 100L V4.0 » / « Ultra 100L V5 Roland Garros 2026 » → indéterminé, car l'année 2026 est comparée au libellé V4. Quand les deux côtés ont un libellé, ils doivent être comparés entre eux (V4 ≠ V5 → différent).
2. **Head Sprint, « 3.5 »** non lu comme génération (« Sprint Evo 3.5 », « SPRINT 3.5 JUNIOR ») alors que « 4.0 » l'est.
3. **« Carpet »** non lu comme surface (« Sprint 4.0 Carpet ») ; « tapis » l'est.
4. **« Strap »** (fermeture à scratch, modèle enfant) non lu comme version.
5. **Site Head, faute de titre** : « Sprint Pro 4.0 SF Caly » ; l'URL porte `sf-clay`.

### 4.2 Sources nouvelles (règles à valider)

1. **URL du site Head** : le slug porte la surface (`clay`, `carpet`) et souvent le genre (`men`, `women`). 6 chaussures Head sans surface dans le titre l'ont dans l'URL.
2. **Cordages, conditionnement déduit du prix d'origine** quand le titre ne l'écrit pas. Prix mesurés : garnitures de 7,95 € à 64,95 € (médiane 17,99 €), bobines de 54,95 € à 359,95 € (médiane 169,99 €). Seuils proposés : **≤ 40 € garniture, ≥ 90 € bobine, entre les deux inconnu**. Les 42 cordages sans conditionnement sont tous sous 30 € ou au-dessus de 95 € : aucun dans la zone grise. La longueur d'une bobine (100 m ou 200 m) reste inconnue.
3. **Jauge des cordages Head et Tennispro.fr** : 122 cordages Tennispro.fr sur 125 n'ont pas de jauge dans le titre. **Vérifié sur 5 fiches Tennispro.fr sur 5** (Hawk 12 m ×2, RPM Hurricane 200 m, Xplore 200 m, Gosen AK Pro 12 m) : la jauge est un sélecteur de taille de la fiche (`data-attribute="w_size"`, ex. Xplore : 1.25 / 1.30 / 1.35 mm), comme une pointure ; les deux offres « Hawk (12 Metres) » ne diffèrent que par le coloris. **Site Head non vérifié** : fiches refusées (« 429 », anti-robot, déjà constaté le 2026-09-30).

### 4.3 Déjà validé, à reporter

- **R4.5-c** (D-2026-09-30-02) : `generationUnique` sur les 7 familles de chaussures, « ultra » = AG-LT23, Q5 dans `generationDifference`. Touche directement les 213 paires chaussures « génération » seule.

## 5. Ce qui reste sans source

- **Textile, nom de modèle illisible** (342 paires) : titres Tennis Point FR du type « Lacoste Polo Hommes - orange ». Seul un GTIN pourrait trancher ; la lecture des 1 749 fiches textile de Tennis Point FR est reportée (1 GTIN commun sur 50 paires comparables, D-2026-09-30-05). Les 20 paires textile « à confirmer » (D-2026-09-30-04) et les 3 paires Tecnifibre sont dans ce cas.
- **Chaussures sans genre chez Tennispro.fr** : 62 fiches sur 125 ; ni le titre, ni l'URL, ni `raw_attributes` ne portent le genre.
- **Raquettes sans année** : aucune source ; les marchands vendent plusieurs générations en même temps.
- **Sacs** : contenance, taille, type non écrits ; pas de source.

## 6. Proposition soumise à Mathieu

1. **Sort par défaut : A dans toutes les catégories.** Pas de B automatique (§3). Pas de C : 2 387 paires, qui changent à chaque collecte, et D-2026-09-30-04 a écarté les liens manuels.
2. **Réduire les indéterminés à la source** : corriger les défauts §4.1, reporter R4.5-c, ajouter les sources §4.2 (URL Head, prix des cordages), puis refaire la mesure.
3. **Jauge des cordages** : vérifier sur 3 à 5 fiches (Head, Tennispro.fr) avant toute règle ; la question revient à Mathieu avec le constat.
4. **Textile** : A ; la lecture des GTIN textile de Tennis Point FR reste reportée (réouverture si un marchand textile nouveau apporte des GTIN).

## 7. Réponses de Mathieu (AskUserQuestion, 2026-09-30, D-2026-09-30-09)

1. **Sort des indéterminés : A dans toutes les catégories** (recommandé). Ni B automatique, ni C.
2. **Cordages, conditionnement déduit du prix d'origine** quand le titre ne l'écrit pas : ≤ 40 € garniture, ≥ 90 € bobine, entre les deux inconnu (recommandé).
3. **Site Head, surface et genre lus dans l'URL** quand le titre ne les donne pas (recommandé).
4. **Jauge des cordages** : vérifier d'abord (recommandé) ; fait (§4.2 point 3), puis :
   - **Tennispro.fr : jauge ignorée** (choix de Mathieu ; la recommandation était de lire la liste des jauges à la collecte et de comparer). Conséquence acceptée : une paire est réunie même si la jauge écrite chez l'autre marchand n'est pas proposée sur la fiche Tennispro.fr.
   - **Site Head : même règle, sans vérification** (choix de Mathieu ; la recommandation était de laisser indéterminé tant que les fiches ne sont pas lues).

## 8. À reporter en code (Sonnet)

1. **Défauts §4.1** :
   - `generationDifference` (`compare.ts`) : si les deux offres ont un libellé de génération, comparer les libellés, même si une seule a aussi une année (« Ultra 100L V4.0 » / « Ultra 100L V5 Roland Garros 2026 » → différent) ;
   - génération « 3.5 » lue pour Head Sprint (« Sprint Evo 3.5 », « SPRINT 3.5 JUNIOR »), comme « 4.0 » ;
   - « carpet » lu comme surface, même valeur que « tapis » ;
   - « strap » lu comme version (chaussures Head enfant) ;
   - site Head : faute « caly » couverte par la lecture de l'URL (point 3).
2. **R4.5-c** : report de D-2026-09-30-02 tel que décrit au §6 de `R4_5_c_generation_unique.md` (7 familles `generationUnique`, « ultra » = AG-LT23, Q5 dans la version de `generationDifference` qui distingue « indéterminé »).
3. **URL du site Head** (chaussures) : surface (`clay` → terre battue, `carpet` → même valeur que « tapis ») et genre (`men` → homme, `women` → femme) lus dans `affiliate_url` quand le titre ne les donne pas ; source moins prioritaire que le titre. Le slug est à lire mot par mot (`sf-clay-men`), jamais en sous-chaîne (`women` contient `men`).
4. **Cordages, conditionnement par le prix d'origine** : seulement si le titre ne l'écrit pas ; ≤ 40 € → garniture, ≥ 90 € → bobine ; source dédiée (par exemple `prix`), moins prioritaire que le titre ; alerte d'extraction si le prix est entre 40 et 90 € ou absent. La longueur d'une bobine reste inconnue.
5. **Cordages, jauge chez Tennispro.fr et sur le site Head** : quand l'offre de l'un de ces deux marchands n'écrit pas la jauge dans le titre, la jauge est une variante de l'offre : elle ne produit ni « indéterminé » ni « différent » face à l'autre offre. Si le titre écrit une jauge, règle actuelle. Renvoi à D-2026-09-30-09 dans le code.
6. **Tests** (paires pièges) : Ultra V4.0 / V5 2026 → différent ; Sprint Evo 3.5 / 4.0 → différent ; Sprint 4.0 Carpet / Sprint 4.0 terre battue → différent ; « Head Sprint Pro 4.0 SF Caly » (URL `…sf-clay-men…`) / « Sprint Pro 4.0 Clay Homme » → identique ; cordage Head 15 € sans conditionnement / même cordage « 12 m » → pas d'indéterminé sur le conditionnement ; cordage à 60 € sans conditionnement → conditionnement inconnu ; « Cordage Head Hawk (12 Metres) » Tennispro.fr / « Head Hawk 1.25 12 m » → identique.
7. **Passage à blanc en prod** (lecture seule) et contrôles : nombre de paires indéterminées par catégorie avant / après ; relecture de **tous** les modèles multi-marchands nouveaux (chaque fusion justifiée par l'une des règles ci-dessus) ; aucun modèle ne réunit deux offres « différent ». Tout regroupement faux est un défaut à expliquer avant la PR.
8. **Écriture en prod** après accord de Mathieu, comme aux étapes précédentes.

## 9. Reste ouvert après l'étape 7

- Textile, nom de modèle illisible et GTIN textile de Tennis Point FR : A, lecture des fiches toujours reportée (§5).
- Chaussures sans genre chez Tennispro.fr, raquettes sans année, sacs : A, aucune source.
- Prochaine étape de l'ordre après le report : R4.6.
