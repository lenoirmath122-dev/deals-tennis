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
