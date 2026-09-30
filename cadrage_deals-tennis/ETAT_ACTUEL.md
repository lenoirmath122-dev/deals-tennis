# État actuel

**Dernière mise à jour** : 2026-09-30 (session Sonnet) : code de D-2026-09-29-05 reporté sur `master` (branche `feat/r4.5-b-nike-style`), passage à blanc relu. Avant, même jour (session Opus, D-2026-09-30-03) : report sur `master` de la documentation de la PR #117 (restée en brouillon, en conflit, fermée sans merge) : décisions D-2026-09-29-05 à 08, mesure de séparation, ménage de la documentation. Deux sessions avaient mené R4.5-b en parallèle ; la version de `master` (PR #118) est gardée, le code de D-2026-09-29-05 reste à y reporter. Même jour : R4.5-c proposé et validé (D-2026-09-30-02), son report placé plus loin dans l'ordre. Session du 2026-09-29 (Sonnet, D-2026-09-29-08) : ménage de la documentation de suivi.

> Détail antérieur de cette page (R0 à R4.5, chantiers du 2026-09-21 au 2026-09-29) archivé tel quel dans `archive/ETAT_ACTUEL_detail_2026-09-29-R0_a_R4-5.md`. Détails plus anciens : `archive/ETAT_ACTUEL_detail_2026-09-22.md` et `archive/ETAT_ACTUEL_detail_2026-09-23-recherche_a_retour-accueil.md`.

## Chantier en cours : rapprochement multi-niveaux, R4.5

- **R4.5-a** (extraction textile, référence de style, signature) : fait, PR #116 fusionnée.
- **R4.5-b** (étape 3 en file de revue) : fait, PR #118 fusionnée (`lib/matching/textile-review.ts`, D-2026-09-30-01 : sous-gamme adidas, « Flouncy » Nike, bermuda). Passage écrit en prod le 2026-09-30 (`f196b689…`, engine `r4.5-b-textile`, 3 368 modèles, 69 modèles textiles multi-marchands, 250 paires en file de revue). **Ce passage ne contient pas encore D-2026-09-29-05** : les modèles Nike Victory 7, Advantage 7 et Victory 9 y réunissent deux générations (Flex et Dri-FIT) à tort (tables `match_*` seulement, site non touché).
- **Code de D-2026-09-29-05 reporté sur `master`** (branche `feat/r4.5-b-nike-style`, PR à ouvrir, 2026-09-30) : Nike, références de style distinctes (transitivité comprise), offres sans référence ambiguës, Tie Break II hors file ; passage à blanc et relecture faits (69 → 67 modèles textiles multi-marchands, 215 paires en file). **Le passage écrit en prod (`f196b689…`) ne le contient toujours pas** : à réécrire à l'étape 3. Point à trancher par Mathieu : l'exclusion de la file par `numero` retire aussi 36 paires dont des cas non générationnels (adidas « 3 Bandes », voir JOURNAL).
- **R4.5-c** : liste validée (D-2026-09-30-02 : 7 familles de chaussures, « ultra » = AG-LT23, année d'un seul côté pour une famille unique) ; **report en code à l'étape 7 ci-dessous** (D-2026-09-30-03). Les défauts d'extraction trouvés (`R4_5_c_generation_unique.md` §2) rejoignent l'étape 5.
- Définitions des verdicts validées (D-2026-09-29-06) ; étape 0 et ordre du chantier (D-2026-09-29-07) ; mesure de séparation dans `R4_5_mesure_separation.md`.
- En attente de Mathieu : relecture de `revue-textile.csv` ; GAP-2026-09-30-01 (ordre des mots). Millésime textile : réglé par D-2026-09-29-07 point 1 (« proche » d'ici l'état « indéterminé »).

## Chantiers terminés

- **MVP** (état au 2026-09-24, non tenu à jour : `archive/mvp/`).
- **Déploiement production** : Vercel, `https://deals-tennis.vercel.app`, base Neon.
- **CI + protection de branche** : CI obligatoire avant merge squash, pas de push direct sur `master`.
- **Retrait ProTennis** (2026-09-25) : marchand, workflow n8n et données retirés.
- **Recherche centrée article + page détail deal** (PR #16), suggestions cliquables (PR #23, #26, #28, #29), recherche insensible à l'ordre des mots (PR #24).
- **Sous-catégorie couleur** (D-2026-09-23-06) ; **tri par prix** ; **pages réglementaires** (PR #31, #32).
- **Charte graphique** : tokens, hero (PR #3, #21) ; il reste le spacing et la nav (voir plus bas).
- **Filtre sexe / âge** : colonnes, lexique, backfill, UI ; le déploiement n8n prévu est sans objet depuis le retrait de ProTennis.
- **Scraping local des 8 marchands** : Tecnifibre, Tennispro.fr, SportSystem, Sport 2000, Babolat, Tennis Point FR, Head, Amazon (build révisé rayon+facette, PR #61).
- **Trigger `price_observations`** (historique de prix) appliqué en prod.
- **SEO blocs 1 à 3** : robots + sitemap, JSON-LD Product/Offer, URLs canoniques (PR #52, #54, bloc 3).
- **Sous-catégories accessoires** (R3.13) : migration, lexique, backfill, filtre.
- **R0 à R3** : diagnostic, jeu de référence et mesure, référentiel, réécriture des 8 scripts sur `lib/ingest.ts` (enrichissement par fiche GTIN/mpn inclus).
- **R4.1 à R4.4-bis** : migration 008, extraction des attributs (raquettes, cordages, chaussures, accessoires), comparaison + cascade + regroupement, corrections C-Q1 à C-Q4, écriture du passage en prod.

## Stack réelle

Next.js 16.3.5 (App Router), React 19, TypeScript, Tailwind CSS v4, PostgreSQL (Neon Serverless), déploiement Vercel. Scraping local par script (`lib/ingest.ts`), sans n8n.

## En attente, hors chemin critique

- SEO bloc 4 (robots IA), puis blocs 5 à 7 (llms.txt, performance, Open Graph) : GAP-2026-09-25-07.
- Charte graphique : spacing / layout et style de la nav.
- Renommage « Bonplantennis » : GAP-2026-09-25-10 (bloque aussi les candidatures d'affiliation).
- Sport Outlet FR (Awin) : GAP-2026-09-24-01.
- Nouveaux marchands (Sports Raquettes, Tennis Compagnie, Extreme Tennis, Tennis Achat, Intersport) : gap ouvert dans `GAPS_OUVERTS.md`, après R4.6.
- Détection junior restante (étape 4 + 17") : gap fusionné dans `GAPS_OUVERTS.md`.
- Phase 2 n8n : GAP-2026-09-26-01 / -02.

## Prochaine étape

Ordre acté (D-2026-09-29-07, confirmé et précisé par D-2026-09-30-03) :
1. ~~Code de D-2026-09-29-05 sur `master`~~ **fait le 2026-09-30** (PR à ouvrir).
2. Décisions de Mathieu sur `revue-textile.csv`.
3. Écriture du passage en prod (accord de Mathieu).
4. Références de style toutes catégories.
5. Corrections d'extraction (§5.3 de `R4_5_mesure_separation.md` et §2 de `R4_5_c_generation_unique.md`), chacune avec une paire piège.
6. État « indéterminé » dans `compare()`.
7. Investigation des indéterminés, dont le report de R4.5-c (liste déjà validée).
8. R4.6.
