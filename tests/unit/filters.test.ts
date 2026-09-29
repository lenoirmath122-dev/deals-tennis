import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  isValidCategory,
  isValidGender,
  isValidAgeGroup,
  isValidSubcategory,
  sanitizeSearchQuery,
  OTHER_ACCESSORIES,
  SUBCATEGORY_LABELS,
  SUBCATEGORY_VALUES,
} from "@/lib/filters";
import type { AccessorySubcategory } from "@/config/accessory-subcategories";

describe("isValidCategory", () => {
  it("accepts 'all'", () => {
    expect(isValidCategory("all")).toBe(true);
  });

  it("accepts each known deal category", () => {
    expect(isValidCategory("raquettes")).toBe(true);
    expect(isValidCategory("cordages")).toBe(true);
    expect(isValidCategory("chaussures")).toBe(true);
    expect(isValidCategory("textile")).toBe(true);
    expect(isValidCategory("accessoires")).toBe(true);
  });

  it("rejects an unknown category string", () => {
    expect(isValidCategory("raquette")).toBe(false);
    expect(isValidCategory("DROP TABLE deals")).toBe(false);
  });

  it("rejects empty, null and undefined values", () => {
    expect(isValidCategory("")).toBe(false);
    expect(isValidCategory(null)).toBe(false);
    expect(isValidCategory(undefined)).toBe(false);
  });
});

describe("isValidGender", () => {
  it("accepts 'all' and each known gender value", () => {
    expect(isValidGender("all")).toBe(true);
    expect(isValidGender("homme")).toBe(true);
    expect(isValidGender("femme")).toBe(true);
    expect(isValidGender("mixte")).toBe(true);
  });

  it("rejects an unknown gender string, including non_determine", () => {
    expect(isValidGender("non_determine")).toBe(false);
    expect(isValidGender("DROP TABLE deals")).toBe(false);
  });

  it("rejects empty, null and undefined values", () => {
    expect(isValidGender("")).toBe(false);
    expect(isValidGender(null)).toBe(false);
    expect(isValidGender(undefined)).toBe(false);
  });
});

describe("isValidAgeGroup", () => {
  it("accepts 'all' and each known age group value", () => {
    expect(isValidAgeGroup("all")).toBe(true);
    expect(isValidAgeGroup("adulte")).toBe(true);
    expect(isValidAgeGroup("enfant")).toBe(true);
  });

  it("rejects an unknown age group string", () => {
    expect(isValidAgeGroup("senior")).toBe(false);
  });

  it("rejects empty, null and undefined values", () => {
    expect(isValidAgeGroup("")).toBe(false);
    expect(isValidAgeGroup(null)).toBe(false);
    expect(isValidAgeGroup(undefined)).toBe(false);
  });
});

describe("sanitizeSearchQuery", () => {
  it("trims leading and trailing whitespace", () => {
    expect(sanitizeSearchQuery("  Pure Drive  ")).toBe("Pure Drive");
  });

  it("returns an empty string for null or undefined input", () => {
    expect(sanitizeSearchQuery(null)).toBe("");
    expect(sanitizeSearchQuery(undefined)).toBe("");
  });

  it("returns an empty string when input is only whitespace", () => {
    expect(sanitizeSearchQuery("   ")).toBe("");
  });

  it("leaves an already-clean query unchanged", () => {
    expect(sanitizeSearchQuery("Babolat")).toBe("Babolat");
  });
});

describe("isValidSubcategory (GAP-2026-09-25-11 étape 6)", () => {
  it("accepts 'all', 'autres' and each accessory subcategory", () => {
    expect(isValidSubcategory("all")).toBe(true);
    expect(isValidSubcategory(OTHER_ACCESSORIES)).toBe(true);
    for (const value of SUBCATEGORY_VALUES) {
      expect(isValidSubcategory(value)).toBe(true);
    }
  });

  it("rejects unknown values, including an injection attempt", () => {
    expect(isValidSubcategory("sac")).toBe(false);
    expect(isValidSubcategory("textile_porte")).toBe(false);
    expect(isValidSubcategory("DROP TABLE deals")).toBe(false);
  });

  it("rejects empty, null and undefined values", () => {
    expect(isValidSubcategory("")).toBe(false);
    expect(isValidSubcategory(null)).toBe(false);
    expect(isValidSubcategory(undefined)).toBe(false);
  });

  it("has a label for every value", () => {
    for (const value of ["all", OTHER_ACCESSORIES, ...SUBCATEGORY_VALUES]) {
      expect(SUBCATEGORY_LABELS[value as keyof typeof SUBCATEGORY_LABELS]).toBeTruthy();
    }
  });

  it("stays aligned with the config type and the database CHECK constraint", () => {
    // Si une sous-catégorie est ajoutée au type de config sans l'être ici, la ligne
    // suivante ne compile plus.
    const fromConfig: readonly AccessorySubcategory[] = SUBCATEGORY_VALUES;
    const migration = readFileSync(
      join(process.cwd(), "scripts/migrations/007_deals_tracked_capture.sql"),
      "utf8"
    );
    const check = migration.match(/subcategory IN \(([^)]+)\)/);
    expect(check).not.toBeNull();
    const dbValues = [...check![1].matchAll(/'([a-z_]+)'/g)].map((m) => m[1]).sort();
    expect([...fromConfig].sort()).toEqual(dbValues);
  });
});
