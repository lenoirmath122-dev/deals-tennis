# R2 — Référentiel de familles de modèles v1 (2026-09-28)

> Livrable R2 (§7 et §10 de `CADRAGE_rapprochement-multi-niveaux.md`), avec `config/matching-rules.ts` (règles de tolérance, questions Q1-Q6).
> Fichier proposé : `config/model-families.ts`. **Proposition de Claude Code, à valider par Mathieu** (§0 du cadrage). Aucun code ne le lit encore : il sera consommé par le moteur en R4.
> Aucune modification de code applicatif ni de base. Lecture seule sur la base Neon de prod.
> **Réponses de Mathieu à Q1-Q12 : D-2026-09-28-02 (2026-09-28).** Le §5 ci-dessous garde les questions telles que posées ; elles seront remplacées par les réponses lors du report.

## 1. Ce que contient le fichier

| | Raquettes | Cordages | Total |
|---|---|---|---|
| Familles | 58 | 43 | 101 |
| dont statut `observe` | | | 91 |
| dont statut `a_confirmer` | | | 10 |
| dont lignes junior (`junior: true`) | 8 | 0 | 8 |

Marques couvertes : Babolat, Head, Wilson, Tecnifibre, Lacoste, Dunlop, Prince, Pro Kennex, Yonex (raquettes) ; Babolat, Head, Luxilon, Gosen, Dunlop, Tecnifibre, West Gut, Wilson, Kirschbaum, Prince, Pro's Pro, Yonex (cordages).

Chaque famille porte :
- `aliases` : écritures rencontrées, sous forme normalisée (minuscules, sans accents, tirets et barres remplacés par un espace ; le « + » est conservé). La famille se reconnaît par l'alias **le plus long** trouvé dans le titre (« blade feel » l'emporte sur « blade ») ;
- `versions` : déclinaisons qui font un **produit différent** au sens du §5 (tamis, Lite / Tour / Team, plan de cordage, taille junior, version de cordage Blast / Soft…). Sans version écrite = version standard ;
- `generations` : **seulement les correspondances observées** (dans un titre, ou vérifiées sur une fiche en R1, source écrite pour chacune). Une génération absente est « inconnue » et la règle des générations (D-2026-09-26-01) s'applique ;
- `editions` : séries spéciales ou coloris nommés (voir Q7) ;
- `BRAND_ALIASES` : marques enregistrées sous un autre nom en base (voir §4).

## 2. Méthode d'amorçage

1. Lecture des titres réels en base pour les catégories raquettes et cordages, **toutes offres** (actives ou non), pour voir le plus d'écritures possible : 383 offres raquettes, 204 offres cordages au 2026-09-28.
2. Regroupement par marque des termes de modèle récurrents, puis séparation famille / version / génération / édition selon le §5 du cadrage et les décisions déjà actées (D-2026-09-26-01, D-2026-09-27-05/06/07).
3. Report des cas tranchés en R1 : chaque famille concernée cite la paire R1 qui la justifie (ex. Clash V2 ≠ V3, paire 3 ; FX 500 Lite 2026 ≠ FX 500 Lite, paires 6 et 7 ; RPM Hurricane = ex Pro Hurricane Tour, paire 65).
4. Aucune génération ni correspondance déduite de mémoire. Ce qui n'a pas été vu est laissé vide ou marqué `a_confirmer`.

**Vérification du 2026-09-28** (session de reprise, par sondage) : 12 écritures citées dans le fichier retrouvées telles quelles en base (Pure Aero Gen 9, Pure Drive Gén 11, Speed Auxetic, Graphene Touch Speed, Blade Feel, Clash V3, T-Fight 300 IG, L23, RPM Hurricane, West Gut MT, Eggpower, Evo Strike), ainsi que les trois anomalies de marque du §4. `tsc` et `eslint` propres.

**Non mesuré** : la part des titres raquettes / cordages reconnue par au moins un alias. Ce taux sera mesuré en R4, quand le moteur lira le fichier (sur la base et sur le jeu R1).

## 3. Hors référentiel v1

- **Chaussures, textile, accessoires** : aucune famille pour l'instant (voir Q10).
- **Raquettes de marques sans famille** : Senston (2 offres), Amazon Basics (1), JOOLA (1). Proposition : les laisser hors référentiel ; leurs offres restent « nouveau modèle » (voir Q11).

## 4. Anomalies de données relevées (à corriger à l'ingestion, R3)

