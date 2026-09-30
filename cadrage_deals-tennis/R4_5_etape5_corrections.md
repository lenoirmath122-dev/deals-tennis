# R4.5 — Étape 5 : corrections d'extraction

Session desktop Opus, 2026-09-30. Cadrage seulement : aucun code modifié, rien écrit en base. Le report en code se fera ensuite en Sonnet.

## 1. Méthode

- Sources de la liste : §5.3 de `R4_5_mesure_separation.md`, §2 de `R4_5_c_generation_unique.md`, D-2026-09-30-04 (points 1a à 1c et 4, t-shirts adidas junior), §7 de `R4_5_references_style.md`, D-2026-09-30-06 point 3.
- Chaque défaut a été rejoué sur les 5 035 offres `active` + `tracked` de la prod (copie locale en lecture seule, code de `master` à `d39c68a`, moteur `r4.5-etape4`) : extraction de l'offre, puis regroupement en modèles quand c'était utile.
- Chaque correction aura une **paire piège** versionnée (test unitaire), avec le verdict attendu.

## 2. Corrections qui appliquent une règle déjà décidée

| # | Défaut constaté | Correction | Paire piège → verdict attendu |
|---|---|---|---|
| A1 | **« Pure Drive + »** : `compare()` rend « identique » entre « Pure Drive + Gen11 » et « Pure Drive Gen11 Spectra ». La levée C-Q3 ignore la longueur connue d'un seul côté, alors que le « + » est écrit. Aujourd'hui, seules les références de l'étape 4 les tiennent séparées. | Une longueur lue sur le « + » du titre n'est pas une caractéristique dérivée : C-Q3 ne la lève pas. Q2 s'applique (longueur → « proche »). | « Pure Drive + Gen11 » / « Pure Drive Gen11 » (Babolat, sans référence) → **proche** |
| A2 | **Collaboration ASMC** (adidas by Stella McCartney) lue comme une édition « variante ». « Y-3 » n'est lu que pour l'Avacourt : « Y-3 Femme Barricade 13 » passe sans édition. | C-Q2 (collaboration = autre produit) : ASMC et Y-3 → « différent », lus pour toutes les chaussures adidas. | « ASMC Barricade » (200 €) / « Barricade » → **différent** ; « Y-3 Barricade 13 » / « Barricade 13 » → **différent** |
| A3 | **Sprint Court « 40 »** : Sport 2000 écrit « SPRINT COURT 40 » et « SPRINT TEAM 40 » pour la 4.0. La génération n'est pas lue. | Marqueurs « 40 » et « 30 » ajoutés aux générations 4.0 et 3.0 de la famille Head Sprint. | « SPRINT COURT 40 JUNIOR » (Sport 2000) / « Sprint Court 4.0 » (Head) → génération **4.0 des deux côtés** |
| A4 | **Radical « Palm Tree »** (D-2026-09-30-06 point 3). | « palm tree » = marqueur de la génération 2025 de Head Radical (raquettes seulement). | « Radical MP Palm Tree » / « Radical MP 2023 » → **différent** ; / « Radical MP 2025 » → **identique** |
| A5 | **Ordre des mots** du nom de modèle textile : « BREAK II TIE- » (site Head) / « Tie-Break II » (D-2026-09-30-04, 1a). | Nom de modèle comparé comme un ensemble de mots (triés) ; « II » reste lu comme numéro. | « BREAK II TIE- T-shirt femme » / « Tie-Break II T-shirt Femmes » → **identique** |
| A6 | **Chiffres romains** (1b) : déjà dans le code (`TEXTILE_ROMAN_NUMERALS`) ; « Tech IV » et « Tech 4 » donnent tous deux le numéro 4. La paire Lotto reste séparée par la longueur « 7in », écrite d'un seul côté. | Aucun changement ; test seulement. | « Tech IV 7in » / « Tech 4 » → **proche** (longueur d'un seul côté) |
| A7 | **RG = Paris** (1c) : deux éditions distinctes dans `TEXTILE_EDITIONS`. | Une seule édition, avec les graphies « rg », « roland garros » et « paris ». | « RG Pro Jupe » / « Pro Paris » (jupe) → plus « différent » par l'édition |
| A8 | **« 3 Bandes »** (point 4) : « Garcon Club 3 Bandes » (Tennispro.fr) est lu comme numéro 3, et la paire sort donc de la file de revue. | « 3 bandes » = sous-gamme `3stripes`, comme « 3S » et « 3Stripes ». | « Club 3 Bandes » (Tennispro.fr) / « Club 3S » → sous-gamme **3stripes des deux côtés** |
| A9 | **Débardeur Tecnifibre** : « T-shirt de tennis Tecnifibre Team Tank-top » est classé t-shirt. Le préfixe du script (« T-shirt de tennis ») l'emporte sur « Tank-top ». | Tecnifibre ajouté à `TEXTILE_TYPE_LAST_MERCHANTS`, qui lit le type en fin de titre comme pour Sport 2000. À contrôler sur les 94 titres textiles Tecnifibre. | « Team Tank-top Femme » → **débardeur** |
| A10 | **Alias qui avale la version** : l'alias est retiré avant la lecture de la version. Pour les sacs Babolat Pure (alias « pure aero », « pure drive »), la version Aero / Drive / Strike n'est jamais lue ; « RH12 Pure Aero » et « RH12 Pure Drive » ne diffèrent que par la génération. Même défaut pour le T-Fight junior (alias « t fight club », versions « Club 17 »…) : aucune version n'est lue. | Lire la version avant de retirer l'alias quand l'alias contient la version, ou réécrire les deux entrées (alias court, versions séparées). Choix technique laissé à la session Sonnet, avec les pièges. | « RH12 Pure Aero » / « Pure Drive Rh12 » → **différent** (Q19) ; « T-Fight Tour 26 » / « T-Fight Team 26 » → **différent** |

