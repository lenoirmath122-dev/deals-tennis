# Contrôle de R4.1 à R4.4 (2026-09-29, Opus)

> Relecture demandée par Mathieu après R4.4 : étapes faites, données issues des tests et du premier passage en prod, cohérence avec l'objectif du site. **Aucune modification du code ni de la base** pendant le contrôle : requêtes en lecture seule sur la prod (tables `match_*` du passage `r4.4-etapes-1-2`, `deals`) et une sonde vitest temporaire (supprimée) qui appelle `extractOfferAttributes` et `compare` sur des titres réels.
> Conclusion : les défauts du §3 sont à corriger dans une **phase de correction R4.4-bis, avant R4.5** (D-2026-09-29-03).

## 1. Ce qui est conforme

| Point | Constat |
|---|---|
| Tests | 200 tests unitaires passent ; `tsc` et `eslint` propres. Seul échec : `tests/unit/tracking.test.ts` (exige `DATABASE_URL`, préexistant depuis R3). |
| R4.1 : jeu R1 figé | `tests/fixtures/r1-jeu-fige.json` : 67 paires (32 identiques / 15 proches / 20 différents), 123 offres distinctes, toutes présentes. |
| R4.1 : banc de mesure | `tests/unit/r1-banc-mesure.test.ts` retrouve la référence de l'algorithme actuel : précision 5/8, rappel 5/32, inter-marchands 2/29, et la sortie de chaque paire. |
| R4.1 : migration 008 | 4 tables `match_*` en prod, remplies par un seul passage. |
| R4.2 / R4.3 : extraction | Attributs lus seulement s'ils sont écrits, source conservée, aucune génération déduite, `grams` Tennis Point FR (poids d'expédition) écarté. |
| R4.4 : passage en prod | Un seul passage (`857fc4cf…`, 2026-09-29 15:54, `r4.4-etapes-1-2`) : 2 206 lignes d'attributs, 1 456 modèles, 1 912 liens, identiques au rapport `R4_4_rapport_passage.md`. `deals` inchangé (4 241 `active`, 794 `tracked`). Le site ne lit pas ces tables. |
| Déterminisme | Test « deux passages sur les mêmes données donnent le même résultat » vérifié sur le jeu R1. |

## 2. Contrôle manuel des 90 modèles multi-marchands de la prod

Les 90 modèles avec ≥ 2 marchands ont été relus un par un (titres, prix, statut, méthode du lien). Répartition : chaussures 60, raquettes 21, accessoires 5, cordages 4.

