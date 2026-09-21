# Cadrage — Tennis Deals Catalog (deals-tennis)

Point d'entrée et protocole de reprise du projet. À lire dans cet ordre en début de session :

1. [ETAT_ACTUEL.md](./ETAT_ACTUEL.md) — où en est le projet.
2. [GAPS_OUVERTS.md](./GAPS_OUVERTS.md) — points ouverts non résolus.
3. Dernière entrée de [JOURNAL_SESSIONS.md](./JOURNAL_SESSIONS.md) — ce qui s'est passé la dernière fois.

## Documents

- [DECISIONS_FONCTIONNELLES.md](./DECISIONS_FONCTIONNELLES.md) — décisions structurantes numérotées (D-AAAA-MM-JJ-NN).
- [spec.md](./spec.md) — spécification fonctionnelle (feature "Tennis Deals Catalog").
- [plan.md](./plan.md) — plan d'implémentation technique.
- [data-model.md](./data-model.md) — modèle de données.
- [research.md](./research.md) — notes de recherche technique.
- [quickstart.md](./quickstart.md) — guide de démarrage rapide visé.
- [tasks.md](./tasks.md) — découpage en tâches (⚠️ voir GAPS_OUVERTS.md — les cases cochées ne reflètent pas de code réel existant).
- [checklists/](./checklists/) — checklists de qualité des exigences.
- [contracts/](./contracts/) — contrats d'API (catalogue, ingestion, redirection).

## Règles de travail (rappel)

- Une étape de build par conversation, jamais plusieurs enchaînées.
- Toute décision structurante est soumise explicitement avant d'être actée.
- Chaque étape livrée est vérifiée avec des données réelles, pas seulement des tests unitaires.
- Pas de `git push` sans demande explicite ; flux branche → PR → CI → merge squash une fois la protection de branche en place.
