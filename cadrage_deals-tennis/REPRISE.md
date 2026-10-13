# Reprise (réécrit à chaque passation)
**Dernière passation** : 2026-10-13 (R5.5). Branche de travail : toujours partir de `origin/master`.
## Où on en est
- Rapprochement multi-niveaux : R0 à R4.6-d faits ; passage prod `f07bcbab-8f53-4820-ad4d-1aec9eed6759` (engine `r4.6-d`). Ancien passage `87987663…` conservé (retour arrière).
- R5 sessions 1-4 fusionnées (#158 à #161) : couche `lib/match-read.ts`, fiche article derrière flag, section « Autres générations », recette preview (défauts relevés).
- R5.5 faite, PR #162 ouverte (non fusionnée, CI à attendre) : seuls `generation`/`annee` comptent (`edition`/`millesime` = variantes, décision RG = non), génération exigée des deux côtés et de même nature, libellé « Marque Famille, génération X », modèles de même génération fusionnés, offres dédoublonnées.
- Contrôle sur le passage prod : 15 paires, toutes de vraies générations de chaussures ; textile : aucune section. Raquettes/Propulse (année d'un seul côté) écartées par prudence.

## Prochaine étape (une session)
Après fusion de #162 par Mathieu : nouvelle recette preview (échantillon de fiches chaussures + textile + raquettes, libellés, absence de faux positifs). Puis activation prod (`MATCH_DISPLAY_ENABLED`, `MATCH_RUN_ID` en Production) = décision de Mathieu. Suppression de `87987663…` seulement après R5 validée en prod et accord explicite.

## À lire si besoin
- `R5_dossier_decision.md`, `RISQUES_OUVERTS.md` (GAP-2026-09-30-02).
- Recette preview : `vercel curl <chemin> --deployment <url> --scope lenoir-nba` (préfixer `MSYS_NO_PATHCONV=1` sous Git Bash).

## Points d'attention
- `tests/unit/tracking.test.ts` échoue sans `DATABASE_URL` dans le shell (sans lien avec R5).
- Non traité : copies `deals-tennis-pr141/142*` et dossiers `rapport-*` à nettoyer ; sens de « SF » (Head Sprint Pro 4.0) inconnu ; section « Autres éditions » (RG, athlète) éventuelle, hors R5.