**Faux regroupements multi-marchands constatés : 5 sur 90 (précision ≈ 94 %, sous l'objectif de 95 %)** :

| # | Modèle (clé de famille) | Offres réunies à tort | Défaut (§3) |
|---|---|---|---|
| 1 | `Luxilon\|Alu Power\|cordages` | Tennispro.fr « Big Banger Alu Power **Rough** 1.25mm (220 Metres) » + Tennispro.fr « Big Banger Alu Power 1.25mm (220 Metres) » + SportSystem « Alu Power **Rough** bobine 220m » | D1 |
| 2 | `Wilson\|Sensation\|cordages` | Amazon « Sensation **Comfort**, Rouleau de 200 m, 16G, 1,30 mm » + SportSystem « Sensation **Control** (200m) » | D1 (et « Comfort » absent du référentiel, à vérifier sur fiche) |
| 3 | `Head\|Revolt\|chaussures` | SportSystem « Head Revolt **Evo** 5.0 All Court … Homme » (59 €) + Tennis Point FR « HEAD Revolt **Court** 5.0 … Hommes » (53,95 €) | D2 |
| 4 | `Nike\|Vapor Pro\|chaussures` (toutes surfaces, homme) | Tennis Point FR « Vapor Pro 3 **PRM** FO » (72,95 € et 125,95 €), « Zoom Vapor Pro 3 **Prm** » (90,95 €) réunis avec les Vapor Pro 3 standard de Tennis Point FR et Sport 2000 | D3 |
| 5 | `Head\|Hydrosorb\|accessoires` | Head « Hydrosorb™ **Comfort** grip » + Head « Hydrosorb™ grip » + Tennispro.fr « Hydrosorb (x1) » | D4 |

**Cas à trancher (conforme à la règle, discutable)** : `adidas|Avacourt|chaussures` réunit SportSystem « Avacourt 2 **Y-3** beige … Édition limitée » (74,95 €) avec les Avacourt 2 standard (39,95 € à 99 €). La règle validée (chaussures : édition = variante, sauf Premium) le permet ; Y-3 est une collaboration qui change le produit plus qu'un coloris.

**Regroupements vérifiés corrects (exemples)** : raquettes SportSystem / Tennispro.fr par référence fabricant (SportSystem « Head Speed Team 2026 » à 175 € et « Head Speed Team » sans année à 95 € restent deux modèles distincts, chacun rattaché à une offre Tennispro.fr différente par sa référence) ; chaussures séparées par genre, surface et âge (Gel-Resolution X / Gel-Resolution X Clay, Jet Tere 2 homme / femme / terre battue / toutes surfaces) ; éditions joueur (Barricade 14 Tsitsipas, Ubersonic 5 Pegula, Defiant Speed 2 Zverev) et coloris regroupés comme le prévoit la règle.

**Cordages, tous modèles à plusieurs offres (même marchand compris)** : 5 des 9 sont faux.

| Modèle | Offres réunies |
|---|---|
| `Babolat\|RPM` | SportSystem RPM **Team** + RPM **Soft** + RPM **Hurricane** (200m) |
| `Babolat\|RPM` | SportSystem RPM **Rough** 1.25 ou 1.30 + RPM **Power** (200m) |
| `West Gut\|MT` | SportSystem MT 20 **Hexa Spin** + MT 14 **Polyflex** (200m) |
| `Wilson\|Sensation` | ligne 2 ci-dessus |
| `Luxilon\|Alu Power` | ligne 1 ci-dessus |

Corrects : RPM Blast (Tennispro.fr / SportSystem, par référence), Rip Control (idem), Xcel, Black Code Fire / Lime (édition = variante, règle Q7).

## 3. Défauts confirmés (sonde sur les fonctions du moteur)

| Id | Défaut | Preuve | Portée en prod | Correction proposée |
|---|---|---|---|---|
| **D1** | La **version des cordages n'est jamais comparée** : `version` est absent de `CATEGORY_RULES.cordages.attributes` (`config/matching-rules.ts`), alors que le référentiel dit « Chaque version est un cordage différent (Blast ≠ Soft) » (famille RPM). La version est bien extraite, mais ignorée. | `compare(« Rpm Blast 1.25mm (200 Metres) », « Rpm Soft 1.25mm (200 Metres) »)` → **identique** ; « Alu Power Rough » / « Alu Power » → identique. | 5 modèles de cordages faux, dont 2 multi-marchands. | Ajouter `version: "different"` aux cordages (changement de règle, **à valider par Mathieu**). Une version écrite d'un seul côté donnera alors « proche » (règle générale « connu d'un seul côté »). |
| **D2** | « **All Court** » (surface) est lu comme la version « **Court** » des familles qui ont cette version (Head Revolt, Head Sprint, Mizuno Wave Exceed / Wave Enforce). La vraie version (Evo, Pro, Tour) est perdue. | « Head Revolt Evo 5.0 All Court » → `version: Court` ; face à « Revolt Court 5.0 » → identique. | 8 offres SportSystem (Revolt Evo / Pro 5.0 All Court, Sprint Evo / Pro 4.0 All Court, Wave Exceed Tour 6 ×2, Wave Enforce Tour 2 ×2) ; 1 faux regroupement multi-marchands. | Retirer l'expression de surface (« all court », « toutes surfaces »…) avant de lire la version, ou refuser « Court » précédé de « All ». Correction de code. |
| **D3** | « **PRM** » n'est pas reconnu comme l'édition « Premium ». La règle validée (`attributeValueOverrides.edition: { premium, prm → proche }`) ne s'applique donc jamais aux titres « PRM » : l'édition n'est pas extraite, l'offre passe pour le modèle standard. | « Nike Vapor Pro 3 PRM FO » → aucune édition ; face à « Zoom Vapor Pro 3 » → identique. | 17 offres Nike (Tennis Point FR : Vapor Pro 3, Vapor 12, GP Challenge 1 / 1.5 écrits « PRM » ou « Prm ») ; 1 faux regroupement multi-marchands. | Ajouter « PRM » comme marqueur de l'édition « Premium » (référentiel chaussures Nike, ou lecture générique). |
| **D4** | **Hydrosorb Comfort** absent du référentiel : la famille Head Hydrosorb ne connaît que la version « Pro ». | « HEAD Hydrosorb Comfort grip » face à « Hydrosorb (x1) » → identique. | 1 faux regroupement multi-marchands. | Ajouter la version « Comfort » (Head la vend comme produit distinct). « Comfort » de Wilson Sensation : à vérifier sur fiche avant ajout. |
| **D5** | **Indicateur « modèles incohérents » aveugle** : il réutilise `compare()`, donc il a les mêmes angles morts (D1 à D4) ; il ne signale que les paires « différent » et affiche « 0 » dans le rapport alors que 5 modèles multi-marchands sont faux. | Rapport R4.4 : « Modèles incohérents : 0 ». | Rapport de chaque passage. | Ajouter au rapport un contrôle indépendant de `compare()` : modèles dont les membres ont des valeurs extraites différentes pour un même attribut (version, édition…), ou un mot du titre présent chez un seul membre et connu du référentiel comme version d'une autre famille. |

## 4. Pourquoi les tests ne l'ont pas vu

1. **Le jeu R1 ne contient aucune paire de ces formes** : pas de cordages de même famille et de versions différentes (Blast / Soft, Alu Power / Rough), pas de titre « All Court » face à une version « Court », pas de « PRM ». Les pièges du cadrage (§9 : Pure Aero / Lite, 1,25 / 1,30, garniture / bobine) sont couverts, pas ceux-là.
2. **Le 9/9 n'est pas une mesure indépendante** : la paire 14 (seul faux positif initial) a été corrigée en modifiant le référentiel sur ce même jeu. Et 9 rapprochements trouvés sont trop peu pour conclure sur un objectif de 95 % (une erreur = −10 points). La mention « objectif atteint sur ce jeu » de `R4_4_complement_referentiel.md` §1 est donc à lire comme « aucun faux positif sur 9 », pas comme une précision démontrée.
3. **La mesure en prod (§2) donne ≈ 94 %** sur les modèles multi-marchands, et 5 / 9 faux sur les cordages. C'est le premier chiffre de précision tiré de données non vues pendant la mise au point.

## 5. Raquettes : pourquoi Babolat, Head et Tennis Point FR ne sont jamais rapprochés

**Constat.** Les 21 modèles de raquettes multi-marchands sont **tous SportSystem / Tennispro.fr, tous par référence fabricant** (référence SportSystem = `mpn` Tennispro.fr). Aucun par signature (étape 2), aucun par GTIN : **0 GTIN de raquette partagé entre deux marchands** (Tennis Point FR en a 74 / 74, SportSystem 42, Tecnifibre 19).

**Ce que chaque marchand écrit** (raquettes, passage R4.4) :

| Marchand | Offres | Famille reconnue | Génération ou année écrite | Poids | Tamis | GTIN | Référence fabricant |
|---|---|---|---|---|---|---|---|
| Head | 135 | 116 | **0** | 0 | 4 | 0 | 0 |
| Tennispro.fr | 125 | 124 | 6 | 116 | 15 | 0 | 125 |
| SportSystem | 109 | 109 | 67 | 109 | 109 | 42 | 109 |
| Babolat | 91 | 87 | 64 | 0 | 12 | 0 | 0 |
| Tennis Point FR | 74 | 73 | 35 | 14 | 29 | 74 | 0 |
| Tecnifibre | 25 | 25 | 12 | 14 | 0 | 19 | 0 |
| Amazon | 15 | 11 | 1 | 0 | 3 | 0 | 0 |

**Paires inter-marchands de même famille, même version et même âge** impliquant Babolat, Head ou Tennis Point FR (approximation SQL : la génération compare l'année si elle est écrite, sinon le libellé) :

| Paire de marchands | Paires | Génération absente des 2 côtés | Génération d'un seul côté | Générations écrites différentes | Même génération des 2 côtés (toutes bloquées par un attribut connu d'un seul côté) |
|---|---|---|---|---|---|
| Head / Tennispro.fr | 93 | 88 | 5 | 0 | 0 |
| Babolat / Tennispro.fr | 91 | 3 | 76 | 0 | 12 |
| Tennis Point FR / Tennispro.fr | 59 | 24 | 34 | 0 | 1 |
| SportSystem / Tennis Point FR | 52 | 8 | 17 | 23 | 4 |
| Babolat / SportSystem | 40 | 1 | 8 | 2 | **29** |
| Head / Tennis Point FR | 35 | 11 | 24 | 0 | 0 |
| Head / SportSystem | 33 | 11 | 22 | 0 | 0 |
| Babolat / Tennis Point FR | 4 | 0 | 4 | 0 | 0 |
| Tecnifibre / Tennis Point FR | 4 | 0 | 4 | 0 | 0 |

**Deux blocages distincts :**

- **Blocage A — génération non écrite.** Head n'écrit la génération sur aucune de ses 135 raquettes, Tennispro.fr sur 6 / 125. Règle validée R4-Q4 (raquettes : génération inconnue d'un côté → « proche »). Toutes les paires impliquant Head sont bloquées. Blocage connu depuis le cadrage (`R4_cadrage.md` §2.2).
- **Blocage B — même génération des deux côtés, mais attribut connu d'un seul côté** (non identifié clairement jusqu'ici). Exemple : Babolat « Pure Drive Gen11 Non cordée » (269,95 €, `tracked`, année 2025, aucun poids / tamis / plan) et SportSystem « Pure Drive Gen 11 2025 » (215,96 €, `active`, 300 g, 100, 16x19). Même modèle, même génération ; la fiche SportSystem donne le poids, le tamis et le plan, le titre Babolat non ; règle R4.4 « connu d'un seul côté → jamais identique » → « proche ». **Le marchand le mieux renseigné est le moins rapproché.** Touche 29 paires Babolat / SportSystem, 12 Babolat / Tennispro.fr, 4 SportSystem / Tennis Point FR, 1 Tennis Point FR / Tennispro.fr.
- Les 23 paires SportSystem / Tennis Point FR à générations écrites différentes n'ont pas été vérifiées une à une : vraies générations différentes (Tennis Point FR écoule d'anciennes générations) ou même génération écrite autrement (« Gen 11 » face à « 2025 », classé « proche » par le moteur).

