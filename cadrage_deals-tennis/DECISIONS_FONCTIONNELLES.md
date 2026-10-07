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

---

### D-2026-09-25-20 — Retrait de ProTennis du périmètre « vrais bons plans »

**Contexte** : suite à la validation de la Phase 0 du cadrage `CADRAGE_vrais-bons-plans.md` (audit du 2026-09-25), l'utilisateur a demandé le retrait de ProTennis du projet plutôt que de l'inclure dans les phases suivantes tel quel — ProTennis est le seul marchand du catalogue sans aucun filtre de vraie remise (contrairement aux 8 marchands scrapés localement, tous filtrés sur une remise réellement affichée par le marchand), ce qui contredit directement le principe P1/P3 du cadrage. L'utilisateur désactive lui-même le workflow n8n ProTennis avant tout traitement des données par Claude Code.

**Décision** : ProTennis est retiré du périmètre du projet. Le projet se concentre sur les 8 marchands scrapés localement (Tecnifibre, Tennispro.fr, SportSystem, Sport 2000, Babolat, Tennis Point FR, Head, Amazon). Retrait non définitif de principe — ProTennis pourra être réintégré plus tard s'il est doté d'un filtre de vraie remise conforme au reste du catalogue.

**Séquence actée, une étape à la fois, arrêt avant toute suppression définitive** :
1. Inventaire complet de tout ce qui concerne ProTennis (code, workflow n8n exporté, SQL, README, contrats, tests, docs, ligne `merchants`, `deals`, `products` devenus orphelins, `click_events` liés).
2. Export d'archive (CSV) des `deals`/`products`/`click_events` ProTennis.
3. Retrait immédiat du site : passage des offres ProTennis en `expired`.
4. Après validation de l'utilisateur : suppression définitive en migration (deals, produits orphelins, `click_events`, ligne `merchants`), puis suppression du code/docs devenus inutiles.
5. Vérification que `/go/[dealId]` sur une ancienne offre ProTennis redirige proprement plutôt que de renvoyer une erreur.
6. Mise à jour de `ETAT_ACTUEL.md`.

Voir `CADRAGE_vrais-bons-plans.md` section 6.1 pour le texte de référence. Nouvelle branche partie de `master`, sans toucher aux modifications en pause de GAP-2026-09-25-15 étape 4 (isolée dans le répertoire de travail principal).

