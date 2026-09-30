# Cadrage — Tennis Deals Catalog (deals-tennis)

Point d'entrée et protocole de reprise du projet. À lire dans cet ordre en début de session :

0. Appliquer la section « Choix du modèle » de [CLAUDE.md](../CLAUDE.md) au début de la session et avant chaque nouvelle tâche : si le modèle actuel correspond à la recommandation, l'indiquer en une ligne ; sinon, poser directement une question interactive (pas de texte + arrêt séparés) avant toute action.
1. [ETAT_ACTUEL.md](./ETAT_ACTUEL.md) — où en est le projet.
2. [GAPS_OUVERTS.md](./GAPS_OUVERTS.md) — points ouverts non résolus.
3. Dernière entrée de [JOURNAL_SESSIONS.md](./JOURNAL_SESSIONS.md) — ce qui s'est passé la dernière fois.
4. **Tant que le chantier « vrais bons plans » / rapprochement multi-niveaux est en cours** (voir GAP-2026-09-25-19) : le §10 « Phasage et impact sur le cadrage principal » de [CADRAGE_rapprochement-multi-niveaux.md](./CADRAGE_rapprochement-multi-niveaux.md) et la section 6 « Amendements post Phase 0 » de [CADRAGE_vrais-bons-plans.md](./CADRAGE_vrais-bons-plans.md) — c'est ce phasage (ordre global révisé, étapes R0-R5) qui détermine la prochaine étape légitime, pas une proposition de pistes ouvertes. Ne jamais proposer une étape hors de cet ordre (ex. R3 avant R0-R2) comme piste valide.

## Documents

