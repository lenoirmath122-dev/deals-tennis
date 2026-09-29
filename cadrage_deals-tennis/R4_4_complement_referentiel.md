# R4.4 — Première mesure du moteur (étapes 1 et 2) et points à valider

> **Points §3 validés par Mathieu le 2026-09-29 (« je valide tout »).** La comparaison (`lib/matching/compare.ts`), le regroupement (`cluster.ts`), le rapport (`report.ts`) et le script (`scripts/matching/shadow-run.ts`) sont écrits et testés sur le jeu R1 figé. Premier passage réalisé le 2026-09-29 : essai sur une branche Neon temporaire, puis écriture en prod (rapport : `R4_4_rapport_passage.md`).

## 1. Mesure sur le jeu R1 (67 paires : 32 identiques / 15 proches / 20 différents)

| | Algorithme actuel | Moteur R4.4 |
|---|---|---|
| Précision « même modèle » | 5 / 8 = 62,5 % | **9 / 9 = 100 %** |
| Rappel global | 5 / 32 = 15,6 % | **9 / 32 = 28 %** |
| Inter-marchands (29 paires identiques) | 2 / 29 | **8 / 29** (précision 8 / 8) |
| Paires « différent » jugées identiques | 2 (28, 29) | **0** |

Objectif du cadrage : précision ≥ 95 % : atteint sur ce jeu (le faux positif de la paire 14 est corrigé, §3.1), avec la réserve de la petite taille du jeu ; l'échantillon de 30 modèles de prod (R4.6) tranchera.

**Pourquoi le rappel reste bas.** Sur les 23 identiques manquées :

| Cause principale | Paires | Nb |
|---|---|---|
| Textile, pas encore pris en charge (R4.5) | 13, 18, 19, 54, 57, 58, 60 | 7 |
| Génération non écrite ou écrite d'un côté seulement (règle stricte R4-Q4 : raquettes, chaussures, sacs), parfois avec d'autres attributs inconnus | 5, 27, 30, 36, 39, 41, 42, 52 | 8 |
| Poids, tamis, plan de cordage ou longueur inconnus d'un marchand (fiche SportSystem complète face à un titre sans détail) → « proche » | 1, 2, 12 | 3 |
| Cordages : jauge ou conditionnement absents d'un côté ou des deux | 32, 65, 66, 67 | 4 |
| Genre non écrit d'un côté (chaussures) | 49 | 1 |

Les paires 32 et 65 sont **sacrifiées volontairement** par la règle des attributs requis (§3.3) : sans elle, la 32 serait trouvée mais la paire 25 (« proche » attendu) deviendrait un faux positif : 10 / 11 au lieu de 9 / 9. Précision d'abord (principe R3).