Ce ne sont pas des questions de tennis, mais elles faussent la reconnaissance de la marque :
- **Marque « SPORTSYSTEM »** sur une raquette SportSystem : « SPORTSYSTEM Babolat Evo Aero Lite Gén2 » (la vraie marque est dans le titre). Les 3 offres textile « SPORTSYSTEM » (produits officiels JO Paris 2024) sont, elles, correctes.
- **« HEAD » et « Head »** : deux écritures de la même marque (34 raquettes et 14 cordages en « HEAD »). Normaliser la casse avant la comparaison.
- **Luxilon enregistré sous Wilson** (Amazon, propriétaire de la marque) : « Wilson Cordages pour Raquette Luxilon, Alu Power 125… ». Paires R1 66 et 67.
- **Lacoste L23** enregistrée sous Tecnifibre chez un marchand (fabricant) et sous Lacoste chez l'autre.

## 5. Questions pour Mathieu

Numérotation à la suite de Q1-Q6 (`config/matching-rules.ts`).

**Q7 — Éditions : coloris sans effet, ou produit à part ?**
Proposé : une édition ou un coloris nommé (Pink, White, Noir, Neon, Wimbledon, Spectra Edition, Palm Tree Crew, Black chez Luxilon…) est une **variante** (même modèle), sauf si la fiche montre des spécifications différentes. Cas limites à trancher :
- Pure Aero « Rafa » / « Rafa Origin » : classés en **versions** (spécifications propres) ;
- T-Fight « 300 IG » (Iga Swiatek) : version ou édition ?
- Prince Beast 100 « 265 LTD » : même raquette que Beast 100 265 ?
- Evo Drive « Femme » (270 g) : version ou simple coloris ?
- Black Code « Fire » / « Lime » : coloris (proposé).

**Q8 — Regroupements provisoires : une famille par ligne ?**
Cinq entrées rassemblent des petites lignes vues une fois chacune : Babolat Boost (Aero / Drive / Strike en versions), junior Babolat (Carlitos, B Fly, Ballfighter, Wimbledon), junior Head (Novak, Coco, Paw, Extreme / Radical / Boom Junior), loisir Head (Ti, MX Spark, IG Challenge), loisir Wilson (Pro Open, Hyper, Six.One, Fusion, Intrigue, Tour Slam, Impact).
Proposé : **une famille par ligne**, car un regroupement ferait se reconnaître entre elles des raquettes différentes. Le regroupement actuel est seulement une commodité de lecture.

**Q9 — Correspondances à confirmer une par une**
- Lacoste « L23 L » = Tecnifibre « L23 Light » (même raquette) ?
- Babolat « Synthetic Gut Force » : cordage différent du Synthetic Gut (proposé) ?
- Wilson « Element » : cordage Luxilon (proposé : famille Luxilon) ?
- Gosen « Eggpower (sidewinder) » et « Sidewinder » : même cordage ?
- Wilson « RF 01 Future » : version junior de RF 01 ?
- Head « Hawk Tour Rpet » : même cordage que Hawk Tour, ou version à part ?

**Q10 — Périmètre de R2 : chaussures, textile, accessoires**
Le référentiel v1 couvre raquettes et cordages (587 offres). Il reste 898 offres chaussures, 2 725 textile et 429 accessoires. Proposition, à valider :
- **chaussures** : référentiel de familles dans une passe R2 suivante (même méthode). C'est la catégorie où R0 a trouvé des GTIN (Tennis Point FR, Sport 2000), donc là où la cascade §8 gagnera le plus vite ;
- **textile** : pas de référentiel exhaustif ; la règle textile (D-2026-09-27-06) s'applique au nom de modèle lu dans le titre ;
- **accessoires** : traiter les sous-catégories (GAP-2026-09-25-11, rattaché à R2) dans la même passe que les chaussures.

**Q11 — Marques sans famille** (Senston, Amazon Basics, JOOLA) : les laisser hors référentiel (proposé), ou créer une famille par modèle vu ?

## 6. Suite

- Validation de Mathieu sur Q1-Q11 (règles et référentiel), puis report des réponses dans `config/model-families.ts` et `config/matching-rules.ts`.
- Les alias proposés par la file de revue seront ajoutés **en lot** après validation (D-2026-09-28-01) ; jamais d'écriture dans le référentiel depuis l'application.
- Révision à chaque saison (§7 du cadrage) : nouvelles générations, nouvelles lignes.
- **Arrêt** (§10, R2).
