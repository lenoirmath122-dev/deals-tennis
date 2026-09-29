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

describe("getCatalogDeals contract — filtre sexe/âge (GAP-2026-09-25-01 point 5)", () => {
  it("only returns deals whose linked product matches the requested gender", async () => {
    const result = await getCatalogDeals({ gender: "femme" });
    expect(result.deals.length).toBeGreaterThan(0);

    const ids = result.deals.map((deal) => deal.id);
    const rows = await sql.query(
      `SELECT d.id, p.gender
       FROM deals d
       LEFT JOIN products p ON d.product_id = p.id
       WHERE d.id = ANY($1::uuid[])`,
      [ids]
    );
    expect((rows as { gender: string | null }[]).every((row) => row.gender === "femme")).toBe(true);
  });

  it("only returns deals whose linked product matches the requested age group", async () => {
    const result = await getCatalogDeals({ age_group: "enfant" });
    expect(result.deals.length).toBeGreaterThan(0);

    const ids = result.deals.map((deal) => deal.id);
    const rows = await sql.query(
      `SELECT d.id, p.age_group
       FROM deals d
       LEFT JOIN products p ON d.product_id = p.id
       WHERE d.id = ANY($1::uuid[])`,
      [ids]
    );
    expect((rows as { age_group: string | null }[]).every((row) => row.age_group === "enfant")).toBe(true);
  });

  it("excludes deals with no linked product (product_id null) when a gender/age filter is active", async () => {
    const [unlinkedRow] = await sql.query(
      `SELECT d.id FROM deals d
       WHERE d.product_id IS NULL AND d.status = 'active' AND d.is_active = true
         AND (d.expires_at IS NULL OR d.expires_at > NOW())
       LIMIT 1`
    );
    if (!unlinkedRow) {
      // Aucun deal sans product_id en prod actuellement : rien à vérifier pour ce cas.
      return;
    }

    const result = await getCatalogDeals({ gender: "homme" });
    expect(result.deals.some((deal) => deal.id === (unlinkedRow as { id: string }).id)).toBe(false);
  });

  it("combines gender and category filters", async () => {
    const result = await getCatalogDeals({ gender: "homme", category: "chaussures" });
    expect(result.deals.every((deal) => deal.category === "chaussures")).toBe(true);
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

describe("getCatalogDeals contract — sous-catégorie d'accessoires (GAP-2026-09-25-11 étape 6)", () => {
  it("only returns accessories of the requested subcategory", async () => {
    const result = await getCatalogDeals({ category: "accessoires", subcategory: "sacs" });
    expect(result.deals.length).toBeGreaterThan(0);

    const ids = result.deals.map((deal) => deal.id);
    const rows = await sql.query(
      `SELECT category, subcategory FROM deals WHERE id = ANY($1::uuid[])`,
      [ids]
    );
    expect(
      (rows as { category: string; subcategory: string | null }[]).every(
        (row) => row.category === "accessoires" && row.subcategory === "sacs"
      )
    ).toBe(true);
  });

  it("returns only accessories without subcategory for 'autres'", async () => {
    const result = await getCatalogDeals({ category: "accessoires", subcategory: "autres" });
    const ids = result.deals.map((deal) => deal.id);
    const rows = await sql.query(`SELECT subcategory FROM deals WHERE id = ANY($1::uuid[])`, [ids]);
    expect((rows as { subcategory: string | null }[]).every((row) => row.subcategory === null)).toBe(
      true
    );
  });

  it("ignores the subcategory outside of the accessoires category", async () => {
    const withSub = await getCatalogDeals({ category: "raquettes", subcategory: "sacs" });
    const without = await getCatalogDeals({ category: "raquettes" });
    expect(withSub.pagination.total_deals).toBe(without.pagination.total_deals);
  });

  it("ignores an unknown subcategory value", async () => {
    const withSub = await getCatalogDeals({ category: "accessoires", subcategory: "DROP TABLE deals" });
    const without = await getCatalogDeals({ category: "accessoires" });
    expect(withSub.pagination.total_deals).toBe(without.pagination.total_deals);
  });
});

