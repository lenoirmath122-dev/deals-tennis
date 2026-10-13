# Reprise (réécrit à chaque passation)
**Dernière passation** : 2026-10-13. Branche de travail : toujours partir de `origin/master`.

## Où on en est
- Rapprochement multi-niveaux : R0 à R4.6-c faits ; **R4.6-d (bascule) en cours**.
- Passage prod courant : `87987663-56cc-4fe7-adc3-2955405a716a` (engine `r4.6-b`, 4 011 modèles, tables `match_*` seulement, site non touché).
- Décidé le 2026-10-07 : 15 groupes textiles retenus (D-2026-10-07-01) ; conventions C2 (genre absent = homme, chaussures Tennispro.fr) et C3b (jauge non écrite = variante, cordages Babolat) (D-2026-10-07-02).

## Prochaine étape (une session)
1. Coder C2 et C3b dans `lib/matching` avec tests ; engine suivant `r4.6-b`.
2. Passage à blanc en prod (lecture seule), relire les ~9 modèles nouveaux (181 → 190 hors textile).
3. Écriture en prod et bascule : **seulement avec accord explicite de Mathieu**.

## À lire si besoin
- `ROADMAP.md` (vue globale), `ETAT_ACTUEL.md` (détail), `R4_6_d_bascule.md`, `DECISIONS_FONCTIONNELLES.md` (D-2026-10-07-01 / -02).

## Points d'attention
- Pas de `GAPS_OUVERTS.md` : les points ouverts sont dans `RISQUES_OUVERTS.md`.
- Phase 2 (n8n) non commencée : le scraping reste manuel, l'historique de prix ne s'accumule que si on lance les scripts.
- Non traité : copies `deals-tennis-pr141/142*` et dossiers `rapport-*` locaux à nettoyer ; sens de « SF » (Head Sprint Pro 4.0) inconnu.
