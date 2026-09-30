# R4.5, étape 6 : état « indéterminé » dans `compare()`

**Session** : 2026-09-30, Opus (cadrage). Décision : D-2026-09-30-08. Report en code : Sonnet, session suivante.

**Origine** : D-2026-09-29-06 (« proche » séparé de « indéterminé », sous condition d'investiguer les indéterminés) ; D-2026-09-29-07 point 1 (millésime textile écrit d'un seul côté → indéterminé dès que l'état existe) ; ordre du chantier, étape 6 (`ETAT_ACTUEL.md`).

## 1. Constat

Dans `lib/matching/compare.ts`, un attribut connu d'un seul côté produit une différence d'effet `inconnu`, dont la gravité est la même que `proche` (`SEVERITY`). La règle des générations `standard` répond aussi « proche » quand la génération manque (`GENERATION_RULES.standard.inconnueUnCote` et `nonEcriteDesDeuxCotes`), et quand une année fait face à un libellé sans année (`inconclusive`). Le verdict « proche » mélange donc deux situations différentes : une différence connue et une information qui manque.

Le regroupement (`cluster.ts`) ne réunit que des paires « identique » (signature, identifiant, étapes 2 bis et 2 ter). Séparer « indéterminé » de « proche » **ne change donc aucun modèle**. Le changement porte sur le verdict des paires non réunies, le rapport et les mesures.

## 2. Mesure (lecture seule, 5 035 offres de la prod, 2026-09-30)

Paires inter-marchands d'une même famille (300 au plus par famille, même plafond que le rapport) jugées « proche » aujourd'hui (hors conflits) : **3 036**. Avec la frontière validée (§3) :

| Catégorie | Deviennent « indéterminé » | Restent « proche » | Principaux manques |
|---|---|---|---|
| Chaussures | 694 | 583 | génération 213, surface 196, genre 152, génération + surface 112 |
| Textile | 381 | 323 | nom de modèle illisible 342, millésime + modèle 22 |
| Cordages | 214 | 119 | conditionnement + jauge + longueur 124, jauge 47 |
| Raquettes | 210 | 299 | génération + poids 115, génération 35 |
| Accessoires | 191 | 22 | sacs : contenance, taille, type, génération |
| **Total** | **1 690** | **1 346** | |

Exemples relus :
- « ASICS Court FF 3 Chaussure terre battue » / « Asics Court FF 3 […] Homme » : la surface n'est écrite que d'un côté → indéterminé ;
- « adidas Barricade 14 […] Hommes » / « Adidas Barricade 14 Toutes Surfaces » : genre absent d'un côté → indéterminé ;
- « Head Lynx Tour (200m) » / « HEAD Lynx Tour cordages de tennis » : conditionnement et jauge d'un seul côté → indéterminé ;
- « Lacoste Polo Hommes - orange » (Tennis Point FR) / « Polo Lacoste Regular Coton » : aucun nom de modèle lisible d'un côté → indéterminé ;
- « Babolat Pure Drive Team Gen11 » / « Pure Drive Gen 11 2025 » : « Team » est un marqueur, la différence est connue → reste proche ;
- « HEAD Endure Pro » / « Endure Pro BOA Clay » : « BOA » est un marqueur → reste proche.

Script de mesure : jetable, hors dépôt (dossier temporaire de la session). Le passage à blanc du report en code refait la mesure avec le vrai code.

## 3. Règle validée (D-2026-09-30-08)

**Ordre des verdicts** : différent > proche > indéterminé > identique. Une paire qui a au moins une différence connue reste « proche », même si d'autres informations manquent. Une différence « différent » l'emporte sur tout.

**Indéterminé** : aucune différence connue, seulement des informations manquantes.

**Frontière entre marqueur et caractéristique descriptive**, quand un attribut n'est écrit que d'un seul côté :

| Nature | Définition | Attributs | Écrit d'un seul côté |
|---|---|---|---|
| **Marqueur** | Son absence veut dire l'article de base. | `version` (toutes catégories : Team, Lite, Tour, BOA, Pro, Rafa Origin, « S » d'antivibrateur, version de sac…), `largeur` (Wide), `edition` (textile : RG, Wimbledon…), `numero` (« II »), `sous_gamme` (3-Stripes, Climacool) ; valeur à exception (`attributeValueOverrides` : Premium, PRM, Leather, Y-3, ASMC) ; valeur de source `titre_marqueur` (« + » des raquettes, taille junior). | **proche** (inchangé) |
| **Caractéristique descriptive** | Tout article en a une valeur, mais le titre ne l'écrit pas toujours. | Tous les autres attributs discriminants : `genre`, `age_group`, `surface`, `poids`, `tamis`, `plan_cordage`, `longueur` (raquettes lue sur la fiche, cordages, **textile**), `jauge`, `conditionnement`, `matiere`, `contenance`, `taille_sac`, `type_sac`, `type`, `pression`, `niveau`, `typeGrip`, `lot` (balles), `modele` (textile), **`millesime`** (textile). | **indéterminé** |

