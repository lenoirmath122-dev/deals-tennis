# Points ouverts

## GAP-2026-09-21-01 — `tasks.md` coché mais aucun code correspondant (RÉSOLU)

`cadrage_deals-tennis/tasks.md` listait des tâches marquées `[x]` sans aucun code réel correspondant, et des liens pointant vers `C:/Users/lenoi/mon-projet/specs/...` (un autre projet).

**Résolution (D-2026-09-21-05)** : toutes les cases ont été décochées (`[x]` → `[ ]`), les liens corrigés pour pointer vers `cadrage_deals-tennis/`. `tasks.md` reflète maintenant une liste de tâches à faire, aucune n'étant réellement commencée.

**Statut** : résolu le 2026-09-21.

---

## GAP-2026-09-21-03 — Pas de compte Awin publisher, datafeed non vérifiable (OUVERT)

Tennis Point FR (Awin #13266) et Padel-Point FR (Awin #25160) annoncent un flux de données produit (datafeed) dans les avantages de leur programme Awin, mais le format exact (CSV/XML, champs, fréquence) n'est visible qu'après création d'un compte affilié Awin et acceptation de la candidature sur chacun des deux programmes. Aucun compte Awin n'existe à ce jour.

**Bloquant sur** : action de l'utilisateur, hors périmètre de Claude Code (création de compte, informations d'entreprise/paiement, candidature aux programmes).

**Statut** : ouvert au 2026-09-21.

---

## GAP-2026-09-21-04 — Photo de terrain (fond hero) pas encore fournie (OUVERT)

Le chantier « Charte graphique / design system » (D-2026-09-21-13) prévoit un fond de section hero en photo de terrain (gazon ou terre battue), à fournir par l'utilisateur. Aucun fichier reçu à ce jour — l'application des tokens de charte à `app/globals.css`/aux composants ne peut pas inclure le vrai fond tant que l'image n'est pas fournie (un placeholder devra être utilisé en attendant si le build démarre avant réception).

**Bloquant sur** : action de l'utilisateur (fournir le fichier image).

**Statut** : ouvert au 2026-09-21.

---

## GAP-2026-09-21-02 — Pas de dossier `hooks`/CI configuré pour la protection de branche (RÉSOLU)

Le protocole prévoit un flux branche → PR → CI → merge une fois une protection de branche en place, mais aucun remote GitHub/CI n'est encore configuré.

**Résolution (chantier CI + protection de branche, D-2026-09-21-11)** : dépôt GitHub privé `lenoirmath122-dev/deals-tennis` créé et lié en `origin`. Workflow GitHub Actions (`.github/workflows/ci.yml`) exécutant lint + build + tests unitaires (`npm run test:unit`, nouveau script scoping vitest à `tests/unit/`) sur chaque push/PR vers `master`, avec `DATABASE_URL` en secret repo (requis même sans tests de contrat : `lib/db.ts` évalue la connexion Neon au chargement du module, donc `next build` échoue sans cette variable). Protection de branche `master` activée : check `build-and-test` obligatoire avant merge, force-push et suppression de branche interdits. Merge squash uniquement + suppression automatique de la branche source configurés sur le repo (conforme au protocole point 4).

**Statut** : résolu le 2026-09-21.
