# État actuel

**Dernière mise à jour** : 2026-09-29 (session Sonnet, D-2026-09-29-08) : ménage de la documentation de suivi exécuté (ETAT_ACTUEL, JOURNAL, GAPS_OUVERTS, spec MVP archivée, INDEX, README). Session précédente (Opus) : cadrage du ménage, puis analyse de cohérence et étape 0 du rapprochement tranchée (D-2026-09-29-07).

> Détail antérieur de cette page (R0 à R4.5, chantiers du 2026-09-21 au 2026-09-29) archivé tel quel dans `archive/ETAT_ACTUEL_detail_2026-09-29-R0_a_R4-5.md`. Détails plus anciens : `archive/ETAT_ACTUEL_detail_2026-09-22.md` et `archive/ETAT_ACTUEL_detail_2026-09-23-recherche_a_retour-accueil.md`.

## Chantier en cours : rapprochement multi-niveaux, R4.5

- **R4.5-a** (extraction textile, référence de style, signature) : fait, PR #116 fusionnée.
- **R4.5-b** (étape 3 en file de revue, passage à blanc textile) : commit `6e2b8fb` sur la branche `claude/cloud-credit-usage-bqgtxs`, **sans PR** ; les 3 cas Nike tranchés (D-2026-09-29-05), code de cette décision **pas encore écrit**.
- Définitions des verdicts validées (D-2026-09-29-06) ; étape 0 et ordre du chantier (D-2026-09-29-07) ; mesure de séparation dans `R4_5_mesure_separation.md`.

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

Ordre acté (D-2026-09-29-07) : (1) fin de R4.5-b, session Sonnet : code de D-2026-09-29-05, passage à blanc, relecture avec la grille D-2026-09-29-06, PR ; (2) décisions de Mathieu sur `revue-textile.csv` ; (3) écriture du passage en prod (accord de Mathieu) ; (4) références de style toutes catégories ; (5) corrections d'extraction (§5.3 de `R4_5_mesure_separation.md`) ; (6) état « indéterminé » dans `compare()` ; (7) investigation des indéterminés, dont R4.5-c ; (8) R4.6.
