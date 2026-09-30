import { describe, expect, it } from "vitest";
import { compare } from "@/lib/matching/compare";
import { extractOfferAttributes, type OfferInput } from "@/lib/matching";

// R4.5 étape 4 (D-2026-09-30-05) : références de style hors textile.

const extract = (offer: OfferInput) => extractOfferAttributes(offer);
const refs = (offer: OfferInput) => extract(offer).referencesFabricant.map((r) => r.value);

describe("lecture des références de style hors textile", () => {
  it("SKU Babolat, Head et Sport 2000 = référence fabricant ; avant le tiret seulement", () => {
    const base = { marque: null, categorie: "raquettes" as const, titre: "Raquette de tennis" };
    expect(refs({ ...base, marchand: "Head", merchant_sku: "231015" })).toEqual(["231015"]);
    expect(refs({ ...base, marchand: "Babolat", merchant_sku: "101553" })).toEqual(["101553"]);
    expect(refs({ ...base, marchand: "Sport 2000", merchant_sku: "FD6574-110" })).toEqual(["FD6574"]);
  });

  it("le SKU des autres marchands n'est pas une référence fabricant", () => {
    const offer: OfferInput = { marchand: "Tennispro.fr", marque: null, categorie: "raquettes", titre: "Raquette", merchant_sku: "ABC12345" };
    expect(refs(offer)).toEqual([]);
  });

  it("mpn : suffixe coloris retiré, deux références concaténées par « / » séparées", () => {
    const base = { marchand: "Tennispro.fr", marque: "Babolat", categorie: "cordages" as const, titre: "Cordage de tennis Babolat RPM Blast 200 m" };
    expect(refs({ ...base, mpn: "281103-WH" })).toEqual(["281103"]);
    expect(refs({ ...base, mpn: "601344/601648" })).toEqual(["601344", "601648"]);
  });

  it("SportSystem : référence de chaque variante, partie style", () => {
    const offer: OfferInput = {
      marchand: "SportSystem",
      marque: "Babolat",
      categorie: "cordages",
      titre: "Cordage de tennis Babolat RPM Blast 200 m",
      raw_attributes: { variants: [{ reference: "243101-105" }, { reference: "243101-101" }] },
    };
    expect(refs(offer)).toEqual(["243101"]);
  });

  it("balles : référence complète, le suffixe est le conditionnement", () => {
    const offer: OfferInput = {
      marchand: "Tennispro.fr",
      marque: "Dunlop",
      categorie: "accessoires",
      subcategory: "balles",
      titre: "Balles de tennis Dunlop Fort Championship",
      mpn: "601607-18",
    };
    expect(refs(offer)).toEqual(["601607-18"]);
  });

  it("Tecnifibre hors textile : pas de SKU du site, références lues en entier", () => {
    const site: OfferInput = { marchand: "Tecnifibre", marque: "Tecnifibre", categorie: "raquettes", titre: "Raquette Tecnifibre TF-X1 270 V2", merchant_sku: "14TFX27541" };
    expect(refs(site)).toEqual([]);
    const shop: OfferInput = { ...site, marchand: "SportSystem", merchant_sku: null, raw_attributes: { variants: [{ reference: "14TFX1704-01" }] } };
    expect(refs(shop)).toEqual(["14TFX1704-01"]);
  });

  it("le textile ne change pas : pas de SKU par la lecture générale", () => {
    const offer: OfferInput = { marchand: "Head", marque: "Head", categorie: "textile", titre: "T-shirt Head Performance Homme", merchant_sku: "811379" };
    // Les références de style du textile viennent de `styleReferences` (marque vérifiée), pas de la lecture hors textile.
    expect(refs(offer)).toEqual(["811379"]);
  });
});

