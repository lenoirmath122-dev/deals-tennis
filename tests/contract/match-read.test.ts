import { describe, expect, it } from "vitest";
import { sql } from "@/lib/db";
import { getFamilyOtherModels, getLinkedModelOffers, getModelOffers } from "@/lib/match-read";

const RUN = "f07bcbab-8f53-4820-ad4d-1aec9eed6759";

describe("match-read contract (lecture seule)", () => {
  it("lit les offres du même modèle et les autres générations sur le passage identifié", async () => {
    const [run] = await sql.query(`SELECT id FROM match_runs WHERE id = $1`, [RUN]);
    if (!run) {
      console.warn("[match-read.test] skip: passage absent de cette base.");
      return;
    }
    const [row] = await sql.query(
      `SELECT l.deal_id FROM match_offer_links l
       JOIN match_offer_links o ON o.run_id = l.run_id AND o.model_id = l.model_id AND o.deal_id != l.deal_id
       WHERE l.run_id = $1 LIMIT 1`,
      [RUN]
    );
    expect(row).toBeDefined();
    const offers = await getModelOffers(RUN, row.deal_id);
    expect(offers.every((o) => o.id !== row.deal_id)).toBe(true);
    const prices = offers.map((o) => o.discounted_price);
    expect([...prices].sort((a, b) => a - b)).toEqual(prices);
    const models = await getFamilyOtherModels(RUN, row.deal_id);
    expect(new Set(models.map((m) => m.modelId)).size).toBe(models.length);
  });

  it("getLinkedModelOffers : null pour une offre hors modèle, liste sinon", async () => {
    const [run] = await sql.query(`SELECT id FROM match_runs WHERE id = $1`, [RUN]);
    if (!run) return;
    const [linked] = await sql.query(
      `SELECT deal_id FROM match_offer_links WHERE run_id = $1 LIMIT 1`,
      [RUN]
    );
    const [unlinked] = await sql.query(
      `SELECT d.id FROM deals d
       WHERE NOT EXISTS (SELECT 1 FROM match_offer_links l WHERE l.run_id = $1 AND l.deal_id = d.id)
       LIMIT 1`,
      [RUN]
    );
    expect(Array.isArray(await getLinkedModelOffers(RUN, linked.deal_id))).toBe(true);
    if (unlinked) expect(await getLinkedModelOffers(RUN, unlinked.id)).toBeNull();
  });
});
