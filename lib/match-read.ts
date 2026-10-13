/**
 * R5 : couche de lecture des tables `match_*` (passage identifié, jamais « le dernier »).
 * Sans UI. Le flag `MATCH_DISPLAY_ENABLED` est désactivé par défaut ; le passage lu est
 * fixé par `MATCH_RUN_ID` (cadrage_deals-tennis/R5_dossier_decision.md §3).
 */

import { sql } from "@/lib/db";
import { DEAL_CARD_FIELDS } from "@/lib/deals";
import type { DealCardData } from "@/types/database";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const ACTIVE_DEAL = `
  d.status = 'active'
  AND d.is_active = true
  AND (d.expires_at IS NULL OR d.expires_at > NOW())
`;

/** Passage à lire, ou null si le flag est désactivé ou l'identifiant absent/invalide. */
export function getMatchRunId(env: NodeJS.ProcessEnv = process.env): string | null {
  if (env.MATCH_DISPLAY_ENABLED !== "true") return null;
  const id = env.MATCH_RUN_ID?.trim();
  return id && UUID_RE.test(id) ? id : null;
}

/**
 * Offres du même modèle si l'offre est rattachée à un modèle du passage, sinon null
 * (offre hors modèle : l'appelant garde l'ancien affichage).
 */
export async function getLinkedModelOffers(
  runId: string,
  dealId: string
): Promise<DealCardData[] | null> {
  const linked = await sql.query(
    `SELECT 1 FROM match_offer_links WHERE run_id = $1 AND deal_id = $2 LIMIT 1`,
    [runId, dealId]
  );
  if (linked.length === 0) return null;
  return getModelOffers(runId, dealId);
}

export interface FamilyModel {
  modelId: string;
  canonicalAttributes: Record<string, unknown>;
  /** Nom en clair : marque, famille et génération (« Wilson Rush, génération 5 »). */
  label: string;
  offers: DealCardData[];
}

/** Autres offres actives du même modèle (tous marchands), moins chères d'abord. */
export async function getModelOffers(
  runId: string,
  dealId: string
): Promise<DealCardData[]> {
  const rows = await sql.query(
    `
      SELECT ${DEAL_CARD_FIELDS}
      FROM match_offer_links own
      JOIN match_offer_links l ON l.run_id = own.run_id AND l.model_id = own.model_id
      JOIN deals d ON d.id = l.deal_id
      JOIN merchants m ON d.merchant_id = m.id
      WHERE own.run_id = $1
        AND own.deal_id = $2
        AND l.deal_id != $2
        AND ${ACTIVE_DEAL}
      ORDER BY d.discounted_price ASC
    `,
    [runId, dealId]
  );
  return rows as DealCardData[];
}

type Attributes = Record<string, { value?: unknown } | undefined>;

/**
 * Seuls `generation` et `annee` désignent une génération. `edition` et `millesime`
 * (athlète, ville, tournoi, saison textile) sont des variantes : elles doivent être identiques.
 */
const GENERATION_KEYS = ["generation", "annee"];

const attrValue = (a: Attributes, key: string) => String(a[key]?.value ?? "-");

const YEAR_RE = /^(?:19|20)\d{2}\b/;

/** Génération en clair (« 5 », « 2023 »), ou null si aucun repère. */
export function generationLabel(attributes: Record<string, unknown>): string | null {
  const a = attributes as Attributes;
  for (const key of GENERATION_KEYS) {
    const v = a[key]?.value;
    if (v !== undefined && v !== null && String(v).trim() !== "") return String(v).trim();
  }
  return null;
}

/** Clé de comparaison : année seule si le libellé en commence par une (« 2021 (Graphene) »). */
function generationKey(label: string): { kind: "annee" | "rang"; key: string } {
  const year = label.match(YEAR_RE);
  return year
    ? { kind: "annee", key: year[0] }
    : { kind: "rang", key: label.toLowerCase().replace(/^gen(?:eration)?\s*/, "") };
}

