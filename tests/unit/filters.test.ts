import { describe, expect, it } from "vitest";
import { isValidCategory, isValidGender, isValidAgeGroup, sanitizeSearchQuery } from "@/lib/filters";

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
