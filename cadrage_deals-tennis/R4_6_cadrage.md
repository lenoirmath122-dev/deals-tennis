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

## 6. R4.6-b : sort du textile et des modèles signalés

**Session** : 2026-09-30, Opus. Lecture seule : moteur `r4.5-etape7` rejoué en mémoire sur les 5 035 offres de la prod (résultat identique au passage `8f17143b…` : 3 181 modèles, 252 multi-marchands, 147 en `active`), fiches Babolat lues. Aucun code modifié, rien écrit en base.

### 6.1 Comment tiennent les modèles multi-marchands

Un modèle est « tenu par identifiant » quand tous ses marchands sont reliés entre eux par un GTIN ou une référence fabricant partagés ; « signature seule » quand aucun lien entre marchands n'est un identifiant.

| Catégorie | Multi-marchands | Tenus par identifiant | Partiel | Signature seule | … dont en `active` (signature seule / total) |
|---|---|---|---|---|---|
| Textile | 71 | 14 | 1 | **56** | **50 / 57** |
| Chaussures | 72 | 10 | 9 | 53 | 35 / 52 |
| Raquettes | 66 | 60 | 1 | 5 | 5 / 27 |
| Cordages | 24 | 13 | 1 | 10 | 4 / 9 |
| Accessoires | 19 | 15 | 0 | 4 | 1 / 2 |

Textile réuni par signature seule : **Tennis Point FR est présent dans 50 des 56 modèles** (Head + Tennis Point FR 20, SportSystem + Tennis Point FR 13, Tecnifibre + Tennis Point FR 6, Sport 2000 + Tennis Point FR 5…). Tennis Point FR n'a aucune référence fabricant en textile : ces rapprochements reposent sur le nom commercial.

Dans l'échantillon (§2), sur les 7 textiles : signature seule 4 (3 justes, n° 6 faux) ; tenus par identifiant 3 (2 justes, n° 12 faux à cause d'un pont par signature).

### 6.2 Le motif « même nom, plusieurs articles » est fréquent