**Pourquoi c'est important.** Rapprocher le prix public du fabricant (offre `tracked` Babolat ou Head : 226 raquettes) d'une promo chez un revendeur est la base du verdict « vrai bon plan » (prix de référence, principes P1 / P4 de `CADRAGE_vrais-bons-plans.md`). Pour les raquettes, ce cas est aujourd'hui entièrement bloqué.

**Pistes (non décidées) :**

1. **Blocage B (recommandé)** : pour les raquettes, quand famille + version + génération sont écrites et égales des deux côtés, un poids, un tamis, un plan de cordage ou une longueur connus d'un seul côté ne bloquent plus « identique » (ils découlent de la version et de la génération chez le fabricant) ; ils restent bloquants s'ils sont connus des deux côtés et différents. Gain probable : environ 45 paires, nombre de modèles à chiffrer au passage suivant. À contrôler sur l'échantillon de 30 modèles de R4.6.
2. **Blocage A (plus risqué)** : considérer qu'une raquette vendue sur le site du fabricant est de la génération en cours. Hypothèse, pas une donnée : vérifier d'abord que Head ne vend pas d'anciennes générations sur son site. Alternative : le levier « valeur dominante » prévu en R4.5.
3. **GTIN par déclinaison (à vérifier)** : seul le GTIN principal de l'offre a été comparé. Les GTIN par variante (`raw_attributes.enrichissement.variants` chez Tennis Point FR, EAN par déclinaison chez SportSystem) pourraient se recouper entre marchands.

