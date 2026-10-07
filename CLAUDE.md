@AGENTS.md

## Git : commit, push et PR automatiques

En fin de tâche (code ou documentation de suivi), commiter sur une branche dédiée, pousser (`git push -u origin <branche>`) et ouvrir la PR (`gh pr create`) **sans demander confirmation** (consigne de Mathieu, 2026-09-30). Avant : `git fetch`, partir de `origin/master` à jour et vérifier que la branche courante n'est pas déjà fusionnée (`gh pr list --state all`). Jamais de commit direct sur `master`, jamais de force-push, jamais de merge (décision de Mathieu après la CI), jamais de suppression de branche sans confirmation. Ne pas versionner les dossiers de rapport locaux (`rapport-*`).
