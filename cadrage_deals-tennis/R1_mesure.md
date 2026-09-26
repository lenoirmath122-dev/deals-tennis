# R1 — Mesure de l'algorithme actuel sur le jeu de référence (2026-09-26)

> Livrable R1 (§9 et §10 de `CADRAGE_rapprochement-multi-niveaux.md`). Remplace le « 0/24 » du §5 de `R0_diagnostic-rapprochement.md`, qui ne mesurait rien : les 24 paires avaient été choisies parce que l'algorithme les rate.
> Aucune modification de code applicatif, de base ou de VM. Lecture seule sur la base Neon de prod.

## 1. Jeu mesuré

`R1_jeu-reference-candidat.csv`, **38 paires** :

| Origine | Paires | Contenu |
|---|---|---|
| R0 | 1-24 | Les 24 exemples du diagnostic, corrigés (paire 10 → différent, note de la paire 20, prix des paires 13/15/16 retrouvés). |
| Témoins « algo » | 25-32 | Paires que l'algorithme actuel **rapproche** en base : les 3 seuls produits présents chez 2 marchands (25-27, même en incluant les offres expirées), puis 5 fusions chez un même marchand (28-32) pour chercher des faux positifs. |
| Pièges ajoutés | 33-38 | Génération (Mirage 100 / 100 II), tamis (Pure Drive / Pure Drive 107), version Lite / S Lite, cordée / non cordée, conditionnement balles (tube / carton), conditionnement cordage (garniture / bobine). |

