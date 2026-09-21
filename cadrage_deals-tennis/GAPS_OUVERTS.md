# Points ouverts

## GAP-2026-09-21-01 — `tasks.md` coché mais aucun code correspondant (RÉSOLU)

`cadrage_deals-tennis/tasks.md` listait des tâches marquées `[x]` sans aucun code réel correspondant, et des liens pointant vers `C:/Users/lenoi/mon-projet/specs/...` (un autre projet).

**Résolution (D-2026-09-21-05)** : toutes les cases ont été décochées (`[x]` → `[ ]`), les liens corrigés pour pointer vers `cadrage_deals-tennis/`. `tasks.md` reflète maintenant une liste de tâches à faire, aucune n'étant réellement commencée.

**Statut** : résolu le 2026-09-21.

---

## GAP-2026-09-21-02 — Pas de dossier `hooks`/CI configuré pour la protection de branche (RÉSOLU)

Le protocole prévoit un flux branche → PR → CI → merge une fois une protection de branche en place, mais aucun remote GitHub/CI n'est encore configuré.

**Résolution (chantier CI + protection de branche, D-2026-09-21-11)** : dépôt GitHub privé `lenoirmath122-dev/deals-tennis` créé et lié en `origin`. Workflow GitHub Actions (`.github/workflows/ci.yml`) exécutant lint + build + tests unitaires (`npm run test:unit`, nouveau script scoping vitest à `tests/unit/`) sur chaque push/PR vers `master`, avec `DATABASE_URL` en secret repo (requis même sans tests de contrat : `lib/db.ts` évalue la connexion Neon au chargement du module, donc `next build` échoue sans cette variable). Protection de branche `master` activée : check `build-and-test` obligatoire avant merge, force-push et suppression de branche interdits. Merge squash uniquement + suppression automatique de la branche source configurés sur le repo (conforme au protocole point 4).

**Statut** : résolu le 2026-09-21.