/**
 * Même famille, mêmes genre / public / modèle / surface / version / édition… et une
 * génération différente connue des deux côtés, de même nature (année contre année,
 * numéro contre numéro). Une génération absente d'un côté n'est pas une preuve.
 */
export function isOtherGeneration(own: Attributes, other: Attributes): boolean {
  const keys = new Set([...Object.keys(own), ...Object.keys(other)]);
  for (const key of keys) {
    if (GENERATION_KEYS.includes(key)) continue;
    if (attrValue(own, key) !== attrValue(other, key)) return false;
  }
  const a = generationLabel(own);
  const b = generationLabel(other);
  if (!a || !b) return false;
  const ka = generationKey(a);
  const kb = generationKey(b);
  return ka.kind === kb.kind && ka.key !== kb.key;
}

function modelLabel(familyKey: string | null, generation: string): string {
  const [brand, family] = (familyKey ?? "").split("|");
  const name = [brand, family].filter(Boolean).join(" ").replace(/^./, (c) => c.toUpperCase());
  const kind = YEAR_RE.test(generation) ? "modèle" : "génération";
  return name ? `${name}, ${kind} ${generation}` : `${kind[0].toUpperCase()}${kind.slice(1)} ${generation}`;
}

/**
 * Autres générations de la même famille (même variante, génération différente), avec
 * leurs offres actives. Aucun tri par prix ni « meilleur prix » entre modèles
 * (GAP-2026-09-30-02).
 */
export async function getFamilyOtherModels(
  runId: string,
  dealId: string
): Promise<FamilyModel[]> {
  const rows = (await sql.query(
    `
      SELECT mm.id AS model_id, mm.family_key, mm.canonical_attributes,
             own_m.canonical_attributes AS own_attributes, ${DEAL_CARD_FIELDS}
      FROM match_offer_links own
      JOIN match_models own_m ON own_m.id = own.model_id
      JOIN match_models mm
        ON mm.run_id = own.run_id
       AND mm.family_key = own_m.family_key
       AND mm.id != own.model_id
      JOIN match_offer_links l ON l.run_id = mm.run_id AND l.model_id = mm.id
      JOIN deals d ON d.id = l.deal_id
      JOIN merchants m ON d.merchant_id = m.id
      WHERE own.run_id = $1
        AND own.deal_id = $2
        AND own_m.family_key IS NOT NULL
        AND ${ACTIVE_DEAL}
      ORDER BY mm.signature ASC, d.discounted_price ASC
    `,
    [runId, dealId]
  )) as (DealCardData & {
    model_id: string;
    family_key: string | null;
    canonical_attributes: Record<string, unknown>;
    own_attributes: Record<string, unknown>;
  })[];

  // Un seul groupe par génération : des modèles distincts du passage (attributs annee et
  // generation renseignés différemment) peuvent désigner la même génération.
  const byGeneration = new Map<string, FamilyModel>();
  const seen = new Set<string>();
  for (const { model_id, family_key, canonical_attributes, own_attributes, ...offer } of rows) {
    if (!isOtherGeneration(own_attributes as Attributes, canonical_attributes as Attributes)) {
      continue;
    }
    const generation = generationLabel(canonical_attributes)!;
    const groupKey = generationKey(generation).key;
    let model = byGeneration.get(groupKey);
    if (!model) {
      model = {
        modelId: model_id,
        canonicalAttributes: canonical_attributes,
        label: modelLabel(family_key, generation),
        offers: [],
      };
      byGeneration.set(groupKey, model);
    }
    if (seen.has(offer.id)) continue;
    seen.add(offer.id);
    model.offers.push(offer as DealCardData);
  }
  for (const m of byGeneration.values()) {
    m.offers.sort((x, y) => x.discounted_price - y.discounted_price);
  }
  return [...byGeneration.values()];
}
