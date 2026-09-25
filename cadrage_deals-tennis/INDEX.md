# Cadrage — Tennis Deals Catalog (deals-tennis)

Point d'entrée et protocole de reprise du projet. À lire dans cet ordre en début de session :

1. [ETAT_ACTUEL.md](./ETAT_ACTUEL.md) — où en est le projet.
2. [GAPS_OUVERTS.md](./GAPS_OUVERTS.md) — points ouverts non résolus.
3. Dernière entrée de [JOURNAL_SESSIONS.md](./JOURNAL_SESSIONS.md) — ce qui s'est passé la dernière fois.
4. **Tant que le chantier « vrais bons plans » / rapprochement multi-niveaux est en cours** (voir GAP-2026-09-25-19) : le §10 « Phasage et impact sur le cadrage principal » de [CADRAGE_rapprochement-multi-niveaux.md](./CADRAGE_rapprochement-multi-niveaux.md) et la section 6 « Amendements post Phase 0 » de [CADRAGE_vrais-bons-plans.md](./CADRAGE_vrais-bons-plans.md) — c'est ce phasage (ordre global révisé, étapes R0-R5) qui détermine la prochaine étape légitime, pas une proposition de pistes ouvertes. Ne jamais proposer une étape hors de cet ordre (ex. R3 avant R0-R2) comme piste valide.

## Documents

- [DECISIONS_FONCTIONNELLES.md](./DECISIONS_FONCTIONNELLES.md) — décisions structurantes numérotées (D-AAAA-MM-JJ-NN).
- [CADRAGE_vrais-bons-plans.md](./CADRAGE_vrais-bons-plans.md) / [CADRAGE_rapprochement-multi-niveaux.md](./CADRAGE_rapprochement-multi-niveaux.md) — cadrages du chantier en cours (historique de prix, verdict, rapprochement produit multi-niveaux R0-R5).
- [R0_diagnostic-rapprochement.md](./R0_diagnostic-rapprochement.md) — résultats de l'étape R0 (diagnostic, aucune modification).
- [spec.md](./spec.md) — spécification fonctionnelle (feature "Tennis Deals Catalog").
- [plan.md](./plan.md) — plan d'implémentation technique.
- [data-model.md](./data-model.md) — modèle de données.
- [research.md](./research.md) — notes de recherche technique.
- [quickstart.md](./quickstart.md) — guide de démarrage rapide visé.
- [tasks.md](./tasks.md) — découpage en tâches (⚠️ voir GAPS_OUVERTS.md — les cases cochées ne reflètent pas de code réel existant).
- [checklists/](./checklists/) — checklists de qualité des exigences.
- [contracts/](./contracts/) — contrats d'API (catalogue, ingestion, redirection).
- [archive/](./archive/) — versions détaillées intégrales des anciens fichiers de suivi (état/journal), déplacées ici quand la synthèse courante dépasse son seuil. **Ne consulter que si la synthèse en cours ne suffit pas pour un point précis** — ce n'est jamais la source de vérité de l'état courant.

## Règles de travail (rappel)

- Une étape de build par conversation, jamais plusieurs enchaînées.
- Toute décision structurante est soumise explicitement avant d'être actée.
- Chaque étape livrée est vérifiée avec des données réelles, pas seulement des tests unitaires.
- Flux branche → PR → CI → merge squash. Depuis D-2026-09-23-03 : push de la branche + création de la PR **automatiques** en fin d'étape de build, sans redemander confirmation à chaque fois (le merge, lui, reste manuel — décision de l'utilisateur après revue CI). Toute action git destructrice (reset --hard, push --force, suppression de branche) reste soumise à confirmation explicite au cas par cas.

## Seuils d'archivage des fichiers de suivi (D-2026-09-22-09)

- `ETAT_ACTUEL.md` : seuil 150 lignes. Au-delà, condenser chaque phase/chantier **terminé** en une ligne et déplacer son détail intégral dans `archive/` ; seul le chantier **en cours** garde son détail complet ici.
- `JOURNAL_SESSIONS.md` : seuil 150 lignes. Au-delà, garder les sessions récentes en clair et déplacer les plus anciennes, telles quelles, dans `archive/`.
- `GAPS_OUVERTS.md` : pas de seuil de taille — un gap tranché est retiré immédiatement du fichier (la décision `D-xxx` qui le clôt fait foi, pas d'archive séparée).
- `DECISIONS_FONCTIONNELLES.md` : **jamais archivé** (registre consulté par référence d'ID, pas relu intégralement à chaque reprise).
