# Reprise (réécrit à chaque passation)
**Dernière passation** : 2026-10-13. Branche de travail : toujours partir de `origin/master`.
## Où on en est
- Rapprochement multi-niveaux : R0 à R4.6-d faits ; passage prod courant `f07bcbab-8f53-4820-ad4d-1aec9eed6759` (engine `r4.6-d`, 3 995 modèles, 4 732 liens). Ancien passage `87987663…` conservé (retour arrière).
- C2 adidas vérifiée (51 offres, aucun marqueur femme) : risque fermé.
- Le site ne lit encore aucune table `match_*` : R5 = développement.

## Prochaine étape (une session)
**Décision de Mathieu (2026-10-13) : go R5, bascule par feature flag** (désactivé par défaut, passage lu par identifiant en configuration, activation en deux temps : preview puis prod sur sa décision).
1. R5 session 1 : couche de lecture `match_*` + tests, sans UI, flag désactivé (voir `R5_dossier_decision.md` §4).
2. Suppression de `87987663…` : seulement après R5 validée en prod et accord explicite.

## À lire si besoin
- `R5_dossier_decision.md`, `ROADMAP.md`, `RISQUES_OUVERTS.md`.

## Points d'attention
- Non traité : copies `deals-tennis-pr141/142*` et dossiers `rapport-*` à nettoyer ; sens de « SF » (Head Sprint Pro 4.0) inconnu.
