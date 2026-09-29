# Points ouverts

## GAP-2026-09-29-02 — Détection junior restante : étape 4 (description des 6 autres marchands) et raquettes 17" (OUVERT, hors chemin critique)

Fusion de GAP-2026-09-25-15 (étape 4) et GAP-2026-09-25-17 (D-2026-09-29-08 point 3). Les étapes 1 à 3 (heuristique taille en pouces, description Tecnifibre / Tennis Point FR, backfill des raquettes de prod) sont faites et l'étape 5 est close ; textes d'origine dans `archive/GAPS_OUVERTS_retires_2026-09-29.md`.

**Reste** :
1. Lire la description de la fiche produit (requête HTTP supplémentaire par produit) pour les 6 autres marchands (SportSystem, Sport 2000, Babolat, Tennispro.fr, Head, Amazon), afin de repérer les raquettes juniors identifiées seulement par la description. Cette étape était « rattachée à R3 » mais n'a pas été faite : absente de `R3_cadrage.md`.
2. Étendre `RACQUET_JUNIOR_SIZE_PATTERN` (`lib/product-matching.ts`) aux raquettes 17" (exemple : Tecnifibre « T-fight Club 17 », encore `adulte`), puis relancer `npm run db:backfill-racquet-junior-size`.

**Bloquant sur** : rien. Hors chemin critique.

**Statut** : ouvert au 2026-09-29.

---

## GAP-2026-09-29-03 — Nouveaux marchands : Sports Raquettes, Tennis Compagnie, Extreme Tennis, Tennis Achat, Intersport (OUVERT, après R4.6)

Issu du repérage cowork (D-2026-09-26-02, vérifications dans `REPERAGE_marchands_verification.md`) et de D-2026-09-27-02, annoncé « périmètre R3 » mais absent de `R3_cadrage.md` : plus suivi nulle part avant ce gap (D-2026-09-29-08 point 2).

**Périmètre** : Sports Raquettes (GTIN13 + mpn), Tennis Compagnie (GTIN13 par variante), Extreme Tennis (mpn ; pagination `?page=` interdite par robots.txt), puis Tennis Achat en dernier (« même opérateur » que Tennispro.fr : 96,5 % des fiches communes, prix identiques sur 8 paires sur 12, cf. §5 de `REPERAGE_marchands_verification.md`). Intersport (DataDome) par affiliation Kwanko seulement.

**Ordre et méthode** : construction **après R4.6**, sur `lib/ingest.ts` (un script par marchand, comme R3).

**Bloquant sur** : R4.6 ; candidatures d'affiliation bloquées par le renommage (GAP-2026-09-25-10).

**Statut** : ouvert au 2026-09-29.

---

## GAP-2026-09-29-01 — Raquettes : aucun rapprochement entre le fabricant (Babolat, Head), Tennis Point FR et les revendeurs (OUVERT)

Constat du contrôle R4.4 (`R4_4_controle.md` §5, mesure en prod du
2026-09-29) : les 21 modèles de raquettes multi-marchands sont tous
SportSystem / Tennispro.fr par référence fabricant ; aucun par signature,
aucun par GTIN (0 GTIN de raquette partagé entre deux marchands). Deux
blocages :

- **A — génération non écrite** : Head 0 / 135 raquettes, Tennispro.fr
  6 / 125 ; règle R4-Q4 (raquettes : génération inconnue d'un côté →
  « proche »).
- **B — même génération des deux côtés, mais poids / tamis / plan de
  cordage connus d'un seul côté** (fiche SportSystem face à un titre
  Babolat) → « proche ». Exemple : Babolat « Pure Drive Gen11 » (269,95 €,
  `tracked`) et SportSystem « Pure Drive Gen 11 2025 » (215,96 €).
  Touche 29 paires Babolat / SportSystem, 12 Babolat / Tennispro.fr,
  4 SportSystem / Tennis Point FR, 1 Tennis Point FR / Tennispro.fr.

Enjeu : le prix public du fabricant (226 raquettes `tracked` Babolat et
Head) est la meilleure référence pour le verdict « vrai bon plan ».

Pistes (non décidées) : lever B quand famille + version + génération sont
écrites et égales (question C-Q3 de R4.4-bis) ; pour A, hypothèse « site du
fabricant = génération en cours » à vérifier, ou levier « valeur dominante »
(R4.5) ; vérifier les GTIN par déclinaison (Tennis Point FR, SportSystem).

**Moment de traitement** : question C-Q3 en début de R4.4-bis ; le reste
en R4.5 / R4.6.

## GAP-2026-09-25-19 — Produits multi-marchands distincts : 10 → 1 (OUVERT)

Point de départ chiffré du chantier de rapprochement produit multi-niveaux
(`cadrage_deals-tennis/CADRAGE_rapprochement-multi-niveaux.md`).