## 3. Corrections qui demandent une règle nouvelle (questions §5)

| # | Défaut constaté | Proposition |
|---|---|---|
| B1 | **Taille des raquettes junior non lue.** « Speed Jr.25 » (Head) et « Junior IG Speed 21 » (Tennispro.fr) : aucune taille, seule la génération les sépare. Même cas pour les T-Fight Club 17 / 19 / 23 / 25 et « Boom Jr.25 » (« Jr.25 » collé). Babolat Drive Junior et Carlitos Junior portent la taille en **version**, et « Pure Drive Junior 26 » n'a pas de version 26. | Pour une raquette enfant, un nombre de 17 à 26 est lu comme la **longueur en pouces**, y compris collé à « Jr. ». Les tailles quittent les versions des familles junior. Règle numérique de la longueur : même valeur = variante, écart ≤ 0,5 = proche (27 / 27,5, Q2 inchangée), écart plus grand = **différent** (21 / 25). |
| B2 | **« Pure Drive Junior » rangée dans « Drive Junior »** (alias « drive junior »). Babolat vend les deux : Pure Drive Junior Gen11 à 119,95 €, Drive Junior à 59,95-69,95 €. | Famille à part « Pure Drive Junior » (génération Gen11). |
| B3 | **« UL » et « XL » non lus** : « Extreme MP UL » (230 €) et « Extreme MP XL » (260 €) sont lus « MP », comme « Extreme MP » (260 €). | « MP UL » et « MP XL » ajoutés aux versions d'Extreme (version = « différent »). « MP UL » existe déjà pour Speed et Boom. |
| B4 | **Taille des sacs non lue** (Head Base S / M / L, Tour S / M / L / XL, Pro X L / XL). Babolat Court la lit déjà, mais comme une version. | Nouvel attribut `taille_sac` (XS / S / M / L / XL), « différent ». Il est séparé de `contenance`, parce que certains titres écrivent les deux (« Tour Racquet S 3 Raquettes »). |
| B5 | **Types de sac non lus** : « Tour sac à chaussures » (20 €), « Key Holder » (6 €), « Gym sac » (15 €), « sac de voyage », « Court Bag », « Sport Bag ». Le « Rackpack » Tecnifibre (99,99 €) est lu comme sac à dos (69,99 €). | Types ajoutés : `sac_chaussures`, `porte_cles`, `gym`, `voyage`, `court_bag`, `sport_bag` ; « rackpack » devient un type à part. |
| B6 | **« Evo Court » rangé dans Court** (Babolat). Tennispro.fr vend « Evo Court L » et « Court L » en même temps, au même prix. | Famille à part « Evo Court » (ligne précédente). **Refusé par Mathieu** : même sac. |
| B7 | **ASMC, Leather** : le §5.3 dit « ASMC comme Y-3 » (A2), mais la note Q16 (D-2026-09-28-03) avait classé ASMC et Leather en édition « proche ». Le code ne l'a jamais appliqué : les deux sont lus « variante ». | ASMC → « différent » (A2, C-Q2 postérieure) ; Leather → « proche », comme l'écrit Q16. |
| B8 | **Longueur de short hors Nike / adidas** (point 4) : « Asics Match 7 », « Club 7 », « Mizuno Release Amplify 8 », « Flex 8.0 », « K-Swiss Hypercourt 8 », « Lotto Squadra 7 » sont lus comme numéro de génération. Ces paires sortent donc de la file de revue. Mizuno écrit ailleurs « Flex 8 pouces ». | La règle Nike / adidas (nombre de 5 à 10 dans un short = longueur) s'applique à toutes les marques. Les numéros 1 à 4 restent des numéros (« Lotto Tech 4 », « Squadra 3 »). |

