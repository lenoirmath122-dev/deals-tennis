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