## 6. Cohérence avec l'objectif du site

- **Dans le bon sens** : le moteur est resté fantôme (site intact) ; la couverture passe de 5 à 90 modèles multi-marchands (71 en `active`) ; beaucoup de modèles réunissent une offre `tracked` du fabricant (prix public) et une offre en promo ailleurs, exactement ce que demande le verdict « vrai bon plan ». Rappel : deals-tennis n'est pas un comparateur de prix (D-2026-09-25-17) ; le rapprochement sert d'abord au prix de référence et à la vérification des promos.
- **Contre l'objectif** : les faux regroupements du §2 contredisent P3 (« en cas de doute, ne pas publier ») et le principe R3 du rapprochement (un faux rapprochement coûte plus qu'un manqué) ; afficher « même modèle » entre une Revolt Evo et une Revolt Court, ou une RPM Blast et une RPM Soft, serait une information fausse.
- **Limites de couverture** : raquettes (§5), 5 modèles d'accessoires seulement, textile (57 % des offres) pas encore traité (R4.5).

## 7. Phase de correction R4.4-bis (avant R4.5)

Décidée par Mathieu le 2026-09-29 (D-2026-09-29-03). Contenu proposé, à valider en début de phase :

1. **Questions à trancher par Mathieu d'abord** :
   - **C-Q1** : `version: "different"` pour les cordages (D1) ?
   - **C-Q2** : Avacourt 2 Y-3 (et collaborations du même type) : variante ou séparée ?
   - **C-Q3** : levier du blocage B des raquettes (§5 piste 1) : l'appliquer dans R4.4-bis, ou le reporter en R4.5 / R4.6 ?
   - **C-Q4** : Wilson Sensation « Comfort » : vérifier la fiche puis ajouter la version, ou laisser en l'état ?
