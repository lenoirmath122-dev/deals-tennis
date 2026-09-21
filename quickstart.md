# Quickstart & Validation Guide: Tennis Deals Catalog

**Feature**: `001-tennis-deals-catalog`
**Purpose**: Scénarios de vérification et d'exécution de bout en bout pour tester le catalogue de bons plans, les filtres, la recherche, et la redirection trackée.

---

## 1. Prérequis & Configuration de l'environnement

### Variables d'environnement requises (`.env.local`)
```ini
DATABASE_URL=postgres://<user>:<password>@<endpoint>.eu-central-1.aws.neon.tech/neondb?sslmode=require
```

### Initialisation locale
```bash
# Installation des dépendances du projet
npm install

# Initialisation du schéma de base de données (migration SQL)
# Exécuter les instructions DDL de data-model.md dans la console SQL de Neon ou via psql

# Insertion d'un jeu de données de test (seed)
npm run seed:test-deals
```

---

## 2. Scénarios de Validation de Bout en Bout

### Scénario 1 : Consultation du catalogue & Affichage par défaut (User Story 1 & FR-001, FR-002, FR-004)
1. **Lancement du serveur** : `npm run dev`
2. **Accès** : Ouvrir `http://localhost:3000`
3. **Résultat attendu** :
   - La grille affiche 24 cartes d'offres ordonnées par date d'ajout décroissante.
   - Chaque carte affiche : visuel produit, désignation, marque, prix barré, prix remisé, badge de pourcentage (ex: `-35%`), logo/nom du marchand, et date de publication.
   - La pagination en bas de page indique le nombre de pages totales et permet de naviguer vers `?page=2`.

### Scénario 2 : Filtrage par catégorie et Recherche par mot-clé (User Story 2 & FR-003)
1. **Filtrage par catégorie** : Cliquer sur le filtre "Chaussures".
   - **Résultat attendu** : L'URL se met à jour vers `/?category=chaussures` ; seules les chaussures apparaissent ; le compteur de résultats reflète le sous-ensemble.
2. **Recherche instantanée** : Taper "Babolat" dans la barre de recherche.
   - **Résultat attendu** : L'URL inclut `&q=Babolat` ; seules les offres Babolat de la catégorie sélectionnée sont présentées.
3. **Tri par réduction** : Sélectionner "Plus forte réduction" dans le menu déroulant.
   - **Résultat attendu** : L'offre avec le pourcentage de réduction le plus important apparaît en tête.

### Scénario 3 : Redirection interne et tracking de clic (User Story 3 & FR-006, FR-007)
1. **Action** : Sur une carte de bon plan valide (ex: deal `11111111-1111-1111-1111-111111111111`), cliquer sur le bouton "Voir le bon plan".
2. **Comportement réseau** :
   - Le navigateur appelle `GET /go/11111111-1111-1111-1111-111111111111`.
   - Le serveur consigne une nouvelle ligne dans la table `click_events` avec le `deal_id`, l'horodatage UTC, le `device_type` et le `referrer_url`.
   - Le serveur renvoie un statut HTTP `307 Temporary Redirect` avec `Location: <url_affiliation_marchand>`.
3. **Vérification en base** :
   ```sql
   SELECT * FROM click_events WHERE deal_id = '11111111-1111-1111-1111-111111111111' ORDER BY clicked_at DESC LIMIT 1;
   ```
   - Vérifier la présence de la ligne et l'absence totale d'adresse IP enregistrée.

### Scénario 4 : Gestion d'une offre expirée (User Story 4 & FR-005, FR-010)
1. **Éviction de l'affichage** :
   - Configurer une offre de test avec `expires_at = NOW() - INTERVAL '1 hour'`.
   - Recharger `http://localhost:3000`.
   - **Résultat attendu** : L'offre est absente du catalogue et de tous les filtres.
2. **Accès direct par URL de redirection** :
   - Tenter d'accéder directement à `/go/<id_offre_expiree>`.
   - **Résultat attendu** : Le serveur effectue une redirection `307` vers `/?notification=deal-expired`.
   - La page d'accueil affiche une bannière d'information temporaire : *"Cette offre a expiré, découvrez nos bons plans actuels"*.

---

## 3. Commandes de Test Automatisées

```bash
# Exécution des tests unitaires et de contrats (API routes & utilitaires de filtrage)
npm test

# Exécution des tests end-to-end (Playwright)
npm run test:e2e
```
