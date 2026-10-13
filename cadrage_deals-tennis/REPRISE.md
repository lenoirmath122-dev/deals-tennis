# Reprise (réécrit à chaque passation)
**Dernière passation** : 2026-10-13 (R5 session 2). Branche de travail : toujours partir de `origin/master`.
## Où on en est
- Rapprochement multi-niveaux : R0 à R4.6-d faits ; passage prod courant `f07bcbab-8f53-4820-ad4d-1aec9eed6759` (engine `r4.6-d`). Ancien passage `87987663…` conservé (retour arrière).
- R5 session 1 faite : `lib/match-read.ts` (`getMatchRunId`, `getModelOffers`, `getFamilyOtherModels`), tests unit + contrat, sans UI. Flag `MATCH_DISPLAY_ENABLED` (défaut off) + `MATCH_RUN_ID` : variables à créer sur Vercel pour la recette (session 4).
- R5 session 2 faite : fiche article (`app/deal/[dealId]/page.tsx`) lit `getLinkedModelOffers` si flag on et offre rattachée ; sinon ancien affichage `product_id`. Test contrat ajouté.

## Prochaine étape (une session)
R5 session 3 : section « autres générations » (`getFamilyOtherModels`) sur la fiche, derrière flag, sans « meilleur prix » entre générations. Voir `R5_dossier_decision.md` §4.
Ensuite : session 4 recette preview puis activation prod (décision de Mathieu). Suppression de `87987663…` seulement après R5 validée en prod et accord explicite.

## À lire si besoin
- `R5_dossier_decision.md`, `ROADMAP.md`, `RISQUES_OUVERTS.md`.

## Points d'attention
- Non traité : copies `deals-tennis-pr141/142*` et dossiers `rapport-*` à nettoyer ; sens de « SF » (Head Sprint Pro 4.0) inconnu.
