@AGENTS.md

## Choix du modèle Omniroute

Utilise Omniroute pour choisir un modèle adapté à la tâche, sans supposer qu'une session doit utiliser Opus ou Sonnet, et sans demander de changer de modèle avant de commencer.

- Pour le cadrage, le diagnostic complexe, la conception, l'interprétation de données réelles, les décisions métier à valider ou une revue approfondie, privilégie un modèle Omniroute de raisonnement/codage haut de gamme (par exemple `omniroute/auto/pro-reasoning` ou `omniroute/auto/best-reasoning`).
- Pour l'exécution d'une spécification validée, les scripts, migrations, tests, mises à jour de documentation de suivi et corrections ciblées, privilégie un modèle Omniroute efficace pour le codage (par exemple `omniroute/auto/best-coding` ou `omniroute/auto/coding`).
- En cas de doute, choisis le modèle Omniroute le plus capable disponible pour la tâche. Respecte les modèles et capacités réellement proposés dans l'environnement ; les exemples ci-dessus sont des choix indicatifs, pas une exigence de fournisseur ou de famille.

Ne demande une confirmation que si le choix du modèle implique un coût ou un changement de fournisseur inhabituel qui n'est pas déjà autorisé par la configuration Omniroute. Une tâche mêlant cadrage et exécution peut rester dans la même session ; adapte simplement le modèle si l'environnement permet de le faire sans interrompre le travail.

## Git : commit, push et PR automatiques

En fin de tâche (code ou documentation de suivi), commiter sur une branche dédiée, pousser (`git push -u origin <branche>`) et ouvrir la PR (`gh pr create`) **sans demander confirmation** (consigne de Mathieu, 2026-09-30). Avant : `git fetch`, partir de `origin/master` à jour et vérifier que la branche courante n'est pas déjà fusionnée (`gh pr list --state all`). Jamais de commit direct sur `master`, jamais de force-push, jamais de merge (décision de Mathieu après la CI), jamais de suppression de branche sans confirmation. Ne pas versionner les dossiers de rapport locaux (`rapport-*`).