- **Gamme Babolat Play** (site Babolat, fiches lues le 2026-09-30) : trois références par article sous le même titre. Exemple « Play Crew Neck Tee Homme » : 3MP2011 et 3MTF011 à 30 € (100 % polyester recyclé), **3MTG011 à 42 € (83 % polyester / 17 % élasthanne), autre article**. Même schéma pour le short (3MP2061 / 3MTF061 à 37 €, 3MTG061 à 45 €), le débardeur (29 / 29 / 40 €) et la jupe (40 / 40 / 45 €). Les modèles 169, 207, 629 et 916 réunissent ces références par la signature. **Modèle 207 faux** (hors échantillon), 169, 629 et 916 très probablement aussi.
- **Tennis Point FR** écrit parfois deux fois le même titre pour deux fiches (jupe adidas Club n° 6 ; short Nike Court Dri-FIT Slam « Bleu » ×2 à 74,99 € et d'autres à 89,99 € ; t-shirt Head Topspin « Blanc, Rouge » ×2).

Conclusion : en textile, sans GTIN ni référence, le nom commercial ne suffit pas à prouver le même article. L'échantillon (5 / 7) n'était pas un accident.

### 6.3 Les 13 modèles signalés (2 incohérents, 13 divergents, recouvrement)

| Modèle | Signal | Verdict proposé |
|---|---|---|
| 878 short adidas Club (n° 12) | incohérent | **faux** : pont par la signature « club » entre JG0994 et GL5409 / GH7222 |
| 207 Babolat Play Crew Neck Tee | incohérent | **faux** : 3MTG011 est un autre article (§6.2) ; le signal vient pourtant d'un bruit (« crew neck play » / « crew play ») |
| 141 Lacoste Djokovic (GH5219), 347 Nike Victory (CV3048), 749 Nike Nadal (DV2881), 834 Nike polo Solid (DH0857), 860 Lacoste TH8917, 1085 Nike Advantage (FD5336), 1651 Babolat Exercise Club (4US26446) | divergent (nom de modèle ou édition) | identiques : même référence de style, écarts de libellé seulement |
| 487 Babolat Xcel bobine (243110) | divergent (jauge 1,25 / 1,35) | identique, conforme à D-2026-09-30-05 (jauge = variante si référence commune) |
| 1010 Luxilon Alu Power, 2507 Pure Drive + | divergent (12 / 12,2 m ; 27,5 / 27,6 po) | identiques (arrondis) |
| 1370 Babolat Evo Strike Gen2 | divergent (poids 280 / 290) | identique (cordée / non cordée, poids écrit par Tennispro.fr) |

Le contrôle « divergent » signale surtout du bruit de libellé (11 sur 13) ; les deux vrais faux sont textiles et réunis par la signature.

### 6.4 Questions pour Mathieu

- **Q4 — Textile à la bascule.** Options :
  - **B (proposée)** : en textile, seuls le GTIN et la référence fabricant réunissent des offres ; la signature ne fusionne plus (les paires qu'elle trouvait deviennent « proches » ou vont en file de revue). Corrige n° 6, n° 12 et 207 sans règle ad hoc. Coût : textile multi-marchands d'environ 71 à 15, **en `active` d'environ 57 à 7** (chiffres exacts au passage à blanc) ; Tennis Point FR ne se rapproche plus en textile tant qu'on n'a pas son GTIN.
  - C : garder la signature, ajouter des gardes (même titre deux fois chez un marchand = ambigu ; écart de prix d'origine > 10 % = distinct), puis tirer un second échantillon textile (20 modèles) pour mesurer ; repli sur B si < 95 %.
  - D : pas de textile multi-marchands du tout à la première bascule.
  - A : garder tel quel (précision mesurée 5 / 7).
- **Q5 — Modèles incohérents, toutes catégories.** Proposé : filet de sécurité générique : un modèle signalé « incohérent » est coupé en ses composantes tenues par identifiant avant publication (aucun modèle concerné hors textile aujourd'hui) ; « divergent » reste un signal de rapport, sans effet.

### 6.5 Réponses de Mathieu (AskUserQuestion, 2026-09-30, D-2026-09-30-11)

- **Q4** : **option B**. En textile, seuls le GTIN et la référence fabricant réunissent ; la signature ne fusionne plus.
- **Q5** : **couper**. Un modèle signalé « incohérent » est coupé en ses composantes tenues par identifiant avant publication, toutes catégories ; « divergent » reste un signal.

### 6.6 À reporter en code (Sonnet)

1. `lib/matching/cluster.ts` : en textile, l'étape 2 (signature) et l'étape 2 ter ne réunissent plus d'offres ; seules l'étape 1 (GTIN, référence) réunit. Une offre textile sans identifiant partagé forme son propre modèle.
2. Les paires textiles de même signature (anciennement fusionnées) vont dans la file de revue textile avec le motif « signature seule ».
3. Après regroupement, toutes catégories : un modèle où le contrôle trouve deux membres « différents » est coupé en composantes connexes des liens GTIN / référence ; les offres qui n'y sont reliées que par la signature forment leur propre modèle (ou rejoignent leur groupe de signature propre). Le rapport garde la liste des modèles coupés.
4. Tests : paires pièges n° 6 (deux jupes adidas Club Tennis Point FR), n° 12 (JG0994 / GL5409 / GH7222), modèle 207 (3MTG011 / 3MTF011 / 3MP2011 : seul 3MP2011 réuni à SportSystem).
5. Passage à blanc relu (textile multi-marchands attendu autour de 15, 7 en `active` ; aucune autre catégorie ne doit bouger sauf modèles coupés), nouvel engine `r4.6-b`, puis écriture en prod après accord de Mathieu.

**Prochaine étape** : report en code de D-2026-09-30-11 (Sonnet), puis R4.6-c.

### 6.7 Report en code (Sonnet, 2026-10-01)

Fait selon §6.6, engine `r4.6-b`. Écart au texte : la coupure est une fonction exportée (`splitByIdentifier`, testée seule) car aucun cas réel ne la déclenche une fois la signature écartée du textile. Passage à blanc en prod (lecture seule, 5 035 offres) : modèles 3 181 → 4 011 ; multi-marchands textile 71 → 15 (7 en `active`), chaussures 72, raquettes 66, accessoires 19, cordages 24 (inchangés) ; incohérents 2 → 0 ; coupés 0 ; divergents 13 ; file de revue textile 602 paires dont 145 « signature seule ». Reste : relecture des 15 modèles textiles et accord de Mathieu avant l'écriture en prod.
