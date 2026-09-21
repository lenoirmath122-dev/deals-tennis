# Feature Specification: Tennis Deals Catalog

**Feature Branch**: `001-tennis-deals-catalog`

**Created**: 2026-09-20

**Status**: Draft

**Input**: User description: "Construire un site qui répertorie des promotions sur des articles de tennis (raquettes, cordages, chaussures, textile, accessoires). Pour cette première version (V1) : Un visiteur peut parcourir une liste de bons plans, filtrable par catégorie et triable par pourcentage de réduction ou date d'ajout. Chaque bon plan affiche : photo, nom du produit, marque, prix avant/après réduction, pourcentage de réduction, nom du marchand, et une indication de fraîcheur (date d'ajout ou d'expiration). Cliquer sur un bon plan redirige le visiteur vers le site marchand via un lien d'affiliation, et cet événement de clic est enregistré pour le suivi de performance. Les bons plans sont ajoutés et retirés du site via une base de données alimentée par des workflows d'automatisation externes ; aucune interface d'administration manuelle n'est nécessaire en V1. Un bon plan est automatiquement masqué dès qu'il dépasse sa date d'expiration ou qu'il est marqué invalide. Le site reste rapide et utilisable même avec plusieurs centaines de bons plans actifs. Hors périmètre pour cette V1 : scraping automatique multi-sites, comparatif de prix historique, notifications aux utilisateurs, comptes utilisateurs et favoris."

## Clarifications

### Session 2026-09-20
- Q: Quel mode de navigation et de chargement des résultats souhaitez-vous adopter pour parcourir les centaines de bons plans du catalogue ? (FR-009) → A: Pagination classique numérotée (24 offres par page avec sélecteur de pages et URLs indexables `?page=X`).
- Q: Quelles informations précises doivent être enregistrées lors de chaque clic de redirection vers un marchand partenaire ? (FR-007) → A: Données d'analyse enrichies et anonymes (ID du bon plan, horodatage UTC, type d'appareil mobile/desktop, URL référente interne, sans stockage d'adresse IP ni donnée nominative).
- Q: Souhaitez-vous intégrer une barre de recherche textuelle par mot-clé (modèle, marque) dès la V1 en complément du filtre par catégorie ? (FR-003) → A: Oui (Option B : champ de recherche textuelle instantanée filtrant sur le titre du produit et la marque).
- Q: Quel comportement le site doit-il adopter lorsqu'un internaute suit le lien de redirection d'une offre devenue expirée ? (FR-010) → A: Option A (Redirection automatique vers la page d'accueil avec un message informatif signalant que l'offre a expiré).
- Q: Quel critère de tri doit être appliqué par défaut lors de l'arrivée d'un visiteur sur la page d'accueil ? (FR-004) → A: Option A (Date d'ajout décroissante par défaut, mettant en avant la fraîcheur et les nouveautés du catalogue).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Parcourir et consulter les bons plans actifs (Priority: P1)

En tant que passionné ou pratiquant de tennis, je souhaite accéder à une sélection claire et attrayante des promotions actuellement valides sur les équipements de tennis afin de repérer rapidement les opportunités d'achat avantageuses.

**Why this priority**: C'est la proposition de valeur fondamentale du site. Sans une présentation fluide, lisible et complète des offres disponibles, les visiteurs ne peuvent pas trouver d'intérêt au service.

