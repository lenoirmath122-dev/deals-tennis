# Rapport de passage du moteur fantôme — r4.4-etapes-1-2

> **Passage R4.4-bis du 2026-09-29, écrit en prod.** Vérifié d'abord sur la branche Neon `test-r4-4bis-passage` (copie de la prod), puis écrit dans la prod (tables `match_*` uniquement) : 1 passage, 1 454 modèles, 1 912 liens, 2 206 offres extraites, `deals` inchangé (4 241 `active`, 794 `tracked`, 5 269 au total). Le passage R4.4 (1 456 modèles, 90 multi-marchands) a été remplacé. Relecture des 103 modèles multi-marchands : `R4_4_controle.md` §8.
>
> Écart avec le premier passage (R4.4) : modèles 1 456 → 1 454 ; multi-marchands 90 → **103** (`active` 71 → **77**) ; raquettes 21 → **35** ; cordages 4 → 3 (tous justes) ; nouvel indicateur « modèles divergents » (2, bénins). Le premier passage est conservé dans l'historique git de ce fichier.

## 1. Compteurs

- Offres lues : **5035** (extraites 2206, catégorie non prise en charge 2829, textile : R4.5).
- Famille reconnue : **1912 / 2206** (86.7 %). Non reconnues : famille_inconnue 158, sans_famille_prevue 136.

| Catégorie | Offres lues | Famille reconnue |
| --- | --- | --- |
| chaussures | 885 | 879 |
| accessoires | 506 | 252 |
| raquettes | 574 | 545 |
| cordages | 241 | 236 |
| textile | 2829 | 0 |

## 2. Couverture (R4-Q3)

- Modèles : **1454** (liens : signature 1836, reference 72, gtin 4).
- **Modèles avec ≥ 2 marchands (active + tracked) : 103** (référence actuelle : 5 produits multi-marchands).
- **Modèles avec ≥ 2 marchands en active seulement : 77** (ce que le site pourra montrer).
- Par catégorie (active + tracked) : chaussures 60, raquettes 35, accessoires 5, cordages 3.
- Plafond famille : 106 familles chez ≥ 2 marchands ; 44 ont au moins un modèle commun (41.5 %).

## 3. Pourquoi les autres paires ne fusionnent pas

Paires inter-marchands d'une même famille (300 au plus par famille) : different 4628, proche 2655, identique 293.

| Cause (effet : attribut) | Paires |
| --- | --- |
| proche : generation | 3941 |
| different : version | 2039 |
| inconnu : poids | 1625 |
| inconnu : surface | 1241 |
| inconnu : version | 1153 |
| proche : surface | 1129 |
| different : age_group | 1103 |
| different : genre | 1086 |
| inconnu : longueur | 1014 |
| inconnu : genre | 971 |
| inconnu : jauge | 848 |
| inconnu : plan_cordage | 837 |
| inconnu : tamis | 774 |
| different : generation | 498 |
| inconnu : conditionnement | 310 |

Liste des paires « proche » : `proches.csv`.

## 4. Non reconnus (GAP-2026-09-27-01)

| Marque | Catégorie | Offres | Termes les plus fréquents |
| --- | --- | --- | --- |
| Head | accessoires | 72 | pro (16), tube (15), tour (11), prime (9), dos (8), team (6) |
| Head | raquettes | 19 | jannik (10), paw (8), foundation (5), sinner (5), iprestige (1), mp (1) |
| Babolat | accessoires | 10 | backpack (3), bag (3), dos (3), kids (3), wimbledon (2), axs (1) |
| Wilson | accessoires | 7 | dos (2), garros (2), roland (2), tour (2), ball (1), balls (1) |
| Roland Garros | accessoires | 7 | dos (4), canvas (3), duffel (1), monnaie (1), pochette (1), porte (1) |
| Babolat | raquettes | 5 | wimbledon (5), boost (1) |
| Slazenger | accessoires | 4 | carton (2), tube (2), tubes (2) |
| Wilson | raquettes | 3 | adultes (1), amateurs (1), demi (1), elite (1), federer (1), garros (1) |
| K-Swiss | chaussures | 3 | frame (2), rublo (2), speed (2), beige (1), bleu (1), clay (1) |
| Fila | accessoires | 3 | heritage (2), dos (1), duffel (1), essential (1), large (1) |
| Prince | accessoires | 3 | backpack (2), dos (2), noir (2), duffel (1), jaune (1), rose (1) |
| Head | cordages | 3 | gut (3), synthetic (3), 200m (1) |
| Paris 2024 | accessoires | 3 | dos (3), essentielle (2), 5x43x14cm (1), city (1) |
| Pro Kennex | accessoires | 2 | dos (1), triple (1) |
| Nike | chaussures | 2 | noir (2), blanc (1), challenge (1), court (1), enfants (1), pro (1) |
| Mouratoglou Apparel | accessoires | 2 | gym (1), training (1) |
| Dunlop | accessoires | 2 | indoor (1), mousse (1), roulettes (1), sachet (1), voyage (1) |
| Dunlop | raquettes | 1 | bt (1) |
| Tecnifibre | accessoires | 1 | dos (1), reform (1) |
| Solinco | accessoires | 1 | dos (1) |
| Prince | raquettes | 1 | 290g (1), tour (1) |
| Hydrogen | accessoires | 1 | duffle (1), spark (1), sport (1) |
| ADIDAS | chaussures | 1 | d (1), interieur (1), k (1), speedcourt (1), sport (1), velcro (1) |
| Yonex | cordages | 1 | noir (1), poly (1), pro (1), saitenset (1), tour (1) |
| Tecnifibre | cordages | 1 |  |

Liste complète : `non-reconnus.csv`.

## 5. Conflits et incohérences

- Conflits (même GTIN ou même référence mais familles ou attributs contradictoires, jamais fusionnés) : **11** — `conflits.csv`.
- Modèles incohérents (deux membres « différents » réunis par un identifiant) : **0**.
- Modèles divergents (contrôle indépendant de `compare()` : valeurs extraites différentes pour un même attribut chez deux membres) : **2** — `conflits.csv`.
- Alertes d'extraction : conditionnement_inconnu 9, surfaces_multiples 8, longueur_douteuse 3, lot_quantite_supposee 3.
