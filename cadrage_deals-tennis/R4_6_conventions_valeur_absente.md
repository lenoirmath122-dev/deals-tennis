# Cadrage : conventions de valeur absente par marchand

**Date : 2026-10-07.** Suite de `R4_6_diagnostic_non_liens.md`. Passage de prod `87987663-56cc-4fe7-adc3-2955405a716a`, périmètre accessoires, chaussures, cordages, raquettes. Lecture seule : aucune règle codée, aucune écriture en base. Ce document propose ; les décisions restent à Mathieu. Il a été relu par un agent `architect` (critique contre le code) et un `reviewer` (chiffres) ; leurs remarques sont intégrées.

## 1. Question

Quand un marchand n'écrit pas une caractéristique, le moteur la compare ainsi : absente des **deux** côtés, elle vaut « égale » (sauf pour les attributs requis : jauge, conditionnement, génération) ; connue d'**un seul** côté, elle rend la paire « indéterminé » et bloque la fusion (D-2026-09-30-08). Certains marchands n'écrivent la caractéristique que lorsqu'elle sort de l'ordinaire : l'absence veut alors dire « valeur par défaut ». Précédent en production : jauge non écrite chez Tennispro.fr et Head = variante de la fiche (D-2026-09-30-09). But : relever les cas de ce type, les tester, ne retenir que ceux qui tiennent.

## 2. Méthode et critères d'acceptation

Quatre épreuves, les mêmes pour chaque candidat :

1. **Distribution.** Valeurs réellement écrites par ce marchand pour l'attribut. Une convention de type « valeur par défaut » est crédible si cette valeur n'est jamais ou presque jamais écrite explicitement. Pour une convention de type « variante de fiche » (jauge), le critère est plutôt : la jauge se choisit-elle sur la fiche ?
2. **Vérité terrain.** 580 paires inter-marchands dont l'identité est établie par GTIN ou référence : quelle valeur écrit l'autre côté quand le marchand étudié n'écrit rien ? Sans cette épreuve, pas de « Retenir ».
3. **Simulation.** Attribut rempli en mémoire (aucun code modifié), moteur rejoué sur les 5 035 offres : 0 modèle incohérent, 0 modèle coupé, divergences et conflits inchangés, relecture de chaque modèle nouveau ou modifié.
4. **Liens perdus.** Nombre de modèles existants séparés et de paires qui ne sont plus ensemble. Distinct du critère « coupé » : une convention peut défaire un lien sans contradiction, parce qu'une valeur absente des deux côtés (égale) devient connue d'un seul côté (indéterminée).

Base rejouée : 4 011 modèles, 181 modèles multi-marchands hors textile, 13 conflits, 13 divergences, 0 incohérent, 0 coupé. Identique à la prod.

## 3. Résultats par candidat

| Candidat | Distribution | Vérité terrain | Multi-marchands hors textile | Liens perdus | Verdict |
|---|---|---|---|---|---|
| **C2** genre absent = homme, chaussures Tennispro.fr (hors enfants) ; 51 offres touchées | 63 « femme », 0 « homme », 62 absents (dont 11 enfants exclus) | 8 sur 8 « homme » | 181 → 184 | 0 | **Retenir** |
| **C3b** jauge non écrite = variante de la fiche, cordages **Babolat seul** ; 22 offres touchées | jauge écrite : 1 offre sur 23 | 7 sur 7 : l'autre côté écrit des jauges différentes (1,20 à 1,35) pour un même produit | 181 → 187 | 0 | **Retenir** |
| C3 jauge non écrite = variante, Amazon | jauge écrite : 6 sur 28 ; titres à jauge fixe écrite en nombre seul (voir 4) | aucune | – | – | **Écarter** |
| **C1** surface absente = toutes surfaces, chaussures Sport 2000 et SportSystem ; 107 offres touchées | mélangée : Sport 2000 23 « toutes surfaces », 10 « terre battue », 52 absents ; SportSystem 28 « toutes surfaces », 34 « terre battue », 55 absents | 7 sur 7 « toutes surfaces » (petit effectif) ; ni l'URL ni les données structurées n'ajoutent d'information | 181 → 188 | **5 modèles séparés, 28 paires** | **Reporter** |
| **C4** chaussures enfant : genre ignoré | sans objet | sans objet | 181 → 181 | 0 | Abandonner (aucun effet) |
| **C5** raquettes Head : année lue dans l'URL ; 1 offre sur 135 écrit la génération | – | génération connue de l'autre côté dans 17 paires, dont 13 avec une année | 181 → 179 | – (conflits 13 → **17**) | **Reporter** |

