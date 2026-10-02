# R4.6-c — GAP-2026-09-27-01 : repérage des non-reconnus

## Base de calcul
- Moteur / extraction : `r4.6-b` (run shadow lecture seule)
- Offres : `5035` (active + tracked)

## Résultat (non-reconnus)
- Non reconnues (313 attendu / doc) : **313**
  - **famille_inconnue** : **174**
  - **sans_famille_prevue** : **136**
  - **marque_inconnue** : **3**

## Découpage par catégories (offres lues → reconnues)
- chaussures : 885 → 879
- accessoires : 506 → 252
- raquettes : 574 → 545
- textile : 2829 → 2810
- cordages : 241 → 236

## Termes les plus fréquents (top par (marque, catégorie))
Extrait des principaux patterns dans `rapport-r4.6-c/non-reconnus.csv`.

## Conflits / divergences contextuels
- Conflits / incohérences / divergences (issus du rapport r4.6-b) :
  - conflits : 13
  - incohérents : 0
  - divergents : 13

## Livrables de run (locaux)
- [rapport-r4.6-c/rapport.md](../rapport-r4.6-c/rapport.md)
- [rapport-r4.6-c/non-reconnus.csv](../rapport-r4.6-c/non-reconnus.csv)
- [rapport-r4.6-c/conflits.csv](../rapport-r4.6-c/conflits.csv)
- [rapport-r4.6-c/proches.csv](../rapport-r4.6-c/proches.csv)
- [rapport-r4.6-c/indetermines.csv](../rapport-r4.6-c/indetermines.csv)
