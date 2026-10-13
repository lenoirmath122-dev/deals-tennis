# Reprise (réécrit à chaque passation)
**Dernière passation** : 2026-10-13 (R5 session 3). Branche de travail : toujours partir de `origin/master`.
## Où on en est
- Rapprochement multi-niveaux : R0 à R4.6-d faits ; passage prod courant `f07bcbab-8f53-4820-ad4d-1aec9eed6759` (engine `r4.6-d`). Ancien passage `87987663…` conservé (retour arrière).
- R5 session 1 : `lib/match-read.ts` (`getMatchRunId`, `getModelOffers`, `getLinkedModelOffers`, `getFamilyOtherModels`). Flag `MATCH_DISPLAY_ENABLED` (défaut off) + `MATCH_RUN_ID` : variables à créer sur Vercel pour la recette.
- R5 session 2 : fiche article (`app/deal/[dealId]/page.tsx`) lit les offres du même modèle si flag on et offre rattachée ; sinon ancien affichage `product_id`.
- R5 session 3 : section « Autres générations » sur la fiche (même flag). `isOtherGeneration` : même famille ET mêmes attributs (genre, public, modèle, surface, version…) sauf génération/année/millésime/édition différente. Échantillon prod : chaussures 97/459 fiches, raquettes 16/182, textile 61/706, cordages 0.
- Réserve : libellé = génération/année si connue, sinon titre de la 1re offre ; ordre des générations = signature (non chronologique). Cadrage fin de GAP-2026-09-30-02 (ordre, « génération courante ») à valider en recette.

## Prochaine étape (une session)
R5 session 4 : recette sur preview Vercel (créer `MATCH_DISPLAY_ENABLED`/`MATCH_RUN_ID` en preview), contrôle de quelques fiches par catégorie, puis activation prod = décision de Mathieu. Suppression de `87987663…` seulement après R5 validée en prod et accord explicite.

## À lire si besoin
- `R5_dossier_decision.md`, `ROADMAP.md`, `RISQUES_OUVERTS.md` (GAP-2026-09-30-02).

## Points d'attention
- Non traité : copies `deals-tennis-pr141/142*` et dossiers `rapport-*` à nettoyer ; sens de « SF » (Head Sprint Pro 4.0) inconnu.
