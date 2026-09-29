# R4.2 — Compléments au référentiel (raquettes, cordages)

> **Validé par Mathieu le 2026-09-29 (D-2026-09-29-02)** : familles du §1 ajoutées à `config/model-families.ts` (PWR et Metallix Attitude en `a_confirmer`) ; §2 remplacé par une lecture de la référence dans le moteur, sans copie en base. Mesure du 2026-09-29, lecture seule sur la prod (offres `active` + `tracked`).

## 1. Familles Head raquettes non reconnues (titres réels)

| Titres vus | Famille proposée | Versions vues |
|---|---|---|
| « HEAD Challenge MP / TEAM / TEAM L », « Challenge Team – Amazon Exclusive » | Challenge | MP, Team, Team L |
| « HEAD MX Attitude Comp / Elite / Suprm », « Mx Attitude Comp Blue (270 Gr) » | MX Attitude | Comp, Elite, Suprm |
| « HEAD Arthur Ashe Competition » | Arthur Ashe | Competition |
| « HEAD PWR 110 / 115 » | PWR | 110, 115 (à confirmer : tamis ou modèle ?) |
| « HEAD Spark SUPRM » | Spark | Suprm |
| « Head Metallix Attitude Pro … pré-cordée » | Metallix Attitude | Pro |

Déjà présentes dans le référentiel (aucun ajout) : Paw, Squared, Ti S, Gravity, Prestige, Instinct, Coco.
Attention : « Challenge » est déjà un **cordage** Head (famille cordages) ; catégories distinctes, pas de conflit.
Les autres nouveautés Head citées au cadrage (Jannik, Sinner Foundation, iPrestige) relèvent du site Head : à lister dans le rapport de passage de R4.4, sur les titres exacts.

## 2. Référence SportSystem (R4-Q7)

Mesure sur les offres `active` + `tracked` (référence = `merchant_sku`) : elle **est** une référence fabricant pour Head (17 des 29 raquettes/cordages retrouvées telles quelles dans le `mpn` d'un autre marchand), Babolat (6) et Tecnifibre (1). Aucun contre-exemple ; pour Wilson, Asics, Nike… le format (WR125911U, 1041A370-107, BV2662) est celui des références fabricant mais aucun autre marchand ne fournit de `mpn` pour comparer.
Limites : (a) les offres à plusieurs variantes concatènent les références (« DP3232-DP3233-DP3234 ») et ne sont pas copiables telles quelles ; (b) chez Dunlop la référence varie avec la taille de manche (10369906 / 10369907).
**Proposition** : copier `merchant_sku` dans `mpn` uniquement pour les offres SportSystem à référence unique, `mpn` vide, marques dont la référence est vérifiée ou au format fabricant ; essai sur branche Neon puis prod **avec ton accord** (non fait). Pour la comparaison (R4.4), traiter les références Dunlop avec prudence (taille de manche).
