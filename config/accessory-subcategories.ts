/**
 * Lexique des sous-catégories d'accessoires, v2 (R2, passe 2).
 *
 * Source : D-2026-09-25-15 (champ `deals.subcategory`, 5 valeurs + NULL) et
 * GAP-2026-09-25-11 (rattaché à R2). Questions Q19-Q20 :
 * `cadrage_deals-tennis/R2_referentiel.md` §7. Réponses de Mathieu :
 * D-2026-09-28-03 (adoption du lexique v2, `protection_soins` en 6e valeur,
 * textile porté déplacé vers la catégorie textile, hors sujet exclu à
 * l'ingestion).
 *
 * Statut : validé par Mathieu (D-2026-09-28-03, 2026-09-28). Aucun code ne
 * lit encore ce fichier : il sera utilisé par `lib/ingest.ts` et le script de
 * backfill en R3.
 *
 * Changement par rapport au lexique v1 (D-2026-09-25-15) : le **préfixe** que
 * nos scripts écrivent en tête du titre (« Sac de tennis », « Balles de
 * tennis »…) est lu en premier, puis des **exclusions**, puis les mots-clés.
 * Mesure sur les 429 offres accessoires de prod (2026-09-28) :
 *
 * | Sous-catégorie   | v1 (mots-clés seuls) | v2  |
 * |------------------|----------------------|-----|
 * | sacs             | 169                  | 166 |
 * | grips_surgrips   | 43                   | 41 (+4 par famille, voir `model-families-accessoires.ts`) |
 * | balles           | 32                   | 26  |
 * | antivibrateurs   | 11                   | 12  |
 * | (NULL)           | 174                  | 184 |
 *
 * Erreurs de v1 corrigées : « Balle de tennis Tennis-Point Stage 2 Sac de 12 »
 * (classé sac), « Nike Refuel Grip … Gourde » (classé grip), « Babolat Ball
 * Tube », « Head Balle Clip », « Wheeled Ball Cart », porte-clés et kit
 * d'entraînement Amazon (classés balles).
 */

export type AccessorySubcategory = "sacs" | "balles" | "antivibrateurs" | "grips_surgrips" | "accessoires_cordage" | "protection_soins";

/**
 * Action R3 associée à une règle, au-delà de la seule `subcategory` :
 * - `garder` (défaut) : reste `category = "accessoires"`.
 * - `deplacer_textile` (Q20) : reclassé `category = "textile"` à l'ingestion
 *   (textile porté : casquettes, visières, poignets, bandeaux, chaussettes).
 * - `exclure` (Q20) : exclu du catalogue à l'ingestion (hors sujet : médailles,
 *   mug, cahier, décoration, t-shirt cadeau, tapis de yoga).
 */
export type SubcategoryAction = "garder" | "deplacer_textile" | "exclure";

export interface SubcategoryRule {
  /** Sous-catégorie attribuée, ou `null` (« Autres accessoires »). */
  subcategory: AccessorySubcategory | null;
  /** Expression appliquée au titre en minuscules. */
  pattern: RegExp;
  /** Pourquoi la règle existe (relecture). */
  note: string;
  /** Action R3 si différente de `garder` (Q20, D-2026-09-28-03). */
  action?: SubcategoryAction;
}

/**
 * Règles appliquées **dans l'ordre** ; la première qui correspond l'emporte.
 * Si aucune ne correspond : la famille reconnue (si elle porte une
 * `subcategory`) décide, sinon `null` (« Autres accessoires »).
 */