**Combinaison recommandée, C2 + C3b : 181 → 190** modèles multi-marchands hors textile (16 nouveaux ou modifiés, 7 disparus ou absorbés), 3 995 modèles au total, 0 incohérent, 0 coupé, 0 lien perdu, 13 conflits et 13 divergences inchangés. Pour mémoire, C1 + C2 + C3b donnerait 197 mais avec les 28 paires perdues de C1.

Le nombre total de modèles baisse de 16 (4 011 → 3 995) ; les chiffres « nouveaux » et « disparus » comptent des modèles multi-marchands du périmètre, pas tous les modèles (les fusions touchent aussi des modèles à un seul marchand).

## 4. Détail et réserves

**C2 (genre, Tennispro.fr).** Tennispro.fr n'écrit « Femme » que pour les femmes et n'écrit jamais « Homme ». Les 5 modèles touchés ont été relus : justes (Defiant Speed 2, Courtjam Control 3, Barricade 14, Courtflash Speed 2, GameCourt 2). Contrôle des titres des 51 offres remplies : aucun marqueur « W », « Wmns », « femme » ni de marqueur junior (les 11 titres « Junior » sont des enfants, exclus). Aucun conflit nouveau. Risques résiduels signalés par la critique : un titre à une seule lettre « W » ou « M » est ignoré par l'extraction (`shoes.ts:31`), la détection d'âge repose sur un défaut « adulte » (`shoes.ts:106`), et le genre a le rôle « différent » : une valeur supposée fausse transformerait un lien par GTIN en conflit. À couvrir par des paires pièges dans les tests.

**C3b (jauge, Babolat seul).** Même mécanisme que le précédent de D-2026-09-30-09. 11 modèles nouveaux ou modifiés relus : aucune fusion fausse repérée, les longueurs (12 m, 100 m, 200 m) restent séparées. Point de vigilance (critique) : une offre sans jauge perd sa signature privée et fusionne dès l'étape 2, sans la garde de l'étape 2 quater ; deux offres Babolat de jauges fixes différentes, toutes deux sans jauge lue, formeraient un modèle. À vérifier sur les fiches Babolat avant le code.

**C3 Amazon : écarté.** Amazon écrit parfois la jauge en nombre seul (« 17 », « 16 NT », « Revolve Spin 16 ») que l'extraction ne lit pas (`strings.ts:69`, `134`) ; ces offres recevraient à tort l'alerte « variante » et pourraient rejoindre l'unique groupe 1,25 de l'étape 2 quater. Aucune vérité terrain pour Amazon, et une place de marché a souvent une fiche par jauge. À reprendre seulement après lecture de ces jauges.

