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
    // Selection dynamique d'un produit reellement multi-marchands au moment du test
    // (pas un titre fige) : le catalogue evolue (expiration/desactivation d'offres),
    // un titre precis fini toujours par ne plus avoir 2+ offres actives (voir
    // GAP-2026-09-25-03, cas ProTennis+Tennis-Point "Pure Aero" ayant motive ce fix).
    // Skip propre (pas d'echec) si aucun produit multi-marchands n'existe en prod au
    // moment du test : le rapprochement produit ne garantit actuellement aucun
    // minimum (voir GAP rapprochement multi-marchands, cadrage
    // CADRAGE_rapprochement-multi-niveaux.md), ce test ne doit jamais echouer a
    // cause des donnees de prod.
    const [multiMerchantProduct] = await sql.query(
      `SELECT product_id FROM deals
       WHERE status = 'active' AND is_active = true AND product_id IS NOT NULL
       GROUP BY product_id
       HAVING COUNT(DISTINCT merchant_id) >= 2
       LIMIT 1`
    );

    if (!multiMerchantProduct) {
      console.warn(
        "[deal-detail.test] skip: aucun produit avec 2+ marchands distincts actifs en prod actuellement."
      );
      return;
    }

    const [deal] = await sql.query(
      `SELECT id FROM deals
       WHERE product_id = $1 AND status = 'active' AND is_active = true
       LIMIT 1`,
      [multiMerchantProduct.product_id]
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