**Répartition de la proposition Claude Code** : 18 identiques, 10 proches, 10 différents.
**Pièges** (colonne `piege`, 16 paires, dont 11 pièges ajoutés ou reconnus dans les paires d'origine et 5 détectés parmi les témoins) : génération ×4 (3, 28, 29, 33), tamis ×2 (4, 34), version Lite / poids ×2 (10, 35), taille junior (11), genre ×2 (16, 24), cordée / non cordée ×2 (30, 36), conditionnement ×2 (37, 38), plus la jauge indéterminable (25).

**Limites du jeu, à connaître avant de lire les chiffres** :
- Les paires 28-32 et 37 sont chez **un même marchand** (pas des paires inter-marchands au sens du §9). Elles sont là parce que la base ne contient que 3 rapprochements inter-marchands : sans elles, on ne peut pas observer de faux positif.
- Les propositions restent celles de Claude Code, pas encore validées (colonne `decision_mathieu` vide). Les chiffres ci-dessous changeront si Mathieu corrige une proposition.

### Colonnes ajoutées au CSV

- `origine` : R0 / algo / piege.
- `niveau` (§4 du cadrage) : **niveau où se situe la différence** entre les deux offres.
  - `offre` : même modèle, même variante (ou variante non précisée dans les titres) ; seules les conditions marchandes diffèrent (marchand, prix).
  - `variante` : même modèle, variante différente (coloris, cordée / non cordée…). Ex. paires 22 et 23 : identiques au niveau modèle, différentes au niveau variante (coloris).
  - `modèle` : modèles différents, qu'ils soient proches ou différents.
- `piege` : type de piège, vide sinon.
- `statut_prix` : provenance et statut des prix. Tous les prix ont été retrouvés en base le 2026-09-26 (A/B `active` ou `expired` ; une offre expirée garde son dernier prix connu). La mention « prix indisponible (catalogue tournant) » n'a finalement été nécessaire pour aucune paire : voir §4.
- `algo_actuel` : sortie de l'algorithme actuel, `rapproché` ou `non rapproché`.
- `cle_algo_a` / `cle_algo_b` : sortie brute, la clé `normalizeProductKey` de chaque offre.

## 2. Méthode

Script jetable (hors dépôt, supprimé en fin de session) qui, pour chaque paire :
1. retrouve les deux offres en base de prod par marchand + titre exact (prix remisé en plus quand plusieurs offres ont le même titre) ;
2. **exécute réellement** `extractModel(title, deals.brand, deals.category)` puis `normalizeProductKey` depuis `lib/product-matching.ts` (import direct du fichier, pas de réimplémentation) — c'est exactement la clé `ON CONFLICT (LOWER(brand), LOWER(model), category)` des 8 scripts de scraping ;
3. `rapproché` si les deux clés sont égales.

**Contrôle croisé** : pour les 38 paires, le résultat calculé concorde avec la base (même `product_id` ⇔ `rapproché`). Aucun écart.

## 3. Résultats

Classe positive = « identique » (même modèle, §9 : précision du rapprochement « même modèle »). Une paire « proche » rapprochée compte comme **faux positif** : le §3 R6 interdit de présenter deux modèles proches comme le même article.

| | Proposition identique | Proposition proche ou différent |
|---|---|---|
| **Algo : rapproché** | 5 (VP) | 3 (FP) |
| **Algo : non rapproché** | 13 (FN) | 17 (VN) |

- **Précision « même modèle » : 5 / 8 = 62,5 %** (objectif du §9 : ≥ 95 %).
- **Rappel : 5 / 18 = 27,8 %.**
- Sur les **seules paires inter-marchands** (32 paires) : précision 2 / 3, rappel **2 / 15 = 13,3 %**.
- **Aucune des 10 paires « différent » n'est rapprochée** : les pièges textuels (tamis, Lite, genre, conditionnement…) sont évités, mais par accident — deux titres qui diffèrent d'un seul mot donnent deux clés différentes, que ce mot compte ou non.

### Détail des erreurs par type

**Faux positifs (3)** — tous chez des titres strictement identiques :

| Paire | Type | Détail |
|---|---|---|
| 28 | génération | Tennispro, « Head Speed Mp (300 Gr) » ×2 : fiches vérifiées, réf. Head 233612 (Speed MP 2022) contre Speed MP 2026. Même titre, générations différentes. |
| 29 | génération | Tennispro, « Babolat Pure Drive 98 (305 Gr) » ×2 : prix d'origine 279,95 contre 299,95, références fabricant différentes sur les fiches (101474 / 101551). Génération non écrite sur les fiches : très probablement deux générations (à confirmer). |
| 25 | jauge indéterminable | Head Rip Control Amazon / Tennispro : garnitures des deux côtés, jauge absente des titres ; côté Tennispro la jauge est un choix interne à la fiche. |

Enseignement : quand le marchand ne met pas la génération dans le titre, la clé texte fusionne des générations différentes. Le titre seul ne suffit pas ; une référence fabricant (voir §5) ou le GTIN le peut.

**Faux négatifs (13)**, cause principale par paire (une paire peut en cumuler plusieurs) :

| Cause | Paires | Nb |
|---|---|---|
| Poids entre parenthèses ajouté (Tennispro) | 2, 5, 6, 8, 36 | 5 |
| Préfixe catégorie non retiré ou mot-catégorie / marque en double (textile, sacs : `CATEGORY_PREFIXES` ne couvre ni le textile ni les sacs à dos) | 13, 15, 18, 19, 22 | 5 |
| Ordre des mots différent | 12, 15, 22, 23 | 4 |
| Couleur mal retirée (« Navy » inconnu ; « White-blue » laisse un « - » résiduel) | 22, 23 | 2 |
| Mention marketing (« Raquette de compétition ») | 1 | 1 |
| Notation du plan de cordage (« 16/20 » → « 16 20 » vs « 16x20 ») | 5 | 1 |
| Génération notée d'un seul côté (« Gen11 ») | 36 | 1 |

**Vrais positifs (5)** : 26 et 27 (titres identiques chez deux marchands), 30 (« Cordee » retiré), 31 (coloris retiré), 32 (coloris « Black » retiré).

**Défaut d'extraction repéré au passage** (sans effet sur la mesure) : « (cordee) » entre parenthèses laisse « () » dans le modèle (paire 35, et les deux offres « Evo Aero Lite Gen2 » de Tennispro) — une raquette cordée et la même non cordée donnent alors deux clés différentes chez ce marchand.

## 4. Prix des paires 13, 15 et 16

Les prix n'étaient pas « indisponibles » : les titres `titre_complet_a/b` du CSV initial avaient été **reconstruits à partir du modèle extrait** (sans la marque pour la 13, sans le coloris « blanc et argent » pour les 15/16) et ne correspondaient donc à aucune offre réelle. Titres réels repris, prix trouvés en base : 13 B = 35 / 23,97 ; 15 et 16 A = 150 / 99. La colonne `statut_prix` indique pour chaque paire la date et le statut des offres.

## 5. Constat complémentaire utile pour R2/R3

Les fiches produit Tennispro.fr exposent la **référence fabricant** (`mpn`) dans l'objet `dataLayer` du HTML (ex. `233612` pour la Speed MP 2022, `281099-WH` pour le Rip Control blanc). C'est ce qui a permis de séparer les deux générations de la paire 28. Une requête supplémentaire par fiche (Crawl-delay de 60 s à respecter). Consigné aussi en §1bis de `R0_diagnostic-rapprochement.md`.

## 6. Arrêt

Aucune décision prise sur la suite. Prochaine action attendue : Mathieu remplit `decision_mathieu`. Les chiffres du §3 seront recalculés sur ses décisions, pas sur les propositions de Claude Code.