**Statut** : Actée (confirmée explicitement par l'utilisateur). Cadrage uniquement dans cette entrée — l'étape 1 (inventaire) est traitée dans la même conversation, sans suppression ni modification de données.

---

### D-2026-09-25-21 — Statut `tracked` pour les articles vus sans remise (décision A.1 du cadrage vrais bons plans)

**Contexte** : la collecte de l'historique de prix (Phase 1 de `CADRAGE_vrais-bons-plans.md`) suppose d'enregistrer aussi, là où c'est gratuit, les articles vus sans remise réelle — ces articles n'existent pas aujourd'hui en base (les scripts les filtrent avant insertion). Il fallait trancher le mécanisme de représentation plutôt que de le laisser à l'appréciation du build.

**Décision** : un article vu sans remise est une ligne `deals` normale avec `status='tracked'` (pas un booléen séparé), `is_active=false`, `original_price = discounted_price`. Exclu du site par défaut partout (catalogue, recherche groupée, `/go/[dealId]`, comptages, pages produit) — toutes les requêtes concernées devront être vérifiées et listées explicitement au moment du build. L'éviction (garde-fou 50 %, Phase 2) s'applique aussi aux `tracked` non revus lors d'un passage de scraping. Une offre peut passer de `tracked` à `active` et inversement selon la remise du jour.

**Statut** : Actée (confirmée explicitement par l'utilisateur). Cadrage uniquement — aucun code construit dans cette conversation.

---

### D-2026-09-25-22 — Phase 1 précisée : historique de prix par trigger Postgres `AFTER INSERT OR UPDATE`

**Contexte** : `CADRAGE_vrais-bons-plans.md` (Phase 1, point 2) prévoyait une fonction d'ingestion partagée (`lib/ingest.ts`) centralisant l'upsert `deals` + `price_observations`, appelée par chaque script. L'utilisateur a précisé le mécanisme d'écriture de `price_observations` lui-même.

**Décision** : `price_observations` est alimentée par un trigger Postgres `AFTER INSERT OR UPDATE` sur `deals`, qui upsert `(deal_id, jour)` quand `NEW.status IN ('active', 'tracked')` — une éviction (passage à `expired`) n'écrit rien. Le jour d'observation est calculé en heure de Paris. Le trigger doit se déclencher même quand l'`ON CONFLICT DO UPDATE` de chaque script ne change aucune valeur (prix identique au jour précédent) — à vérifier explicitement pendant le build, pas supposé. Tout coût/risque de performance ou de verrou doit être signalé avant application en prod. Séquence de validation : branche Neon d'abord, prod seulement après accord explicite. La fonction d'ingestion partagée (`lib/ingest.ts`) et la migration des 8 scripts restent prévues ensuite, avec capture des articles sans remise (statut `tracked`, D-2026-09-25-21) pour les marchands où c'est gratuit d'après l'audit de phase 0 — à confirmer marchand par marchand au moment du build, hors Sport 2000 et hors mode rayon d'Amazon.

Voir `CADRAGE_vrais-bons-plans.md` section 6.3 pour le texte de référence.

**Statut** : Actée (confirmée explicitement par l'utilisateur). Cadrage uniquement — aucun code construit dans cette conversation.

---

### D-2026-09-25-23 — Phase 2 reconstruite de zéro : n8n uniquement orchestrateur

**Contexte** : la dérive ProTennis (D-2026-09-25-20) est attribuée explicitement par l'utilisateur au fait que de la logique de scraping/rapprochement avait été recopiée dans des nœuds n8n plutôt que de rester dans le code versionné du dépôt. En reconstruisant l'automatisation n8n pour les 8 marchands restants (chantier initialement listé en D-2026-09-21-09 point 4), ce principe est posé comme non négociable avant tout nouveau build n8n.

**Décision** : n8n ne fait plus que l'orchestration — planning (lancement de `npm run scrape:<marchand>` sur la VM, horaires étalés), suivi (lecture de `ingestion_runs`), alertes (marchand sans run `success` depuis 36 h, runs `partial`/`failed`). Aucune logique de scraping, de rapprochement ou de calcul dans des nœuds n8n : les 8 scripts TypeScript du dépôt restent l'unique source de vérité.

**Livrables actés pour le build à venir** (une conversation dédiée, hors périmètre de cette conversation) :
- `ingestion_runs` + garde-fou d'éviction à 50 % (Phase 2 de `CADRAGE_vrais-bons-plans.md`, section 3).
- Scripts exécutables sans intervention (headless, code de sortie non nul en cas d'échec).
- Kit d'installation VM (Node, Playwright, dépôt, variables d'environnement, procédure de mise à jour).
- Workflows n8n exportés en JSON dans le dépôt, limités au rôle d'orchestrateur.
- Recommandation sur le mécanisme de lancement des scripts depuis n8n (SSH vers la VM, Execute Command, ou autre), en tenant compte d'un n8n potentiellement conteneurisé sur cette même VM.
- Liste de vérifications à faire par l'utilisateur sur la VM avant le build (type d'instance, mode d'installation/version n8n, test de chaque scraper depuis l'IP de la VM — risque de blocage anti-bot, en particulier Amazon).

Voir `CADRAGE_vrais-bons-plans.md` section 6.4 pour le texte de référence.

**Complément (2026-09-25, pendant l'inventaire ProTennis GAP-2026-09-25-18)** : `scripts/automation/n8n-eviction-cron.sql` (mécanisme générique d'éviction horaire par `expires_at`, jamais utilisé par le workflow ProTennis réel) est confirmé orphelin — acté comme code mort à supprimer lors de ce build.

**Statut** : Actée (confirmée explicitement par l'utilisateur). Cadrage uniquement — aucun code construit dans cette conversation.

---

### D-2026-09-25-24 — Ordre global révisé par le cadrage rapprochement multi-niveaux (§10)

**Contexte** : `CADRAGE_rapprochement-multi-niveaux.md` complète `CADRAGE_vrais-bons-plans.md`, remplace ses phases 3b/3c (audit et fusion des doublons par similarité de titre) par un rapprochement à trois niveaux (famille/modèle/variante, R0-R5) et modifie l'ordre de la phase 1.

**Décision** : ordre global des chantiers actés désormais :
1. Retrait définitif de ProTennis (GAP-2026-09-25-18, en cours).
2. Trigger `price_observations` (D-2026-09-25-22) : inchangé, reste prioritaire — l'historique reste attaché à `deal_id`, aucune perte pendant la réorganisation des modèles.
3. R0 à R2 du chantier de rapprochement (diagnostic, jeu de référence, référentiel de modèles v1 — voir GAP-2026-09-25-19).
4. `lib/ingest.ts` + statut `tracked` (D-2026-09-25-21) + réécriture des 8 scripts, **devient R3** : cette étape n'est plus traitée juste après le trigger comme prévu initialement en D-2026-09-25-22, elle attend R0-R2 pour que les scripts ne soient réécrits qu'une seule fois (capture du GTIN/mpn/attributs bruts en même temps que la capture `price_observations`/`tracked`).
5. R4 (moteur en mode fantôme) puis R5 (bascule).
6. Phases 2 (n8n, D-2026-09-25-23), 4 (verdict) et 5 (supervision) de `CADRAGE_vrais-bons-plans.md`. La phase 2 peut démarrer en parallèle de R0-R2, elle ne dépend pas du rapprochement.

R0 n'est pas démarré : feu vert explicite de l'utilisateur requis après validation du trigger `price_observations`.

Voir `CADRAGE_rapprochement-multi-niveaux.md` section 10 pour le texte de référence.

**Statut** : Actée (confirmée explicitement par l'utilisateur). Cadrage uniquement — aucun code construit dans cette conversation.

---

### D-2026-09-26-01 — Rapprochement : règle des générations (§5 de `CADRAGE_rapprochement-multi-niveaux.md`)

**Contexte** : le jeu de référence R1 contient plusieurs paires où deux générations d'un même modèle se font face (Speed MP 2022 / 2026, Pure Drive 98 2023 / Gen11…). Le §5 v0 classait toute « génération voisine » en modèle proche.

**Décision (Mathieu, 2026-09-26)** :
- génération différente **et** vérifiée des deux côtés → **différent** (une ancienne génération n'a pas le même prix de référence, elle ne doit pas servir de base au verdict bon plan) ;
- génération inconnue ou non vérifiable d'un côté → **proche** (jamais de fusion automatique) ;
- **identique** exige que la génération soit confirmée des deux côtés, ou que le modèle n'ait qu'une seule génération sur le marché.

Appliquée au CSV R1 le 2026-09-26 (voir `R1_mesure.md`). Valeur `conditionnement` ajoutée à la colonne `niveau` du CSV (paires 37 et 38) à la même occasion.

**Statut** : Actée (décision explicite de Mathieu, message du 2026-09-26).

---

### D-2026-09-26-02 — Repérage de nouveaux marchands en parallèle de R1-R2, construction reportée à R3

**Contexte** : à l'estimation du nombre d'étapes restantes avant un rapprochement automatique et fiable, Mathieu a proposé de lancer en parallèle (via Claude cowork, hors de ce dépôt) un repérage de nouveaux marchands tennis, pour augmenter la couverture multi-marchands en même temps que le moteur de rapprochement (point de départ chiffré à 1 seul produit présent chez 2+ marchands, GAP-2026-09-25-19). Le repérage de nouveaux marchands est explicitement hors périmètre de `CADRAGE_rapprochement-multi-niveaux.md` (§11).

**Décision** :
- Le repérage (identification et vérification de candidats, sans code ni compte créé) peut se faire dès maintenant, en parallèle de R1 (complément du jeu de référence) et R2 (référentiel de modèles), via un prompt dédié pour Claude cowork (`REPERAGE_marchands_prompt-cowork.md`).
- La **construction** de tout nouveau marchand retenu est reportée à la vague **R3** (réécriture des 8 scripts sur `lib/ingest.ts`) — pour ne pas écrire un script avec l'ancien SQL puis le réécrire au nouveau format juste après (même logique que D-2026-09-25-24 pour les 8 scripts existants).
- **Aucune candidature à un programme d'affiliation** ne doit être déposée sous le nom actuel du site tant que GAP-2026-09-25-10 (conflit de nom « Tennisdeals ») n'est pas tranché.
- Les critères de tri des candidats (légalité de la collecte, GTIN exposé, recouvrement avec les marques déjà couvertes, méthode technique simple, volume réel) sont documentés dans le prompt cowork lui-même, pas dupliqués ici.

**Statut** : Actée (confirmée explicitement par Mathieu, message du 2026-09-26). Cadrage/documentation uniquement — aucun code construit, aucune candidature déposée.

---

### D-2026-09-27-01 — Nom du site : abandon de « Tennisdeals », un nouveau nom sera choisi (GAP-2026-09-25-10)

**Contexte** : la vérification réelle du repérage marchands (`REPERAGE_marchands_verification.md` §2) a établi que `www.tennisdeals.be` est un revendeur de matériel de tennis édité par SARL EXTREME TENNIS, candidat n°1 du repérage. L'option « garder Tennisdeals si ce n'est pas un vrai concurrent » ne tient plus.

**Décision (Mathieu, 2026-09-27, question interactive)** : option 2 de GAP-2026-09-25-10 — **choisir un nouveau nom** (ni retour à « Deals Tennis », ni maintien de « Tennisdeals »). Le nom lui-même n'est pas encore choisi : il fera l'objet d'une étape dédiée (propositions, vérification de disponibilité avant adoption). Le blocage des candidatures d'affiliation (D-2026-09-26-02) reste en vigueur jusqu'à l'adoption du nouveau nom.

**Statut** : Actée (réponse explicite de Mathieu du 2026-09-27). Aucune modification du code ni de la marque affichée à ce stade.

---

### D-2026-09-27-02 — Repérage marchands : périmètre retenu pour R3

**Contexte** : retour du repérage cowork (18 candidats) et vérification réelle du top 5 (`REPERAGE_marchands_verification.md`), complétée le 2026-09-27 par une mesure du recouvrement Tennis Achat / Tennispro.fr (§5 du même document).

**Décision (Mathieu, 2026-09-27, questions interactives)** :
- **Clauses de propriété intellectuelle** d'Extreme Tennis (« reproduction [...] de tout ou partie des éléments du site [...] interdite ») et de Tennis Compagnie (« toute copie intégrale ou partielle d'une page du site est strictement interdite ») : même catégorie que les clauses déjà acceptées (SportSystem, Head, Sport 2000…), acceptées.
- **Périmètre R3, dans cet ordre** : Sports Raquettes, Tennis Compagnie, Extreme Tennis, puis **Tennis Achat en dernier**. Tennis Achat est édité par la même société que Tennispro.fr (≥ 96,5 % de catalogue commun, prix barré identique, mais prix de vente différent sur 4 paires sur 12 échantillonnées, écarts de 3 à 13 % dans les deux sens) : construit en déclinaison du script Tennispro.fr et marqué « même opérateur que Tennispro.fr » pour ne pas gonfler la mesure multi-marchands (GAP-2026-09-25-19). La forme exacte de ce marquage est à concevoir en R2/R3.
- **Extreme Tennis** : collecte via sitemaps + fiches produit (pagination des listings interdite par son robots.txt), à cadrer en R3.
- **Intersport** : Mathieu a demandé de l'inclure « si on peut contourner les restrictions en attendant l'affiliation ». **Non retenu en collecte directe** : le captcha DataDome est un anti-bot actif, le contourner relève du même risque que Wilson/PerimeterX (art. 323-1 CP, voir GAP-2026-09-23-06), refusé par Claude Code. Seule voie : le flux d'affiliation Kwanko, après adoption du nouveau nom (D-2026-09-27-01).
- Construction toujours reportée à R3 (D-2026-09-26-02).

**Statut** : Actée (réponses explicites de Mathieu du 2026-09-27), sauf le point Intersport, qui est un refus de Claude Code à confirmer ou discuter par Mathieu.

---

### D-2026-09-27-03 — Jeu de référence R1 validé tel quel (GAP-2026-09-25-19)

**Contexte** : `R1_jeu-reference-candidat.csv` (38 paires, règle des générations D-2026-09-26-01 appliquée) attendait la validation de Mathieu (colonne `decision_mathieu`) avant la suite du chantier de rapprochement.

**Décision (Mathieu, 2026-09-27)** : « Je valide tout le CSV R1 », puis « reclasse [la paire 7] en différent » — les 38 propositions sont acceptées, la paire 7 étant reclassée de « proche » à « différent » (la vérification de la paire 6 établit deux générations différentes, règle D-2026-09-26-01). Répartition finale : 14 identiques / 9 proches / 15 différents. La mesure de l'algorithme actuel devient la référence : précision 62,5 % (5/8), rappel 35,7 % (5/14), inter-marchands 2/11 (`R1_mesure.md` §7).

**Suite prévue par le cadrage (§9, non engagée ici)** : compléter le jeu jusqu'à 50-100 paires avant la cascade R2/R3.

**Statut** : Actée (réponse explicite de Mathieu du 2026-09-27).

---

### D-2026-09-27-04 — Nouveau nom du site : « Bonplantennis » (GAP-2026-09-25-10)

**Contexte** : D-2026-09-27-01 (abandon de « Tennisdeals », nouveau nom à choisir après vérification de disponibilité).

**Décision (Mathieu, 2026-09-27)** : nouveau nom **« Bonplantennis »**.

**Vérification de disponibilité (Claude Code, 2026-09-27, lecture seule)** :
- **Domaines** : `bonplantennis.fr`, `.com`, `.net`, `.eu`, `.be`, ainsi que `bon-plan-tennis.fr/.com` et `bonplanstennis.fr/.com` — aucun enregistrement (DNS inexistant partout, RDAP Verisign et AFNIC en 404 pour les `.com`/`.net`/`.fr`). Aucun n'a été réservé.
- **Sites existants** : aucun site nommé « Bonplantennis ». L'expression « bons plans tennis » est employée comme **intitulé générique** de rubrique promo chez deux marchands du périmètre R3 : Tennis Compagnie (page `/content/27-bon-plan-tennis`) et Extreme Tennis (« Les bons plans »). Aucun usage à titre de marque. Site voisin sans rapport direct : « Le Bon Tennis » (`lebontennis.fr`, mise en relation de joueurs).
- **Marques** : base INPI (data.inpi.fr, navigateur réel) — **0 marque** pour « bonplantennis ». La recherche « bon plan tennis » (avec espaces) a été bloquée par Cloudflare et n'a pas été forcée ; EUIPO non consulté. **Non vérifié** : existence d'une marque « Bon Plan Tennis » en plusieurs mots, à contrôler par Mathieu dans un navigateur (data.inpi.fr, euipo.europa.eu) avant toute démarche.
- **À savoir** : nom très descriptif (« bon plan » + « tennis »), donc faiblement distinctif — difficile à protéger comme marque et proche de libellés génériques utilisés par des marchands. Ce n'est pas un conflit, mais une limite.

**Reste à faire** : renommage de la marque affichée (même périmètre que PR #47 : header/footer, métadonnées, pages réglementaires, `package.json`), graphie exacte à l'écran à fixer à ce moment-là ; réservation éventuelle d'un domaine (décision et action de Mathieu). Levée du blocage des candidatures d'affiliation (D-2026-09-26-02, dont Intersport/Kwanko) une fois la marque affichée renommée.

**Statut** : Actée (choix explicite de Mathieu du 2026-09-27) ; vérification marque en plusieurs mots à compléter par Mathieu.

---

### D-2026-09-27-05 — Cordages : jauge différente = modèle proche (GAP-2026-09-25-19)

**Contexte** : complément du jeu R1 (`R1_mesure.md` §8.4, question 1). Le §5 de `CADRAGE_rapprochement-multi-niveaux.md` classait la jauge des cordages en « produit différent », et plusieurs marchands vendent plusieurs jauges dans une même fiche (SportSystem, Tennispro).

**Décision (Mathieu, 2026-09-27)** : « Jauge pour les cordages : proche quand différentes. »

**Application** :
- Jauges différentes → **modèle proche** (plus « produit différent »).
- Jauge au choix dans la fiche, avec la même jauge disponible des deux côtés → pas de jauge différente → la paire peut être **identique** (paires 63, 65, 66).
- La longueur (garniture / bobine, 200 m / 220 m) reste un **conditionnement** différent, comparé au mètre (paires 38 et 64 inchangées).
- Paire 25 (jauge indéterminable) inchangée : « proche ».

**Statut** : Actée (réponse explicite de Mathieu du 2026-09-27). §5 du cadrage mis à jour.

---

### D-2026-09-27-06 — Textile : collection non écrite = identique, génération différente explicite = proche (GAP-2026-09-25-19)

**Contexte** : complément du jeu R1 (`R1_mesure.md` §8.4, question 2). Pour le textile, la règle des générations (D-2026-09-26-01) classait « proche » un modèle dont la collection n'était pas vérifiable des deux côtés.

**Décision (Mathieu, 2026-09-27)** : « si c'est exactement le même modèle alors identique, si génération différente explicitement alors proche ».

**Application au textile** (prime sur D-2026-09-26-01 pour cette catégorie) :
- Même modèle, sans génération ou collection différente écrite → **identique** (paires 54, 58, 60 reclassées de « proche » à « identique »).
- Génération ou collection **explicitement différente** → **modèle proche** (plus « produit différent »).
- Édition spéciale écrite d'un seul côté (paire 59, Freelift Pro « RG ») : pas « exactement le même modèle » → « proche » maintenu, à confirmer par Mathieu.
- Les sacs (paires 22 et 23, accessoires) ne sont **pas** concernés : la décision ne vise que le textile.

**Statut** : Actée (réponse explicite de Mathieu du 2026-09-27). §5 du cadrage mis à jour.

---

### D-2026-09-27-07 — Complément du jeu R1 validé ; règle des générations maintenue pour les sacs (GAP-2026-09-25-19)

**Contexte** : 29 paires inter-marchands (39-67) ajoutées au jeu R1 (`R1_mesure.md` §8), après D-2026-09-27-05/06. Deux points restaient ouverts : la paire 59 (polo adidas Freelift Pro « RG » d'un seul côté) et l'extension éventuelle de la règle textile aux sacs (paires 22, 23).

**Décision (Mathieu, 2026-09-27)** :
- Paire 59 : « ça me va » — **proche** confirmé.
- Sacs : « Règle des générations (sauf si exactement le même article) » — la règle générale D-2026-09-26-01 s'applique aux sacs ; « identique » seulement pour exactement le même article (même référence). Paires 22 et 23 inchangées (« proche » : références différentes, 40TOUBEIBP / 40TOUNAVBP contre 40TOUWBLBA).
- Paires 39-67 : « Je valide » — les 29 propositions sont acceptées telles quelles (18 identiques / 5 proches / 6 différents).

**Résultat** : jeu R1 de **67 paires validées** (32 identiques / 14 proches / 21 différents). Nouvelle mesure de référence de l'algorithme actuel : **précision 5/8 (62,5 %), rappel 5/32 (15,6 %), inter-marchands 2/29 (6,9 %)**.

**Suite prévue par le cadrage (§10, non engagée ici)** : R2 — référentiel v1 et règles de tolérance.

**Statut** : Actée (réponses explicites de Mathieu du 2026-09-27).

---

### D-2026-09-28-01 — Les validations de revue proposent des alias, sans les ajouter automatiquement (GAP-2026-09-27-02)

**Contexte** : début de R2. Le format de stockage du référentiel de familles dépend de ce que deviennent les libellés nouveaux validés dans la file de revue (GAP-2026-09-27-02).

**Décision (Mathieu, 2026-09-28)** : option 2, **enrichissement proposé**.
- Une validation en revue rattache **uniquement l'offre concernée** à la famille (rattachement tracé, `product_merges`).
- Le libellé nouveau est **noté comme alias proposé**. Les propositions sont présentées **en lot** à Mathieu, puis ajoutées au référentiel après validation, comme le reste de la connaissance tennis (§0 du cadrage rapprochement).
- Le référentiel reste un **fichier de configuration versionné** (principe R7) : aucune écriture dans le référentiel depuis l'application.

**Raison** : un alias est une règle générale (il s'applique à toutes les offres futures) alors qu'une validation porte sur un seul cas ; un alias ambigu (ex. « PA ») créerait des faux rapprochements en série, contraire au principe R3. Coût accepté : quelques offres au même libellé repassent en revue entre deux ajouts au fichier.

**Suite** : stockage des alias proposés (petite table ou export) et action « proposer l'alias » à construire en R5 / Phase 5 (moments déjà prévus par le GAP).

**Statut** : Actée (réponse explicite de Mathieu du 2026-09-28).

### D-2026-09-28-02 — Réponses aux questions R2 (Q1-Q12) : règles de tolérance et référentiel v1

**Contexte** : R2 proposé (PR #85, mergée) avec 11 questions (Q1-Q6 dans `config/matching-rules.ts`, Q7-Q11 dans `R2_referentiel.md`). Une 12e question a été ajoutée pendant la revue : les lots et les cadeaux, vus dans les titres réels. Revue faite une par une, réponses explicites de Mathieu (AskUserQuestion, 2026-09-28).

**Décisions (Mathieu, 2026-09-28)** :

- **Q1 — Poids des raquettes** : même poids = même modèle ; écart ≤ 10 g = proche ; > 10 g = différent. **Un poids écrit dans le nom du modèle compte comme un écart de poids ordinaire** (proposition initiale refusée) : T-Fight 300 / 305 et Tempo 270 / 275 = proche ; T-Fight 255 / 270 = différent. Aucune paire R1 ne change (paire 12 : même poids).
- **Q2 — Plan de cordage et longueur (raquettes)** : **proche** tous les deux (proposition initiale « différent » refusée). « Même modèle avec un plan de cordage différent. » Pure Drive / Pure Drive + = proche. **Paire R1 n° 45 reclassée « différent » → « proche »** (Radical Pro 2023 16x19 / 18x20, validée « différent » le 2026-09-27, contradiction signalée à Mathieu avant de noter la réponse) : jeu R1 = 32 identiques / 15 proches / 20 différents.
- **Q3 — Surface des chaussures** (toutes surfaces / Clay) : proche.
- **Q4 — Garniture / bobine** : produits différents ; prix au mètre affiché sur les deux ; jamais de « meilleur prix » entre garniture et bobine.
- **Q5 — Pression des balles, contenance des sacs** (RH6 / RH12) : différent tous les deux.
- **Q6 — Textile, mention écrite d'un seul côté** : **année ou collection → identique** (paire R1 58) ; **édition spéciale nommée (RG, Wimbledon, US Open…) → proche** (paire R1 59). Remplace la proposition « proche dans tous les cas », qui contredisait la paire 58.
- **Q7 — Éditions et coloris (raquettes, cordages)** : une édition ou un coloris sans caractéristique différente sur la fiche = **même modèle** (Spectra, Wimbledon, White, LTD rouge, Black Code Fire / Lime…). Cas particuliers : Pure Aero **Rafa = édition** ; **Rafa Origin = version** (produit différent) ; T-Fight **300 IG = édition** ; Evo Drive **Femme = coloris**, poids comparé avec la règle Q1.
- **Q8 — Regroupements provisoires** : **une famille par ligne** (Boost Aero / Boost Drive / Boost Strike ; chaque ligne junior Babolat et Head ; chaque raquette loisir Head et Wilson).
- **Q9 — Correspondances** : Head **Hawk Tour Rpet = version « Tour Rpet » à part**. **Cinq cas à vérifier sur les fiches avant de trancher** (réponse de Mathieu ; non faits : la politique réseau de la session bloque les sites marchands) :
  1. Lacoste « L23 L » (SportSystem) = Tecnifibre « Lacoste L23 Light » ?
  2. Babolat « Synthetic Gut Force » ≠ « Synthetic Gut » ? (fiches Tennispro)
  3. « Wilson Element 1,25 mm » (Amazon) = cordage Luxilon ?
  4. Gosen « Eggpower (sidewinder) » et « Sidewinder » : même cordage ? (fiches Tennispro, 2 conditionnements chacun ; Mathieu a d'abord répondu « deux cordages différents », puis est revenu dessus : à vérifier)
  5. Wilson « RF 01 Future » : version junior ou légère de « RF 01 » ? (fiches SportSystem)
  En attendant : `a_confirmer`, et **jamais de rapprochement** entre les deux côtés (principe R3).
- **Q10 — Périmètre** : **passe R2 suivante** pour le référentiel **chaussures** et les **sous-catégories d'accessoires** (GAP-2026-09-25-11), avant R3. **Pas de référentiel pour le textile** (règle textile D-2026-09-27-06 appliquée au nom de modèle lu dans le titre).
- **Q11 — Marques sans famille** (Senston, Amazon Basics, offres inactives) : hors référentiel, toujours « nouveau modèle ». **JOOLA = raquette de tennis de table**, hors sujet : à filtrer à l'ingestion (R3).
- **Q12 — Lots et cadeaux** : **lot de N articles identiques** (« Pack de 2 raquettes ») = **produit différent**, prix à l'unité affiché, jamais de « meilleur prix » entre un lot et l'unité ; **article + cadeau** (« 6 cordages offerts », « sac offert ») = **même modèle**, cadeau indiqué sur l'offre.

**À reporter (session Sonnet, spec = cette décision)** :
- `config/matching-rules.ts` : raquettes `plan_cordage` et `longueur` → `proche` ; attribut `edition` → `variante` (raquettes, cordages) ; règle `textile` : distinguer année / collection écrite d'un seul côté (→ identique) et édition spéciale (→ proche) ; attributs communs `lot` → `different` (prix à l'unité) et `cadeau` → `variante` ; notes Q1-Q6 remplacées par la règle retenue.
- `config/model-families.ts` : poids retirés des `versions` quand ils sont dans le nom (T-Fight, TF-X1, Tempo, T-Fit, Fire, Ki 5, Beast, Tour Carbon, Neon, Skulls, Black Ace, Q+ Tour Pro…), à comparer par la règle Q1 ; plans de cordage et « + » retirés des `versions` (Pure Strike, Pure Drive, Pure Aero, Radical, CX, TF-40, Blade) ; Rafa, 300 IG, Femme passés en `editions` ; Black Code → `observe` ; cinq regroupements éclatés ; Hawk « Tour Rpet » en version ; Gosen Eggpower et Sidewinder séparés en deux familles `a_confirmer` jusqu'à vérification ; notes « à confirmer » tranchées retirées.
- `R1_jeu-reference-candidat.csv` : paire 45 → proche (`decision_mathieu` et `note` datées) ; `R1_mesure.md` : répartition 32 / 15 / 20.
- `R2_referentiel.md` : §5 remplacé par le rappel des réponses et des 5 vérifications en attente.
- `CADRAGE_rapprochement-multi-niveaux.md` §5 : règles ajoutées (plan de cordage et longueur proches, lots, cadeaux, éditions, textile année / édition).
- Anomalies à filtrer en R3 (ajoutées à `R2_referentiel.md` §4) : JOOLA.

**Statut** : Actée et reportée (2026-09-28, session Sonnet, spec = cette décision). Les 5 vérifications de Q9 ont été faites réellement (web) : Lacoste L23 L = Tecnifibre L23 Light ; Synthetic Gut Force ≠ Synthetic Gut ; Wilson Element = Luxilon Element ; Gosen Eggpower = Sidewinder (même cordage, fusionnés en une famille) ; RF 01 Future = version adulte allégée (pas junior). **R2 clos pour les raquettes et les cordages.** La passe R2 chaussures + accessoires suit (Q10, GAP-2026-09-25-11).

### D-2026-09-28-03 — Réponses aux questions R2 chaussures et accessoires (Q13-Q20)

**Contexte** : passe R2 chaussures + accessoires (Q10 de D-2026-09-28-02), proposée et mergée (PR #88) avant la revue ; fichiers marqués « PROPOSITION », non consommés par le code. Revue faite question par question (AskUserQuestion, 2026-09-28). Questions détaillées : `R2_referentiel.md` §7.4.

**Décisions (Mathieu, 2026-09-28)** :

- **Q13 — Chaussures de ville** (Stan Smith, Breaknet, Grand Court, Advantage, Tommy Hilfiger, génériques Amazon) : **exclues à l'ingestion** (R3), comme hors tennis.
- **Q14 — Numéro des chaussures** (Barricade 13 / 14, Gel-Challenger 14 / 15, Rush Pro 4.5 / 5) : génération, **règle standard** (D-2026-09-26-01) : différente et écrite des deux côtés → différent ; écrite d'un seul côté → proche. Cohérent avec la paire R1 33 (Mirage 100 / 100 II, différent), inchangée.
- **Q15 — Éditions des chaussures** : éditions joueur (Pegula, Zverev, Tsitsipas, Sabalenka, Alcaraz, Medvedev) et événement ou coloris nommé (Wimbledon, RG, Open d'Australie, Night Energy) = **même modèle** (Q7) ; **Premium / PRM = proche** (matériaux parfois différents).
- **Q16 — Cas à vérifier sur les fiches** : laissés `a_confirmer` (jamais rapprochés en attendant), **vérifiés dans une session où le réseau est ouvert** : adidas Barricade Leather 13 et ASMC Barricade ; Babolat Jet Tere 2 Premium (si c'est un Premium : proche, Q15) ; Babolat SFX 4 / SFX Evo ; Nike GP Challenge 1 / 1.5 / Pro ; Diadora « S. Challenge » ; Lotto « SPD » / « PRT » ; Nike « FO ».
- **Q17 — Balles** : niveau Stage 1 / 2 / 3 = **différent** ; tube, bipack, carton, sachet, baril = **lot**, prix affiché **à la balle** (Q12), jamais de « meilleur prix » entre deux conditionnements ; Dunlop « ATP » (tube de 4) / « ATP Tour » (tube de 3) **à vérifier sur les fiches** ; balles géantes (« Giant 9 Ball », « Mid 5 Ball ») **restent dans la sous-catégorie balles**, enregistrées en **version à part** (« Giant », « Mid ») pour ne jamais être rapprochées d'une balle de jeu (précaution de Claude Code : « Giant 9 Ball Atp » contient l'alias « atp »).
- **Q18 — Grips et antivibrateurs** : grip de remplacement ≠ surgrip (**différent**) ; x3 / x12 / x30 / x60 = **lot**, prix **à la pièce** ; Babolat Aero / Drive / Strike / Sonic / Custom Damp : **à vérifier sur les fiches** (versions ou coloris).
- **Q19 — Sacs** : famille = **gamme** ; type (thermobag, sac à dos, duffle, housse, tote) et contenance (RH6 / 9 / 12, litres, S / M / L) = **différent** ; collection et année = **règle standard**, identique seulement pour la même référence (D-2026-09-27-07). Sacs Babolat Pure Aero / Pure Drive / Pure Strike = **trois sacs différents** (versions).
- **Q20 — Sous-catégories d'accessoires** :
  - **lexique v2 adopté** (`config/accessory-subcategories.ts` : préfixe du titre, puis exclusions, puis mots-clés), remplace le lexique v1 de D-2026-09-25-15 ;
  - **nouvelle sous-catégorie `protection_soins`** (64 offres : genouillères, chevillères, coudières, bande kinésio, semelles) : 6e valeur de `deals.subcategory` (modifie la liste de D-2026-09-25-15) ;
  - **textile porté** (casquettes, visières, poignets, bandeaux, chaussettes : 58 offres) **déplacé vers la catégorie textile** ;
  - **hors sujet** (médailles, mug, cahier, décoration, t-shirt cadeau, tapis de yoga : 18 offres) **exclu à l'ingestion** ;
  - le reste (matériel de terrain et mini-raquettes, accessoires de raquette, gourdes et serviettes) reste en « Autres accessoires ».

**À reporter (session desktop Sonnet, réseau ouvert ; spec = cette décision)** :
- `config/model-families-chaussures.ts` : statut « validé » dans l'en-tête ; `editions` Premium distinguées (proche) ; `SHOE_LIFESTYLE_MARKERS` documentés comme liste d'exclusion (Q13) ; cas Q16 vérifiés sur les fiches et tranchés (ou laissés `a_confirmer` avec la source consultée).
- `config/model-families-accessoires.ts` : statut « validé » ; balles `Giant` / `Mid` en versions à part ; ATP / ATP Tour, Damp, et les autres familles `a_confirmer` (Resi Pro, Players Pro Feel, Pro Overgrip) vérifiés sur les fiches ; sacs Pure en versions (confirmé).
- `config/accessory-subcategories.ts` : statut « validé » ; `protection_soins` ajouté au type et aux règles ; règles « textile porté → catégorie textile » et « hors sujet → exclusion » ajoutées (avec leurs motifs) ; `OTHER_ACCESSORIES_GROUPS` mis à jour.
- `config/matching-rules.ts` : chaussures, édition `variante` sauf Premium `proche` ; accessoires, attributs `niveau` (balles, différent), `typeGrip` (différent), unités balle / pièce.
- `R2_referentiel.md` §7.4 : réponses à la place des questions ; GAP-2026-09-25-11 : liste des sous-catégories et étapes R3 mises à jour (6 valeurs, déplacement textile, exclusions) ; liste des exclusions à l'ingestion regroupée pour R3 (JOOLA, chaussures de ville, hors sujet accessoires).

**Statut** : Actée et reportée (2026-09-28, session desktop Sonnet, spec = cette décision). Les cas « à vérifier sur les fiches » ont été vérifiés réellement (réseau ouvert) : adidas Barricade Leather 13/ASMC = éditions proche ; Babolat Jet Tere 2 Premium = édition proche ; Babolat SFX 4 / SFX Evo = deux lignes distinctes, séparées en familles ; Nike GP Challenge 1/1.5/Pro confirmé (générations/version) ; Diadora « S. Challenge » ≠ « Speed Challenge » (correction d'une lecture erronée de R2) ; Lotto SPD (construction)/PRT (coloris) précisés ; Nike Vapor 12 « FO » non trouvé (laissé non résolu, sans impact observé) ; Dunlop ATP / ATP Tour confirmés même balle (fusionnés, seul le conditionnement change) ; Giant/Mid balles géantes isolées en famille à part ; Prince Resi Pro corrigé en grip (pas surgrip) ; Tecnifibre Players Pro / Player Pro Feel confirmés différents ; Wilson Pro Overgrip Blade/Burn confirmés éditions (coloris), Pro X60 = conditionnement ; Babolat Damp Aero/Drive/Strike/Sonic/Custom confirmés versions (formes différentes). **R2 clos pour toutes les catégories.** Prochaine étape : R3.

### D-2026-09-28-04 — Cadrage R3 (capture à l'ingestion) : réponses aux questions R3-Q1 à R3-Q6

**Contexte** : cadrage R3 proposé par Claude Code (`R3_cadrage.md`, commit sur la branche `claude/cloud-credit-usage-bqgtxs`), sans code. Revue faite question par question (AskUserQuestion, 2026-09-28, session cloud Opus).

**Décisions (Mathieu, 2026-09-28)** : toutes les propositions retenues.

- **R3-Q1 — Stockage** : tout ce qui est capturé va **sur l'offre (`deals`)** : `gtin`, `mpn`, `merchant_sku`, `unit_quantity`, `unit_type`, `subcategory`, `raw_attributes` (jsonb). Rien sur `products` en R3 (la clé texte actuelle fusionne à tort des modèles différents). `product_families`, `product_merges` et les colonnes d'attributs de `products` sont créées en R4. Remplace, pour R3, la proposition de R0 §4.
- **R3-Q2 — Requêtes par fiche** : enrichissement (GTIN Tennis Point FR et Tecnifibre, `mpn` Tennispro.fr) **une seule fois par offre** (URL nouvelle ou champ vide), jamais à chaque passage, dans une étape séparée (R3.12) après la réécriture des 8 scripts.
- **R3-Q3 — Périmètre `tracked`** : seulement les articles sans remise **déjà présents dans ce que chaque script récupère**, sans page supplémentaire. Le parcours du catalogue complet reste en Phase 4-bis. Précise D-2026-09-25-22 (« gratuit d'après l'audit de phase 0 », constat absent des documents) : le compteur est mesuré marchand par marchand lors du vrai passage de chaque script.
- **R3-Q4 — Offres exclues déjà en base** (JOOLA, chaussures de ville, hors sujet accessoires) : non insérées à l'ingestion (comptées dans les compteurs du passage) ; celles déjà en base passent en **`status='invalid'`**, jamais supprimées (réversible, historique conservé).
- **R3-Q5 — Garde-fou d'éviction** : **garde-fou 50 % avancé en R3.2** : aucune éviction si le passage voit moins de la moitié des offres `active` + `tracked` du marchand comptées avant le passage (sans `ingestion_runs`, qui reste en Phase 2). Le garde-fou « 0 URL vue » est conservé. L'éviction s'applique aux `active` et aux `tracked` (D-2026-09-25-21).
- **R3-Q6 — Filtre des sous-catégories dans l'interface** (GAP-2026-09-25-11 étape 6) : **dans R3 (R3.13)**, sur conseil de Claude Code, **sans bloquer R4** : réalisable dans une session cloud dès la fin du backfill R3.3, en parallèle des passages réels R3.4 à R3.11.

**Découpage retenu** (`R3_cadrage.md` §3) : R3.1 migration additive + audit des requêtes du site (branche Neon) ; R3.2 `lib/ingest.ts` + tests ; R3.3 backfill (branche Neon puis prod après accord) ; R3.4 à R3.11 réécriture d'un script par étape avec vrai passage (ordre : Tecnifibre, Tennis Point FR, Sport 2000, SportSystem, Babolat, Tennispro.fr, Head, Amazon) ; R3.12 enrichissement par fiche ; R3.13 filtre UI. Toutes les étapes relèvent de Sonnet (exécution d'une spec validée), une étape par conversation.

**Statut** : Actée (2026-09-28). Prochaine étape : **R3.1**, nouvelle session Sonnet (cloud possible : Neon seulement).

### D-2026-09-29-01 — Cadrage R4 (moteur de rapprochement en mode fantôme) : réponses aux questions R4-Q1 à R4-Q8

**Contexte** : cadrage de R4 (`R4_cadrage.md`), questions posées une par une avec leurs implications. Mathieu retient **toutes les propositions**.

- **R4-Q1 — Stockage** : 4 tables nouvelles `match_runs`, `match_offer_attributes`, `match_models`, `match_offer_links` ; aucune table existante modifiée ; familles lues dans `config/` (pas de table `product_families`) ; « modèle proche » calculé à la lecture ; `product_merges` créé en R5.
- **R4-Q2 — Lancement** : script lancé à la main, recalcul complet et déterministe ; pas de branchement dans `lib/ingest.ts` avant R5.
- **R4-Q3 — Périmètre** : offres `active` + `tracked` ; couverture publiée deux fois (avec `tracked`, et en `active` seulement) ; `expired`/`invalid` seulement dans le jeu R1 figé.
- **R4-Q4 — Génération non écrite des deux côtés** : règle mixte. Cordages et accessoires hors sacs : « génération unique » par défaut (→ identique possible), exceptions notées dans le référentiel. Raquettes, chaussures, sacs : règle stricte D-2026-09-26-01 (→ proche), levée par génération écrite, GTIN, référence fabricant commune, ou famille marquée « génération unique » validée par Mathieu.
- **R4-Q5 — Revue** : rapport Markdown + CSV à chaque passage ; pas d'interface avant R5 / Phase 5 ; ajouts au référentiel en lot (D-2026-09-28-01).
- **R4-Q6 — Mesure** : jeu R1 (rappel global et « atteignable ») + 30 modèles « identiques » inter-marchands tirés en prod et validés par Mathieu en R4.6.
- **R4-Q7 — Référence SportSystem** : vérifiée en R4.2 sur un échantillon par marque ; si c'est la référence fabricant, copiée dans `mpn` (branche Neon puis prod avec accord), script corrigé, marques où ce n'est pas le cas exclues.
- **R4-Q8 — Option IA** : décision en R4.6, sur les erreurs restantes.

**Découpage retenu** (`R4_cadrage.md` §4) : R4.1 migration + jeu R1 figé + banc de mesure ; R4.2 extraction raquettes/cordages ; R4.3 extraction chaussures/accessoires ; R4.4 comparaison, cascade, script fantôme, rapport ; R4.5 textile + étape approchée + seuils (Opus) ; R4.6 analyse des erreurs et dossier de bascule (Opus). R4.1 à R4.4 en Sonnet. Toutes faisables en session cloud.

**Statut** : Actée (2026-09-29). Prochaine étape : **R4.1**, nouvelle session Sonnet.

### D-2026-09-29-02 — R4.2 : familles Head ajoutées, référence SportSystem lue par le moteur (révision de R4-Q7)

**Contexte** : R4.2 (extraction raquettes + cordages). Propositions de `R4_2_complement_referentiel.md`, conseil de Claude Code, validées par Mathieu le 2026-09-29.

- **Familles Head raquettes ajoutées** à `config/model-families.ts` : Challenge, MX Attitude, Arthur Ashe, Spark (`observe`), Metallix Attitude et PWR (`a_confirmer`). Aucune n'est marquée « génération unique » (règle stricte, R4-Q4). MX Attitude / Metallix Attitude et Spark / MX Spark restent séparées faute de vérification.
- **R4-Q7 révisée** : la référence SportSystem (vérifiée comme référence fabricant pour Head, Babolat, Tecnifibre) n'est **pas copiée dans `mpn`**. Le moteur la lit directement (`reference` de chaque variante ; `merchant_sku` seulement sans variantes et non concaténé). Raisons : aucune écriture sur `deals` pendant R4 (principe fantôme), une référence par variante conservée (Dunlop : varie avec la taille de manche), correction par une ligne de code si une marque se révèle fausse. La correction de `scripts/scraping/sportsystem.ts` (remplir `mpn` à la source) est reportée à R5.

**Statut** : Actée (2026-09-29).

### D-2026-09-29-03 — Phase de correction R4.4-bis ajoutée avant R4.5

**Contexte** : contrôle de R4.1 à R4.4 demandé par Mathieu (session Opus du 2026-09-29, détail dans `R4_4_controle.md`). Code et tests conformes, mais la relecture des 90 modèles multi-marchands du premier passage en prod trouve 5 faux regroupements (précision ≈ 94 %, objectif 95 %) et 5 des 9 modèles de cordages à plusieurs offres faux. Cinq défauts confirmés sur les fonctions du moteur : version des cordages jamais comparée (D1), « All Court » lu comme la version « Court » (D2), « PRM » non reconnu comme Premium (D3), Hydrosorb Comfort absent du référentiel (D4), indicateur « modèles incohérents » aveugle à ces erreurs (D5). Le jeu R1 ne contenait aucune paire de ces formes. Constat séparé sur les raquettes : aucun rapprochement Babolat / Head / Tennis Point FR (blocages A et B, `R4_4_controle.md` §5).

**Décision (Mathieu, 2026-09-29)** : ajouter une **phase de correction R4.4-bis** à la feuille de route (`R4_cadrage.md` §4) **avant de poursuivre les autres phases** : R4.5 ne démarre qu'après les corrections, un nouveau passage fantôme et une nouvelle relecture des modèles multi-marchands. Contenu proposé dans `R4_4_controle.md` §7 ; les questions C-Q1 à C-Q4 (version des cordages, collaborations type Y-3, levier du blocage B des raquettes, Wilson Sensation Comfort) sont posées à Mathieu en début de phase et ne sont pas tranchées par cette décision.

**Réponses de Mathieu aux questions (2026-09-29, début de R4.4-bis)** :
- **C-Q1** : la version des cordages est discriminante (`version: "different"`) ; écrite d'un seul côté → « proche ».
- **C-Q2** : l'Avacourt 2 Y-3 et les collaborations du même type sont des **modèles séparés** (édition « Y-3 » → « différent » ; autres collaborations à ajouter au référentiel au fil des rencontres).
- **C-Q3** : le blocage B des raquettes est levé dans R4.4-bis (famille, version et génération écrites et égales des deux côtés : poids, tamis, plan, longueur connus d'un seul côté ne bloquent plus ; bloquants s'ils sont connus des deux côtés et différents).
- **C-Q4** : fiche vérifiée puis version « Comfort » ajoutée à Sensation (voir `model-families.ts`).

**Statut** : Actée (2026-09-29).

---

### D-2026-09-29-04 — Cadrage R4.5 (textile et étape 3) : réponses aux questions T-Q1 à T-Q7

**Contexte** : cadrage `R4_5_cadrage.md` (session Opus du 2026-09-29), fondé sur les 2 829 offres textiles de la prod (lecture seule).

**Décision (Mathieu, 2026-09-29)** : toutes les propositions retenues.
- **T-Q1** : même référence de style fabricant → **identique**, même si les titres diffèrent. La paire R1 17 (adidas JG0994) passe de « proche » à « identique ».
- **T-Q2** : longueur différente (7in / 9in) → **proche**.
- **T-Q3** : collection de tournoi (« Pro Londres », « Pro Miami »…) écrite d'un seul côté = **édition**, donc **proche**.
- **T-Q4** : pas de fusion automatique par score en R4.5 ; le score remplit une **file de revue** (`revue-textile.csv`). Seules la référence et la signature exacte fusionnent. Le seuil haut se rediscute en R4.6.
- **T-Q5** : le prix d'origine est un **indice** qui baisse le score ; il ne bloque jamais une fusion.
- **T-Q6** : pas de « valeur dominante ».
- **T-Q7** : liste `generationUnique` dans une **étape à part, R4.5-c**, après le textile.

**À reporter en R4.5-a (session Sonnet, spec = `R4_5_cadrage.md` + cette décision)** : paire 17 reclassée « identique » dans `R1_jeu-reference-candidat.csv`, dans le jeu R1 figé des tests et dans `R1_mesure.md` (33 identiques / 14 proches / 20 différents) ; compteurs attendus des tests ajustés.

**Statut** : Actée (2026-09-29).

### D-2026-09-29-05 — R4.5-b : références de style Nike différentes = proche ; même référence = identique malgré un nom de tournoi

**Contexte** : relecture en session Opus des 3 cas « à confirmer » laissés par R4.5-b (passage à blanc textile, rien écrit en base). Constats sur les données :
- les modèles « Victory 7 » (CV3048 + FD5380), « Advantage 7 » (DD8329 + FD5336) et « **Victory 9** » (CV2545 + FD5384 + FD5388, non repéré à la relecture) réunissent deux générations Nike : l'ancienne « Flex » et la nouvelle « Dri-FIT ». La référence rattache « Flex Victory » à CV3048, puis le titre (« Victory » + longueur) rattache CV3048 à FD5380 ;
- « Djokovic Dubai / RG » est du **Lacoste** (pas du Nike) : même référence de style GH5219 (coloris 3A4 / 166), un seul marchand (SportSystem), même prix ;
- pour adidas, les codes différents dans un même modèle (Club, Club SW) sont normaux : le code adidas désigne un coloris (§3.1 de `R4_5_cadrage.md`).

**Décision (Mathieu, 2026-09-29)** :
- **Nike : deux références de style différentes, connues des deux côtés → « proche », jamais « identique »**, même si la signature du titre est égale. Une référence de style Nike différente vaut génération différente écrite (D-2026-09-27-06). La règle est écrite **par marque** et ne vise que Nike. Une autre marque ne s'ajoute qu'après une vérification sur les données, et adidas en est exclu.
- **Même référence de style → « identique »**, même si les titres portent des noms de tournoi différents (« Printemps Dubai » / « Printemps RG ») : ces noms sont alors des coloris (T-Q1 prime sur T-Q3 quand la référence est la même).
- File de revue : la paire Head « TIE-BREAK » / « BREAK II TIE- » (score 1,0) est **Tie Break II**, une génération différente : **à refuser**, et « II » doit être lu comme marqueur de génération même quand le titre est désordonné.

**À reporter en R4.5-b (session Sonnet)** :
- liste de marques, par exemple `TEXTILE_STYLE_DISTINCT_BRANDS = ["nike"]` dans `config/textile-lexicon.ts` ;
- dans le regroupement (`lib/matching/cluster.ts`), un modèle ne contient jamais deux références de style différentes d'une marque listée, y compris par transitivité ;
- une offre sans référence (Tennis Point FR…) dont le titre correspond à plusieurs groupes de références n'est rattachée à aucun : elle est « proche » de chacun (proposition de la session Opus, à signaler à Mathieu si le nombre de modèles multi-marchands chute fortement) ;
- tests versionnés : CV3048 / FD5380, DD8329 / FD5336, CV2545 / FD5384 (proche) ; GH5219-3A4 / GH5219-166 (identique) ; « TIE-BREAK » / « BREAK II TIE- » (génération différente) ;
- nouveau passage à blanc, puis relecture des modèles multi-marchands, puis PR de R4.5-b.

**Statut** : Actée (2026-09-29).

### D-2026-09-29-06 — Définition de « identique » ; « proche » séparé d'un nouvel état « indéterminé »

**Contexte** : la mesure de séparation (`R4_5_mesure_separation.md`) montre que, sur l'échantillon, 56 % des paires séparées faute d'information étaient en réalité le même produit. Dans le moteur, un attribut connu d'un seul côté vaut une différence « proche » (`lib/matching/compare.ts`) : « proche » mélange donc une vraie différence mineure et une information manquante. Définitions proposées en session Opus, validées par Mathieu.

**Décision (Mathieu, 2026-09-29)** :
1. **Identique** : deux offres sont identiques si l'acheteur reçoit le même produit en choisissant la même variante chez l'un ou l'autre marchand. Les variantes (taille, pointure, grip, **coloris**, y compris un coloris d'une nouvelle saison si la fiche technique ne change pas) ne changent pas l'article : « un modèle rose ou vert sera identique » (Mathieu). Définition complète : §4 bis du cadrage du rapprochement. Validée.
2. **« Proche » (différence connue) séparé de « indéterminé » (information manquante)** : validé, **à condition de faire plus tard le travail d'investigation** sur les paires indéterminées (référence fabricant, fiche, familles à génération unique). Ce travail est un engagement, pas une option.
3. **Sort des paires indéterminées** (A : les laisser à part ; B : « identique présumé » ; C : validation une à une) : **tranché plus tard, catégorie par catégorie**, après les mesures de la relecture. Validé.

**Portée** : ces définitions deviennent la grille de la relecture. Elles ne remplacent pas le travail fait (extraction, référentiel, cascade, R4.5-a et R4.5-b restent en place) ; elles servent à juger les résultats et à cibler les ajustements. Seul changement de code déjà identifié : distinguer « indéterminé » de « proche » dans `compare()` (étape à planifier, non faite).

**Statut** : Actée (2026-09-29).

### D-2026-09-29-07 — Étape 0 : règles textile (millésime, édition), solution révisée de la séparation, place de R4.5-c

**Contexte** : analyse de cohérence des fichiers de cadrage (session Opus). Quatre points contradictoires ou non tranchés : règle Q6 (D-2026-09-28-02) contredite par R4.5-a ; §4 bis (D-2026-09-29-06) contraire au §5 textile et à la paire R1 59 sur les éditions ; solution §5.4 de `R4_5_mesure_separation.md` non validée ; place de R4.5-c remise en cause par ce §5.4 sans être notée. Questions posées une à une (AskUserQuestion), réponses explicites de Mathieu.

**Décision (Mathieu, 2026-09-29)** :
1. **Textile, mention écrite d'un seul côté** : trois cas.
   - Collection ou année écrite **hors du nom de modèle** (« Collection 2022 », paire R1 58) → **identique** (Q6 maintenu).
   - **Numéro de génération dans le nom** (« Tie Break II », « 2 ») → **proche** (déjà appliqué à Tie Break II, D-2026-09-29-05).
   - **Millésime dans le nom** (« Club 25 Tech » / « Club Tech ») → **indéterminé** dès que cet état existe (D-2026-09-29-06 : on ne sait pas si la fiche technique a changé) ; **proche** d'ici là (comportement actuel de R4.5-a).
2. **Éditions spéciales (RG, Wimbledon, édition joueur), règle par catégorie** :
   - raquettes, cordages, chaussures : **variante** (Q7, Q15, inchangé) ;
   - textile : édition nommée écrite d'un seul côté → **proche** (paire R1 59 maintenue : autre dessin, autre prix), **sauf même référence de style → identique** (D-2026-09-29-05).
   - La phrase du §4 bis du cadrage du rapprochement est corrigée en conséquence.
3. **Solution révisée de la séparation (§5.4) validée** : (1) références de style dans toutes les catégories (SKU Babolat, Head, Sport 2000, partie « style » avant le premier tiret) ; (2) corrections d'extraction du §5.3, chacune avec une paire piège ; (3) seulement ensuite, assouplissement (génération absente, jauge absente) rediscuté sur un nouvel échantillon tiré paire par paire. **Tecnifibre n'est ajoutée qu'après vérification sur les données** de la forme de sa référence (écartée en R4.5-a faute de preuve).
4. **R4.5-c déplacé** : la liste `generationUnique` se dresse **après** les références (étape 1 ci-dessus), les corrections d'extraction et l'état « indéterminé » dans `compare()`, dans le cadre de l'investigation des paires indéterminées (D-2026-09-29-06).

**Ordre d'exécution qui en découle** : fin de R4.5-b (code de D-2026-09-29-05, passage à blanc, relecture, PR) → décisions de Mathieu sur `revue-textile.csv` → écriture du passage en prod → références de style toutes catégories → corrections d'extraction → état « indéterminé » → investigation des indéterminés (dont R4.5-c) → R4.6.

**À reporter en code (Sonnet)** : point 1, troisième cas, avec l'état « indéterminé » ; rien à changer d'ici là (R4.5-a répond déjà « proche »). Point 2 : rien à changer (comportement actuel).

**Statut** : Actée (2026-09-29).

### D-2026-09-29-08 — Ménage de la documentation de suivi : périmètre et choix

**Contexte** : inventaire de la documentation (session Opus). ETAT_ACTUEL porte tout l'historique R0-R4.5 sur sa ligne « Dernière mise à jour » (environ 40 000 caractères), JOURNAL à 301 lignes (seuil 150), 18 gaps déjà résolus encore présents, spec du MVP périmée, README par défaut de create-next-app. Deux sujets ne sont plus suivis nulle part depuis la fin de R3 : les 4 nouveaux marchands (D-2026-09-27-02, annoncés « périmètre R3 », absents de `R3_cadrage.md`) et l'étape 4 de GAP-2026-09-25-15 (détection junior par la description, « rattachée à R3 », non faite). Questions posées (AskUserQuestion), réponses explicites de Mathieu.

**Décision (Mathieu, 2026-09-29)** :
1. **Spec du MVP archivée** : `spec.md`, `plan.md`, `tasks.md`, `research.md`, `quickstart.md`, `data-model.md`, `contracts/`, `checklists/` déplacés tels quels dans `archive/mvp/` (`git mv`), une ligne dans INDEX (« état du MVP au 2026-09-24, non tenu à jour »).
2. **Nouveaux marchands** : nouveau gap ouvert (Sports Raquettes, Tennis Compagnie, Extreme Tennis, puis Tennis Achat en dernier, « même opérateur » que Tennispro.fr ; Intersport via Kwanko seulement) ; construction **après R4.6**, sur `lib/ingest.ts` ; candidatures d'affiliation toujours bloquées par le renommage « Bonplantennis » (GAP-2026-09-25-10).
3. **Détection junior** : GAP-2026-09-25-15 (étape 4) et GAP-2026-09-25-17 (17") fusionnés en un seul gap « détection junior restante », **hors chemin critique** ; les étapes 1 à 3 faites et l'étape 5 close sont retirées du texte.
4. **README** remplacé par un README court (le site, la stack, les commandes utiles, renvoi vers `cadrage_deals-tennis/INDEX.md`).
5. Le reste du ménage est mécanique et suit les seuils de D-2026-09-22-09 (détail et ordre d'exécution : JOURNAL, session du 2026-09-29 « Ménage de la documentation : cadrage »).

**Statut** : Actée (2026-09-29). Exécution : session Sonnet.

### D-2026-09-30-01 — Relecture R4.5-b : sous-gamme adidas, « Flouncy » Nike, millésime

**Contexte** : relecture des 69 modèles textiles multi-marchands du passage à blanc en prod (`JOURNAL_SESSIONS.md`, 2026-09-30).

**Décision (Mathieu, 2026-09-30)** :
- **Sous-gamme adidas** (« 3-Stripes », « 3S », « Climacool », écrite d'un seul côté) : si le prix d'origine est proche, ce sont des **mots neutres** (même article) ; sinon, **modèles distincts**. Seuil « proche » : **10 %** (proposition retenue), calculé sur la médiane de prix d'origine de chaque groupe d'offres ; prix inconnu d'un côté ou deux sous-gammes différentes → distincts. Exception voulue à T-Q5 (le prix n'est plus seulement un indice pour ce cas précis). Les paires non réunies vont en file de revue.
- **Nike Victory** : la jupe avec ou sans « Flouncy » est **le même article** (mot neutre pour Nike).
- **Millésime ou numéro de génération écrit d'un seul côté** (« Club 25 Tech », « Tie Break II ») : **Mathieu ne sait pas** ; la règle actuelle (« proche ») reste en vigueur, question toujours ouverte, à reprendre avec la relecture de `revue-textile.csv`.
- Correction sans décision à prendre : « bermuda » n'est plus un synonyme de « short » (Head publie « CLUB Bermuda » et « CLUB Short » comme deux articles).

**Statut** : Actée (2026-09-30), sauf le millésime (ouvert).

> Note du 2026-09-30 (D-2026-09-30-03) : la question du millésime avait déjà été tranchée la veille par D-2026-09-29-07 point 1 (millésime dans le nom → « proche » aujourd'hui, « indéterminé » dès que cet état existe ; numéro de génération dans le nom → « proche »), restée sur la PR #117 et donc invisible pour la session du 2026-09-30. Le comportement est le même (« proche » aujourd'hui) ; D-2026-09-29-07 fait foi. La note Nike « Flouncy » reste compatible avec D-2026-09-29-05 (même référence de style → identique).

### D-2026-09-30-02 — R4.5-c : familles `generationUnique`, défauts d'extraction (R4.5-d)

**Contexte** : proposition `R4_5_c_generation_unique.md` (session Opus, 2026-09-30), tirée de `proches.csv` du passage `r4.5-b-textile` et vérifiée sur le web. Dans 9 des 27 familles bloquées seulement par une génération non écrite, le blocage masque des défauts d'extraction (taille S/M/L des sacs, RH6/9/12, version des sacs Pure, type de sac, taille et version des T-Fight junior, taille des Speed junior, etc.).

**Décision (Mathieu, 2026-09-30)** :
- **Q1** : `generationUnique` sur Head Endure Pro, Babolat SFX Evo, adidas Avaluxe, ASICS Game FF, Wilson Intrigue (chaussures).
- **Q2** : une chaussure sans numéro, ressortie chaque saison dans de nouveaux coloris, est une génération unique : **adidas Courtflash et Babolat Pulsion** aussi (Pulsion retenue malgré le doute sur une refonte 2017-2025, noté dans la famille).
- **Q3** : « ultra » devient le marqueur de la génération AG-LT23 de la famille Lacoste AG-LT (pas de marquage unique) ; à revoir si une « AG-LT25 Ultra » sort.
- **Q4** : les défauts d'extraction du §2 sont corrigés dans une étape à part, **R4.5-d** (Sonnet, paires pièges tirées du tableau), avant R4.6. Tant que ce n'est pas fait, ces familles ne sont pas marquées.
- **Q5** : pour une famille marquée `generationUnique`, une année ou une génération écrite d'un seul côté ne bloque plus « identique » (modification de `generationDifference`).

**Statut** : Actée (2026-09-30). Report dans `config/model-families-chaussures.ts` et `lib/matching/compare.ts` à faire en Sonnet (R4.5-c, report), puis R4.5-d. **Ordre modifié par D-2026-09-30-03** : report de R4.5-c après l'état « indéterminé », R4.5-d fondue dans les corrections d'extraction.

### D-2026-09-30-03 — PR #117 fermée sans merge, report sur `master`, ordre de D-2026-09-29-07 confirmé

**Contexte** : la PR #117 (session cloud du 2026-09-29, brouillon) portait sa propre implémentation de R4.5-b (`lib/matching/approx.ts`), le code de D-2026-09-29-05 et les décisions D-2026-09-29-05 à 08 avec le ménage de la documentation. Une session desktop a refait R4.5-b le 2026-09-30 à partir de `master` (`textile-review.ts`, PR #118, fusionnée, passage écrit en prod), sans voir ces décisions ; la session Opus du même jour a conduit R4.5-c sans voir D-2026-09-29-07 point 4. #117 était en conflit.

**Décision (Mathieu, 2026-09-30)** :
1. **#117 fermée sans merge.** Son contenu propre est reporté sur `master` : décisions D-2026-09-29-05 à 08 (insérées telles quelles), `R4_5_mesure_separation.md`, §4 bis de `CADRAGE_rapprochement-multi-niveaux.md`, ménage de D-2026-09-29-08 (spec MVP dans `archive/mvp/`, README, gaps retirés archivés, ETAT_ACTUEL court). L'implémentation R4.5-b de `master` est gardée ; **le code de D-2026-09-29-05 y sera reporté** dans une session Sonnet (premier point de l'ordre), avec les tests de #117.
2. **Ordre de D-2026-09-29-07 retenu** (recommandation acceptée) : (1) code de D-2026-09-29-05 ; (2) décisions sur `revue-textile.csv` ; (3) écriture en prod ; (4) références de style toutes catégories ; (5) corrections d'extraction, qui absorbent R4.5-d ; (6) état « indéterminé » ; (7) investigation des indéterminés, dont le report de R4.5-c ; (8) R4.6. Motifs : `generationDifference` n'est modifiée qu'une fois (Q5 de D-2026-09-30-02 s'écrit directement avec l'état « indéterminé ») ; les faux regroupements Nike passent avant les rapprochements manqués. La liste de D-2026-09-30-02 reste validée.

**Statut** : Actée (2026-09-30).

### D-2026-09-30-04 — Relecture de la file de revue textile : règles et sort des paires

**Contexte** : relecture des 215 paires de `revue-textile.csv` (passage à blanc avec le code de D-2026-09-29-05) par la session Opus, avec les références en base et les GTIN des fiches Tennis Point FR : `R4_5_revue_textile.md` et `R4_5_revue_textile.csv`. Propositions de Claude Code : 18 identiques sûres, 5 identiques à confirmer, 81 proches, 104 différentes, 7 incertaines. Questions posées (AskUserQuestion), recommandations retenues par Mathieu.

**Décision (Mathieu, 2026-09-30)** :
1. **Règles à coder** : (a) le nom de modèle textile est comparé **sans tenir compte de l'ordre des mots**, « II » restant un marqueur de génération (clôt GAP-2026-09-30-01) ; (b) **chiffres romains = chiffres arabes** (« Tech IV » = « Tech 4 ») ; (c) **RG = Paris** dans le lexique des éditions ; (d) **Lacoste traitée comme Nike** : deux références de style Lacoste différentes, connues des deux côtés → « proche » (`TEXTILE_STYLE_DISTINCT_BRANDS`, D-2026-09-29-05 étendue après vérification sur les données : 5 paires, 5 références TH différentes).
2. **18 paires identiques sûres** : consignées dans `R4_5_revue_textile.csv`, sans liste de liens manuels ; elles se réuniront par les règles ci-dessus et les références de l'étape 4. La mécanique de validation manuelle reste pour R5 (GAP-2026-09-27-02).
3. **20 paires à confirmer** (identique?, proche?, incertain) : non réunies, reprises à l'étape 7 (investigation des indéterminés).
4. **Exclusion de la file par numéro de génération** (question laissée ouverte le 2026-09-30) : règle gardée ; « 3 bandes » en sous-gamme et longueurs en pouces hors Nike / adidas corrigées à l'étape 5, chacune avec une paire piège.

**À reporter en code (Sonnet)** : 1(d) avec les références de style (étape 4) ; 1(a), 1(b), 1(c) et 4 avec les corrections d'extraction (étape 5), plus le cas des t-shirts adidas junior non réunis par l'étape 2 ter (lignes 24, 54, 56). L'écriture en prod (étape 3) ne dépend d'aucun de ces reports.

**Statut** : Actée (2026-09-30).

### D-2026-09-30-05 — Étape 4 : références de style hors textile, jauge, marques textile

**Contexte** : cadrage de l'étape 4 (session Opus, `R4_5_references_style.md`). Simulation en mémoire du moteur sur les 5 035 offres de prod : lire le SKU des sites Babolat et Head et de Sport 2000, et comparer la partie « style » des références hors textile, fait passer les modèles multi-marchands de 170 à 229 ; les 94 fusions relues réunissent toutes le même produit. Le suffixe est le coloris, sauf pour les balles (conditionnement). La référence Tecnifibre n'a pas de découpe stable. En textile, Head et Babolat changent de référence au sein d'un même article. Questions posées (AskUserQuestion), recommandations retenues par Mathieu.

**Décision (Mathieu, 2026-09-30)** :
1. **Hors textile** : le `merchant_sku` des sites Babolat et Head et de Sport 2000 devient une référence fabricant ; toutes les références sont comparées sur leur partie « style » (découpe sur « / », puis avant le premier tiret). Deux exceptions : les **balles** gardent leur référence complète ; **Tecnifibre** hors textile n'est pas ajoutée (le GTIN suffit).
2. **Cordages** : la référence désigne le cordage, la jauge se choisit sur la fiche. **Jauge = variante quand la référence est commune** ; sans référence commune, la jauge reste « proche » (D-2026-09-27-05).
3. **Textile** : Lacoste rejoint Nike (D-2026-09-30-04, 1d) ; **ni Head ni Babolat** ne sont traitées comme Nike ; la découpe Tecnifibre à 6 caractères n'est pas retenue (1 modèle gagné, 48 conflits junior / adulte), reprise à l'étape 7.
4. **GTIN des fiches textile de Tennis Point FR** : reporté à l'étape 7.

**À reporter en code (Sonnet)** : §6 de `R4_5_references_style.md` (`manufacturerReferences`, liste de marchands, `TEXTILE_STYLE_DISTINCT_BRANDS`, tests, passage à blanc, PR). Constats pour l'étape 5 : « Pure Drive + » non lu (faux regroupement actuel par l'étape 2 bis), « Pat Patrouille » lu adulte.

**Statut** : Actée (2026-09-30).

### D-2026-09-30-06 — Générations : séparées pour les prix, regroupées par famille à l'affichage ; Radical Palm Tree Crew = Radical 2025

**Contexte** : Mathieu, en lisant le rapport de l'étape 4 (`rapport-etape4-references/proches.csv`), constate que « Radical MP » et « Radical MP Palm Tree » ne sont pas réunies, et demande s'il faut regrouper les générations (Pure Aero 2023 / 2026…) ou faire ce tri à l'affichage seulement. Constats de la session Opus : le nom « Palm Tree » ne sépare pas les offres (édition décorative = variante, Q7) ; la séparation vient de l'année absente d'un côté (« HEAD Radical MP Palm Tree », site Head : `generation: ? | a2025`), classée « proche » faute d'état « indéterminé ». Vérification web : la Radical MP Palm Tree Crew est vendue comme « 2025 » et a les caractéristiques de la Radical MP 2025 (98 in², 16x19, 300 g), seul le décor change ([Tennis Warehouse Europe](https://www.tenniswarehouse-europe.com/Head_Radical_MP_Palm_Tree_Crew_2025_Racket/descpage-HRMPPT.html), [Merchant of Tennis](https://www.merchantoftennis.com/products/head-radical-mp-palm-tree-crew-2025)).

**Décision (Mathieu, 2026-09-30)** :
1. **Générations séparées pour les prix** : l'article reste l'unité du prix, de l'historique et du verdict ; D-2026-09-26-01 et le principe R4 sont inchangés. Une ancienne génération en déstockage ne doit ni faire paraître la nouvelle trop chère, ni créer un faux « vrai bon plan ».
2. **Regroupement par famille à l'affichage** : la fiche montre la génération courante avec ses prix comparés, puis les autres générations de la même famille dans une section à part, la différence écrite en clair (« Génération précédente : 2023, dès X € », principe R6). Pas de « meilleur prix » entre générations. À cadrer avec l'affichage des niveaux (R5).
3. **« palm tree » = marqueur de la génération 2025** dans la famille Head Radical (raquettes seulement ; les sacs Palm Tree Crew ne sont pas concernés), comme « ultra » pour l'AG-LT23 (D-2026-09-30-02 Q3). À revoir si Head sort une Palm Tree sur une autre génération.

**À reporter en code (Sonnet)** : point 3 avec les corrections d'extraction (étape 5), avec une paire piège (Radical MP Palm Tree / Radical MP 2023 → différent). Les offres « Radical MP » sans année ni référence commune restent à l'étape 6 (état « indéterminé ») et 7 (investigation). Point 2 : GAP ouvert pour R5.

**Statut** : Actée (2026-09-30).

### D-2026-09-30-07 — Étape 5 : corrections d'extraction, règles nouvelles

**Contexte** : cadrage de l'étape 5 (session Opus), `R4_5_etape5_corrections.md`. Chaque défaut listé (§5.3 de `R4_5_mesure_separation.md`, §2 de `R4_5_c_generation_unique.md`, D-2026-09-30-04, §7 de `R4_5_references_style.md`, D-2026-09-30-06) a été rejoué sur les 5 035 offres de la prod (lecture seule). Dix corrections appliquent une règle déjà décidée (§2 du document, A1 à A10). Huit demandaient une règle nouvelle (§3, B1 à B8), soumises par AskUserQuestion.

**Décision (Mathieu, 2026-09-30)** :
1. **Taille des raquettes junior (B1)** : un nombre de 17 à 26 sur une raquette enfant est lu comme la longueur en pouces, y compris collé (« Jr.25 ») ; les tailles quittent les versions des familles junior. **Deux tailles différentes = « proche »** (rôle actuel de la longueur, inchangé), et non « différent » comme proposé.
2. **Référentiel (B2, B3, B7)** : famille à part « Pure Drive Junior » (Babolat, Gen11) ; versions « MP UL » et « MP XL » ajoutées à Head Extreme ; édition « Leather » (Barricade) = « proche », comme l'écrivait Q16.
3. **Evo Court (B6)** : « Evo Court L » et « Court L » sont **le même sac** ; pas de famille à part (la proposition est refusée), « evo court » reste un alias de Babolat Court.
4. **Sacs (B4, B5)** : nouvel attribut `taille_sac` (XS / S / M / L / XL), « différent », distinct de `contenance` ; types de sac ajoutés (`sac_chaussures`, `porte_cles`, `gym`, `voyage`, `court_bag`, `sport_bag`), « rackpack » distinct du sac à dos.
5. **Longueur des shorts (B8)** : la règle Nike / adidas (nombre de 5 à 10 dans un short = longueur en pouces) s'applique à toutes les marques ; 1 à 4 restent des numéros de génération.
6. **Constats sans correction** (§4 du document) : t-shirts adidas junior « Club » / « Club Climacool » laissés tels quels (médiane du groupe 28 € contre 25 €, 10,7 % d'écart, règle de D-2026-09-30-01 appliquée correctement) ; éditions des sacs Wilson Super Tour sans effet (Q19) ; « Homme W » sans règle.

**Précision (Claude Code, décision mineure)** : une longueur lue dans le titre (« + » de A1, taille junior de B1) n'est pas une caractéristique dérivée au sens de C-Q3 : elle n'est pas levée quand elle est connue d'un seul côté. Sinon « Speed Jr.25 » et une « Speed junior » sans taille écrite pourraient être dites identiques par la levée C-Q3, ce que le principe R3 exclut.

**Précisions du report en code (Claude Code, décisions mineures, 2026-09-30)** : (a) la version d'un **sac** est « différent » (Q19 : Pure Aero / Drive / Strike sont trois sacs), celle d'un antivibrateur reste « proche » ; (b) un type de sac « à chaussures », « porte-clés », « gym » ou « voyage » écrit d'un seul côté donne « différent » (« Tour sac à chaussures » / « Tour Bag XL » l'exigeait) ; (c) Y-3 et ASMC sont lus avant la génération, pour que le « 3 » de « Y-3 » ne soit plus une génération ; (d) les tailles ne quittent les versions que de Drive Junior, Carlitos Junior et T-Fight junior (§6 point 11), les autres familles junior gardent « Novak 19 ≠ Novak 25 » (paire R1 11). Détail : §7 de `R4_5_etape5_corrections.md`.

**À reporter en code (Sonnet)** : A1 à A10 et les points 1, 2, 4 et 5 ci-dessus, chacun avec sa paire piège (§2 et §6 de `R4_5_etape5_corrections.md`), puis passage à blanc en prod, comparaison avec `66f39305…` et relecture des modèles multi-marchands nouveaux ou défaits ; écriture en prod après accord de Mathieu.

**Statut** : Actée (2026-09-30).

### D-2026-09-30-08 — Étape 6 : état « indéterminé » dans `compare()`, frontière marqueur / caractéristique descriptive

**Contexte** : étape 6 de l'ordre du chantier (D-2026-09-29-07, D-2026-09-30-03), cadrage en session Opus, `R4_5_etape6_indetermine.md`. Dans `compare()`, une information manquante vaut aujourd'hui « proche ». Mesure en lecture seule sur les 5 035 offres de la prod : sur 3 036 paires inter-marchands « proche », 1 690 n'ont aucune différence connue, seulement des informations manquantes. Le regroupement ne réunit que des paires « identique » : aucun modèle ne change.

**Décision (Mathieu, 2026-09-30, AskUserQuestion)** :
1. **Principe validé** : « indéterminé » = aucune différence connue, seulement des informations manquantes. Ordre des verdicts : différent > proche > indéterminé > identique ; une différence connue suffit pour « proche ». Les paires indéterminées sont listées dans un nouveau fichier `indetermines.csv` du rapport, pour l'étape 7.
2. **Marqueur écrit d'un seul côté → proche (inchangé)** : son absence veut dire l'article de base. Marqueurs : `version` (toutes catégories), `largeur`, `edition` (textile), `numero`, `sous_gamme`, valeurs à exception (Premium, Leather, Y-3, ASMC) et valeurs de source `titre_marqueur` (« + », taille junior). Cohérent avec C-Q1 et D-2026-09-29-07.
3. **Caractéristique descriptive écrite d'un seul côté → indéterminé** : genre, surface, poids, tamis, plan de cordage, longueur, jauge, conditionnement, matière, nom de modèle textile, millésime textile (D-2026-09-29-07 point 1), etc. Même chose pour la génération inconnue ou non écrite (règle `standard`), l'année face à un libellé sans année, et un attribut requis absent des deux côtés.
4. **Sacs** : type, taille et contenance écrits d'un seul côté → **indéterminé**. Les types de B5 (sac à chaussures, porte-clés, gym, voyage) restent « différent ».
5. **Textile, longueur écrite d'un seul côté** (« Short 7in » / « Short ») → **indéterminé** ; modifie R4.5-a pour ce cas seulement. Deux longueurs différentes restent « proche » (T-Q2).

**Inchangés** : levée C-Q3, `knownAloneIsDifferent`, conflits, deux valeurs écrites et différentes (rôle de l'attribut, tolérances), génération vérifiée différente, règle textile des générations.

**À reporter en code (Sonnet)** : §4 de `R4_5_etape6_indetermine.md` (type `MatchLevel`, liste des marqueurs, `compare()`, rapport et `indetermines.csv`, engine `r4.5-etape6`, paires pièges), puis passage à blanc en prod : modèles, liens, multi-marchands et file de revue textile identiques à `ed52d6ec…`, répartition proche / indéterminé comparée à la mesure ; écriture en prod après accord de Mathieu.

**Statut** : Actée (2026-09-30).

### D-2026-09-30-09 — Étape 7 : sort des paires indéterminées (A partout), nouvelles sources

**Contexte** : étape 7 de l'ordre du chantier, engagement de D-2026-09-29-06 point 2 (investigation) et point 3 (sort A, B ou C par catégorie). Cadrage en session Opus, `R4_5_etape7_indetermines.md`. Lecture seule sur les 5 035 offres de la prod : 2 387 paires indéterminées sans plafond ; 4 seulement partagent un GTIN. Sort B testé : appliqué tel quel, 37 regroupements contradictoires par transitivité ; restreint aux paires sans ambiguïté, 93 regroupements relus, 13 faux (Speed Pro 2022 + 2026, Gel-Resolution X terre battue + toutes surfaces, Play Polo + Polo 150 ans…) et environ 26 incertains. Défauts trouvés au passage (génération V4 / V5 face à une année, « 3.5 », « Carpet », « Strap », faute « Caly »).

**Décision (Mathieu, 2026-09-30, AskUserQuestion)** :
1. **Sort A dans toutes les catégories** : les paires indéterminées restent à part. Ni « identique présumé » (B), ni validation une à une (C).
2. **Cordages, conditionnement déduit du prix d'origine** quand le titre ne l'écrit pas : ≤ 40 € garniture, ≥ 90 € bobine, entre les deux inconnu.
3. **Site Head, surface et genre lus dans l'URL de la fiche** quand le titre ne les donne pas.
4. **Jauge des cordages** : vérifiée sur 5 fiches Tennispro.fr sur 5 (sélecteur de la fiche, comme une pointure). **Tennispro.fr : jauge ignorée** quand le titre ne l'écrit pas (choix de Mathieu ; recommandation : lire la liste des jauges à la collecte). **Site Head : même règle, sans vérification** (fiches refusées, « 429 » ; choix de Mathieu ; recommandation : laisser indéterminé).

**Corrections de règles déjà décidées** (sans question) : libellés de génération comparés entre eux quand les deux côtés en ont un ; « 3.5 » Head Sprint ; « carpet » = « tapis » ; « strap » = version.

**À reporter en code (Sonnet)** : §8 de `R4_5_etape7_indetermines.md`, avec le report de R4.5-c (D-2026-09-30-02), passage à blanc, relecture de tous les modèles multi-marchands nouveaux, écriture en prod après accord de Mathieu.

**Statut** : Actée (2026-09-30).

### D-2026-09-30-10 — R4.6-a : échantillon de 30 modèles de prod (R4-Q6), découpage de R4.6

**Contexte** : R4.6 (`R4_cadrage.md` §4). Tirage de 30 modèles au hasard parmi les 252 modèles multi-marchands du passage `8f17143b…` (graine fixe 20260930), relus par Claude Code (fiches lues pour les cas douteux), proposition soumise à Mathieu. Détail : `R4_6_cadrage.md`, `R4_6_echantillon.csv`.

**Décision (Mathieu, 2026-09-30)** :
1. **Verdicts** : 28 modèles identiques, 2 faux (n° 6 : deux jupes adidas Club de fiches techniques différentes chez Tennis Point FR ; n° 12 : short adidas Club 2025 relié par une référence aux shorts Club SW Aeroready de 2021). Les 5 cas douteux sont identiques (n° 8 : « Evo Drive Lite White » = coloris ; n° 11 : Propulse Junior 3 Boy / Girl, saisons 2025 / 2026 ; n° 20, 25, 27).
2. **Précision mesurée** : 28 / 30 (93,3 %) ; hors textile 23 / 23 ; textile 5 / 7. Avec le jeu R1 (24 / 24), aucune erreur hors textile.
3. **Découpage de R4.6** : R4.6-a (échantillon, fait) ; R4.6-b (suite à donner : sort du textile à la bascule, séparation des modèles incohérents) ; R4.6-c (règles de repérage des non-reconnus, GAP-2026-09-27-01) ; R4.6-d (dossier de bascule : mesure finale, option IA, seuil haut textile, GAP-2026-09-29-01, décision de bascule). Une étape par conversation, Opus.

**À noter pour R5** : raquettes cordée et non cordée réunies comme variantes (§4 bis) ; le prix ne se compare qu'à option égale.

**Statut** : Actée (2026-09-30).

### D-2026-09-30-11 — R4.6-b : textile réuni par identifiant seulement, coupure des modèles incohérents

**Contexte** : R4.6-b (`R4_6_cadrage.md` §6). Moteur `r4.5-etape7` rejoué en lecture seule sur la prod : 56 des 71 modèles textiles multi-marchands (50 des 57 en `active`) ne tiennent que par la signature, dont 50 avec Tennis Point FR (aucune référence textile). Le motif « même nom, plusieurs articles » est fréquent (gamme Babolat Play : 3MTG à 42 € ≠ 3MP2 / 3MTF à 30 €, fiches lues ; titres en double chez Tennis Point FR). Deux faux hors échantillon ou déjà connus confirmés : modèles 207 (Babolat Play Crew Neck Tee) et 878 (n° 12). Sur les 13 modèles « divergents », 11 ne sont que du bruit de libellé.

**Décision (Mathieu, 2026-09-30)** :
1. **Q4, option B** : en textile, seuls le GTIN et la référence fabricant réunissent des offres ; la signature (et les étapes qui s'y rattachent, dont l'étape 2 ter) ne fusionne plus. Coût accepté : textile multi-marchands d'environ 71 à 15, en `active` d'environ 57 à 7 (chiffres exacts au passage à blanc). Tennis Point FR ne se rapproche plus en textile tant que son GTIN n'est pas capté.
2. **Q5** : filet de sécurité toutes catégories : un modèle signalé « incohérent » est coupé en ses composantes tenues par identifiant avant publication. « Divergent » reste un signal de rapport, sans effet.

**Précision de Claude Code (décision mineure)** : les paires textiles que la signature réunissait vont dans la file de revue textile avec le motif « signature seule » (candidates à valider, cf. GAP-2026-09-27-02), plutôt que d'être perdues ; elles ne sont pas « identiques » pour le site.

**Report en code** : Sonnet, session suivante, avec passage à blanc relu puis écriture en prod après accord de Mathieu.

**Statut** : Actée (2026-09-30).

### D-2026-10-07-01 — R4.6-d : les 15 groupes textiles multi-marchands sont retenus après contrôle des références source

**Contexte** : l'arbitrage du 2026-10-01 séparait six groupes (787, 909, 1101, 1171, 1829, 2026) sur des écarts de libellé. Le contrôle en lecture seule des références fabricant (GTIN, `merchant_sku`, variantes) montre une référence de base commune pour les 15 groupes.

**Décision de Mathieu** : « Si les références indiquent que c'est le même article alors c'est bon. On retient. » Les 15 groupes sont admissibles ; détail dans `R4_6_d_bascule.md` §7.

**Réserve** : groupe 639, GTIN différents pour la même référence CV2545-100, non expliqué.

**Statut** : Actée (2026-10-07).

### D-2026-10-07-02 — R4.6 : conventions de valeur absente retenues (genre Tennispro.fr, jauge Babolat)

**Contexte** : état des lieux du regroupement hors textile (précision sur 139 modèles, rappel sur 159 paires sans plafond, 100 offres isolées), puis diagnostic des non-liens : pas de bug, une valeur inconnue empêche la fusion (D-2026-09-30-08, D-2026-09-30-09). Cadrage des conventions de valeur absente par marchand, testées sur le passage `87987663…` (distribution, vérité terrain par GTIN ou référence, simulation, liens perdus), relu par un agent `architect` et un `reviewer`. Détail et chiffres : `R4_6_conventions_valeur_absente.md` ; amont : `R4_6_etat_des_lieux_regroupement.md`, `R4_6_diagnostic_non_liens.md` (PR #148, #149, #150).

**Décision de Mathieu (« Oui je valide, arrête toi là, documente seulement »)** :
1. **C2** : genre absent = « homme » pour les chaussures de Tennispro.fr, hors enfants (51 offres ; Tennispro.fr n'écrit jamais « homme » ; vérité terrain 8 sur 8).
2. **C3b** : jauge non écrite = variante de la fiche pour les cordages de **Babolat seul** (22 offres ; vérité terrain 7 sur 7), même mécanisme que D-2026-09-30-09.
3. Effet mesuré à blanc : modèles multi-marchands hors textile 181 → 190, 0 incohérent, 0 coupé, 0 lien perdu, 13 conflits et 13 divergences inchangés.

**Recommandations du cadrage, non tranchées une à une par Mathieu (restent des propositions)** : C1 (surface absente chez Sport 2000 et SportSystem) à reporter (non prouvée, 5 modèles séparés, 28 paires perdues) ; C3 pour Amazon à écarter (jauges en nombre seul, aucune vérité terrain) ; C4 (genre ignoré chez les enfants) à abandonner (aucun effet) ; C5 (année lue dans l'URL Head) à reporter jusqu'à l'extraction de l'édition (fusionne des éditions « Alternate »).

**À faire avant ou pendant le code** (réserves de la critique) : paires pièges pour les titres Tennispro.fr à marqueur « W » ou « M » d'une seule lettre et pour la détection d'âge ; vérifier sur les fiches Babolat qu'aucune offre sans jauge lue ne réunit deux jauges fixes (l'étape 2 quater ne la garde pas) ; la convention s'applique après toute l'extraction et n'écrase jamais une valeur écrite, couverte par un test ; source dédiée « convention » dans `ATTRIBUTE_SOURCES` ; trancher le canonique d'un modèle qui publierait une valeur supposée.

**Report en code** : non fait, à confier à Sonnet dans une session suivante (`lib/matching`, tests), puis passage à blanc en prod (lecture seule), relecture de tous les modèles nouveaux ou modifiés, écriture en prod **seulement après accord explicite de Mathieu**. Aucune bascule du site n'est décidée.

**Statut** : Actée (2026-10-07) pour C2 et C3b ; le reste est proposé.