- [DECISIONS_FONCTIONNELLES.md](./DECISIONS_FONCTIONNELLES.md) — décisions structurantes numérotées (D-AAAA-MM-JJ-NN).
- [CADRAGE_vrais-bons-plans.md](./CADRAGE_vrais-bons-plans.md) / [CADRAGE_rapprochement-multi-niveaux.md](./CADRAGE_rapprochement-multi-niveaux.md) — cadrages du chantier en cours (historique de prix, verdict, rapprochement produit multi-niveaux R0-R5).
- [R0_diagnostic-rapprochement.md](./R0_diagnostic-rapprochement.md) — résultats de l'étape R0 (diagnostic, aucune modification).
- [R1_jeu-reference-candidat.csv](./R1_jeu-reference-candidat.csv) / [R1_mesure.md](./R1_mesure.md) — jeu de référence R1 (67 paires, toutes validées, D-2026-09-27-03 et D-2026-09-27-07) et mesure réelle de l'algorithme actuel.
- [R2_referentiel.md](./R2_referentiel.md) — référentiel de familles de modèles v1 (`config/model-families.ts`) : contenu, méthode d'amorçage, anomalies de marque, questions Q7-Q11 (règles de tolérance et Q1-Q6 : `config/matching-rules.ts`).
- [R3_cadrage.md](./R3_cadrage.md) — cadrage de R3 (capture à l'ingestion) : ce qui est déjà acté, état du code, découpage R3.1 à R3.13, réponses de Mathieu R3-Q1 à R3-Q6 (D-2026-09-28-04).
- [R4_cadrage.md](./R4_cadrage.md) — cadrage de R4 (moteur de rapprochement en mode fantôme) : mesures sur la prod, principes, découpage R4.1 à R4.6 (+ R4.4-bis, phase de correction), réponses de Mathieu R4-Q1 à R4-Q8 (D-2026-09-29-01).
- [R4_4_controle.md](./R4_4_controle.md) — contrôle de R4.1 à R4.4 (2026-09-29) : faux regroupements trouvés en prod, défauts D1 à D5, blocages des raquettes, contenu de la phase de correction R4.4-bis (D-2026-09-29-03).
- [R4_2_complement_referentiel.md](./R4_2_complement_referentiel.md) / [R4_3_complement_referentiel.md](./R4_3_complement_referentiel.md) / [R4_4_complement_referentiel.md](./R4_4_complement_referentiel.md) — compléments du référentiel décidés en R4.2, R4.3 et R4.4.
- [R4_4_rapport_passage.md](./R4_4_rapport_passage.md) — rapport du passage en mode fantôme de R4.4.
- [R4_5_cadrage.md](./R4_5_cadrage.md) — cadrage de R4.5 (textile et correspondance approchée) : mesures sur la prod, référence de style, signature textile, file de revue, réponses de Mathieu T-Q1 à T-Q7 (D-2026-09-29-04).
- [R4_5_mesure_separation.md](./R4_5_mesure_separation.md) — mesure des offres séparées faute d'information (références de style, leviers L1 à L3, solution §5.4).
- [R4_5_revue_textile.md](./R4_5_revue_textile.md) / [.csv](./R4_5_revue_textile.csv) — relecture des 215 paires de la file de revue textile (propositions ligne à ligne de Claude Code), constats sur les références et GTIN, arbitrages de Mathieu (D-2026-09-30-04).
- [R4_5_references_style.md](./R4_5_references_style.md) — étape 4 : forme des références par source, simulation du moteur (170 → 229 modèles multi-marchands), textile (Lacoste, Head, Babolat, Tecnifibre), réponses de Mathieu (D-2026-09-30-05), code (PR #125) et écriture en prod faits le 2026-09-30.
- [R4_5_etape5_corrections.md](./R4_5_etape5_corrections.md) — étape 5 : défauts d'extraction rejoués sur la prod, corrections sur règles décidées (A1 à A10) et règles nouvelles (B1 à B8), réponses de Mathieu (D-2026-09-30-07), liste à reporter en code (§6).
- [R4_5_etape6_indetermine.md](./R4_5_etape6_indetermine.md) — étape 6 : état « indéterminé » dans `compare()`, mesure sur la prod (1 690 paires « proche » sur 3 036 deviennent « indéterminé »), frontière marqueur / caractéristique descriptive (D-2026-09-30-08), liste à reporter en code (§4).
- [R4_5_etape7_indetermines.md](./R4_5_etape7_indetermines.md) — étape 7 : investigation des paires indéterminées (sort B testé et rejeté, défauts trouvés, nouvelles sources : URL Head, prix des cordages, jauge Tennispro.fr / Head), sort A partout (D-2026-09-30-09), liste à reporter en code (§8).
- [R4_5_c_generation_unique.md](./R4_5_c_generation_unique.md) — R4.5-c : familles `generationUnique` (mesure sur `proches.csv`, vérification web), défauts d'extraction masqués par la génération, réponses de Mathieu Q1 à Q5 (D-2026-09-30-02). Report placé après l'état « indéterminé » (D-2026-09-30-03).
- [REPERAGE_marchands_prompt-cowork.md](./REPERAGE_marchands_prompt-cowork.md) — prompt de repérage de nouveaux marchands (Claude cowork, hors dépôt), voir D-2026-09-26-02 et D-2026-09-27-02.
- [REPERAGE_marchands_resultat-cowork.md](./REPERAGE_marchands_resultat-cowork.md) / [.csv](./REPERAGE_marchands_resultat-cowork.csv) — rapport cowork tel quel (18 candidats) ; le CSV porte les colonnes `verif_claude_code` et `decision_mathieu` (remplie pour le top 5).
- [REPERAGE_marchands_verification.md](./REPERAGE_marchands_verification.md) — vérification réelle du top 5, mesure du recouvrement Tennis Achat / Tennispro.fr (2026-09-27) et décisions prises.
- [archive/mvp/](./archive/mvp/) — spécification et plan du MVP (spec, plan, tasks, data-model, contracts…), état au 2026-09-24, non tenu à jour.
- [archive/](./archive/) — versions détaillées intégrales des anciens fichiers de suivi (état/journal), déplacées ici quand la synthèse courante dépasse son seuil. **Ne consulter que si la synthèse en cours ne suffit pas pour un point précis** — ce n'est jamais la source de vérité de l'état courant.

## Règles de travail (rappel)

- Une étape de build par conversation, jamais plusieurs enchaînées.
- Toute décision structurante est soumise explicitement avant d'être actée.
- Question posée à Mathieu = arrêt et attente de la réponse ; jamais « avec l'accord de Mathieu » sans réponse explicite (§0 règle 7 de `CADRAGE_vrais-bons-plans.md`).
- Chaque étape livrée est vérifiée avec des données réelles, pas seulement des tests unitaires.
- Flux branche → PR → CI → merge squash. Depuis D-2026-09-23-03 : push de la branche + création de la PR **automatiques** en fin d'étape de build, sans redemander confirmation à chaque fois (le merge, lui, reste manuel — décision de l'utilisateur après revue CI). Toute action git destructrice (reset --hard, push --force, suppression de branche) reste soumise à confirmation explicite au cas par cas.

## Seuils d'archivage des fichiers de suivi (D-2026-09-22-09)

- `ETAT_ACTUEL.md` : seuil 150 lignes. Au-delà, condenser chaque phase/chantier **terminé** en une ligne et déplacer son détail intégral dans `archive/` ; seul le chantier **en cours** garde son détail complet ici.
- `JOURNAL_SESSIONS.md` : seuil 150 lignes. Au-delà, garder les sessions récentes en clair et déplacer les plus anciennes, telles quelles, dans `archive/`.
- `GAPS_OUVERTS.md` : pas de seuil de taille — un gap tranché est retiré du fichier ; le texte retiré va tel quel dans `archive/GAPS_OUVERTS_retires_*.md` (la décision `D-xxx` qui le clôt fait foi).
- `DECISIONS_FONCTIONNELLES.md` : **jamais archivé** (registre consulté par référence d'ID, pas relu intégralement à chaque reprise).
