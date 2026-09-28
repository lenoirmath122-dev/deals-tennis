/**
 * Lexique des sous-catégories d'accessoires, v2 (R2, passe 2 — PROPOSITION).
 *
 * Source : D-2026-09-25-15 (champ `deals.subcategory`, 5 valeurs + NULL) et
 * GAP-2026-09-25-11 (rattaché à R2). Questions Q19-Q20 :
 * `cadrage_deals-tennis/R2_referentiel.md` §7.
 *
 * Statut : proposé par Claude Code le 2026-09-28, à valider par Mathieu.
 * Aucun code ne lit encore ce fichier : il sera utilisé par `lib/ingest.ts`
 * et le script de backfill en R3.
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

export type AccessorySubcategory = "sacs" | "balles" | "antivibrateurs" | "grips_surgrips" | "accessoires_cordage";

export interface SubcategoryRule {
  /** Sous-catégorie attribuée, ou `null` (« Autres accessoires »). */
  subcategory: AccessorySubcategory | null;
  /** Expression appliquée au titre en minuscules. */
  pattern: RegExp;
  /** Pourquoi la règle existe (relecture). */
  note: string;
}

/**
 * Règles appliquées **dans l'ordre** ; la première qui correspond l'emporte.
 * Si aucune ne correspond : la famille reconnue (si elle porte une
 * `subcategory`) décide, sinon `null`.
 */
export const SUBCATEGORY_RULES: SubcategoryRule[] = [
  // 1. Préfixe écrit par nos scripts : le signal le plus fiable.
  { subcategory: "sacs", pattern: /^sac (de tennis|isotherme|de sport)|^sac a dos|^sac à dos/, note: "préfixe « Sac de tennis », « Sac isotherme de tennis », « Sac de sport »" },
  { subcategory: "balles", pattern: /^balles? de tennis/, note: "préfixe « Balle(s) de tennis » (Tennispro, Tennis Point FR)" },
  { subcategory: "grips_surgrips", pattern: /^(sur)?grip de tennis/, note: "préfixe « Grip / Surgrip de tennis »" },
  { subcategory: "antivibrateurs", pattern: /^antivibrateur de tennis/, note: "préfixe « Antivibrateur de tennis »" },
  { subcategory: null, pattern: /^(gourde|jonc|protection|tapis) de tennis/, note: "préfixes d'autres accessoires" },

  // 2. Exclusions : mots qui déclenchaient à tort une sous-catégorie en v1.
  {
    subcategory: null,
    pattern:
      /(gourde|bottle|porte-cl|\bclip\b|\bcart\b|chariot|panier|ball tube|entra[iî]neur|\bmug\b|m[ée]daille|casquette|visi[èe]re|poignet|wristband|headband|bandeau|bandana|chaussettes|socks|\bpairs\b|genouill|chevill|coudi[èe]re|bandage|sleeve|\btape\b|semelles)/,
    note: "gourdes, chariots et tubes à balles, clips, textile porté, protections",
  },

  // 3. Mots-clés (lexique v1, conservé).
  { subcategory: "accessoires_cordage", pattern: /(tensiom[eè]tre|pince [aà] corder|machine [aà] corder)/, note: "aucune offre aujourd'hui (D-2026-09-25-15)" },
  { subcategory: "antivibrateurs", pattern: /(antivibrateur|anti-vibrateur|\bdamp\b|vibra-clip)/, note: "« Damp » : Babolat Aero / Drive / Strike Damp" },
  { subcategory: "grips_surgrips", pattern: /(surgrips?|overgrips?|\bgrips?\b)/, note: "grips et surgrips" },
  { subcategory: "sacs", pattern: /(\bsacs?\b|backpack|\bbag\b|duffle|duffel|thermobag|housse|rackpack|tote)/, note: "sacs, housses, sacs à dos" },
  { subcategory: "balles", pattern: /(\bballes?\b|\bballs?\b)/, note: "balles" },
];

/**
 * Proposition de découpage de « Autres accessoires » (184 offres, dont 137
 * actives), à trancher par Mathieu (Q20). Aucune de ces valeurs n'est encore
 * autorisée par D-2026-09-25-15.
 */
export const OTHER_ACCESSORIES_GROUPS = [
  { groupe: "protection_soins", offres: 64, actives: 62, exemples: "genouillères, chevillères, coudières Bauerfeind, bande kinésio, semelles Sidas" },
  { groupe: "textile_porte", offres: 58, actives: 34, exemples: "casquettes, visières, poignets, bandeaux, chaussettes (à déplacer en textile ?)" },
  { groupe: "hors_sujet", offres: 18, actives: 15, exemples: "médailles, mug, cahier, décoration de gâteau, t-shirt cadeau, tapis de yoga" },
  { groupe: "materiel_terrain", offres: 15, actives: 6, exemples: "mini-raquettes, kit et filet de mini-tennis, chariot à balles, kit de tension de poteaux" },
  { groupe: "accessoires_raquette", offres: 13, actives: 6, exemples: "joncs, tapes de protection, œillets, housse Cover Expert, bande de plomb" },
  { groupe: "gourdes_serviettes", offres: 12, actives: 10, exemples: "gourdes Nike, serviette Babolat" },
] as const;
