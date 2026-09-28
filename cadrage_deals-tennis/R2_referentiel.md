# R2 — Référentiel de familles de modèles v1 (2026-09-28)

> Livrable R2 (§7 et §10 de `CADRAGE_rapprochement-multi-niveaux.md`), avec `config/matching-rules.ts` (règles de tolérance, questions Q1-Q6).
> Fichier : `config/model-families.ts`. **Validé par Mathieu** (D-2026-09-28-02, 2026-09-28). Aucun code ne le lit encore : il sera consommé par le moteur en R4.
> Aucune modification de code applicatif ni de base. Lecture seule sur la base Neon de prod.
> **Réponses de Mathieu à Q1-Q12 : D-2026-09-28-02 (2026-09-28).** Le report dans `config/matching-rules.ts` et `config/model-families.ts` est fait (session Sonnet du 2026-09-28) ; §5 ci-dessous garde le rappel des réponses et les 5 vérifications, désormais tranchées.

## 1. Ce que contient le fichier

| | Raquettes | Cordages | Total |
|---|---|---|---|
| Familles | 76 | 43 | 119 |
| dont statut `observe` | 76 | 43 | 119 |
| dont statut `a_confirmer` | 0 | 0 | 0 |
| dont lignes junior (`junior: true`) | 16 | 0 | 16 |

Les 10 familles `a_confirmer` de la v1 proposée sont toutes passées à `observe` le 2026-09-28 : 5 par réponse explicite de Mathieu (Q7/Q8, régroupements éclatés en familles par ligne) et 5 par vérification réelle sur les fiches marchand (Q9, voir §5). Le nombre de familles raquettes passe de 58 à 76 par l'éclatement de 5 regroupements provisoires (Boost, junior Babolat, loisir Head, junior Head, loisir Wilson) en une famille par ligne (Q8).

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

- **Chaussures, textile, accessoires** : aucune famille pour l'instant. **Q10 (D-2026-09-28-02)** : chaussures et sous-catégories d'accessoires (GAP-2026-09-25-11) traitées dans une passe R2 suivante, avant R3 ; pas de référentiel pour le textile (règle textile D-2026-09-27-06 appliquée au nom de modèle lu dans le titre).
- **Raquettes de marques sans famille** : Senston (2 offres), Amazon Basics (1), JOOLA (1). **Q11 (D-2026-09-28-02)** : laissées hors référentiel, leurs offres restent « nouveau modèle ». **JOOLA = raquette de tennis de table**, hors sujet : à filtrer à l'ingestion (R3), voir §4.

## 4. Anomalies de données relevées (à corriger à l'ingestion, R3)

Ce ne sont pas des questions de tennis, mais elles faussent la reconnaissance de la marque :
- **Marque « SPORTSYSTEM »** sur une raquette SportSystem : « SPORTSYSTEM Babolat Evo Aero Lite Gén2 » (la vraie marque est dans le titre). Les 3 offres textile « SPORTSYSTEM » (produits officiels JO Paris 2024) sont, elles, correctes.
- **« HEAD » et « Head »** : deux écritures de la même marque (34 raquettes et 14 cordages en « HEAD »). Normaliser la casse avant la comparaison.
- **Luxilon enregistré sous Wilson** (Amazon, propriétaire de la marque) : « Wilson Cordages pour Raquette Luxilon, Alu Power 125… ». Paires R1 66 et 67.
- **Lacoste L23** enregistrée sous Tecnifibre chez un marchand (fabricant) et sous Lacoste chez l'autre.

## 5. Réponses de Mathieu (D-2026-09-28-02, 2026-09-28)

Numérotation à la suite de Q1-Q6 (`config/matching-rules.ts`). Détail complet des réponses : `DECISIONS_FONCTIONNELLES.md`, D-2026-09-28-02. Report dans `config/model-families.ts`/`config/matching-rules.ts` fait le même jour (session Sonnet).

- **Q7 (éditions)** : une édition ou un coloris nommé sans caractéristique différente sur la fiche = variante. Pure Aero « Rafa » = édition, « Rafa Origin » = version (spécifications propres) ; T-Fight « 300 IG » = édition ; Evo Drive « Femme » = coloris (poids comparé par Q1) ; Black Code « Fire »/« Lime » = coloris.
- **Q8 (regroupements)** : une famille par ligne — les 5 regroupements provisoires (Boost, junior Babolat, junior Head, loisir Head, loisir Wilson) sont éclatés en 18 familles à part.
- **Q9 (correspondances)** : Head « Hawk Tour Rpet » = version à part. Les 5 autres cas ont été **vérifiés réellement sur les fiches marchand le 2026-09-28** (recherche web, la politique réseau de la session Sonnet le permettait, contrairement à la session cloud qui avait posé les questions) :
  1. **Lacoste « L23 L » = Tecnifibre « L23 Light »** : même référence fabricant (18LACL23L), même poids (275 g), même tamis (100 sq in), même plan de cordage (16x19) — confirmé même raquette (sportsystem.fr, tecnifibre.com, tenniswarehouse-europe.com).
  2. **Babolat « Synthetic Gut Force » ≠ « Synthetic Gut »** : fiches produit différentes (âme unique + 2 filaments enveloppants contre boyau synthétique multifilament longévité) — confirmé produit différent (tennispro.fr).
  3. **Wilson « Element » = cordage Luxilon Element** : vendu sous la marque Wilson (propriétaire de Luxilon) — confirmé (wilson.com, liste l'Element dans sa gamme Luxilon).
  4. **Gosen « Eggpower » = « Sidewinder »** : même cordage, « Eggpower » est le nom d'origine japonais de « Sidewinder » — confirmé même produit, pas deux (gosen.com.au, tennis-warehouse.com). Une seule famille, pas deux.
  5. **Wilson « RF 01 Future » = version plus légère de RF 01, taille adulte standard** (27 in, 98 sq in) — pas une raquette junior au sens taille réduite, reste une version (pas de `junior: true`).
- **Q10 (périmètre)** : chaussures et sous-catégories d'accessoires (GAP-2026-09-25-11) passent en R2 suivante, avant R3. Pas de référentiel pour le textile (règle D-2026-09-27-06 sur le titre).
- **Q11 (marques sans famille)** : Senston, Amazon Basics, JOOLA laissés hors référentiel. JOOLA = raquette de tennis de table, à filtrer à l'ingestion (R3).
- **Q12 (ajoutée en revue)** : lot de N articles identiques = produit différent (prix à l'unité affiché) ; article + cadeau offert = même modèle (cadeau indiqué sur l'offre). Reporté dans `COMMON_ATTRIBUTES` de `matching-rules.ts`.

## 6. Suite

- ~~Validation de Mathieu sur Q1-Q11~~ **fait** (D-2026-09-28-02, 2026-09-28), report dans `config/model-families.ts` et `config/matching-rules.ts` **fait** le même jour.
- Les alias proposés par la file de revue seront ajoutés **en lot** après validation (D-2026-09-28-01) ; jamais d'écriture dans le référentiel depuis l'application.
- Révision à chaque saison (§7 du cadrage) : nouvelles générations, nouvelles lignes.
- **R2 clos pour les raquettes et les cordages.** Reste, avant R3 : passe R2 chaussures + sous-catégories d'accessoires (Q10).