Nombre de produits présents chez **2 marchands distincts ou plus, avec des
offres actives** (`GROUP BY product_id HAVING COUNT(DISTINCT merchant_id) >= 2`,
distinct de la métrique « produits avec 2+ offres actives tous marchands
confondus » citée en GAP-2026-09-25-18, qui reste à 445 après retrait
ProTennis) : **10 avant le retrait de ProTennis → 1 après**. C'est cette
métrique-ci, pas les 445, qui mesure si la comparaison entre marchands —
l'un des deux différenciateurs du site — fonctionne réellement.

Cause : le rapprochement actuel repose sur une clé texte
`LOWER(brand)|LOWER(model)|category` dérivée du titre nettoyé, qui varie
trop d'un marchand à l'autre (ordre des mots, année, poids, mentions
commerciales) pour matcher entre marchands.

**Reste à faire** : chantier R0 à R5 décrit dans
`CADRAGE_rapprochement-multi-niveaux.md` (diagnostic, jeu de référence,
référentiel de modèles, capture à l'ingestion, moteur en mode fantôme,
bascule). Objectif : précision ≥ 95 % sur « même modèle », couverture
multi-marchands mesurée à chaque étape contre ce point de départ (1).

**R0 fait (2026-09-26)** : diagnostic complet, aucune modification —
voir `R0_diagnostic-rapprochement.md`. Résumé : un seul marchand (Sport
2000) expose un vrai GTIN/EAN sans requête supplémentaire ; aucun des 8
scripts ne capture aujourd'hui GTIN/mpn/SKU/quantité unitaire ; 24
exemples réels de rapprochements manqués trouvés en base, dont 4 pièges
(versions/tamis/taille junior/genre différents malgré une similarité
textuelle élevée) confirmant la nécessité de vérifier les attributs
structurés avant fusion (§3 R2/R3) ; proposition de migration additive
(`product_families`, colonnes d'attributs nullables sur `products`,
`mpn`/`unit_quantity`/`unit_type` sur `deals`, `product_merges`).

**Complément R0 fait (2026-09-26)** : vérification réelle du GTIN/EAN sur
la page produit (requête HTTP supplémentaire) pour les 7 marchands hors
Sport 2000 — voir §1bis de `R0_diagnostic-rapprochement.md`. Résultat :
Tennis Point FR et Tecnifibre exposent un vrai GTIN en JSON-LD sur la
fiche produit (non visible dans le flux Shopify déjà utilisé par les
scripts), portant à 3/8 marchands le nombre de sources GTIN fiables.
SportSystem/Babolat/Tennispro.fr confirmés sans GTIN. Head et Amazon non
testables sans Playwright (anti-bot dès la requête simple). Coût estimé
si limité aux raquettes/chaussures et aux 2 marchands avec gain réel :
~556 requêtes supplémentaires par run (majoritairement Tennis Point FR,
455 chaussures).

**R1 fait (2026-09-26)** : CSV de 24 paires candidates généré
(`R1_jeu-reference-candidat.csv`, reprise des exemples R0 §3, prix réels
vérifiés en base), avec la proposition Claude Code (11 identiques, 8
proches, 5 différents) et une colonne `decision_mathieu` vide. Mesure de
l'algorithme actuel sur ces 24 paires : 0/24 rapprochées (attendu par
construction, voir §5 de `R0_diagnostic-rapprochement.md`).

**R1 corrigé et complété (2026-09-26, session de correction)** : CSV
porté à 38 paires — corrections demandées par Mathieu (paire 10 → différent,
« L » = Lite chez Head ; note de la paire 20 reformulée), prix des paires
13/15/16 retrouvés en base (les titres du CSV initial avaient été
reconstruits depuis le modèle et ne correspondaient à aucune offre),
colonnes `niveau` (offre / variante / modèle), `piege`, `statut_prix`,
`algo_actuel`, `cle_algo_a`/`cle_algo_b` ajoutées. 8 paires témoins que
l'algorithme actuel rapproche (les 3 seuls produits inter-marchands en base
+ 5 fusions chez un même marchand) et 6 pièges supplémentaires. Mesure
réelle de `lib/product-matching.ts` : précision 5/8 (62,5 %), rappel 5/18
(27,8 %) sur « même modèle » ; faux positifs = générations différentes sous
un titre identique (Tennispro) et jauge indéterminable. Détail dans
`R1_mesure.md`.

**CSV R1 validé tel quel par Mathieu (2026-09-27, D-2026-09-27-03)** :
38 propositions acceptées, paire 7 reclassée « différent » (14 / 9 / 15),
mesure de référence inchangée (précision 5/8, rappel 5/14,
inter-marchands 2/11).

**Complément du jeu fait (2026-09-27, en attente de validation)** : 29
paires inter-marchands ajoutées (39-67, jeu = 67 paires), proposition 18
identiques / 5 proches / 6 différents après D-2026-09-27-05 (cordages :
jauge différente = proche) et D-2026-09-27-06 (textile : même modèle sans
génération différente écrite = identique). Jeu complet : précision 5/8,
rappel 5/32 (15,6 %), inter-marchands 2/29 (6,9 %). Détail :
`R1_mesure.md` §8.