**Independent Test**: Accessible directement sur la page d'accueil ; en présence de données valides en base, le visiteur visualise immédiatement les cartes d'offres complètes avec tous les attributs requis (visuel, titre, marque, prix barré, prix remisé, pourcentage d'économie, marchand et fraîcheur).

**Acceptance Scenarios**:

1. **Given** un ensemble de bons plans actifs enregistrés dans la base de données, **When** le visiteur charge la page principale, **Then** les cartes de bons plans s'affichent ordonnées par défaut par date d'ajout décroissante (nouveautés en premier) avec leur image, le titre du produit, la marque, le prix initial barré, le prix remisé, le taux de réduction calculé, l'enseigne marchande et l'indicateur de fraîcheur (date d'ajout ou d'expiration).
2. **Given** un mélange de bons plans actifs et d'offres expirées ou désactivées en base, **When** le visiteur parcourt le catalogue, **Then** seules les offres valides et non expirées sont visibles.

---

### User Story 2 - Filtrer par catégorie d'équipement, rechercher par mot-clé et trier les offres (Priority: P2)

En tant que joueur ayant un besoin précis (par exemple rechercher un modèle particulier comme "Pure Drive" ou filtrer les chaussures), je souhaite rechercher par mot-clé, filtrer par catégorie et réordonner la liste par ordre de réduction ou de nouveauté pour identifier rapidement l'offre idéale.

**Why this priority**: Les pratiquants de tennis ont des besoins segmentés par matériel ou ciblent une référence spécifique. Permettre le tri, le filtrage et la recherche par mot-clé optimise immédiatement l'expérience de découverte et maximise les chances de conversion.

**Independent Test**: Saisir un nom de modèle/marque filtre instantanément la liste ; cliquer sur un filtre de catégorie (ex: "Chaussures") restreint l'affichage uniquement aux articles de cette catégorie ; sélectionner le tri "Plus forte réduction" réordonne les offres de la remise la plus élevée à la plus faible.

**Acceptance Scenarios**:

1. **Given** un catalogue contenant des articles de différentes catégories, **When** le visiteur clique sur une catégorie spécifique (ex: "Raquettes"), **Then** seuls les bons plans appartenant à cette catégorie sont présentés.
2. **Given** un catalogue d'offres, **When** le visiteur saisit une requête dans le champ de recherche textuelle (ex: "Babolat" ou "Vapor"), **Then** seules les offres dont le nom de produit ou la marque contient la chaîne saisie sont affichées.
3. **Given** une sélection d'offres affichées, **When** le visiteur applique le critère de tri "Pourcentage de réduction", **Then** les offres sont instantanément ordonnées du pourcentage de remise le plus fort au plus faible.
4. **Given** une sélection d'offres affichées, **When** le visiteur applique le critère de tri "Date d'ajout", **Then** les offres les plus récemment intégrées apparaissent en premier.
5. **Given** un filtre ou une recherche active, **When** le visiteur sélectionne "Toutes les catégories" ou efface sa recherche, **Then** l'ensemble des offres actives est de nouveau visible sans réinitialiser le tri en cours.

---

### User Story 3 - Redirection trackée vers le marchand partenaire (Priority: P3)

En tant que visiteur intéressé par une promotion, je souhaite cliquer sur l'offre pour être redirigé directement vers la fiche produit du marchand partenaire, tandis que la plateforme comptabilise l'événement de redirection pour mesurer la performance de la recommandation.

**Why this priority**: C'est le moteur de monétisation du site et la concrétisation du parcours utilisateur vers l'achat, dans le respect de l'indépendance d'affiliation prescrite par la constitution du projet.

**Independent Test**: Cliquer sur le bouton d'action d'une offre déclenche l'appel de l'URL de redirection interne, journalise le clic pour l'offre concernée, et oriente le navigateur vers l'URL marchande ciblée avec ses paramètres partenaires.

**Acceptance Scenarios**:

1. **Given** un bon plan actif doté d'une URL marchande d'affiliation, **When** le visiteur clique sur le bon plan ou son bouton d'action, **Then** un événement de clic est consigné avec l'identifiant du bon plan et l'horodatage, puis le visiteur est redirigé de façon transparente vers la boutique marchande.
2. **Given** un clic sur une offre, **When** la redirection s'opère, **Then** le délai de transit est quasi instantané et n'expose jamais les paramètres bruts d'affiliation dans les liens statiques de la page.

---

### User Story 4 - Éviction automatique des offres obsolètes ou expirées (Priority: P4)

En tant que visiteur, je souhaite avoir la certitude que toutes les offres affichées sont réellement en cours de validité, afin de ne jamais être déçu par une promotion déjà terminée sur le site marchand.

**Why this priority**: La qualité et la fraîcheur des données sont non négociables (Principe V de la constitution) pour instaurer une confiance durable avec l'audience.

**Independent Test**: Configurer en base une offre dont la date de fin de validité est échue ; vérifier qu'elle n'est plus accessible dans le catalogue et qu'une tentative d'accès à son lien de redirection renvoie un état d'expiration informatif.

**Acceptance Scenarios**:

1. **Given** une offre dont la date de fin de validité est dépassée, **When** le visiteur consulte la liste des offres, **Then** cette offre est automatiquement absente des résultats affichés.
2. **Given** un bon plan marqué comme désactivé ou invalide suite à un contrôle automatisé, **When** la page est actualisée, **Then** le bon plan n'apparaît plus à l'écran.
3. **Given** un lien de redirection direct vers une offre désormais expirée ou introuvable, **When** un internaute suit ce lien, **Then** le système le redirige automatiquement vers la page d'accueil du catalogue et affiche un message informatif temporaire signalant que la promotion est expirée.

---

### Edge Cases

- **Catégorie sans offre active** : Si une catégorie ne contient aucune offre valide au moment de la visite, le système affiche un état vide explicite et bienveillant invitant à explorer les autres catégories ou à réinitialiser le filtre.
- **Rupture de visuel produit** : Si l'URL de la photo du produit est inaccessible ou indisponible, une image de remplacement soignée (placeholder thématique selon la catégorie) est affichée pour maintenir l'harmonie visuelle.
- **Catalogue volumineux (> 500 offres)** : L'affichage est découpé en pages numérotées de 24 offres chacune, garantissant un temps de chargement initial inférieur à 1,5 seconde et permettant un partage ou une indexation directe de chaque page via l'URL (ex: `?page=2`).
- **Offre sans date d'expiration déterminée** : Si le marchand ne communique pas de date de fin, la mention "Ajouté récemment" ou la date d'ajout est mise en avant pour indiquer la fraîcheur, l'offre restant active tant qu'elle n'est pas invalidée par les flux automatisés.
- **Lien marchand défaillant** : En cas d'anomalie sur le lien cible d'une offre lors de la redirection, le système consigne l'erreur et redirige l'internaute vers la page d'accueil ou la boutique générale du partenaire avec une notification informative.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Le système DOIT proposer une page de consultation publique des bons plans de tennis, accessible sans compte utilisateur ni barrière d'accès.
- **FR-002**: Chaque vignette d'offre affichée DOIT présenter obligatoirement : le visuel du produit, le nom du produit, la marque, le prix initial barré, le prix remisé, le pourcentage d'économie calculé, le nom de l'enseigne marchande et un indicateur temporel de fraîcheur (date d'ajout ou date d'expiration).
- **FR-003**: Le système DOIT supporter le filtrage par catégorie d'équipement (Raquettes, Cordages, Chaussures, Textile, Accessoires, ou "Toutes") ainsi qu'un champ de recherche textuelle par mot-clé filtrant dynamiquement sur la désignation du produit et la marque.
- **FR-004**: Le système DOIT appliquer par défaut un tri par date d'ajout décroissante (offres les plus récentes en premier pour valoriser la fraîcheur du catalogue) et permettre à l'internaute de basculer vers un tri par pourcentage de réduction décroissant (meilleures remises en premier).
- **FR-005**: Le système DOIT masquer automatiquement et immédiatement de l'affichage public toute offre dont la date d'expiration est antérieure à la date/heure actuelle, ou dont l'indicateur de validité est à faux.
- **FR-006**: Le système DOIT intermédier chaque sortie vers un site marchand via un endpoint interne de redirection (ex: `/go/:dealId`), sans jamais exposer de lien d'affiliation direct dans les attributs HTML publics du catalogue.
- **FR-007**: Le système DOIT enregistrer et horodater chaque événement de redirection en capturant l'identifiant du bon plan, l'horodatage UTC, le type d'appareil (mobile ou desktop) et l'URL référente interne, sans collecter d'adresse IP ni de donnée nominative, garantissant une conformité RGPD intégrale sans nécessiter de bandeau cookies.
- **FR-008**: Le système DOIT lire les offres depuis une source de données partagée mise à jour de manière asynchrone par des workflows d'automatisation externes, sans nécessiter d'interface d'administration interactive en V1.
- **FR-009**: Le système DOIT structurer la navigation du catalogue sous forme de pagination numérotée classique (24 offres par page) avec sélection de page et synchronisation des paramètres d'URL (ex: `?page=X`), assurant une navigation fluide et indexable sur un catalogue de plus de 500 offres actives.
- **FR-010**: En cas d'accès direct à une URL de redirection d'offre expirée ou introuvable (`/go/:dealId`), le système DOIT rediriger automatiquement l'internaute vers la page d'accueil du catalogue et afficher une notification temporaire l'informant de l'expiration du bon plan, plutôt que de renvoyer une page d'erreur technique brute.

### Key Entities

- **Deal (Bon plan)**:
  - Entité principale représentant l'offre promotionnelle.
  - Attributs fonctionnels : identifiant unique, désignation du produit, marque, catégorie d'équipement, visuel du produit, prix de référence, prix promotionnel, pourcentage de remise, enseigne marchande associée, lien d'affiliation cible, date d'ajout dans le catalogue, date de fin de validité (facultative), statut d'activation (actif/inactif).
- **Category (Catégorie d'équipement)**:
  - Représente la typologie de matériel de tennis.
  - Valeurs V1 : `Raquettes`, `Cordages`, `Chaussures`, `Textile`, `Accessoires`.
- **Merchant (Enseigne marchande)**:
  - Représente la boutique partenaire hébergeant l'offre promotionnelle.
  - Attributs fonctionnels : nom de l'enseigne, identifiant marchand, logo/badge associé.
- **ClickEvent (Événement de clic)**:
  - Représente l'activation d'une redirection d'affiliation par un internaute.
  - Attributs fonctionnels : identifiant unique d'événement, identifiant du bon plan (`deal_id`), horodatage UTC (`clicked_at`), type d'appareil (`device_type`: mobile/desktop), URL référente interne (`referrer_url`). Aucune adresse IP ni empreinte personnelle persistante.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Le temps de chargement initial du catalogue est inférieur à 1,5 seconde sur une connexion mobile standard (4G).
- **SC-002**: L'application met à jour l'affichage en moins de 150 millisecondes lors d'un changement de filtre de catégorie ou de critère de tri.
- **SC-003**: 100% des bons plans expirés ou marqués inactifs sont systématiquement exclus du catalogue visible des utilisateurs.
- **SC-004**: 100% des redirections vers les marchands partenaires enregistrent un événement de suivi avant le renvoi effectif du visiteur.
- **SC-005**: 100% des offres affichées disposent de l'ensemble des informations visuelles et tarifaires requises (visuel, titre, marque, prix barré, prix remisé, remise %, marchand, fraîcheur).
- **SC-006**: Le catalogue maintient des performances constantes et une navigation sans saccade avec une volumétrie d'au moins 500 bons plans actifs simultanés.

## Assumptions

- **Périmètre monétaire et géographique** : Les offres sont libellées en Euros (€) et concernent des boutiques partenaires livrant en France / Europe francophone.
- **Simplicité d'infrastructure** : Conformément à la constitution du projet, le site se limite à une couche d'affichage fine et rapide lisant une base de données préparée par des workflows n8n externes.
- **Conformité vie privée** : Le comptage des clics de redirection s'opère sans traceurs intrusifs ni cookies publicitaires tiers nécessitant un bandeau de consentement bloquant en V1.
- **Limites explicites du périmètre V1** :
  - Pas d'outils de scraping ou d'ingestion embarqués dans le code du site web (responsabilité exclusive des workflows externes).
  - Pas d'espace de connexion, de gestion de compte utilisateur, ni de liste de favoris.
  - Pas de système d'alertes personnalisées (e-mail, push, Telegram).
  - Pas d'historique tarifaire graphique (courbe d'évolution du prix).
  - Pas d'interface d'administration (CRUD manuel) dans le site web.
