# R4.5 — Textile et correspondance approchée (étape 3) : cadrage (2026-09-29)

> Étape R4.5 de `R4_cadrage.md` §4. **Cadrage seulement, aucun code.** Proposition de Claude Code (Opus), **validée par Mathieu le 2026-09-29 (D-2026-09-29-04)** : toutes les propositions retenues (réponses au §6). L'exécution se fera ensuite en Sonnet, dans une nouvelle session.
>
> Données : lecture seule sur la prod (connecteur Neon, 2026-09-29), offres textiles `active` + `tracked` (2 829), et jeu R1.

## 1. Ce qu'on cherche

Le textile, c'est **2 829 offres, 57 % du total**, et aucune n'est rapprochée aujourd'hui (pas de référentiel, décision Q10). Il faut qu'une même tenue vendue chez deux marchands apparaisse comme un seul modèle, **sans faux regroupement** (objectif de précision ≥ 95 %, principe R3 : dans le doute, on ne fusionne pas).

La règle métier est déjà tranchée (D-2026-09-27-06) :
- même modèle, collection non écrite ou écrite d'un seul côté → **identique** ;
- génération ou collection **explicitement différente** → **proche** ;
- édition spéciale écrite d'un seul côté (ex. Freelift Pro « RG ») → **proche**.

## 2. Ce que montrent les données

### 2.1 Qui vend quoi

| Marchand | Offres textiles | Ce qu'on a en plus du titre |
|---|---|---|
| Tennis Point FR | 1 749 (62 %) | **rien** : SKU interne, couleur et tailles seulement |
| SportSystem | 492 | référence fabricant dans le SKU (Babolat `4MP2441-…`, Nike `DC7207`, Head `811379-BK`, Lacoste `TH8917-T01`…), GTIN pour 207 |
| Tecnifibre | 133 | référence fabricant (`22MEPOWH32`) |
| Tennispro.fr | 116 (tout adidas) | code article adidas dans `mpn` pour 45 (`KX2138`) |
| Head | 180 | numéro d'article Head (`814236`) |
| Babolat | 91 | référence Babolat (`3MP2011`) |
| Sport 2000 | 66 | code fabricant (`FD5320-626`) et GTIN pour toutes |

Les marques présentes chez au moins deux marchands : adidas, Nike, Head, Lacoste, Babolat, Tecnifibre, Fila, Lotto, Asics, Mizuno, K-Swiss, Sergio Tacchini, New Balance. Les autres (Bidi Badu 434 offres, Under Armour, J.Lindeberg, Wilson, Ellesse…) ne sont vendues que par un seul marchand : pas de rapprochement possible entre marchands, seulement le regroupement des couleurs chez le même marchand.

### 2.2 La référence fabricant rapproche peu, mais sûrement

En comparant la partie « style » des références (avant le code couleur), **15 modèles** se retrouvent chez deux marchands. Tous sont justes, y compris deux que le titre seul n'aurait jamais réunis :
- adidas `JG0994` : « Short Homme Club » (Sport 2000) = « Short SW Stretch Woven Climacool » (SportSystem), même prix d'origine 40 €. **C'est la paire 17 du jeu R1**, classée « proche » parce que « SW » était incompris : elle devient « identique ».
- Lacoste `TH8917` : « Core Performance » (Sport 2000) = « Sport Ultra Dry » (SportSystem), 70 € des deux côtés.

Limite : Tennis Point FR n'a aucune référence, donc la référence ne sert qu'entre SportSystem, les sites de marque, Sport 2000 et Tennispro.fr.

### 2.3 Le titre rapproche beaucoup plus, mais avec des pièges

Estimation grossière (lecture du nom de modèle après retrait de la marque, du type, du genre, de la couleur et de la taille) :
- **35 modèles** ont exactement le même nom chez au moins deux marchands (116 offres) ;
- avec une lecture plus souple, **316 paires** d'offres de marchands différents se ressemblent : 107 ont exactement les mêmes mots, **205 ont un mot en plus d'un seul côté**.

C'est ce mot en plus qui décide de tout. Exemples réels :

