/**
 * Référentiel de familles de modèles — accessoires (R2, passe 2).
 *
 * Source : §7 du cadrage rapprochement, Q10 de D-2026-09-28-02. Méthode et
 * questions Q17-Q20 : `cadrage_deals-tennis/R2_referentiel.md` §7. Réponses
 * de Mathieu : D-2026-09-28-03.
 *
 * Statut : validé par Mathieu (D-2026-09-28-03, 2026-09-28), à partir des
 * titres réels en base (429 offres accessoires). Les cas `a_confirmer`
 * (ATP/ATP Tour, Resi Pro, Players Pro Feel, Pro Overgrip, Damp, sacs Pure)
 * ont été vérifiés sur les fiches marchand/fabricant (session desktop,
 * réseau ouvert, 2026-09-28) ; voir les notes de chaque famille. Aucun code
 * ne le lit encore (R4).
 *
 * Seules les sous-catégories **comparables d'un marchand à l'autre** ont des
 * familles : balles, grips / surgrips, antivibrateurs, sacs. Chaque famille
 * porte sa sous-catégorie : elle sert aussi à classer les titres sans
 * mot-clé (ex. « Tecnifibre Players Pro Feel Pack de 12 », un surgrip).
 *
 * Attributs propres (proposés, Q17-Q19) :
 * - balles : `niveau` (standard / Stage 1 / 2 / 3, mini-tennis) = différent ;
 *   conditionnement (tube, bipack, carton, sachet, baril) = lot, comparaison
 *   à la balle (Q12) ;
 * - grips : grip de remplacement ≠ surgrip (`typeGrip` différent) ; nombre de
 *   pièces (x3 / x12 / x30 / x60) = lot, comparaison à la pièce (Q12) ;
 * - antivibrateurs : lot de 2 = conditionnement habituel ;
 * - sacs : type (thermobag / sac à dos / duffle / housse / tote) et contenance
 *   (nombre de raquettes, litres) = différent (Q5) ; collection et année =
 *   règle des générations standard, identique seulement pour la même
 *   référence (D-2026-09-27-07).
 */

import type { FamilyEntry } from "./model-families";
import type { AccessorySubcategory } from "./accessory-subcategories";

export interface AccessoryFamilyEntry extends FamilyEntry {
  subcategory: AccessorySubcategory;
  /** Grips : remplacement ou surgrip (produits différents). */
  typeGrip?: "grip" | "surgrip";
}

/** Niveaux de balles (attribut `niveau`, différent). */
export const BALL_LEVEL_MARKERS: Record<string, string[]> = {
  stage_1: ["stage 1", "easy tennis"],
  stage_2: ["stage 2", "oranges"],
  stage_3: ["stage 3", "mini tennis"],
};

/** Conditionnements de balles (lot : prix à la balle). */
export const BALL_PACK_MARKERS = ["tube de 3", "tube de 4", "bipack", "carton de", "sachet de", "baril de", "sac de"];

const TITRES_SACS = "titres de sacs en base (2026-09-28)";

