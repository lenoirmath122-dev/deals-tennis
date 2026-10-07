# Diagnostic des non-liens (offres presque identiques restées séparées)

**Date : 2026-10-07.** Suite de `R4_6_etat_des_lieux_regroupement.md`. Passage de prod `87987663-56cc-4fe7-adc3-2955405a716a`, périmètre accessoires, chaussures, cordages, raquettes. Lecture seule, rien n'est écrit ni codé. Constats et pistes, aucune décision.

## 1. Conclusion

**Il n'y a pas de bug.** Les 24 cas rejoués (15 offres isolées aux titres presque identiques du lot 4, 9 paires « identique » non fusionnées du lot 3) viennent tous de règles voulues du moteur sur les valeurs inconnues (D-2026-09-30-08 et D-2026-09-30-09). Ma première hypothèse, une panne unique de regroupement, était fausse. Deux mécanismes distincts, une même cause de fond : **une valeur inconnue empêche la fusion.**

## 2. Les deux mécanismes

**A. Signature privée (offres isolées du lot 4).** `signature()` (`lib/matching/compare.ts:375`) ajoute `#<dealId>` à la signature quand la génération n'est pas écrite (si la règle de la catégorie le bloque) ou qu'un attribut requis manque. L'offre ne peut plus fusionner par signature. Sur les 15 cas rejoués, 8 ont une signature privée des deux côtés (sacs Head Tour, Babolat Court L, raquettes junior Head Novak 19 et 23 ou Speed 21, cordages Amazon). Le rattrapage existe seulement pour les raquettes (étape 2 bis, `cluster.ts:237`) et pour la jauge des cordages Tennispro.fr et Head (étape 2 quater, `cluster.ts:262`).

Part des offres reconnues à signature privée : accessoires 173 sur 252, raquettes 364 sur 545, chaussures 142 sur 879, cordages 44 sur 236.

**B. Fusion refusée par la règle « toutes les paires identiques » (9 paires « identique »).** Les étapes 2 bis et 2 quater ne réunissent deux groupes que si chaque paire entre eux est « identique ». Dans chaque cas, au moins une autre paire est « indéterminé » ou « proche » :
- Head Radical MP Palm Tree (lot 3, lignes 152 et 153) et Boom MP L Neon (ligne 160) : une offre n'écrit pas l'année (génération `a2025` contre inconnue), surtout les pages du site Head.
- Cordages Babolat RPM Hurricane, Blast, Team (lignes 154 à 157) : jauge « inconnue des deux côtés » entre l'offre Tennispro.fr et celle du site Babolat. La jauge n'est traitée comme variante que chez Tennispro.fr et Head.
- Pure Drive et Pure Drive + (lignes 158 et 159) : la non-fusion est **justifiée**, ce sont deux produits ; le moteur dit « identique » sur une paire parce que le « + » n'est pas extrait.

## 3. Ampleur sur tout le périmètre

Paires « indéterminé » entre modèles distincts : **1 255**. Les motifs, par catégorie (liste des motifs les plus fréquents, donc minorants) :

| Catégorie | Motif dominant | Paires |
|---|---|---:|
| accessoires (386 au total) | génération inconnue **des deux côtés**, avec ou sans contenance, taille ou type de sac | environ 341 |
| chaussures (529) | surface connue d'un seul côté | 266 |
| chaussures | genre connu d'un seul côté | 112 |
| chaussures | génération inconnue (un côté, deux côtés) | 67 et 70 |
| raquettes (248) | génération et poids connus d'un seul côté | 62 |
| raquettes | génération inconnue des deux côtés, avec ou sans poids | environ 97 |
| cordages (92) | jauge inconnue **des deux côtés** (avec ou sans longueur) | 66 |

Ces comptages sont des paires, pas des modèles, et plusieurs paires peuvent concerner la même offre.

## 4. Pistes (non décidées)

1. **Conventions de marchand pour une valeur absente** (précédent : jauge Tennispro.fr et Head, D-2026-09-30-09). Candidats : surface absente = toutes surfaces chez Sport 2000 et SportSystem (ces marchands écrivent Clay, CLY ou OC quand c'est le cas, convention observée à la relecture, pas encore vérifiée sur les données) ; jauge non écrite = variante chez les autres marchands de cordages. Piste la plus sûre : vérifiable offre par offre, sans rouvrir le sort B.
2. **Génération inconnue des deux côtés** (accessoires, raquettes, chaussures) : traiter comme neutre ou non. C'est la plus grosse part des 1 255 paires, mais aussi la plus risquée : un sac ou une raquette sans année peut être de deux générations (D-2026-09-30-08, sort B rejeté pour 37 regroupements contradictoires). À mesurer paire par paire avant de décider.
3. **Étendre le rattrapage des étapes 2 bis et 2 quater** aux accessoires et aux chaussures, selon la décision prise en 1 et 2.
4. **Extraction** : le « + » de Pure Drive reste à corriger **avant** toute extension des fusions (sinon fausses fusions Pure Drive et Pure Drive +).

## 5. Limites

- Les 24 cas viennent d'échantillons tirés pour l'état des lieux, pas d'un tirage uniforme.
- La convention « surface absente = toutes surfaces » repose sur l'arbitrage fait pendant la relecture ; elle doit être confirmée sur les données avant toute règle.
- Le script de rejeu est dans `rapport-etat-des-lieux/diag-non-liens.ts`, ignoré par git, non versionné.
