@AGENTS.md

## Choix du modèle

Au début de chaque session, et avant de commencer chaque nouvelle tâche, écris une ligne :
« Modèle actuel : X. Modèle recommandé pour cette tâche : Y, parce que … »

Grille :
- Opus : cadrage, diagnostic, conception (modèle de données, règles de rapprochement, étapes R0-R2), interprétation de données réelles (fiches marchands, références fabricant, prod), revue de PR, débogage non trivial, toute décision que Mathieu devra valider.
- Sonnet : exécution d'une spec déjà validée (écriture ou réécriture de scripts, migrations prévues, tests), mises à jour de la doc de suivi (ETAT_ACTUEL, JOURNAL, GAPS), corrections ciblées.
- En cas de doute : Opus.

Si le modèle actuel ne correspond pas à la recommandation, ARRÊTE-TOI avant toute action et demande-moi de changer via /model. Si je réponds explicitement de continuer, continue et note-le dans le JOURNAL.
Une session qui mélange les deux types de tâches se découpe : le cadrage avec Opus, puis l'exécution avec Sonnet dans une nouvelle session.