export const ACCESSORY_FAMILIES: AccessoryFamilyEntry[] = [
  // ───────────────────────────── BALLES ─────────────────────────────
  { brand: "Dunlop", category: "accessoires", subcategory: "balles", family: "Fort Tournament Select", aliases: ["fort tournament select"], statut: "observe" },
  { brand: "Dunlop", category: "accessoires", subcategory: "balles", family: "Fort Select", aliases: ["fort select"], excludes: ["fort tournament select"], statut: "observe" },
  {
    brand: "Dunlop",
    category: "accessoires",
    subcategory: "balles",
    family: "ATP",
    aliases: ["atp tour", "atp"],
    excludes: ["giant", "mid ball"],
    statut: "observe",
    notes: [
      "Q17 vérifié (2026-09-28, fiches produit tennispro.fr) : « ATP » (carton de 18 tubes de 4) et « ATP Tour » (tube de 3, carton de 24 tubes de 3) portent la même description technique mot pour mot (tissu HD Pro Cloth, cœur HD Pro Core) — même balle, seul le conditionnement change (attribut `conditionnement`/`lot`, différent, prix comparé à la balle).",
    ],
  },
  { brand: "Dunlop", category: "accessoires", subcategory: "balles", family: "Tour Performance", aliases: ["tour performance"], statut: "observe" },
  {
    brand: "Dunlop",
    category: "accessoires",
    subcategory: "balles",
    family: "Stage (mini-tennis)",
    aliases: ["stage 1", "stage 2", "stage 3", "easy tennis", "mini tennis"],
    versions: ["Stage 1", "Stage 2", "Stage 3"],
    statut: "observe",
    notes: ["Chaque Stage est une balle différente (pression et taille) : version, jamais rapprochée d'une balle standard."],
  },
  {
    brand: "Dunlop",
    category: "accessoires",
    subcategory: "balles",
    family: "Giant / Mid (balles géantes)",
    aliases: ["giant", "mid ball", "giant 9 ball", "mid 5 ball"],
    versions: ["Giant", "Mid"],
    statut: "observe",
    notes: [
      "Q17 (D-2026-09-28-03) : balles géantes de démonstration/décoration, gardées dans la sous-catégorie balles mais en version à part — jamais rapprochées d'une balle de jeu standard. Précaution ajoutée après l'alias « atp » (« Giant 9 Ball Atp », « Mid 5 Ball Atp ») : famille dédiée avec `excludes` sur la famille ATP.",
    ],
  },
  { brand: "Slazenger", category: "accessoires", subcategory: "balles", family: "Championship", aliases: ["championship"], statut: "observe", notes: ["Deux offres Slazenger sans nom de modèle : balle non identifiable, pas de rapprochement."] },
  { brand: "Wilson", category: "accessoires", subcategory: "balles", family: "Triniti", aliases: ["triniti"], statut: "observe", notes: ["« 3er » / « 4er » (allemand) = tube de 3 / 4."] },
  { brand: "Wilson", category: "accessoires", subcategory: "balles", family: "Team W Practice", aliases: ["team w practice"], statut: "observe" },
  {
    brand: "Tennis-Point",
    category: "accessoires",
    subcategory: "balles",
    family: "Stage (marque Tennis-Point)",
    aliases: ["stage 1", "stage 2"],
    versions: ["Stage 1", "Stage 2"],
    statut: "observe",
    notes: ["Marque propre du marchand Tennis Point FR."],
  },

  // ───────────────────────────── GRIPS ET SURGRIPS ─────────────────────────────
  { brand: "Babolat", category: "accessoires", subcategory: "grips_surgrips", typeGrip: "grip", family: "Syntec", aliases: ["syntec"], versions: ["Pro", "Team", "Evo", "Uptake"], statut: "observe", notes: ["« Syntec Pro (used by Rafa) » : même grip que Syntec Pro."] },
  { brand: "Babolat", category: "accessoires", subcategory: "grips_surgrips", typeGrip: "grip", family: "Natural Grip", aliases: ["natural grip"], statut: "observe" },
  { brand: "Babolat", category: "accessoires", subcategory: "grips_surgrips", typeGrip: "grip", family: "Xcel Gel", aliases: ["xcel gel"], statut: "observe" },
  { brand: "Babolat", category: "accessoires", subcategory: "grips_surgrips", typeGrip: "surgrip", family: "My Overgrip", aliases: ["my overgrip"], statut: "observe" },
  { brand: "Babolat", category: "accessoires", subcategory: "grips_surgrips", typeGrip: "surgrip", family: "Pro Response", aliases: ["pro response"], statut: "observe" },
  { brand: "Babolat", category: "accessoires", subcategory: "grips_surgrips", typeGrip: "surgrip", family: "Pro Tour", aliases: ["pro tour"], generations: [{ label: "2.0", markers: ["2 0", "2.0"], source: "titres « Pro Tour 2.0 x3 / x12 »" }], statut: "observe" },
  { brand: "Babolat", category: "accessoires", subcategory: "grips_surgrips", typeGrip: "surgrip", family: "VS Original", aliases: ["vs original"], statut: "observe" },
  { brand: "Dunlop", category: "accessoires", subcategory: "grips_surgrips", typeGrip: "surgrip", family: "Gecko-Tac", aliases: ["gecko tac"], statut: "observe" },
  { brand: "Head", category: "accessoires", subcategory: "grips_surgrips", typeGrip: "grip", family: "Hydrosorb", aliases: ["hydrosorb"], versions: ["Pro"], statut: "observe" },
  { brand: "Head", category: "accessoires", subcategory: "grips_surgrips", typeGrip: "grip", family: "Dual Absorbing", aliases: ["dual absorbing"], statut: "observe" },
  { brand: "Prince", category: "accessoires", subcategory: "grips_surgrips", typeGrip: "grip", family: "DuraPro+", aliases: ["durapro+", "durapro"], statut: "observe" },
  { brand: "Prince", category: "accessoires", subcategory: "grips_surgrips", typeGrip: "grip", family: "Resitex", aliases: ["resitex"], versions: ["Soft", "Tour"], statut: "observe" },
  {
    brand: "Prince",
    category: "accessoires",
    subcategory: "grips_surgrips",
    typeGrip: "grip",
    family: "Resi Pro",
    aliases: ["resi pro"],
    statut: "observe",
    notes: [
      "Q16/Q18 vérifié (2026-09-28, fiche tennis-point.fr) : « Resi Pro Pack 1 unité » est un grip de remplacement (surface synthétique amortissante appliquée directement sur le manche), pas un surgrip — corrigé de `surgrip` à `grip`. Prince vend aussi un « ResiPro Overgrip » (surgrip, vendu en pack) sous le même nom de gamme : rester vigilant si ce second produit apparaît en base, il devra être une famille distincte (`typeGrip: surgrip`).",
    ],
  },
  {
    brand: "Tecnifibre",
    category: "accessoires",
    subcategory: "grips_surgrips",
    typeGrip: "surgrip",
    family: "Players Pro",
    aliases: ["players pro", "player pro"],
    versions: ["Feel"],
    statut: "observe",
    notes: [
      "Q16/Q18 vérifié (2026-09-28, tecnifibre.com) : « Players Pro » (profil fin 0,50 mm, précision) et « Players Pro Feel » (absorption rapide, toucher naturel) sont deux surgrips réellement différents, pas un simple coloris — « Feel » confirmé en version à part.",
    ],
  },
  { brand: "Tecnifibre", category: "accessoires", subcategory: "grips_surgrips", typeGrip: "grip", family: "Wax Max", aliases: ["wax max"], editions: ["Black", "White"], statut: "observe" },
  { brand: "Tecnifibre", category: "accessoires", subcategory: "grips_surgrips", typeGrip: "grip", family: "Lacoste Grip", aliases: ["lacoste grip"], statut: "observe" },
  { brand: "Tennispro", category: "accessoires", subcategory: "grips_surgrips", typeGrip: "grip", family: "Leather Grip", aliases: ["leather grip", "cuir"], statut: "observe", notes: ["Marque propre du marchand Tennispro.fr."] },
  { brand: "Tennispro", category: "accessoires", subcategory: "grips_surgrips", typeGrip: "surgrip", family: "Original Pro", aliases: ["original pro"], statut: "observe" },
  { brand: "Tennispro", category: "accessoires", subcategory: "grips_surgrips", typeGrip: "surgrip", family: "Tacky Pro", aliases: ["tacky pro"], generations: [{ label: "2.0", markers: ["2 0", "2.0"], source: "titres « Tacky Pro 2.0 X30 / X60 »" }], statut: "observe" },
  { brand: "West Gut", category: "accessoires", subcategory: "grips_surgrips", typeGrip: "grip", family: "AG14", aliases: ["ag14"], statut: "observe" },
  { brand: "West Gut", category: "accessoires", subcategory: "grips_surgrips", typeGrip: "surgrip", family: "AG23", aliases: ["ag23"], statut: "observe" },
  {
    brand: "Wilson",
    category: "accessoires",
    subcategory: "grips_surgrips",
    typeGrip: "surgrip",
    family: "Pro Overgrip",
    aliases: ["pro overgrip", "pro x60"],
    editions: ["Blade", "Burn"],
    statut: "observe",
    notes: [
      "Q16/Q18 vérifié (2026-09-28, wilson.com) : « Pro Overgrip Blade » et « Pro Overgrip Burn » ont la même construction (feutre fin haute adhérence), coloris assortis aux gammes de raquettes Blade/Burn — confirmé édition (Q7, variante). « Pro X60 » = même surgrip Pro Overgrip vendu en boîte de 60 (conditionnement `lot`, différent), pas une édition distincte.",
    ],
  },
  { brand: "MSV", category: "accessoires", subcategory: "grips_surgrips", typeGrip: "surgrip", family: "Cyber Wet", aliases: ["cyber wet"], statut: "observe" },

  // ───────────────────────────── ANTIVIBRATEURS ─────────────────────────────
  {
    brand: "Babolat",
    category: "accessoires",
    subcategory: "antivibrateurs",
    family: "Damp",
    aliases: ["damp"],
    versions: ["Aero", "Drive", "Strike", "Sonic", "Custom"],
    editions: ["Wimbledon"],
    statut: "observe",
    notes: [
      "Q16/Q18 vérifié (2026-09-28, babolat.com, tenniscompanion.org, revendeurs) : formes/matériaux réellement différents, pas de simples coloris — Sonic Damp (silicone creux, effet sonore), Custom Damp (capsule à billes métalliques ajustable, modèle Nadal), Strike Damp (coloris assortis à la 4e génération Pure Strike mais forme dédiée). Confirmé en versions (différent).",
    ],
  },
  { brand: "Tecnifibre", category: "accessoires", subcategory: "antivibrateurs", family: "Logo Damp", aliases: ["logo damp"], versions: ["S"], editions: ["Neon", "Tricolore"], statut: "observe" },
  { brand: "Tecnifibre", category: "accessoires", subcategory: "antivibrateurs", family: "Spirit Damp", aliases: ["spirit damp"], editions: ["Neon"], statut: "observe" },
  { brand: "Tecnifibre", category: "accessoires", subcategory: "antivibrateurs", family: "Vibra-clip", aliases: ["vibra clip"], statut: "observe" },

  // ───────────────────────────── SACS (famille = gamme) ─────────────────────────────
  {
    brand: "Babolat",
    category: "accessoires",
    subcategory: "sacs",
    family: "Pure (gamme sacs)",
    aliases: ["pure aero", "pure drive", "pure strike", "pure wimbledon", "pure backpack"],
    versions: ["Aero", "Drive", "Strike", "Wimbledon"],
    editions: ["Spectra", "Carbon Grey", "Rafa"],
    statut: "observe",
    notes: [
      "Sacs aux couleurs des gammes de raquettes : RH6 / RH9 / RH12 (contenance), Thermobag, Backpack.",
      "Q19 (D-2026-09-28-03) : Pure Aero / Pure Drive / Pure Strike tranchés par Mathieu comme trois sacs différents (versions).",
    ],
  },
  { brand: "Babolat", category: "accessoires", subcategory: "sacs", family: "Court", aliases: ["court backpack", "court hero", "evo court", "court"], versions: ["XS", "S", "M", "L", "Hero", "Lite"], editions: ["Wimbledon"], statut: "observe", notes: ["XS / S / M / L = contenance (différent)."] },
  { brand: "Wilson", category: "accessoires", subcategory: "sacs", family: "Super Tour", aliases: ["super tour"], editions: ["Red", "Roland Garros", "Roland Garros Night Session"], statut: "observe", notes: ["Collection annuelle (« Roland Garros 2026 ») : génération standard pour les sacs."] },
  { brand: "Wilson", category: "accessoires", subcategory: "sacs", family: "Clash (sacs)", aliases: ["clash"], generations: [{ label: "V3", markers: ["v3"], source: TITRES_SACS }], statut: "observe" },
  { brand: "Wilson", category: "accessoires", subcategory: "sacs", family: "Blade (sacs)", aliases: ["blade"], generations: [{ label: "V10", markers: ["v10"], source: TITRES_SACS }], statut: "observe" },
  { brand: "Wilson", category: "accessoires", subcategory: "sacs", family: "RF (sacs)", aliases: ["rf"], versions: ["Tournament", "Practice"], statut: "observe" },
  { brand: "Wilson", category: "accessoires", subcategory: "sacs", family: "Tour Ultra", aliases: ["tour ultra"], statut: "observe" },
  { brand: "Wilson", category: "accessoires", subcategory: "sacs", family: "Team (sacs)", aliases: ["team"], editions: ["Roland Garros"], statut: "observe" },
  { brand: "Wilson", category: "accessoires", subcategory: "sacs", family: "Pro Staff Classic", aliases: ["pro staff classic"], statut: "observe" },
  { brand: "Wilson", category: "accessoires", subcategory: "sacs", family: "Shift Super Tour", aliases: ["shift super tour"], statut: "observe" },
  { brand: "Head", category: "accessoires", subcategory: "sacs", family: "Tour (sacs)", aliases: ["tour"], editions: ["PTC", "PTC Alternate", "Extreme"], statut: "observe", notes: ["Contenance lue en litres (25 l, 30 l, 40 l) ou raquettes (S / XL)."] },
  { brand: "Head", category: "accessoires", subcategory: "sacs", family: "Pro X", aliases: ["pro x", "gravity pro x"], statut: "observe" },
  { brand: "Head", category: "accessoires", subcategory: "sacs", family: "Base", aliases: ["base"], statut: "observe" },
  { brand: "Tecnifibre", category: "accessoires", subcategory: "sacs", family: "Tour Endurance", aliases: ["tour endurance"], editions: ["Navy", "White", "Kaki", "IG"], statut: "observe", notes: ["R1 paires 22 et 23 (collections 2023-2024 / 2025-2026) : génération standard, déjà validées « proche »."] },
  { brand: "Dunlop", category: "accessoires", subcategory: "sacs", family: "Performance (sacs)", aliases: ["fx performance", "sx performance", "cx performance"], versions: ["FX", "SX", "CX"], statut: "observe" },
  { brand: "Dunlop", category: "accessoires", subcategory: "sacs", family: "SX Club", aliases: ["sx club"], statut: "observe" },
  { brand: "Prince", category: "accessoires", subcategory: "sacs", family: "Tour (Prince)", aliases: ["tour"], statut: "observe" },
];
