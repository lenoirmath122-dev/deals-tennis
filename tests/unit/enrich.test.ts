import { describe, expect, it } from "vitest";
import { parseTennisproMpn, parseVariantIdentifiers } from "../../lib/enrich.ts";

const ld = (json: unknown) =>
  `<script type="application/ld+json">${JSON.stringify(json)}</script>`;

describe("parseVariantIdentifiers", () => {
  it("lit un gtin par variante d'un ProductGroup (Tennis Point FR)", () => {
    const html = ld({
      "@type": "ProductGroup",
      hasVariant: [
        { "@type": "Product", sku: "A2", gtin: "3324922083345" },
        { "@type": "Product", sku: "A3", gtin: "3324922083352" },
      ],
    });
    expect(parseVariantIdentifiers(html)).toEqual([
      { sku: "A2", gtin: "3324922083345" },
      { sku: "A3", gtin: "3324922083352" },
    ]);
  });

  it("lit gtin13 sur les offres d'un Product (Tecnifibre)", () => {
    const html = ld({
      "@type": "Product",
      offers: [{ "@type": "Offer", sku: "18LACL23L1", gtin13: "3490150249416" }],
    });
    expect(parseVariantIdentifiers(html)).toEqual([{ sku: "18LACL23L1", gtin: "3490150249416" }]);
  });

  it("rejette un gtin non numérique et ignore un bloc illisible", () => {
    const html =
      `<script type="application/ld+json">{pas du json</script>` +
      ld({ "@type": "Product", offers: [{ sku: "X", gtin13: "abc" }] });
    expect(parseVariantIdentifiers(html)).toEqual([{ sku: "X", gtin: null }]);
  });

  it("retourne une liste vide sans JSON-LD", () => {
    expect(parseVariantIdentifiers("<html></html>")).toEqual([]);
  });
});

describe("parseTennisproMpn", () => {
  it("lit le mpn du dataLayer produit", () => {
    const html = `dataLayer.push({"product":{"id":"1","sku":"1","category":[],"mpn":"233612"},"path":{}});`;
    expect(parseTennisproMpn(html)).toBe("233612");
  });

  it("retourne null si mpn vide ou absent", () => {
    expect(parseTennisproMpn(`dataLayer.push({"product":{"mpn":""}});`)).toBeNull();
    expect(parseTennisproMpn(`dataLayer.push({"product":{"id":"1"}});`)).toBeNull();
    expect(parseTennisproMpn("rien")).toBeNull();
  });
});
