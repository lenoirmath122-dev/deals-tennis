# R1 — Mesure de l'algorithme actuel sur le jeu de référence (2026-09-26)

> Livrable R1 (§9 et §10 de `CADRAGE_rapprochement-multi-niveaux.md`). Remplace le « 0/24 » du §5 de `R0_diagnostic-rapprochement.md`, qui ne mesurait rien : les 24 paires avaient été choisies parce que l'algorithme les rate.
> Aucune modification de code applicatif, de base ou de VM. Lecture seule sur la base Neon de prod.
> **Recalculé le 2026-09-26 après application de la règle des générations** (D-2026-09-26-01, §5 du cadrage) : voir §1bis pour les reclassements.

## 1. Jeu mesuré

`R1_jeu-reference-candidat.csv`, **38 paires** :

| Origine | Paires | Contenu |
|---|---|---|
| R0 | 1-24 | Les 24 exemples du diagnostic, corrigés (paire 10 → différent, note de la paire 20, prix des paires 13/15/16 retrouvés). |
| Témoins « algo » | 25-32 | Paires que l'algorithme actuel **rapproche** en base : les 3 seuls produits présents chez 2 marchands (25-27, même en incluant les offres expirées), puis 5 fusions chez un même marchand (28-32) pour chercher des faux positifs. |
| Pièges ajoutés | 33-38 | Génération (Mirage 100 / 100 II), tamis (Pure Drive / Pure Drive 107), version Lite / S Lite, cordée / non cordée, conditionnement balles (tube / carton), conditionnement cordage (garniture / bobine). |

**Répartition de la proposition Claude Code** : 14 identiques, 10 proches, 14 différents (avant la règle des générations : 18 / 10 / 10).
**Pièges** (colonne `piege`, 20 paires) : génération ×6 (3, 6, 8, 28, 29, 33), collection de sac ×2 (22, 23), tamis ×2 (4, 34), version Lite / poids ×2 (10, 35), taille junior (11), genre ×2 (16, 24), cordée / non cordée ×2 (30, 36), conditionnement ×2 (37, 38), jauge indéterminable (25).

**Limites du jeu, à connaître avant de lire les chiffres** :
- Les paires 28-32 et 37 sont chez **un même marchand** (pas des paires inter-marchands au sens du §9). Elles sont là parce que la base ne contient que 3 rapprochements inter-marchands : sans elles, on ne peut pas observer de faux positif.
- Les propositions restent celles de Claude Code, pas encore validées (colonne `decision_mathieu` vide). Les chiffres ci-dessous changeront si Mathieu corrige une proposition.

### 1bis. Règle des générations appliquée (2026-09-26)

Règle (D-2026-09-26-01) : génération différente et vérifiée des deux côtés → différent ; génération inconnue ou non vérifiable d'un côté → proche ; identique seulement si la génération est confirmée des deux côtés ou si le modèle n'a qu'une génération sur le marché. La source de chaque vérification est écrite dans la colonne `note`.

| Paire | Avant | Après | Source de la vérification |
|---|---|---|---|
| 28 | proche | **différent** | Réf. Head 233612 (Speed MP 2022) contre Speed MP 2026, fiches Tennispro (session précédente). |
| 29 | proche | **différent** | Réf. fabricant sur les fiches Tennispro : 101551 = Pure Drive 98 Gen11 (babolat.com) ; 101474 = Pure Drive 98 2023 (plus sur babolat.com, identifiée chez des revendeurs). |
| 33 | proche | **différent** | Titres : « Mirage 100 2 » contre « Mirage 100 ». |
| 6 | identique | **différent** | Réf. Dunlop 10369906 (fiche Tennispro) = FX 500 Lite 2026, plan 16x18 ; fiche Tennis Point FR : plan 16/19, donc génération antérieure. |
| 8 | identique | **proche** | Réf. Dunlop 10350805 (Tennispro) et GTIN 045566181411 (Tennis Point FR) : génération introuvable des deux côtés. |
| 22 | identique | **proche** | Sac Tour Endurance : SportSystem 40TOUBEIBP « 2025-2026 » ; Tecnifibre 40TOUWBLBA, collection non écrite. |
| 23 | identique | **proche** | SportSystem 40TOUNAVBP « 2023-2024 » ; Tecnifibre 40TOUWBLBA, collection non écrite. |

Vérifiées et **inchangées** (génération confirmée des deux côtés) : 2 (réf. Head 231655 = Boom MP L Neon 2025 + titre), 5 (réf. 101576 et GTIN 3324922083345 = Pure Strike 100 16/20 Gen4 sur babolat.com), 12 (« V2 » dans les deux titres + fiche SportSystem), 36 (réf. 101555 et 102555 = Pure Drive Lite Gen11 sur babolat.com), 30 (réf. 232026S = Speed MP 2026), 26 (réf. Babolat 670065 des deux côtés), 27 (réf. 751235 des deux côtés), 1, 15, 31 (génération dans les deux titres). 3 reste différent ; 7 et 9 restent proches (consigne de Mathieu).