2. **Corrections** : D1 (selon C-Q1), D2 (lecture de version après retrait de la surface), D3 (marqueur « PRM »), D4 (version « Comfort » d'Hydrosorb), D5 (contrôle d'incohérence indépendant de `compare()`).
3. **Tests** : paires pièges ajoutées au jeu R1 figé ou à un jeu complémentaire versionné (RPM Blast / Soft, Alu Power / Alu Power Rough, Revolt Evo 5.0 All Court / Revolt Court 5.0, Vapor Pro 3 PRM / Vapor Pro 3, Hydrosorb Comfort / Hydrosorb), titres réels de la prod ; tests unitaires de D2 et D3 sur les 8 et 17 offres concernées.
4. **Vérification GTIN par déclinaison** (§5 piste 3), lecture seule.
5. **Nouveau passage fantôme** (branche Neon puis prod, tables `match_*` seulement), nouveau rapport, et nouvelle relecture complète des modèles multi-marchands (le nombre de 90 baissera).
6. Mise à jour de la mesure R1 et de `R4_4_rapport_passage.md`.

Modèle : réponses aux questions C-Q1 à C-Q4 d'abord (décision de Mathieu), puis exécution en Sonnet.

## 8. Exécution de R4.4-bis (2026-09-29, Sonnet)

Réponses de Mathieu : C-Q1 oui (`version: "different"`), C-Q2 modèle séparé, C-Q3 blocage B dans R4.4-bis, C-Q4 vérifier puis ajouter (D-2026-09-29-03).

