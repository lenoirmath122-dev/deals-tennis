# R4.5 — Étape 4 : références de style, toutes catégories

Étape 4 de l'ordre de D-2026-09-29-07 / D-2026-09-30-03 (point 1 de la solution révisée, §5.4 de `R4_5_mesure_separation.md`). Session Opus du 2026-09-30. Décision : D-2026-09-30-05.

## 1. Méthode

- Lecture seule en prod : les 5 035 offres `active` et `tracked` (colonnes `gtin`, `mpn`, `merchant_sku`, `raw_attributes`), comme le passage `253341ec…`.
- Simulation **en mémoire** avec le vrai moteur (`extractOfferAttributes`, `buildModels`) : la base reproduit exactement le passage en prod (3 375 modèles). La variante ajoute les références de style hors textile, sans autre changement. Rien n'a été écrit en base ni dans le code ; les scripts de simulation ont été supprimés.
- Chaque fusion nouvelle (groupe de modèles de base réunis par la variante) a été relue : titres, prix d'origine, références et attributs.

## 2. Forme des références, par source

| Source | Forme | Partie « style » | Suffixe |
|---|---|---|---|
| Site Babolat, `merchant_sku` | 6 chiffres (raquettes, cordages, sacs), `31F26556A` (chaussures) | la référence entière | aucun |
| Site Head, `merchant_sku` | 6 chiffres ; 1 ou 2 chiffres sur certaines fiches (inutilisables, déjà écartés par `normalizeReference`) | la référence entière | aucun |
| Sport 2000, `merchant_sku` | `FD6574-110`, `1042A282-400`, `32F23478-1005` | avant le tiret | coloris |
| SportSystem, `reference` des variantes | `275244-BNBK`, `243141-101`, `3A0S25A555-4131` | avant le tiret | coloris |
| Tennispro.fr, `mpn` | `281103-WH`, `243110-128`, `751233-136`, `601344/601648` | avant le tiret ou la barre | coloris ; deux références concaténées par « / » |
| Tennispro.fr, `mpn`, balles Dunlop | `601607-18` | — | **conditionnement** (carton de 18 tubes) |
| Tecnifibre (site et revendeurs) | `14TFX27541` (site) / `14TFX1704` (SportSystem) pour la même TF-X1 V2 270 | pas de découpe stable | poids, version et manche mêlés |

Cordages : le suffixe est le coloris (`243108-105` noir, `243117-101` blanc, `281103-WH`). La **jauge n'est pas dans la référence** : SportSystem donne `243110` pour l'Xcel 200 m en 1,25 et en 1,35 ; la jauge se choisit sur la fiche.

