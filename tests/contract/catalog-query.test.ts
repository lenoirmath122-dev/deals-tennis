import { describe, expect, it } from "vitest";
import { getCatalogDeals } from "@/lib/deals";
import { sql } from "@/lib/db";

describe("getCatalogDeals contract", () => {
  it("paginates with 24 items per page by default", async () => {
    const result = await getCatalogDeals({});
    expect(result.pagination.per_page).toBe(24);
    expect(result.pagination.current_page).toBe(1);
    expect(result.deals.length).toBeLessThanOrEqual(24);
  });

  it("orders deals by created_at descending by default", async () => {
    const result = await getCatalogDeals({});
    const timestamps = result.deals.map((deal) => new Date(deal.created_at).getTime());
    const sorted = [...timestamps].sort((a, b) => b - a);
    expect(timestamps).toEqual(sorted);
  });

  it("excludes expired or inactive deals from the seeded dataset", async () => {
    const result = await getCatalogDeals({});
    const titles = result.deals.map((deal) => deal.title);
    expect(titles).not.toContain("Wilson Blade 98 v9");
    expect(titles).not.toContain("Babolat RPM Blast 1.30mm (12m)");
    expect(titles).not.toContain("Head Performance Jupe");
  });
});

describe("getCatalogDeals contract — search matches regardless of word order", () => {
  it("finds a deal when the query word order differs from the deal title (product suggestion case)", async () => {
    // Article réel : produit "Babolat" + "Antivibrateur de tennis Sonic Damp",
    // titre du deal scrappé "Antivibrateur de tennis Babolat Sonic Damp" (ordre différent).
    const result = await getCatalogDeals({ q: "Babolat Antivibrateur de tennis Sonic Damp" });
    expect(result.deals.some((deal) => deal.title.includes("Sonic Damp"))).toBe(true);
  });
});

describe("getCatalogDeals contract — grouped search mode (D-2026-09-22-06/17)", () => {
  it("groups results for a query matching offers from multiple merchants for the same article", async () => {
    const result = await getCatalogDeals({ q: "Pure Aero" });
    const grouped = result.deals.find((deal) => (deal.offer_count ?? 1) >= 2);
    expect(grouped).toBeDefined();
  });

  it("shows the cheapest offer as the representative deal for a grouped article", async () => {
    const result = await getCatalogDeals({ q: "Pure Aero" });
    const grouped = result.deals.find((deal) => (deal.offer_count ?? 1) >= 2)!;

    const rawRows = await sql.query(
      `SELECT d.discounted_price::float AS discounted_price
       FROM deals d
       WHERE d.product_id = (SELECT product_id FROM deals WHERE id = $1)
         AND d.status = 'active' AND d.is_active = true
         AND (d.expires_at IS NULL OR d.expires_at > NOW())`,
      [grouped.id]
    );
    // La carte représentante ne doit jamais être plus chère qu'une autre offre du même article.
    const prices = rawRows.map((row) => row.discounted_price as number);
    expect(prices.every((price) => grouped.discounted_price <= price)).toBe(true);
  });

  it("does not set offer_count when no search query is active", async () => {
    const result = await getCatalogDeals({});
    expect(result.deals.every((deal) => deal.offer_count === undefined)).toBe(true);
  });
});
