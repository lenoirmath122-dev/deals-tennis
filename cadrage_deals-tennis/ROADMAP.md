---
titre: Roadmap
statut: actuel
dernière mise à jour: 2026-10-13
---

# Roadmap

Source des phases : `CADRAGE_vrais-bons-plans.md` §3 ; ordre global : `CADRAGE_rapprochement-multi-niveaux.md` §10. Détail de l'état : `ETAT_ACTUEL.md`.

## Vue globale

| Bloc | État | Détail |
|---|---|---|
| Socle MVP (site, base Neon, Vercel, CI) | ✅ | Prod : `deals-tennis.vercel.app`. Recherche, filtres, pages réglementaires, SEO blocs 1 à 3. |
| Phase 0 — Alignement | ✅ | Validée le 2026-09-25. ProTennis retiré du périmètre. |
| Phase 1 — Historique de prix | ✅ | Trigger `price_observations` en prod, 8 scrapers sur `lib/ingest.ts`, statut `tracked`. |
| **Rapprochement multi-niveaux R0 → R5** | 🔶 **en cours** | Voir ci-dessous. |
| Phase 2 — Cadence automatique (n8n) | ⏳ | Scraping aujourd'hui manuel et local. VM Oracle vierge, rien installé ni testé. Peut démarrer en parallèle de R4.6 / R5. |
| Phase 3 — Qualité des données | ⏳ | |
| Phase 4 — Verdict « vrai bon plan » | ⏳ | ≥ 30 jours d'historique requis ; affichage derrière feature flag. |
| Phase 4-bis — Prix de référence au lancement | ⏳ | Conception seulement, après phase 2 et R5. |
| Phase 5 — Supervision | ⏳ | Inclut l'agrégation de `click_events`. |
| Phase 6 — Sélection / vitrine | ⏳ | « Plus tard ». |

## Chantier actif : rapprochement multi-niveaux (R0-R5)

- R0 diagnostic, R1 jeu de référence, R2 référentiel, R3 capture à l'ingestion : ✅
- R4.1 à R4.5 moteur en mode fantôme : ✅
- R4.6-a échantillon (28 / 30), R4.6-b textile par identifiant, R4.6-c non reconnues : ✅
- **R4.6-d bascule** : 🔶
  - Fait : passage prod `87987663…`, 15 groupes textiles retenus (D-2026-10-07-01), conventions de valeur absente C2 et C3b retenues (D-2026-10-07-02).
  - Fait (PR #153) : code de C2 / C3b, engine `r4.6-d`.
  - Fait (2026-10-13) : passage à blanc conforme (190 hors textile, 3 995 modèles, 0 incohérent, 13 conflits) ; écriture en prod `f07bcbab-8f53-4820-ad4d-1aec9eed6759` (engine `r4.6-d`, 3 995 modèles, 4 732 liens, accord de Mathieu).
  - Fait (2026-10-13) : relecture des 16 modèles modifiés, conforme (50 offres déplacées, aucune perdue).
  - Reste : décision de bascule de l'affichage (R5), dossier `R5_dossier_decision.md`.
  - R5 s1-4 fusionnées, R5.5 en PR #162 (2026-10-13) ; reste nouvelle recette preview, puis activation prod.
- R5 affichage site (modèles multi-marchands, autres générations de la famille) : ⏳ bloqué sur R4.6-d.

## Hors chemin critique

- GAP-2026-09-29-02 : détection junior restante
- GAP-2026-09-29-03 : nouveaux marchands (Sports Raquettes, Tennis Compagnie, Extreme Tennis, Tennis Achat, Intersport), après R4.6
- GAP-2026-09-29-01 : raquettes sans rapprochement fabricant / revendeurs
- GAP-2026-09-25-10 : renommage « Bonplantennis » (bloque les candidatures d'affiliation)
- GAP-2026-09-25-07 : SEO blocs 4 à 7
- GAP-2026-09-24-01 : Sport Outlet FR (Awin)
- Charte graphique : spacing / layout et nav

## Risques ouverts

Voir [RISQUES_OUVERTS.md](./RISQUES_OUVERTS.md) (les points ouverts y sont tenus ; il n'existe pas de `GAPS_OUVERTS.md`).