Cas particuliers :
- **Génération** (règle `standard`) : inconnue d'un côté, non écrite des deux côtés (hors génération unique), ou année face à un libellé sans année → **indéterminé**. Deux générations vérifiées différentes : inchangé (« différent » en `standard`, « proche » en `textile`).
- **Attribut requis absent des deux côtés** (`requiredAttributes` : nom de modèle textile, jauge et conditionnement des cordages, nombre de balles) → **indéterminé**.
- **`knownAloneIsDifferent`** (sac à chaussures, porte-clés, gym, voyage, B5) : inchangé, « différent » même écrit d'un seul côté.
- **Levée C-Q3** (raquettes de même famille, version et génération) : inchangée, la caractéristique dérivée connue d'un seul côté est ignorée.
- **Deux valeurs écrites et différentes** : inchangé (rôle de l'attribut, tolérances chiffrées). Deux longueurs textile différentes restent « proche » (T-Q2) ; deux millésimes différents aussi.
- **Conflits** (identifiant partagé mais contradiction) : inchangés (niveau « proche » + `conflit`, jamais fusionnés).

Réponses de Mathieu (AskUserQuestion, 2026-09-30) :
1. Principe, ordre des verdicts, frontière et fichier `indetermines.csv` : validés.
2. Marqueur écrit d'un seul côté → **proche** (inchangé ; cohérent avec C-Q1 et D-2026-09-29-07). L'autre option (indéterminé) aurait basculé 669 paires de plus.
3. Sacs : type, taille, contenance écrits d'un seul côté → **indéterminé** (environ 125 paires).
4. Textile : longueur écrite d'un seul côté (« Short 7in » / « Short ») → **indéterminé** (7 paires) ; modifie R4.5-a pour ce cas seulement.

## 4. À reporter en code (Sonnet)

1. **Type** `MatchLevel` (`config/matching-rules.ts`) : ajouter `"indetermine"`. `GENERATION_RULES.standard` : `inconnueUnCote` et `nonEcriteDesDeuxCotes` → `"indetermine"`. Mettre à jour les commentaires de tête (« le cas devient proche ou part en revue »).
2. **Liste des marqueurs** dans `config/matching-rules.ts` (par exemple `MARKER_ATTRIBUTES = ["version", "largeur", "edition", "numero", "sous_gamme"]`), avec le renvoi à D-2026-09-30-08.
3. **`compare.ts`** :
   - `attributeDifferences`, cas « connu d'un seul côté » : après `knownAloneIsDifferent` et la levée C-Q3, effet `proche` si l'attribut est un marqueur ou si une des valeurs a la source `titre_marqueur` ; sinon effet `inconnu`. Attribut requis absent des deux côtés : `inconnu` (inchangé).
   - Boucle des exceptions de valeur (Premium, Leather…) : inchangée (effet `proche` ou `different`).
   - `generationDifference` : `indetermine` → effet `inconnu` ; cas `inconclusive` (année face à libellé) → `inconnu`.
   - `SEVERITY` : `inconnu` 1, `proche` 2, `different` 3 ; `worst()` renvoie `indetermine` quand la gravité maximale est celle d'`inconnu`.
   - Textile, `millesime` et `longueur` écrits d'un seul côté : `inconnu` (caractéristiques descriptives) ; ils le deviennent par la règle générale, rien à coder à part. Vérifier que `numero`, `edition`, `sous_gamme` restent `proche`.
4. **Consommateurs** à vérifier : `cluster.ts` (`onlySubrangeMissing` lit l'attribut et le côté vide, pas l'effet : inchangé ; étape 2 bis sur « identique » : inchangée) ; `textile-review.ts` (`genreUnknown` lit l'effet `inconnu` du genre : toujours juste ; `hard` lit `different` : inchangé) ; tout autre lecteur de `niveau === "proche"`.
5. **Rapport** (`report.ts`) : compteur `paires_famille_inter_marchands` avec la clé `indetermine` ; nouveau fichier **`indetermines.csv`** (mêmes colonnes que `proches.csv`, plus une colonne `manques` : attributs absents, triés), écrit par `scripts/matching/shadow-run.ts` ; `proches.csv` ne garde que les « proche ». Phrase du §3 du rapport complétée.
6. **Engine** `r4.5-etape6` (`ENGINE_VERSION` de `shadow-run.ts`).
7. **Tests** : mettre à jour les tests existants qui attendaient « proche » pour une information manquante (chacun cité dans la PR avec la ligne du tableau §3 qui le justifie). Paires pièges à ajouter (`tests/unit/matching-etape6.test.ts`) :
   - surface écrite d'un seul côté (Court FF 3) → indéterminé ;
   - genre écrit d'un seul côté (Barricade 14) → indéterminé ;
   - génération écrite d'un seul côté, raquette → indéterminé ; année face à libellé → indéterminé ;
   - cordage sans jauge ni conditionnement d'un côté → indéterminé ;
   - textile sans nom de modèle d'un côté → indéterminé ; « Club 25 Tech » / « Club Tech » → indéterminé ;
   - « Short 7in » / « Short » (même marque, même modèle) → indéterminé ; « 7in » / « 9in » → proche ;
   - « Head Tour 25l » / « Head Tour XL » → indéterminé ; « Tour sac à chaussures » / « Tour Bag XL » → différent (B5 inchangé) ;
   - « Pure Drive Team Gen11 » / « Pure Drive Gen11 » → proche ; « Endure Pro » / « Endure Pro BOA » → proche ; « Tie Break II » / « Tie Break » → proche ; édition RG d'un seul côté (textile) → proche ;
   - surface différente écrite des deux côtés + genre absent d'un côté → proche (la différence connue l'emporte) ;
   - genre différent + surface absente d'un côté → différent.
8. **Passage à blanc en prod** (lecture seule) et contrôles :
   - modèles, liens, modèles multi-marchands et file de revue textile **identiques** à `ed52d6ec…` (3 268 modèles, 4 732 liens, 234 multi-marchands, 220 paires) : tout écart est un défaut à expliquer avant la PR ;
   - répartition des paires proche / indéterminé comparée au §2 (1 346 / 1 690 attendues, écart à expliquer) ;
   - relecture d'un échantillon de `indetermines.csv` et de `proches.csv` (au moins 10 lignes par catégorie).
9. **Écriture en prod** après accord de Mathieu, comme aux étapes précédentes.

## 5. Suite

Étape 7 : investigation des indéterminés, dont le report de R4.5-c (liste `generationUnique` déjà validée, D-2026-09-30-02 : Q5 s'écrit dans la version de `generationDifference` qui distingue « indéterminé »), et choix du sort des paires indéterminées catégorie par catégorie (A, B ou C, D-2026-09-29-06 point 3), `indetermines.csv` en main.
