# Tasks: Tennis Deals Catalog

**Feature**: `001-tennis-deals-catalog` | **Date**: 2026-09-20
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialisation du projet Next.js et de l'environnement de développement.

- [x] T001 Initialize Next.js 14+ project with TypeScript and Tailwind CSS configuration in package.json, tsconfig.json (Next.js 16.3.5, Tailwind CSS v4 config CSS-first via app/globals.css, pas de tailwind.config.ts — voir D-2026-09-21-07)
- [x] T002 [P] Install runtime dependencies (@neondatabase/serverless, lucide-react, clsx, tailwind-merge) and testing frameworks (vitest, @playwright/test) in package.json
- [x] T003 [P] Configure environment variable template with DATABASE_URL in .env.example

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Socle de données et infrastructure de persistance bloquant toute implémentation de User Story.

**⚠️ CRITICAL**: Les User Stories ne peuvent pas démarrer tant que cette phase n'est pas achevée.

- [x] T004 Setup PostgreSQL schema migration in scripts/migrations/001_init_schema.sql creating tables merchants, deals with check constraints category IN ('raquettes', 'cordages', 'chaussures', 'textile', 'accessoires'), status IN ('active', 'expired', 'invalid'), original_price > 0 AND discounted_price > 0 AND discounted_price <= original_price, discount_percentage >= 0 AND discount_percentage <= 100, table click_events, and indexes idx_deals_active_status, idx_deals_created_at_desc, idx_deals_discount_desc, idx_deals_category_created, idx_deals_category_discount, idx_deals_fts, idx_click_events_deal_date (appliquée via `npm run db:migrate`, vérifiée sur l'instance Neon réelle : tables, index et contraintes CHECK confirmés)
- [x] T005 [P] Create database seeding script in scripts/seed.ts inserting sample merchants and active/expired tennis deals across all 5 categories for local development (exécuté via `npm run db:seed` : 3 marchands, 10 offres couvrant les 5 catégories avec un mélange actif/expiré, conservé en base comme jeu de données de développement)
- [x] T006 [P] Define TypeScript database entity types and interfaces (Merchant, Deal, ClickEvent, CatalogResponse) in types/database.ts
- [x] T007 Implement Neon Serverless PostgreSQL connection client and SQL helper using @neondatabase/serverless in lib/db.ts (fonction `neon()` en mode one-shot fetch, adaptée aux Server Components et Route Handlers Node.js — voir CONFIG.md du package installé)
- [x] T008 [P] Setup base application layout with SEO metadata and global CSS in app/layout.tsx and app/globals.css (lang="fr", title/description dédiés au catalogue tennis ; globals.css laissé au thème Tailwind v4 par défaut, aucune charte graphique encore définie)

**Checkpoint**: Socle de base de données et configuration serveur prêts - implémentation des User Stories débloquée.

---

## Phase 3: User Story 1 - Parcourir et consulter les bons plans actifs (Priority: P1) 🎯 MVP

**Goal**: Permettre aux visiteurs d'accéder à la grille des bons plans actifs ordonnés par date d'ajout décroissante avec pagination numérotée (24 offres par page).

**Independent Test**: Ouvrir la page d'accueil `http://localhost:3000` et vérifier l'affichage des cartes d'offres complètes (image, nom, marque, prix barré, prix remisé, badge %, marchand, date) et le sélecteur de page.

### Tests for User Story 1
- [ ] T009 [P] [US1] Create unit tests for price calculation, currency formatting, and card helper utilities in tests/unit/deals.test.ts
- [ ] T010 [P] [US1] Create contract test for getCatalogDeals verifying 24 items pagination and created_at DESC default ordering in tests/contract/catalog-query.test.ts

### Implementation for User Story 1
- [ ] T011 [US1] Implement catalog data query function getCatalogDeals with default sort created_at DESC, active unexpired filter status = 'active' AND is_active = true AND (expires_at IS NULL OR expires_at > NOW()), and 24 items pagination in lib/deals.ts
- [ ] T012 [P] [US1] Create deal card component displaying image, title, brand, strikethrough original price, discounted price, percentage discount badge, merchant name, and date badge in components/deal-card.tsx
- [ ] T013 [P] [US1] Create responsive deal grid component (1 column mobile, 2 columns tablet, 3-4 columns desktop) with empty state in components/deal-grid.tsx
- [ ] T014 [P] [US1] Create numbered pagination component with previous/next controls and page number links (?page=X) in components/pagination.tsx
- [ ] T015 [US1] Implement main catalog page Server Component in app/(catalog)/page.tsx integrating getCatalogDeals, DealGrid, and Pagination

**Checkpoint**: User Story 1 (MVP) fonctionnelle et testable de manière autonome.

---

## Phase 4: User Story 2 - Filtrer par catégorie, rechercher par mot-clé et trier les offres (Priority: P2)

**Goal**: Offrir le filtrage exclusif par catégorie (raquettes, cordages, chaussures, textile, accessoires), la recherche instantanée par mot-clé (titre, marque) et le tri par réduction ou date d'ajout.

**Independent Test**: Cliquer sur le filtre "Chaussures", taper une marque dans la recherche et ordonner par "Plus forte réduction", puis vérifier la synchronisation des paramètres d'URL et des résultats.

### Tests for User Story 2
- [ ] T016 [P] [US2] Create unit tests for search query sanitization and category filter matching in tests/unit/filters.test.ts

### Implementation for User Story 2
- [ ] T017 [US2] Update getCatalogDeals in lib/deals.ts to support category filtering, case-insensitive ILIKE search on title and brand, and sort selection (newest vs discount)
- [ ] T018 [P] [US2] Create category filter component with horizontal scrolling pills and active state indicators in components/category-filter.tsx
- [ ] T019 [P] [US2] Create debounced instant search bar component updating URL search parameter q in components/search-bar.tsx
- [ ] T020 [P] [US2] Create sort dropdown selector component allowing toggle between Nouveautés and Plus forte réduction in components/sort-dropdown.tsx
- [ ] T021 [US2] Integrate CategoryFilter, SearchBar, and SortDropdown into the catalog page header with URL search parameters synchronization in app/(catalog)/page.tsx

**Checkpoint**: User Stories 1 et 2 complètement intégrées et testables de façon indépendante.

---

## Phase 5: User Story 3 - Redirection trackée vers le marchand partenaire (Priority: P3)

**Goal**: Intermédier les sorties marchandes via `/go/:dealId`, enregistrer l'événement de clic de manière anonyme dans Neon, et rediriger avec HTTP 307 vers le lien d'affiliation.

**Independent Test**: Cliquer sur "Voir le bon plan" d'une offre active, vérifier la réponse HTTP 307 vers l'URL marchande et contrôler l'insertion de l'enregistrement dans la table `click_events`.

### Tests for User Story 3
- [ ] T022 [P] [US3] Create unit tests for device type resolution (mobile, desktop, tablet, unknown) from User-Agent in tests/unit/tracking.test.ts
- [ ] T023 [P] [US3] Create contract tests for route handler /go/[dealId] verifying HTTP 307 status, Location header, no-store cache control, and click logging in tests/contract/redirection.test.ts

### Implementation for User Story 3
- [ ] T024 [US3] Implement device resolution helper and click event insertion function recordClickEvent in lib/tracking.ts
- [ ] T025 [US3] Implement internal redirection Route Handler GET /go/[dealId] looking up affiliate_url, logging click to click_events, and returning HTTP 307 Temporary Redirect in app/go/[dealId]/route.ts
- [ ] T026 [US3] Update components/deal-card.tsx action button and links to target /go/[dealId] instead of direct external URLs

**Checkpoint**: Parcours complet de consultation, clic et redirection trackée opérationnel.

---

## Phase 6: User Story 4 - Éviction automatique des offres obsolètes ou expirées (Priority: P4)

**Goal**: Garantir qu'aucune offre expirée n'apparaisse dans le catalogue et orienter avec notification les internautes qui suivent un lien de redirection d'une offre caduque.

**Independent Test**: Tenter d'accéder à `/go/:expiredDealId` et vérifier la redirection automatique vers `/?notification=deal-expired` avec affichage d'un bandeau informatif non-bloquant.

### Tests for User Story 4
- [ ] T027 [P] [US4] Create contract test for /go/[dealId] verifying redirection to /?notification=deal-expired for expired deals in tests/contract/expiration.test.ts

### Implementation for User Story 4
- [ ] T028 [US4] Update /go/[dealId] Route Handler in app/go/[dealId]/route.ts to detect expired deals (expires_at <= NOW() or status != 'active') and redirect to /?notification=deal-expired
- [ ] T029 [P] [US4] Create dismissible notification banner component displaying user-friendly alert when ?notification=deal-expired is present in components/notification-banner.tsx
- [ ] T030 [US4] Integrate NotificationBanner into app/(catalog)/page.tsx
- [ ] T031 [P] [US4] Document n8n hourly eviction SQL cron script and ingestion payload examples in scripts/automation/n8n-eviction-cron.sql

**Checkpoint**: Fiabilité et fraîcheur du catalogue 100% assurées sans intervention manuelle.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Améliorations transversales, gestion des cas limites et validation finale.

- [ ] T032 [P] Add broken image fallback handling with category placeholder SVG in components/deal-card.tsx
- [ ] T033 [P] Create end-to-end integration test suite verifying catalog browsing, search, filtering, and redirection in tests/e2e/catalog.spec.ts
- [ ] T034 Execute quickstart validation scenarios from quickstart.md and verify all acceptance criteria

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Aucune dépendance - démarrage immédiat.
- **Foundational (Phase 2)**: Dépend de la Phase 1 - BLOQUE toutes les User Stories.
- **User Story 1 (Phase 3)**: Dépend de la Phase 2 (Foundational). Constitue le MVP.
- **User Story 2 (Phase 4)**: Dépend de la Phase 2 (Foundational). S'interface avec US1 (`getCatalogDeals`, `page.tsx`).
- **User Story 3 (Phase 5)**: Dépend de la Phase 2 (Foundational) et de la carte d'offre US1.
- **User Story 4 (Phase 6)**: Dépend de US1 (page catalogue) et US3 (route handler de redirection).
- **Polish (Phase 7)**: Dépend de l'achèvement de toutes les User Stories.

### Parallel Opportunities

- **Phase 1**: T002 et T003 peuvent être exécutés en parallèle après T001.
- **Phase 2**: T005, T006 et T008 peuvent être réalisés en parallèle de T004 et T007.
- **Phase 3 (US1)**: T009 et T010 (tests) peuvent s'écrire en parallèle ; T012, T013 et T014 (composants UI) peuvent être développés en parallèle.
- **Phase 4 (US2)**: T018, T019 et T020 (composants de filtre, recherche et tri) peuvent être réalisés en parallèle.
- **Phase 5 (US3)**: T022 et T023 (tests) peuvent s'exécuter en parallèle de T024.
- **Phase 6 (US4)**: T027, T029 et T031 peuvent s'exécuter en parallèle.

---

## Implementation Strategy

### MVP First (User Story 1 Only)
1. Exécuter Phase 1 (Setup : Next.js + Tailwind + Neon client).
2. Exécuter Phase 2 (Foundational : migrations SQL + seed + types).
3. Exécuter Phase 3 (User Story 1 : `getCatalogDeals` + `DealCard` + `Pagination` + `page.tsx`).
4. **Validation du MVP** : Le site affiche les 24 bons plans de tennis par page avec navigation.

### Incremental Delivery
1. **Incrément 1 (MVP)** : Catalogue paginé fonctionnel (US1).
2. **Incrément 2** : Filtres par catégorie, recherche instantanée et tris (US2).
3. **Incrément 3** : Redirection trackée `/go/:dealId` avec conformité RGPD (US3).
4. **Incrément 4** : Éviction automatique et notification d'expiration (US4).
5. **Incrément 5** : Polish visuel, fallbacks d'images et tests E2E.
