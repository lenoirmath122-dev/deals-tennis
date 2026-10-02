@AGENTS.md

## Choix du modèle

Au début de chaque session, et avant de commencer chaque nouvelle tâche, détermine le modèle recommandé (grille ci-dessous) et compare-le au modèle actuel.

Grille :
- Opus : cadrage, diagnostic, conception (modèle de données, règles de rapprochement, étapes R0-R2), interprétation de données réelles (fiches marchands, références fabricant, prod), revue de PR, débogage non trivial, toute décision que Mathieu devra valider.
- Sonnet : exécution d'une spec déjà validée (écriture ou réécriture de scripts, migrations prévues, tests), mises à jour de la doc de suivi (ETAT_ACTUEL, JOURNAL, GAPS), corrections ciblées.
- En cas de doute : Opus.

**Si le modèle actuel correspond à la recommandation** : écris une ligne « Modèle actuel : X. Modèle recommandé pour cette tâche : X. » et continue.

**Si le modèle actuel ne correspond pas** : ne pas écrire cette ligne séparément — poser directement une question interactive (AskUserQuestion) intégrant le raisonnement, par exemple « Modèle actuel Sonnet, cette tâche relève plutôt d'Opus parce que [raison] — je change et je continue / je continue quand même sur Sonnet ? ». Ne jamais calculer la recommandation puis la reformuler deux fois (texte + question) : le raisonnement n'apparaît qu'une fois, dans la question. Si je continue quand même sur l'autre modèle, le noter dans le JOURNAL.
Une session qui mélange les deux types de tâches se découpe : le cadrage avec Opus, puis l'exécution avec Sonnet dans une nouvelle session.

## Git : commit, push et PR automatiques

En fin de tâche (code ou documentation de suivi), commiter sur une branche dédiée, pousser (`git push -u origin <branche>`) et ouvrir la PR (`gh pr create`) **sans demander confirmation** (consigne de Mathieu, 2026-09-30). Avant : `git fetch`, partir de `origin/master` à jour et vérifier que la branche courante n'est pas déjà fusionnée (`gh pr list --state all`). Jamais de commit direct sur `master`, jamais de force-push, jamais de merge (décision de Mathieu après la CI), jamais de suppression de branche sans confirmation. Ne pas versionner les dossiers de rapport locaux (`rapport-*`).
