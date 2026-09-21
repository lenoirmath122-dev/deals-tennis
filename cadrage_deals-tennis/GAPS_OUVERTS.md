# Points ouverts

## GAP-2026-09-21-01 — `tasks.md` coché mais aucun code correspondant

`cadrage_deals-tennis/tasks.md` liste des tâches marquées `[x]` (migration SQL, seed script, types TypeScript, client DB Neon, composants React, pages Next.js, tests unitaires/contrats) alors qu'aucun de ces fichiers n'existe dans le dépôt (pas de `package.json`, pas de dossier `app/`, `lib/`, `components/`, `scripts/`, `types/`, `tests/`).

Les chemins référencés dans `plan.md`/`tasks.md` pointent aussi vers `C:/Users/lenoi/mon-projet/specs/...`, un emplacement différent de `C:\dev\deals-tennis` — ces docs viennent probablement d'une génération faite ailleurs (outil spec-kit) et pas d'un travail réel sur ce dépôt.

**Impact** : Ne pas se fier à `tasks.md` comme reflet de l'avancement réel. À clarifier avec l'utilisateur : régénérer les tâches depuis zéro, ou les reprendre comme simple liste (en décochant tout) ?

**Statut** : ouvert, à trancher par l'utilisateur (décision structurante).

---

## GAP-2026-09-21-02 — Pas de dossier `hooks`/CI configuré pour la protection de branche

Le protocole prévoit un flux branche → PR → CI → merge une fois une protection de branche en place, mais aucun remote GitHub/CI n'est encore configuré.

**Impact** : Tant que ce n'est pas en place, le flux restera en local (commits directs sur `master` en attendant).

**Statut** : ouvert, pas bloquant pour démarrer le cadrage fonctionnel.
