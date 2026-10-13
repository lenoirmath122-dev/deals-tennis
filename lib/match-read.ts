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

/** Attributs qui distinguent deux générations ; tous les autres doivent être identiques. */
const GENERATION_KEYS = ["generation", "annee", "millesime", "edition"];

const attrValue = (a: Attributes, key: string) => String(a[key]?.value ?? "-");

/**
 * Même famille, mêmes genre / public / modèle / surface / version… et une génération
 * (génération, année, millésime, édition) différente. Écarte les autres genres, juniors
 * et modèles textiles de la même famille, qui ne sont pas des générations.
 */
export function isOtherGeneration(own: Attributes, other: Attributes): boolean {
  const keys = new Set([...Object.keys(own), ...Object.keys(other)]);
  let differs = false;
  for (const key of keys) {
    const same = attrValue(own, key) === attrValue(other, key);
    if (GENERATION_KEYS.includes(key)) differs ||= !same;
    else if (!same) return false;
  }
  return differs;
}

/** Libellé de génération en clair (« Gen 9 », « 2023 »), ou null si aucun repère. */
export function generationLabel(attributes: Record<string, unknown>): string | null {
  const a = attributes as Attributes;
  for (const key of GENERATION_KEYS) {
    const v = a[key]?.value;
    if (v !== undefined && v !== null && v !== "") return String(v);
  }
  return null;
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
      SELECT mm.id AS model_id, mm.canonical_attributes,
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
    canonical_attributes: Record<string, unknown>;
    own_attributes: Record<string, unknown>;
  })[];

  const byModel = new Map<string, FamilyModel>();
  for (const { model_id, canonical_attributes, own_attributes, ...offer } of rows) {
    if (!isOtherGeneration(own_attributes as Attributes, canonical_attributes as Attributes)) {
      continue;
    }
    let model = byModel.get(model_id);
    if (!model) {
      model = { modelId: model_id, canonicalAttributes: canonical_attributes, offers: [] };
      byModel.set(model_id, model);
    }
    model.offers.push(offer as DealCardData);
  }
  return [...byModel.values()];
}
