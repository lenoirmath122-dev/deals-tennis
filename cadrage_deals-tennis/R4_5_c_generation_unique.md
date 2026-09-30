# R4.5-c — Familles `generationUnique` : proposition

Session desktop Opus, 2026-09-30. Source : `rapport-passage/proches.csv` du passage en prod `r4.5-b-textile` (3 345 paires « proches »). Rien n'est modifié dans le code ni dans le référentiel : ce document attend la validation de Mathieu. Le report dans `config/model-families-*.ts` se fera ensuite en Sonnet.

## 1. Ce que fait le marqueur

`generationUnique` (`lib/matching/compare.ts:127-130`, `212-213`) agit dans un seul cas : **génération écrite d'aucun des deux côtés**. Il ne change rien quand un côté l'écrit (« SFX Evo 2025 » face à « SFX Evo » reste « proche », règle `inconnueUnCote`). Il concerne les raquettes, les chaussures et les sacs. Les cordages et les autres accessoires sont déjà traités comme génération unique par défaut, et la règle textile ne bloque pas.

## 2. Mesure

Au total, 381 paires sont « proches » à cause de la génération seule. Dans 259 d'entre elles, réparties sur 27 familles, la génération n'est écrite **d'aucun des deux côtés** : ce sont les seules paires que le marqueur ferait passer à « identique ».

**Constat principal : dans 9 de ces familles, le blocage de génération masque des défauts d'extraction.** On y trouve des paires d'articles clairement différents que rien d'autre ne sépare :

| Famille | Exemple de paire qui deviendrait « identique » | Défaut |
|---|---|---|
| Head Base (sacs) | « Base L » / « Racquet Base S » | taille S/M/L non lue |
| Babolat Pure (sacs) | « RH12 Pure Aero » / « Pure Drive Rh12 » ; « RH9 » / « RH6 » | version Aero/Drive/Strike et contenance RH non lues d'un côté |
| Head Tour (sacs) | « Tour sac à chaussures » / « Tour Bag XL Racquet » ; « Key Holder » / « Racquet S » | type de sac non lu |
| Tecnifibre T-Fight junior | « T-fight Club 17 » / « T-Fight Tour 26 » (Amazon) | version Club/Team/Tour et taille non comparées |
| Head Speed | « Speed 23 » / « Junior Ig Speed 21 » | taille junior non lue chez Tennispro.fr |
| Tecnifibre Tour Endurance | « Backpack » / « Rackpack » | type de sac |
| Head Pro X (sacs) | « Pro X XL » / « Pro X Racket Bag L » | taille |
| Babolat Court (sacs) | « Evo Court L » / « Court L » | « Evo Court » rangé dans Court |
| Wilson Super Tour | « Super Tour Red » / « Blade Super Tour » | édition non lue |

Aucune de ces familles ne peut être marquée avant correction de l'extraction. Ces défauts restent aussi un risque pour une future levée de la règle des générations, par exemple le levier « valeur dominante ».

## 3. Vérification web des autres familles

