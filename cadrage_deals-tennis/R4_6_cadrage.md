# R4.6 : analyse des erreurs et dossier de bascule

**Session** : 2026-09-30, Opus (cadrage). Aucun code modifié, rien écrit en base (lectures seules sur la prod).

**Origine** : `R4_cadrage.md` §4 (R4.6) et R4-Q6 (30 modèles de prod validés par Mathieu), R4-Q8 (option IA), T-Q4 (seuil haut textile), GAP-2026-09-27-01 (non-reconnus), GAP-2026-09-29-01 (raquettes fabricant / revendeurs). Passage de référence : `8f17143b-63c5-46c1-abd1-8f2eb75dc81c` (engine `r4.5-etape7`).

## 1. Point de départ (mesuré)

| Mesure | Valeur |
|---|---|
| Jeu R1 : précision « même modèle » | 24 / 24 (100 %) |
| Jeu R1 : rappel global | 24 / 33 |
| Jeu R1 : inter-marchands | 22 / 22 et 22 / 30 |
| Modèles multi-marchands (active + tracked) | 252 (chaussures 72, textile 71, raquettes 66, cordages 24, accessoires 19) |
| Modèles multi-marchands en `active` seulement | 147 |
| Point de départ du chantier (algorithme actuel) | 5 produits |
| Paires indéterminées (sort A) | 1 446 |
| Offres non reconnues | 313 (famille inconnue 174, sans famille prévue 136, marque inconnue 3) |
| Conflits / incohérents / divergents | 13 / 2 / 13 |

## 2. Échantillon de 30 modèles de prod (R4-Q6)

**Tirage** : les 252 modèles à au moins 2 marchands du passage `8f17143b…`, triés par identifiant, mélangés avec une graine fixe (20260930, mulberry32), 30 premiers. Répartition obtenue : chaussures 10, textile 7, raquettes 7, cordages 3, accessoires 3. Détail offre par offre (titre, marchand, prix, référence, URL) : `R4_6_echantillon.csv`, colonne `decision_mathieu` remplie (§5).

**Grille** : §4 bis du cadrage du rapprochement (D-2026-09-29-06). Un modèle n'est juste que si ses offres sont identiques deux à deux.

**Proposition de Claude Code** (relecture des 30 modèles ; fiches lues sur le web pour les cas douteux : Tennis Point FR ×3, recherche de la référence adidas IG1679 et Nike DC0621) :

| Verdict proposé | Modèles | Catégories |
|---|---|---|
| Identique | 23 | chaussures 9, raquettes 6, cordages 3, accessoires 3, textile 2 |
| **Faux** | **2** | textile 2 |
| À confirmer par Mathieu | 5 | raquettes 1, chaussures 1, textile 3 |

### 2.1 Les deux faux (textile)

- **n° 6, jupe adidas Club femme** : Tennis Point FR vend deux jupes « Club Jupe Femmes blanc » différentes : 100 % polyester Aeroready (13,95 €) et 90 % polyester / 10 % élasthanne (27,95 €) (fiches lues le 2026-09-30). Aucune ne porte d'année ni de référence. C'est la génération textile non écrite : même nom, deux fiches techniques.
- **n° 12, short adidas Club homme** : Sport 2000 écrit seulement « Short Homme Club » pour la référence JG0994 (Club Stretch Woven Climacool, 2025). La référence la relie au SportSystem JG0994 ; la signature « club » la relie aux shorts Club SW Aeroready de 2021 (GL5409, GH7222). Le contrôle indépendant l'a déjà signalé (`incoherent` dans `conflits.csv`), mais le modèle reste réuni.

### 2.2 Les cinq cas à confirmer

