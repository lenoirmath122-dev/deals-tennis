# Reprise (réécrit à chaque passation)
**Dernière passation** : 2026-10-13 (activation R5 en prod). Branche de travail : toujours partir de `origin/master`.
## Où on en est
- Rapprochement multi-niveaux : R0 à R5.5 faits ; passage prod `f07bcbab-8f53-4820-ad4d-1aec9eed6759` (engine `r4.6-d`). Ancien passage `87987663…` conservé (retour arrière).
- R5 active en prod depuis 2026-10-13 : `MATCH_DISPLAY_ENABLED=true` et `MATCH_RUN_ID` posés en Production, redéploiement fait, contrôle conforme (fiche Hypercourt avec « Autres générations », fiches sans section, accueil 200).
- Retour arrière : `MATCH_DISPLAY_ENABLED=false` (ou `MATCH_RUN_ID` = `87987663…`) puis redéploiement.

## Prochaine étape
Laisser tourner quelques jours, puis sur accord explicite de Mathieu supprimer `87987663…` (cascade `match_*`, vérifier qu'aucun code ni flag ne le référence). Ensuite : nettoyage, puis chantier n8n.

## À lire si besoin
- `R5_dossier_decision.md`, `RISQUES_OUVERTS.md`.
- Contrôle prod : `curl https://deals-tennis.vercel.app/deal/<id>` (ids dans `/sitemap.xml`).

## Points d'attention
- `tests/unit/tracking.test.ts` échoue sans `DATABASE_URL` dans le shell (sans lien avec R5).
- Non traité : copies `deals-tennis-pr141/142*` et dossiers `rapport-*` à nettoyer ; sens de « SF » (Head Sprint Pro 4.0) inconnu ; section « Autres éditions » (RG, athlète) éventuelle, hors R5 ; la section reste rare (4 familles de chaussures).
- Les commandes `vercel env add` et `vercel redeploy` en prod demandent une approbation `/permissions`.
