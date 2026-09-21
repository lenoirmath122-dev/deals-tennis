import { describe, expect, it } from "vitest";
import { formatDiscountBadge, formatFreshnessLabel, formatPrice } from "@/lib/format";

describe("formatPrice", () => {
  it("formats a number as EUR currency using French formatting", () => {
    expect(formatPrice(179.95)).toBe("179,95 €");
  });

  it("formats whole numbers with two decimal places", () => {
    expect(formatPrice(90)).toBe("90,00 €");
  });
});

describe("formatDiscountBadge", () => {
  it("prefixes the percentage with a minus sign", () => {
    expect(formatDiscountBadge(35)).toBe("-35%");
  });

  it("handles zero percent", () => {
    expect(formatDiscountBadge(0)).toBe("-0%");
  });
});

describe("formatFreshnessLabel", () => {
  it("prefers the expiration date when one is set", () => {
    expect(formatFreshnessLabel("2026-09-01T00:00:00.000Z", "2026-09-24T00:00:00.000Z")).toBe(
      "Jusqu'au 24/09/2026"
    );
  });

  it("falls back to the creation date when there is no expiration", () => {
    expect(formatFreshnessLabel("2026-09-21T00:00:00.000Z", null)).toBe("Ajouté le 21/09/2026");
  });
});