## 4. Constats sans correction proposée

- **T-shirts adidas junior « Club » / « Club Climacool »** (D-2026-09-30-04) : le code fait ce qui a été décidé. L'étape 2 ter compare la médiane de chaque groupe. Le groupe « Club » réunit déjà 25 € (Tennis Point FR), 28 € (SportSystem) et 35 € (Tennispro.fr), soit une médiane de 28 € face aux 25 € du Climacool : 10,7 % d'écart, au-dessus du seuil de 10 %. Le « B Club Tee Junior Garçon » de Sport 2000 reste à part, car son genre n'est écrit que d'un côté. Proposé : ne rien changer. Une comparaison au prix le plus proche plutôt qu'à la médiane réunirait davantage, mais avec moins de garde-fou (principe R3).
- **Wilson Super Tour « Red » / « Blade Super Tour »** (§2 de R4.5-c) : pour les sacs, l'édition n'est pas comparée, et un sac n'est « identique » qu'avec la même référence (Q19, D-2026-09-27-07). La correction n'aurait d'effet que si une famille de sacs devenait « génération unique », ce que la liste validée de R4.5-c (D-2026-09-30-02) ne prévoit pas. Rien à faire.
- **« Pat Patrouille »** (sac à dos Head, Tennispro.fr) : lu « adulte ». Aucune famille n'est reconnue, donc aucun effet sur le rapprochement. Le mot rejoint le lexique enfant **du moteur** (`ageGroupOf`). Le filtre âge du site (`extractAgeGroup`, ingestion) reste dans GAP-2026-09-29-02.
- **« Homme W » (Tennispro.fr, pantalon Z.N.E.)** : un seul cas, relevé dans `R4_5_revue_textile.csv`. Pas de règle.

## 5. Réponses de Mathieu (2026-09-30, D-2026-09-30-07)

| Question | Réponse |
|---|---|
| B1 Taille junior | Lue comme longueur (17 à 26, « Jr.25 » collé compris), mais **deux tailles différentes = « proche »** (rôle actuel de la longueur), pas « différent » |
| B2 Pure Drive Junior | Famille à part |
| B3 Extreme | « MP UL » et « MP XL » ajoutées aux versions |
| B4, B5 Sacs | Taille (`taille_sac`, différent) et types, Rackpack distinct |
| B6 Evo Court | **Refusé** : « Evo Court L » = « Court L », même sac, pas de famille à part |
| B7 Leather | « proche » (Q16 appliquée) |
| B8 Shorts | Toutes les marques : 5 à 10 dans un short = longueur |
| §4 | Constats laissés sans correction |

Précision (décision mineure de Claude Code, écrite dans D-2026-09-30-07) : une longueur lue dans le titre (« + » de A1, taille junior de B1) n'est pas une caractéristique dérivée pour C-Q3. Connue d'un seul côté, elle n'est donc jamais levée.

## 6. À reporter en code (session Sonnet)

