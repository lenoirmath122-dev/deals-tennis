# Points ouverts

## GAP-2026-09-21-01 — `tasks.md` coché mais aucun code correspondant (RÉSOLU)

`cadrage_deals-tennis/tasks.md` listait des tâches marquées `[x]` sans aucun code réel correspondant, et des liens pointant vers `C:/Users/lenoi/mon-projet/specs/...` (un autre projet).

**Résolution (D-2026-09-21-05)** : toutes les cases ont été décochées (`[x]` → `[ ]`), les liens corrigés pour pointer vers `cadrage_deals-tennis/`. `tasks.md` reflète maintenant une liste de tâches à faire, aucune n'étant réellement commencée.

**Statut** : résolu le 2026-09-21.

---

## GAP-2026-09-21-02 — Pas de dossier `hooks`/CI configuré pour la protection de branche

Le protocole prévoit un flux branche → PR → CI → merge une fois une protection de branche en place, mais aucun remote GitHub/CI n'est encore configuré.

**Impact** : Tant que ce n'est pas en place, le flux restera en local (commits directs sur `master` en attendant).

**Statut** : ouvert, pas bloquant pour démarrer le cadrage fonctionnel.
