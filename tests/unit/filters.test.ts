import { describe, expect, it } from "vitest";
import { isValidCategory, sanitizeSearchQuery } from "@/lib/filters";

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
