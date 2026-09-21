import { describe, expect, it } from "vitest";
import { getCatalogDeals } from "@/lib/deals";

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
