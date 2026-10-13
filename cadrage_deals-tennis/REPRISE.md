# Reprise (réécrit à chaque passation)
**Dernière passation** : 2026-10-13 (recette R5.5). Branche de travail : toujours partir de `origin/master`.
## Où on en est
- Rapprochement multi-niveaux : R0 à R4.6-d faits ; passage prod `f07bcbab-8f53-4820-ad4d-1aec9eed6759` (engine `r4.6-d`). Ancien passage `87987663…` conservé (retour arrière).
- R5 fusionnée (#158 à #162) : couche `lib/match-read.ts`, fiche article derrière flag, section « Autres générations » (seuls `generation`/`annee` comptent, RG = variante), libellé « Marque Famille, génération X », dédoublonnage.
- Recette preview R5.5 faite : 572 familles lues, 4 familles de chaussures avec autres générations (Hypercourt, Vapor Lite, Avacourt, Barricade), rendu et libellés corrects ; textile et raquettes : aucune section, pas de faux positif.

## Prochaine étape
Décision de Mathieu : activer en prod (`MATCH_DISPLAY_ENABLED=true`, `MATCH_RUN_ID` en Production). Suppression de `87987663…` seulement après R5 validée en prod et accord explicite.

## À lire si besoin
- `R5_dossier_decision.md`, `RISQUES_OUVERTS.md` (GAP-2026-09-30-02).
- Recette preview : `vercel curl <chemin> --deployment <url> --scope lenoir-nba` (préfixer `MSYS_NO_PATHCONV=1` sous Git Bash).

## Points d'attention
- `tests/unit/tracking.test.ts` échoue sans `DATABASE_URL` dans le shell (sans lien avec R5).
- Non traité : copies `deals-tennis-pr141/142*` et dossiers `rapport-*` à nettoyer ; sens de « SF » (Head Sprint Pro 4.0) inconnu ; section « Autres éditions » (RG, athlète) éventuelle, hors R5 ; peu de paires (4 familles) : la section reste rare, à signaler à Mathieu avant activation.
