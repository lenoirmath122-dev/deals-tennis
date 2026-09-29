# R4.3 — Compléments au référentiel et points à valider (chaussures, accessoires)

> **À valider par Mathieu.** Aucune écriture en base ; le référentiel `config/` est inchangé. Mesure limitée au jeu R1 figé (42 offres chaussures et accessoires, toutes reconnues) : la liste complète des non-reconnus sur la prod sortira du rapport de passage de R4.4 (pas de `DATABASE_URL` dans cette session).

## 1. Marqueurs lus par le code, absents du référentiel

| Ajout | Vu sur | Effet |
|---|---|---|
| Surface « **CL** » = terre battue | Sport 2000 : « Barricade 13 **M CL** Homme » | surface `terre_battue` |
| Genre « mixte / unisexe / unisex » | prévu par prudence | genre `mixte` |
| Marqueurs d'une lettre (`m`, `w`, `k`, `c`) du référentiel **ignorés** | trop ambigus (« M » = Medium, « W » = Wide…) | seul « K » collé au nom (« Barricade K ») est lu comme junior |

À intégrer à `SHOE_SURFACE_MARKERS` / `SHOE_GENDER_MARKERS` si tu valides.

## 2. Nouvel attribut proposé : `type_sac`

`CATEGORY_RULES.accessoires` ne connaît que `type` (« sac »). Le cadrage (Q5) parle de « type (thermobag / sac à dos / duffle / housse / tote) = différent ». Le code lit donc `type_sac` **seulement s'il est écrit** (« Thermobag », « Backpack », « Sac à dos »…), sinon absent (jamais déduit : « Babolat Court L » sans format vaut « inconnu » → « proche », pas « différent »). **Proposition R4.4** : `type_sac: "different"` dans `CATEGORY_RULES.accessoires`.

## 3. Choix de lecture à connaître

- **Balles** : `lot` = nombre de balles (tube de 3 → 3 ; carton de 24 tubes de 3 → 72 ; « 4er » → 4) ; « bipack » → conditionnement noté, quantité non déduite. Niveau « standard » attribué seulement si la famille est reconnue et qu'aucun « Stage » n'est écrit.
- **Grips, surgrips, antivibrateurs** : `lot` lu dans « x12 », « pack de 3 », « lot de 30 », « 12 surgrips » ; absent = 1 (à trancher en R4.4 : « absent » et « 1 » comparés comme égaux ?).
- **Sacs** : contenance en « N raquettes » (« RH9 », « 12R ») ou en litres.
- **Accessoires sans famille prévue** (protection et soins, autres) : non-reconnu classé `sans_famille_prevue`, à ne pas compter comme manque du référentiel.
- **Familles candidates** : pour un accessoire, seules les familles de sa sous-catégorie sont testées (sinon « Team » d'un grip pourrait tomber sur les sacs Wilson Team).
- **Génération chaussures** : numéro écrit après le nom (Q14), jamais déduit ; « Gel-Resolution X » lit « X ».

## 4. Non traité ici

Gourdes et autres « Autres accessoires » (Nike Big Mouth, paire R1 62) : hors référentiel, donc pas de rapprochement possible ; contenance de la gourde non lue.
