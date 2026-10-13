# R5 — dossier de décision de bascule de l'affichage

**Date : 2026-10-13.** Statut : **go R5 par feature flag décidé par Mathieu le 2026-10-13** ; périmètre minimal et découpage ci-dessous retenus. Base : passage prod `f07bcbab-8f53-4820-ad4d-1aec9eed6759` (engine `r4.6-d`).

## 1. Constat
- Le site ne lit aucune table `match_*` (seul `lib/matching/report.ts` y touche) : R5 est du développement, pas un simple interrupteur.
- Passage `f07bcbab…` : 3 995 modèles, 4 732 liens, 190 modèles multi-marchands hors textile, 15 groupes textiles retenus (D-2026-10-07-01), 0 incohérent, 13 conflits, 313 offres non reconnues hors modèle.
- Vérification C2 (2026-10-13, lecture seule) : 51 offres adidas Tennispro.fr au genre absent rattachées à homme ; aucun « femme / women / W » dans titre, URL ou attributs bruts. C2 confirmée sur adidas.

## 2. Ce que R5 affiche (périmètre minimal proposé)
1. Fiche article : offres du même modèle, tous marchands, prix comparés.
2. Section « autres générations de la famille » (GAP-2026-09-30-02), sans « meilleur prix » entre générations.
3. Hors modèle : les 313 non reconnues et les 13 conflits restent affichés comme aujourd'hui (offres seules).

## 3. Mode de bascule (recommandation)
- **Feature flag** (même mécanisme que prévu pour la phase 4) : l'ancien affichage reste la valeur par défaut, retour arrière immédiat sans toucher à la base.
- Le site lit **un passage identifié** (variable de configuration), jamais « le dernier » : pas de changement involontaire après un nouveau passage.
- `bascule-r4.6-d.ts --apply` reste bloqué ; il n'est pas le mécanisme d'affichage.

## 4. Découpage proposé (une session chacune)
1. Couche de lecture `match_*` (requêtes + tests), sans UI.
2. Fiche article derrière flag : offres du même modèle.
3. Section autres générations.
4. Recette sur preview Vercel, puis activation du flag en prod (décision de Mathieu).

## 5. Décisions attendues de Mathieu
- Go / no-go R5 et choix flag vs bascule directe.
- Périmètre minimal ci-dessus acceptable ?
- Passage `87987663…` : conservé jusqu'à R5 validée en prod (voir RISQUES_OUVERTS), suppression seulement sur accord explicite.
