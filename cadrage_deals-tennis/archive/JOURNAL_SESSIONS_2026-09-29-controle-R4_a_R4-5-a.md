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


> Sessions ci-dessous (2026-09-29 soir, session cloud) reportées telles quelles depuis la PR #117, fermée sans merge (D-2026-09-30-03). L'archive de journal qu'elles citent (`JOURNAL_SESSIONS_2026-09-28-R3-4_a_R4-4bis.md`) n'a pas été reprise : l'archivage équivalent sur `master` est `archive/JOURNAL_SESSIONS_2026-09-28-R3-4_a_2026-09-29-R4-4.md` et le fichier présent.