| Mot en plus | Ce que c'est | Bon verdict |
|---|---|---|
| « cardinal », « coloris », « bleu ciel » | couleur | ignoré |
| « survêtement », « shrt », « sleeve » | type ou abréviation | ignoré |
| « Club » / « Club **Pleat** » (paire R1 56) | autre modèle (jupe plissée, 50 € au lieu de 40 €) | différent |
| « Freelift » / « Freelift **Pro** » | autre modèle | différent |
| « Club Tech » / « Club **25** Tech » | millésime de la gamme | proche |
| « Tie Break » / « Tie Break **II** » | génération | proche |
| « Freelift Pro » / « Freelift Pro **RG** » (R1 59) | édition spéciale | proche |
| « Pro » / « Pro **Londres** », « Pro **Miami** » | collection d'un tournoi | à trancher (Q3) |
| « Advantage » / « Advantage **Slam** » | autre modèle | différent |
| « Club » / « Club **Ann** » (Head) | autre modèle | différent |

Autres pièges vus dans les titres :
- **Type de vêtement** : « Play Crew Neck Tee », « Play Cap Sleeve Top » et « Play Tank Top » sont trois modèles Babolat. Un simple « haut » ne suffit pas, il faut le type précis (paire R1 55 : débardeur / jupe).
- **Longueur** : Nike « Advantage 7in » et « Advantage 9in », adidas « Ergo 7Inch » et « Ergo 9Inch ».
- **Écriture propre à chaque marchand** :
  - Tennis Point FR met la couleur en fin de titre après un tiret (« … Femmes - bleu clair, blanc ») ;
  - SportSystem répète le type et la marque (« Jupe de tennis Adidas Jupe de tennis femme Adidas Club Femme ») ;
  - Sport 2000 reprend les abréviations Nike (`M NKCT DF ADVTG TOP` = « NikeCourt Dri-FIT Advantage Top » homme, `VCTRY` = Victory, `SKRT` = jupe) ;
  - Head écrit le modèle en majuscules en tête (« TIE BREAK II- T-shirt de tennis fille »).

### 2.4 Le prix d'origine aide, mais ne tranche pas

Dans 7 des 35 groupes, le prix d'origine varie de plus de 15 %. Parfois c'est une erreur de regroupement (le « Play » Babolat féminin mêlait un débardeur et un t-shirt). Parfois c'est bien le même article : la paire R1 18 (adidas Club junior, 28 € / 35 €) a été validée « identique ». Le prix ne peut donc servir que d'indice, pas de barrière.

### 2.5 Hors textile, l'étape 3 a peu à faire

Il reste 294 offres non reconnues (accessoires surtout : sacs Head, surgrips, balles en carton). Leur problème est une famille absente du référentiel, pas une ressemblance à mesurer : c'est le chantier « règles de repérage des non-reconnus » de R4.6 (GAP-2026-09-27-01). Le principal frein du rappel, la génération non écrite (3 941 paires « proches »), ne se règle pas non plus par une ressemblance de titre (§5).

## 3. Proposition pour le textile

### 3.1 Étape 1 : la référence fabricant

Ajouter au textile la comparaison par référence déjà utilisée pour les autres catégories :
- on garde la partie « style » de la référence, sans le code couleur ni la taille (`4MP2441-1000-2000-4118` → `4MP2441` ; `FD5320-626` → `FD5320` ; `811379-BK` → `811379` ; `TH8917-00-031` → `TH8917`) ;
- la règle de découpe est écrite **par marque**, et vérifiée sur les données avant d'être écrite ;
- les codes article adidas (`JG0994`, `KX2138`) désignent un coloris : deux offres avec le même code sont le même article, mais deux codes différents peuvent être le même modèle en deux couleurs ;
- même référence de style → **identique**, quel que soit le titre.

### 3.2 Étape 2 : la signature textile lue dans le titre

