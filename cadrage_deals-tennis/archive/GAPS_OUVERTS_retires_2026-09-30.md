# Gaps retirés le 2026-09-30

Texte tel qu'il figurait dans `GAPS_OUVERTS.md` au moment du retrait. La décision citée fait foi.

## GAP-2026-09-30-01 — Textile : l'ordre des mots du nom de modèle empêche des regroupements (retiré : tranché par D-2026-09-30-04, point 1a)

Constat de la relecture R4.5-b (`JOURNAL_SESSIONS.md`, 2026-09-30) : le nom de modèle textile est comparé comme un texte ordonné. Head écrit « BREAK II TIE- » pour « Tie-Break II », SportSystem « Pro Freelift » pour « Freelift Pro » : ces paires ont les mêmes mots mais ne sont pas réunies à l'étape 2 ; elles arrivent en tête de `revue-textile.csv` (score 0,8 à 0,9). Piste : comparer les mots sans tenir compte de l'ordre (signature triée), à valider sur la file de revue avant de le faire (un ordre différent peut désigner un autre article, cas non observé pour l'instant). Attention : « II » doit rester lu comme marqueur de génération même quand le titre est désordonné (D-2026-09-29-05, Tie Break II ≠ Tie Break). À traiter avec la relecture de `revue-textile.csv` ou en R4.6.

**Statut** : ouvert le 2026-09-30.
