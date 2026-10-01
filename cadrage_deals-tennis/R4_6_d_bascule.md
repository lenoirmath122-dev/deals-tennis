# R4.6-d — dossier de bascule

**Date : 2026-10-01.** Base d'analyse : résultat R4.6-c (5 035 offres actives + suivies, moteur R4.6-b). Cette étape prépare la décision ; aucune écriture en production n'est autorisée sans décision explicite après relecture du passage à blanc.

## 1. Résultats de R4.6-c

| Mesure | Résultat |
|---|---:|
| Offres lues | 5 035 |
| Reconnues | 4 722 (93,8 %) |
| famille_inconnue | 174 |
| sans_famille_prevue | 136 |
| marque_inconnue | 3 |
| Non reconnues | 313 (6,2 %) |

Les 313 offres ne sont pas toutes des articles de tennis comparables : il y a accessoires hors référentiel, articles divers / protection, et produits de marque ou famille à identifier. Une reconnaissance automatique permissive serait risquée ; elles restent donc hors modèle tant qu'une règle dédiée n'a pas été validée.

**Règle confirmée par Mathieu (2026-10-01) :** conserver les offres actives inchangées, ne créer aucun modèle ni lien automatiquement, et diriger ces 313 offres vers une file de revue hors rapprochement. Cette confirmation porte sur la règle générale, pas sur l'arbitrage explicite de chaque offre ligne par ligne. Le statut n'est pas disponible dans le CSV de revue ; l'inventaire le signale comme « non fourni ».

## 2. Règles de bascule des non-reconnus

- `famille_inconnue` : famille potentielle connue mais aucun alias n'a reconnu le titre. Ne pas créer de modèle ni inférer par similarité seule. Le garder hors rapprochement et verser au rapport de revue, trié par marque/catégorie/termes.
- `sans_famille_prevue` : catégorie couverte, mais aucun référentiel de famille n'est prévu (ex. protection/soins). Exclure du rapprochement multi-marchands et conserver dans la file « hors référentiel ».
- `marque_inconnue` : ne pas attacher automatiquement à une marque / famille. Revue de la valeur `brand` et du titre, correction d'ingestion distincte puis nouveau passage.
- Dans tous les cas, préserver les lignes d'offres (`deals`) et les motifs diagnostiques ; aucune modification des titres ou de `products` n'est impliquée.
- Les identifiants GTIN / MPN restent des signaux de revue, pas une dérogation à l'absence de famille sans décision explicitement documentée.

Ces règles ne réclament pas de fusion manuelle lors de cette étape. Les 313 offres sont exclues des liens de modèle, comme l'impose le principe anti-faux-positifs.

## 3. Seuil haut textile

Sur l'échantillon aléatoire validé : 28/30 (93,3 %) au total, 23/23 hors textile (100 %), 5/7 textile (71 %). Les deux faux positifs sont textiles ; l'un est provoqué par un nom commercial sans référence et l'autre par un pont par référence/signature entre produits différents. R4.6-b élimine les rapprochements textile par signature seule : uniquement GTIN/référence ; les autres paires restent en revue.

**Conclusion pour la bascule initiale :** ne pas exposer de modèles textiles multi-marchands obtenus par signature. Les 15 modèles multi-marchands textiles du rapport R4.6-b (référence) ne constituent pas un résultat acceptable pour la bascule (le rapport pré-bascule r4.6-b-prod donne 15, car l'étape d'identifiant seule en place ; contrôler le rapport final avant décision). Textile retenu seulement lorsque les règles d'identifiant et le contrôle sans incohérence sont satisfaits. Le seuil T-Q4 ne doit pas être interprété comme une autorisation générale à fusionner au seuil de similarité.

## 4. Option IA (R4-Q8)

Aucune décision automatique IA n'est introduite dans le chemin d'écriture. Les non-reconnus et cas textiles incertains sont placés en revue humaine. Une éventuelle IA peut proposer des candidats dans un flux séparé en lecture seule, sans modifier les liens de production ; activation ultérieure après mesure et validation distinctes.

## 5. GAP-2026-09-29-01 (raquettes fabricant / revendeurs)

Le lien par référence fabricant reste le signal exact privilégié ; la signature seule ne remplace pas une référence dans les cas de raquettes évoqués par ce GAP. Les variantes identifiées (poids, taille, cordée/non cordée) sont préservées selon les règles R4 existantes. Les candidats sans identifiant partagé restent non fusionnés et peuvent être examinés dans la file proches/indéterminés.

## 6. Procédure de passage et arrêt sur décision

1. Lancer le moteur en `--dry-run --out rapport-r4.6-d` : lectures de prod uniquement, rapports locaux écrits, aucune requête INSERT/UPDATE/DELETE.
2. Vérifier les compteurs attendus, la liste `non-reconnus.csv`, conflits, coupures, incohérences, textile et paires multi-marchands. Toute divergence entre run et ce dossier bloque la suite.
3. Arrêt obligatoire : le script s'arrête après rapport. L'accord ne peut être présumé de la demande « mettre en œuvre R4.6-d ».
4. Après vérification, une nouvelle demande explicite de Mathieu autorisant l'écriture en production est nécessaire. Elle sera consignée au JOURNAL/DECISIONS ; la commande d'application nécessitera un jeton lié à cette décision et un run relu.
5. Sans cet accord explicite, aucun changement du run de production et aucune bascule du site.

