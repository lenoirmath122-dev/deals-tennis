# Journal des sessions — archive 2026-09-27 (repérage cowork à préparation R2)

Sessions déplacées telles quelles depuis `JOURNAL_SESSIONS.md` (seuil 150 lignes, condensation du 2026-09-28).

## 2026-09-27 — Retour du repérage cowork, vérification réelle du top 5

- Reprise (`/clear`), Opus (interprétation de données réelles). Mathieu a déposé deux fichiers issus de cowork (rapport + CSV, 18 candidats). Constat : GTIN, robots.txt et anti-bot restés « non vérifié » partout (cowork sans navigateur). Question posée (AskUserQuestion) : réponse « top 5, vérification maintenant dans cette conversation ».
- Fichiers renommés `REPERAGE_marchands_resultat-cowork.md/.csv` (contenu cowork inchangé), colonnes `verif_claude_code` et `decision_mathieu` ajoutées au CSV. Synthèse dans `REPERAGE_marchands_verification.md`.
- Vérification en lecture seule (`curl`, Playwright non headless pour Intersport seulement, `Crawl-delay: 60` de Tennis Achat respecté) : GTIN13 chez Sports Raquettes et Tennis Compagnie (GTIN 4570158165839 retrouvé chez les deux), `mpn` chez Extreme Tennis (JSON-LD) et Tennis Achat (dataLayer), Intersport bloqué par DataDome, pagination interdite par le robots.txt d'Extreme Tennis, prix barrés = prix conseillé chez Extreme Tennis et Tennis Achat.
- Découvertes : tennisdeals.be édité par SARL EXTREME TENNIS (complété dans GAP-2026-09-25-10) ; Tennis Achat édité par Tennispro SAS (même société que Tennispro.fr).
- GAP-2026-09-26-03 mis à jour. Aucune décision actée : 4 décisions listées pour Mathieu (§4 du document). Fichiers temporaires dans le dossier de session uniquement ; script Playwright jetable supprimé.

## 2026-09-27 (suite) — Décisions sur le repérage marchands, recouvrement Tennis Achat / Tennispro.fr

- Reprise (`/clear`), Opus (décisions à valider par Mathieu). PR #78 constatée mergée, branche fraîche `docs/reperage-decisions` depuis `origin/master`.
- 4 décisions du §4 soumises (AskUserQuestion). Réponses : nouveau nom à choisir ; Tennis Achat → « mesurer le recouvrement d'abord » ; clauses PI acceptées ; périmètre R3 avec Sports Raquettes, Tennis Compagnie, Extreme Tennis, Tennis Achat, et Intersport « si on peut contourner les restrictions ».
- Intersport : contournement du captcha DataDome refusé par Claude Code (anti-bot actif, même cas que Wilson) ; seule voie = affiliation Kwanko après le nouveau nom.
- Mesure Tennis Achat (lecture seule, Crawl-delay 60 respecté) : sitemaps des deux sites → ≥ 96,5 % de catalogue commun ; à la demande de Mathieu (« les prix sont les mêmes ? »), 12 paires comparées : prix conseillé identique 12/12, prix de vente identique 8/12, écarts de 3 à 13 % sur 4. Mathieu : garder Tennis Achat, en dernier dans R3, marqué même opérateur.
- Actées : D-2026-09-27-01 (nom), D-2026-09-27-02 (périmètre R3). GAP-2026-09-26-03 clos et retiré ; GAP-2026-09-25-10 mis à jour (nom restant à choisir). CSV `decision_mathieu` rempli, §5 ajouté au document de vérification. Fichiers temporaires dans le dossier de session uniquement.
- Prochaine étape : non déduite ici. Pistes légitimes : choix du nouveau nom (GAP-2026-09-25-10), ou reprise du chemin critique R1 (validation du CSV R1 par Mathieu).

## 2026-09-27 (suite 2) — Vue d'ensemble, CSV R1 validé, nom « Bonplantennis »

