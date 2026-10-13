# Reprise (réécrit à chaque passation)
**Dernière passation** : 2026-10-13. Branche de travail : toujours partir de `origin/master`.
## Où on en est
- Rapprochement multi-niveaux : R0 à R4.6-c faits ; **R4.6-d (bascule) en cours**.
- Étape 1 faite : C2 et C3b codées, engine `r4.6-d` (PR #153, à fusionner par Mathieu avant l'étape 2).
- Valeur de source `convention` : sert au rapprochement, jamais publiée au canonique (complément de D-2026-10-07-02).
- Dernier passage prod : `87987663-56cc-4fe7-adc3-2955405a716a` (engine `r4.6-b`, 4 011 modèles, tables `match_*` seulement).

## Prochaine étape (une session)
1. Vérifier que la PR #153 est fusionnée, partir de `origin/master`.
2. Passage à blanc en prod : `npm run match:shadow -- --dry-run` (lecture seule). Attendu : 181 → 190 multi-marchands hors textile, 4 011 → 3 995 modèles, 0 incohérent, 13 conflits.
3. Relire les modèles nouveaux ou modifiés ; vérifier qu'aucune fiche Babolat sans jauge ne réunit deux jauges fixes (réserve C3b).
4. Écriture en prod et bascule : **seulement avec accord explicite de Mathieu**.

## À lire si besoin
- `ROADMAP.md`, `R4_6_conventions_valeur_absente.md` (§3-4), `R4_6_d_bascule.md`, `DECISIONS_FONCTIONNELLES.md` (Grep D-2026-10-07-02).

## Points d'attention
- `CLAUDE.md` racine : section « Suivi » modifiée en local, jamais commitée (à décider par Mathieu).
- Non traité : copies `deals-tennis-pr141/142*` et dossiers `rapport-*` à nettoyer ; sens de « SF » (Head Sprint Pro 4.0) inconnu.