### Colonnes ajoutées au CSV

- `origine` : R0 / algo / piege.
- `niveau` (§4 du cadrage) : **niveau où se situe la différence** entre les deux offres.
  - `offre` : même modèle, même variante (ou variante non précisée dans les titres) ; seules les conditions marchandes diffèrent (marchand, prix).
  - `variante` : même modèle, variante différente (coloris, cordée / non cordée…). Ex. paire 31 : identique au niveau modèle, différente au niveau variante (coloris). Les paires 22 et 23 étaient dans ce cas avant la règle des générations ; elles sont désormais au niveau `modèle` (collections différentes ou non vérifiables).
  - `modèle` : modèles différents, qu'ils soient proches ou différents.
  - `conditionnement` (ajouté le 2026-09-26) : même article, conditionnement différent (tube / carton de balles, garniture / bobine de cordage). Comparaison à l'unité (R5 du §3). Paires 37 et 38, qui restent « différent ».
- `piege` : type de piège, vide sinon.
- `statut_prix` : provenance et statut des prix. Tous les prix ont été retrouvés en base le 2026-09-26 (A/B `active` ou `expired` ; une offre expirée garde son dernier prix connu). La mention « prix indisponible (catalogue tournant) » n'a finalement été nécessaire pour aucune paire : voir §4.
- `algo_actuel` : sortie de l'algorithme actuel, `rapproché` ou `non rapproché`.
- `cle_algo_a` / `cle_algo_b` : sortie brute, la clé `normalizeProductKey` de chaque offre.

## 2. Méthode

Script jetable (hors dépôt, supprimé en fin de session) qui, pour chaque paire :
1. retrouve les deux offres en base de prod par marchand + titre exact (prix remisé en plus quand plusieurs offres ont le même titre) ;
2. **exécute réellement** `extractModel(title, deals.brand, deals.category)` puis `normalizeProductKey` depuis `lib/product-matching.ts` (import direct du fichier, pas de réimplémentation) — c'est exactement la clé `ON CONFLICT (LOWER(brand), LOWER(model), category)` des 8 scripts de scraping ;
3. `rapproché` si les deux clés sont égales.

**Contrôle croisé** : pour les 38 paires, le résultat calculé concorde avec la base (même `product_id` ⇔ `rapproché`). Aucun écart. La colonne `algo_actuel` n'a pas changé avec la règle des générations ; seules les propositions ont changé. Les chiffres du §3 sont recalculés à partir du CSV final.

## 3. Résultats

Classe positive = « identique » (même modèle, §9 : précision du rapprochement « même modèle »). Une paire « proche » ou « différent » rapprochée compte comme **faux positif** : le §3 R6 interdit de présenter deux modèles non identiques comme le même article.

| | Proposition identique | Proposition proche ou différent |
|---|---|---|
| **Algo : rapproché** | 5 (VP) | 3 (FP) |
| **Algo : non rapproché** | 9 (FN) | 21 (VN) |

- **Précision « même modèle » : 5 / 8 = 62,5 %** (objectif du §9 : ≥ 95 %). Inchangée : les faux positifs 28 et 29 passent de « proche » à « différent », ils restent des faux positifs.
- **Rappel : 5 / 14 = 35,7 %** (27,8 % avant). La hausse ne vient pas de l'algorithme : les paires 6, 8, 22 et 23, qu'il ratait, ne sont plus des « identiques ».
- Sur les **seules paires inter-marchands** (32 paires) : précision 2 / 3, rappel **2 / 11 = 18,2 %**.
- **Deux paires « différent » sont rapprochées** (28, 29 : deux générations sous un titre identique chez Tennispro), et une paire « proche » (25). Les autres pièges textuels (tamis, Lite, genre, conditionnement…) sont évités, mais par accident — deux titres qui diffèrent d'un seul mot donnent deux clés différentes, que ce mot compte ou non.

### Détail des erreurs par type

**Faux positifs (3)** — tous chez des titres strictement identiques :

| Paire | Proposition | Type | Détail |
|---|---|---|---|
| 28 | différent | génération | Tennispro, « Head Speed Mp (300 Gr) » ×2 : réf. Head 233612 (Speed MP 2022) contre Speed MP 2026. Même titre, générations différentes. |
| 29 | différent | génération | Tennispro, « Babolat Pure Drive 98 (305 Gr) » ×2 : réf. 101474 (Pure Drive 98 2023) contre 101551 (Pure Drive 98 Gen11). Prix d'origine 279,95 contre 299,95. |
| 25 | proche | jauge indéterminable | Head Rip Control Amazon / Tennispro : garnitures des deux côtés, jauge absente des titres ; côté Tennispro la jauge est un choix interne à la fiche. |