- **Code** : D1 (`matching-rules.ts`), D2 (« all court », « toutes surfaces » retirés avant la lecture de la version, `shared.ts`), D3 (« PRM » → « Premium » dans `extractEdition`), D4 (Hydrosorb « Comfort »), Y-3 (édition Avacourt + exception « différent »), blocage B (`derivedAttributesRelaxed` dans `compare.ts` + étape 2 bis dans `cluster.ts`, fusion seulement si toutes les paires des deux groupes sont « identiques »), D5 (indicateur « modèles divergents » dans `cluster.ts` / `report.ts`, indépendant de `compare()`).
- **C-Q4 vérifié** : Tennis Warehouse Europe vend « Wilson Sensation Comfort 1.30/16 String Reel - 200m » ; Wilson US l'appelle « Sensation 16 ». « Comfort » semble être l'intitulé européen du Sensation de base, distinct de Control. Version « Comfort » ajoutée : Comfort ≠ Control ; Comfort face à « Sensation » sans version = proche. Équivalence Comfort = Sensation de base **non validée** (à confirmer sur une fiche Wilson Europe).
- **Mesure sur le jeu R1** : 12/12 (rappel 12/32, avant 9/32), inter-marchands 11/29 (avant 8/29), 0 faux positif. Les 3 paires gagnées sont des raquettes (blocage B).
- **Tests** : 211 unitaires passent (`tracking.test.ts` : `DATABASE_URL`, préexistant), `tsc` et `eslint` propres. Tests ajoutés : D1, D2, D3, D4, Y-3, Sensation, blocage B (dont le cas où une troisième offre contredit), D5.
- **Limite connue** : « Avacourt Y-3 » sans numéro de génération pourrait lire le « 3 » de « Y-3 » comme génération (non testé sur titres réels).
- **Reste à faire** : point 3 (paires pièges dans un jeu versionné, titres réels), point 4 (GTIN par déclinaison), points 5 et 6 (nouveau passage sur branche Neon puis prod, relecture des modèles multi-marchands et des paires de raquettes gagnées, mise à jour de `R4_4_rapport_passage.md`).

### 8.1 Passage à blanc sur la prod (`--dry-run`, lecture seule, 2026-09-29)

Aucune écriture en base. Le script `shadow-run.ts` écrit désormais aussi `modeles-multi-marchands.csv` (une ligne par offre des modèles à ≥ 2 marchands) pour la relecture.

| | Avant (R4.4) | Après (R4.4-bis) |
|---|---|---|
| Modèles | 1 456 | 1 451 |
| Modèles ≥ 2 marchands (active + tracked) | 90 | **103** |
| … en `active` seulement | 71 | **77** |
| Raquettes | 21 | **35** |
| Cordages | 4 | 3 |
| Chaussures / accessoires | 60 / 5 | 60 / 5 |
| Conflits / incohérents | 11 / 0 | 14 lignes dans `conflits.csv` (12 conflits + 2 divergents) / 0 |

Relecture faite : **cordages 3/3 justes** (Alu Power Rough, Rip Control, RPM Blast ; avant 5/9 faux) ; **raquettes 35 modèles relus**, gains du blocage B cohérents (Pure Aero, Pure Drive, Evo Aero Babolat ↔ SportSystem / Tennispro.fr, Gen 9 / 11 / 2) ; **défauts D2, D3, D4 disparus des modèles multi-marchands** (Sprint Evo / Pro / Court et Revolt Evo / Pro séparés, aucun Vapor « PRM » fusionné avec le standard, Hydrosorb Comfort absent des modèles ; Avacourt Y-3 absente).

**Non fait** : relecture complète des 60 modèles de chaussures (seules les familles des défauts ont été relues) ; la précision globale n'est donc pas encore rechiffrée.

**À vérifier** :
- « Babolat Pure Aero 98 **x2** Gen9 » réuni avec « Pure Aero 98 Gen9 » : le « x2 » n'est pas lu comme un lot pour les raquettes (pack de 2 ? à contrôler sur la fiche).
- Deux modèles « divergents » (D5) : jauge 1,25 | 1,35 (Babolat Xcel, bobine à jauges au choix) et longueur 27,5 | 27,6 (Pure Drive +) : bénins probables, à confirmer.
- Raquettes Head : toujours regroupées seulement SportSystem ↔ Tennispro.fr (blocage A non traité).