- **n° 8, Babolat Evo Drive Lite Gen2** : « Evo Drive Lite White » (102548 / 101548) et « Evo Drive Lite » (102547 / 101547) réunis. White = coloris (identique) ou version (différent) ?
- **n° 11, Babolat Propulse Junior 3 All Court** : Boy et Girl réunis (genre non écrit chez les enfants), saisons 2025 (3K2S25A478, que Sport 2000 nomme « Junior 3 ») et 2026 (…F26…).
- **n° 20, pantalon Nike Court Heritage homme** : SportSystem DC0621 (pantalon « suit » Heritage) ; Tennis Point FR sans référence (pantalon de survêtement Dri-FIT à zips, crème / orange). Nike vend aussi un autre « Court Heritage » (FZ6928).
- **n° 25, short adidas Club junior** : shorts de quatre saisons (2022 à 2026), « Club » et « Club 3S » réunis par D-2026-09-30-01 (prix proches).
- **n° 27, veste Tecnifibre Tour femme** : Tecnifibre 21WTOUJA41 (collection 2021 ?) et Tennis Point FR sans référence.

### 2.3 Ce que l'échantillon dit déjà

1. **Hors textile : 23 modèles, 0 faux**, 2 à confirmer (n° 8, 11). La précision y est au niveau du jeu R1.
2. **Textile : 7 modèles, 2 faux, 3 à confirmer, 2 justes.** Même si les 3 cas sont justes, 5 / 7. La cause est la même que celle des indéterminés textile (§5 de `R4_5_etape7_indetermines.md`) : sans référence ni GTIN, un nom commercial (« Club ») couvre plusieurs fiches techniques d'une saison à l'autre.
3. **Un modèle signalé « incohérent » reste réuni** (n° 12). Le contrôle signale, il ne sépare pas.
4. **Raquettes cordée / non cordée** (n° 8, 13, 26) : réunies comme variantes, conformément au §4 bis ; à la bascule (R5), le prix ne peut se comparer qu'à option égale (écart de 10 € chez Babolat et Tennispro.fr). À noter pour R5, sans effet sur la précision.

Sur l'échantillon entier : **23 à 28 justes sur 30 (77 % à 93 %)**, sous l'objectif de 95 %, entièrement à cause du textile.

## 3. Découpage proposé de R4.6 (une étape par conversation)

| Étape | Contenu | Modèle |
|---|---|---|
| **R4.6-a** (cette session) | Cadrage, tirage et relecture de l'échantillon, décisions de Mathieu sur les 30 modèles. | Opus |
| **R4.6-b** | Suite à donner à l'échantillon : sort du textile à la bascule, séparation des modèles incohérents (selon les réponses ci-dessous). Si du code en découle : report en Sonnet. | Opus puis Sonnet |
| **R4.6-c** | Repérage des non-reconnus (GAP-2026-09-27-01) : règles tranchées sur les 313 offres. | Opus |
| **R4.6-d** | Dossier de bascule : mesure finale, option IA (R4-Q8), seuil haut textile (T-Q4), GAP-2026-09-29-01, décision de bascule. **Arrêt.** | Opus |

## 4. Questions pour Mathieu

- **Q1** : les 23 verdicts « identique » et les 2 « faux » proposés sont-ils validés ?
- **Q2** : verdicts sur les 5 cas du §2.2.
- **Q3** : découpage du §3.

## 5. Réponses de Mathieu (AskUserQuestion, 2026-09-30, D-2026-09-30-10)

- **Q1** : les 23 « identique » et les 2 « faux » (n° 6 et 12) sont validés tels que proposés.
- **Q2** : les 5 cas à confirmer sont **tous identiques** (n° 8 : « White » est un coloris ; n° 11 : Boy / Girl et saisons 2025 / 2026, même article ; n° 20, 25, 27).
- **Q3** : découpage du §3 validé (R4.6-a à R4.6-d).

**Précision mesurée sur l'échantillon** : **28 / 30 (93,3 %)**, sous l'objectif de 95 %.

| Catégorie | Modèles | Justes | Précision |
|---|---|---|---|
| Hors textile | 23 | 23 | 100 % |
| Textile | 7 | 5 | 71 % |

Avec le jeu R1 (24 / 24) : hors textile, aucune erreur sur les deux jeux ; les deux erreurs sont textiles, de même cause (nom commercial sans référence couvrant deux fiches techniques, et pont par une référence pour le n° 12).

**Prochaine étape : R4.6-b** (Opus) : suite à donner (sort du textile à la bascule, séparation des modèles signalés incohérents).
