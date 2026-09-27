# Repérage de nouveaux marchands — vérification réelle (2026-09-27)

Contexte : D-2026-09-26-02, GAP-2026-09-26-03. Le rapport cowork
(`REPERAGE_marchands_resultat-cowork.md`, conservé tel quel, et son tableau
`REPERAGE_marchands_resultat-cowork.csv`) laissait « non vérifié » les trois
critères les plus utiles (GTIN/mpn, robots.txt, anti-bot) faute de
navigateur. Vérification faite ici en **lecture seule** sur le top 5 retenu
par Mathieu : Extreme Tennis, Tennis Achat, Intersport, Sports Raquettes,
Tennis Compagnie. Aucun compte créé, aucun contact, aucun code produit.

Méthode : `curl` simple (User-Agent navigateur) pour robots.txt, fiches
produit (1 raquette + 1 chaussure par marchand) et pages promo ; Playwright
non headless uniquement pour Intersport (blocage de `curl`), sans aucun
contournement. `Crawl-delay: 60` de Tennis Achat respecté (requêtes espacées
de 61 s). Plusieurs fiches citées par cowork ne sont plus actives
(redirection vers une catégorie ou 404) : remplacées par des fiches actives
prises sur les pages promo.

Le résultat par marchand est aussi reporté dans la colonne
`verif_claude_code` du CSV ; la colonne `decision_mathieu` est à remplir.

## 1. Résultats

| Marchand | robots.txt | Anti-bot | Identifiant produit | Prix barré |
|---|---|---|---|---|
| Extreme Tennis | fiches et catégories autorisées ; **pagination `?page=`/`&page=` interdite** ; sitemaps autorisés | aucun (200) | **mpn** (réf. fabricant) dans le JSON-LD, pas de GTIN | « Prix public » = PPC ou prix d'origine (mention explicite du site) |
| Tennis Achat | `Crawl-delay: 60` ; pages produit/outlet autorisées | aucun (200) | **mpn** dans le dataLayer (pas de JSON-LD) | « Prix public conseillé par le fournisseur en 2025 » |
| Intersport | illisible (captcha) | **DataDome**, captcha même en vrai navigateur | non vérifiable | non vérifiable |
| Sports Raquettes | n'interdit que les paramètres de commande/tri | aucun (200) | **GTIN13 + mpn** dans le JSON-LD (syntaxe non stricte, parseur tolérant nécessaire) | `regular-price` PrestaShop, nature non établie |
| Tennis Compagnie | absent (404) | aucun (200) | **GTIN13 par variante** (taille/pointure) dans un JSON-LD valide | `regular-price` PrestaShop, nature non établie |

