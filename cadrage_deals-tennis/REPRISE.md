# Reprise (réécrit à chaque passation)
**Dernière passation** : 2026-10-13. Branche de travail : toujours partir de `origin/master`.
## Où on en est
- Rapprochement multi-niveaux : R0 à R4.6-c faits ; **R4.6-d : écriture en prod faite et relue**, bascule de l'affichage non décidée.
- Passage prod courant : `f07bcbab-8f53-4820-ad4d-1aec9eed6759` (engine `r4.6-d`, 3 995 modèles, 4 732 liens, tables `match_*` seulement). Accord de Mathieu le 2026-10-13.
- Ancien passage conservé (retour arrière) : `87987663-56cc-4fe7-adc3-2955405a716a` (engine `r4.6-b`, 4 011 modèles).
- Relecture des 16 modèles modifiés (2026-10-13) : 50 offres déplacées, aucune perdue. Babolat cordages : 24 offres, jauge unique candidate à chaque fois (C3b sûre). adidas chaussures : 26 offres « genre absent » rattachées à homme (C2).

## Prochaine étape (une session)
1. Décider avec Mathieu de la bascule de l'affichage (R5) ; `bascule-r4.6-d.ts --apply` reste bloqué par conception.
2. Décider du sort de l'ancien passage `87987663…` (suppression seulement avec accord).
3. Optionnel : vérifier que les offres adidas femme (Defiant Speed, Courtjam Control, Gamecourt, Barricade) portent bien « Femme » dans leur titre (risque C2 sur 26 offres).

## À lire si besoin
- `ROADMAP.md`, `R4_6_conventions_valeur_absente.md`, `R4_6_d_bascule.md`, `DECISIONS_FONCTIONNELLES.md` (Grep D-2026-10-07-02).

## Points d'attention
- `CLAUDE.md` racine : section « Suivi » modifiée en local, jamais commitée (à décider par Mathieu).
- Non traité : copies `deals-tennis-pr141/142*` et dossiers `rapport-*` à nettoyer ; sens de « SF » (Head Sprint Pro 4.0) inconnu.