1. **A1** (`compare.ts`, `racquets.ts`) : la longueur qui vient du titre (« + », taille junior) n'est pas levée par C-Q3. Il faut marquer sa source, par exemple une source dédiée ou un indicateur, plutôt que `titre_description`, qui sert aussi aux caractéristiques lues ailleurs.
2. **A2, B7** (`config/matching-rules.ts`, `config/model-families-chaussures.ts`) : `attributeValueOverrides.edition` des chaussures reçoit `asmc: "different"` et `leather: "proche"`. « Y-3 » et « ASMC » deviennent des éditions de toutes les familles adidas chaussures du référentiel (ou une lecture commune à la marque) ; la note Q16 de Barricade est mise à jour.
3. **A3** : marqueurs « 40 » et « 30 » pour les générations 4.0 et 3.0 de Head Sprint.
4. **A4** : marqueur « palm tree » sur la génération 2025 de Head Radical (raquettes) ; l'édition « Palm Tree Crew » est retirée ou gardée selon ce que donne la lecture du marqueur.
5. **A5** (`textile.ts` ou `compare.ts`) : le `modele` textile est comparé sur ses mots triés. La signature et la file de revue utilisent la même forme.
6. **A6** : un test seulement.
7. **A7** (`config/textile-lexicon.ts`) : une seule édition pour « rg », « roland garros » et « paris ».
8. **A8** : « 3 bandes » ajouté à `TEXTILE_SUBRANGE_WORDS` (`3stripes`), lu avant le numéro.
9. **A9** : Tecnifibre ajoutée à `TEXTILE_TYPE_LAST_MERCHANTS`, contrôlée sur ses 94 titres textiles (type avant / après).
10. **A10** : la version est lue même quand l'alias la contient : sacs Babolat Pure (Aero / Drive / Strike / Wimbledon) et T-Fight junior (Club / Team / Tour).
11. **B1** (`racquets.ts`, `config/model-families.ts`) : pour une raquette enfant, un nombre de 17 à 26, isolé ou collé à « jr. », donne la longueur en pouces. Les tailles sont retirées des versions de Drive Junior, Carlitos Junior et T-Fight junior, qui gardent Club / Team / Tour. Le rôle de la longueur et sa tolérance ne changent pas : deux tailles différentes donnent « proche ».
12. **B2** : famille Babolat « Pure Drive Junior » (alias « pure drive junior », `junior: true`, génération Gen11), placée avant « Drive Junior » par la longueur de l'alias.
13. **B3** : versions « MP UL » et « MP XL » ajoutées à Head Extreme.
14. **B4, B5** (`accessories.ts`, `config/matching-rules.ts`) : `taille_sac` (« différent ») lu sur XS / S / M / L / XL comme mot isolé dans un titre de sac. Babolat Court garde ses versions XS à L : il faut choisir une seule des deux lectures pour ne pas compter la taille deux fois. Nouveaux `BAG_FORMATS` : `sac_chaussures`, `porte_cles`, `gym`, `voyage`, `court_bag`, `sport_bag`, `rackpack`.
15. **B8** (`textile.ts`) : la lecture « 5 à 10 dans un short = longueur » vaut pour toutes les marques.
16. **« Pat Patrouille »** : ajouté au lexique enfant du moteur seulement (`ageGroupOf`).
17. **Paires pièges** : celles des §2 et §3, plus « Speed Jr.25 » / « Junior IG Speed 21 » → proche ; « Speed Jr.25 » / une Speed junior sans taille écrite → proche (pas de levée C-Q3) ; « Base L » / « Racquet Base S » → différent ; « Tour sac à chaussures » / « Tour Bag XL » → différent ; « Tour Endurance Backpack » / « Rackpack » → différent ; « Evo Court L » / « Court L » → pas « différent » par la famille ; « Asics Match 7 » → longueur 7, sans numéro.
18. **Passage à blanc en prod** (`--dry-run`), comparaison avec `rapport-passage-etape4/`, relecture des modèles multi-marchands nouveaux ou défaits, puis PR ; écriture en prod après accord de Mathieu.

## 7. Report en code (session Sonnet, 2026-09-30)

Code sur la branche `feat/r4.5-etape5-corrections` (PR ouverte, engine `r4.5-etape5`). Tests : `tests/unit/matching-etape5.test.ts` (44 paires pièges, une par correction), 346 tests unitaires verts, `tsc` et `eslint` propres.

**Choix techniques laissés à la session** :