Extraire de chaque titre, avec un lexique par marchand pour les tournures du §2.3 :
- **marque** ;
- **type précis** : une liste fermée d'une vingtaine de types (t-shirt, débardeur, polo, haut manches longues, jupe, jupe-short, short, robe, sweat, sweat à capuche, veste, pantalon, legging, collant, brassière, chaussettes, casquette, visière, bandeau, poignet) ;
- **genre** et **âge** (homme, femme, unisexe ; adulte, junior) ;
- **longueur** quand elle est écrite (7in, 9in…) ;
- **couleur** : retirée du nom, gardée comme variante ;
- **marqueurs** : année, millésime (« 25 »), génération (« II »), édition (« RG », nom de joueur), collection de tournoi (« Londres », « Melbourne ») ;
- **nom de modèle** : les mots qui restent, dans l'ordre, une fois retirés la marque, le type, le genre, la couleur, la taille, les marqueurs et une liste de **mots neutres** (« tennis », « court », « Dri-FIT », « tee-shirt », « survêtement »…).

Verdict :
- marque, type, genre, âge et nom de modèle **égaux** → **identique**, que les couleurs soient les mêmes ou non ;
- mêmes éléments, mais un marqueur différent ou écrit d'un seul côté → **proche** ou **identique**, selon D-2026-09-27-06 et la réponse à Q3 ;
- type, genre ou âge différents → **différent**, toujours ;
- noms de modèle différents → pas de fusion à l'étape 2 : la paire passe à l'étape 3.

### 3.3 Étape 3 : la correspondance approchée, en file de revue

Pour les paires restantes de même marque, type, genre et âge, calculer un **score** à partir de :
- la part de mots du nom de modèle en commun ;
- la nature du mot en plus : connu comme neutre (score haut) ou inconnu (score bas) ;
- l'écart de prix d'origine (indice seulement, §2.4).

**Proposé : en R4.5, le score ne fusionne rien tout seul.** Il classe les paires dans la file de revue du rapport de passage (`revue-textile.csv`) :
- au-dessus d'un seuil bas → dans la file, les plus probables en premier ;
- en dessous → rien.

Tu valides ou refuses ces paires. Chaque décision enrichit le lexique : un mot jugé neutre y entre, un mot jugé distinctif (« Pleat », « Slam ») y entre aussi. Le passage suivant rapproche donc davantage à l'étape 2, sans risque ajouté.

Pourquoi ne pas fusionner automatiquement au-dessus d'un seuil haut, comme prévu au cadrage (§8) : aujourd'hui, un mot inconnu peut aussi bien être une couleur qu'un autre modèle (« Pleat », « Pro », « Slam »). Un score fondé sur les mots ne sait pas faire la différence ; seul le lexique le sait. La question se repose en R4.6, avec la précision mesurée sur la file (Q4).

### 3.4 Regroupement chez un même marchand

Tennis Point FR publie une offre par couleur (« Club Jupe Femmes - blanc », « - noir »…). Avec la signature, ces offres se regroupent en un seul modèle chez le marchand. C'est utile même pour les marques vendues par un seul marchand : un modèle, plusieurs couleurs.

## 4. Tests et mesure

