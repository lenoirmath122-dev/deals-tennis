# R4 — Nouveau moteur de rapprochement en mode fantôme : cadrage et découpage (2026-09-29)

> Étape R4 du §10 de `CADRAGE_rapprochement-multi-niveaux.md`. **Cadrage uniquement, aucun code.** Proposition de Claude Code, **en attente de validation par Mathieu** (questions R4-Q1 à R4-Q8, §5).
> Mesures faites en lecture seule sur la base de prod le 2026-09-29 (offres `active` + `tracked`), avec les fichiers `config/` de R2 tels quels.

## 1. Ce que R4 doit livrer (déjà acté)

| Élément | Source |
|---|---|
| Extraction des attributs + cascade (GTIN → famille et attributs → correspondance approchée avec score), écrivant dans de **nouvelles** structures, sans rien changer à ce que le site affiche | §8 et §10 R4 du cadrage rapprochement |
| Lecture de `config/matching-rules.ts` et des 3 fichiers de familles (R2), jamais d'écriture dans le référentiel depuis l'application | R7 ; D-2026-09-28-01 |
| Mesure sur le jeu R1 (67 paires : 32 identiques / 15 proches / 20 différents) et sur la couverture multi-marchands, comparée à l'algorithme actuel (précision 5/8, rappel 5/32, inter-marchands 2/29, 5 produits multi-marchands) | §9 ; `R1_mesure.md` §10 |
| Objectif : précision « même modèle » ≥ 95 % | §9 |
| Seuils de confiance réglés sur le jeu R1 (vides aujourd'hui dans `CONFIDENCE_THRESHOLDS`) | `config/matching-rules.ts` |
| Liste réelle des offres non reconnues, et règles de repérage tranchées sur ces données | GAP-2026-09-27-01 |
| Si la précision est insuffisante : analyse des erreurs, décision éventuelle sur l'option IA | §6 point 5, §10 R4 |
| **Arrêt : décision de bascule (R5)** | §10 R4 |

## 2. Ce que les données disent (mesuré le 2026-09-29)

### 2.1 Le référentiel R2 reconnaît déjà la plupart des offres

Reconnaissance par alias de famille (plus long alias trouvé dans le titre normalisé, même marque, même catégorie) :

| Catégorie | Offres | Famille reconnue |
|---|---|---|
| Raquettes | 574 | 526 (92 %) |
| Cordages | 241 | 236 (98 %) |
| Chaussures | 885 | 868 (98 %) |
| Accessoires : sacs / grips / balles / antivibrateurs | 243 / 57 / 48 / 22 | 186 / 40 / 26 / 11 |
| Accessoires : protection et soins, autres | 136 | 14 (pas de familles prévues) |
| **Textile** | **2 829 (57 % des offres)** | 0 (pas de référentiel, décision Q10) |

- **104 familles** sont présentes chez au moins 2 marchands (raquettes 31, cordages 16, chaussures 41, accessoires 16), contre **5 produits** multi-marchands aujourd'hui. C'est un **plafond** au niveau famille, pas un nombre de modèles : il faut encore que les attributs concordent.
- Les non-reconnus sont surtout les **nouveautés du site Head** (R3.10 : 423 offres `tracked`) : Jannik, Sinner Foundation, iPrestige, MX Attitude (36 raquettes), plus quelques chaussures New Balance et K-Swiss. C'est exactement le cas prévu par GAP-2026-09-27-01.

### 2.2 La génération est rarement écrite, et la règle validée bloque alors « identique »

Règle standard (D-2026-09-26-01, `GENERATION_RULES.standard`) : génération non écrite des deux côtés → **proche**, sauf « génération unique sur le marché ». Part des titres reconnus qui portent une génération ou une année (mesure approchée) :

| | Raquettes | Cordages |
|---|---|---|
| Tennispro.fr | 6 / 122 | 0 / 125 |
| Head | 0 / 103 | 0 / 33 |
| Amazon | 0 / 8 | 0 / 26 |
| Tennis Point FR | 35 / 72 | 0 / 2 |
| SportSystem | 67 / 109 | 0 / 30 |
| Babolat | 60 / 87 | 0 / 23 |

Conséquence : appliquée telle quelle, la règle rend **presque aucun cordage « identique »** (aucun titre n'a de génération, et le référentiel ne note « génération unique » nulle part), et très peu de raquettes Tennispro.fr, Head ou Amazon. Le moteur serait précis, mais son rappel serait plafonné par l'absence d'information, pas par sa qualité. Voir R4-Q4.

### 2.3 Ce que `raw_attributes` apporte vraiment

| Marchand | Attributs utiles au rapprochement |
|---|---|
| SportSystem (764) | **Fiche technique complète** : tamis, poids, plan de cordage, longueur, équilibre ; EAN par déclinaison ; `reference` par déclinaison |
| Sport 2000 (153) | GTIN 100 %, genre (facette), couleur, tailles |
| Tennis Point FR (2 349) | Libellé de variante (« non cordée / 2 ») ; GTIN par variante pour 510 offres (R3.12) |
| Tennispro.fr (675) | `mpn` (429), coloris, taille, marque et nom bruts |
| Tecnifibre (168) | Variantes (SKU) ; GTIN pour 19 offres |
| Babolat, Head, Amazon | Presque rien : coloris, argument commercial, ASIN, identifiant de carte |

**Correction d'une idée reçue (R0 §1).** Le champ `grams` des variantes Tennis Point FR **n'est pas le poids de la raquette** : 355 à 362 g pour une Clash 100 V2 (295 g non cordée). C'est un poids d'expédition, inutilisable pour la tolérance ±10 g. Le poids ne vient que du titre (Tennispro.fr « (305 Gr) », T-Fight 300…) ou de la fiche SportSystem.

**Point à vérifier en R4.2.** R1 (§8.3) indique que la référence SportSystem est une référence fabricant pour la plupart des marques (ASICS, Babolat, Nike, Head…) ; R3.7 l'a stockée en `merchant_sku`, et le `mpn` du JSON-LD a été jugé « recopie de la référence marchand ». Si R1 a raison, ce sont ~750 références fabricant de plus, comparables à celles de Tennispro.fr et de Sport 2000 (URL).

### 2.4 Le GTIN rapprochera peu entre marchands

Seulement 2 GTIN sont partagés par 2 marchands aujourd'hui (voir l'échange de début de session). L'étape 1 de la cascade reste utile pour la **précision** (séparer ce que le titre confond, confirmer une génération), beaucoup moins pour le **rappel**.

## 3. Principes de conception proposés

1. **Le moteur ne touche à rien d'existant.** Il lit `deals` (et `config/`), écrit dans ses propres tables. `products`, `deals.product_id`, `lib/ingest.ts` et le site restent inchangés jusqu'à R5.
2. **Recalcul complet à chaque passage, déterministe.** ~5 000 offres : un passage complet coûte quelques secondes. Pas d'état incrémental à maintenir pendant qu'on itère sur les règles ; deux passages sur les mêmes données donnent le même résultat.
3. **Fonctions pures d'abord** (extraction, comparaison, score), testées sans base ; le script qui lit et écrit la base est une couche mince, comme `lib/ingest.ts`.
4. **Chaque attribut garde sa source** (`gtin`, `mpn`, `donnees_structurees`, `fiche_marchand`, `titre_description`, `ATTRIBUTE_SOURCES`) : indispensable pour analyser les erreurs.
5. **R3 sert de garde-fou** : un faux rapprochement coûte plus qu'un rapprochement manqué. Dans le doute, « proche » ou file de revue, jamais « identique ».

## 4. Découpage proposé (une étape par conversation)

Toutes les étapes se font en **session cloud** (base Neon seulement, aucun site marchand), sauf la vérification de nouvelles familles sur les fiches (R4.2/R4.3, réseau utile mais pas bloquant).

| Étape | Contenu | Modèle |
|---|---|---|
| **R4.1** | Migration additive des tables du moteur (R4-Q1), branche Neon puis prod. **Figer le jeu R1** : les 134 offres des 67 paires extraites une fois de la base (titre, marque, catégorie, marchand, `gtin`, `mpn`, `merchant_sku`, `raw_attributes`) dans un fichier de test versionné, pour que la mesure ne dépende plus de la base (des offres expirent). Banc de mesure vitest qui rejoue l'algorithme actuel sur ce fichier et retrouve la référence (5/8, 5/32, 2/29). | Sonnet |
| **R4.2** | Extraction des attributs **raquettes + cordages** (`lib/matching/`, fonctions pures) : famille (alias le plus long), version, génération, tamis, poids, plan de cordage, longueur, junior, jauge, conditionnement, longueur de bobine, lot, cadeau. Sources par marchand (§2.3). Tests sur les titres réels et le jeu R1. Liste des non-reconnus → **complément du référentiel proposé à Mathieu** (familles Head, etc.). | Sonnet |
| **R4.3** | Même chose pour **chaussures + accessoires** (surface, genre, largeur, édition, junior ; type, niveau, pression, contenance, conditionnement). Complément du référentiel proposé. | Sonnet |
| **R4.4** | **Comparaison et cascade** : `compare(a, b)` → identique / proche / différent selon `matching-rules.ts` ; étape 1 (GTIN, référence fabricant) ; étape 2 (signature famille + attributs discriminants) ; regroupement en modèles ; script `scripts/matching/shadow-run.ts` qui écrit les tables ; rapport de passage (R4-Q5). Première mesure R1 + couverture. | Sonnet |
| **R4.5** | **Textile + étape 3** (correspondance approchée avec score) : nom de modèle lu dans le titre après retrait du type, de la marque, du genre, du coloris et de la taille ; garde-fous type/genre/âge ; **réglage des seuils** sur le jeu R1 et sur un échantillon. | Opus |
| **R4.6** | **Analyse des erreurs et dossier de bascule** : mesure finale, échantillon de modèles « identiques » inter-marchands tirés de la prod et validés par Mathieu (R4-Q6), règles de repérage des non-reconnus (GAP-2026-09-27-01), décision sur l'option IA si besoin. **Arrêt : décision de bascule.** | Opus |

## 5. Questions pour Mathieu

**R4-Q1 — Où le moteur écrit-il ?**
R0 §4 proposait d'ajouter des colonnes à `products` et une table `product_families`. Proposé à la place, pour rester vraiment « fantôme » : **quatre tables nouvelles, préfixées `match_`**, sans aucune colonne ajoutée aux tables existantes.
- `match_runs` : un passage (date, version du moteur, compteurs).
- `match_offer_attributes` : par offre, famille reconnue (clé texte `marque|famille|catégorie`), attributs extraits avec leur source, motif de non-reconnaissance.
- `match_models` : les modèles du nouveau moteur (famille, attributs canoniques, signature).
- `match_offer_links` : offre → modèle, méthode (GTIN, référence, signature, approché), score.
Les familles restent dans les fichiers `config/` (D-2026-09-28-01) : pas de table `product_families` en R4. La relation « modèle proche » est calculée à la lecture (§4 du cadrage), pas stockée. `product_merges` (traçabilité des fusions de **produits existants**) sert à la bascule : il est créé en R5. En R5 on décidera si les tables `match_` deviennent le modèle du site ou sont recopiées.
*Raison* : rien à défaire si R4 échoue ; le site ne peut pas lire ces tables par accident.

**R4-Q2 — Quand le moteur tourne-t-il ?**
Proposé : **script lancé à la main**, recalcul complet (§3.2), après les passages de scraping. **Pas branché dans `lib/ingest.ts`** en R4 ; le branchement à l'ingestion (ou en fin de passage n8n) se décide en R5, quand les règles seront stables.

**R4-Q3 — Périmètre des offres.**
Proposé : offres `active` **et** `tracked` (la couverture du §9 les compte toutes les deux : une offre `tracked` Babolat est la référence du fabricant). Offres `expired` et `invalid` exclues du passage, mais présentes dans le jeu R1 figé. La couverture sera donnée **deux fois** : modèles avec ≥ 2 marchands (`active` + `tracked`), et modèles avec ≥ 2 marchands **en `active`** (ce que le site pourra montrer).

**R4-Q4 — Génération non écrite des deux côtés (§2.2).** C'est la question qui pèse le plus sur le résultat.
Proposé :
- **Cordages et accessoires (hors sacs)** : une famille sans génération connue dans le référentiel est traitée comme **« génération unique sur le marché »**, donc deux offres de même famille et mêmes attributs peuvent être « identiques ». Les exceptions connues (familles qui ont réellement plusieurs générations) sont notées dans le référentiel au fil des cas.
- **Raquettes, chaussures, sacs** : règle stricte inchangée (sans génération des deux côtés → « proche »), levée seulement par : génération écrite, GTIN, référence fabricant partagée, ou famille explicitement marquée « génération unique » dans le référentiel (liste proposée par Claude Code en R4.2/R4.3, validée par toi).
Autre option : règle stricte partout, en acceptant un rappel très bas sur les cordages et les accessoires.

**R4-Q5 — File de revue en mode fantôme.**
Proposé : **pas d'interface en R4**. Chaque passage produit un **rapport** (fichier Markdown + CSV dans le dépôt ou le scratchpad) : cas entre les deux seuils, conflits (même GTIN mais familles différentes), familles et termes fréquents non reconnus par marque et catégorie (GAP-2026-09-27-01), résumé des compteurs. La page de revue se construit en R5 / Phase 5, quand il y aura quelque chose à valider pour de vrai.

**R4-Q6 — Mesure de la précision au-delà du jeu R1.**
Le jeu R1 ne compte que 32 paires identiques : une seule erreur fait perdre 3 points. Et plusieurs de ces paires ont été tranchées avec une information que le moteur n'a pas (fiche fabricant consultée à la main). Proposé :
- sur le jeu R1, publier **deux rappels** : global, et « atteignable » (paires dont l'information nécessaire est dans les données capturées) ;
- en R4.6, tirer **30 modèles « identiques » inter-marchands** au hasard dans la prod ; tu valides chacun ; la précision de bascule se juge sur les deux (jeu R1 + échantillon).

**R4-Q7 — Référence SportSystem (§2.3).**
Proposé : vérifier en R4.2, sur un échantillon de fiches, si la `reference` SportSystem est la référence fabricant. Si oui, la copier dans `mpn` (backfill limité à ce champ, branche Neon puis prod, avec ton accord), et corriger `scripts/scraping/sportsystem.ts` au prochain passage.

**R4-Q8 — Option IA.**
Proposé : **pas de décision avant R4.6**, comme prévu. À noter dès maintenant : l'IA peut aider à décomposer un titre (textile surtout), **pas** à retrouver une génération qui n'est écrite nulle part (§2.2). Elle ne corrigerait donc pas la principale limite du rappel.

## 6. Hors périmètre de R4

- Tout changement visible sur le site (affichage « même modèle / modèle proche », page produit) : R5.
- Migration des produits existants, `product_merges`, branchement du moteur à l'ingestion : R5.
- Page de revue, rapport récurrent de supervision : R5 / Phase 5.
- Parcours du catalogue complet des revendeurs (prix hors promo, couverture) : Phase 4-bis. Rappel : le moteur ne peut rapprocher que ce que les scripts voient (une Pure Aero absente de Tennis Point FR hors promo ne sera jamais rapprochée).
- Automatisation des passages : Phase 2, indépendante de R4.