**Complément validé (2026-09-27, D-2026-09-27-07)** : 67 paires validées
(32 identiques / 14 proches / 21 différents). Mesure de référence avant
R2 : précision 5/8, rappel 5/32, inter-marchands 2/29.

**R2 proposé (2026-09-28)** : principe de GAP-2026-09-27-02 tranché
(D-2026-09-28-01, référentiel en fichier versionné) ; règles de tolérance
`config/matching-rules.ts` (Q1-Q6) et référentiel de familles
`config/model-families.ts` (raquettes et cordages, Q7-Q11 dans
`R2_referentiel.md`).

**Réponses actées (2026-09-28, D-2026-09-28-02)** : Q1-Q12 tranchées
(paire R1 45 reclassée « proche »), sauf 5 correspondances de Q9 à
vérifier sur les fiches.

**Report fait, 5 vérifications de Q9 faites (2026-09-28, session Sonnet)** :
`config/matching-rules.ts` et `config/model-families.ts` mis à jour selon
D-2026-09-28-02 (poids/plan de cordage/longueur retirés des versions ou
reclassés « proche », éditions séparées, 5 regroupements provisoires
éclatés en 18 familles par ligne, attribut `edition` ajouté, règle textile
affinée, `lot`/`cadeau` dans `COMMON_ATTRIBUTES`). Référentiel : 119
familles (76 raquettes, 43 cordages), 0 `a_confirmer`. Les 5
correspondances Q9 vérifiées réellement sur le web (accès non bloqué dans
cette session, à la différence de la session cloud) : Lacoste L23 L =
Tecnifibre L23 Light (même référence fabricant) ; Synthetic Gut Force ≠
Synthetic Gut (fiches différentes) ; Wilson Element = Luxilon Element
(marque alias) ; Gosen Eggpower = Sidewinder (même cordage, fusionnés en
une famille, pas deux) ; RF 01 Future = version adulte allégée, pas
junior. `tsc`/`eslint` propres. Paire R1 45 reportée dans le CSV et
`R1_mesure.md` §10. Détail : `R2_referentiel.md` §5.

**Passe R2 chaussures + accessoires proposée (2026-09-28)** :
`config/model-families-chaussures.ts` (76 familles),
`config/model-families-accessoires.ts` (53 familles avec sous-catégorie),
`config/accessory-subcategories.ts` (lexique v2 mesuré). Questions
Q13-Q20 : `R2_referentiel.md` §7.

**Réponses actées, reportées, cas vérifiés (2026-09-28, D-2026-09-28-03,
session desktop Sonnet, réseau ouvert)** : Q13-Q20 tranchées et reportées
dans `config/model-families-chaussures.ts` (77 familles, 0 `a_confirmer`),
`config/model-families-accessoires.ts` (54 familles, 0 `a_confirmer`) et
`config/accessory-subcategories.ts` (`protection_soins` ajoutée, textile
porté déplacé, hors sujet exclu). Cas restés `a_confirmer` après la revue
vérifiés réellement sur les fiches marchand/fabricant : Dunlop ATP / ATP
Tour = même balle (conditionnement différent) ; SFX 4 / SFX Evo = deux
lignes, séparées en familles ; Diadora « S. Challenge » ≠ « Speed
Challenge » (correction d'une lecture erronée) ; Prince Resi Pro corrigé
en grip (pas surgrip) ; Babolat Damp et sacs Pure confirmés en versions ;
détail complet dans `DECISIONS_FONCTIONNELLES.md` D-2026-09-28-03 et
`R2_referentiel.md` §7.4. `tsc`/`eslint` propres.

**R2 clos pour toutes les catégories.**

**R3 cadré et validé (2026-09-28, D-2026-09-28-04)** : `R3_cadrage.md`.
Capture sur l'offre (`deals`), enrichissement par fiche une fois par offre
(R3.12), `tracked` limité à ce que chaque script voit déjà, exclusions déjà
en base passées en `invalid`, garde-fou d'éviction 50 % avancé en R3.2,
filtre UI des sous-catégories en R3.13. Découpage R3.1 à R3.13, une étape
par conversation (Sonnet).

**R3 fait (2026-09-28 au 2026-09-29, R3.1 à R3.13, PR #92 à #106 et
R3.13)** : migration `tracked` + colonnes de capture, `lib/ingest.ts`,
backfill, 8 scripts réécrits, enrichissement par fiche (GTIN, `mpn`),
filtre des sous-catégories. Détail étape par étape : `R3_cadrage.md` §3.

**Bloquant sur** : rien. Prochaine étape : **R4** (nouveau moteur en mode
fantôme, §10 du cadrage rapprochement), à cadrer d'abord (Opus).

**Statut** : ouvert au 2026-09-29 — R0 à R3 faits ; R4.1 à R4.4-bis faits, R4.5 en cours (voir `ETAT_ACTUEL.md`).

---

## GAP-2026-09-27-01 — Repérer les familles et libellés inconnus du référentiel (OUVERT)

Le référentiel de modèles (§7 de `CADRAGE_rapprochement-multi-niveaux.md`)
prévoit une « révision à chaque saison », mais rien ne dit comment on sait
**quoi** ajouter. Une offre dont la famille n'est pas dans le référentiel
(nouvelle gamme, nouveau nom commercial) n'est pas perdue : elle peut encore
être rattachée par GTIN ou correspondance approchée, sinon elle devient un
modèle isolé (rapprochement manqué, jamais faux rapprochement, principe R3).
Mais sans repérage, ces offres s'accumulent sans être comparées entre
marchands et la couverture baisse en silence.

À décider : ce qui compte comme « non reconnu » (famille absente, génération
absente, alias absent), la forme du repérage (rapport listant les termes
fréquents non reconnus par marque et catégorie, avec le nombre d'offres
concernées), sa fréquence et un éventuel seuil d'alerte.

**Moment de traitement (le plus cohérent)** :
- **R2** : rien à construire. Seulement garder en tête que la méthode
  d'amorçage de la v1 (termes fréquents par marque et catégorie tirés de la
  base) est la même que celle du futur rapport : la documenter pour pouvoir
  la réutiliser.