export const SUBCATEGORY_RULES: SubcategoryRule[] = [
  // 1. Préfixe écrit par nos scripts : le signal le plus fiable.
  { subcategory: "sacs", pattern: /^sac (de tennis|isotherme|de sport)|^sac a dos|^sac à dos/, note: "préfixe « Sac de tennis », « Sac isotherme de tennis », « Sac de sport »" },
  { subcategory: "balles", pattern: /^balles? de tennis/, note: "préfixe « Balle(s) de tennis » (Tennispro, Tennis Point FR)" },
  { subcategory: "grips_surgrips", pattern: /^(sur)?grip de tennis/, note: "préfixe « Grip / Surgrip de tennis »" },
  { subcategory: "antivibrateurs", pattern: /^antivibrateur de tennis/, note: "préfixe « Antivibrateur de tennis »" },
  {
    subcategory: "protection_soins",
    pattern: /^protection de tennis/,
    note: "préfixe « Protection de tennis » (Q20, D-2026-09-28-03)",
  },
  { subcategory: null, pattern: /^(gourde|jonc|tapis) de tennis/, note: "préfixes d'autres accessoires — « tapis » non vérifié précisément (tapis de sol/yoga ?), laissé en « Autres accessoires » par prudence plutôt que reclassé hors sujet sans certitude" },

  // 2. Textile porté (Q20) : déplacé vers la catégorie textile, jamais une
  // sous-catégorie accessoires.
  {
    subcategory: null,
    action: "deplacer_textile",
    pattern: /(casquette|visi[èe]re|poignet|wristband|headband|bandeau|bandana|chaussettes|socks|\bpairs\b)/,
    note: "textile porté (Q20) : casquettes, visières, poignets, bandeaux, chaussettes → catégorie textile",
  },

  // 3. Hors sujet (Q20) : exclu du catalogue à l'ingestion, jamais publié.
  {
    subcategory: null,
    action: "exclure",
    pattern: /(m[ée]daille|\bmug\b|cahier|d[ée]coration|tapis de yoga)/,
    note: "hors sujet (Q20) : médailles, mug, cahier, décoration, tapis de yoga → exclu à l'ingestion",
  },

  // 4. Protection et soins (Q20, nouvelle sous-catégorie) : genouillères,
  // chevillères, coudières, bande kinésio, semelles.
  {
    subcategory: "protection_soins",
    pattern: /(genouill|chevill|coudi[èe]re|bandage|sleeve|\btape\b|semelles)/,
    note: "protection et soins (Q20) : genouillères, chevillères, coudières, bande kinésio, semelles",
  },

  // 5. Exclusions restantes (lexique v1) : mots qui déclenchaient à tort une
  // sous-catégorie mais restent « Autres accessoires » (matériel de terrain,
  // accessoires de raquette, gourdes et serviettes — Q20, pas de nouvelle
  // sous-catégorie proposée pour ce reste).
  {
    subcategory: null,
    pattern: /(gourde|bottle|porte-cl|\bclip\b|\bcart\b|chariot|panier|ball tube|entra[iî]neur)/,
    note: "gourdes, chariots et tubes à balles, clips (matériel de terrain, gourdes/serviettes)",
  },

  // 6. Mots-clés (lexique v1, conservé).
  { subcategory: "accessoires_cordage", pattern: /(tensiom[eè]tre|pince [aà] corder|machine [aà] corder)/, note: "aucune offre aujourd'hui (D-2026-09-25-15)" },
  { subcategory: "antivibrateurs", pattern: /(antivibrateur|anti-vibrateur|\bdamp\b|vibra-clip)/, note: "« Damp » : Babolat Aero / Drive / Strike Damp" },
  { subcategory: "grips_surgrips", pattern: /(surgrips?|overgrips?|\bgrips?\b)/, note: "grips et surgrips" },
  { subcategory: "sacs", pattern: /(\bsacs?\b|backpack|\bbag\b|duffle|duffel|thermobag|housse|rackpack|tote)/, note: "sacs, housses, sacs à dos" },
  { subcategory: "balles", pattern: /(\bballes?\b|\bballs?\b)/, note: "balles" },
];

/**
 * Groupes historiques de « Autres accessoires » (184 offres, mesure du
 * 2026-09-28 avant application du lexique v2), pour référence — décisions
 * prises Q20/D-2026-09-28-03 : `protection_soins` et `textile_porte` ont
 * leur propre traitement ci-dessus (`SUBCATEGORY_RULES`), `hors_sujet` est
 * exclu à l'ingestion, le reste (`materiel_terrain`, `accessoires_raquette`,
 * `gourdes_serviettes`) reste en « Autres accessoires ».
 */
export const OTHER_ACCESSORIES_GROUPS = [
  { groupe: "protection_soins", offres: 64, actives: 62, exemples: "genouillères, chevillères, coudières Bauerfeind, bande kinésio, semelles Sidas" },
  { groupe: "textile_porte", offres: 58, actives: 34, exemples: "casquettes, visières, poignets, bandeaux, chaussettes → déplacé en textile" },
  { groupe: "hors_sujet", offres: 18, actives: 15, exemples: "médailles, mug, cahier, décoration de gâteau, t-shirt cadeau, tapis de yoga → exclu" },
  { groupe: "materiel_terrain", offres: 15, actives: 6, exemples: "mini-raquettes, kit et filet de mini-tennis, chariot à balles, kit de tension de poteaux" },
  { groupe: "accessoires_raquette", offres: 13, actives: 6, exemples: "joncs, tapes de protection, œillets, housse Cover Expert, bande de plomb" },
  { groupe: "gourdes_serviettes", offres: 12, actives: 10, exemples: "gourdes Nike, serviette Babolat" },
] as const;
