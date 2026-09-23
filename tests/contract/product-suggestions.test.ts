import { describe, expect, it } from "vitest";
import { getProductSuggestions, getSuggestionCategories } from "@/lib/products";

describe("getProductSuggestions contract", () => {
  it("returns no suggestion for a query shorter than 2 characters", async () => {
    const result = await getProductSuggestions("p");
    expect(result).toEqual([]);
  });

  it("returns matching product suggestions for a real multi-merchant article", async () => {
    const result = await getProductSuggestions("Pure Aero");
    expect(result.length).toBeGreaterThanOrEqual(1);
    expect(result.some((suggestion) => suggestion.toLowerCase().includes("pure aero"))).toBe(
      true
    );
  });

  it("matches on brand as well as model", async () => {
    const result = await getProductSuggestions("Babolat");
    expect(result.length).toBeGreaterThanOrEqual(1);
    expect(result.every((suggestion) => suggestion.toLowerCase().includes("babolat"))).toBe(
      true
    );
  });

  it("returns an empty list for a query matching no product", async () => {
    const result = await getProductSuggestions("zzzznonexistentmodelzzzz");
    expect(result).toEqual([]);
  });

  it("clicking a suggestion must lead back to a search that finds the article (word order regression)", async () => {
    const suggestions = await getProductSuggestions("Sonic Damp");
    const suggestion = suggestions.find((s) => s.includes("Sonic Damp"));
    expect(suggestion).toBeDefined();

    const { getCatalogDeals } = await import("@/lib/deals");
    const result = await getCatalogDeals({ q: suggestion });
    expect(result.deals.some((deal) => deal.title.includes("Sonic Damp"))).toBe(true);
  });
});

describe("getSuggestionCategories contract", () => {
  it("returns no category for a query shorter than 2 characters", async () => {
    const result = await getSuggestionCategories("p");
    expect(result).toEqual([]);
  });

  it("returns the categories matching a real multi-category brand", async () => {
    const result = await getSuggestionCategories("Babolat");
    expect(result.length).toBeGreaterThanOrEqual(1);
    for (const { category, count } of result) {
      expect(["raquettes", "cordages", "chaussures", "textile", "accessoires"]).toContain(
        category
      );
      expect(count).toBeGreaterThan(0);
    }
  });

  it("returns an empty list for a query matching no product", async () => {
    const result = await getSuggestionCategories("zzzznonexistentmodelzzzz");
    expect(result).toEqual([]);
  });
});

describe("getProductSuggestions filtered by category", () => {
  it("only returns suggestions from the requested category", async () => {
    const categories = await getSuggestionCategories("Babolat");
    const target = categories[0];
    expect(target).toBeDefined();

    const result = await getProductSuggestions("Babolat", target.category as never);
    expect(result.length).toBeGreaterThanOrEqual(1);

    const { sql } = await import("@/lib/db");
    for (const suggestion of result) {
      const [brand, ...modelParts] = suggestion.split(" ");
      const rows = (await sql.query(
        `SELECT category FROM products WHERE LOWER(brand) = LOWER($1) AND LOWER(model) = LOWER($2)`,
        [brand, modelParts.join(" ")]
      )) as { category: string }[];
      expect(rows.some((row) => row.category === target.category)).toBe(true);
    }
  });
});