describe("rapprochement par référence de style (paires de D-2026-09-30-05)", () => {
  const identical = (a: OfferInput, b: OfferInput) => {
    const r = compare(extract(a), extract(b));
    expect(r.niveau).toBe("identique");
    expect(r.methode).toBe("reference");
    expect(r.conflit).toBe(false);
  };

  it("raquette Head Radical MP : site Head / SportSystem, même référence", () => {
    identical(
      { marchand: "Head", marque: "Head", categorie: "raquettes", titre: "Radical MP 2025", merchant_sku: "231015" },
      { marchand: "SportSystem", marque: "Head", categorie: "raquettes", titre: "Raquette de tennis Head Radical MP 2025", raw_attributes: { variants: [{ reference: "231015" }] } },
    );
  });

  it("cordage Babolat RPM Blast 200 m : site Babolat / Tennispro.fr", () => {
    identical(
      { marchand: "Babolat", marque: "Babolat", categorie: "cordages", titre: "RPM Blast 200 m", merchant_sku: "243101" },
      { marchand: "Tennispro.fr", marque: "Babolat", categorie: "cordages", titre: "Cordage de tennis Babolat RPM Blast (200 m)", mpn: "243101" },
    );
  });

  it("cordage Head Hawk 12 m : Tennispro.fr avec coloris / site Head", () => {
    identical(
      { marchand: "Tennispro.fr", marque: "Head", categorie: "cordages", titre: "Cordage de tennis Head Hawk (12 m)", mpn: "281103-WH" },
      { marchand: "Head", marque: "Head", categorie: "cordages", titre: "Hawk 12 m", merchant_sku: "281103" },
    );
  });

  it("chaussures Sport 2000 : deux coloris de la même référence de style", () => {
    identical(
      { marchand: "Sport 2000", marque: "Nike", categorie: "chaussures", titre: "Chaussures de tennis Nike Court Lite 4 Homme", merchant_sku: "FD6575-100" },
      { marchand: "Sport 2000", marque: "Nike", categorie: "chaussures", titre: "Chaussures de tennis Nike Court Lite 4 Homme", merchant_sku: "FD6575-101" },
    );
  });

  it("jauge : deux jauges de la même référence commune restent la même fiche (variante)", () => {
    const a = extract({ marchand: "SportSystem", marque: "Head", categorie: "cordages", titre: "Cordage Head Xcel 200 m 1,25", raw_attributes: { variants: [{ reference: "243110" }] } });
    const b = extract({ marchand: "SportSystem", marque: "Head", categorie: "cordages", titre: "Cordage Head Xcel 200 m 1,35", raw_attributes: { variants: [{ reference: "243110" }] } });
    const r = compare(a, b);
    expect(r.niveau).toBe("identique");
    expect(r.methode).toBe("reference");
  });

  it("balles Dunlop : `601607-18` (carton) et `601607` (tube) ne se rejoignent pas", () => {
    const carton = extract({ marchand: "Tennispro.fr", marque: "Dunlop", categorie: "accessoires", subcategory: "balles", titre: "Balles de tennis Dunlop Fort Championship (carton de 18 tubes)", mpn: "601607-18" });
    const tube = extract({ marchand: "SportSystem", marque: "Dunlop", categorie: "accessoires", subcategory: "balles", titre: "Balles de tennis Dunlop Fort Championship (tube de 4)", raw_attributes: { variants: [{ reference: "601607" }] } });
    expect(compare(carton, tube).methode).not.toBe("reference");
  });

  it("Babolat `101553` (Pure Drive +) et `101552` (Pure Drive) ne sont pas réunies", () => {
    const plus = extract({ marchand: "Babolat", marque: "Babolat", categorie: "raquettes", titre: "Pure Drive +", merchant_sku: "101553" });
    const base = extract({ marchand: "Babolat", marque: "Babolat", categorie: "raquettes", titre: "Pure Drive", merchant_sku: "101552" });
    expect(compare(plus, base).niveau).not.toBe("identique");
  });
});

describe("Lacoste : références de style distinctes (comme Nike)", () => {
  const lacoste = (sku: string) =>
    extract({ marchand: "Sport 2000", marque: "Lacoste", categorie: "textile", titre: "T-shirt Lacoste Sport coton Crocodile Ultra Dry Homme", merchant_sku: sku });

  it("TH2508 / TH2808 → proche, jamais identique", () => {
    const r = compare(lacoste("TH2508"), lacoste("TH2808"));
    expect(r.niveau).toBe("proche");
    expect(r.differences.some((d) => d.attribut === "reference_style")).toBe(true);
  });

  it("même référence de style → identique", () => {
    expect(compare(lacoste("TH2508-031"), lacoste("TH2508-HDE")).niveau).toBe("identique");
  });
});
