# Reprise (réécrit à chaque passation)
**Dernière passation** : 2026-10-13 (R5 session 4). Branche de travail : toujours partir de `origin/master`.
## Où on en est
- Rapprochement multi-niveaux : R0 à R4.6-d faits ; passage prod `f07bcbab-8f53-4820-ad4d-1aec9eed6759` (engine `r4.6-d`). Ancien passage `87987663…` conservé (retour arrière).
- R5 sessions 1-3 fusionnées (#158, #159, #160) : couche `lib/match-read.ts`, fiche article derrière flag, section « Autres générations ».
- R5 session 4 (recette) : variables `MATCH_DISPLAY_ENABLED=true` et `MATCH_RUN_ID` créées en Preview Vercel (secrets) ; preview redéployée, flag actif. 400 fiches (≈9 %) relues, aucune erreur de rendu.
- Défauts : (1) libellé « Génération X » faux en textile (athlète/ville/édition : alcaraz, new york, rg…) ; (2) libellés dupliqués ; (3) faux positifs (même modèle, titre ou couleur différents) ; (4) libellé nu (« Génération 2 » sans modèle) ; (5) titre complet de la 1re offre si pas de génération. Raquettes 0/33 : non concluant.
- Vrais cas OK : chaussures (Rush Pro 4.5↔5, Barricade 13↔14, Wave Exceed Tour 6↔7…). Cordages : aucune section, conforme.

## Prochaine étape (une session)
R5.5 : corriger libellés (nom de modèle + vrai attribut, dédoublonnage) et faux positifs. **Décision de Mathieu d'abord** : « RG » (Roland-Garros, ex. adidas Pro Robe ↔ RG Pro Robe) = autre génération, oui ou non ? Puis nouvelle recette preview, puis activation prod = décision de Mathieu. Suppression de `87987663…` seulement après R5 validée en prod et accord explicite.

## À lire si besoin
- `R5_dossier_decision.md`, `RISQUES_OUVERTS.md` (GAP-2026-09-30-02).
- Recette preview : `vercel curl <chemin> --deployment <url> --scope lenoir-nba` (préfixer `MSYS_NO_PATHCONV=1` sous Git Bash).

## Points d'attention
- Non traité : copies `deals-tennis-pr141/142*` et dossiers `rapport-*` à nettoyer ; sens de « SF » (Head Sprint Pro 4.0) inconnu.