Preuves (valeurs relevées le 2026-09-27) :
- Extreme Tennis : [Head Speed MP 2026](https://www.extreme-tennis.fr/fr/head-speed/22656-raquette-head-speed-mp-2026-300g.html) `mpn` 232026 (réf. Head déjà rencontrée en R1) ; [Dunlop CX 200 2024](https://www.extreme-tennis.fr/fr/dunlop-cx/18768-raquette-dunlop-cx-200-2024-305g.html) `mpn` 10349668, « Prix public : 259,99 € » ; [Asics Gel-Resolution X blanc/vert](https://www.extreme-tennis.fr/fr/chaussures-de-tennis-homme/23838-chaussures-asics-gel-resolution-x-blanc-vert.html) `mpn` 1041A481-104 (style + coloris).
- Tennis Achat : [Head Speed MP](https://www.tennisachat.com/raquette-head-speed-mp-300-gr-692271.html) `mpn` 236014 (« REFERENCE 236014 » affiché), 149,00 € au lieu de 280,00 € « Prix public conseillé* ».
- Sports Raquettes : [Head Extreme MP Hy-Bor](https://www.sportsraquettes.fr/raquettes-tennis-head/18951-raquette-tennis-head-extreme-mp-hy-bor.html) `gtin13` 0198772203283 / `mpn` 233316-U ; [Asics Solution Speed FF 4](https://www.sportsraquettes.fr/chaussures-tennis-asics/17855-chaussures-tennis-asics-solution-speed-ff-4-homme-300.html) 4571633405723 / 1041A532-300 ; [Gel-Resolution X blanc/noir](https://www.sportsraquettes.fr/chaussures-tennis-asics/16248-chaussures-tennis-asics-gel-resolution-x-homme-blanc-noir.html) 4570158165839 / 1041A481-100.
- Tennis Compagnie : [Head Speed MP 2022](https://tennis-compagnie.fr/24485183-raquette-head-speed-mp-2022.html) T2 0724794367483, T3 0724794367490 ; [Gel-Resolution X blanc](https://tennis-compagnie.fr/24487706-chaussure-asics-gel-resolution-x-toutes-surfaces-blanc.html), 12 pointures, dont la pointure 46 = **4570158165839**, le même GTIN que chez Sports Raquettes : rapprochement inter-marchands exact prouvé sur une paire réelle.

## 2. Découvertes qui changent la lecture du rapport cowork

1. **tennisdeals.be appartient à Extreme Tennis.** Le robots.txt d'Extreme Tennis déclare les sitemaps de `www.tennisdeals.be` ; les [mentions légales de tennisdeals.be](https://www.tennisdeals.be/fr/content/2-mentions-legales) désignent « SARL EXTREME TENNIS », RCS Douai 525076105. Le site « tennisdeals » de GAP-2026-09-25-10 est donc un revendeur tennis (titre : « Tennisdeals : Game. Set. Deals. Le matériel de tennis au meilleur prix ! ») exploité par le candidat n°1. L'option 3 de ce gap (« garder le nom si ce n'est pas un vrai concurrent ») ne tient plus, et solliciter Extreme Tennis sous le nom « Tennisdeals » n'est pas envisageable.
2. **Tennis Achat n'est pas un marchand indépendant.** Ses [mentions légales](https://www.tennisachat.com/mentions-legales) : « Tennisachat.com est un site édité par la société Tennispro », SAS, RCS Strasbourg 804 953 016 — même société que Tennispro.fr, déjà intégré (même `Crawl-delay: 60`, même `mpn` dans le dataLayer que celui relevé en R0 §1bis). Son apport à la couverture multi-marchands (GAP-2026-09-25-19) est à relativiser : ce sont probablement en grande partie les mêmes produits, du même vendeur.
3. **Intersport est inaccessible en collecte directe.** Captcha DataDome sur toutes les pages, robots.txt compris, même avec un vrai navigateur : même catégorie que Wilson (PerimeterX). La seule voie reste le flux d'affiliation Kwanko, donc une candidature, bloquée par GAP-2026-09-25-10.
4. **Le prix barré est un prix conseillé chez les deux plus gros volumes** (Extreme Tennis, Tennis Achat), le même motif que celui relevé pour Tennis Warehouse Europe. Sans incidence sur la collecte, mais le « -X % » affiché par ces marchands ne mesure pas une vraie baisse : cela renforce le besoin d'un prix de référence calculé par nous (historique `price_observations`, phase 4 du cadrage « vrais bons plans »).
5. **Extreme Tennis interdit la pagination des listings dans son robots.txt.** Une collecte respectueuse passerait par les sitemaps (autorisés) et les fiches produit, pas par les pages promo au-delà de la première. À cadrer en R3 si le marchand est retenu.

## 3. Lecture d'ensemble (proposition, non actée)

- **Sports Raquettes** et **Tennis Compagnie** deviennent les candidats les plus intéressants pour le rapprochement : vrai GTIN13, aucun anti-bot, robots.txt permissif, PrestaShop en rendu serveur. Ils porteraient à 5 le nombre de marchands avec un GTIN fiable (avec Sport 2000, Tennis Point FR, Tecnifibre). Point d'attention : GTIN par taille, pas par modèle (même situation que Tennis Point FR), donc une table GTIN → modèle est nécessaire (R2).
- **Extreme Tennis** reste intéressant (8/8, gros volume, `mpn` fiable) mais cumule le conflit de nom, la pagination interdite et la clause générale anti-reproduction.
- **Tennis Achat** : doublon de Tennispro.fr sur le plan de l'opérateur.
- **Intersport** : écarté de la collecte directe, à garder comme piste « flux d'affiliation » après GAP-2026-09-25-10.

## 4. Décisions à prendre par Mathieu (tranchées, voir fin de section)

1. GAP-2026-09-25-10 : le nouvel élément (tennisdeals.be = Extreme Tennis) change-t-il le choix du nom ?
2. Tennis Achat : le traiter comme un marchand distinct de Tennispro.fr, ou l'écarter comme doublon d'opérateur ?
3. Clauses d'Extreme Tennis (« reproduction [...] de tout ou partie des éléments du site [...] est interdite ») et de Tennis Compagnie (« toute copie intégrale ou partielle d'une page du site est strictement interdite ») : même catégorie que les clauses de propriété intellectuelle déjà acceptées (SportSystem, Head, Sport 2000…) ou non ?
4. Périmètre retenu pour R3 (colonne `decision_mathieu`).

Rappels : construction reportée à R3 (D-2026-09-26-02) ; aucune candidature
d'affiliation tant que GAP-2026-09-25-10 n'est pas tranché.

**Tranchées le 2026-09-27** : voir D-2026-09-27-01 (nouveau nom à choisir) et
D-2026-09-27-02 (clauses acceptées ; périmètre R3 = Sports Raquettes, Tennis
Compagnie, Extreme Tennis, puis Tennis Achat en dernier ; Intersport par
affiliation uniquement).

## 5. Recouvrement Tennis Achat / Tennispro.fr (mesure du 2026-09-27)

Demandée par Mathieu avant de trancher le point 2 du §4. Lecture seule,
`Crawl-delay: 60` respecté sur chaque site.

**Catalogue** : `/sitemap.xml` des deux sites (non déclaré dans robots.txt,
mais public). Tennis Achat : 9 883 fiches produit ; Tennispro.fr : 10 656.
9 535 fiches Tennis Achat sur 9 883 (**96,5 %**) existent sur Tennispro.fr
sous le même identifiant Magento ou le même nom d'URL. Les 3,5 % restants
sont surtout des variantes d'écriture du même produit : 96,5 % est une borne
basse. Les identifiants sont souvent identiques ou décalés de 1 (ex.
`chaussures-babolat-femme-jet-mach-3-toutes-surfaces` 736579 / 736578).

**Prix** : 12 paires comparées fiche à fiche (dataLayer + « Prix public
conseillé »), même référence fabricant des deux côtés (suffixe couleur en
plus chez Tennis Achat).

| Produit | Tennis Achat | Tennispro.fr | Prix conseillé |
|---|---|---|---|
| Raquette Babolat Pure Aero Junior 26 2026 | 99 | 99 | 129,95 |
| Raquette Head Instinct PWR 110 | 139 | 139 | 190,00 |
| Raquette Wilson Pro Staff 97L Classic | **164** | 169 | 240,00 |
| Chaussures Mizuno Junior Break Shot 5 | 55 | 55 | 65,00 |
| Chaussures Babolat Femme Jet Mach 3 | 82 | 82 | 155,00 |
| Chaussures Babolat Junior Jet Mach 3 | 58 | 58 | 75,00 |
| Chaussures Yonex AD Accel pieds larges | 109 | 109 | 159,90 |
| Cordage Luxilon 4G Black 12 m | 18,95 | 18,95 | 26,00 |
| Polo Mouratoglou Match Paris | 23,95 | 23,95 | 40,00 |
| Short Joma Iconic | 23,67 | **22,97** | 26,30 |
| Sac à dos Babolat Junior | 33,70 | **29,88** | 44,95 |
| T-shirt New Balance Femme Practice | 30,00 | **28,97** | 45,00 |

Lecture : même catalogue, même prix conseillé (12/12), prix de vente
identique sur 8/12 ; sur les 4 autres, écart de 3 à 13 %, le plus souvent
en faveur de Tennispro.fr mais pas toujours. Échantillon indicatif (12
paires), pas une mesure statistique.
