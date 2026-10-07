# État des lieux du regroupement (accessoires, chaussures, cordages, raquettes)

**Date : 2026-10-07.** Passage de prod `87987663-56cc-4fe7-adc3-2955405a716a` (engine `r4.6-b`, 4 011 modèles, 4 732 liens, 5 035 offres). Textile exclu du périmètre à la demande de Mathieu. Lecture seule : rien n'a été écrit en base, aucune règle n'a été modifiée. Ce document constate ; il ne décide pas. Toute règle nouvelle passera par un cadrage et une décision à part.

## 1. Méthode et limites

- **Arbitrage par IA, pas par Mathieu.** Mathieu a délégué la relecture (« à toi de relire et d'arbitrer avec cohérence »). Deux agents ont jugé avec une grille commune ; une dizaine de verdicts ont été revérifiés dans les CSV, pas les autres. Les chiffres ci-dessous sont des ordres de grandeur à confirmer, pas des mesures certifiées.
- **Grille.** Même article au niveau modèle = même marque, gamme, génération ou année, version, public. Variantes (donc réunies) : coloris, poids, taille, longueur, tamis, cordée ou non. Éditions limitées ou collab : « douteux ». La surface (terre battue ou toutes surfaces) est traitée comme une version : environ 22 paires du lot 3 passeraient de « séparer » à « réunir » si on la traitait comme une variante.
- **Tirage.** Graine fixe 20261007. Paires recalculées sans plafond, puis tirées par strate : les taux par strate ne se somment pas en taux global. Scripts et lots : `rapport-etat-des-lieux/` (ignoré par git).
- **Plafond du rapport.** Le rapport du moteur plafonne les paires diagnostiques à 300 par famille (`lib/matching/report.ts:31`). 20 familles sur 180 dépassent ce plafond (mesure SQL en lecture seule, `rapport-etat-des-lieux/mesures-hors-paires.mjs`, non versionné : 22 865 paires théoriques pour 14 099 comparées), surtout en textile. Le plafond ne touche que le rapport, pas `buildModels`. Hors textile, il y a 10 121 paires inter-marchands sans plafond.

## 2. Précision : les modèles réunis (lots 1 et 2, 139 modèles)

Lot 1 : 90 modèles multi-marchands actifs, en entier (chaussures 52, raquettes 27, cordages 9, accessoires 2). Lot 2 : 49 modèles sur 91 autres.

| Verdict | Modèles |
|---|---:|
| ok | 122 |
| douteux | 17 |
| faux avéré | 0 |

- Aucune confusion avérée de génération, de version, de gamme ni de nature. Cordages : 17 sur 17 ok.
- **11 des 17 douteux sont des éditions limitées** (Pegula, Zverev, Tsitsipas, Wimbledon, US Open, Open d'Australie, Spectra) réunies avec le modèle standard, parfois 10 à 15 € d'écart de prix (M90, M95, M150, M297, M337, M531, M691, M699, M2253, M2399, M303).
- M37 (Babolat Pulsion Kid Girl et Boy) : classé « faux » par l'agent, retenu ici « douteux ». Probablement la même chaussure en deux coloris ; le genre n'est pas renseigné chez les enfants.
- M131 : Head Sprint Pro 4.0 « SF » à 180 € réuni au standard à 160 € (sens de « SF » toujours inconnu). M92 : Endure Pro à 220 € contre 180 €, l'hypothèse « BOA » n'est attestée par aucun titre.
- M1993 et M2444 : deux modèles portent les mêmes deux offres (mêmes titres, mêmes prix). Cause non établie.

## 3. Rappel : ce qui n'a pas été réuni (lot 3, 159 paires)

| Strate | Paires | Réunir (moteur à tort) | Séparer (moteur a raison) | Douteux |
|---|---:|---:|---:|---:|
| proche | 50 | 2 | 46 | 2 |
| indéterminé | 50 | 21 | 15 | 14 |
| différent sur 1 attribut | 50 | 1 | 43 | 6 |
| identique, non fusionné | 9 | 5 | 2 | 2 |
| **Total** | **159** | **29** | **106** | **24** |

Les séparations du moteur sont donc justes dans l'ensemble : 46 sur 50 en « proche », 43 sur 50 en « différent sur un attribut ». Les 1 255 paires « indéterminé » du pool sont le gisement : 21 des 50 tirées sont de vrais doublons.

**Causes des 29 « à réunir »**

1. **Une valeur inconnue des deux côtés bloque la fusion (21 cas, strate « indéterminé »).** Cordages : jauge « ? | ? » sur 7 paires sur 7. Chaussures : surface ou génération inconnue (10 sur 18). Sacs : génération « ? | ? » (3). Raquettes : poids « ? | 310 » (1). Constat à rapprocher de D-2026-09-30-09 : le sort B (réunir les indéterminés) avait été rejeté pour 37 regroupements contradictoires par transitivité. Distinguer « inconnu des deux côtés » de « inconnu d'un seul côté » n'y avait pas été testé.
2. **Paires « identique » non fusionnées (5 cas)**, dont 4 cordages Babolat RPM (Hurricane, Blast, Team chez Tennispro.fr et SportSystem) et Head Boom MP L Neon 2025. Défaut de regroupement, pas d'attribut.
3. **Poids écrit dans le titre (2 cas, écart de 5 g ou moins)** : TF-X1 V2 300 g et 305 g.
4. **Longueur de bobine (1 cas)** : RPM Blast 100 m et 200 m. À arbitrer avec la politique de conditionnement.

Cas à ne pas corriger à la légère : 6 paires de raquettes Tecnifibre TF-X1 V2 à poids très différents (275 et 255 g, 300 et 255 g, 270 et 300 g...) classées « douteux ».

**L'état « identique » n'est pas fiable dans les deux sens.** Le moteur juge aussi « identique » deux paires qui diffèrent : Pure Drive + contre Pure Drive (le « + » n'est pas extrait) et Radical MP Palm Tree Crew contre la version standard (la collab n'est pas reconnue). Corriger les 5 paires non fusionnées sans corriger l'extraction créerait de fausses fusions.

## 4. Hors des paires : offres isolées (lot 4, 100 offres sur 1 575)

Pool : chaussures 544, accessoires 466, raquettes 398, cordages 167. Offres isolées = modèle à un seul marchand, ou offre sans modèle.

| Strate de similarité des titres | Offres | Jumelle | Douteux | Pas de jumelle |
|---|---:|---:|---:|---:|
| 0,7 ou plus | 35 | 19 | 5 | 11 |
| 0,5 à 0,7 | 35 | 11 | 9 | 15 |
| moins de 0,5 | 30 | 2 | 0 | 28 |
| **Total** | **100** | **32** | **14** | **54** |

- Extrapolation grossière aux pools des strates : environ 60 jumelles pour la strate forte (114 offres) et 140 pour la strate moyenne (451). La strate faible (1 010 offres) repose sur 2 cas sur 30 ; son estimation est trop incertaine pour être chiffrée. Ce sont des offres, pas des modèles.
- **Cause des 32 jumelles manquées :** titres quasi identiques avec famille reconnue, mais aucun lien (15 cas, plusieurs en accessoires, par exemple Babolat Court L chez Babolat et Tennispro.fr à similarité 1,00) ; longueur traitée comme différence (5) ; coloris, édition ou libellé (5) ; taille de sac (4) ; famille non reconnue (2) ; poids (1). **Cause racine des 15 cas non établie** : à investiguer avant toute règle.
- Marque en cause : 0 cas. Identifiants : aucune des 313 non reconnues (toutes catégories, textile compris) n'a de jumelle chez un autre marchand par GTIN (10 offres avec GTIN) ni par référence ou SKU (290 offres avec référence). Mesure SQL en lecture seule, script `rapport-etat-des-lieux/mesures-hors-paires.mjs`, non versionné ; le rapport du moteur ne la porte pas.

## 5. Identifiants partagés entre modèles distincts (hors textile)

Trois cas : GTIN de la Wilson Shift 99L US Open (deux modèles, tous deux chez SportSystem), GTIN de la Prince Beast 100 280 LTD (idem), SKU de la RPM Rough 200 m (SportSystem et Babolat). Aucune référence fabricant (`mpn`) commune à plusieurs modèles. Un quatrième cas est une collision de SKU entre catégories (SKU Tennispro.fr 811435 : T-shirt Head Rainbow et chaussures adidas Solematch Control 2) ; il n'est pas un oubli de regroupement. Les deux cas de GTIN et de SKU restants du fichier concernent le textile.

## 6. Points d'extraction relevés

- Éditions (Spectra, Palm Tree, Wimbledon, Zverev, LTD) non classées ; aucune distinction avec un simple coloris comme Neon.
- Année lisible dans l'URL head.com (2026) non lue (lot 3 : lignes 52 et 61 ; lot 4 : lignes 2 et 23).
- Public absent du titre chez Tennispro.fr (Barricade) ; surface absente chez Sport 2000 et SportSystem, lue « toutes surfaces » dans l'arbitrage.
- Codage de la génération incohérent (Ubersonic 5 codé `a2025` ou `l5`, Gel-Resolution X codé `lx` ou `a2026`) ; plusieurs raquettes sans génération.

## 7. Pistes (non décidées, à cadrer avant tout code)

1. Distinguer « inconnu des deux côtés » de « inconnu d'un seul côté » (jauge des cordages, surface, génération) : tester sans rejouer le sort B de D-2026-09-30-09.
2. Rechercher la cause des 15 offres isolées aux titres presque identiques.
3. Politique des variantes : poids (seuil à fixer, 5 g contre 20 g et plus), taille de sac, longueur de cordage et de raquette junior, conditionnement des cordages.
4. Corriger l'extraction avant les « identique » non fusionnés (« + » de Pure Drive, collabs).
5. Éditions limitées : décider s'il s'agit d'un modèle distinct.
6. Surface : confirmer qu'elle reste une version (22 paires du lot 3 en dépendent).
7. Dédoublonner M1993 et M2444 une fois la cause trouvée.

## 8. Ce que le document ne dit pas

Pas de recommandation sur la bascule : elle reste à Mathieu. Pas de taux de précision global publiable : l'échantillon de modèles est sans faux avéré, mais 17 douteux sur 139 et un arbitrage fait par IA.
