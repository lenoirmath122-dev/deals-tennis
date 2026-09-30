# Journal des sessions

> Sessions du 2026-09-21 au 2026-09-22 (mise en place du protocole jusqu'à la méthode technique de collecte ProTennis) déplacées telles quelles dans `archive/JOURNAL_SESSIONS_2026-09-21_a_2026-09-22-methode-protennis.md` (D-2026-09-22-09/7bis, seuil 150 lignes).
> Sessions du 2026-09-22 (suite 2) au 2026-09-23 (recherche centrée article) déplacées telles quelles dans `archive/JOURNAL_SESSIONS_2026-09-22_a_2026-09-23-recherche-article.md` (même règle, condensation du 2026-09-23).
> Sessions du 2026-09-23 (cadrage monitoring n8n) au 2026-09-23 (hauteur du hero réduite) déplacées telles quelles dans `archive/JOURNAL_SESSIONS_2026-09-23-monitoring_a_hero-hauteur.md` (même règle, condensation du 2026-09-23, chantier marchands supplémentaires).
> Sessions du 2026-09-23 (pages réglementaires) au 2026-09-23 (suggestions groupées par catégorie) déplacées telles quelles dans `archive/JOURNAL_SESSIONS_2026-09-23-reglementaire_a_suggestions-categorie.md` (même règle, condensation du 2026-09-24).
> Sessions du 2026-09-24 (Sport Outlet FR) à 2026-09-24 (pré-étape tri prix) déplacées telles quelles dans `archive/JOURNAL_SESSIONS_2026-09-24-sportoutlet_a_pre-etape-tri.md` (même règle, condensation du 2026-09-25).
> Sessions du 2026-09-25 (SEO/GEO bloc 1) au 2026-09-25 (lexique sexe/âge, session 11) déplacées telles quelles dans `archive/JOURNAL_SESSIONS_2026-09-25-seo-bloc1_a_lexique-sexe-age.md` (même règle, condensation du 2026-09-25).
> Sessions du 2026-09-25 (validation Phase 0 vrais bons plans) au 2026-09-25 (SEO/GEO bloc 3) déplacées telles quelles dans `archive/JOURNAL_SESSIONS_2026-09-25-validationPhase0_a_seo-bloc3.md` (même règle, condensation du 2026-09-26).
> Sessions du 2026-09-25 (session 13, workflow n8n gender/age_group) au 2026-09-25 (build du trigger `price_observations`, avec la note de reconstitution du 2026-09-26) déplacées telles quelles dans `archive/JOURNAL_SESSIONS_2026-09-25-n8n-gender-age_a_trigger-price-observations.md` (même règle, condensation du 2026-09-27).
> Sessions du 2026-09-26 (application prod du trigger) au 2026-09-26 (suite 5, section « Choix du modèle ») déplacées telles quelles dans `archive/JOURNAL_SESSIONS_2026-09-26-prod-trigger_a_choix-du-modele.md` (même règle, condensation du 2026-09-28).
> Sessions du 2026-09-27 (repérage cowork) au 2026-09-27 (explications avant R2) déplacées telles quelles dans `archive/JOURNAL_SESSIONS_2026-09-27-reperage_a-preparation-R2.md` (même règle, condensation du 2026-09-28).
> Sessions du 2026-09-28 (R2 démarré) au 2026-09-28 (report D-2026-09-28-03, R2 clos) déplacées telles quelles dans `archive/JOURNAL_SESSIONS_2026-09-28-R2-demarrage_a_R2-clos.md` (même règle, condensation du 2026-09-28).
> Sessions du 2026-09-28 (cadrage R3 validé) au 2026-09-28 (R3.2, `lib/ingest.ts`) déplacées telles quelles dans `archive/JOURNAL_SESSIONS_2026-09-28-cadrage-R3_a_R3-2.md` (même règle, condensation du 2026-09-29).
> Sessions du 2026-09-28 (R3.4, script Tecnifibre) au 2026-09-29 (R4.4, comparaison et script fantôme) déplacées telles quelles dans `archive/JOURNAL_SESSIONS_2026-09-28-R3-4_a_2026-09-29-R4-4.md` (même règle, condensation du 2026-09-30).
> Consulter les archives uniquement si le détail ci-dessous ne suffit pas.

## 2026-09-29 (session cloud, Opus) — Contrôle de R4.1 à R4.4 et ajout de la phase de correction R4.4-bis

- Demande de Mathieu : vérifier les étapes R4.1 à R4.4, les données issues des tests et leur cohérence avec l'objectif du site. Modèle actuel = recommandé (Opus : revue, interprétation de données réelles).
- Aucune modification du code ni de la base pendant le contrôle : requêtes en lecture seule sur la prod (connecteur Neon, tables `match_*` et `deals`) et une sonde vitest temporaire, supprimée.
- **Conforme** : 200 tests unitaires, `tsc` et `eslint` propres (`tracking.test.ts` : `DATABASE_URL`, préexistant) ; jeu R1 figé (67 paires, 123 offres) et banc 5/8, 5/32, 2/29 ; un seul passage en prod, chiffres identiques au rapport (2 206 / 1 456 / 1 912) ; `deals` inchangé (4 241 `active`, 794 `tracked`).
- **Relecture des 90 modèles multi-marchands** : 5 faux regroupements (précision ≈ 94 %) : Alu Power Rough / Alu Power, Sensation Control / Comfort, Revolt Evo / Revolt Court, Vapor Pro 3 PRM / standard, Hydrosorb Comfort / Hydrosorb. Cordages : 5 des 9 modèles à plusieurs offres faux (RPM Team + Soft + Hurricane, RPM Rough + Power, West Gut MT 20 + MT 14…). Cas discutable : Avacourt 2 Y-3 réunie avec l'Avacourt 2 standard (conforme à la règle « édition = variante »).
- **Défauts confirmés** : D1 `version` absent de `CATEGORY_RULES.cordages` (RPM Blast / RPM Soft → « identique ») ; D2 « All Court » lu comme version « Court » (8 offres) ; D3 « PRM » non reconnu comme Premium (17 offres Nike) ; D4 Hydrosorb Comfort absent du référentiel ; D5 indicateur « modèles incohérents » aveugle (il réutilise `compare()`).
- **Tests** : le jeu R1 ne contient aucune paire de ces formes ; le 9/9 a été obtenu en corrigeant la paire 14 sur ce même jeu, et 9 rapprochements trouvés sont trop peu pour démontrer 95 %.
- **Raquettes** (précisé à la demande de Mathieu) : 21 modèles multi-marchands, tous SportSystem / Tennispro.fr par référence ; 0 GTIN partagé ; blocage A (génération non écrite : Head 0 / 135) et blocage B (même génération, mais poids / tamis / plan connus d'un seul côté : 29 paires Babolat / SportSystem, ex. Pure Drive Gen 11). GAP-2026-09-29-01 ouvert.
- **Décision de Mathieu (D-2026-09-29-03)** : phase de correction **R4.4-bis** ajoutée à la feuille de route avant R4.5 (`R4_cadrage.md` §4). Détail complet : `R4_4_controle.md`.
- Prochaine étape : **R4.4-bis**. Questions C-Q1 à C-Q4 à Mathieu d'abord, puis exécution en Sonnet.


## 2026-09-29 (session cloud, Sonnet) — R4.4-bis : décisions C-Q1 à C-Q4 et corrections de code

- Reprise de session : modèle actuel Sonnet, recommandé Sonnet (état) puis exécution d'une spec validée. Questions C-Q1 à C-Q4 posées une par une à Mathieu, toutes tranchées dans le sens recommandé (`DECISIONS_FONCTIONNELLES.md`, D-2026-09-29-03).
- Corrections D1 à D5, Y-3 séparée, blocage B levé ; C-Q4 vérifié sur le web (Sensation Comfort = intitulé européen du Sensation 16, équivalence à confirmer). Jeu R1 : 12/12, rappel 12/32, inter-marchands 11/29, 0 faux positif. 211 tests unitaires, `tsc`, `eslint` propres. Détail : `R4_4_controle.md` §8.
- Incident : l'outil Bash a été indisponible plusieurs tours (contrôle de sécurité sans verdict) ; aucun impact sur le dépôt, les tests ont été lancés après reprise.
- Aucune écriture en base pendant cette session.
- Prochaine étape : paires pièges dans un jeu versionné, GTIN par déclinaison (lecture seule), puis nouveau passage sur branche Neon (accord de Mathieu avant la prod), relecture des modèles multi-marchands et des ~45 paires de raquettes gagnées.
- Passage à blanc en prod (`--dry-run`, lecture seule) : 103 modèles multi-marchands (90 avant), 35 raquettes (21), cordages 3/3 justes ; D2, D3 et D4 disparus ; `modeles-multi-marchands.csv` ajouté au script. À vérifier : « x2 » des raquettes, 2 modèles divergents ; relecture complète des chaussures non faite (`R4_4_controle.md` §8.1). Chaîne de connexion passée en variable d'environnement, non écrite dans le dépôt.
- « x2 » des raquettes corrigé (pack de 2 confirmé sur la fiche prod), nouveau passage à blanc et relecture complète des 103 modèles multi-marchands : aucun faux regroupement repéré (précision observée 103/103, avant ≈ 94 %). 213 tests unitaires, `tsc` propres. Écriture en prod non faite : accord de Mathieu demandé (`R4_4_controle.md` §8.2).
- Paires pièges versionnées (11 paires, titres réels, `tests/fixtures/r4-4-bis-paires-pieges.json`) et GTIN par déclinaison (lecture seule) : 16 EAN multi-marchands, tous en chaussures, tous déjà réunis ; rien pour les raquettes (Babolat, Head, Tennispro.fr sans GTIN). 224 tests. Reste : accord de Mathieu pour écrire le passage en prod (tables `match_*`).
- Passage complet **écrit sur la branche Neon `test-r4-4bis-passage`** (1 454 modèles, 1 912 liens, `deals` inchangé) ; **écriture en prod refusée par le contrôle de sécurité** (« Production Deploy », malgré l'accord de Mathieu dans la conversation), non contournée. Prod : toujours le passage R4.4. À faire par Mathieu ou après ajout d'une règle de permission : `DATABASE_URL=<prod> npm run match:shadow`. `R4_4_rapport_passage.md` mis à jour avec les chiffres de la branche. PR ouverte pour R4.4-bis.


## 2026-09-29 (session desktop, Sonnet) — R4.4-bis : écriture du passage en prod

- Modèle actuel Sonnet, recommandé Sonnet (exécution d'une spec validée).
- Règle de permission minimale `Bash(node scripts/matching/shadow-run.ts:*)` dans `.claude/settings.json` (branche `chore/permission-match-shadow`, PR à ouvrir par Mathieu, non fusionnée).
- Passage à blanc en prod (`--dry-run`) : 5 035 offres lues, 1 454 modèles, 103 multi-marchands, 77 en active seulement, 1 912 liens : aucun écart avec l'attendu.
- Écriture réelle `npm run match:shadow` : passage `e249074a-8bb6-4f0d-b905-e240d1a80b1f`, 1 454 modèles, 1 912 liens ; ancien passage supprimé par le script.
- Vérification Neon (lecture seule, prod) : match_runs 1, match_models 1 454, match_offer_links 1 912, match_offer_attributes 2 206 ; deals inchangé (4 241 active, 794 tracked, 5 269).
- Branche Neon `test-r4-4bis-passage` : peut être supprimée (non supprimée). Prochaine étape : R4.5.


## 2026-09-29 (session cloud, Opus) — R4.5 : cadrage du textile et de l'étape 3

- Modèle actuel Opus, recommandé Opus (cadrage, interprétation de données réelles).
- Branche Git remise au niveau de master (R4.4-bis déjà fusionné, #112 à #114). Branche Neon `test-r4-4bis-passage` supprimée avec l'accord de Mathieu.
- Lecture seule sur la prod (connecteur Neon) : 2 829 offres textiles `active` + `tracked` ; Tennis Point FR 1 749 sans aucune référence ; références fabricant chez SportSystem, Sport 2000, Head, Babolat, Tecnifibre, Tennispro.fr (adidas).
- Mesures : 15 modèles réunis par la référence de style, tous justes (adidas JG0994 « Club » = « SW Stretch Woven », paire R1 17 ; Lacoste TH8917 « Core Performance » = « Sport Ultra Dry ») ; par le titre, 35 modèles exactement égaux chez ≥ 2 marchands, 316 paires proches dont 205 avec un mot en plus d'un seul côté ; prix d'origine divergent dans 7 groupes sur 35 (indice seulement).
- Une tentative de lecture par script local avec la chaîne de connexion a été refusée par le contrôle de sécurité ; les données ont été lues par le connecteur Neon. Rien n'a été écrit en base à part la suppression de la branche.
- Livrable : `R4_5_cadrage.md` (questions T-Q1 à T-Q7 ; découpage R4.5-a, R4.5-b, R4.5-c).
- Réponses de Mathieu aux questions T-Q1 à T-Q7 : toutes les propositions retenues (D-2026-09-29-04). Reclassement de la paire R1 17 laissé à R4.5-a (le jeu R1 figé des tests doit changer en même temps).
- Prochaine étape : exécution de R4.5-a en Sonnet (nouvelle session).


## 2026-09-29 (session cloud, Sonnet) — R4.5-a : extraction textile, référence de style, signature

- Reprise de session : modèle actuel Opus, recommandé Sonnet (exécution d'une spec validée, `R4_5_cadrage.md`) ; question posée à Mathieu, qui est passé sur Sonnet avant de commencer.
- Lecture seule sur la prod (connecteur Neon) pour établir le lexique : marchands et marques par volume, fréquence des mots des 2 829 titres, titres réels des paires pièges, référence de style vérifiée (15 groupes multi-marchands, tous justes ; les références SportSystem d'adidas sont des codes de coloris, égalité sur le code entier). Aucune écriture en base, aucun passage `match:shadow`.
- Code : `config/textile-lexicon.ts` (types, genre, âge, coloris, mots neutres, éditions, marques dont la référence est fiable), `lib/matching/textile.ts` (extraction), branchement dans `index.ts` (famille = `marque|type|textile`, le nom de modèle est l'attribut `modele`) et `compare.ts` (textile : `modele` requis ; en étape 1 les écarts lus dans le titre ne contredisent pas la référence ; signature sans suffixe d'offre quand la génération n'est pas écrite). `matching-rules.ts` : attributs textile `millesime`, `numero`, `longueur` (proche). Rapport et script : libellés, `ENGINE_VERSION` « r4.5-a-textile ».
- Choix d'exécution : type de tête de Sport 2000 = libellé de rayon, le vrai type est le dernier ; « Top », « capuche » et « survêtement » sont des indices faibles ; un chiffre seul dans un short Nike ou adidas (5 à 10) est une longueur ; « Carlito » seul n'est pas une édition (ligne Bidi Badu) ; titre sans type ou marque illisible = non reconnu (jamais rapproché par le titre) ; modèle sans nom lisible = jamais « identique ».
- **Point à valider par Mathieu** : « Club 25 Tech » / « Club Tech » et « Tie Break II » / « Tie Break » (millésime ou numéro écrit d'un seul côté) donnent « proche », comme le tableau du cadrage (§2.3) et ses paires pièges (§4) l'exigent. La règle Q6 de D-2026-09-28-02 (« année écrite d'un seul côté → identique ») ne joue donc plus pour le textile ; `GENERATION_RULES.textile` est inchangée mais ne reçoit plus ces marqueurs.
- Jeu R1 : paire 17 reclassée « identique » (T-Q1) ; fixture, banc de mesure de l'algorithme actuel (5/33, inter-marchands 2/30) et mesure du moteur mis à jour : **précision 20/20, rappel 20/33**, inter-marchands 19/30, 0 faux positif, les 11 paires textile au verdict attendu. Nouvelles fixtures : `r4-5-paires-textile.json` (11 paires pièges + 6 cas de référence). 266 tests unitaires passent (`tracking.test.ts` échoue sans `DATABASE_URL`, comme avant), `tsc` et `eslint` propres.
- Non fait, à R4.5-b : lexique non vérifié sur l'ensemble des 2 829 titres (échantillon de 110 relu à la main) ; le passage à blanc en prod et la relecture des modèles multi-marchands le feront.
- Prochaine étape : **R4.5-b** (Sonnet).


## 2026-09-30 (session desktop, Sonnet) — R4.5-b : étape 3 textile, file de revue, relecture

- Reprise de session : modèle actuel Sonnet, recommandé Sonnet (exécution de la spec `R4_5_cadrage.md` §7, validée). Mathieu a dit « Lance » sans trancher le point du millésime (R4.5-a) : règle actuelle conservée, toujours à valider.
- Code : `lib/matching/textile-review.ts` (nouveau, fonction pure) — paires de **modèles** textiles de même marque, type, genre et âge, marchands différents, que l'étape 2 n'a pas réunis ; score = part de mots communs du nom de modèle (0,9 si les mots sont les mêmes et que seuls les marqueurs diffèrent), −0,1 si genre inconnu d'un côté, −0,1 / −0,2 pour un écart de prix d'origine > 15 % / > 30 % (indice seulement, T-Q5), seuil bas 0,4, 3 000 lignes au plus. **Aucune fusion** (T-Q4). `EngineOffer.prixOrigine` ajouté (lu par `shadow-run.ts`). `shadow-run.ts` écrit `revue-textile.csv` (colonne `decision_mathieu` vide) et ajoute la méthode de lien au CSV des modèles multi-marchands ; `ENGINE_VERSION` = `r4.5-b-textile`.
- Passage à blanc en prod (`--dry-run`, lecture seule, 5 035 offres) : **69 modèles textiles multi-marchands** (0 avant R4.5), 172 tous types (5 au départ) ; file de revue : 243 paires (0,9 : 37, 0,8 : 39, 0,5 : 96, 0,4 : 59…) ; 12 conflits, 5 incohérents et 13 divergents dans le rapport, tous textiles relus ci-dessous.
- Relecture des 69 modèles multi-marchands (titres et méthode de lien, 22 liés par référence) : **65 justes ou très probables, 3 à trancher par Mathieu (tranchés depuis, voir ci-dessous), 1 corrigé** (par « justes », on entend cohérents avec les titres ; ils n'ont pas tous été vérifiés sur les fiches). Corrigé : « bermuda » n'est plus un synonyme de « short » (nouveau type `bermuda`) — Head publie « CLUB Bermuda » et « CLUB Short » comme deux articles ; ils étaient regroupés. À trancher : (1) adidas « Club » / « Club 3-Stripes » / « Club Climacool » (t-shirts) et « Club » / « Club 3S » (shorts junior) regroupés parce que « 3 stripes », « 3s » et « climacool » sont dans les mots neutres ; (2) Nike « Victory » / « Victory Flouncy » (jupes) réunies par une référence partagée entre Sport 2000 et SportSystem, pas par le titre.
- **Réponses de Mathieu aux 3 questions (D-2026-09-30-01)** : (1) sous-gamme adidas : prix proche → mots neutres, sinon modèles distincts, seuil **10 %** (choisi par Mathieu) ; (2) Nike Victory / Flouncy : même article ; (3) millésime écrit d'un seul côté : « je ne sais pas », règle « proche » conservée. Codé : `sous_gamme` (attribut « proche », `TEXTILE_SUBRANGE_WORDS`), étape 2 ter de `cluster.ts` (réunion si écart de médiane ≤ 10 %), `flouncy` neutre pour Nike ; 279 tests (5 de plus), `tsc` et `eslint` propres. Passage à blanc refait : 69 modèles textiles multi-marchands, 4 incohérents (5 avant), 11 divergents, 250 paires en file de revue. Effet : adidas Club / Club Climacool (35 € / 35 €) réunis ; Club / Club 3-Stripes t-shirt (35 € / 40 €) séparés ; shorts junior Club 3S (30 €) réunis avec Club (médiane 31,5 €, écart 5 %, alors que l'offre Tennispro.fr à 35 € est à 14 % de l'offre 3S) — effet de la médiane, à surveiller.
- Constat non traité : l'ordre des mots compte dans le nom de modèle (Head écrit « BREAK II TIE- » pour « Tie-Break II » ; SportSystem « Pro Freelift » pour « Freelift Pro ») : ces paires arrivent en file de revue au lieu d'être réunies à l'étape 2 (GAP-2026-09-30-01).
- Tests : `tests/unit/matching-textile-review.test.ts` (7 : score, prix indice seulement, Club / Club Pleat, Pro / Pro Londres, pas de même marchand ni de genres différents, ordre décroissant, bermuda ≠ short) ; 274 tests unitaires passent (`tracking.test.ts` échoue sans `DATABASE_URL`, comme avant) ; `tsc` et `eslint` propres ; jeu R1 inchangé.
- **Non fait, en attente de Mathieu** : écriture en prod dans `match_*` (`npm run match:shadow`, remplace le passage r4.5-a) ; relecture de `revue-textile.csv` (dossier `rapport-passage-dryrun/`, non versionné) ; le point du millésime (Mathieu ne sait pas).
- **Décision de Mathieu (fin de session)** : l'écriture en prod dans `match_*` se fera dans la **prochaine conversation** (`npm run match:shadow`, sans `--dry-run`, après un dernier passage à blanc de contrôle), **puis** commit et PR. D'ici là, tout le travail de R4.5-b reste **non commité** dans l'arbre de travail (dossier `rapport-passage-dryrun/` non versionné compris).
- Prochaine étape : écriture en prod + commit + PR de R4.5-b (Sonnet), puis **R4.5-c** (liste `generationUnique`, Opus).

## 2026-09-30 (session desktop, Sonnet) — R4.5-b : écriture en prod, commit, PR

- Reprise de session : modèle actuel Sonnet, recommandé Sonnet (exécution d'une décision déjà prise).
- Passage à blanc de contrôle (`--dry-run --out rapport-passage-dryrun-2`, 5 035 offres) : les 6 fichiers du rapport sont **identiques** (hash) à ceux du passage à blanc précédent.
- Écriture en prod (`npm run match:shadow`) : passage `f196b689-66ab-40db-967f-025e4a377b64`, engine `r4.5-b-textile`, **3 368 modèles, 4 722 liens** ; 250 paires en file de revue (`rapport-passage/revue-textile.csv`, dossier ignoré par git). Passages précédents supprimés (comportement par défaut).
- Commit sur branche et PR de R4.5-b ; les dossiers `rapport-passage-dryrun*` ne sont pas versionnés.
- Prochaine étape : relecture de `revue-textile.csv` par Mathieu, puis **R4.5-c** (Opus).

## 2026-09-30 (session desktop, Opus) — R4.5-c : proposition `generationUnique`, validée

- Reprise : `git fetch`, PR #118 (R4.5-b) mergée, `master` local remis à jour. Modèle actuel Opus, recommandé Opus (interprétation de données réelles et vérification web). Mathieu choisit R4.5-c ; la relecture de `revue-textile.csv` reste de son côté.
- Mesure sur `rapport-passage/proches.csv` (passage `r4.5-b-textile`) : `generationUnique` n'agit que si la génération n'est écrite d'aucun côté (`compare.ts`) ; 259 paires sur 27 familles sont dans ce cas sans autre cause.
- Constat : dans 9 familles, ces paires réunissent des articles différents (Base L / Base S, sac Pure Aero / Pure Drive, sac à chaussures / sac à raquettes Head Tour, T-Fight Club 17 / Tour 26, Speed 23 / 21…) : le blocage de génération masque des défauts d'extraction.
- Vérification web des autres familles : génération unique pour Endure Pro (2025), SFX Evo (2025, succède à la SFX 3), Avaluxe (ex-Stella Court), Game FF, Intrigue ; coloris de saison pour Courtflash ; références 2017 à 2025 pour Pulsion ; plusieurs générations pour Novak, Coco (2022, 2024), Ballfighter, AG-LT (21, 23 Ultra) et les familles déjà datées dans nos titres.
- **Réponses de Mathieu (D-2026-09-30-02)** : 7 familles marquées (les 5 sûres + Courtflash et Pulsion), « ultra » = AG-LT23, année d'un seul côté ne bloque plus pour une famille unique, défauts d'extraction corrigés dans une nouvelle étape **R4.5-d**. Document : `R4_5_c_generation_unique.md`.
- Journal condensé (266 lignes) : sessions R3.4 à R4.4 archivées telles quelles.
- Rien de modifié dans le code ni en base. Restes locaux non touchés (à supprimer sur confirmation de Mathieu) : dossier `rapport-passage-dryrun/`, branche locale `r4.5-b-textile-etape-3`.
- Prochaine étape : **report de R4.5-c (Sonnet)**, puis **R4.5-d (Sonnet)**.