Rappel « atteignable » (R4-Q6, paires dont l'information nécessaire est dans les données capturées) : **une seule paire l'était** (63, jauge lisible dans la fiche SportSystem), corrigée en R4.4. Toutes les autres manquent d'une information qu'**aucun marchand ne donne** (ou que seule une connaissance extérieure, comme dans les paires 32 et 65, permet de deviner). Le plafond vient donc des règles (« inconnu d'un côté → proche »), pas de la qualité de l'extraction.

**Levier à décider en R4.5 / R4.6 (pas fait ici)** : compléter une valeur inconnue par la valeur **dominante observée** sur la même famille + version + génération chez les autres marchands (ex. Pure Strike 100 : 16x20 partout). Cela peut relever le rappel, au prix d'un risque de précision à mesurer sur l'échantillon de 30 modèles (R4-Q6).

## 2. Comportement de la comparaison (règles du référentiel, appliquées telles quelles)

- Étape 1 : même GTIN, puis référence fabricant partagée (majuscules et chiffres seulement, ≥ 5 caractères dont un chiffre) → « identique ». Contradiction franche (familles ou attributs « différent ») → **conflit** : niveau « proche », jamais fusionné, listé dans `conflits.csv`.
- Étape 2 : même famille ; rôle `variante` / `proche` / `différent` de `CATEGORY_RULES` ; poids ±10 g ; attribut connu d'un côté seulement → « proche » ; absent des deux côtés → égal ; génération selon R4-Q4 (cordages et accessoires hors sacs : génération unique par défaut ; raquettes, chaussures, sacs : « proche » si non écrite).
- Regroupement : composantes connexes des liens GTIN, référence, signature. Une offre de famille reconnue a toujours un modèle (le sien, à défaut). Une offre non reconnue n'en a un que si elle partage un GTIN ou une référence.
- La signature est construite pour que « même signature » ⇔ « identique à l'étape 2 » (vérifié par test sur les 123 offres du jeu R1).

## 3. Points à valider (choix non dictés par le cadrage)

1. **Paire 14, alias du référentiel — appliqué.** L'alias `s logo damp` est retiré de `Logo Damp` et remplacé par la version « S » (`model-families-accessoires.ts`) ; `version` devient un attribut « proche » des accessoires (`CATEGORY_RULES.accessoires`). « S Logo Damp » face à « Logo Damp » donne « proche ». Précision du jeu R1 : 9 / 9.
2. **`type_sac: "different"`** ajouté à `CATEGORY_RULES.accessoires` (proposition de `R4_3_complement_referentiel.md` §2, lue seulement si écrite dans le titre). À retirer si tu refuses.
3. **Attributs requis** (choix R4.4) : pour les cordages, `jauge` et `conditionnement` absents **des deux côtés** = « proche » (paire R1 25 : la jauge est un choix de la fiche) ; pour les balles, `lot` absent des deux côtés = « proche ». Partout ailleurs, absent des deux côtés = égal. Sans cette règle, la paire 25 serait un second faux positif.
4. **`lot` absent = 1 article** (question laissée ouverte en R4.3), sauf balles où le nombre n'est pas toujours écrit.
5. **Garniture** : 11 à 13 m regroupés (12 m et 12,2 m = même garniture, paire 66). Non prévu dans `CATEGORY_RULES.cordages.longueur` (« différent » sans tolérance).
6. **Jauge lue dans la fiche SportSystem** (groupe « Jauge » des variantes) quand le titre n'en donne pas ; plusieurs jauges = alerte `jauges_multiples`, traitées comme « au choix » (jamais identique à une jauge unique). Extension de l'extraction R4.2.
7. **`generationUnique`** : champ facultatif ajouté au type `FamilyEntry` pour lever la règle stricte famille par famille (R4-Q4). **Aucune famille marquée** : la liste est à proposer à partir du premier rapport de passage.
8. **Année face à un libellé de génération sans année** (ex. « 2025 » et « Gen 11 » quand le référentiel ne note pas l'année) : « proche », pas « différent ».

## 4. Non traité ici

- Textile (57 % des offres) et étape 3 (score, seuils `CONFIDENCE_THRESHOLDS`) : R4.5.
- Mesure de couverture réelle, liste des non-reconnus, analyse des blocages sur toute la prod : premier passage du script.
- Gourdes et « autres accessoires » : hors référentiel.

## 5. Premier passage sur la prod (2026-09-29)

Détail dans `R4_4_rapport_passage.md`. En bref : 5 035 offres lues, famille reconnue pour 1 912 des 2 206 offres hors textile, **90 modèles avec ≥ 2 marchands** (5 aujourd'hui) dont **71 en `active` seulement** ; 40 des 106 familles présentes chez ≥ 2 marchands ont un modèle commun. 11 conflits (surtout « pack de 2 raquettes » qui partage le GTIN de la raquette seule, jamais fusionnés), 0 modèle incohérent. Cause de blocage n°1 : génération non écrite (« proche : generation », 3 941 paires), puis version, poids et surface inconnus.