Enseignement : quand le marchand ne met pas la génération dans le titre, la clé texte fusionne des générations différentes. Le titre seul ne suffit pas ; une référence fabricant (voir §5) ou le GTIN le peut.

**Faux négatifs (9)**, cause principale par paire (une paire peut en cumuler plusieurs) :

| Cause | Paires | Nb |
|---|---|---|
| Préfixe catégorie non retiré ou mot-catégorie / marque en double (textile : `CATEGORY_PREFIXES` ne couvre pas le textile) | 13, 15, 18, 19 | 4 |
| Poids entre parenthèses ajouté (Tennispro) | 2, 5, 36 | 3 |
| Ordre des mots différent | 12, 15 | 2 |
| Mention marketing (« Raquette de compétition ») | 1 | 1 |
| Notation du plan de cordage (« 16/20 » → « 16 20 » vs « 16x20 ») | 5 | 1 |
| Génération notée d'un seul côté (« Gen11 ») | 36 | 1 |

Les défauts d'extraction relevés sur les paires 6, 8, 22 et 23 (poids entre parenthèses, couleur « Navy » inconnue, « White-blue » qui laisse un « - » résiduel, préfixe « sac à dos » non retiré) existent toujours, mais ces paires ne sont plus des « identiques » : ne pas les rapprocher est désormais le bon résultat.

**Vrais positifs (5)** : 26 et 27 (titres identiques chez deux marchands), 30 (« Cordee » retiré), 31 (coloris retiré), 32 (coloris « Black » retiré).

**Défaut d'extraction repéré au passage** (sans effet sur la mesure) : « (cordee) » entre parenthèses laisse « () » dans le modèle (paire 35, et les deux offres « Evo Aero Lite Gen2 » de Tennispro) — une raquette cordée et la même non cordée donnent alors deux clés différentes chez ce marchand.

## 4. Prix des paires 13, 15 et 16

Les prix n'étaient pas « indisponibles » : les titres `titre_complet_a/b` du CSV initial avaient été **reconstruits à partir du modèle extrait** (sans la marque pour la 13, sans le coloris « blanc et argent » pour les 15/16) et ne correspondaient donc à aucune offre réelle. Titres réels repris, prix trouvés en base : 13 B = 35 / 23,97 ; 15 et 16 A = 150 / 99. La colonne `statut_prix` indique pour chaque paire la date et le statut des offres.

## 5. Constat complémentaire utile pour R2/R3

Les fiches produit Tennispro.fr exposent la **référence fabricant** (`mpn`) dans l'objet `dataLayer` du HTML (ex. `233612` pour la Speed MP 2022, `281099-WH` pour le Rip Control blanc). C'est ce qui a permis de séparer les deux générations de la paire 28. Une requête supplémentaire par fiche (Crawl-delay de 60 s à respecter). Consigné aussi en §1bis de `R0_diagnostic-rapprochement.md`.

Vérification des générations (2026-09-26) : ces références se résolvent sur le site du fabricant. `babolat.com/fr/<référence>.html` redirige vers la fiche Babolat (ex. 101576 → « Pure Strike 100 16/20 Gen4 »), et le GTIN Babolat vu chez Tennis Point FR apparaît aussi dans l'URL babolat.com. Une référence retirée du catalogue fabricant (ex. 101474) ne se résout plus : il faut alors un revendeur. Les références Head (231655, 232026) et Dunlop (10369906) se retrouvent chez des revendeurs avec leur année. Le GTIN Dunlop de Tennis Point FR (045566…) n'a donné aucune génération.

## 6. Arrêt

Aucune décision prise sur la suite. Prochaine action attendue : Mathieu remplit `decision_mathieu`. Les chiffres du §3 seront recalculés sur ses décisions, pas sur les propositions de Claude Code.

## 7. Validation (2026-09-27, D-2026-09-27-03)

Mathieu a validé **les 38 propositions**, avec un seul reclassement : la paire 7 passe de « proche » à « différent » (voir ci-dessous). Répartition finale : **14 identiques / 9 proches / 15 différents** ; pièges : 21 paires (génération ×7, avec la 7). Ce reclassement ne touche aucune paire « identique » ni rapprochée par l'algorithme : les chiffres du §3 sont donc inchangés et deviennent la mesure de référence — **précision 62,5 % (5/8), rappel 35,7 % (5/14), inter-marchands 2/11**.

Paire 7 : la vérification faite sur la paire 6 établit que l'offre Tennis Point FR n'est pas la FX 500 Lite 2026 et que l'offre SportSystem l'est ; génération différente vérifiée des deux côtés → « différent » (règle D-2026-09-26-01). Signalé par Claude Code, reclassé sur décision de Mathieu le 2026-09-27.