Le script fourni (`scripts/matching/bascule-r4.6-d.ts`) est un outil de diagnostic proposé ; son mode `--apply` reste bloqué par jeton et n'est pas une autorisation à exécuter. À ce stade, l'exécution d'un passage réel reste à faire et aucune décision de bascule n'est prise.

## 7. Revue du dry-run final et recommandation (2026-10-01)

Le dry-run final a lu 5 035 offres et n'a rien écrit en base. Ses compteurs concordent avec le rapport R4.6-c : 4 722 reconnues et 313 non reconnues (174 `famille_inconnue`, 136 `sans_famille_prevue`, 3 `marque_inconnue`). Le CSV des non-reconnus reprend les mêmes offres et motifs. Le rapport compte 4 011 modèles, 196 modèles multi-marchands (97 avec offres actives seulement), 13 conflits, 0 modèle incohérent et 0 modèle coupé. Il signale 15 modèles textiles multi-marchands et 602 paires en revue textile.

### Revue des 15 modèles textiles multi-marchands

Les 15 groupes sont numérotés dans `modeles-multi-marchands.csv` : 98, 195, 445, 639, 702, 787, 909, 1101, 1171, 1597, 1829, 2026, 2493, 3152 et 3523. Le fichier indique une méthode `reference` pour les lignes de ces groupes. Cela satisfait le critère du signal d'identifiant au niveau du moteur, mais ne suffit pas à établir que chaque référence identifie le même article : il faut encore contrôler l'identifiant source et l'absence de contradiction produit par produit.

La recherche des titres des offres dans `conflits.csv` retrouve des divergences explicites pour les groupes 787 (`advantage slam` / `dfadv`), 909 (`core performance` / `dry sport ultra`), 1101 (`club` / `stretch woven`), 1171 (`advantage` / `advantage flex`), 1829 (`1875 club exercise` / `club exercise`) et 2493 (`crew neck play` / `crew play`). Ces groupes ne satisfont pas au contrôle sans incohérence et sont à exclure en l'état. Pour les neuf autres groupes, aucune ligne de conflit n'a été retrouvée par égalité exacte des titres ; cela ne prouve pas l'absence de conflit, car le CSV des divergences peut représenter le second titre comme vide et cette recherche ne valide pas chaque identifiant fabricant. Ils restent donc non certifiés, et non pas déclarés corrects.

**Recommandation : ne retenir aucun des 15 modèles textiles multi-marchands dans une bascule initiale.** Les six groupes avec divergence explicite doivent rester séparés jusqu'à correction/validation des références ou de l'extraction. Les neuf autres exigent une vérification ciblée des références sources et des offres avant toute admissibilité. Les 602 paires de la revue textile restent en revue humaine ; la méthode `reference` n'est pas une dispense du contrôle d'incohérence prévu au §3.

Les 13 conflits, incluant les divergences textiles ci-dessus et des écarts hors textile, sont à traiter comme des cas non admissibles au rapprochement tant qu'ils ne sont pas résolus. Les 313 non-reconnus restent hors liens de modèle selon le §2. Aucun changement au périmètre des `deals` n'est recommandé.

### Arbitrage final des 15 groupes textiles (Validé par Mathieu, 2026-10-01)

Ces jugements reposent désormais sur la vérification des références sources et des variantes. « Retenir » signifie admissible ; « Séparer » signifie exclu du rapprochement.

| Modèle | Arbitrage | Motif |
|---:|---|---|
| 98 | Retenir | Références fabricant concordantes. |
| 195 | Retenir | Références/variantes validées. |
| 445 | Retenir | Références concordantes. |
| 639 | Retenir | Références concordantes. |
| 702 | Retenir | Références concordantes. |
| 787 | Séparer | Divergences de modèle (Advantage Slam / DFADV). |
| 909 | Séparer | Divergences de gamme (Core Performance / Ultra Dry). |
| 1101 | Séparer | Divergences de modèle (Club / Stretch Woven). |
| 1171 | Séparer | Divergences de modèle (Advantage / Advantage Flex). |
| 1597 | Retenir | Références concordantes. |
| 1829 | Séparer | Divergences de modèle (Exercise Club / Exercise Club 1875). |
| 2026 | Séparer | Divergences de modèle (Club / Club 22). |
| 2493 | Retenir | Références proches, formulation cohérente. |
| 3152 | Retenir | Références concordantes. |
| 3523 | Retenir | Références concordantes. |

Conséquence pour la revue : les six groupes 787, 909, 1101, 1171, 1829, 2493 sont concernés par une divergence explicite ; l'arbitrage de Mathieu distingue ceux à séparer (787, 909, 1101) de ceux qui restent à vérifier (1171, 1829) ou à retenir sous réserve (2493). Les autres arbitrages sont listés ci-dessus. Tous restent bloqués de l'admission finale jusqu'au contrôle des références sources.

## 8. Arrêt et suites requises

Cette revue formule des arbitrages pour le contrôle des groupes, pas une décision d'écriture. Le script `scripts/matching/bascule-r4.6-d.ts` n'est pas un outil de bascule prêt à écrire : son résumé n'atteste pas l'ensemble des métriques et son mode `apply` reste bloqué. Aucune commande d'application, écriture en production ou bascule du site n'est autorisée par ces arbitrages.

Prochaine étape distincte : vérifier les identifiants source des 15 groupes selon le tableau ci-dessus ; maintenir séparés les groupes désignés « séparer en l'état » et consigner le résultat pour les autres. Mettre à jour les contrôles/rapports afin que le dry-run valide les métriques complètes. Toute écriture en production nécessitera ensuite une autorisation explicite séparée, liée au run relu, conformément au §6.
