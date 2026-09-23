import { describe, expect, it } from "vitest";
import { getDealDetail } from "@/lib/deals";
import { sql } from "@/lib/db";

const NOT_FOUND_UUID = "00000000-0000-0000-0000-000000000000";

describe("getDealDetail contract", () => {
  it('returns "not-found" for a non-existent deal id', async () => {
    const result = await getDealDetail(NOT_FOUND_UUID);
    expect(result).toBe("not-found");
  });

  it('returns "expired" for an expired or inactive deal', async () => {
    const [deal] = await sql.query(
      `SELECT id FROM deals
       WHERE status != 'active' OR is_active = false OR expires_at <= NOW()
       LIMIT 1`
    );
    expect(deal).toBeDefined();

    const result = await getDealDetail(deal.id);
    expect(result).toBe("expired");
  });

  it("returns the deal with its other active offers for the same article, cheapest first", async () => {
    const [deal] = await sql.query(
      `SELECT id FROM deals WHERE title ILIKE '%Pure Aero%' AND status = 'active' LIMIT 1`
    );
    expect(deal).toBeDefined();

    const result = await getDealDetail(deal.id);
    expect(result).not.toBe("not-found");
    expect(result).not.toBe("expired");
    const detail = result as Exclude<typeof result, "not-found" | "expired">;
    expect(detail.deal.id).toBe(deal.id);
    expect(detail.otherOffers.length).toBeGreaterThanOrEqual(1);
    expect(detail.otherOffers.every((offer) => offer.id !== deal.id)).toBe(true);

    const prices = detail.otherOffers.map((offer) => offer.discounted_price);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  it("returns an empty otherOffers list for a deal with no product_id", async () => {
    const [deal] = await sql.query(
      `SELECT id FROM deals
       WHERE product_id IS NULL AND status = 'active' AND is_active = true
         AND (expires_at IS NULL OR expires_at > NOW())
       LIMIT 1`
    );

    if (!deal) {
      // Toutes les offres réelles ont un product_id à ce stade (backfill + n8n) : rien à vérifier.
      return;
    }

    const result = await getDealDetail(deal.id);
    const detail = result as Exclude<typeof result, "not-found" | "expired">;
    expect(detail.otherOffers).toEqual([]);
  });
});