**C1 (surface).** Les 18 modèles nouveaux ou modifiés relus sont plausibles, mais la convention n'est pas prouvée : ces marchands écrivent aussi « toutes surfaces » explicitement, et SportSystem écrit plus souvent « terre battue » (34) que « toutes surfaces » (28). 17 des 18 modèles appartiennent à une famille qui existe aussi en terre battue. **Elle défait aussi des liens existants** : 5 modèles réunis aujourd'hui sont séparés (par exemple Head Endure Pro Boa entre SportSystem et le site Head, Head Sprint Team 4.0 entre le site Head et Sport 2000), parce qu'une surface absente des deux côtés (égale) devient connue d'un seul côté (indéterminée). Gain net en modèles multi-marchands : 7, mais au prix de 28 paires perdues. Avant de reprendre C1 : contrôler une dizaine de fiches sans marqueur sur des modèles qui existent en terre battue (Gel-Resolution X, Rush Pro 5), vérifier que la valeur remplie est exactement `toutes_surfaces`, et traiter le cas « un côté seulement » (marchands qui n'écrivent pas la surface). « indoor » n'est pas un marqueur reconnu (`config/model-families-chaussures.ts:28-34`).

**C5 (année dans l'URL Head).** Une fois l'année connue, des éditions différentes sont fusionnées : Boom MP L « Alternate » avec Boom MP L, Boom MP UL et Boom MP « Alternate » de même, Prestige MP avec Prestige MP L. À reprendre après extraction de l'édition (« Alternate » et les éditions limitées de l'état des lieux).

## 5. Non traités

- **Génération inconnue des deux côtés** (environ 341 paires en accessoires, 97 en raquettes, 70 en chaussures) : aucune vérité terrain, aucune paire d'accessoires liée par GTIN ou référence. Piste à mesurer séparément : même titre et même prix.
- **Poids, longueur, tamis, plan de cordage** (raquettes) connus d'un seul côté : traités par l'étape 2 bis, bloqués par la règle « toutes les paires identiques » quand la génération reste indéterminée.
- **Type, taille et contenance des sacs** connus d'un seul côté : pas de vérité terrain.

## 6. Cadre de cohérence proposé pour toute convention

Chaque convention est une ligne d'un tableau unique : marchand, catégorie, attribut, valeur par défaut, preuves (distribution, vérité terrain, liens perdus, date). Points corrigés par la critique :

- Le critère n'est pas « absent du titre » mais **« absent après toute l'extraction »** : le genre de Sport 2000 vient de la fiche (`shoes.ts:84-88`), la surface et le genre du site Head viennent de l'URL (`shoes.ts:96-124`). La convention s'applique en dernier ; l'extraction écrase sans condition (`shared.ts:12-13`), donc seule la place de la convention dans le code, protégée par un test, l'empêche d'écraser une valeur écrite. Le rang des sources ne protège pas : il ne sert qu'à choisir les attributs canoniques (`cluster.ts:98-117`), `compare()` l'ignore (sauf `titre_marqueur`).
- Une valeur remplie par convention pèse donc comme une valeur écrite dans toutes les comparaisons. Pour qu'elle reste auditable et ne se confonde pas avec les lectures d'URL du site Head, ajouter une source dédiée « convention » à `ATTRIBUTE_SOURCES` (`url` n'est d'ailleurs pas la moins fiable : `prix` vient après).
- Les attributs canoniques d'un modèle peuvent publier un genre ou une surface « connu » qui n'est qu'une supposition ; à égalité de source, le canonique est la première offre par identifiant (`cluster.ts:112`). Point à trancher avant le code.
- Chaque convention est couverte par des paires pièges dans les tests et par un passage à blanc relu avant toute écriture en prod.

## 7. Recommandation et suite

1. Retenir **C2** et **C3b (Babolat seul)**.
2. **Reporter** C1 (non prouvée, 28 paires perdues), **écarter** C3 pour Amazon (jauges en nombre seul), **abandonner** C4, **reporter** C5 (extraction de l'édition d'abord).
3. Si Mathieu valide : décision consignée, code (Sonnet) dans `lib/matching`, tests, passage à blanc en prod (lecture seule), relecture, et seulement ensuite écriture en prod avec accord explicite de Mathieu.

## 8. Limites

- Simulation faite en remplissant les attributs en mémoire, pas avec du code livré.
- Relecture des modèles nouveaux ou modifiés faite par moi, pas par Mathieu ; listes dans `rapport-etat-des-lieux/simulation-conventions.md` et `simulation-conventions-2.md` (ignorés par git).
- Vérité terrain de faible effectif sur la surface (7 paires) et le genre (8) ; aucune pour les accessoires ni pour Amazon.