Babolat, raquettes : `101xxx` = non cordée, `102xxx` = cordée (variante, déjà réunies par la signature aujourd'hui).

## 3. Effet mesuré (simulation)

| Modèles multi-marchands | Aujourd'hui | Avec l'étape 4 |
|---|---|---|
| Raquettes | 35 | 67 |
| Cordages | 3 | 15 |
| Accessoires (sacs) | 5 | 19 |
| Chaussures | 60 | 61 |
| Textile | 67 | 67 |
| **Total** | **170** | **229** |

- 3 375 → 3 271 modèles ; **94 fusions**, toutes relues : **toutes réunissent le même produit** (même référence de style, mêmes prix d'origine à quelques euros près). Écarts rencontrés, tous des variantes déjà actées : cordée / non cordée, coloris, édition (Q7 : « White », « Carbon Grey », « Palm Tree », « Neon »), âge mal lu d'un côté (« Pat Patrouille » lu adulte chez Tennispro.fr).
- **Faux regroupement corrigé au passage** : en prod, « Pure Drive + Gen11 » (site Babolat) est réuni avec « Pure Drive Gen11 » par l'étape 2 bis (C-Q3) : le « + » n'est pas lu comme version et la longueur 27,5 n'est connue que d'un côté. Avec les références, il rejoint son groupe `101553` (SportSystem, Tennispro.fr). Le défaut de lecture du « + » reste à corriger (étape 5).
- **4 nouveaux conflits, tous bloqués** (aucune fusion) : 2 balles Dunlop (`601607-18` carton / `601607` tube, `bipack` / carton de 9 bipacks), 2 raquettes junior Head (« Boom Jr.25 », « Radical 25 » : famille junior lue d'un seul côté, défaut « Jr.25 collé » déjà listé pour l'étape 5).

## 4. Textile

- **Lacoste « comme Nike »** (D-2026-09-30-04, 1d) : en prod, un seul modèle textile réunit deux références Lacoste (`TH2508` / `TH2808`, « coton Crocodile Ultra Dry » bleu et noir) ; il sera séparé, ce qui est conforme aux 5 paires « Ultra-Dry » de la relecture.
- **Head et Babolat ne sont pas « comme Nike »** : sur leur propre site, un même article porte plusieurs références. Babolat : « Play Crew Neck Tee Homme » en `3MP2011`, `3MTF011` et `3MTG011` (même constat pour Play Short, Tank Top, Skirt, Exercise Hood) ; Head : casquettes « Performance » `287104` / `287166`, « Five Panel Tour » `287136` / `287834` / `287176` (un numéro par coloris). Les séparer serait faux.
- **Tecnifibre** : la référence textile est style (6 caractères, genre compris : `22WTET` femme, `22TETE` homme) + coloris (2 ou 3 lettres) + taille (`31` adulte, `3A` junior). Une coupe à 6 caractères, simulée, ne rapporte qu'un modèle multi-marchands (67 → 68 : `21TEPA`, `22GRAT`, `25POPI`) et ajoute 48 conflits junior / adulte (bloqués). Non retenue pour l'étape 4 ; les 3 paires identiques de la relecture (lignes 13, 106, 125) restent à l'étape 7.

## 5. Décisions (D-2026-09-30-05)

| Question | Réponse de Mathieu |
|---|---|
| Hors textile : SKU des sites Babolat et Head et de Sport 2000 comme référence fabricant, comparaison de la partie « style » | Oui, avec deux exceptions : **balles** (référence complète, le suffixe est le conditionnement) et **Tecnifibre** hors textile (non ajoutée, le GTIN suffit) |
| Cordages : jauges différentes réunies par une référence commune | Oui : **jauge = variante quand la référence est commune** (comme une taille) ; sans référence commune, la jauge reste « proche » (D-2026-09-27-05) |
| Textile, autres marques | Ni Head ni Babolat « comme Nike » ; Tecnifibre à 6 caractères non retenue (étape 7) |
| GTIN des fiches textile de Tennis Point FR | Reporté à l'étape 7 (1 GTIN commun sur 50 paires comparables, 1 749 fiches à lire à chaque collecte) |

## 6. À reporter en code (session Sonnet)

1. `lib/matching/shared.ts`, `manufacturerReferences` (catégories hors textile) :
   - ajouter le `merchant_sku` des marchands **Babolat, Head, Sport 2000** (liste nommée dans `config/`, à côté de `TEXTILE_SKU_IS_REFERENCE_MERCHANTS`) ;
   - découper chaque référence sur « / » (plusieurs références), puis garder la partie avant le premier tiret ;
   - **sauf** balles (`accessoires` / `balles`) : référence complète ;
   - **sauf** marque Tecnifibre hors textile : pas de SKU du site Tecnifibre ; ses références SportSystem restent lues en entier, comme aujourd'hui.
   - Le textile ne change pas (`styleReferences` de `lib/matching/textile.ts`).
2. `config/textile-lexicon.ts` : `TEXTILE_STYLE_DISTINCT_BRANDS = ["nike", "lacoste"]` (D-2026-09-30-04, 1d), commentaire mis à jour.
3. Jauge : aucun changement de code (le rôle « proche » ne bloque déjà pas une référence commune) ; commentaire dans `config/matching-rules.ts` renvoyant à D-2026-09-30-05.
4. Tests versionnés, paires tirées de §3 :
   - identiques : Head site `231015` / SportSystem `231015` (Radical MP) ; Babolat site `243101` / Tennispro.fr `243101` (RPM Blast 200 m) ; Tennispro.fr `281103-WH` / site Head `281103` (Hawk 12 m) ; Sport 2000 `FD6575-...` / autre coloris `FD6575-...` (Court Lite 4) ; Tennispro.fr `751233-136` / Babolat `751233` (RH12 Pure Drive) ;
   - non fusionnées : balles `601607-18` / `601607` (conflit de conditionnement) ; Babolat `101553` (Pure Drive +) / `101552` (Pure Drive) ;
   - Lacoste `TH2508` / `TH2808` → « proche ».
5. Passage à blanc en prod (`--dry-run`), comparaison au §3 (229 modèles multi-marchands attendus, à quelques unités près avec Lacoste), relecture des modèles multi-marchands nouveaux, puis PR ; écriture en prod après accord de Mathieu.

## 7. Pour l'étape 5 (corrections d'extraction)

- « Pure Drive + » : le « + » n'est pas lu comme version (faux regroupement en prod par l'étape 2 bis).
- « Jr.25 » collé (Head Boom Jr.25, Radical 25 junior) : déjà listé (§5.3 de `R4_5_mesure_separation.md`).
- « Pat Patrouille » (Tennispro.fr) lu adulte.