- Reprise (`/clear`), Opus. Demande 1 : point global du projet vers l'objectif « site quasi autonome » (réponse en conversation, rien de consigné : synthèse d'`ETAT_ACTUEL.md`, des GAPS et des phasages existants).
- Demande 2 : Mathieu valide tout le CSV R1 et choisit le nom « Bonplantennis ». Branche fraîche `docs/r1-valide-nom-bonplantennis` depuis `origin/master` (#79 mergée).
- **D-2026-09-27-03** : `decision_mathieu` rempli sur les 38 lignes (proposition acceptée telle quelle), `R1_mesure.md` §7 ajouté. Paire 7 signalée à Mathieu (incohérente avec la règle des générations au vu de la paire 6), reclassée « différent » sur sa réponse (14 / 9 / 15, mesure inchangée). Session close à la demande de Mathieu.
- **D-2026-09-27-04** : vérification de disponibilité en lecture seule — DNS + RDAP (Verisign, AFNIC) : 9 domaines libres ; recherche web : aucun site « Bonplantennis », usage générique « bons plans tennis » chez Tennis Compagnie et Extreme Tennis ; data.inpi.fr via Playwright non headless : 0 marque « bonplantennis », recherche « bon plan tennis » bloquée par Cloudflare (non forcée), EUIPO non consulté. Script Playwright jetable exécuté puis supprimé.
- GAP-2026-09-25-19 et GAP-2026-09-25-10 mis à jour.
- Prochaine étape : non déduite ici. Pistes légitimes : renommage de la marque affichée (build, Sonnet), complément du jeu R1 à 50-100 paires (Opus).

## 2026-09-27 (suite 3) — Complément du jeu R1 (paires 39-67)

- Reprise (`/clear`), Opus. Mathieu choisit le complément du jeu R1 (plutôt que le renommage). Branche `docs/r1-complement-jeu` depuis `origin/master` (#80 mergée, rien en retard).
- 29 paires inter-marchands proposées (15 identiques / 8 proches / 6 différents), vérifiées sur les fiches (SportSystem, Tennis Point FR, Sport 2000, Tecnifibre ; Tennispro à 1 requête/min). Jeu complet : précision 5/8, rappel 5/29, inter-marchands 2/26. `R1_mesure.md` §8.
- Scripts jetables (`tmp-r1/`, pages en scratchpad) supprimés en fin de session. Deux questions tranchées par Mathieu : D-2026-09-27-05 (cordages, jauge différente = proche), D-2026-09-27-06 (textile, identique sauf génération explicitement différente → proche) ; §5 du cadrage mis à jour, paires 54/58/60 → identique (18 / 5 / 6).
- D-2026-09-27-07 : Mathieu valide les 29 paires (59 « proche » confirmé), sacs sous la règle des générations sauf article identique. Jeu R1 = 67 paires validées ; référence : 5/8, 5/32, inter 2/29. PR #81 mergée avant le 2e commit : repris sur `docs/r1-regles-jauge-textile` (PR #82).
- Prochaine étape du phasage : R2 (référentiel v1 et règles de tolérance).

## 2026-09-27 (suite 4) — Explications avant R2, deux points de maintenance du référentiel notés

- Reprise (`/clear`), Opus. Prochaine étape du phasage confirmée : R2. Mathieu demande d'abord, sans lancer R2, comment les choix de R2 se traduiront une fois les modèles construits, puis comment seront gérés les nouveaux articles, les nouveaux noms et un article existant qui apparaît chez un nouveau marchand (réponses en conversation, fondées sur les §4, §5, §7 et §8 du cadrage rapprochement et sur des paires réelles du jeu R1).
- Deux manques constatés, absents de tout document : repérage des familles/libellés inconnus du référentiel, et effet des validations de la file de revue sur le référentiel. Notés à la demande de Mathieu : GAP-2026-09-27-01 et GAP-2026-09-27-02, avec le moment de traitement jugé le plus cohérent (R2 pour le principe du 2, R4 pour le cadrage du 1, R5 et Phase 5 pour la construction). Renvoi ajouté dans GAP-2026-09-25-19.
- Journal condensé (seuil 150 lignes) : sessions du 2026-09-25 archivées telles quelles.
- Prochaine étape : R2, dans une nouvelle conversation (décision de Mathieu). Question encore ouverte : intégrer ou non les sous-catégories d'accessoires (GAP-2026-09-25-11) à R2.