- **R4 (cadrage)** : le mode fantôme produit pour la première fois la liste
  réelle des offres non reconnues. C'est là qu'on voit leur volume et leur
  nature, donc là qu'on tranche les règles ci-dessus sur données réelles.
- **Phase 5 du cadrage principal (construction)** : le rapport récurrent
  s'intègre à la supervision (page d'administration, audit hebdomadaire et
  alerte de §Phase 5 de `CADRAGE_vrais-bons-plans.md`), plutôt qu'un outil à
  part. Entre R5 et la Phase 5 : rapport lancé à la main lors de la révision
  de saison.

**Statut** : ouvert au 2026-09-27.

---

## GAP-2026-09-27-02 — Les validations de la file de revue enrichissent-elles le référentiel ? (OUVERT — principe tranché)

Quand Mathieu confirme dans la file de revue qu'une offre appartient à une
famille connue sous un libellé nouveau (ex. une abréviation propre à un
marchand), deux options :
1. **Enrichissement automatique** : le libellé devient un alias de la famille,
   les offres suivantes sont rattachées sans repasser en revue.
2. **Enrichissement proposé** : les validations sont accumulées puis
   proposées en lot pour ajout au référentiel (relecture, comme le reste de
   la connaissance tennis, §0 du cadrage rapprochement).

Sans l'un ou l'autre, le même cas repasse en revue à chaque run et la charge
de revue (objectif ~1 h/semaine, Phase 5) augmente avec le temps.

Lien direct avec le stockage : le principe R7 du cadrage rapprochement place
le référentiel dans des **fichiers de configuration versionnés** (chaque
modification passe par une PR). L'option 1 écrit dans le référentiel depuis
l'application, ce qu'un fichier versionné ne permet pas sans passer par une
table (ou une table d'alias à côté du fichier). L'option 2 est compatible
avec le fichier.

**Moment de traitement (le plus cohérent)** :
- **R2 (principe)** : trancher option 1 ou 2 **avant** de figer le format du
  référentiel, sinon le stockage risque d'être refait en R5.
- **R5 (construction)** : la file de revue reçoit ses premiers cas ; c'est là
  que la mécanique retenue est construite.
- **Phase 5 (interface)** : l'action correspondante (« valider et ajouter
  l'alias » ou « proposer l'alias ») est ajoutée à la file de revue unique de
  la page d'administration.

**Statut** : principe tranché le 2026-09-28 (D-2026-09-28-01) : option 2,
enrichissement proposé en lot, référentiel en fichier versionné. Reste ouvert
pour la construction (R5) et l'interface (Phase 5).

---

## GAP-2026-09-28-01 — Une offre `tracked` (sans prix barré) au plus bas de l'historique doit-elle être affichée ? (OUVERT)

Aujourd'hui (D-2026-09-25-21), une offre `tracked` est exclue du site partout ;
elle ne passe `active` que si le marchand affiche une remise. Le verdict
« vrai bon plan » de la Phase 4 (`CADRAGE_vrais-bons-plans.md`) s'appuie sur
notre historique (médiane et plus bas sur 90 jours, principe P1) et donne un
badge et un filtre ; le cadrage ne dit pas s'il peut aussi **faire apparaître**
une offre `tracked`. Cas visé : un article sans prix barré, mais au plus bas
observé ou à 90 % ou moins de la médiane.

