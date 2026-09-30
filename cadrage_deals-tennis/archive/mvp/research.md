# Technical Research & Architecture Decisions: Tennis Deals Catalog

**Feature**: `001-tennis-deals-catalog`
**Date**: 2026-09-20
**Constitution Reference**: v1.0.0 (Workflows n8n, Gratuité pérenne, Découplage strict, Redirection interne, Éviction automatique)

---

## 1. Web Application & Rendering Framework

### Decision
Adopter **Next.js 14+ (App Router) avec TypeScript et Tailwind CSS**.

### Rationale
- **Rendu hybride & SEO** : Les pages de catalogue sont rendues côté serveur (React Server Components) avec streaming, assurant un chargement initial quasi-instantané (<1,5s), un score Core Web Vitals optimal et une indexation native des pages de résultats (`?page=X`, `?category=raquettes`) sans bundle JavaScript client superflu.
- **Route Handlers intégrés pour la redirection** : La redirection trackée `/go/[dealId]` s'exécute nativement via un Route Handler serveur (`app/go/[dealId]/route.ts`), permettant de consigner l'événement en base et d'effectuer la redirection HTTP 307 sans latence client.
- **Hébergement pérenne 100% gratuit** : Déploiement sans frais sur Vercel (Hobby plan) ou Cloudflare Pages, parfaitement aligné avec le Principe II (Coût minimal pérenne).

### Alternatives considered
- *Astro* : Excellent pour le contenu statique, mais nécessite une configuration hybride plus complexe pour la route dynamique de redirection et l'intégration des filtres interactifs instantanés.
- *Single Page Application (Vite + React)* : Rejetée car mauvaise indexation SEO par défaut et temps de chargement initial dépendant du téléchargement du bundle JavaScript.

---

## 2. Database & Data Storage

### Decision
Utiliser **Neon (PostgreSQL Serverless sur palier gratuit)**.

### Rationale
- **Palier gratuit pérenne (Free Tier)** : Neon offre 0,5 GiB de stockage PostgreSQL, du calcul serverless sans coût fixe, et le branching de base de données instantané, amplement suffisant pour stocker des dizaines de milliers de bons plans et des millions d'événements de clics.
- **Intégration directe et universelle n8n** : Neon est un PostgreSQL standard accessible via une URL de connexion classique (`postgres://...`). Le nœud officiel PostgreSQL de n8n s'y connecte nativement sans aucune couche d'adaptation ni API propriétaire.
- **Driver serverless ultra-rapide côté Next.js** : Le driver `@neondatabase/serverless` permet d'exécuter des requêtes SQL ultra-rapides via HTTP/WebSockets sans épuiser le pool de connexions lors des montées en charge serveur ou serverless.
- **Sécurité et étanchéité** : La base de données est exclusivement interrogée côté serveur (Server Components Next.js et Route Handlers) via la variable d'environnement secrète `DATABASE_URL`. Aucune exposition directe de la base au navigateur client n'est nécessaire, assurant un découplage optimal.

### Alternatives considered
- *Supabase* : Rejeté sur demande utilisateur au profit de Neon pour une gestion plus pure et standardisée de PostgreSQL sans surcouches d'authentification ou d'API PostgREST inutilisées en V1.
- *Turso (libSQL/SQLite)* : Très rapide sur l'edge, mais intégration moins directe avec les nœuds natifs de n8n par rapport à un PostgreSQL standard.
- *Firebase / Firestore* : Rejeté pour les besoins de requêtage relationnel complexe (jointures marchands, filtres combinés, tris multi-critères, pagination par curseur/offset).

---

## 3. Redirection & Click Tracking Architecture

### Decision
Mettre en œuvre un endpoint serveur dédié `GET /go/[dealId]` dans Next.js effectuant une redirection HTTP 307 (Temporary Redirect) couplée à une journalisation asynchrone dans la table `click_events`.

### Rationale
- **Indépendance d'affiliation (Principe IV)** : Les balises HTML du site n'exposent que des liens internes `/go/123`. Si le réseau d'affiliation change (ex: bascule de Kwanko vers Awin ou direct), seule l'URL marchande en base de données est modifiée sans impact sur le code ou les liens indexés.
- **Respect strict du RGPD (Zéro cookie traceur)** : Les données enregistrées se limitent à : `deal_id`, `clicked_at` (UTC), `device_type` (détecté via l'en-tête `user-agent`: mobile vs desktop) et `referrer_url` (en-tête `referer`). Aucune adresse IP n'est conservée. Aucun bandeau de consentement n'est requis.
- **Gestion des offres expirées (FR-010)** : Si le `dealId` correspond à une offre expirée (`expires_at < NOW()` ou `status != 'active'`), le handler redirige vers la page d'accueil avec le paramètre `/?notification=deal-expired`.

### Alternatives considered
- *Tracking client (JavaScript `fetch` au clic)* : Rejeté car les bloqueurs de publicité (AdBlock, uBlock) peuvent intercepter l'appel de suivi ou bloquer le lien sortant.
- *Redirection 301 (Permanent Redirect)* : Rejetée car mise en cache par les navigateurs, empêchant le comptage des clics ultérieurs et empêchant la détection d'une expiration future.

---

## 4. Ingestion & Synchronization Contract (Workflows n8n)

### Decision
Définir un contrat d'échange standardisé en base de données où les workflows n8n écrivent directement via SQL / connexion PostgreSQL Neon.

### Rationale
- **Respect du Principe I (Automatisation maximale) & III (Découplage strict)** : L'application web ne contient aucune tâche planifiée ni script de collecte.
- **Flux n8n planifiés** :
  1. *Workflow Ingestion* : Collecte des flux partenaires, calcul de la remise (`round(((original_price - discounted_price) / original_price) * 100)`), validation des champs obligatoires et insertion/mise à jour `upsert` dans `deals`.
  2. *Workflow Éviction (Expirations)* : Workflow cron exécuté toutes les heures effectuant :
     ```sql
     UPDATE deals SET status = 'expired', updated_at = NOW() 
     WHERE (expires_at <= NOW() OR is_active = false) AND status = 'active';
     ```
- **Remplacement aisé** : Si le moteur d'ingestion évolue ultérieurement (ex: n8n vers Python crawler ou Make), le site web n'a pas besoin d'être modifié dès lors que le schéma de table est respecté.

---

## 5. Frontend UI & Experience

### Decision
Interface épurée, responsive (mobile-first) utilisant **Tailwind CSS**, avec :
- Header avec identité visuelle tennis (tons vert court / blanc / orange terre battue), barre de recherche instantanée (débouncée à 250ms).
- Barre de filtres par catégorie sous forme de pilules/onglets horizontaux défilables sur mobile.
- Sélecteur de tri contextuel (*Nouveautés* par défaut, *Plus forte réduction*).
- Grille de cartes réactives (1 col mobile, 2 col tablette, 3-4 col desktop) avec visuel produit optimisé (ratio 1:1 avec `object-contain`), pastille pourcentage de réduction rouge/orange contrastée, prix barré gris, prix actuel en gras, enseigne partenaire et badge de fraîcheur.
- Pagination numérotée en bas de liste synchronisée avec l'historique de navigation du navigateur (`window.history` / paramètres de recherche Next.js).
- Toast / bannière de notification non-intrusive en cas de redirection d'offre expirée.