- **Jeu R1** : les 10 paires textiles (13, 17, 18, 19, 54 à 60), avec la paire 17 reclassée « identique » si tu valides le §2.2.
- **Nouvelles paires pièges versionnées** (titres réels, comme en R4.4-bis) : Club / Club Pleat, Freelift / Freelift Pro, Play Crew Neck Tee / Play Tank Top, Advantage 7in / 9in, Tie Break / Tie Break II, Club Tech / Club 25 Tech, Club / Club Ann, Advantage / Advantage Slam, Pro / Pro Londres, plus les deux paires trouvées par la référence (adidas JG0994, Lacoste TH8917).
- **Relecture complète**, après un passage à blanc, de tous les modèles textiles multi-marchands (quelques dizaines attendus), comme pour les 103 modèles de R4.4-bis.
- **Mesure** : précision sur cette relecture ; rappel sur les 10 paires R1 ; nombre de modèles textiles multi-marchands (aujourd'hui 0).

## 5. Les deux sujets hérités de R4.4

**« Valeur dominante »** (déduire une génération non écrite de la valeur la plus fréquente dans la gamme, piste de GAP-2026-09-29-01) : **proposé de ne pas le faire**. Cela revient à deviner une information que le marchand n'a pas écrite, ce qu'interdit R3. Exemple : si la plupart des Pure Drive en vente sont des Gen 11, une Pure Drive sans génération n'en est pas une pour autant ; ce peut être un fin de série Gen 10 soldé, précisément le cas qu'un site de bons plans rencontre le plus. Autre option : l'appliquer seulement à la file de revue, pour classer, sans fusionner.

**Familles `generationUnique`** (familles qui n'ont qu'une génération sur le marché, où l'absence de génération ne bloque pas) : utile, mais sans lien avec le textile. Établir la liste demande de vérifier chaque famille sur le web. Proposé : **en faire une étape à part, R4.5-c**, après le textile. Claude Code y proposerait la liste à partir des familles bloquées du rapport (`proches.csv`, cause « proche : generation »), et tu la validerais.

## 6. Questions pour Mathieu

**T-Q1 — Référence avant le titre.** Deux offres textiles avec la même référence de style fabricant sont **identiques**, même si les titres diffèrent (adidas JG0994, Lacoste TH8917). La paire R1 17 passe de « proche » à « identique ».
*Proposé : oui.*

> **Réponse** : identique, paire R1 17 reclassée (à reporter en R4.5-a).

**T-Q2 — Longueur.** Nike Advantage 7in / 9in : même gamme, longueurs différentes.
*Proposé : **proche**, comme la longueur des raquettes (Q2 de D-2026-09-28-02).* Autre option : différent.

> **Réponse** : proche.

**T-Q3 — Collections de tournoi.** adidas « Pro Londres », « Pro Miami », « Freelift Pro New York » : coloris et finitions propres à un tournoi, souvent à un autre prix. Écrite d'un seul côté, est-ce une **collection** (→ identique, D-2026-09-27-06) ou une **édition** (→ proche, comme « RG ») ?
*Proposé : **édition, donc proche**.* Ce sont des articles distincts chez adidas, avec leur propre code.

> **Réponse** : édition, donc proche.

**T-Q4 — Pas de fusion automatique par score en R4.5.** Le score remplit la file de revue ; seule la signature exacte (§3.2) et la référence (§3.1) fusionnent. Le seuil haut automatique se rediscute en R4.6, précision mesurée à l'appui.
*Proposé : oui.* Autre option : fusion automatique au-dessus d'un seuil réglé sur le jeu R1, avec un rappel plus haut mais un risque de faux regroupements difficile à mesurer sur 10 paires.

> **Réponse** : file de revue seulement, pas de fusion par score en R4.5.

**T-Q5 — Prix d'origine.** Un écart de prix n'empêche pas la fusion ; il baisse seulement le score de l'étape 3.
*Proposé : oui* (paire R1 18 : 28 € / 35 €, validée identique).

> **Réponse** : simple indice.

**T-Q6 — « Valeur dominante ».**
*Proposé : non* (§5).

> **Réponse** : non.

**T-Q7 — Liste `generationUnique`.**
*Proposé : étape à part R4.5-c, après le textile* (§5).

> **Réponse** : étape à part R4.5-c.

## 7. Découpage de l'exécution (Sonnet)

| Étape | Contenu |
|---|---|
| **R4.5-a** (**fait le 2026-09-29**) | Extraction textile (fonctions pures, lexique par marchand), référence de style par marque, signature et verdict de l'étape 2, paires pièges versionnées, jeu R1 ; tests. |
| **R4.5-b** (**code et passage à blanc fait le 2026-09-29 ; écriture en prod après accord de Mathieu**) | Score de l'étape 3 et fichier `revue-textile.csv` dans le rapport ; passage à blanc en prod (lecture seule), relecture complète des modèles textiles multi-marchands ; écriture en prod après ton accord. |
| **R4.5-c** (**déplacé, D-2026-09-29-07**) | Liste des familles `generationUnique` proposée (Opus, vérification web), validée par toi, puis reportée dans `config/model-families.ts` (Sonnet). Se fait **après** les références de style toutes catégories, les corrections d'extraction et l'état « indéterminé », dans l'investigation des paires indéterminées (`R4_5_mesure_separation.md` §5.4). |

Toujours hors périmètre : tout changement visible sur le site (R5).
