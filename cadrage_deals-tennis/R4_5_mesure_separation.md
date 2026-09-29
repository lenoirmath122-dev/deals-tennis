# Mesure — offres séparées faute d'information (hors textile)

**Date** : 2026-09-29 (session Opus). **Demande de Mathieu** : vérifier qu'on ne sépare pas trop les offres, au risque que les regroupements perdent leur intérêt.

## 1. Méthode

- Données : passage en prod `r4.4-etapes-1-2` (R4.4-bis, 103 modèles multi-marchands), tables `match_offer_attributes` et `match_offer_links`, lues en lecture seule par le connecteur Neon.
- Paires retenues : deux offres de **marchands différents**, **même famille**, **mêmes attributs extraits**, à l'exception de la génération, de l'année, de l'édition et de l'état cordé. La génération est **absente d'au moins un côté**, et les deux offres sont dans des modèles différents. Ce sont les paires que le moteur sépare « faute de savoir ».
- Volume : **539 paires** (raquettes 68, chaussures 226, cordages 82, accessoires 163), dont 406 sans génération des deux côtés.
- Échantillon : **34 paires, une par famille** (tirage déterministe par `md5`), 9 au plus par catégorie.
- Jugement fondé sur la référence fabricant (SKU, `mpn`), le titre et le prix d'origine. Les fiches marchands n'ont pas été ouvertes : les cas incertains sont marqués comme tels.

## 2. Résultat par paire

| # | Cat. | Offre A | Offre B | Verdict | Indice |
|---|---|---|---|---|---|
| 1 | acc. | Babolat : Sac Court L (751235) | Tennispro : Evo Court L (mpn 751235-105) | **même** | même référence |
| 2 | acc. | Babolat : RH9 Pure Wimbledon (751240) | SportSystem : RH9 Pure Drive Spectra (751260) | différent | édition |
| 3 | acc. | Head : Base **L** (261405) | Tennispro : Racquet Base **M** | différent | taille non extraite |
| 4 | acc. | Head : Pro X sac à dos 30L | Tennispro : Gravity Pro X 30l | même (probable) | même prix, coloris |
| 5 | acc. | Head : Tour sac à dos 25L Neon | Tennispro : Tour 25l | même (probable) | coloris |
| 6 | acc. | SportSystem : Tour Endurance **2025** (40TOUW**25**BP) | Tecnifibre : Tour Endurance (40TOUW**BL**BA) | différent | référence : millésime |
| 7 | acc. | Tennis Point : **Blade** Super Tour | Tennispro : Super Tour **RG Night Session 2026** | différent | édition |
| 8 | chau. | Babolat : Jet Tere **2** AC W (31**F26**651A) | Sport 2000 : Jet Tere AC W (31**S23**651) | différent | référence : saison 23 / 26 |
| 9 | chau. | Babolat : Propulse Jr AC Boy (32JS**26**478A) | Sport 2000 : Propulse AC Jr Boy (32S**23**478) | incertain | saison 23 / 26 |
| 10 | chau. | Babolat : SFX Evo AC M (30F**26**555A) | SportSystem : SFX Evo **2025** AC (3A0S**25**A555) | même (probable) | même modèle, saisons de coloris |
| 11 | chau. | Head : Endure Pro Boa (273006) | SportSystem : Endure Pro Boa (273026) | incertain | références voisines |
| 12 | chau. | SportSystem : AG-LT Ultra Clay F | Tennis Point : AG-LT Ultra terre battue F | **même** | une seule génération |
| 13 | chau. | SportSystem : Mirage 100 **2** | Tennis Point : Mirage 100 | différent (probable) | génération II écrite d'un côté |
| 14 | chau. | SportSystem : Intrigue Pro Clay F | Tennis Point : Intrigue Pro TB F | **même** | une seule génération |
| 15 | chau. | Tennis Point : Avaluxe F | Tennispro : Avaluxe F (KI1348) | **même** | une seule génération |
| 16 | chau. | SportSystem : Courtflash Kid (JH5123) | Tennispro : Courtflash Jr (JR4450) | **même** | code adidas = coloris |
| 17 | cord. | Babolat : AddiXion+ 200M | Tennispro : Addixion+ 200 m | **même** | |
| 18 | cord. | Babolat : RPM Soft 12M (241146) | Tennispro : RPM Soft 12 m (mpn 241146-107) | **même** | même référence |
| 19 | cord. | Babolat : Xalt 200M | Tennispro : Xalt 200 m | **même** | |
| 20 | cord. | Babolat : Xplore 200M (243153) | Tennispro : Xplore 200 m (mpn 2431533027) | **même** | même référence |
| 21 | cord. | Head : Hawk 200 m | Tennispro : Hawk 200 m | **même** | |
| 22 | cord. | Amazon : Lynx Tour | Head : Lynx Tour | **même** | |
| 23 | cord. | Amazon : Reflex MLT | Head : Reflex MLT | **même** | |
| 24 | cord. | Amazon : Rip Control **160 €** | Head : Rip Control **16 €** | différent | bobine / garniture (prix ×10) |
| 25 | cord. | Head : Sonic Pro 200 m | Tennispro : Sonic Pro 200 m | **même** | |
| 26 | raq. | Babolat : Ballfighter 19 (140479) | Tennispro : Jr Ballfighter 19 (mpn 140479) | **même** | même référence |
| 27 | raq. | Babolat : **Pure** Drive Jr 25 Gen11 (140532) | Tennispro : Drive Jr 25 (140515) | différent | autre modèle, 120 € / 70 € |
| 28 | raq. | Babolat : Pure Strike 97 Gen4 | Tennis Point : Pure Strike 97 | même (probable) | même prix, génération en cours |
| 29 | raq. | Head : Boom MP L **Alternate** | Tennis Point : Boom MP L **Neon 2025** | différent | édition, 230 € / 260 € |
| 30 | raq. | Head : Coco 21 (235824) | Tennispro : Jr Coco 21 (mpn 235824) | **même** | même référence |
| 31 | raq. | Head : Extreme MP **UL** | Tennis Point : Extreme MP 2024 | différent | UL non extrait |
| 32 | raq. | Head : Gravity MP **Zverev** | Tennis Point : Gravity MP 2023 | différent | édition joueur |
| 33 | raq. | Head : Speed Jr **25** | Tennispro : IG Speed **21** | différent | taille non extraite |
| 34 | raq. | Tecnifibre : TF-X1 **V2** 300 | Tennis Point : TF-X1 300 | différent (probable) | GTIN différents, V1 probable |

