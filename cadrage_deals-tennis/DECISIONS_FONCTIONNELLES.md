# Décisions fonctionnelles

Décisions structurantes numérotées `D-AAAA-MM-JJ-NN`, dans l'ordre chronologique.

---

### D-2026-09-21-01 — Adoption du protocole de travail cadrage / une étape par conversation

**Contexte** : L'utilisateur a défini un protocole complet de travail pour ce projet (cadrage préalable, décisions soumises explicitement, une étape de build par conversation, vérification avec données réelles, flux git via PR, traçabilité des points ouverts).

**Décision** : Ce protocole s'applique à l'ensemble du projet deals-tennis à partir de maintenant.

**Statut** : Actée (confirmée explicitement par l'utilisateur).

---

### D-2026-09-21-02 — Restructuration de la documentation existante dans `cadrage_deals-tennis/`

**Contexte** : Le projet contenait déjà `spec.md`, `plan.md`, `data-model.md`, `research.md`, `quickstart.md`, `tasks.md`, `checklists/`, `contracts/` à la racine, générés par un outil de type spec-kit, sans dossier de cadrage ni suivi conforme au protocole.

**Décision** : Ces fichiers sont déplacés (git mv, historique conservé) dans `cadrage_deals-tennis/` et complétés par `INDEX.md`, `DECISIONS_FONCTIONNELLES.md`, `ETAT_ACTUEL.md`, `GAPS_OUVERTS.md`, `JOURNAL_SESSIONS.md`.

**Statut** : Actée (confirmée explicitement par l'utilisateur via question directe).

---

### D-2026-09-21-03 — Initialisation d'un dépôt git local

**Contexte** : Le dossier `C:\dev\deals-tennis` n'était pas un dépôt git.

**Décision** : `git init` exécuté, avec un premier commit important la documentation existante telle quelle, puis un second commit pour la restructuration en `cadrage_deals-tennis/`. Pas de remote configuré, pas de push (aucune demande explicite en ce sens à ce stade).

**Statut** : Actée (confirmée explicitement par l'utilisateur).

---

### D-2026-09-21-04 — Politique d'archivage des fichiers de suivi

**Contexte** : Les fichiers de suivi (`ETAT_ACTUEL.md`, `GAPS_OUVERTS.md`, `JOURNAL_SESSIONS.md`) risquaient de grossir indéfiniment session après session sans mécanisme d'allègement.

**Décision** : Ces fichiers restent des synthèses courtes, réécrites à chaque point d'étape significatif plutôt que complétées ligne après ligne. Quand une synthèse devient trop lourde, elle est réécrite en version condensée et la version détaillée intégrale est déplacée telle quelle (non modifiée) dans `cadrage_deals-tennis/archive/`. Les documents normatifs (spec, plan, data-model, contracts) ne sont jamais résumés — seuls les documents de suivi sont candidats à la synthèse+archivage. `INDEX.md` référence l'existence de l'archive sans en faire la source de vérité de l'état courant.

**Statut** : Actée (confirmée explicitement par l'utilisateur).

---

### D-2026-09-21-05 — `tasks.md` repris tel quel, entièrement décoché

**Contexte** : `tasks.md` listait des tâches marquées `[x]` (migrations SQL, seed, types, composants React, pages Next.js, tests) sans aucun code correspondant dans le dépôt (GAP-2026-09-21-01), et référençait des chemins d'un autre projet (`C:/Users/lenoi/mon-projet/specs/...`).

**Décision** : Le contenu de `tasks.md` (découpage en phases/user stories) est conservé tel quel comme liste de tâches à faire, mais toutes les cases sont décochées (`[x]` → `[ ]`), et les liens vers `spec.md`/`plan.md`/`quickstart.md` sont corrigés pour pointer vers ce dépôt (`cadrage_deals-tennis/`) plutôt que l'ancien emplacement.

**Statut** : Actée (confirmée explicitement par l'utilisateur).

---

### D-2026-09-21-06 — Cadrage fonctionnel considéré clos sans revue complète de spec.md/plan.md

**Contexte** : `spec.md` et `plan.md` ont été importés tels quels d'un outil externe (spec-kit), sans relecture ligne à ligne avec l'utilisateur pour confirmer qu'ils reflètent toujours ce qui est voulu.

**Décision** : Le contenu existant de `spec.md` et `plan.md` est jugé suffisant tel quel. Pas de revue complète programmée ; le cadrage fonctionnel est considéré clos. La phase de build peut démarrer.

**Statut** : Actée (confirmée explicitement par l'utilisateur).

---

### D-2026-09-21-07 — Adoption de Tailwind CSS v4 (config CSS-first) pour le setup Next.js (T001)

**Contexte** : `create-next-app` (dernière version) scaffold par défaut Next.js 16.3.5 / React 19 / Tailwind CSS v4, qui n'utilise plus de `tailwind.config.ts` (config via `@theme` dans `globals.css`). Le libellé de T001 dans `tasks.md` mentionnait explicitement `tailwind.config.ts`, ce qui ne correspond plus à la réalité de l'outil.

**Décision** : Tailwind CSS v4 est adopté tel que scaffoldé par défaut (pas de downgrade vers v3). Le libellé de T001 dans `tasks.md` sera adapté pour refléter l'absence de `tailwind.config.ts`. Next.js 16.3.5 et React 19 sont conservés (satisfont "14+" du plan).

**Statut** : Actée (confirmée explicitement par l'utilisateur).

---

### D-2026-09-21-08 — Nouveau cycle de cadrage (V2 post-MVP) en mode manuel, pas via spec-kit

**Contexte** : Le MVP (`tasks.md` T001-T034) est terminé et vérifié de bout en bout. L'utilisateur veut affiner le cadrage pour la suite du projet. La question de basculer sur l'outil `specify` (GitHub spec-kit, déjà installé sur la machine mais jamais initialisé dans ce dépôt) a été posée.

**Décision** : On reste en mode manuel (protocole `cadrage_deals-tennis/` existant : `INDEX.md`/`DECISIONS_FONCTIONNELLES.md`/`ETAT_ACTUEL.md`/`GAPS_OUVERTS.md`/`JOURNAL_SESSIONS.md`), pas de bascule vers spec-kit. Méthode du nouveau cycle de cadrage : d'abord identifier la liste complète des specs à construire pour la suite du projet, puis les construire une par une, une spec par conversation (pas d'enchaînement).

**Statut** : Actée (confirmée explicitement par l'utilisateur).

---

### D-2026-09-21-09 — Liste des chantiers V2 post-MVP validée

**Contexte** : Suite à D-2026-09-21-08, une liste candidate de chantiers a été proposée à partir des zones hors-scope V1 explicites dans `spec.md`/`plan.md` et des points laissés ouverts pendant le build du MVP.

**Décision** : La liste suivante est validée comme périmètre des chantiers V2 post-MVP à cadrer puis construire un par un (une spec/un chantier par conversation, pas d'enchaînement) :

1. **Déploiement production** — hébergement (Vercel Hobby prévu par `plan.md`, jamais configuré), variables d'env prod, domaine.
2. **Protection de branche + CI** — GAP-2026-09-21-02 : remote GitHub, CI (lint/build/test), flux branche→PR→merge.
3. **Validation à l'échelle** — perf pagination/index à re-valider à volume réel (spec vise 500+ offres actives, seed n'en a que 10).
4. **Automatisation n8n (scraping/collecte)** — workflows qui peuplent `merchants`/`deals` en continu (hors-scope V1 assumé par `spec.md`).
5. **Workflow n8n d'éviction horaire** — le SQL existe (`scripts/automation/n8n-eviction-cron.sql`), le workflow n8n lui-même reste à construire/déployer.
6. **Mentions légales / politique de confidentialité**.
7. **Disclosure liens d'affiliation** — mention visible sur le catalogue.
8. **Charte graphique / design system** — `app/globals.css` est resté au thème Tailwind par défaut.
9. **SEO** — sitemap.xml, robots.txt, Open Graph/structured data (JSON-LD `Product`/`Offer`).
10. **Accessibilité (a11y)** — audit à faire.
11. **Observabilité/monitoring** — logs d'erreurs applicatives, alerting (au-delà du tracking de clics RGPD déjà livré).
12. **Gestion des marchands** — probablement absorbé par le chantier 4 (n8n) plutôt que traité séparément, à confirmer au moment de cadrer ce chantier.

L'ordre de traitement n'est pas encore arbitré — à décider en début de chaque prochaine conversation dédiée, jamais déduit seul.

**Statut** : Actée (confirmée explicitement par l'utilisateur).

---

### D-2026-09-21-10 — Chantier 1 (Déploiement production) : méthode retenue

**Contexte** : Ouverture de la conversation dédiée au chantier 1 (D-2026-09-21-09). Le remote GitHub + CI (chantier 2) n'est pas encore en place.

**Décision** :
- Déploiement via CLI Vercel direct (`vercel deploy`/`vercel --prod`), sans lier de repo GitHub pour l'instant — le lien GitHub/CI sera traité au chantier 2.
- Base de données prod : réutilisation de l'instance Neon existante (projet `deals-tennis`, id `floral-mountain-74046188`), pas de séparation dev/prod à ce stade.
- Domaine : domaine par défaut `*.vercel.app`, pas de domaine personnalisé pour l'instant.

**Statut** : Actée (confirmée explicitement par l'utilisateur).

---

### D-2026-09-21-11 — Ordre de traitement des chantiers V2 : « CI + protection de branche » retenu en premier

**Contexte** : Chantier 1 (déploiement) terminé (D-2026-09-21-10). 11 chantiers V2 restent à arbitrer (D-2026-09-21-09).

**Décision** : Le chantier « CI + protection de branche » (n°2 de la liste D-2026-09-21-09) est traité en premier parmi les 11 restants — débloque le flux branche → PR → CI → merge prévu par le protocole (point 4) et résout GAP-2026-09-21-02. L'ordre des chantiers suivants reste à arbitrer au fur et à mesure, pas figé d'avance.

**Statut** : Actée (confirmée explicitement par l'utilisateur).

---

### D-2026-09-21-12 — Chantier « Automatisation n8n » : méthode de constitution de la liste des marchands partenaires

**Contexte** : Cadrage du chantier « Automatisation n8n » (n°4 de la liste D-2026-09-21-09), démarré par la question de la liste des marchands partenaires visés. Recherche web effectuée sur les grandes marques (Babolat, Wilson, Head, Dunlop, Yonex) et des revendeurs FR connus (Tennispro.fr, Sport 2000, Tennis Point, Padel-Point). Seuls 2-3 programmes d'affiliation publics ont pu être confirmés : **Tennis Point FR** et **Padel-Point FR** (revendeurs multi-marques, via le réseau Awin), et **adidas FR** (via Awin, généraliste sport, pas tennis-spécifique). Aucun programme d'affiliation public identifiable pour Babolat, Head, Dunlop, Yonex, Tennispro.fr, Sport 2000 — ce qui ne signifie pas qu'un partenariat est impossible avec eux, mais qu'il nécessiterait une démarche manuelle (contact direct) hors du périmètre d'une recherche web.

**Décision** : Rejet de l'idée de figer une liste de 10 marchands cibles dès maintenant. À la place : démarrer avec les marchands dont le programme d'affiliation est **confirmé** (Tennis Point FR, Padel-Point FR — adidas FR à évaluer séparément car généraliste), et n'ajouter un nouveau marchand à la liste qu'une fois sa candidature au programme d'affiliation réellement soumise et acceptée (démarche hors périmètre de cette session, à mener par l'utilisateur). La liste de marchands intégrés grandit donc au fil de l'eau plutôt que d'être décidée a priori.

**Statut** : Actée (confirmée explicitement par l'utilisateur).

---

### D-2026-09-21-13 — Chantier « Charte graphique / design system » : direction visuelle, palette et typographie

**Contexte** : Cadrage du chantier « Charte graphique / design system » (n°8 de la liste D-2026-09-21-09), `app/globals.css` étant resté au thème Tailwind par défaut depuis le MVP. L'utilisateur a donné une direction précise dès le départ (fond en photo de terrain gazon/terre battue à fournir, design épuré ne devant pas « faire IA », inspiration Aceternity pour les patterns d'interface, bords peu arrondis, cartes blanches/grises). Trois propositions de typographie ont été présentées visuellement (artefact canvas avec maquette de carte de deal) : A — Fraunces (titres serif) + Inter (corps), B — Space Grotesk (famille unique géométrique), C — Libre Franklin + Newsreader italique.

**Décision** :
- **Typographie** : Space Grotesk (option B), une seule famille pour titres et corps de texte, poids 400/500/700.
- **Palette d'accents** : deux accents distincts — un accent « prix/CTA » vert gazon foncé (`#1b4332`) et un accent « badge de réduction » terre cuite (`#c1440e`) — indépendants de la photo de fond réellement utilisée (gazon ou terre battue), le reste de l'interface restant neutre (blanc/gris/noir chaud).
- **Cartes** : fond blanc (`#ffffff`), bordure gris clair (`#e2e4e1`), jamais de gris coloré ou de dégradé.
- **Rayon des angles** : léger, 6px sur cartes/boutons, 4px sur les badges — explicitement pas de bords très arrondis (rejet du style « bulle » associé aux interfaces générées par IA).
- **Fond** : section hero avec photo de terrain (gazon ou terre battue, fournie par l'utilisateur) et overlay sombre semi-transparent pour la lisibilité du texte blanc ; pas d'effets animés façon `background-beams` — préférer un traitement sobre proche de `hero-highlight` (Aceternity) si un effet de fond est ajouté plus tard.
- Décisions mineures mais actées explicitement (pas de norme officielle Tailwind par défaut) : ces choix remplacent le thème Tailwind par défaut (`app/globals.css`) au moment où le code sera écrit (hors périmètre de cette conversation, cadrage uniquement).

**Statut** : Actée (confirmée explicitement par l'utilisateur — validation visuelle sur artefact canvas, typographie choisie « de très loin »).

---

### D-2026-09-21-14 — Chantier « Automatisation n8n » : scraping direct en parallèle, en attendant l'acceptation Awin

**Contexte** : GAP-2026-09-21-03 toujours ouvert (candidatures Awin Tennis Point FR / Padel-Point FR soumises, en attente d'acceptation, aucun datafeed accessible). L'utilisateur a demandé si le chantier « Automatisation n8n » pouvait avancer sans attendre l'affiliation, en scrapant directement les marchands gratuitement.

**Décision** : Démarrer une collecte par scraping direct (sans passer par un réseau d'affiliation) **en parallèle et à titre de test**, pendant que les candidatures Awin sont en cours d'examen — pas en remplacement définitif. Dès qu'un programme d'affiliation est accepté pour un marchand donné, la méthode d'ingestion pour ce marchand repasse sur le datafeed/mécanisme d'affiliation officiel (source de vérité pour le lien de destination et la rémunération). Le scraping direct reste un canal d'appoint, pas la méthode cible à long terme.

**Conséquence à cadrer dans une prochaine étape** : sans affiliation, `deals.affiliate_url` ne peut pas pointer vers un lien traqué/rémunéré pour les marchands scrapés — à trancher (lien produit direct sans tracking marchand, ou affichage sans lien cliquable en attendant) avant tout code. Reste aussi à définir : quels marchands scraper en premier, méthode technique (n8n HTTP/Playwright), fréquence, respect des CGU/robots.txt de chaque site ciblé.

**Statut** : Actée (confirmée explicitement par l'utilisateur).

---

### D-2026-09-21-15 — Chantier « Automatisation n8n » : comportement du lien pour une offre scrapée sans affiliation

**Contexte** : Suite à D-2026-09-21-14, `deals.affiliate_url`/`/go/[dealId]` supposent aujourd'hui un lien tracké/rémunéré (programme d'affiliation accepté). Pour un marchand scrapé sans affiliation (canal d'appoint), ce lien n'existe pas au sens propre.

**Décision** : `affiliate_url` pointe vers l'URL produit directe du marchand (pas de lien de tracking d'affiliation, puisqu'il n'y en a pas). `/go/[dealId]` continue de logger le clic dans `click_events` (analytics interne du site, RGPD, indépendant de la rémunération) mais sans rémunération associée pour ces offres. L'offre reste donc cliquable et utile à l'utilisateur final immédiatement, même sans affiliation acceptée pour ce marchand.

**Statut** : Actée (confirmée explicitement par l'utilisateur).

---

### D-2026-09-21-16 — Chantier « Automatisation n8n » : liste candidate de marchands pour le scraping direct

**Contexte** : Suite à D-2026-09-21-14 (scraping direct en canal d'appoint), l'utilisateur a listé les marchands candidats pour ce canal : Tennispro.fr, Sport 2000, une « private sport shop » non nommée précisément, Decathlon, SportSystem, ProTennis, Tennis Pro, ainsi que des marques (Wilson, Babolat, Yonex, Head).

**Décision** : Liste candidate actée telle que donnée, traitée en deux groupes distincts (même logique « au fil de l'eau » que D-2026-09-21-12 pour l'affiliation, appliquée ici à la faisabilité technique plutôt qu'à l'acceptation d'un programme) :
- **Revendeurs multi-marques** (ont un catalogue produit + prix + promos exploitables directement) : Tennispro.fr, Sport 2000, Decathlon, SportSystem, ProTennis, Tennis Pro. Ce sont les candidats naturels pour un scraping de fiches produit/prix.
- **Marques** (Wilson, Babolat, Yonex, Head) : à évaluer séparément — un site de marque a rarement un mécanisme de "bons plans"/promos comparable à un revendeur, et vend souvent lui-même via des revendeurs plutôt qu'en direct. Pas exclu, mais pas prioritaire pour ce canal.
- Pas de sélection définitive d'un premier marchand à implémenter techniquement dans cette conversation (cadrage uniquement) — cette sélection, ainsi que la vérification robots.txt/CGU par site et la méthode technique (n8n HTTP node vs Playwright), restent à traiter dans une prochaine étape dédiée, conformément au protocole (une étape de build à la fois).

**Statut** : Actée (confirmée explicitement par l'utilisateur).

---

### D-2026-09-22-01 — Chantier « Automatisation n8n » : premier marchand scrapé, portée des données, risque juridique assumé

**Contexte** : Suite à D-2026-09-21-16 (GAP-2026-09-21-05 ouvert), `robots.txt` et CGV/mentions légales vérifiés réellement (curl + lecture du texte, pas de suppositions) pour Tennispro.fr, Sport 2000, SportSystem, ProTennis et Decathlon.
- **Tennispro.fr** : `robots.txt` permissif sur les fiches produit, mais mentions légales contiennent une clause explicite limitant toute reproduction à un « usage personnel et privé » — republication commerciale explicitement interdite. **Écarté.**
- **Sport 2000** : `robots.txt` permissif, mais mentions légales interdisent explicitement l'usage de « lien profond, gratte-pages, robot, araignée » (clause anti-bot).
- **SportSystem** : `robots.txt` permissif, mais CGV interdisent « strictement » toute reproduction de texte/image, même partielle.
- **ProTennis** : `robots.txt` permissif sur les fiches produit (`/2397-raquette-de-tennis-babolat` etc., pas de préfixe `/fr/*` bloqué par erreur). CGV (Article 10) réservent tous les droits de reproduction/représentation à PROTENNIS et interdisent tout lien hypertexte sans accord écrit exprès — clause jugée peu solide juridiquement (la liberté de lien simple vers une page publique est largement reconnue en droit français) comparée aux clauses anti-bot explicites des deux marchands précédents.
- **Decathlon** : retourne un 403 même en requête `curl` directe (protection anti-bot réelle, pas seulement un blocage de l'outil de fetch) — écarté techniquement sans même évaluer les CGV.
- Risque juridique réel identifié et expliqué à l'utilisateur : le droit sui generis du producteur de base de données (art. L341-1 CPI) protège contre une extraction/réutilisation *substantielle et répétée* d'un catalogue, indépendamment des CGU ; c'est le risque principal, pas les clauses de CGV en elles-mêmes (largement standard/boilerplate). Risque concret réaliste pour un petit site niche : mise en demeure possible si repéré, procès improbable à cette échelle.

**Décision** :
- **Marchand retenu pour la première implémentation technique** : ProTennis (le plus pertinent pour le catalogue — revendeur spécialisé tennis — et la clause la plus problématique de son CGV, l'interdiction de lien, est jugée la moins solide juridiquement du lot).
- **Portée des données scrapées, pour limiter l'exposition au droit des bases de données** : titre, prix, catégorie uniquement — pas de reproduction de description longue ni de copie/stockage d'image sur nos serveurs.
- **Visuel produit** : hotlink de l'image directement depuis l'URL du marchand (`<img src="...">` vers son CDN, jamais téléchargée/republiée sur notre domaine) — réduit le risque de reproduction. Fallback vers les placeholders par catégorie déjà en place (`public/placeholders/`) si l'image casse (hotlinking bloqué côté marchand, URL invalide, etc.).
- **Risque résiduel assumé explicitement par l'utilisateur** : le scraping direct (même minimal) reste un canal d'appoint temporaire (D-2026-09-21-14), pas la méthode cible à long terme — reste préférable de basculer ce marchand sur affiliation si un programme devient disponible.
- Respect du `Crawl-delay: 60` de ProTennis pour toute fréquence de collecte définie (à cadrer dans une prochaine étape avec la méthode technique n8n HTTP node vs Playwright — GAP-2026-09-21-05 partiellement résolu, la sélection du marchand est faite mais pas encore la méthode technique/fréquence).

**Statut** : Actée (confirmée explicitement par l'utilisateur, plusieurs questions structurées successives).

---

### D-2026-09-22-02 — Chantier « Automatisation n8n » : méthode technique et fréquence de collecte pour ProTennis

**Contexte** : Suite à D-2026-09-22-01 (ProTennis retenu comme premier marchand), il restait à trancher la méthode technique du nœud n8n et la fréquence de collecte (GAP-2026-09-21-05, reste ouvert). Contexte technique déjà établi : ProTennis tourne sous PrestaShop, rendu côté serveur — le contenu produit est présent dans le HTML brut sans exécution JS. `robots.txt` indique `Crawl-delay: 60`.

**Décision** :
- **Méthode technique** : nœud HTTP Request n8n (requête simple) + parsing HTML (HTML Extract / regex) — pas de Playwright/headless browser, inutile puisque le contenu est déjà présent dans le HTML brut. Plus léger, moins fragile, pas de dépendance navigateur.
- **Fréquence de collecte** : 1 fois par jour. Cohérent avec la nature « bons plans » (prix/promos ne changent pas toutes les heures), minimise l'exposition/le risque de détection en tant que bot, respecte largement le `Crawl-delay: 60`.

**Statut** : Actée (confirmée explicitement par l'utilisateur).

---

### D-2026-09-22-03 — Build workflow n8n ProTennis : gestion de la fin de vie d'une offre et clé d'identification stable

**Contexte** : Au moment de construire le workflow (nœud HTTP Request + parsing HTML, contrat `ingestion-contract.md`), deux problèmes structurants sont apparus : (1) ProTennis n'affiche aucune date de fin de promo sur ses fiches produit, or le cron d'éviction existant (`n8n-eviction-cron.sql`) ne fait expirer une offre que si `expires_at` est dépassée — une offre ProTennis qui redevient à prix normal ne serait donc jamais désactivée automatiquement ; (2) le schéma `deals` n'a pas de champ pour identifier « la même offre » d'un passage de scraping à l'autre.

**Décision** :
- **Fin de vie d'une offre ProTennis** : à chaque exécution quotidienne, le workflow scrape la liste courante, upsert ces offres, puis marque `status='expired', is_active=false` toute offre ProTennis déjà en base dont l'URL n'apparaît plus dans le scraping du jour (produit vendu, promo terminée, prix redevenu normal). Garde-fou ajouté (auto-décidé, non structurant) : si le scraping renvoie 0 offre (site en panne, changement de structure), l'étape d'éviction ne s'exécute pas du tout — évite de désactiver en masse toutes les offres ProTennis suite à un échec de scraping.
- **Clé d'identification stable** : `(merchant_id, affiliate_url)` — l'URL produit ProTennis sert de clé naturelle. Nécessite une migration (`002_deals_unique_merchant_url.sql`) ajoutant `UNIQUE (merchant_id, affiliate_url)` sur `deals`, appliquée directement à la base Neon de prod (pas de conflit avec les données existantes).

**Statut** : Actée (confirmée explicitement par l'utilisateur).

---

### D-2026-09-22-04 — Hébergement permanent de n8n : Oracle Cloud Free Tier

**Contexte** : GAP-2026-09-22-06 (ouvert) — le workflow n8n ProTennis est construit et vérifié, mais aucune instance n8n ne tourne en continu, donc le déclencheur quotidien ne s'exécute pas réellement. Trois options présentées : n8n Cloud (payant, pas de tier gratuit permanent), VPS payant, machine perso allumée en continu (gratuit mais peu fiable), ou solutions gratuites permanentes à explorer. L'utilisateur n'a aucune connaissance en administration serveur et a demandé explicitement une orchestration conjointe du setup et de la maintenance.

**Décision** : Hébergement sur une VM **Oracle Cloud Free Tier** (offre "Always Free", ARM Ampere, jusqu'à 4 OCPU/24 Go RAM, gratuite à durée indéterminée — pas un essai limité). n8n self-hosted via Docker sur cette VM. Setup et maintenance orchestrés conjointement (l'utilisateur n'a pas les compétences pour le faire seul) : les étapes nécessitant un compte/une identité/un paiement (création du compte Oracle Cloud, vérification carte bancaire pour le tier gratuit) restent à la charge de l'utilisateur — hors périmètre des outils de Claude Code — le reste (provisioning VM, installation Docker/n8n, import et activation du workflow ProTennis, vérification bout en bout) peut être fait avec Claude Code une fois l'accès à la VM disponible (SSH).

**Statut** : Actée (confirmée explicitement par l'utilisateur).

---

### D-2026-09-22-05 — Chantier « Automatisation n8n » : élargissement du scraping ProTennis au-delà de la page déstockage

**Contexte** : L'utilisateur a demandé d'élargir la couverture de scraping au-delà des pages "bons plans"/déstockage, certaines promos apparaissant sur des pages plus classiques (catégories standard). Vérification réelle effectuée sur le site ProTennis (pages `/973-raquette-de-tennis` sur plusieurs pages de pagination, `/990-grip-raquette-tennis`) : le badge de réduction (`has-discount`, prix barré) est présent sur **100% des produits observés**, toutes catégories confondues — ce n'est pas un signal distinctif du déstockage mais une pratique d'affichage permanente du site. Un seuil de réduction à 1% proposé initialement par l'utilisateur revenait donc de facto à scraper l'intégralité du catalogue ; l'utilisateur a été informé de cette implication (volume, fréquence, exposition juridique accrue — cf. D-2026-09-22-01) avant de trancher. Objectif clarifié par l'utilisateur : la valeur de deals-tennis est l'agrégation (éviter à l'utilisateur final de comparer les prix marchand par marchand), pas la découverte d'une promo cachée sur une page précise.

**Décision** :
- Le scraping ProTennis s'étend à **toutes les catégories du site** (raquettes, cordages, chaussures, textile, accessoires, padel, squash, badminton, etc.), pas seulement `/5624-destockage-raquettes`.
- **Aucun seuil minimum de réduction appliqué pour l'instant.** Le volume réel sera observé une fois d'autres marchands ajoutés au périmètre de scraping ; un seuil de curation (ex. -20%) pourra être introduit plus tard sur la base de données réelles plutôt que d'une estimation a priori.
- Le point sur l'affichage d'un même produit disponible chez plusieurs marchands à des réductions différentes est **hors périmètre de cette décision** — consigné comme point ouvert séparé (voir GAP-2026-09-22-08).

**Statut** : Actée (confirmée explicitement par l'utilisateur). Cadrage uniquement — le build (élargissement effectif du workflow n8n ProTennis) reste une étape séparée, non commencée dans cette conversation.

**Point de vigilance ajouté le 2026-09-22** (lors de l'inspection réelle du site avant de démarrer le build de cette décision) : ProTennis est un site **multi-sports** (tennis, padel, squash, badminton, pickleball), avec des pages dédiées à chaque sport. Le champ `deals.category` a une contrainte `CHECK` limitée à `'raquettes', 'cordages', 'chaussures', 'textile', 'accessoires'` (`data-model.md`) — une offre padel/squash/badminton ne peut pas y être insérée telle quelle. La mention « padel, squash, badminton, etc. » dans le contexte de cette décision reflète les catégories du **menu du site**, pas un périmètre produit confirmé pour deals-tennis (qui reste un catalogue tennis d'après `spec.md`). **Aucune correction actée à ce stade** — à trancher explicitement au moment du build de l'élargissement (exclure les autres sports, ou élargir le périmètre produit du site — décision non prise). Voir GAP-2026-09-22-09.

---

### D-2026-09-22-06 — Comparaison de prix multi-marchands pour un même article : direction produit et modèle de données

**Contexte** : En démarrant le build de l'élargissement ProTennis (D-2026-09-22-05), l'utilisateur a redéfini l'objectif final du site : permettre à l'utilisateur final de rechercher un article précis et d'être redirigé vers le ou les marchands qui le proposent en réduction, pour comparer lui-même (prix, mais aussi préférence de marchand). Ce point recoupe GAP-2026-09-22-08 (affichage d'un même produit chez plusieurs marchands), que l'utilisateur élève au rang d'axe central plutôt que de point ouvert secondaire.

Vérification réelle effectuée avant de trancher : aucun marchand n'expose de référence fabricant ou d'EAN/GTIN universel exploitable pour le rapprochement. Une fiche produit ProTennis réelle inspectée (`59922-raquette-de-tennis-lacoste-l23-light-275-gr-non-cordee.html`) expose un champ « Référence » (`18LACL23L`) qui est un **code interne au marchand** (convention PrestaShop), pas une référence fabricant partagée entre marchands.

**Décision** :
- **Modèle de données** : ajout d'une table `products` (article canonique : marque, modèle, catégorie) ; `deals` gagne un `product_id` nullable (FK vers `products`, `NULL` tant que le rapprochement n'a pas réussi). `deals` reste la table d'offres marchandes individuelles, `products` ne fait qu'identifier « le même article ».
- **Méthode de rapprochement** : pas de référence fabricant/EAN disponible dans les données — le rapprochement se fait par **extraction de marque + modèle depuis le titre de l'offre** (parsing structuré : marque parmi une liste connue, puis tokens de modèle en excluant le bruit — grammage, mention « cordée/non cordée », taille, etc.). Approximatif par nature (pas de garantie à 100%), accepté explicitement par l'utilisateur.
- **Page d'accueil / catalogue** : reste centrée **deal** (une carte = une offre marchande), triée par défaut du plus récent au plus ancien, filtres/tri existants inchangés (FR-009 et Phase 4 non remis en cause). Pas de fusion en une carte par article sur cette vue.
- **Recherche** : devient centrée **article** — une recherche doit regrouper tous les deals rapprochés sur le même `product_id`, tous marchands confondus (évolution du contrat `catalog-query-api.md`, à cadrer en détail au moment du build).
- **Détail d'un deal** : ouvre une page ou une popup (modalité UI non tranchée, voir GAP-2026-09-22-10) listant les autres offres marchandes du même article (via `product_id`), pour laisser l'utilisateur comparer lui-même et choisir selon ses propres critères (prix, mais aussi préférence de marchand) — pas de logique de « meilleur prix » imposée automatiquement au premier niveau d'affichage.

**Statut** : Actée (confirmée explicitement par l'utilisateur). Cadrage uniquement — aucun build effectué dans cette conversation. Reste à trancher avant/pendant le build : algorithme exact de parsing marque/modèle, modalité page vs popup pour le détail d'un deal, évolution précise du contrat de recherche.

---

### D-2026-09-22-08 — Élargissement du scraping ProTennis à toutes les catégories tennis du site : périmètre technique

**Contexte** : Reprise de l'élargissement acté en D-2026-09-22-05 (GAP-2026-09-22-09 à trancher d'abord). Inspection réelle de la navigation ProTennis (`curl` sur la page d'accueil) : les catégories tennis ont des pages dédiées identifiables par leur slug (`973-raquette-de-tennis`, `977-cordage-raquette-tennis`, `974-chaussure-de-tennis`, `975-vetement-de-tennis`, `978-accessoire-tennis`), distinctes des catégories padel/squash/badminton/pickleball (`-de-squash`, `-de-padel`, `-de-badminton`, `-pickleball`). Deux catégories du site (`979-balle-tennis`, `976-bagagerie-tennis`) n'ont pas d'équivalent dans le modèle actuel (`CHECK` limité à `raquettes, cordages, chaussures, textile, accessoires`).

**Décision** :
- **Exclusion des autres sports (résolution GAP-2026-09-22-09)** : le scraping cible exclusivement les pages catégories tennis identifiées ci-dessus (pas de scraping générique « toutes catégories du site »). En complément, un filtre de sécurité par mots-clés (`squash`, `padel`, `badminton`, `pickleball` dans le titre du produit, insensible à la casse) écarte toute fiche qui s'y glisserait malgré tout — nécessaire car une inspection antérieure avait montré un produit squash mêlé à une page raquettes tennis (voir note du 2026-09-22 dans D-2026-09-22-05).
- **Mapping catégories site → catégories `deals`** : `973-raquette-de-tennis` → `raquettes`, `977-cordage-raquette-tennis` → `cordages`, `974-chaussure-de-tennis` → `chaussures`, `975-vetement-de-tennis` → `textile`, et `978-accessoire-tennis` + `979-balle-tennis` + `976-bagagerie-tennis` → `accessoires` (balles et bagagerie n'ayant pas de catégorie dédiée dans le modèle, l'utilisateur a choisi de les rattacher à `accessoires` plutôt que de les exclure).
- **Volume** : vérification réelle montrant un volume bien supérieur à l'estimation initiale (`973-raquette-de-tennis` seul fait 9 pages, ~370 produits, tous avec un badge de réduction comme déjà constaté en D-2026-09-22-05) — probablement plusieurs milliers de produits au total sur les 5 pages. L'utilisateur a confirmé maintenir l'absence de seuil de réduction (pas de retour sur D-2026-09-22-05) malgré ce volume quantifié.
- **Pagination** : le nombre de pages par catégorie est déterminé dynamiquement à chaque exécution (lecture des liens `page=N` sur la première page de la catégorie), pas figé en dur — les catégories évoluent en volume au fil du temps.
- **Remplacement de la page déstockage** : la page `5624-destockage-raquettes` (seule source actuelle) est un sous-ensemble de `973-raquette-de-tennis` (recoupement vérifié sur un échantillon réel) — elle est retirée du workflow au profit de la page catégorie complète, qui la couvre.

**Statut** : Actée (confirmée explicitement par l'utilisateur). Build à suivre dans cette même conversation.

---

### D-2026-09-22-09 — Seuils chiffrés pour la politique d'archivage des fichiers de suivi (précision de D-2026-09-21-04)

**Contexte** : D-2026-09-21-04 posait le principe (« synthèse courte, réécrite à chaque point d'étape ; version détaillée déplacée en `archive/` quand trop lourde ») mais sans seuil chiffré. Constat en session : `ETAT_ACTUEL.md` (200 lignes) et `JOURNAL_SESSIONS.md` (336 lignes, 27 entrées) avaient largement dépassé une taille de synthèse lisible sans que la condensation/archivage se déclenche, faute de seuil explicite — `archive/` était resté vide.

**Décision** :
- **`JOURNAL_SESSIONS.md`** : seuil de **150 lignes**. Au dépassement, condenser en gardant les sessions récentes en clair et déplacer les entrées les plus anciennes, telles quelles, dans `archive/`.
- **`ETAT_ACTUEL.md`** : seuil de **150 lignes**, même logique que le journal (fichier lu en entier à chaque reprise de session, doit rester léger). Au dépassement : chaque phase/chantier **terminé** est condensé en une ligne de résumé dans le fichier courant ; le détail d'implémentation intégral de cette phase part dans `archive/`. Seule la phase/le chantier **en cours** garde son détail complet dans `ETAT_ACTUEL.md`.
- **`GAPS_OUVERTS.md`** : pas de seuil de taille — un gap est retiré du fichier **immédiatement** dès qu'il est tranché (décision `D-xxx` associée qui le clôt). Pas d'archive séparée pour les gaps résolus : la décision qui clôt le gap fait foi dans `DECISIONS_FONCTIONNELLES.md`.
- **`DECISIONS_FONCTIONNELLES.md`** : **jamais archivé**, quelle que soit sa taille. Motif différent des trois autres fichiers : ce n'est pas un document relu intégralement à chaque reprise de session (protocole de reprise = `ETAT_ACTUEL.md` → `GAPS_OUVERTS.md` → dernière entrée du journal, pas ce fichier), mais un registre consulté par référence ponctuelle à un ID (`D-AAAA-MM-JJ-NN`) depuis les autres documents. Archiver casserait la garantie « un ID = un emplacement stable et unique » sur laquelle s'appuient le journal, les gaps, les commits et les PR pour pointer vers une décision.
- Application immédiate demandée par l'utilisateur : `ETAT_ACTUEL.md` et `JOURNAL_SESSIONS.md` étant déjà au-delà du seuil au moment de cette décision, la condensation + archivage est à effectuer dans la foulée.

**Statut** : Actée (confirmée explicitement par l'utilisateur après discussion des options).
---

### D-2026-09-22-10 — Détail d'un deal : page dédiée `/deal/[dealId]` (résolution de GAP-2026-09-22-10)

**Contexte** : D-2026-09-22-06 actait que le clic sur un deal devait permettre de voir les autres offres marchandes du même article, sans trancher la modalité d'affichage (page dédiée vs popup/modale sur le catalogue).

**Décision** : page dédiée `/deal/[dealId]`, plutôt qu'une popup sur le catalogue — meilleure adéquation avec une URL partageable et un SEO potentiel par article, au prix d'un aller-retour supplémentaire pour l'utilisateur (jugé acceptable, la comparaison multi-marchands n'est pas une action fréquente).

**Statut** : Actée (confirmée explicitement par l'utilisateur, question structurée soumise avant le build).

---

### D-2026-09-22-11 — Regroupement par article limité au mode recherche

**Contexte** : D-2026-09-22-06 actait que « la recherche devient centrée article » sans préciser si ce changement s'applique aussi à la navigation par défaut (catégorie/tri sans terme de recherche).

**Décision** : le regroupement par article (une carte = un article, avec badge du nombre d'offres et lien vers la page détail) ne s'applique **que lorsqu'un terme de recherche (`q`) est actif**. La navigation par défaut (accueil, filtre catégorie seul, tri seul) reste inchangée : une carte = un deal, lien direct vers `/go/[dealId]`.

**Statut** : Actée (confirmée explicitement par l'utilisateur, question structurée soumise avant le build).

---

### D-2026-09-23-01 — Mécanisme de monitoring du cron n8n ProTennis : dead man's switch externe (healthchecks.io)

**Contexte** : Chantier « Observabilité/monitoring » (n°11 de la liste D-2026-09-21-09), déclenché concrètement par GAP-2026-09-22-12 (le workflow n8n ProTennis s'était désactivé silencieusement, sans alerte, cause racine non déterminée). Trois options soumises à l'utilisateur : (1) dead man's switch externe (healthchecks.io, gratuit), (2) vérification côté app via Vercel Cron + fournisseur email à provisionner, (3) alerte native n8n (2e workflow planifié).

**Décision** : option 1 retenue — le workflow n8n ProTennis enverra un ping HTTP vers un check healthchecks.io après chaque succès du scraping ; healthchecks.io alertera par email si le ping n'arrive pas dans la fenêtre attendue (~24h + marge de grâce). Choix motivé par le découplage total vis-à-vis de n8n lui-même : contrairement à l'option 3, ce mécanisme reste fonctionnel même si n8n plante, se désactive, ou si la VM redémarre mal — exactement le scénario de l'incident déjà survenu (GAP-2026-09-22-12), que l'option 3 n'aurait probablement pas détecté puisqu'elle partage le même point de défaillance.

**Statut** : Actée (confirmée explicitement par l'utilisateur après explication détaillée des trois options). **Cadrage uniquement — aucun build effectué dans cette conversation**, conformément au protocole (une étape de build par conversation). Mise en œuvre (création du compte/check healthchecks.io par l'utilisateur, ajout du nœud HTTP au workflow n8n, vérification réelle) à faire dans une conversation dédiée.

---

### D-2026-09-23-02 — Choix de la photo de fond hero (GAP-2026-09-21-04)

**Contexte** : Chantier « Charte graphique / design system » (D-2026-09-21-13), bloqué depuis le 2026-09-21 sur l'absence de photo de terrain pour le fond de la section hero. L'utilisateur a fourni 3 photos de test dans `public/hero/` : `mudassir-ali-Ygy6aPp6980-unsplash.jpg` (vue aérienne court dur, deux joueurs visibles), `siddharth-patel-StYnQsSRUPY-unsplash.jpg` (court en gazon réel, format portrait 2894×3024), `simone-viani-2XPHSXVT_Ls-unsplash.jpg` (vue aérienne, tons doux désaturés, format paysage large 3222×1861).

**Décision** : `simone-viani-2XPHSXVT_Ls-unsplash.jpg` retenue — format paysage adapté à une bannière hero, larges zones vides pour superposer texte/CTA sans surcharge visuelle, tons désaturés cohérents avec le style épuré déjà acté (bordures fines, radius léger). Les deux autres écartées : la première est un court dur (pas gazon/terre battue comme prévu), la seconde a un format portrait mal adapté à un hero large.

**Statut** : Actée (recommandation soumise avec justification, validée explicitement par l'utilisateur). **GAP-2026-09-21-04 résolu.**

---

### D-2026-09-23-03 — Push + création de PR automatiques en fin d'étape de build

**Contexte** : Le protocole (D-2026-09-21-01, point 4 « Git ») imposait de ne jamais `git push` sans demande explicite à chaque fois. Dans la pratique, l'utilisateur valide systématiquement le push et la création de PR en fin d'étape depuis la mise en place du flux branche → PR → CI (GAP-2026-09-21-02) — la demande explicite répétée à chaque fin d'étape n'apportait plus de contrôle réel, seulement une étape manuelle systématique.

**Décision** : à partir de maintenant, en fin d'étape de build (une fois le commit fait sur une branche dédiée, diff vérifié), Claude Code pousse la branche (`git push -u origin <branche>`) et crée la PR (`gh pr create`) **automatiquement, sans demander confirmation à chaque fois**. Reste inchangé : jamais de commit direct sur `master`, jamais de merge sans passage par CI, jamais de force-push, et toute action git destructrice (reset --hard, push --force, suppression de branche) continue de requérir une confirmation explicite au cas par cas.

**Statut** : Actée (demandée explicitement par l'utilisateur). Modifie D-2026-09-21-01 (point 4) pour la suite du projet.

---

### D-2026-09-23-04 — `DATABASE_URL` étendue à l'environnement preview Vercel

**Contexte** : En connectant le projet Vercel au dépôt GitHub (résolution en cours de GAP-2026-09-23-02), le premier déploiement preview déclenché par le push d'une branche a échoué (`npm run build` exit 1). Cause identifiée : `DATABASE_URL` n'était configurée dans Vercel que pour la cible `production` (jamais pour `preview`), alors que `lib/db.ts` évalue la connexion Neon au chargement du module — même cause que GAP-2026-09-21-02 côté CI GitHub Actions.

**Décision** : `DATABASE_URL` étendue à la cible `preview` en plus de `production` (même valeur, une seule base Neon existe — cohérent avec D-2026-09-21-10, pas de séparation dev/prod à ce stade). Modifié via l'API Vercel (MCP `edit_project_env`) sans jamais lire la valeur en clair (variable de type `sensitive`).

**Statut** : Actée (question soumise à l'utilisateur, validée explicitement). Les futures previews de PR pourront se builder.

---

### D-2026-09-23-05 — Recherche par suggestions cliquables au lieu du filtrage en direct

**Contexte** : Le champ de recherche du catalogue filtrait en direct à chaque frappe (debounce 300ms puis navigation), ce que l'utilisateur a jugé haché comme expérience. Demande explicite, hors feuille de route (le chantier planifié était « charte graphique »), traitée à la place sur demande de l'utilisateur.

**Décision** : le filtrage en direct est retiré. Pendant la frappe (dès 2 caractères), une liste de suggestions d'articles s'affiche sous le champ (nouvel endpoint `GET /api/products/suggest`, `brand + model` de la table `products`, restreint aux articles ayant au moins une offre active). La recherche ne se déclenche que sur trois déclencheurs : clic sur une suggestion (lance la recherche avec ce texte), touche Entrée, clic sur une icône loupe ajoutée dans le champ.

**Statut** : Actée et construite. `components/search-bar.tsx`, `lib/products.ts` (nouveau), `app/api/products/suggest/route.ts` (nouveau). Vérifié réellement : `npm run lint`/`build`/`test` (50 tests, 8 fichiers) et `npm run test:e2e` (10 tests) passent tous ; comportement contrôlé au navigateur (Playwright CLI) contre les données réelles de prod pour les 3 déclencheurs. PR #23 (`feat/recherche-suggestions-clic`).

---

### D-2026-09-23-06 — Sous-catégorie couleur : attribut affiché, pas clé d'identité produit ; extraction automatique depuis le titre

**Contexte** : GAP-2026-09-23-03 — certains articles ne diffèrent que par la couleur, ce qui génère des variantes de nom qui polluent la recherche/les suggestions (ex. « Babolat Pure Aero Rouge » vs « ... Bleu » traités comme deux modèles distincts).

**Décision** :
1. La couleur reste un **attribut affiché**, pas une clé d'identité produit. Le regroupement multi-marchand (`products`, unicité `LOWER(brand), LOWER(model), category`) continue d'ignorer la couleur — deux couleurs du même modèle restent le même article, listées comme « autres offres » sur `/deal/[dealId]`.
2. La couleur est **extraite automatiquement du titre scrappé**, sur le modèle de `extractModel` (`lib/product-matching.ts`) et de son miroir JS dans le workflow n8n. Un mot de couleur reconnu est retiré du texte utilisé pour `model`/la recherche et stocké séparément.
3. Vocabulaire de couleurs non reconnu par la liste connue : à traiter comme point ouvert au fil de l'eau (nouveau GAP), pas bloquant pour ce chantier.

**Statut** : Actée, build à suivre dans cette conversation.

---

### D-2026-09-23-07 — Suggestions de recherche groupées par catégorie (menu à deux niveaux)

**Contexte** : Les suggestions de recherche (D-2026-09-23-05) sont actuellement une liste plate `brand + model` triée alphabétiquement. L'utilisateur souhaite un regroupement par catégorie (raquettes, cordages, chaussures, textile, accessoires) pour rendre les suggestions plus lisibles quand une marque couvre plusieurs catégories (ex. « babolat »).

**Décision** :
1. Le menu de suggestions devient à deux niveaux, sans navigation ni changement de page :
   - 1er niveau : liste des catégories (parmi `DEAL_CATEGORIES`) ayant au moins un article correspondant à la saisie, avec leur libellé affiché.
   - Clic sur une catégorie → le menu bascule pour afficher les noms d'articles (`brand + model`) de cette catégorie correspondant à la saisie (2e niveau), dans le même menu déroulant.
2. Clic sur un nom d'article (2e niveau) → lance la recherche avec **texte + catégorie** (`/?category=X&q=texte`), pas texte seul — cohérent avec le fait que la catégorie a été choisie explicitement.
3. Touche Entrée (sans passer par les suggestions) : comportement inchangé, filtre uniquement avec le texte tapé (`/?q=texte`, toutes catégories) — confirmé explicitement par l'utilisateur.
4. Reprendre la frappe (changement de texte) réinitialise le menu au 1er niveau (catégories).

**Statut** : Actée (question soumise à l'utilisateur via choix explicite, validée). Build à suivre dans cette conversation.

---

### D-2026-09-23-08 — Suppression du plafond de 8 suggestions d'articles par catégorie

**Contexte** : Bug rapporté par l'utilisateur sur le menu de suggestions à deux niveaux (D-2026-09-23-07) : après avoir cliqué sur une catégorie (ex. « Cordages » pour « babolat »), certains articles réels n'apparaissaient jamais, même en scrollant (ex. « BABOLAT RPM TEAM 125 BOBINE 200m », la liste s'arrêtant à « Babolat RPM BLAST 135 BOBINE 200m »). Cause diagnostiquée : `getProductSuggestions` (`lib/products.ts`) avait un `LIMIT 8` en dur, hérité de l'ancienne liste plate (D-2026-09-23-05) — la requête SQL ne remontait donc jamais plus de 8 articles, indépendamment du scroll ajouté ensuite (PR #28), qui ne peut afficher que ce qui a été chargé.

**Décision** : suppression pure et simple du plafond — la requête retourne tous les articles correspondants de la catégorie choisie, le scroll (déjà en place) gérant l'affichage. Option alternative (relever le plafond à ~30) écartée par l'utilisateur au profit de la suppression complète.

**Statut** : Actée et construite dans cette conversation.

---

### D-2026-09-23-09 — Chantier « Marchands supplémentaires » : candidats scraping direct écartés, pivot vers la recherche de programmes d'affiliation

**Contexte** : Reprise du chantier n°3 de la feuille de route (« Ajout de marchands supplémentaires »). L'utilisateur a proposé 6 candidats pour un scraping direct (canal d'appoint, D-2026-09-21-14) : Private Sport Shop, Tennis Pro, Wilson, Babolat, Yonex, Head. Vérification réelle effectuée (robots.txt + CGU/CGV réelles, curl + WebFetch) :
- **Tennis Pro** = tennispro.fr, déjà évalué et écarté le 2026-09-22 (D-2026-09-22-01, clause « usage personnel et privé ») — pas un nouveau candidat.
- **Head** : `robots.txt` bloque tout le site (`Disallow: /`).
- **Wilson** : protection anti-bot technique réelle (PerimeterX/captcha), bloque même une requête `curl` simple sans JS — même catégorie que Decathlon (blocage technique effectif, pas seulement contractuel).
- **Babolat** : CGU (Article 4) interdisent explicitement la collecte automatisée en masse — clause directe, comparable à celle de Sport 2000 (déjà écarté).
- **Yonex** : CGU interdisent la reproduction de contenu sans autorisation et restreignent tout lien entrant à la page d'accueil uniquement (« Link must be to the home page only ») — incompatible avec le mécanisme `/go/[dealId]` (lien direct vers la fiche produit).
- **Private Sport Shop** : site rendu entièrement en JavaScript côté client (SPA Vue), incompatible avec la méthode technique actée (nœud HTTP n8n + parsing HTML, sans Playwright, D-2026-09-22-02) ; `robots.txt` bloque en plus explicitement `/deals/`, où vivent vraisemblablement ses listings.

Discussion du niveau de risque avec l'utilisateur : pour Babolat/Head, le risque resterait du même ordre que celui déjà assumé pour ProTennis (droit sui generis des bases de données, art. L341-1 CPI — mise en demeure possible, procès improbable à cette échelle) et aurait pu être accepté sur décision explicite. Pour Wilson, le risque est de nature différente (contournement actif d'une protection anti-bot technique, à la marge de l'article 323-1 CP) — écarté de fait, pas seulement proposé à l'arbitrage de l'utilisateur.

**Décision** : plutôt que d'assumer un risque supplémentaire sur Babolat/Head, l'utilisateur pivote vers la recherche de **nouveaux marchands disposant d'un programme d'affiliation public** (pas seulement Awin — tout réseau : Effiliation, Tradedoubler, CJ, Rakuten Advertising, Partnerize, ou programme in-house), via un outil de recherche externe (« cowork »). Un prompt de recherche a été rédigé (critères : vente de matériel tennis en France, programme d'affiliation actif et vérifiable, en excluant les marchands déjà connus/écartés) et remis à l'utilisateur pour exécution hors de cette session.

**Statut** : Actée. Aucun code construit dans cette conversation (étape de cadrage/investigation uniquement). Prochaine étape dépendante du résultat de la recherche cowork, à rapporter par l'utilisateur en début de prochaine conversation.

---

### D-2026-09-23-10 — Chantier « Pages réglementaires » : périmètre, source du contenu et identité

**Contexte** : Reprise du point 4 de la feuille de route (« Reste : mentions légales/CGU, disclosure affiliation, SEO, accessibilité, etc. »), jamais détaillé jusqu'ici. L'utilisateur a demandé explicitement de démarrer ce chantier.

**Décision** :
1. **Périmètre retenu pour cette étape** : mentions légales, CGU, politique de confidentialité/cookies, disclosure affiliation. SEO et accessibilité restent hors périmètre (autres sous-chantiers du point 4, non traités ici).
2. **Source du contenu** : rédigé directement par Claude Code (pas de détour par un outil externe) — texte standard/générique à partir des faits réels du projet, l'utilisateur n'ayant aucune compétence juridique. Explicitement signalé à l'utilisateur : ce n'est pas une rédaction par un professionnel du droit, à faire vérifier avant une mise en prod à fort trafic si une couverture juridique complète est souhaitée.
3. **Faits factuels confirmés par l'utilisateur pour la rédaction** :
   - Éditeur : personne physique (particulier), Mathieu Lenoir, contact `lenoir.math122@gmail.com`.
   - Hébergement : Vercel Inc. Base de données : Neon (sous-traitant technique, aucune donnée personnelle utilisateur stockée à ce jour — pas de comptes utilisateurs sur le site).
   - Domaine : `deals-tennis.vercel.app` uniquement à ce jour (domaine personnalisé prévu mais non acté — pages à rédiger sans dépendre du nom de domaine).
   - Aucun outil d'analytics/tracking tiers installé à ce jour (vérifié dans le code : aucune dépendance analytics dans `package.json`, aucune référence dans le code).
   - Modèle : catalogue d'offres avec redirection d'affiliation vers les marchands (`/go/[dealId]`), marchand actif ProTennis — disclosure à formuler en conséquence.

**Statut** : Actée. Build à suivre dans cette conversation.

---

### D-2026-09-24-01 — Revirement GAP-2026-09-23-06 : usage de scrape.do pour Amazon/Babolat/Wilson/Head/Yonex/Tecnifibre, risque assumé

**Contexte** : GAP-2026-09-23-06 avait explicitement refusé l'usage de scrape.do (service de contournement actif d'anti-bot/CGU) pour Amazon + Babolat/Wilson/Head/Yonex/Tecnifibre + 2 gros revendeurs, au motif d'un risque pénal réel pour le contournement actif d'un dispositif de sécurité technique (art. 323-1 CP, cas concret : PerimeterX chez Wilson) et d'une violation CGU explicite (Babolat/Yonex interdisent la collecte automatisée ; Amazon la sanctionne par résiliation du compte Partenaires). L'alternative retenue à la place était l'ajout manuel supervisé (navigation humaine, script d'insertion réutilisable), jamais construite.

L'utilisateur revient sur ce refus et demande explicitement d'utiliser scrape.do, en reconnaissant que ça contredit la décision précédente.

**Décision** :
1. **Périmètre** : Amazon, Babolat, Wilson, Head, Yonex, Tecnifibre (2 gros revendeurs non nommés restent hors périmètre de cette décision, à traiter séparément si l'utilisateur les remet sur la table).
2. **Motif du revirement** : l'utilisateur réévalue le risque (pénal pour le contournement anti-bot technique, CGU/résiliation de compte pour les autres) comme acceptable et l'assume consciemment — même logique que le risque sui generis des bases de données déjà assumé pour ProTennis, mais ici de nature différente (contournement actif, pas seulement extraction de données publiques) et donc pas automatiquement comparable en gravité. Signalé explicitement à l'utilisateur avant la décision.
3. **Fréquence retenue** : scraping récurrent mais réduit — une fois par mois par marchand, le temps de démarrer (« bootstrap ») le catalogue sur ces marchands, pas un scraping quotidien comme ProTennis.
4. **Caractère temporaire** : l'utilisateur indique vouloir supprimer ce mécanisme après la phase de démarrage (durée/critère d'arrêt non précisés à ce stade — à clarifier avant le build : volume cible ? date ? disponibilité d'une alternative type affiliation ?).
5. **Reste à cadrer avant tout code** (explicitement non traité dans cette conversation, une seule étape de cadrage à la fois) : méthode technique par marchand (quelles pages, quels champs, gestion du rendu JS le cas échéant), mapping catégories/prix par marchand (comme pour Sport Outlet FR, GAP-2026-09-24-01), lieu d'exécution (n8n vs script ponctuel), et le critère de fin du mécanisme temporaire.

**Statut** : Actée (revirement explicite et assumé par l'utilisateur). Remplace la position de refus de GAP-2026-09-23-06 pour ces 6 marchands uniquement. Aucun code construit dans cette conversation — cadrage technique détaillé à faire dans une prochaine conversation dédiée.

---

### D-2026-09-24-02 — Nouveau chantier « scraping local gratuit » : remplace scrape.do, périmètre élargi

**Contexte** : L'utilisateur veut un mécanisme gratuit pour alimenter le catalogue en attendant que d'autres programmes d'affiliation se mettent en place, plutôt que le service payant scrape.do (D-2026-09-24-01). Proposition : un outil piloté localement sur sa machine, qui pilote un vrai navigateur (ex. Playwright) pour naviguer/extraire les données comme le ferait un humain, plutôt que des requêtes HTTP directes (méthode n8n existante pour ProTennis) ou un service tiers de contournement anti-bot payant (scrape.do).

**Décision** :
1. **Remplace scrape.do** : le plan D-2026-09-24-01 (service payant scrape.do) est abandonné au profit de ce nouveau mécanisme, pour le même type d'usage (démarrage/bootstrap du catalogue en attendant des affiliations).
2. **Mécanisme technique** : navigateur réel piloté localement (Playwright pressenti, à confirmer au cadrage technique détaillé), exécuté **manuellement à la demande par l'utilisateur sur sa machine** — pas de cron, pas de serveur permanent, pas d'automatisation planifiée. Choix motivé par la gratuité et la simplicité (contrairement à l'instance n8n permanente sur VM Oracle utilisée pour ProTennis).
3. **Périmètre marchands** (liste confirmée explicitement par l'utilisateur) : Tennispro.fr, Sport 2000, SportSystem, Decathlon, Private Sport Shop, Tennis Pro (déjà identifié comme = Tennispro.fr, pas un doublon), Wilson, Babolat, Yonex, Head, Amazon, Tecnifibre, Tennis Point FR — 12 marchands distincts (Tennis Pro fusionné avec Tennispro.fr).
4. **Point signalé explicitement à l'utilisateur avant d'acter** : piloter un navigateur réel plutôt que scrape.do ne change pas le risque juridique déjà identifié par marchand — les clauses CGU (Babolat, Sport 2000, SportSystem, Amazon, Yonex, Tennispro.fr : usage personnel), le blocage `robots.txt` (Head), et la protection anti-bot technique (Wilson, PerimeterX) restent les mêmes obstacles, qu'on y accède via une requête HTTP, un service tiers ou un navigateur local piloté par un humain. Seul change : le coût (gratuit) et, potentiellement, la détectabilité technique (Wilson/PerimeterX — à vérifier empiriquement, pas garanti). L'utilisateur a déjà assumé ce risque en substance via D-2026-09-24-01 pour 6 de ces marchands ; ce chantier étend l'exécution à un outil local gratuit et à une liste élargie, sur la même base de risque assumé.
5. **Reste à cadrer avant tout code** (non traité dans cette conversation) : vérification réelle robots.txt/CGU pour les marchands jamais évalués (Private Sport Shop, Tecnifibre, Tennis Point FR — ce dernier ayant par ailleurs une candidature Awin en cours, GAP-2026-09-21-03, à ne pas court-circuiter sans clarification), méthode par marchand (pages ciblées, champs, sélecteurs), mapping catégories/prix par marchand, fréquence/critère d'usage (à la demande = pas de fréquence fixe, mais volume cible ou durée de vie du mécanisme à préciser), structure du script (réutilisable par marchand ou un script par marchand), et gestion de l'insertion en base (même route que le workflow n8n existant ou script séparé).

**Statut** : Actée (remplace D-2026-09-24-01/scrape.do). Aucun code construit dans cette conversation — cadrage technique détaillé (par marchand) à faire dans une prochaine conversation dédiée, conformément au protocole (une étape à la fois).

---

### D-2026-09-24-03 — Scraping local gratuit : vérifications restantes faites, périmètre définitif en deux groupes

**Contexte** : Suite à D-2026-09-24-02, reprise du cadrage technique détaillé pour les 12 marchands. Vérifications réelles effectuées cette session (`curl` + Playwright réel, pas de suppositions) :
- **Private Sport Shop** : `robots.txt` **et** page d'accueil bloqués par un WAF edge (403 « The request could not be satisfied », type CloudFront) — vérifié à la fois en `curl` et avec un vrai Chrome piloté par Playwright (non headless, profil persistant, flag `--disable-blink-features=AutomationControlled` désactivé) : blocage confirmé dans tous les cas, y compris avec une IP résidentielle française réelle (pas de VPN/datacenter). Distinct d'un blocage géographique/IP.
- **Tecnifibre** : `robots.txt` autorise `/products/`/`/collections/` ; CGU et mentions légales lues intégralement, aucune clause anti-scraping. Contenu produit présent dans le HTML brut (SSR) — méthode HTTP+parsing suffisante, comme ProTennis.
- **Tennis Point FR** : `robots.txt` très permissif (mentionne même un accès agent via UCP/MCP) ; CGU et mentions légales lues, aucune clause anti-scraping. Listing produit chargé côté client via Algolia (squelettes vides dans le HTML brut) — rendu JS (Playwright) nécessaire, ou piste alternative non explorée : appeler directement l'API Algolia publique du site.
- **Decathlon** et **Wilson** : re-testés avec un vrai navigateur (comme Private Sport Shop) — toujours bloqués (Decathlon : challenge JS jamais résolu ; Wilson : 403 PerimeterX). Un navigateur local simple ne suffit pas à les débloquer.
- **Head** : re-testé avec un vrai navigateur — charge normalement, **aucun blocage technique** malgré un `robots.txt` disant `Disallow: /` sur tout le site (en requête simple `curl`, un checkpoint anti-bot Vercel bloque, mais un vrai navigateur passe). Nécessite Playwright pour passer ce checkpoint.

**Décision** :
1. **Périmètre définitif, deux groupes** :
   - **Actionnables maintenant (9 marchands)** : Tecnifibre, Tennis Point FR, Head, Tennispro.fr, Sport 2000, SportSystem, Babolat, Yonex, Amazon.
   - **Différés à la fin du chantier (3 marchands)** : Decathlon, Wilson, Private Sport Shop — blocage technique edge confirmé non contourné par un navigateur local simple ; seule une technique de contournement plus poussée (usurpation d'empreinte TLS/navigateur, proxy) pourrait éventuellement les débloquer, explicitement mise de côté pour l'instant (l'utilisateur ne veut pas s'engager dans cette voie maintenant, risque pénal art. 323-1 CP déjà signalé pour ce type de contournement actif).
2. **Les 6 marchands à clause CGU explicite (Tennispro.fr, Sport 2000, SportSystem, Babolat, Yonex, Amazon) restent dans le périmètre actionnable** : l'utilisateur assume consciemment ce risque contractuel (mise en demeure possible, résiliation de compte pour Amazon spécifiquement), cohérent avec le risque déjà assumé pour ces mêmes marchands via D-2026-09-24-01 (scrape.do, abandonné) puis D-2026-09-24-02.
3. **Head reste dans le périmètre malgré le `Disallow: /`** : traité comme un signal, pas un verrou technique ni juridique aussi fort qu'une clause CGU explicite — décision explicite de l'utilisateur.
4. **Tennis Point FR** : le scraping local s'applique dès maintenant, en parallèle de la candidature Awin en cours (GAP-2026-09-21-03) — sera remplacé par le flux Awin si/quand la candidature est acceptée, pas d'attente.
5. **Reste à cadrer avant tout code** (non traité dans cette conversation, faute de temps) : URLs de catégories exactes + sélecteurs + mode de rendu (SSR/JS) pour Tennispro.fr, Sport 2000, SportSystem, Babolat, Yonex, Amazon (aucune vérification technique faite, tentatives d'URLs devinées toutes en 404 — à rechercher précisément, pas deviner) ; mapping catégories/prix par marchand ; volume cible ou critère d'arrêt du mécanisme ; structure technique du/des script(s) et lieu d'insertion en base.

**Statut** : Actée. Aucun code construit dans cette conversation (cadrage/vérifications uniquement). Prochaine étape : nouvelle conversation dédiée pour finir le cadrage technique des 6 marchands CGU-risqués restants + mapping/volume/structure, avant tout code.

---

### D-2026-09-24-04 — Scraping local gratuit : rendu/URLs des 6 derniers marchands vérifiés, Yonex retiré du périmètre actionnable, décisions transverses tranchées

**Contexte** : Suite à D-2026-09-24-03 (GAP-2026-09-24-02), reprise du cadrage technique pour les 6 derniers marchands (Tennispro.fr, Sport 2000, SportSystem, Babolat, Yonex, Amazon) dont mode de rendu et URLs restaient à vérifier réellement. Recherche des URLs de catégorie via WebSearch (jamais deviné), vérification du mode de rendu via `curl`/WebFetch (HTML brut) puis Playwright réel quand nécessaire (JS).

**Vérifications réelles effectuées** :
- **Tennispro.fr** : SSR confirmé — HTML brut contient prix (`class="price"`/`"public-price"`, virgule française) et structure produit (`product__title`, `product__brand`, etc.). Méthode HTTP+parsing suffisante, comme ProTennis. URLs catégorie vérifiées (200) : `/raquettes.html`, `/offres/cordages.html`, `/chaussures.html`, `/vetements.html`, `/accessoires.html`.
- **SportSystem** : SSR confirmé — HTML brut contient `regular-price` (prix de base), `price` (prix actuel), `discount-amount`, `product-title`. URLs catégorie vérifiées (200, corrigées après un premier essai en 404/redirect) : `/raquettes-de-tennis-266`, `/cordage-tennis-par-marque-316`, `/chaussures-de-tennis-336`, `/vetements-de-tennis-279`, `/accessoire-raquette-tennis-406`.
- **Sport 2000** : rendu JS confirmé (squelette HTML vide, contenu chargé côté client) — vérifié en Playwright réel : marque (`paragraph`), nom (`link`), prix (`generic` sœur) bien présents après rendu. Playwright nécessaire. URLs vérifiées : raquettes (`/taxons/.../raquettes-tennis`), chaussures (`/chaussures-tennis`), vêtements (`/vetements-tennis`), accessoires (`/accessoires-tennis`) — pas de page « cordages » dédiée trouvée, semble fusionné dans la page accessoires (produits cordage vus dans les résultats de recherche generic, pas de taxon propre) ; à confirmer précisément au moment du build.
- **Babolat** : rendu JS confirmé (Salesforce Commerce Cloud/Demandware, placeholders de chargement en HTML brut). **Site France = `babolat.com/fr/...`, pas `/be/fr/...`** (les premiers résultats de recherche pointaient à tort vers la version Belgique). URLs France vérifiées (200) : `tennis/raquettes.html`, `tennis/cordages.html`, `tennis/chaussures.html`, `tennis/textile.html`, `tennis/accessoires-textiles.html`. Prix et URL produit relative (ex. `/fr/pure-aero-gen9-non-cordee/101569.html`) confirmés visibles après rendu Playwright — directement exploitable pour `/go/[dealId]`.
- **Amazon.fr** : requête simple bloquée (503 via curl/WebFetch, cohérent avec le comportement anti-bot déjà documenté), mais **accessible avec un vrai navigateur Playwright piloté réellement** (non headless) : résultats produits réels avec prix obtenus sur une recherche par mot-clé (`amazon.fr/s?k=raquette+de+tennis`), aucun captcha rencontré pendant ce test. Pas d'URL de catégorie fixe comme les autres marchands — fonctionne par recherche mot-clé/catégorie interne Amazon (`n=...`).
- **Yonex** : en vérifiant le rendu (page catégorie + une fiche produit VCORE), **aucun prix n'apparaît nulle part**, ni en HTML brut ni après rendu complet — seulement noms, images, statut de stock, bouton comparer. Rapproché d'une clause CGU déjà identifiée dans une décision antérieure de ce même cadrage (marques écartées du scraping direct) : lien entrant restreint à la page d'accueil uniquement, incompatible avec `/go/[dealId]`. Signalé explicitement à l'utilisateur avant de continuer.

**Décision** :
1. **Yonex retiré du périmètre actionnable, déplacé en différé** — motif distinct des 3 différés techniques (Decathlon/Wilson/Private Sport Shop, blocage edge) : absence structurelle de prix exploitable + clause de lien profond. L'utilisateur souhaite le reprendre plus tard via un **revendeur** (ex. Intersport), pas via le site de marque Yonex lui-même — non cadré ici, simple marqueur pour une conversation future.
2. **Périmètre actionnable ramené à 8 marchands** : Tecnifibre, Tennis Point FR, Head, Tennispro.fr, Sport 2000, SportSystem, Babolat, Amazon.
3. **Structure technique retenue** : un script par marchand (cohérent avec le pattern ProTennis existant), plutôt qu'un runner commun paramétré — priorité à la simplicité de maintenance/débogage marchand par marchand sur la réduction de duplication.
4. **Critère d'arrêt retenu** : seuil de volume par marchand plutôt que pas de critère chiffré ou une durée de vie fixée. **Seuil initial : 30 articles tennis actifs par marchand**, répartis entre les 5 catégories (raquettes, cordages, chaussures, textile, accessoires) — explicitement révisable plus tard par l'utilisateur, pas une contrainte technique dure.
5. **Reste à cadrer avant tout code** : mapping exact catégorie site → nos 5 catégories pour Sport 2000 (cordages potentiellement fusionné avec accessoires) ; structure précise des champs (sélecteurs prix/nom/marque/URL produit) figée en spec pour Sport 2000/Babolat/Amazon (observée en Playwright cette session mais pas encore écrite en contrat technique) ; lieu d'insertion en base (réutilisation du schéma `deals`/`products` existant, comme ProTennis/Sport Outlet FR).

**Statut** : Actée. Aucun code construit dans cette conversation (cadrage/vérifications uniquement). Prochaine étape : nouvelle conversation dédiée pour finir la spec technique détaillée (mapping/champs précis par marchand) puis premier build, avant tout code.

---

### D-2026-09-24-05 — Scraping local gratuit : mapping/sélecteurs figés pour Sport 2000/Babolat/Amazon, traitement Babolat sans promo et mots-clés Amazon tranchés

**Contexte** : Suite à D-2026-09-24-04 (GAP-2026-09-24-02), dernier point de cadrage technique restant avant le premier build : mapping catégorie Sport 2000 (cordages), sélecteurs précis (prix/nom/marque/URL) pour Sport 2000/Babolat/Amazon, lieu d'insertion en base.

**Vérifications réelles effectuées (Playwright piloté réellement, navigateur non headless)** :
- **Sport 2000** : confirmé — les cordages n'ont **aucun taxon dédié** ; ils sont mélangés à d'autres équipements (grips, antivibrateurs, overgrips) dans `accessoires-tennis/equipements-tennis` (ex. `Cordage TGV 1,30 (PU)` vu dans ce taxon, aux côtés de `Grip tennis X-TRA FEEL`). Sélecteurs confirmés sur les cartes produit (`.mini-product`) : marque = `.mini-product__brand` (`<p>`), titre + lien = `.mini-product__name` (`<a>`, `href` relatif `/products/...`), prix actuel = `.mini-product__price-current`, prix barré optionnel = `.mini-product__price-old`, badge réduction optionnel = `.mini-product__discount .discount__value`.
- **Babolat** : sélecteurs confirmés sur les cartes produit (`div.product[data-pid]`, SFCC) : titre = `.c-product-tile__product-name`, prix = `span.c-price__value` avec un attribut `content="279.95"` (point décimal, directement exploitable sans parser la virgule française affichée), lien relatif `.html` sur la carte. **Aucun produit en promotion trouvé** sur les 5 catégories vérifiées (raquettes/cordages/chaussures/textile/accessoires-textiles) — pas de prix barré nulle part au moment du test, pas de section soldes/outlet trouvée sur le site.
- **Amazon** : sélecteurs confirmés sur les résultats de recherche (`amazon.fr/s?k=...`) : carte = `[data-asin]`, titre = `h2 span`, prix actuel = `.a-price .a-offscreen`, prix de référence optionnel = `.a-price.a-text-price .a-offscreen`, lien = `a[href*="/dp/"]` (URL à reconstruire proprement depuis l'ASIN — `amazon.fr/dp/{asin}` — plutôt que garder le lien avec paramètres de tracking). Pas d'élément marque distinct sur la carte : extraction depuis le titre nécessaire (même logique que ProTennis/Sport Outlet FR, `lib/product-matching.ts`).

**Décision** :
1. **Sport 2000 — mapping cordages** : classification par mot-clé sur le titre (ex. `cordage`/`bobine cordage`, insensible à la casse) au sein du taxon `equipements-tennis`, pas par URL/taxon (aucun n'existe pour ce sous-type).
2. **Babolat — pas de promo actuellement** : ingéré quand même dès maintenant, `discount_percentage = 0` accepté (schéma déjà compatible, `discount_check` autorise `>= 0`). La notion de prix de référence/RRP pour Babolat (et plus largement, une fois tous les marchands catégorisés) sera retravaillée dans une conversation ultérieure — non cadrée ici, explicitement reporté par l'utilisateur.
3. **Amazon — mots-clés de recherche** : mots-clés simples en français pour démarrer, un par catégorie : `raquette de tennis`, `cordage tennis`, `chaussures de tennis`, `vêtement de tennis`, `accessoire tennis`. Affinage (ciblage par marque/modèle connus) explicitement différé à une fois les premières données récoltées et observées — non cadré ici.
4. **Lieu d'insertion en base** (décision mineure, tranchée sans nouvelle question — cohérente avec tous les marchands déjà intégrés) : réutilisation intégrale du schéma existant (`merchants`/`deals`/`products`), comme ProTennis et Sport Outlet FR. Pas de nouvelle table : ces 8 marchands sont des sources d'offres tennis de plus, pas un modèle de données différent.

**Statut** : Actée. Aucun code construit dans cette conversation (cadrage/vérifications uniquement). Ceci clôt le cadrage technique de GAP-2026-09-24-02 pour les 3 marchands qui manquaient (Sport 2000/Babolat/Amazon) ; les 5 autres marchands actionnables (Tecnifibre, Tennis Point FR, Head, Tennispro.fr, SportSystem) ont déjà leurs sélecteurs de base identifiés dans D-2026-09-24-03/04. Prochaine étape : premier build (script(s) de scraping local), à confirmer explicitement en début de prochaine conversation — pas enchaîné dans celle-ci (une étape de build par conversation).

---

### D-2026-09-25-01 — Nouveau filtre catalogue « sexe / âge », principe et sourcing tranchés

**Contexte** : L'utilisateur veut ajouter des dimensions de filtrage catalogue supplémentaires (sexe, âge adulte/enfant), en parallèle d'une autre conversation active sur le scraping (`scripts/scraping/tennispro.ts` en cours, non lié à ce cadrage). Aucun champ sexe/âge n'existe dans `data-model.md` (`deals`/`products`), et aucun marchand déjà scrapé (ProTennis, Tecnifibre) ne fournit cette donnée comme champ structuré distinct du titre.

**Décision (questions posées explicitement à l'utilisateur, réponses actées)** :
1. **Nature** : filtres/facettes (homme/femme/mixte, adulte/enfant), combinables avec les filtres catégorie existants — pas une option du dropdown de tri (`SORT_OPTIONS`), qui reste dédié à un ordre (prix, date, réduction).
2. **Source de la donnée** : extraction heuristique depuis le titre scrappé (même logique que `extractColor`/`extractModel` dans `lib/product-matching.ts`), **croisée avec le champ marchand quand il existe** (ex. une catégorie marchand explicite homme/femme/enfant prime sur l'heuristique titre si disponible).
3. **Emplacement modèle** : sur `products` (attribut de l'article rapproché multi-marchands), pas sur `deals` — cohérent avec `brand`/`model` déjà présents sur `products`.
4. **Périmètre catégories** : toutes les catégories (`raquettes`, `cordages`, `chaussures`, `textile`, `accessoires`) ; les catégories peu concernées (cordages, accessoires) resteront très majoritairement "non déterminé"/"mixte" en pratique, pas d'exclusion en dur.

**Non tranché à ce stade (reporté à la/aux conversation(s) de build)** : liste exacte des valeurs autorisées (ex. `homme`/`femme`/`mixte`/`enfant` vs `adulte`/`enfant` séparé du sexe — deux dimensions ou une seule ?), mots-clés précis de l'heuristique d'extraction par catégorie, migration SQL exacte, rétro-application (backfill) sur les ~1500+ offres déjà en prod, UI exacte du sélecteur de filtre (emplacement, combinaison avec la recherche groupée par article).

**Statut** : Actée (principe et sourcing). Cadrage uniquement dans cette conversation — aucun code construit, pas de migration appliquée. Découpage en étapes de build proposé dans `GAPS_OUVERTS.md` (GAP-2026-09-25-01), à traiter dans une conversation dédiée séparée de celle en cours sur le scraping, une étape à la fois.

---

### D-2026-09-25-02 — Filtre sexe/âge : modélisation en deux colonnes séparées

**Contexte** : Suite à D-2026-09-25-01 (point 1 de GAP-2026-09-25-01). Question posée explicitement : deux colonnes indépendantes (sexe, âge) ou une seule dimension combinée ?

**Décision** : deux colonnes séparées sur `products` — `gender` (`homme`/`femme`/`mixte`/`non_determine`) et `age_group` (`adulte`/`enfant`/`non_determine`), indépendantes l'une de l'autre. Permet de filtrer sur l'âge seul sans présumer du sexe (ex. un article enfant peut rester `gender = non_determine`).

**Statut** : Actée le 2026-09-25. Reste à trancher (GAP-2026-09-25-01) : mots-clés de l'heuristique, migration+backfill, intégration n8n, UI.

---

### D-2026-09-25-03 — Filtre sexe/âge : lexique de l'heuristique d'extraction, vérifié sur les titres réels de prod

**Contexte** : Suite à D-2026-09-25-02 (point 2 de GAP-2026-09-25-01). Échantillon réel interrogé sur les 1927 offres de prod avant de figer un lexique (même démarche que `extractColor`) :
- `chaussures` : 339/344 titres portent homme/femme ; `textile` : 516/564 (48 restants = articles unisexes : chaussettes, casquettes, manchons) ; `raquettes` : 37/455 (uniquement junior/enfant, sauf « Evo Drive Femme ») ; `accessoires` : 10/291 (sacs à dos enfant) ; `cordages` : 0/273.
- Mots anglais (`men`/`women`/`boy`) quasi absents des titres réels (marchands français) et risqués en faux positifs sans limite de mot stricte (`men` matchait « ELEMENT », « Menthe », « Tournament ») — écartés du lexique.

**Décision (lexique retenu, mots entiers insensibles à la casse)** :
- `gender` : `femme` si le titre contient `femme`, `fille` ou `lady` ; `homme` si le titre contient `homme` ou `garçon`/`garcon` ; `mixte` si les deux groupes sont présents ; `non_determine` sinon.
- `age_group` : `enfant` si le titre contient `enfant`, `junior`, `jr`, `kids`/`kid`, `fille` ou `garçon`/`garcon` ; `adulte` par défaut sinon (pas de valeur `non_determine` pour l'âge — un article sans mot-clé enfant est considéré adulte).

**Statut** : Actée le 2026-09-25. Reste à trancher (GAP-2026-09-25-01) : migration+backfill, intégration n8n, UI.

---

### D-2026-09-25-04 — Filtre sexe/âge : règle de réconciliation quand un même produit regroupe plusieurs offres

**Contexte** : Suite à D-2026-09-25-03, en conversation de build (migration + backfill, point 3 de GAP-2026-09-25-01). `gender`/`age_group` vivent sur `products`, mais l'heuristique s'applique par titre d'offre (`deals.title`) — un même produit peut regrouper plusieurs offres marchandes avec des titres différents. Question posée explicitement : que faire si deux offres du même produit donnent des valeurs différentes ? L'utilisateur a soulevé un risque plus profond : que le rapprochement produit actuel (`brand`+`model`+`category`) fusionne à tort un article junior et sa version adulte sous le même `product_id`.

**Vérification réelle avant décision** : script de lecture seule exécuté contre la prod (135 produits avec ≥2 offres rattachées) — **0 désaccord gender, 0 désaccord age_group** trouvé. Cause : `extractModel` (`lib/product-matching.ts`) ne retire pas les mots « Junior »/« Jr » du titre, donc une variante junior produit un texte de modèle différent de la version adulte et devient déjà un `products` distinct — le risque soulevé ne se matérialise pas avec l'extraction actuelle.

**Décision (règle de robustesse pour les backfills/upserts futurs, y compris n8n)** : lors du calcul de `gender`/`age_group` d'un produit à partir des offres qui lui sont rattachées, la première valeur déterminée rencontrée fait foi et n'est jamais écrasée ensuite par une valeur différente. Si un vrai conflit apparaît un jour (nouvelle offre avec un titre donnant une valeur différente d'une valeur déjà déterminée), il est **loggé** pour investigation manuelle plutôt que résolu silencieusement (pas d'écrasement automatique, pas de valeur `mixte`/`non_determine` forcée par le système).

**Statut** : Actée le 2026-09-25. Reste à construire dans cette même conversation : migration SQL, backfill vérifié sur la prod.

---

### D-2026-09-25-05 — Filtre sexe/âge : UI (emplacement, structure, comportement)

**Contexte** : Suite à D-2026-09-25-04 (code + déploiement n8n faits). Point 5 de GAP-2026-09-25-01 — construction de l'UI du filtre catalogue, décisions structurantes posées explicitement avant le build :

1. **Emplacement** : nouvelle ligne dédiée sous le filtre catégorie existant (même famille visuelle que `CategoryFilter`, pas fusionnée sur la même ligne, pas un dropdown séparé façon tri).
2. **Structure** : deux filtres indépendants (sexe, âge), pas un contrôle combiné — cohérent avec les deux colonnes distinctes `products.gender`/`products.age_group` (D-2026-09-25-02), combinables librement (ex. « Femme » + « Enfant »).
3. **Deals sans `product_id`** : exclus dès qu'un filtre sexe ou âge (autre que "Tous") est actif — `gender`/`age_group` vivent sur `products`, pas sur `deals`, un deal non rapproché n'a pas de valeur connue.
4. **Libellés sexe** : Tous / Homme / Femme / Mixte (les 3 valeurs de `gender` autres que `non_determine`).
5. **Valeurs `non_determine`/absentes** : exclues du résultat dès qu'un filtre sexe ou âge est actif (même logique que le point 3 — LEFT JOIN products, la condition sur `p.gender`/`p.age_group` exclut naturellement les NULL).

**Décision mineure tranchée seule (âge)** : libellés Âge = Tous / Adulte / Enfant, mapping direct des deux valeurs de `age_group` (aucune ambiguïté, pas soumis explicitement).

**Implémentation** : `lib/filters.ts` (`CatalogGenderFilter`/`CatalogAgeGroupFilter`, `GENDER_LABELS`/`AGE_GROUP_LABELS`, `isValidGender`/`isValidAgeGroup`), `lib/catalog-url.ts` (`gender`/`age_group` dans `CatalogQueryState`), `lib/deals.ts` (`LEFT JOIN products p ON d.product_id = p.id` ajouté conditionnellement dans `getCatalogDeals`/`getGroupedCatalogDeals`, conditions `p.gender = $x`/`p.age_group = $y`), nouveau composant `components/gender-age-filter.tsx` (deux rangées de pills, même style que `CategoryFilter`), propagation des deux nouveaux paramètres d'URL à travers tous les composants qui construisent un `buildCatalogHref` (`CategoryFilter`, `SortDropdown`, `SearchBar`, `Pagination`, `NotificationBanner`).

**Vérifié réellement** : lint/build/`npm test` clean (3 échecs préexistants sans rapport, voir GAP-2026-09-25-03) ; 4 nouveaux tests contrat sur `getCatalogDeals` (filtre gender seul, filtre age_group seul, exclusion des deals sans `product_id`, combinaison avec le filtre catégorie) passent contre la prod ; vérification navigateur (Playwright) sur le catalogue de prod local : clic "Femme" met à jour l'URL (`?gender=femme`) et les résultats (textile femme uniquement), combinaison avec "Enfant" fonctionne (`?gender=femme&age_group=enfant`, articles "fille"/"Enfant"), le mode recherche groupée préserve les filtres actifs (`?gender=femme&age_group=enfant&q=Babolat`), l'état vide affiche le message + lien de réinitialisation existant (`/`, remet tout à zéro), layout mobile (390×844) vérifié.

**Statut** : Actée et construite le 2026-09-25.

---

### D-2026-09-25-06 — Scraping local Sport 2000 : méthode HTTP+Algolia plutôt que Playwright (décision mineure, tranchée seule et documentée)

**Contexte** : D-2026-09-24-03 avait figé la méthode technique pour Sport 2000 comme « Playwright nécessaire » (contenu chargé côté client, squelette HTML vide constaté). En reprenant le build (2026-09-25), inspection réelle du réseau pendant le rendu Playwright : le catalogue est chargé via une requête `POST` vers l'API Algolia (`604535r4dx-dsn.algolia.net`), avec une clé API « search-only » publique exposée dans le bundle JS du site (design normal d'Algolia — cette clé est faite pour être appelée directement par n'importe quel client, lecture seule, pas un contournement d'une protection). Vérifié réellement : la même requête fonctionne à l'identique en `curl` brut, sans session navigateur ni cookies.

**Décision (mineure, tranchée seule)** : interroger directement cet endpoint Algolia en HTTP simple plutôt que piloter Playwright — même principe déjà appliqué à Tecnifibre (endpoint JSON Shopify plutôt que parsing HTML) : plus robuste, plus rapide, cohérent avec le reste des scripts (tous HTTP, aucun autre n'utilise Playwright en exécution). Le risque juridique/contractuel déjà assumé (clause anti-bot CGV Sport 2000, D-2026-09-22-01/D-2026-09-24-03/04/05) est inchangé — même donnée publique, juste un chemin d'accès HTTP direct au lieu d'un rendu navigateur complet.

**Taxonomie confirmée réellement** (family_ids Algolia, une requête par page catégorie visitée) : raquettes-tennis=1693, vetements-tennis=1686, chaussures-tennis=1690, accessoires-tennis/balles-tennis=1692, accessoires-tennis/sacs-tennis=1694, accessoires-tennis/equipements-tennis=1695 (cordages sans taxon dédié, mapping par mot-clé confirmé conforme à D-2026-09-24-05). Le taxon parent « accessoires-tennis » (1691) n'est jamais interrogé directement (regrouperait ses enfants en double).

**Filtrage remise** : `percent_discount > 0` dans la requête Algolia — 0 raquette/balle/sac en promo au moment de la vérification, 97 chaussures + 65 textile + 3 équipements (aucun cordage) retenus. Volume total (165) largement au-dessus du seuil de 30 (D-2026-09-24-04). Contrairement à Babolat (D-2026-09-24-05), pas de besoin d'ingérer à 0% — le volume réel suffit déjà.

**Statut** : Actée le 2026-09-25 (décision mineure documentée a posteriori, pas de question structurante posée — même nature que le choix technique Tecnifibre). Build réalisé et vérifié dans la même conversation (voir `ETAT_ACTUEL.md`).

---

### D-2026-09-25-07 — Renommage de la marque affichée : Deals Tennis → Tennisdeals (périmètre restreint)

**Contexte** : Amorcé par l'utilisateur en lien avec le chantier SEO/accessibilité (nom jugé « plus parlant »), traité comme une étape autonome dans une conversation dédiée en parallèle du scraping Babolat. Isolé dans un git worktree dédié (`chore/rename-tennisdeals`) après une première tentative dans le répertoire de travail principal écrasée par un changement de branche de la conversation Babolat (même dossier partagé).

**Périmètre soumis et confirmé explicitement** :
1. **Inclus** : nom affiché sur le site (header/footer, métadonnées de page `app/layout.tsx`, textes des 4 pages réglementaires — mentions légales, CGU, confidentialité, affiliation) ; champ `name` de `package.json`.
2. **Exclus** : URL Vercel (`deals-tennis.vercel.app` inchangée — la page mentions légales continue de la citer littéralement), nom du dépôt GitHub (`lenoirmath122-dev/deals-tennis` inchangé).

**Implémentation** : remplacement textuel de toutes les occurrences de « Deals Tennis » par « Tennisdeals » dans `app/layout.tsx` (title/template), `components/footer.tsx`, `app/mentions-legales/page.tsx`, `app/cgu/page.tsx`, `app/confidentialite/page.tsx`, `app/affiliation/page.tsx` ; `package.json` (`name: "deals-tennis"` → `"tennisdeals"`).

**Vérifié réellement** : `npm run lint`/`npm run build` clean ; rendu HTTP réel sur un serveur dev dédié à ce worktree (`curl` sur `/`, `/mentions-legales`, `/cgu`, `/confidentialite`, `/affiliation`) confirmant le nouveau nom affiché et l'absence de toute occurrence résiduelle de « Deals Tennis » dans le code applicatif (`app/`, `components/`).

**Statut** : Actée et construite le 2026-09-25.

---

### D-2026-09-25-08 — Scraping local Babolat : méthode HTTP+AJAX plutôt que Playwright, périmètre accessoires étendu (décisions mineures, tranchées seules et documentées)

**Contexte** : D-2026-09-24-04 avait figé la méthode technique pour Babolat comme « rendu JS, Playwright nécessaire » (placeholders de chargement constatés en HTML brut à l'époque). En reprenant le build (2026-09-25), vérification réelle via `curl` brut (sans navigateur) : les cartes produit complètes (prix, nom, lien) sont en fait déjà présentes dans le HTML retourné par une requête HTTP simple. Le site (Salesforce Commerce Cloud) expose en plus un endpoint de pagination AJAX public non authentifié (`/on/demandware.store/Sites-babolateu-Site/fr_FR/Search-ShowAjax?cgid=...&start=...&sz=...`), vérifié réellement, qui renvoie le même balisage — utilisé directement pour toutes les pages.

**Décision (mineure, tranchée seule)** : interroger cet endpoint AJAX en HTTP simple plutôt que piloter Playwright — même principe déjà appliqué à Tecnifibre (JSON Shopify) et Sport 2000 (Algolia, D-2026-09-25-06) : plus robuste, plus rapide, cohérent avec le reste des scripts. Le risque contractuel déjà assumé (CGU Babolat, D-2026-09-24-01/02/03) est inchangé — même donnée publique, juste un chemin d'accès HTTP direct.

**Pagination réelle découverte en cours de build** : la page HTML statique de chaque catégorie ne montre que le premier lot (24 articles maximum), masquant le reste — vérifié réellement que la catégorie chaussures affiche 24 articles en HTML brut mais en compte réellement 90 une fois toutes les pages AJAX récupérées (`sz=24` par page). Le script pagine systématiquement jusqu'à une page renvoyant moins de 24 articles.

**Périmètre accessoires étendu (décision mineure)** : D-2026-09-24-05 n'avait figé qu'une seule page accessoires (`accessoires-textiles.html`, casquettes/chaussettes/bandeaux/serviettes). En vérifiant la navigation réelle du site, 4 pages accessoires supplémentaires distinctes ont été trouvées et ajoutées, toutes mappées vers la même catégorie interne `accessoires` : grips, surgrips, accessoires raquette (antivibrateurs, housses, etc.), sacs. Décision tranchée seule (même nature que les choix techniques ci-dessus) pour refléter fidèlement le catalogue réel du marchand plutôt que de se limiter arbitrairement à la première page trouvée en cadrage.

**Aucune promotion active retrouvée** sur les 9 pages catégorie au moment de la vérification (comme au 2026-09-24) — `discount_percentage = 0` accepté pour toutes les offres, conformément à D-2026-09-24-05 (prix de référence à retravailler plus tard, explicitement hors périmètre de cette étape).

**Statut** : Actée le 2026-09-25 (décisions mineures documentées a posteriori, pas de question structurante posée). Build réalisé et vérifié dans la même conversation (voir `ETAT_ACTUEL.md`). **Traitement "ingéré à 0%" revu et abandonné par D-2026-09-25-09.**

---

### D-2026-09-25-09 — Babolat : abandon du traitement "ingéré à 0% de réduction" (D-2026-09-24-05/D-2026-09-25-08), incohérent avec les autres marchands

**Contexte** : L'utilisateur a remarqué en production que les offres Babolat affichaient un prix barré identique au prix affiché avec un badge « -0% » — conséquence visuelle du choix acté en D-2026-09-24-05 d'ingérer tout le catalogue Babolat même sans promo active, faute de prix de référence. En comparant au traitement des autres marchands (question posée explicitement par l'utilisateur) : Sport 2000 filtre `percent_discount > 0` côté requête (D-2026-09-25-06), Tecnifibre/SportSystem ne parcourent que des collections/pages déjà 100% promotionnelles côté marchand — aucun des trois marchands n'expose jamais de "deal" sans remise réelle. Babolat était la seule exception, parce que le site n'a pas de page promo dédiée et qu'aucune promo n'était active au moment du cadrage.

**Vérifié réellement (2026-09-25)** : les 9 pages catégorie Babolat (`curl` direct sur l'endpoint AJAX `Search-ShowAjax`) ne contiennent toujours, à ce jour, aucun élément de prix barré (`c-price__list` ou équivalent) — confirmé identique à la vérification du 2026-09-24/25 initiale, sur les 9 sous-catégories.

**Décision** : `scripts/scraping/babolat.ts` ne doit plus ingérer une offre sans remise réelle détectée (`comparePrice`/`listPrice` absent ou inférieur/égal au prix courant) — même traitement que Tecnifibre pour ses catégories sans promo (`skippedNoDiscount`, 0 article accepté tant qu'aucune vraie promo n'existe). Le script gagne un sélecteur `c-price__list` (déduit par convention SFCC, non observé en conditions réelles faute de promo active) pour le jour où Babolat lancera une vraie promotion. **Nettoyage de la base de prod** : les 301 offres déjà insérées à `discount_percentage = 0` (D-2026-09-25-08) ont été passées à `status = 'expired'`/`is_active = false` par une requête SQL ponctuelle (hors script, exécutée une fois manuellement) — le garde-fou anti-vidage en masse du script (`seenUrls.length > 0`) empêche `main()` de le faire lui-même puisqu'aucune de ces offres n'est plus "revue" par la nouvelle logique.

**Conséquence acceptée** : Babolat peut retomber à 0 offre active en base tant qu'aucune promo réelle n'existe sur le site — cohérent avec le principe "Tennisdeals = du bon plan", au prix d'un volume de catalogue potentiellement nul pour ce marchand.

**Statut** : Actée et corrigée le 2026-09-25, dans la même conversation que la découverte (branche `feat/scraping-babolat`, PR #48 déjà ouverte). Vérifié réellement : `npx tsc --noEmit` clean, requête de nettoyage exécutée contre la base Neon de prod avec vérification du nombre de lignes affectées (301 trouvées, 301 expirées), script temporaire de nettoyage supprimé après usage.

---

### D-2026-09-25-10 — Chantier SEO/GEO : plan en 7 blocs, ordre acté, un bloc par conversation

**Contexte** : Reprise du chantier « SEO / accessibilité » (D-2026-09-25-07) dans une nouvelle conversation, l'utilisateur se déclarant totalement novice sur le sujet et demandant un cadrage explicite avant tout code. Objectif clarifié par question posée : référencement Google **et** référencement dans les IA génératives (ChatGPT, Perplexity, Claude...) — pas seulement le partage social.

**Plan proposé et confirmé explicitement par l'utilisateur** (« on fait tous ces blocs, un bloc à la fois ») :

1. **Fondations techniques** : `robots.txt`, `sitemap.xml`, métadonnées par page (actuellement seule la page racine a un titre/description fixes dans `app/layout.tsx`).
2. **Données structurées (Schema.org / JSON-LD)** : balisage `Product`/`Offer` sur les fiches — sert à la fois les rich snippets Google (prix affiché dans les résultats) et les IA génératives (faits structurés à citer).
3. **URLs canoniques / contenu dupliqué** : le catalogue génère de nombreuses variantes d'URL (filtres catégorie/sexe/âge/tri/recherche) pour un même contenu — à clarifier pour Google et les IA.
4. **Ouverture aux robots IA** : décision explicite à prendre sur l'autorisation des crawlers d'IA (GPTBot, ClaudeBot, PerplexityBot, Google-Extended...) via `robots.txt`.
5. **`llms.txt`** : convention récente (non standardisée officiellement) résumant le site pour les IA à la racine du domaine.
6. **Performance / Core Web Vitals** : audit de vitesse de chargement (critère de classement Google), décision de chantier dédié ou non selon le résultat de l'audit.
7. **Open Graph** : métadonnées de partage social (aperçus Twitter/X, Facebook, WhatsApp) — bonus peu coûteux une fois le bloc 1 fait, hors objectif principal mais mentionné par Claude Code et accepté dans le périmètre global.

**Modalités actées** : un bloc = une conversation dédiée de build, mise à jour des fichiers de suivi (`ETAT_ACTUEL.md`/`GAPS_OUVERTS.md`/`JOURNAL_SESSIONS.md`) et changement de conversation systématique à la fin de chaque bloc — cohérent avec le protocole général (une étape de build par conversation), pas une règle spécifique à ce chantier.

**Statut** : Actée le 2026-09-25. Cadrage du plan global uniquement — aucune décision de détail tranchée pour chaque bloc (ex. quels crawlers IA autoriser au bloc 4) : à traiter dans la conversation dédiée à chaque bloc, avant tout code, conformément au protocole.

---

### D-2026-09-25-11 — Tennis Point FR : nettoyage de données seed + extension du lexique sexe/âge au pluriel français

**Contexte 1 (nettoyage de données)** : en vérifiant la base de prod avant de créer le vrai marchand Tennis Point FR, découverte de 3 marchands **fictifs** issus du seed MVP initial (2026-09-21) toujours présents et **actifs en production** : `All4Tennis` (3 offres), `Extreme Tennis` (3 offres), `Tennis-Point` (4 offres, collision de nom directe avec le marchand à créer) — toutes avec des URLs d'affiliation factices (`affiliate.example.com`), jamais nettoyées depuis le MVP. Des visiteurs réels ont donc pu voir/cliquer des liens cassés pendant 4 jours.

**Décision** : soumis explicitement à l'utilisateur (3 options : tout nettoyer / nettoyer seulement la collision de nom / ne rien nettoyer). L'utilisateur a choisi de tout nettoyer immédiatement, avant de construire Tennis Point FR. Exécuté : suppression des 10 deals puis des 3 marchands fictifs en base de prod (requêtes SQL ponctuelles, hors script/migration — vérifié réellement, 0 ligne résiduelle après suppression).

**Contexte 2 (lexique sexe/âge)** : les titres Tennis Point FR utilisent systématiquement le pluriel français ("Hommes"/"Femmes"/"Enfants"). Le lexique partagé `extractGender`/`extractAgeGroup` (`lib/product-matching.ts`, D-2026-09-25-03) ne reconnaissait que le singulier — la limite de mot `\b` échoue entre le radical et le "s" final, donc `\bfemme\b` ne matche pas "Femmes". Impact mesuré bien plus large que le cas isolé de GAP-2026-09-25-06 (Babolat, anglais non reconnu) : sans le fix, la quasi-totalité des titres textile/chaussures de ce marchand retombaient sur `non_determine`/`adulte`.

**Décision** : soumis explicitement à l'utilisateur (étendre le lexique partagé vs. accepter `non_determine` et journaliser un nouveau GAP, même traitement que Babolat). L'utilisateur a choisi d'étendre le lexique partagé. `FEMALE_PATTERN`/`MALE_PATTERN`/`CHILD_PATTERN` acceptent désormais un "s" optionnel final. Le pluriel étant un sur-ensemble strict du singulier, aucune régression possible sur les marchands déjà scrapés (tout ce qui matchait avant matche encore). Non répercuté sur le miroir JS du workflow n8n ProTennis dans cette conversation (pas le sujet de cette étape) — à resynchroniser lors d'une prochaine intervention sur ce workflow.

**Contexte 3 (méthode technique Tennis Point FR)** : D-2026-09-24-04 notait "Algolia, rendu JS/Playwright nécessaire" pour ce marchand. Vérifié réellement en début de build (2026-09-25) : `robots.txt` identifie explicitement le site comme une boutique Shopify standard ("Shopify storefront... HTML is crawlable"), pas d'Algolia — la note de cadrage était obsolète ou erronée. CGV vérifiées : aucune clause anti-scraping.

**Décision (mineure, tranchée seule, même nature que les choix techniques Tecnifibre/Sport 2000/Babolat)** : endpoint JSON public Shopify `/collections/<handle>/products.json` utilisé directement (aucun Playwright), cible les deux collections promotionnelles du site (`aktion-10-sale`, `aktion-deal`) plutôt que les pages catégorie tennis (trop fragmentées par marque côté marchand, aucune collection de premier niveau exploitable).

**Statut** : Actée et construite le 2026-09-25 (branche `feat/scraping-tennis-point-fr`, PR #50). Vérifié réellement : 2427 offres réelles en base de prod, `product_id` à 100%, idempotence et éviction testées, lint/typecheck/build clean, vérification navigateur/HTTP (marque « BIDI BADU » trouvée en recherche). Voir `ETAT_ACTUEL.md` pour le détail complet.

---

### D-2026-09-25-12 — Chantier SEO/GEO, bloc 1 (fondations techniques) : décisions cadrées et actées

**Contexte** : Reprise du chantier SEO/GEO sur le bloc 1 du plan en 7 blocs (D-2026-09-25-10), conformément au protocole (cadrage explicite avant tout code, un bloc = une conversation).

**Décisions soumises et confirmées par l'utilisateur avant code** :
1. **URL canonique** : `https://deals-tennis.vercel.app` (aucun domaine personnalisé pour l'instant) — utilisée dans `robots.txt`, `sitemap.xml` et comme base des URL de métadonnées.
2. **Sitemap dynamique** : `app/sitemap.ts` génère les pages fixes (accueil, affiliation, cgu, confidentialite, mentions-legales) + une entrée par offre active (`deals.status = 'active' AND is_active = true AND (expires_at IS NULL OR expires_at > NOW())`), plutôt qu'un sitemap statique limité aux pages fixes.
3. **`/go/[dealId]` exclu de l'indexation** : `Disallow: /go/` dans `robots.txt` — c'est une redirection de tracking affilié, pas une page de contenu.
4. **Métadonnées par page** : titre + description dédiés sur les 4 pages statiques (affiliation, cgu, confidentialite, mentions-legales) — elles avaient déjà un titre mais pas de description. La page catalogue racine a été jugée déjà couverte par le titre/description par défaut de `app/layout.tsx` (rédigés spécifiquement pour la page d'accueil), donc aucune métadonnée additionnelle n'y a été ajoutée pour éviter la duplication.

**Décision mineure tranchée seule** : `export const revalidate = 3600` sur `app/sitemap.ts` (ISR, 1h) plutôt qu'un rendu entièrement dynamique à chaque requête — équilibre entre fraîcheur du catalogue (qui change en continu via le scraping) et charge sur la base Neon de prod à chaque crawl. Pas de champ structurant nécessitant validation utilisateur.

**Hors périmètre de ce bloc** (traité dans les blocs suivants du plan) : données structurées Schema.org, URLs canoniques pour le contenu dupliqué des filtres catalogue, ouverture aux robots IA, `llms.txt`, performance, Open Graph.

**Statut** : Actée et construite le 2026-09-25 (branche `feat/seo-fondations-techniques`, PR #52). Vérifié réellement : `npx tsc --noEmit` et `npm run lint` clean, `npm run build` clean (`robots.txt`/`sitemap.xml` générés), serveur de production local testé via `curl` (`robots.txt` conforme, `sitemap.xml` avec 5706 URL = 5701 offres actives + 5 pages fixes, compte confirmé par une requête `COUNT(*)` SQL directe sur la base Neon de prod), balises `<title>`/`<meta name="description">` vérifiées sur `/affiliation`.

---

### D-2026-09-25-13 — Chantier SEO/GEO, bloc 2 (données structurées JSON-LD Product/Offer) : décisions cadrées et actées

**Contexte** : Reprise du chantier SEO/GEO sur le bloc 2 du plan en 7 blocs (D-2026-09-25-10, bloc 1 terminé en D-2026-09-25-12), conformément au protocole (cadrage explicite avant tout code, un bloc = une conversation).

**Décisions soumises et confirmées par l'utilisateur avant code** :
1. **Périmètre des pages** : uniquement la page détail deal (`/deal/[dealId]`), pas le catalogue dans ce bloc — sur recommandation explicite (valeur SEO/GEO la plus forte, scope vérifiable proprement ; l'utilisateur a demandé conseil plutôt que de trancher lui-même, confirmé ensuite explicitement).
2. **Structure de l'Offer** : un seul `Offer` (le deal effectivement affiché sur la page), pas d'`AggregateOffer` résumant le multi-marchand ni de tableau d'`Offer` par marchand — les autres offres du même article restent visibles dans le HTML de la page mais hors JSON-LD.
3. **`seller`** : le marchand réel (ex. « Tennis Point FR »), pas Tennisdeals — cohérent avec le rôle d'agrégateur/affilié du site (le clic redirige vers le marchand via `/go/[dealId]`).

**Décision mineure tranchée seule** : `seller` ne porte que `name` (pas d'URL) — `MerchantSummary`/`DEAL_CARD_FIELDS` (`lib/deals.ts`) n'exposent pas `website_url` sur les requêtes catalogue/détail partagées ; l'ajouter aurait élargi la portée du changement au-delà de ce bloc pour un gain marginal (`url` est optionnel sur `schema.org/Organization`).

**Hors périmètre de ce bloc** (traité dans les blocs suivants du plan) : `ItemList` catalogue, URLs canoniques/contenu dupliqué des filtres, ouverture aux robots IA, `llms.txt`, performance, Open Graph.

**Statut** : Actée et construite le 2026-09-25 (branche `feat/seo-jsonld-produit`, PR #54). Vérifié réellement : `npx tsc --noEmit`, `npm run lint`, `npm run build` clean, `npm run test:unit` (43 tests) passent, serveur de production local démarré et JSON-LD extrait/parsé depuis une vraie page de la base Neon de prod (deal Tennis Point FR multi-marchand — prix, marque, vendeur, URL canonique corrects).

---

### D-2026-09-25-14 — Chantier SEO/GEO, bloc 3 (URLs canoniques / contenu dupliqué des filtres catalogue) : décision cadrée et actée

**Contexte** : Reprise du chantier SEO/GEO sur le bloc 3 du plan en 7 blocs (D-2026-09-25-10, bloc 1 terminé en D-2026-09-25-12 ; bloc 2 — données structurées JSON-LD — traité en parallèle dans une PR distincte non encore mergée au moment de ce bloc, D-2026-09-25-13). La page catalogue (`app/(catalog)/page.tsx`) est accessible via de nombreuses combinaisons de paramètres d'URL (`category`, `sort`, `gender`, `age_group`, `q`, `page`) qui affichent toutes un sous-ensemble du même contenu — risque de duplication de contenu / dilution aux yeux des moteurs de recherche.

**Décision soumise et confirmée par l'utilisateur avant code (choix entre 3 options)** : `<link rel="canonical">` fixe vers l'URL racine (`https://deals-tennis.vercel.app`, sans paramètres), quelle que soit la combinaison de filtres/tri/recherche/pagination active. Écarté : canonical par filtre indexable (plus de valeur SEO potentielle mais plus de décisions de détail à trancher, ex. quels filtres indexer et ajouter au sitemap) ; `meta robots noindex` sur les URLs à paramètres (empêche l'indexation plutôt que de consolider vers l'original). Cohérent avec le sitemap du bloc 1 (D-2026-09-25-12), qui n'expose déjà que l'URL racine et les pages fixes, jamais de variante filtrée.

**Implémentation** : `export const metadata: Metadata = { alternates: { canonical: SITE_URL } }` ajouté statiquement dans `app/(catalog)/page.tsx` (pas de `generateMetadata` nécessaire, la valeur ne dépend jamais des `searchParams`). Périmètre volontairement limité à la page catalogue — la page détail deal (`/deal/[dealId]`) a déjà une URL unique par article, aucun paramètre de filtre, donc pas de duplication à traiter dans ce bloc.

**Hors périmètre de ce bloc** (traité dans les blocs suivants du plan) : ouverture aux robots IA, `llms.txt`, performance, Open Graph.

**Isolation de branche** : ce bloc a été construit sur une branche fraîche depuis `origin/master` (`feat/seo-canonical-catalogue`) plutôt que de continuer sur `feat/seo-jsonld-produit` — la PR #54 (bloc 2) était encore ouverte/non mergée au moment de commencer ce bloc, conformément au protocole (jamais ajouter de commits à une branche/PR sans vérifier son statut de merge, et un bloc = une PR distincte comme pour les blocs 1 et 2).

**Statut** : Actée et construite le 2026-09-25. Vérifié réellement : `npx tsc --noEmit`, `npm run lint`, `npm run build` clean ; serveur local (port 3000, déjà démarré par une autre session parallèle sur le même code) interrogé en HTTP sur 4 combinaisons de paramètres (`/`, `/?category=raquettes`, `/?sort=price_asc&page=2`, `/?gender=femme&age_group=enfant&q=nike`) — `<link rel="canonical" href="https://deals-tennis.vercel.app">` identique et présent dans les 4 cas.

---

### D-2026-09-25-15 — Sous-catégories d'accessoires : modélisation, liste et périmètre du backfill (cadrage uniquement)

**Contexte** : demande explicite de l'utilisateur (« ajouter des catégories, notamment dans accessoires, pour séparer les sacs, les balles, antivibrateurs, etc. »). Traité comme décision structurante (nouveau champ, impact sur les 7 scripts de scraping déjà écrits + le workflow n8n ProTennis + le filtre catalogue), cadrée explicitement avant tout code, conformément au protocole. Numérotée -15 (et non -14) pour éviter une collision : D-2026-09-25-14 est déjà pris par une autre conversation en cours en parallèle sur le chantier SEO/GEO (bloc 3), qui avait laissé le répertoire de travail principal dans un état de conflit git non résolu (`git stash` interrompu) au moment de démarrer cette conversation — ce chantier a donc été isolé dans un nouveau git worktree dédié (`feat/souscategories-accessoires`) sans toucher au travail de l'autre session.

**Décisions soumises et confirmées par l'utilisateur avant code** :
1. **Modélisation** : nouveau champ `deals.subcategory` (nullable), rempli uniquement quand `category = 'accessoires'`. Pas d'éclatement en catégories de premier niveau — le filtre catégorie principal (`raquettes`/`cordages`/`chaussures`/`textile`/`accessoires`) reste inchangé partout où il est déjà utilisé (CHECK constraint, index composites, `CATEGORY_LABELS`), un filtre secondaire apparaît uniquement quand « Accessoires » est sélectionné.
2. **Liste des sous-catégories** : `sacs`, `balles`, `antivibrateurs`, `grips_surgrips`, `accessoires_cordage` (accessoires liés à la tension du cordage — tensiomètres, pinces à corder — à ne pas confondre avec la catégorie de premier niveau `cordages`, qui désigne le cordage lui-même). Une valeur `NULL` reste possible pour les accessoires qui ne correspondent à aucune de ces sous-catégories (ex. gourdes, casquettes, bandages, médailles, jonc/poignets) — exposée côté UI comme un filtre « Autres accessoires » plutôt que forcée dans une case qui ne lui correspond pas (cohérent avec le point 5 du protocole général).
3. **Périmètre du backfill** : reclassement complet des offres accessoires déjà en base (pas seulement les nouvelles ingestions) — implique de mettre à jour les 7 scripts de scraping déjà écrits (Tecnifibre, Tennispro.fr, SportSystem, Sport 2000, Babolat, Tennis Point FR, Head) et le workflow n8n ProTennis en plus d'écrire un script de backfill ponctuel, à l'identique du chantier sexe/âge (D-2026-09-25-04).

**Vérification réelle du lexique avant de le figer** (comme pour D-2026-09-25-03) : requête directe sur les 611 offres accessoires actives de la base Neon de prod (script jetable, supprimé après usage). Répartition constatée avec les motifs proposés :

| Sous-catégorie | Motif (première version) | Offres matchées |
|---|---|---|
| `sacs` | `sacs?`, `housse raquette` | 300 |
| `balles` | `balles?`, `balls?` | 59 |
| `antivibrateurs` | `antivibrateur`, `anti-vibrateur`, `damp`, `vibra-clip` | 33 |
| `grips_surgrips` | `surgrips?`, `overgrips?`, `grips?` | 77 |
| `accessoires_cordage` | `tensiomètre`, `pince à corder`, `machine à corder` | 0 (conservée pour l'avenir — aucun article de ce type dans le catalogue actuel, situation identique à d'autres sous-catégories vides déjà rencontrées ailleurs, ex. cordages Sport 2000) |
| *(aucun, `NULL`)* | — | 142 (gourdes, bandages/genouillères/chevillères, casquettes, jonc/poignets, médailles, produits dérivés Roland Garros, kits de tension de poteaux de filet...) |

Total 611 = 300+59+33+77+0+142, cohérent. Les motifs exacts (regex) seront affinés si besoin en cours de build (même pratique que le lexique sexe/âge), cette vérification sert à confirmer que le découpage proposé correspond à des volumes réels et n'écrase pas silencieusement de la donnée dans une mauvaise case.

**Hors périmètre de cette conversation** : aucun code écrit (ni migration, ni script) — cadrage uniquement, conformément au protocole (une étape de build par conversation). Le build (migration + lexique définitif + backfill + mise à jour des 7 scripts + miroir n8n + UI filtre) est réparti sur une ou plusieurs conversations dédiées suivantes, à l'identique du déroulé du chantier sexe/âge (D-2026-09-25-01 à -05).

**Statut** : Actée (cadrage) le 2026-09-25, aucun code construit.

---

### D-2026-09-25-16 — Amazon : filtre marque connue (référence dynamique) au lieu du fallback « Générique »

**Contexte** : suite au chantier scraping local (Amazon terminé, D-2026-09-24-04), l'utilisateur a signalé en prod des articles hors sujet remontés par le scraping Amazon — au-delà du seul cas déjà documenté (GAP-2026-09-25-12, décoration de gâteau « tennis »). Traité comme décision structurante (change le comportement d'insertion du script, impacte le volume Amazon déjà en base), cadrée explicitement avant tout code.

**Décisions soumises et confirmées par l'utilisateur avant code** :
1. **Source de la liste de marques de référence** : dynamique — marques réellement présentes en base (`deals.brand`, tous marchands hors Amazon, offres actives) au moment du scraping, pas une liste figée dans le script. Choisi plutôt qu'une liste statique (`KNOWN_BRANDS`, existante mais devenue le mécanisme d'étiquetage) pour rester à jour automatiquement à mesure que de nouveaux marchands/marques sont ajoutés.
2. **Sort du générique** : une offre Amazon dont le titre ne commence par aucune marque de cette liste de référence est désormais **exclue** (pas insérée), au lieu d'être conservée avec `brand = 'Générique'` comme précédemment. Assumé par l'utilisateur : réduit le volume Amazon (42→22 sur l'échantillon du dernier passage réel, 20 offres en `Générique` sur 42), reste au-dessus du seuil de 30 articles (D-2026-09-24-04) selon les passages.

**Implémentation** : `scripts/scraping/amazon.ts` — `fetchKnownBrands()` (nouvelle requête `SELECT DISTINCT d.brand FROM deals d JOIN merchants m ON m.id = d.merchant_id WHERE m.slug != 'amazon' AND d.status = 'active' AND d.is_active = true AND d.brand IS NOT NULL AND d.brand <> 'Générique'`, résultat trié côté JS par longueur décroissante pour préférer les correspondances les plus spécifiques — `ORDER BY LENGTH()` a dû être retiré de la requête SQL, `SELECT DISTINCT` de Postgres exige que toute expression d'`ORDER BY` figure dans la liste de sélection, découvert en exécutant réellement le script). `extractAmazonBrand` retourne désormais `string | null` (`null` = marque non reconnue) au lieu d'un fallback `'Générique'`. Ancienne liste statique `KNOWN_BRANDS` supprimée. Offre exclue comptée séparément (`skippedUnknownBrand`) dans le résumé de fin de passage. Le mécanisme d'éviction déjà existant (offres actives non revues à ce passage → `expired`/`is_active=false`) traite automatiquement les offres déjà en base à `brand = 'Générique'` : elles ne seront plus jamais "revues" par le prochain passage, donc évincées naturellement, sans script de nettoyage ponctuel séparé.

**Statut** : Actée le 2026-09-25.

---

### D-2026-09-25-17 — Rejet de la comparaison de prix inter-marchands : le site reste centré sur les vraies promos

**Contexte** : suite à GAP-2026-09-25-14 (piste : pour Amazon, comparer son prix au prix de référence connu chez un autre marchand plutôt qu'exiger une remise propre à Amazon), la réflexion a été élargie à toute la logique du site (proposition initiale de l'utilisateur) : afficher pour chaque article le meilleur prix trouvé tous marchands confondus (promo ou pas), avec le détail multi-marchand au clic.

**Décision** : rejetée. L'utilisateur a explicitement reconfirmé que deals-tennis est un site de mise en avant de **vraies promotions**, pas un comparateur de prix généraliste — un article moins cher chez un marchand simplement parce qu'il n'y est jamais en promo n'a pas sa place sur le site. Conséquences :
- Aucun scraping catalogue complet (option B envisagée un temps) — le scraping reste ciblé sur les pages promo/outlet de chaque marchand, comme aujourd'hui.
- Pas de logique "meilleur prix toutes offres confondues" sur le catalogue ni la page détail — la page détail `/deal/[dealId]` continue d'afficher les autres offres du même article, mais uniquement celles déjà captées (donc déjà des deals, pas des prix catalogue ajoutés pour la comparaison).
- **GAP-2026-09-25-14 clos par ce rejet** : pour Amazon spécifiquement, comparer son prix à celui d'un autre marchand ne serait pas non plus une "vraie promo" au sens du principe ci-dessus (ce n'est pas une réduction publiée par Amazon lui-même) — le comportement actuel (exiger une remise propre affichée par Amazon, D-2026-09-25-16) est confirmé, pas de changement.
- GAP-2026-09-25-13 (volume Amazon sous le seuil de 30) reste ouvert tel quel, sans cette piste comme solution possible — à retraiter autrement si besoin (ex. plus de marques reconnues au fil du temps, ou mots-clés de recherche Amazon élargis).

**Statut** : Actée (rejetée) le 2026-09-25 — aucun code impacté, cadrage uniquement.

---

### D-2026-09-25-18 — Amazon : pistes retenues pour augmenter le volume sans revenir sur D-2026-09-25-17

**Contexte** : suite à D-2026-09-25-17 (comparaison inter-marchands rejetée), GAP-2026-09-25-13 reste ouvert (volume Amazon à 11 offres, sous le seuil de 30). L'utilisateur a demandé de continuer la réflexion sur « une meilleure manière de scraper Amazon ». 7 pistes proposées, vérifiées réellement sur amazon.fr (Playwright) avant de trancher plutôt que supposées.

**Vérifications réelles effectuées** :
- **Filtre réduction deviné dans l'URL de recherche par mot-clé** (`p_n_deal_type` sur une recherche `k=...` simple) : **ne fonctionne pas** — résultats strictement identiques avec ou sans le paramètre (mêmes 49 produits, même ratio de remise). Aucune facette « Réductions » dans le panneau de filtres d'une recherche par mot-clé.
- **Rayon de navigation Amazon dédié Tennis** (`node=340139031`, retrouvé via le breadcrumb d'une fiche produit) : rayon générique aussi bruité que la recherche par mot-clé (entraîneurs, jouets pour animaux, padel mélangé) — pas de gain seul.
- **Découverte clé** : en descendant au niveau des sous-rayons Amazon (Raquettes `340151031`, Cordages `488345031`, Chaussures — homme `1765284031`), une facette native **« Tous les rabais »** apparaît dans le panneau « Promotions et bonnes affaires » de ces pages, avec un identifiant `p_n_deal_type:26902977031` **global** (même valeur vérifiée fonctionnelle sur les 4 rayons testés, pas propre à un rayon). Combiner `rh=n:<node_id>,p_n_deal_type:26902977031` réduit fortement le nombre de résultats (ex. Raquettes 10 000+ → 3 000+, Cordages 4 000+ → 904) et augmente nettement le ratio de remise réelle (Raquettes : 25/25 produits de l'échantillon avec un prix de référence, contre ~50% en recherche par mot-clé).
- **Accessoires (sacs)** (`node=340149031`) : facette fonctionnelle mais rayon plus large (40 000+ résultats de base) et qualité pas nettement meilleure qu'aujourd'hui (quelques articles hors tennis mêlés). Pas de nœud dédié retrouvé pour les autres sous-catégories (balles, grips/surgrips).
- **Textile** : pas de rayon unique — la taxonomie Amazon « Mode » fragmente les vêtements par type de vêtement × genre (ex. « Shorts de tennis homme » a son propre nœud `494287031`, distinct des polos/jupes/robes). Couverture complète nécessiterait d'énumérer un nœud par type, non fait (jugé disproportionné pour ce cadrage).
- **Coupons Amazon** : aucun trouvé sur les résultats « raquette de tennis » ; **Offres Éclair/Gold Box filtré Sports et loisirs** redirige en réalité vers la même page que les coupons (`/deals?bubble-id=deals-collection-sports-and-outdoors`), 11 produits génériques seulement, 0 tennis. Ces deux pistes écartées, pas de matière.
- **Pagination** (`&page=2` sur une recherche par mot-clé) : fonctionne réellement, 48 produits nouveaux sur 49 par rapport à la page 1 (quasi aucun recoupement).
- **Marque Wilson** : confirmée présente dans les résultats Amazon réels (ex. « Wilson Intrigue SE ») alors qu'exclue du filtre marque connue actuel (D-2026-09-25-16) faute d'être vendue chez un autre marchand actif du catalogue (Wilson écarté ailleurs pour blocage anti-bot, GAP différent). Manque à gagner réel identifié.

**Périmètre retenu pour le prochain build (une conversation dédiée)** :
1. Raquettes, Cordages, Chaussures (homme confirmé, femme à retrouver) : basculer sur rayon + facette « Tous les rabais » (`rh=n:<node_id>,p_n_deal_type:26902977031`) plutôt que la recherche par mot-clé actuelle.
2. Accessoires, Textile : conserver l'approche actuelle par mot-clé (pas de gain net prouvé ou trop de travail de cadrage supplémentaire pour l'instant), mais lui ajouter la pagination.
3. Pagination des résultats par mot-clé, pour les catégories qui restent en recherche par mot-clé.
4. Ajouter Wilson (et vérifier s'il existe d'autres marques tennis notoires dans le même cas) à la liste de marques reconnues — décision technique mineure au moment du build, dans le même esprit que D-2026-09-25-16.

**Hors périmètre de cette conversation** : aucun code écrit — cadrage et vérification uniquement, conformément au protocole. Le nœud « Chaussures femme », l'éventuelle extension à un nœud par type de vêtement pour le textile, et le détail des sélecteurs/URLs définitifs seront vérifiés au fil de l'eau pendant le build (même pratique que les autres marchands, GAP-2026-09-24-03).

**Statut** : Actée le 2026-09-25.

---

### D-2026-09-25-19 — Raquettes juniors mal classées `adulte` : détection par taille en pouces + lecture de la description

**Contexte** : l'utilisateur a signalé deux raquettes juniors visibles en prod avec `age_group = adulte` : « T-Fight Club 25 » (Tecnifibre, https://www.tecnifibre.com/products/t-fight-club-25) et « Head Coco 25 » (via Tennis Point FR, https://www.tennis-point.fr/products/head-coco-25-00606604342000-fr). Dans les deux cas, le titre ne contient aucun mot-clé reconnu par `CHILD_PATTERN` (`enfants?|junior|jr|kids?|filles?|garcons?|garçons?`, `lib/product-matching.ts`) — `extractAgeGroup` retombe par défaut sur `adulte`. Le nom de gamme se termine par un nombre (« 25 ») qui correspond en réalité à la taille de la raquette en pouces, une convention standard du secteur (raquettes juniors : 19/21/23/25/26 pouces ; raquettes adultes : 27 pouces et plus) — invisible dans le titre marchand construit par les scripts, mais l'utilisateur a vérifié que l'âge cible est bien précisé dans la description produit de chaque fiche.

**Décision** : correction en deux volets, cumulatifs :
1. **Heuristique taille en pouces** : pour la catégorie `raquettes` uniquement (un nombre isolé n'a aucun sens pour les autres catégories), un titre contenant un nombre isolé parmi 19/21/23/25/26 est classé `enfant` ; 27 et plus reste `adulte`. Règle simple, appliquée dans `extractAgeGroup` (ou une variante dédiée aux raquettes), donc automatiquement effective pour tous les marchands déjà scrapés sans toucher chaque script individuellement.
2. **Lecture de la description produit** comme second signal (recherche du même `CHILD_PATTERN` dans la description, pas seulement le titre) — l'utilisateur a confirmé que l'information y est systématiquement présente. Portée décidée par coût réseau :
   - **Tecnifibre et Tennis Point FR** (boutiques Shopify) : la description (`body_html`) est déjà présente dans la réponse JSON `products.json` déjà récupérée par les scripts (`scripts/scraping/tecnifibre.ts`, `scripts/scraping/tennis-point-fr.ts`) — aucune requête HTTP supplémentaire nécessaire. À coder dans une prochaine conversation.
   - **Les 6 autres marchands** (SportSystem, Sport 2000, Babolat, Tennispro.fr, Head, Amazon) : la description n'est pas dans les données déjà récupérées — il faudrait une requête HTTP supplémentaire par fiche produit retenue (coût/lenteur variable, ex. Tennispro a un `Crawl-delay: 60`). L'utilisateur a validé cette extension **quand même**, malgré le coût. **Décision actée dans ce cadrage, mais explicitement reportée au code** : rien n'est construit dans cette conversation pour ces 6 marchands — chaque script sera mis à jour dans une prochaine conversation dédiée (une étape de build à la fois, comme pour les autres chantiers).

**Hors périmètre de cette conversation** : aucun code écrit — cadrage uniquement, conformément au protocole. Pas de décision prise sur la stratégie de rapprochement entre le nombre de pouces et le format exact du champ description par marchand (HTML brut vs texte) — à vérifier réellement au moment de chaque build, comme pour les sélecteurs (GAP-2026-09-24-03).

**Statut** : Actée le 2026-09-25.
