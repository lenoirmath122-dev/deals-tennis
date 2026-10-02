---
titre: Politique d'archivage des fichiers de suivi
decision_id: D-2026-09-21-04
date: 2026-09-21
statut: actée
---

## Contexte

Les fichiers de suivi (`ETAT_ACTUEL.md`, `GAPS_OUVERTS.md`, `JOURNAL_SESSIONS.md`) risquaient de grossir indéfiniment session après session sans mécanisme d'allègement.

## Décision

Ces fichiers restent des synthèses courtes, réécrites à chaque point d'étape significatif plutôt que complétées ligne après ligne. Quand une synthèse devient trop lourde, elle est réécrite en version condensée et la version détaillée intégrale est déplacée telle quelle (non modifiée) dans `cadrage_deals-tennis/archive/`. Les documents normatifs (spec, plan, data-model, contracts) ne sont jamais résumés — seuls les documents de suivi sont candidats à la synthèse+archivage. `INDEX.md` référence l'existence de l'archive sans en faire la source de vérité de l'état courant.

## Statut

Actée (confirmée explicitement par l'utilisateur).