### 8.2 Pack « x2 » corrigé et relecture complète (2026-09-29)

- **« x2 » des raquettes** : confirmé sur la prod (Babolat « Pure Aero 98 x2 Gen9 », 599,95 € = 2 × 299,95 €, référence 101568 ≠ 101567) : c'est un pack de 2. `racquets.ts` lit désormais « x2 » à « x9 » (collé, sans chiffre avant : « 16x19 » exclu) comme `lot`, donc « différent » de la raquette seule. Tests ajoutés (pack et plan de cordage). La Pure Aero 98 forme maintenant un modèle correct (SportSystem + Babolat).
- **Nouveau passage à blanc (lecture seule)** : 1 454 modèles, **103 multi-marchands (77 en `active`)** : chaussures 60, raquettes 35, accessoires 5, cordages 3. 2 modèles « divergents » restent (jauge 1,25 | 1,35 sur une bobine à jauges au choix ; longueur 27,5 | 27,6 sur la Pure Drive + : écarts d'arrondi ou de choix de fiche, bénins).
- **Relecture complète** des 103 modèles (titres, marchand, statut) : **aucun faux regroupement repéré** (60 chaussures, 35 raquettes, 3 cordages, 5 accessoires). Précision observée 103 / 103 (avant : ≈ 94 %, 5 faux sur 90), à lire comme « aucune erreur vue à la relecture », pas comme une vérité de terrain (relecture sur titres et prix, sans ouvrir les fiches).
- **Points de vigilance** : Babolat / Tennispro.fr « Pure Drive (Lite) » sans génération écrite réunis par référence avec des « Gén 11 » SportSystem (cohérent, à garder à l'œil) ; 12 conflits GTIN / référence non fusionnés (dont Avacourt Y-3, packs de 2 raquettes contre raquette seule), attendus.
- **Reste avant R4.5** : point 3 de §7 (paires pièges versionnées sur titres réels) et point 4 (GTIN par déclinaison), puis **écriture du passage en prod (tables `match_*`) : accord de Mathieu requis**.

### 8.3 Paires pièges versionnées et GTIN par déclinaison (2026-09-29)

- **Paires pièges** : `tests/fixtures/r4-4-bis-paires-pieges.json` (11 paires, titres réels de la prod : RPM Blast / Soft / Rough / Team, Alu Power Rough / Soft / standard, Revolt Evo All Court / Court, Vapor Pro 3 PRM / standard, Hydrosorb Comfort / standard / Pro, Avacourt 2 Y-3 / standard, Pure Aero 98 x2 / simple) et `tests/unit/r4-4-bis-paires-pieges.test.ts` : aucune ne doit être « identique », et « différent » quand la règle le dit. Jeu R1 figé inchangé. 224 tests unitaires passent, `tsc` et `eslint` propres. Limite : les positives ne sont pas dans ce jeu (elles dépendent des références et attributs de fiche, pas seulement du titre) ; elles restent couvertes par le jeu R1 et les tests du blocage B.
- **GTIN par déclinaison** (lecture seule, SQL sur la prod, EAN de `deals.gtin`, `raw_attributes.enrichissement.variants[].gtin` chez Tennis Point FR, `raw_attributes.variants[].ean13` chez SportSystem) : **16 EAN partagés par au moins deux marchands, tous en chaussures** (12 uniquement par les déclinaisons, 24 offres). Aucun EAN partagé en raquettes, cordages ou accessoires : Babolat, Head, Tennispro.fr et Amazon n'ont aucun GTIN. Tous les groupes relus réunissent bien le même modèle, et ils tombent tous dans un modèle déjà réuni par la signature (contrôle à l'œil sur les titres) : **aucun rapprochement nouveau**, mais une confirmation indépendante sur 16 groupes (SportSystem / Tennis Point FR / Sport 2000).
- **Conclusion** : la piste 3 (§5) ne débloque pas les raquettes ; pas de développement dans R4.4-bis. Utile plus tard comme contrôle de précision (16 groupes vérités terrain) si de nouveaux marchands publient des EAN.
