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