| Point | Choix |
|---|---|
| A1, B1 (longueur écrite dans le titre) | Nouvelle source d'attribut `titre_marqueur` (`ATTRIBUTE_SOURCES`, rang le plus bas) pour le « + » et la taille junior. `compare()` ne lève pas C-Q3 quand la valeur d'un côté a cette source. La signature n'est pas touchée (`longueur=27.5` / `-` différaient déjà). |
| A2, B7 (chaussures adidas) | `SHOE_BRAND_EDITIONS` (`config/model-families-chaussures.ts`) : Y-3 et ASMC lus pour toute famille adidas, **avant** la génération, pour que le « 3 » de « Y-3 » ne soit pas lu comme génération 3 (« Y-3 Avacourt »). Rôles dans `attributeValueOverrides.edition` : `asmc` différent, `leather` proche. |
| A5 (ordre des mots) | `modelWords()` (mots triés) appliquée par `token()`, donc par `compare()` et `signature()`, par la file de revue et par le contrôle des divergences (`findDivergences`) ; la valeur stockée de `modele` garde l'ordre écrit. |
| A10 (alias qui avale la version) | Champ `versionInAlias` sur la famille (Babolat sacs « Pure », T-Fight junior) : `readVersionAndStripAlias()` lit la version avant de retirer l'alias. Les autres familles dont l'alias contient une version (Lacoste L23, Dunlop SX300, balles Stage, Giant / Mid, sacs Dunlop Performance) gardent l'ancien ordre, volontairement. |
| A10, Q19 (sacs) | La version d'un **sac** est « différent » (`attributeRolesBySubcategory`) ; celle d'un antivibrateur reste « proche » (« S Logo Damp »). Sans cela, « RH12 Pure Aero » / « Pure Drive Rh12 » restait « proche ». |
| B1 (familles junior) | Tailles retirées des versions de Drive Junior, Carlitos Junior et T-Fight junior seulement (§6 point 11). Novak, Coco, Paw, Extreme / Radical / Boom Junior, Pure Aero Junior, B Fly, Ballfighter, Wimbledon Junior, Tempo Iga gardent leurs tailles en version : « Novak 19 » ≠ « Novak 25 » reste « différent » (paire R1 11). |
| B4 (Babolat Court) | XS / S / M / L quittent les versions (restent Hero, Lite) : la taille n'est lue qu'une fois, par `taille_sac`. |
| B5 (types de sac) | `knownAloneIsDifferent` (`CATEGORY_RULES.accessoires`) : `sac_chaussures`, `porte_cles`, `gym`, `voyage` connus d'un seul côté donnent « différent ». Sans cela, « Tour sac à chaussures » / « Tour Bag XL » (type écrit d'un seul côté) sortait « proche », et non « différent » comme l'attend §6 point 17. `court_bag`, `sport_bag`, `rackpack` restent « proche » face à un titre sans type. |
| A4 | Marqueurs « palm tree crew » et « palm tree » sur la génération 2025 de Radical ; l'édition « Palm Tree Crew » est retirée (jamais lue une fois le marqueur retiré). |
| « Pat Patrouille » | `ENGINE_CHILD_WORDS` dans `ageGroupOf` (moteur seulement). |

**Passage à blanc en prod** (`--dry-run --out rapport-passage-etape5`, 5 035 offres, lecture seule), comparé à `rapport-passage-etape4/` :

- Modèles 3 273 → 3 268 ; **multi-marchands 228 → 234** (textile 67 → 71, chaussures 61 → 63). Les 6 nouveaux ou modifiés relus : Head Tie-Break II (Tennis Point FR / site Head, 60 €), Head Sprint Team 4.0 (Head / Sport 2000, « SPRINT TEAM 40 »), Head Sprint Court 4.0 junior (+ Sport 2000), Asics Match 7 (Tennis Point FR / SportSystem), leggings Tecnifibre fille (45 €), débardeurs Tecnifibre Team (50 €), Avacourt Y-3 (Tennispro.fr / SportSystem, 200 €). Le modèle « Tecnifibre pantalon » perd ses deux leggings (50 €), et garde le pantalon Team Pants (60 €) de deux marchands. Aucun modèle défait à tort.
- A9, contrôlé sur les 133 offres textile du marchand Tecnifibre : **11 types changent**, tous justes (6 « Tank-top » : t-shirt → débardeur ; 5 « Legging » : pantalon → legging).
- Conflits 14 → 13 : le conflit Avacourt Y-3 (génération 3 lue sur le « 3 » de Y-3) disparaît. Modèles divergents : 12 (un faux « divergent » sur l'ordre des mots de « Tie-Break II » corrigé dans `findDivergences`).
- File de revue textile 210 → 220 paires : 12 nouvelles, dont 11 « Club 3 Bandes » (Tennispro.fr, A8) qui ne sortaient plus de la file à cause du numéro 3, et Mizuno « 7in Amplify » / « Release Amplify 8 » (longueur 7 | 8) ; 2 retirées (Tie-Break II, réuni ; un t-shirt Tecnifibre devenu débardeur).
- Proches 3 245 → 3 036 ; différents 10 343 → 10 510 (tailles junior, versions de sacs, ASMC / Y-3).

**Reste** : écriture en prod du passage `r4.5-etape5`, après accord de Mathieu.