| Famille | Paires levées | Constat | Proposition |
|---|---|---|---|
| Head Endure Pro (chaussures) | 7 | Lancée en juillet 2025, première génération (lacets et BOA) | **Unique** |
| Babolat SFX Evo (chaussures) | 8 | Nouveau modèle 2025 qui succède à la SFX 3 sous un autre nom (famille distincte au référentiel) | **Unique** |
| adidas Avaluxe (chaussures) | 6 | Ancien nom : Stella Court ; aucune « Avaluxe 2 » trouvée | **Unique** |
| ASICS Game FF (chaussures) | 7 | Pas de successeur numéroté (Court FF et Solution Speed FF sont d'autres lignes) | **Unique** |
| Wilson Intrigue (chaussures) | 4 | Intrigue Pro et Intrigue Tour, aucune 2e génération trouvée | **Unique** |
| adidas Courtflash (chaussures) | 28 | Modèle junior « Courtflash K » inchangé, nouveaux coloris chaque saison (SS25, AW26) | **Unique**, à confirmer (Q2) |
| Babolat Pulsion (chaussures junior) | 23 | Références 32S17518, 32S19518, 32S20518, 3K2S25A518 : sorties 2017 à 2025, refonte ou simple coloris ? | **À trancher** (Q2) |
| Lacoste AG-LT (chaussures) | 1 | AG-LT21 puis AG-LT23 Ultra : deux générations ; « Ultra » n'existe qu'en 23 | **Non** ; piste : « Ultra » = marqueur de la génération 23 (Q3) |
| Head Challenge (raquettes) | 2 | Gamme « IG Challenge » 2024, anciennes gammes Challenge non datées | **Non** (pas de preuve) |
| Head Novak (raquettes junior) | 6 | Versions 2022 et 2024 | **Non** |
| Head Coco (raquettes junior) | 2 | Versions 2022 et 2024 | **Non** |
| Babolat Ballfighter (raquettes junior) | 1 | Version 2023 plus des versions antérieures | **Non** |
| Babolat Drive Junior, Propulse ; adidas Avaflash, Barricade ; Nike GP Challenge ; Head Radical | 2 à 43 | Plusieurs générations déjà écrites dans nos propres titres (Gen 11, Propulse 3, Avaflash 2, Barricade 13/14, GP Challenge 1/1.5, Radical 2021 à 2025) | **Non** |

Proposé : **5 familles sûres** (Endure Pro, SFX Evo, Avaluxe, Game FF, Intrigue), soit 32 paires. On passe à **6 familles et 60 paires** si Courtflash est retenue. C'est modeste face aux 3 345 paires « proches ».

Constat sur les raquettes junior : Head et Babolat les renouvellent tous les deux ans environ (nouveau décor, même taille). La règle stricte les garde en « proche », ce qui est juste si les spécifications changent. Sinon, c'est un rapprochement manqué, qui ne se règle pas par `generationUnique`.

## 4. Questions pour Mathieu

**Q1 — Liste retenue.** Marquer `generationUnique` sur Head Endure Pro, Babolat SFX Evo, adidas Avaluxe, ASICS Game FF et Wilson Intrigue ?
*Proposé : oui.*

**Q2 — Chaussures renouvelées seulement par coloris (Courtflash, Pulsion).** Un modèle sans numéro, ressorti chaque saison dans de nouveaux coloris, compte-t-il comme génération unique ?
*Proposé : oui pour Courtflash (modèle inchangé, coloris de saison) ; non pour Pulsion tant qu'une refonte entre 2017 et 2025 n'est pas exclue.*

**Q3 — Lacoste AG-LT.** Ajouter « ultra » comme marqueur de la génération AG-LT23 au lieu de marquer la famille ?
*Proposé : oui (report en Sonnet, avec les autres).*

**Q4 — Défauts d'extraction du §2.** Les corriger dans une étape à part (Sonnet, avec des paires pièges tirées du tableau) avant R4.6 ?
*Proposé : oui, étape R4.5-d. Tant que ce n'est pas fait, ces familles ne sont pas marquées. Aujourd'hui, c'est la génération qui les protège.*

**Q5 — Année écrite d'un seul côté pour une famille unique.** Pour une famille marquée, « SFX Evo 2025 » face à « SFX Evo » doit-il aussi donner « identique » ? Cela concerne 8 paires SFX Evo.
*Proposé : oui. Une seule génération existe, donc l'année ne peut désigner qu'elle. Il faut changer `generationDifference` (Sonnet).*

## 5. Réponses de Mathieu (2026-09-30, D-2026-09-30-02)

- **Q1** : oui, les 5 familles.
- **Q2** : **Courtflash et Pulsion** retenues toutes les deux (un coloris de saison n'est pas une génération).
- **Q3** : oui, « ultra » = génération AG-LT23.
- **Q4** : oui, étape à part **R4.5-d**.
- **Q5** : oui. Conséquence connue : un titre « Pulsion 2019 » serait réuni avec « Pulsion » ; aucun titre Pulsion en base n'écrit d'année aujourd'hui.

Liste finale : Head Endure Pro, Babolat SFX Evo, adidas Avaluxe, ASICS Game FF, Wilson Intrigue, adidas Courtflash, Babolat Pulsion (7 familles, 83 paires levées d'après `proches.csv`, plus les 8 paires SFX Evo avec l'année d'un seul côté).

## 6. Suite

1. **R4.5-c, report (Sonnet)** : `generationUnique: true` sur les 7 familles (avec une note de source), marqueur « ultra » pour AG-LT23, `generationDifference` modifiée pour Q5, tests (dont les paires SFX Evo et Courtflash), passage à blanc en prod et comparaison avec `r4.5-b-textile`.
2. **R4.5-d (Sonnet)** : corriger les défauts d'extraction du §2, paires pièges versionnées.
