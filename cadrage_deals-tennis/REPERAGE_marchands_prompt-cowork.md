# Repérage de nouveaux marchands — prompt Claude cowork

Contexte : D-2026-09-26-02. Repérage mené par Mathieu via Claude cowork,
hors de ce dépôt — repérage uniquement, aucune candidature déposée, aucun
code écrit. Construction reportée à R3 (voir `CADRAGE_rapprochement-multi-niveaux.md`
§10 et D-2026-09-25-24).

Prompt remis à Mathieu le 2026-09-26, reproduit ici tel quel pour traçabilité.

---

## Mission : repérage de nouveaux marchands tennis pour un site de bons plans

### Contexte

Je construis un site français qui recense les **vraies promotions** sur le
matériel de tennis (pas un comparateur de prix). Les offres sont collectées
automatiquement chez des marchands, puis rapprochées entre marchands pour
identifier le même modèle vendu à plusieurs endroits. Le site gagne de
l'argent par affiliation.

5 catégories couvertes : raquettes, cordages, chaussures, textile,
accessoires (sacs, balles, grips, antivibrateurs).

Je cherche de **nouveaux marchands**. C'est un **repérage uniquement** : tu
n'écris pas de code, tu ne crées aucun compte, tu ne candidates à aucun
programme d'affiliation, tu ne contactes aucun marchand.

### Marchands à NE PAS proposer (déjà traités)

- Déjà intégrés : Tecnifibre, Tennispro.fr, SportSystem, Sport 2000,
  Babolat, Tennis Point FR, Head, Amazon.
- Retiré définitivement : ProTennis.
- Déjà identifié, en attente : Sport Outlet FR (Awin).
- Écartés ou différés : Decathlon, Wilson, Private Sport Shop (blocage
  technique), Yonex (CGU incompatibles avec les liens profonds),
  Padel-Point (padel).
- Hors sujet : marchands centrés sur le padel, le tennis de table, le
  squash ou le badminton sans rayon tennis réel.

### Critères d'évaluation (dans cet ordre d'importance)

Pour chaque candidat, **vérifie réellement** chaque critère sur le site. Si
tu ne peux pas vérifier un point, écris « non vérifié » et pourquoi. Ne
suppose jamais.

1. **Légalité de la collecte**
   - Programme d'affiliation : existe-t-il ? Sur quel réseau (Awin,
     Effiliation, Kwanko, CJ, Rakuten, Tradedoubler, TimeOne, programme
     direct…) ? Lien vers la page du programme. Fournit-il un flux
     produits (datafeed) ?
   - `robots.txt` : cite les lignes qui concernent les pages catégorie,
     promo et produit.
   - CGU/CGV : cite mot pour mot toute clause sur la collecte
     automatisée, l'extraction, la reproduction ou les liens entrants. Si
     rien de spécifique, écris-le.

2. **GTIN / EAN exposé** (critère le plus précieux)
   - Ouvre 2 ou 3 fiches produit (dont au moins une raquette et une paire
     de chaussures) et cherche dans le code source : JSON-LD
     `schema.org/Product` avec `gtin`, `gtin13`, `gtin12`, `ean`, ou une
     référence fabricant (`mpn`).
   - Donne l'URL de la fiche et la valeur trouvée. Précise si
     l'information est dans la page listing ou seulement dans la fiche
     produit.
   - S'il y a un flux d'affiliation, indique s'il contient une colonne
     EAN/GTIN.

3. **Recouvrement avec les marques déjà couvertes**
   - Vérifie la présence (en stock, promo ou non) de ces modèles de
     référence : Babolat Pure Aero, Babolat Pure Drive, Head Speed, Head
     Radical, Wilson Blade, Wilson Clash, Asics Gel-Resolution, Asics
     Gel-Dedicate.
   - Indique combien sont présents sur 8, et quelles grandes marques sont
     vendues (Babolat, Head, Wilson, Yonex, Tecnifibre, Asics, Nike,
     Adidas, Lacoste…).

4. **Méthode technique** (observation seulement, ne contourne jamais une
   protection)
   - Plateforme si identifiable (Shopify : teste `/products.json`,
     Magento, PrestaShop, Salesforce Commerce Cloud, WooCommerce, autre).
   - Le contenu produit est-il présent dans le HTML initial (rendu
     serveur) ou chargé en JavaScript ?
   - Protection anti-bot visible (page de challenge Cloudflare, captcha,
     blocage) : oui, non, ou non observable.

5. **Volume réel**
   - Existe-t-il une page promo/outlet/soldes tennis ? URL.
   - Nombre approximatif d'articles tennis en promotion réelle (prix
     barré affiché), par catégorie si possible. Seuil utile : 30 articles
     au moins.

### Méthode

- Examine entre 10 et 20 candidats : revendeurs tennis spécialisés
  français, grandes enseignes sport avec un vrai rayon tennis, sites de
  marques (raquettes, chaussures, textile), marketplaces, revendeurs
  européens qui livrent en France avec un site en français.
- Cite une source (URL) pour chaque affirmation.
- Ne recopie pas de contenu du site au-delà de ce qui est nécessaire pour
  prouver un critère.

### Format de sortie

1. **Tableau récapitulatif** en CSV (bloc de code), une ligne par
   candidat, colonnes :
   `marchand,url,affiliation_reseau,flux_produits,robots_ok,cgu_clause,gtin_expose,gtin_source,recouvrement_sur_8,plateforme,rendu,anti_bot,page_promo,volume_promo_tennis,verdict,commentaire`
   - `verdict` : `prioritaire` / `possible` / `écarté`.
2. **Une fiche par candidat retenu** (`prioritaire` ou `possible`) :
   preuves pour chaque critère (URL, extrait de code source, citation
   CGU).
3. **Liste des écartés** avec la raison en une ligne.
4. **Classement final** des 5 meilleurs candidats, avec la justification
   du classement au regard des 5 critères.

---

## Suite

Résultat à rapporter dans une nouvelle conversation dédiée sur ce dépôt.
Les candidats retenus y seront vérifiés avant toute décision, conformément
au protocole de travail (§0 de `CADRAGE_vrais-bons-plans.md`).