## 3. Synthèse

| Catégorie | Même produit | Différent | Incertain |
|---|---|---|---|
| Cordages (9) | 8 | 1 | 0 |
| Chaussures (9) | 5 (dont 1 probable) | 2 (dont 1 probable) | 2 |
| Accessoires (7) | 3 (dont 2 probables) | 4 | 0 |
| Raquettes (9) | 3 (dont 1 probable) | 6 | 0 |
| **Total (34)** | **19 (56 %)** | **13 (38 %)** | **2** |

**Conclusion : assouplir la règle de façon générale (« information non écrite → identique ») donnerait environ 56 % de précision, loin des 95 % visés.** On ne peut pas l'appliquer tel quel. En revanche, les causes se regroupent nettement :

- **Même référence fabricant, non reconnue** (#1, 18, 20, 26, 30) : les SKU Babolat et Head et les `mpn` Tennispro (`751235-105`, `2431533027`) ne sont pas lus comme références hors textile. Les réunir ne présente aucun risque.
- **Cordages sans jauge des deux côtés** (8 sur 9 identiques) : la jauge est souvent un choix proposé au client, pas une différence de produit. La seule erreur (#24) se voit au prix (×10).
- **Modèles à une seule génération** (#12, 14, 15, 16, et 10 par ses coloris saisonniers) : c'est l'objet de la liste `generationUnique` (R4.5-c).
- **Vraies différences non extraites** (taille de sac L/M, junior 21/25, UL, éditions Wimbledon/Zverev/Alternate/RG) : elles justifient de garder la règle stricte, en particulier pour les raquettes et les sacs.
- **Référence qui révèle la génération** (#6 Tecnifibre `25`, #8 Babolat `S23`/`F26`) : même logique que la règle Nike D-2026-09-29-05.

## 4. Leviers proposés (à trancher par Mathieu)

- **L1 — Références hors textile** : lire comme références fabricant les SKU Babolat et Head, et le `mpn` Tennispro (partie avant le tiret, ou les 6 premiers chiffres pour Babolat). Risque nul, 5 des 34 paires gagnées.
- **L2 — Cordages** : jauge non écrite **des deux côtés** → identique, sauf écart de prix d'origine supérieur à ×2 (garde-fou bobine / garniture). 8 des 9 paires gagnées, 0 erreur sur l'échantillon.
- **L3 — `generationUnique` (R4.5-c)** : commencer par les chaussures (AG-LT Ultra, Intrigue Pro, Avaluxe, Courtflash, SFX Evo…). 4 à 5 des 9 paires de chaussures gagnées.
- **Maintenu strict** : raquettes et sacs, où l'échantillon compte 10 erreurs sur 16 si on assouplit.

Le gain réel sur les 539 paires (et en modèles multi-marchands) reste à mesurer par un passage à blanc une fois les leviers retenus codés.