Pour : cohérent avec P1 (le prix barré n'est pas une source de vérité) ; un tel
article est souvent un meilleur signal qu'une promo à prix barré gonflé.

Conséquences si oui :
- exception à D-2026-09-25-21 (une `tracked` avec verdict positif est affichée
  ou passe `active`) ;
- pas de pourcentage de remise à afficher : formulation P4 (« prix le plus bas
  vu depuis N jours ») ;
- le volume dépend du nombre de `tracked` collectés (R3-Q3 : seulement ce que
  chaque script récupère déjà ; catalogue complet en Phase 4-bis). Tecnifibre
  n'en donne que 9, car son script ne lit que l'outlet. Les passages R3.5 à
  R3.11 donneront le chiffre par marchand.

**Ne bloque pas R3** : R3 collecte les offres `active` et `tracked` et leur prix
quotidien (trigger), quelle que soit la réponse.

**Bloquant sur** : le cadrage de la Phase 4 (à trancher avant d'écrire le
verdict et son affichage).

**Statut** : ouvert au 2026-09-28, noté à la demande de Mathieu.

---

## GAP-2026-09-26-01 — n8n : `N8N_BASIC_AUTH_*` encore pris en compte en 2.40.5 ? (OUVERT)

Le `docker-compose.yml` de la VM Oracle définit une authentification basique
via `N8N_BASIC_AUTH_*`. À vérifier (lecture seule) : ces variables sont-elles
encore lues par la version installée (2.40.5), ou ignorées depuis la gestion
d'utilisateurs intégrée de n8n ? Si elles sont ignorées, la protection
réelle de l'interface repose sur autre chose qu'on ne connaît pas encore.
Ne toucher ni au mot de passe ni au `docker-compose.yml` dans ce cadre.
Voir §6.4 de `CADRAGE_vrais-bons-plans.md`.

**Statut** : ouvert au 2026-09-26, à traiter au build de la Phase 2 (ou
avant, sur demande).

---

## GAP-2026-09-26-02 — VM Oracle sous Oracle Linux 9.8 : installation de Playwright à évaluer (OUVERT)

`cat /etc/os-release` (2026-09-26) : Oracle Linux Server 9.8 (famille EL9,
`dnf`). `npx playwright install --with-deps` ne vise que Ubuntu/Debian et ne
fonctionnera pas tel quel. Piste à évaluer (pas une décision) : faire
tourner les scrapers dans l'image Docker officielle de Playwright
(multi-arch, arm64), Docker étant déjà présent sur l'hôte. Voir §6.4 de
`CADRAGE_vrais-bons-plans.md` pour les points à évaluer.

**Statut** : ouvert au 2026-09-26, à trancher au build de la Phase 2
(point 5 de la checklist VM).

---

## GAP-2026-09-25-10 — Conflit de nom : un site existant s'appelle déjà « tennisdeals » (OUVERT)

Le renommage de la marque affichée « Deals Tennis » → « Tennisdeals » (D-2026-09-25-07, PR #47, 2026-09-25) a été fait avant de vérifier qu'aucun autre site n'utilisait déjà ce nom. L'utilisateur a signalé le 2026-09-25 qu'un site nommé « tennisdeals » existe déjà. Périmètre du renommage initial rappelé : uniquement la marque affichée (header/footer, métadonnées de page, pages réglementaires, `package.json`) — l'URL Vercel (`deals-tennis.vercel.app`) et le nom du dépôt GitHub n'ont pas changé, donc rien d'irréversible côté infra.

Trois options soumises à l'utilisateur le 2026-09-25, décision explicitement reportée (« note-le simplement pour le moment ») :
1. Revenir à « Deals Tennis » (annule PR #47).
2. Choisir un nouveau nom (à définir, vérifier sa disponibilité avant adoption).
3. Garder « Tennisdeals » quand même si le site existant n'est pas un vrai concurrent direct.

**Élément nouveau (2026-09-27, repérage marchands)** : le site existant est `www.tennisdeals.be`, un revendeur de matériel de tennis (« Tennisdeals : Game. Set. Deals. Le matériel de tennis au meilleur prix ! ») édité par **SARL EXTREME TENNIS** (RCS Douai 525076105, [mentions légales](https://www.tennisdeals.be/fr/content/2-mentions-legales)), qui est aussi le candidat n°1 du repérage. L'option 3 ci-dessus (« pas un vrai concurrent direct ») est donc fragilisée. Voir `REPERAGE_marchands_verification.md` §2.

**Option tranchée (2026-09-27, D-2026-09-27-01)** : option 2, choisir un nouveau nom. Reste à faire : proposer des noms, vérifier leur disponibilité (sites existants, marque, domaine) avant adoption, puis renommer la marque affichée (même périmètre que PR #47).

**Nom choisi (2026-09-27, D-2026-09-27-04)** : « Bonplantennis ». Disponibilité vérifiée : domaines `.fr`/`.com`/`.net`/`.eu`/`.be` libres, aucun site ni marque INPI « bonplantennis ». Non vérifié : marque « Bon Plan Tennis » en plusieurs mots (recherche INPI bloquée par Cloudflare, EUIPO non consulté) — à contrôler par Mathieu dans un navigateur. Nom descriptif, faiblement distinctif (voir la décision).

**Reste à faire** : renommer la marque affichée (même périmètre que PR #47), étape de build dédiée ; réservation éventuelle d'un domaine par Mathieu.

**Bloquant sur** : le renommage. Bloque toujours toute candidature d'affiliation (D-2026-09-26-02), dont Intersport via Kwanko (D-2026-09-27-02).

**Statut** : ouvert au 2026-09-25, nom choisi le 2026-09-27, renommage restant à faire.

---

## GAP-2026-09-25-09 — Head : items génériques non tennis-exclusifs retenus depuis la page textile (OUVERT, mineur)

Découvert en vérifiant le build Head (voir `ETAT_ACTUEL.md`) : la page `shop-sportswear/summer` ciblée pour le textile (page "Tennis and Padel" du marchand, vérifiée 100% tennis sur l'échantillon parcouru au cadrage) contient au moins un article générique sans indice tennis explicite dans son titre — « HEAD Bandana », retenu en base (catégorie textile). Le filet de sécurité multi-sports (exclusion padel/squash/badminton/pickleball) ne peut pas l'exclure, n'ayant aucun mot-clé d'autre sport non plus.

**Bloquant sur** : rien dans l'immédiat — impact d'un article isolé sur 66 offres Head, un bandana reste un accessoire plausible pour le tennis (porté par de nombreux joueurs), pas une donnée fausse à proprement parler. Même catégorie que GAP-2026-09-23-04/GAP-2026-09-25-02/04/05 (qualité de donnée mineure, isolée) — à surveiller si le volume de ce type d'item augmente lors des passages suivants.

**Statut** : ouvert au 2026-09-25.

---

## GAP-2026-09-25-07 — Chantier SEO/GEO : blocs de build restants après le bloc 3 (OUVERT)

Suite à D-2026-09-25-10 : plan en 7 blocs acté (fondations techniques, données structurées, URLs canoniques, ouverture robots IA, `llms.txt`, performance, Open Graph), un bloc par conversation dédiée. Bloc 1 terminé et vérifié (D-2026-09-25-12, PR #52). Bloc 2 (données structurées) terminé et vérifié (D-2026-09-25-13, PR #54, mergée). Bloc 3 (URLs canoniques) terminé et vérifié (D-2026-09-25-14, branche `feat/seo-canonical-catalogue`).

**Reste à faire, dans l'ordre** :
1. ~~Fondations techniques (`robots.txt`, `sitemap.xml`, métadonnées par page)~~ — fait (D-2026-09-25-12).
2. ~~Données structurées (Schema.org / JSON-LD Product/Offer)~~ — fait (D-2026-09-25-13, PR #54, mergée).
3. ~~URLs canoniques / contenu dupliqué (filtres catalogue)~~ — fait (D-2026-09-25-14) : canonical fixe vers la racine sur la page catalogue.
4. Ouverture aux robots IA (GPTBot, ClaudeBot, PerplexityBot, Google-Extended...) — décision explicite à prendre, pas encore tranchée. Prochaine étape.
5. `llms.txt`.
6. Performance / Core Web Vitals.
7. Open Graph (partage social).

Chaque bloc doit être cadré en détail (décisions structurantes propres, ex. quels crawlers IA autoriser) avant tout code, conformément au protocole général.

**Indépendant du chemin critique « vrais bons plans » / rapprochement multi-niveaux** (confirmé 2026-09-26) : ne dépend d'aucune étape R0-R5 ni des phases du cadrage `CADRAGE_vrais-bons-plans.md`, peut être repris à tout moment sans attendre.

**Bloquant sur** : rien — chantier en cours, prochaine conversation dédiée au bloc 4. Vérifier le statut de merge de la branche `feat/seo-canonical-catalogue` (bloc 3) avant de commencer.

**Statut** : ouvert au 2026-09-26.

---

## GAP-2026-09-25-06 — Babolat : mots-clés sexe anglophones ("Men"/"Women") non reconnus par le lexique extractGender (OUVERT, mineur)

Découvert en vérifiant le build Babolat (voir `ETAT_ACTUEL.md`) : la catégorie chaussures utilise des titres anglophones (« Jet Mach 4 All Court Men », « Jet Tere 2 Clay Women ») alors que le lexique partagé `extractGender`/`extractAgeGroup` (`lib/product-matching.ts`, D-2026-09-25-03) ne reconnaît que des mots français (`femme|fille|lady`, `homme|garcon|garçon`). Conséquence : ces articles retombent sur `gender = non_determine` alors que le sexe est en réalité connu depuis le titre marchand (à la différence des catégories textile/accessoires du même site, qui utilisent « Homme »/« Femme » en français et sont bien détectées).

**Bloquant sur** : rien dans l'immédiat — `non_determine` reste une valeur valide et n'exclut pas l'article du catalogue (filtre sexe/âge optionnel), juste imprécis pour ces fiches. Étendre le lexique partagé à l'anglais est une décision structurante (impacte tous les marchands déjà scrapés, pas seulement Babolat) — hors périmètre de cette étape, non tranchée seule.

**Statut** : ouvert au 2026-09-25.

---

## GAP-2026-09-25-05 — Sport 2000 : facette sexe Algolia contredisant le libellé produit sur 1 article (OUVERT, mineur)

Découvert en vérifiant le build Sport 2000 (voir `ETAT_ACTUEL.md`) : le produit « Chaussures de tennis ADIDAS Fille Advantage CF I Enfant Garçon » a la facette `gender` Algolia du marchand valant `BEBE GARCON` alors que son propre libellé produit contient « Fille » — contradiction dans les données Sport 2000 elles-mêmes (cause côté marchand, pas une erreur d'extraction). Conséquence : le titre construit contient à la fois « Fille » et « Garçon », l'heuristique (`extractGender`) retombe sur `mixte` plutôt que de trancher.

**Bloquant sur** : rien dans l'immédiat — 1 seul produit concerné sur 165 offres Sport 2000, `mixte` reste une valeur valide du filtre (pas une erreur système), juste potentiellement pas le sexe réel de l'article. Même catégorie que GAP-2026-09-23-04/GAP-2026-09-25-02 (qualité de donnée marchand mineure, isolée).

**Statut** : ouvert au 2026-09-25.

---

## GAP-2026-09-25-04 — SportSystem : 1 bloc de listing non parsable (OUVERT, mineur)

Découvert en vérifiant le build SportSystem (voir `ETAT_ACTUEL.md`) : sur les ~768 blocs produit rencontrés dans les 8 pages promo tennis, 1 seul n'a pas pu être parsé (`parseProduct` retourne `null` — un des sélecteurs regex url/prix/image n'a pas matché) et a été silencieusement ignoré (`skippedUnparsable`). Cause non investiguée (structure HTML légèrement différente sur cette fiche précise ? champ manquant ?).

**Bloquant sur** : rien dans l'immédiat — impact d'une seule offre potentiellement manquante sur 768, aucune erreur ni donnée corrompue. Même catégorie que GAP-2026-09-23-04/GAP-2026-09-25-02 (qualité de donnée mineure, isolée).

**Statut** : ouvert au 2026-09-25.

---

## GAP-2026-09-25-03 — Tests contrat dépendants de données de prod volatiles (OUVERT, mineur)

Découvert en vérifiant `npm test` avant le commit du backfill sexe/âge (aucun rapport avec ce backfill, confirmé par `git stash` — mêmes échecs sans les changements en cours) : 3 tests échouent car ils dépendent de données réelles précises en prod plutôt que de données de test isolées — `tests/contract/catalog-query.test.ts` (recherche groupée "Pure Aero") et `tests/contract/deal-detail.test.ts` (autres offres du même article) supposent qu'un produit "Pure Aero" a encore 2+ offres actives en base ; vérifié réellement (requête directe) : ce n'est plus le cas aujourd'hui (0 produit Pure Aero avec 2+ offres actives), probablement du fait du scraping quotidien (expiration/désactivation d'offres). Même catégorie de fragilité déjà rencontrée et corrigée une fois en GAP-2026-09-23-01 (effet de bord découvert) — la correction précédente ciblait un titre précis plutôt que des données générées, mais reste vulnérable à la même dérive dans le temps.

**Bloquant sur** : rien dans l'immédiat — échec isolé à `npm test` (CI utilise `npm run test:unit`, qui ne touche pas la prod et reste vert). Mais fragilise la confiance dans la suite de tests contrat au fil du temps.

**Statut** : ouvert au 2026-09-25.

---

## GAP-2026-09-25-02 — Répétition de la marque dans le titre pour un produit Tennispro.fr (OUVERT, mineur)

Découvert en vérifiant le build Tennispro.fr (voir `ETAT_ACTUEL.md`) : le produit « Sac de tennis Mouratoglou Apparel Mouratoglou Training Gym » (marque `Mouratoglou Apparel`, catégorie accessoires) a la marque qui apparaît deux fois dans le titre — une fois insérée par le script (convention `${label} ${brand} ...`), une fois déjà présente dans le nom scrappé du produit (`SAC MOURATOGLOU TRAINING GYM`, le mot « Mouratoglou » y figurant nativement, sans être le nom de marque complet `Mouratoglou Apparel`). Vérifié réellement : cas isolé (1/673 offres Tennispro.fr), pas un problème systémique — recherche sur toute la base ne trouve aucune autre offre où la chaîne de marque complète apparaît deux fois dans le titre.

**Bloquant sur** : rien dans l'immédiat — impact cosmétique sur une seule fiche. Même catégorie que GAP-2026-09-23-04 (qualité de donnée produit mineure).

**Statut** : ouvert au 2026-09-25.

---

## GAP-2026-09-24-01 — Sport Outlet FR : datafeed obtenu et examiné, mécanisme d'ingestion à recadrer (OUVERT)

Résultat de la recherche cowork (GAP-2026-09-23-05) : Sport Outlet FR identifié comme marchand tennis avec programme d'affiliation public sur Awin. Compte Awin publisher créé par l'utilisateur et candidature au programme Sport Outlet FR **acceptée** — résout de fait le blocage compte Awin de GAP-2026-09-21-03 (au moins pour ce marchand).

**Export obtenu et examiné réellement (2026-09-24)** : datafeed généré via l'outil Awin "Create-a-Feed" (toutes colonnes cochées, CSV/`,`/gzip), téléchargé par l'utilisateur (`21502-48225-fr_FR-Default.csv.gz`, hors dépôt Git — voir `.gitignore`). URL Awin de téléchargement contient une clé API personnelle (secret), à traiter comme `DATABASE_URL` le moment venu (variable d'environnement, jamais committée). 7818 produits, 0 ligne malformée.

**Constats issus de l'examen réel** (à reprendre/creuser en détail dans la prochaine conversation de cadrage) :
- Volume de produits tennis réel très faible : ~65 lignes mentionnent "tennis" (nom ou catégorie) sur 7818, et une partie sont en fait du **tennis de table** (à exclure, symétrique au filtre squash/padel/badminton de ProTennis) — volume utile estimé à l'ordre d'une trentaine d'articles. Catalogue du marchand très majoritairement football/mode sportive.
- `product_model` est une colonne vide chez ce marchand (contrairement à l'hypothèse initiale) — extraction du modèle depuis le titre à refaire comme pour ProTennis, pas de lecture directe possible.
- Candidat pour `original_price` : `rrp_price` (peuplé, cohérent) — pas `product_price_old` (vide sur l'échantillon). Certaines lignes ont `rrp_price = "0,00"` (pas de prix de référence connu), incompatible avec la contrainte `original_price > 0` : à écarter ou traiter à part, pas à forcer.
- Format des prix incohérent entre colonnes : `search_price`/`store_price` en point décimal (`89.99`), `rrp_price` en virgule française (`139,95`) — à gérer explicitement au parsing.
- Catégorisation du marchand (`merchant_product_category_path`) ne recoupe pas directement nos 5 catégories (`raquettes`, `cordages`, `chaussures`, `textile`, `accessoires`) — mapping à définir.

**Décision de l'utilisateur (2026-09-24)** : ne pas poursuivre le cadrage technique dans cette conversation. Tout ce qui précède (logique de récupération des données, filtrage tennis vs tennis de table, mapping catégories, gestion du prix de référence) sera **recadré dans une nouvelle conversation dédiée**, pas enchaîné ici.

**Prochaine étape** : nouvelle conversation de cadrage (pas de build) sur le mécanisme d'ingestion Sport Outlet FR — reprendre les constats ci-dessus, décider du filtre tennis/tennis de table, du mapping catégories, de la règle sur `rrp_price = 0`, avant toute écriture de code.

**Statut** : ouvert au 2026-09-24.

---

## GAP-2026-09-21-03 — Pas de compte Awin publisher, datafeed non vérifiable (PARTIELLEMENT RÉSOLU)

Tennis Point FR (Awin #13266) et Padel-Point FR (Awin #25160) annoncent un flux de données produit (datafeed) dans les avantages de leur programme Awin, mais le format exact (CSV/XML, champs, fréquence) n'est visible qu'après création d'un compte affilié Awin et acceptation de la candidature sur chacun des deux programmes.

**Mise à jour 2026-09-24** : un compte Awin publisher a été créé par l'utilisateur (voir GAP-2026-09-24-01, contexte Sport Outlet FR) — le blocage « aucun compte Awin » est levé. Reste ouvert spécifiquement pour Tennis Point FR / Padel-Point FR : candidature à ces deux programmes pas encore soumise/acceptée, datafeed toujours non vérifié pour eux.

**Bloquant sur** : action de l'utilisateur (candidature aux deux programmes depuis le compte Awin désormais actif).

**Statut** : ouvert au 2026-09-24 (compte Awin résolu, candidatures Tennis Point/Padel-Point restent à faire). Bloqué aussi par le renommage « Bonplantennis » (GAP-2026-09-25-10) : aucune candidature d'affiliation avant.

---

## GAP-2026-09-22-07 — `scripts/migrate.ts` non idempotent (OUVERT, mineur)

Le runner de migration (`scripts/migrate.ts`, `npm run db:migrate`) réapplique **tous** les fichiers de `scripts/migrations/` à chaque exécution, sans table de suivi des migrations déjà appliquées. La migration `002_deals_unique_merchant_url.sql` a dû être appliquée manuellement (hors `db:migrate`) pour cette raison — relancer `npm run db:migrate` échouerait sur `001_init_schema.sql` (`CREATE TABLE` sur des tables déjà existantes). Sans impact aujourd'hui (fait rare), mais à corriger avant d'ajouter une 3e migration si le problème doit être évité à nouveau.

**Bloquant sur** : rien dans l'immédiat — amélioration technique à planifier, pas une décision utilisateur.

**Statut** : ouvert au 2026-09-22.

---

