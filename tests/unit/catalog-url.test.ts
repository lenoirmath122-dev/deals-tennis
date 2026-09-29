import { describe, expect, it } from "vitest";
import { buildCatalogHref } from "@/lib/catalog-url";

describe("buildCatalogHref — sous-catégorie d'accessoires", () => {
  it("keeps the subcategory when the category is accessoires", () => {
    expect(buildCatalogHref({ category: "accessoires", subcategory: "balles" })).toBe(
      "/?category=accessoires&subcategory=balles"
    );
  });

  it("drops the subcategory for any other category", () => {
    expect(buildCatalogHref({ category: "raquettes", subcategory: "balles" })).toBe(
      "/?category=raquettes"
    );
    expect(buildCatalogHref({ category: "all", subcategory: "balles" })).toBe("/");
  });

  it("omits the default 'all' subcategory", () => {
    expect(buildCatalogHref({ category: "accessoires", subcategory: "all" })).toBe(
      "/?category=accessoires"
    );
  });

  it("keeps the other filters alongside the subcategory", () => {
    expect(
      buildCatalogHref({
        category: "accessoires",
        subcategory: "autres",
        gender: "femme",
        sort: "discount",
        q: "Babolat",
        page: 2,
      })
    ).toBe("/?category=accessoires&subcategory=autres&gender=femme&sort=discount&q=Babolat&page=2");
  });
});
