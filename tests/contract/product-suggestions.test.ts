import { describe, expect, it } from "vitest";
import { getProductSuggestions } from "@/lib/products";

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
    expect(result.every((suggestion) => suggestion.toLowerCase().startsWith("babolat"))).toBe(
      true
    );
  });

  it("returns an empty list for a query matching no product", async () => {
    const result = await getProductSuggestions("zzzznonexistentmodelzzzz");
    expect(result).toEqual([]);
  });
});
