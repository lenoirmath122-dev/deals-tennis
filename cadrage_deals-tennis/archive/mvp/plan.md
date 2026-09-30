# Implementation Plan: Tennis Deals Catalog

**Branch**: `001-tennis-deals-catalog` | **Date**: 2026-09-20 | **Spec**: [spec.md](file:///C:/Users/lenoi/mon-projet/specs/001-tennis-deals-catalog/spec.md)

**Input**: Feature specification from `specs/001-tennis-deals-catalog/spec.md`

---

## Summary

Mettre en place une application web ultra-légère, rapide et responsive dédiée au référencement des promotions d'équipements de tennis (raquettes, cordages, chaussures, textile, accessoires).
L'architecture repose sur un frontend Next.js (App Router, TypeScript, Tailwind CSS) déployé gratuitement (Vercel ou Cloudflare Pages), lisant une base de données PostgreSQL managée (Neon Serverless Free Tier) alimentée de manière asynchrone par des workflows n8n autonomes. L'application intègre le filtrage par catégorie, la recherche par mot-clé, le tri par nouveautés ou réduction, une pagination numérotée indexable (`?page=X`), et un routeur interne de redirection (`/go/[dealId]`) consignant les clics à des fins d'affiliation dans le respect du RGPD.

---

## Technical Context

**Language/Version**: TypeScript 5+ / Node.js 20+

**Primary Dependencies**: Next.js 14+ (App Router), React 18+, Tailwind CSS, `@neondatabase/serverless`, Lucide React

**Storage**: PostgreSQL (Neon Serverless Free Tier - 0,5 GiB, calcul serverless sans coût fixe)

**Testing**: Vitest (tests unitaires et de contrats), Playwright (tests E2E de navigation et redirection)

**Target Platform**: Web (Vercel / Cloudflare Pages Free Tier), conception mobile-first

**Project Type**: Web Application (React Server Components + Route Handlers API)

**Performance Goals**: Temps de chargement initial < 1,5s (4G), réactivité du filtrage < 150ms, redirection < 200ms

**Constraints**:
- Coût d'infrastructure fixe nul (100% services à palier gratuit pérenne - Principe II de la Constitution).
- Aucune collecte de données personnelles ni adresse IP pour le tracking (100% conforme RGPD sans bandeau cookies - Principe IV).
- Couche d'affichage fine totalement découplée de l'ingestion (Principe III).
- Aucune interface d'administration manuelle requise en V1 (Principe I).

**Scale/Scope**: Catalogue de 500+ bons plans actifs, pagination à 24 offres par page, 5 catégories de matériel.

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principe Constitutionnel | Statut | Justification & Preuve d'alignement |
|---|:---:|---|
| **I. Automatisation Maximale (n8n)** | **PASS** | Le site web ne contient aucune logique de scraping ni d'administration manuelle. Les workflows n8n injectent les données directement dans Neon et gèrent le cron horaire d'éviction des expirations. |
| **II. Coût Minimal (Palier gratuit)** | **PASS** | Hébergement sur Vercel Hobby (0€) + base Neon Serverless Free Tier (0€) + n8n auto-hébergé sur offre gratuite pérenne. Dépense opérationnelle = 0,00 €. |
| **III. Simplicité et Découplage** | **PASS** | Le site web est une couche de présentation pure lisant des données structurées. Si l'outil d'ingestion change, le site ne subit aucun impact. |
| **IV. Traçabilité de l'Affiliation** | **PASS** | Redirection interne systématique `/go/[dealId]` masquant les liens d'affiliation bruts et enregistrant les événements de clics de façon anonyme. |
| **V. Qualité et Fraîcheur des Données** | **PASS** | Les offres expirées ou inactives sont immédiatement exclues des requêtes d'affichage et bloquées à la redirection avec renvoi d'une notification informative. |

---

## Project Structure

### Documentation (this feature)

```text
specs/001-tennis-deals-catalog/
├── spec.md              # Spécification fonctionnelle et clarifications validées
├── plan.md              # Ce document (plan d'architecture et de mise en œuvre)
├── research.md          # Décisions techniques, choix d'infrastructure et comparatifs
├── data-model.md        # Schéma PostgreSQL, contraintes, index et politiques RLS
├── quickstart.md        # Guide d'exécution et scénarios de validation pas-à-pas
├── contracts/           # Contrats d'interfaces
│   ├── redirection-api.md      # Spécification de l'endpoint /go/:dealId
│   ├── catalog-query-api.md    # Contrat d'interrogation et de filtrage du catalogue
│   └── ingestion-contract.md   # Contrat d'échange pour les workflows n8n
└── checklists/
    └── requirements.md  # Checklist de conformité de la spécification
```

### Source Code (repository root)

```text
app/
├── (catalog)/
│   └── page.tsx                # Page principale du catalogue (Server Component SSR)
├── go/
│   └── [dealId]/
│       └── route.ts            # Route Handler de redirection interne et log du clic
├── layout.tsx                  # Enveloppe racine (polices, métadonnées SEO, balises)
└── globals.css                 # Configuration et directives Tailwind CSS

components/
├── deal-card.tsx               # Vignette produit (image, prix, % remise, marchand, date)
├── deal-grid.tsx               # Grille réactive d'affichage des offres
├── category-filter.tsx         # Barre de filtres horizontaux par catégorie
├── search-bar.tsx              # Barre de recherche instantanée par mot-clé (titre / marque)
├── sort-dropdown.tsx           # Menu déroulant de tri (Nouveautés / Plus forte remise)
├── pagination.tsx              # Composant de pagination numérotée (?page=X)
└── notification-banner.tsx     # Message informatif temporaire (ex: offre expirée)

lib/
├── db.ts                       # Client d'accès Neon Serverless PostgreSQL typé
├── deals.ts                    # Fonctions d'interrogation et filtrage du catalogue
└── tracking.ts                 # Détection légère mobile/desktop et insertion du clic

types/
└── database.ts                 # Interfaces TypeScript dérivées du schéma de base

tests/
├── unit/
│   ├── tracking.test.ts        # Tests de détection de device_type et conformité
│   └── deals.test.ts           # Tests de calculs de remises et filtres
├── contract/
│   └── redirection.test.ts     # Tests de la route /go/[dealId] (307, log, expiration)
└── e2e/
    └── catalog.spec.ts         # Tests de navigation, filtres, recherche et clics
```

**Structure Decision**: Architecture applicative Next.js standard sous la racine du projet avec séparation stricte des composants de présentation (`components/`), de la logique de données (`lib/`), des endpoints serveurs (`app/go/`) et des types (`types/`).

---

## Complexity Tracking

> Aucune dérogation ou violation de la constitution. L'ensemble des critères de simplicité, gratuité, découplage et automatisation sont respectés.
