import { describe, expect, it } from "vitest";
import {
  checkExclusion,
  correctBrand,
  evictMerchantOffers,
  extractUnitInfo,
  prepareOffer,
  resolveCategory,
  resolvePrice,
} from "@/lib/ingest";

// Titres réels observés en base ou dans les scripts de scraping (R2_referentiel.md,
// archive/protennis-retrait-2026-09-25/products_orphelins.csv, R0_diagnostic-rapprochement.md).

describe("checkExclusion", () => {
  it("exclut JOOLA (raquette de tennis de table, Q11)", () => {
    expect(checkExclusion("Raquette de tennis de table JOOLA Infinity", "JOOLA", "raquettes")).toBe(
      "joola"
    );
  });

  it("n'exclut pas une autre marque de raquette", () => {
    expect(checkExclusion("Raquette de tennis Babolat Pure Aero", "Babolat", "raquettes")).toBeNull();
  });

  it("exclut une chaussure de ville (Q13)", () => {
    expect(
      checkExclusion("Chaussures de tennis adidas Stan Smith", "adidas", "chaussures")
    ).toBe("chaussure_ville");
  });

  it("n'exclut pas une chaussure de tennis normale", () => {
    expect(
      checkExclusion("Chaussures de tennis Asics Gel-Resolution 9 Clay", "Asics", "chaussures")
    ).toBeNull();
  });

  it("exclut un accessoire hors sujet (Q20, médaille/mug/décoration)", () => {
    expect(checkExclusion("Médaille tennis gravée personnalisée", "Générique", "accessoires")).toBe(
      "accessoire_hors_sujet"
    );
  });

  it("n'exclut pas un vrai accessoire", () => {
    expect(checkExclusion("Sac de tennis Wilson Tour 9 raquettes", "Wilson", "accessoires")).toBeNull();
  });
});

describe("resolveCategory", () => {
  it("classe un sac dans la sous-catégorie sacs", () => {
    expect(resolveCategory("Sac de tennis Babolat Pure Aero", "accessoires")).toEqual({
      category: "accessoires",
      subcategory: "sacs",
    });
  });

  it("classe des balles dans la sous-catégorie balles", () => {
    expect(resolveCategory("Balles de tennis Wilson Triniti tube de 3", "accessoires")).toEqual({
      category: "accessoires",
      subcategory: "balles",
    });
  });

  it("déplace le textile porté vers la catégorie textile (Q20)", () => {
    expect(resolveCategory("Casquette de tennis Nike Dri-FIT", "accessoires")).toEqual({
      category: "textile",
      subcategory: null,
    });
  });

  it("laisse en « Autres accessoires » (subcategory null) sans reclassement", () => {
    expect(resolveCategory("Gourde de tennis Nike 700ml", "accessoires")).toEqual({
      category: "accessoires",
      subcategory: null,
    });
  });

  it("ne touche pas aux catégories autres qu'accessoires", () => {
    expect(resolveCategory("Raquette de tennis Babolat Pure Aero", "raquettes")).toEqual({
      category: "raquettes",
      subcategory: null,
    });
  });
});

describe("correctBrand", () => {
  it("normalise la casse HEAD -> Head", () => {
    expect(correctBrand("HEAD", "Raquette de tennis HEAD Radical Pro", "raquettes")).toBe("Head");
    expect(correctBrand("Head", "Raquette de tennis Head Radical Pro", "raquettes")).toBe("Head");
  });

  it("corrige l'anomalie SPORTSYSTEM sur une raquette (R2_referentiel.md §4)", () => {
    expect(
      correctBrand("SPORTSYSTEM", "SPORTSYSTEM Babolat Evo Aero Lite Gén2", "raquettes")
    ).toBe("Babolat");
  });

  it("ne touche pas SPORTSYSTEM sur du textile (offres officielles JO Paris 2024, correctes)", () => {
    expect(
      correctBrand("SPORTSYSTEM", "SPORTSYSTEM Polo Paris 2024", "textile")
    ).toBe("SPORTSYSTEM");
  });

  it("réattribue un cordage Luxilon vendu sous Wilson sur Amazon (paires R1 66/67)", () => {
    expect(
      correctBrand("Wilson", "Wilson Cordages pour Raquette Luxilon Alu Power 125", "cordages")
    ).toBe("Luxilon");
  });

  it("réattribue Wilson Element au cordage Luxilon Element (Q9)", () => {
    expect(correctBrand("Wilson", "Wilson Element 125 Bobine 200m", "cordages")).toBe("Luxilon");
  });

  it("réattribue la raquette Lacoste L23 enregistrée sous Tecnifibre", () => {
    expect(
      correctBrand("Tecnifibre", "Raquette de tennis Tecnifibre Lacoste L23 300 gr", "raquettes")
    ).toBe("Lacoste");
  });

  it("laisse les autres marques inchangées", () => {
    expect(correctBrand("Babolat", "Raquette de tennis Babolat Pure Aero", "raquettes")).toBe(
      "Babolat"
    );
  });
});

describe("extractUnitInfo", () => {
  it("lit une bobine de cordage en mètres (Bobine 200m)", () => {
    expect(extractUnitInfo("Razor Soft 130 Carbon Bobine 200m", "cordages", null)).toEqual({
      unitQuantity: 200,
      unitType: "metre",
    });
  });

  it("lit une longueur entre parenthèses (SportSystem)", () => {
    expect(extractUnitInfo("Cordage de tennis Tecnifibre TGV (200m)", "cordages", null)).toEqual({
      unitQuantity: 200,
      unitType: "metre",
    });
  });

  it("lit « 200 Metres » (Tennispro.fr)", () => {
    expect(
      extractUnitInfo("Bobine de cordage de tennis Luxilon Eco Spin (200 Metres)", "cordages", null)
    ).toEqual({ unitQuantity: 200, unitType: "metre" });
  });

  it("renvoie null/null pour une garniture sans longueur écrite", () => {
    expect(extractUnitInfo("Razor Soft 130 Carbon Garniture", "cordages", null)).toEqual({
      unitQuantity: null,
      unitType: null,
    });
  });

  it("lit un conditionnement de balles (tube de 3)", () => {
    expect(
      extractUnitInfo("Balles de tennis Wilson Triniti tube de 3", "accessoires", "balles")
    ).toEqual({ unitQuantity: 3, unitType: "balle" });
  });

  it("lit un carton de balles", () => {
    expect(
      extractUnitInfo("Balles de tennis Dunlop Fort carton de 72", "accessoires", "balles")
    ).toEqual({ unitQuantity: 72, unitType: "balle" });
  });

  it("lit un bipack (2 balles)", () => {
    expect(extractUnitInfo("Balles de tennis Head Bipack", "accessoires", "balles")).toEqual({
      unitQuantity: 2,
      unitType: "balle",
    });
  });

  it("lit un lot de surgrips (x30)", () => {
    expect(
      extractUnitInfo("Surgrip de tennis Tennispro Tacky Pro 2.0 X30", "accessoires", "grips_surgrips")
    ).toEqual({ unitQuantity: 30, unitType: "unite" });
  });

  it("renvoie null/null hors cordages/accessoires", () => {
    expect(extractUnitInfo("Raquette de tennis Babolat Pure Aero", "raquettes", null)).toEqual({
      unitQuantity: null,
      unitType: null,
    });
  });
});

describe("resolvePrice", () => {
  it("active quand la remise est réelle", () => {
    expect(resolvePrice(100, 80)).toEqual({
      status: "active",
      isActive: true,
      originalPrice: 100,
      discountedPrice: 80,
      discountPercentage: 20,
    });
  });

  it("tracked quand il n'y a pas de remise réelle (prix identiques, D-2026-09-25-21)", () => {
    expect(resolvePrice(80, 80)).toEqual({
      status: "tracked",
      isActive: false,
      originalPrice: 80,
      discountedPrice: 80,
      discountPercentage: 0,
    });
  });

  it("tracked quand le prix barré est absent ou inférieur au prix affiché", () => {
    expect(resolvePrice(NaN, 80)).toEqual({
      status: "tracked",
      isActive: false,
      originalPrice: 80,
      discountedPrice: 80,
      discountPercentage: 0,
    });
    expect(resolvePrice(70, 80)).toEqual({
      status: "tracked",
      isActive: false,
      originalPrice: 80,
      discountedPrice: 80,
      discountPercentage: 0,
    });
  });
});

describe("prepareOffer", () => {
  it("prépare une offre normale (raquette Babolat en promo)", () => {
    const result = prepareOffer({
      title: "Raquette de tennis Babolat Pure Aero 98",
      brand: "Babolat",
      category: "raquettes",
      imageUrl: "https://example.com/img.jpg",
      originalPrice: 250,
      discountedPrice: 200,
      merchantId: "merchant-1",
      affiliateUrl: "https://example.com/produit",
    });

    expect(result.insert).toBe(true);
    if (!result.insert) throw new Error("insert attendu");
    expect(result.deal.status).toBe("active");
    expect(result.deal.brand).toBe("Babolat");
    expect(result.deal.category).toBe("raquettes");
    expect(result.deal.model).toBe("Pure Aero 98");
  });

  it("exclut une offre JOOLA avant tout autre traitement", () => {
    const result = prepareOffer({
      title: "Raquette de tennis de table JOOLA Infinity",
      brand: "JOOLA",
      category: "raquettes",
      imageUrl: "https://example.com/img.jpg",
      originalPrice: 50,
      discountedPrice: 40,
      merchantId: "merchant-1",
      affiliateUrl: "https://example.com/produit-joola",
    });

    expect(result).toEqual({ insert: false, reason: "joola" });
  });

  it("déplace un accessoire textile porté vers la catégorie textile et capture unit info cordage", () => {
    const casquette = prepareOffer({
      title: "Casquette de tennis Nike Dri-FIT",
      brand: "Nike",
      category: "accessoires",
      imageUrl: "https://example.com/img.jpg",
      originalPrice: 30,
      discountedPrice: 20,
      merchantId: "merchant-1",
      affiliateUrl: "https://example.com/casquette",
    });
    expect(casquette.insert).toBe(true);
    if (!casquette.insert) throw new Error("insert attendu");
    expect(casquette.deal.category).toBe("textile");

    const cordage = prepareOffer({
      title: "Cordage de tennis Babolat RPM Blast Bobine 200m",
      brand: "Babolat",
      category: "cordages",
      imageUrl: "https://example.com/img.jpg",
      originalPrice: 90,
      discountedPrice: 70,
      merchantId: "merchant-1",
      affiliateUrl: "https://example.com/cordage",
    });
    expect(cordage.insert).toBe(true);
    if (!cordage.insert) throw new Error("insert attendu");
    expect(cordage.deal.unitQuantity).toBe(200);
    expect(cordage.deal.unitType).toBe("metre");
  });

  it("capture une offre sans remise réelle en tracked, corrige la marque au passage", () => {
    const result = prepareOffer({
      title: "Wilson Cordages pour Raquette Luxilon Alu Power 125",
      brand: "Wilson",
      category: "cordages",
      imageUrl: "https://example.com/img.jpg",
      originalPrice: 15,
      discountedPrice: 15,
      merchantId: "merchant-amazon",
      affiliateUrl: "https://example.com/luxilon-alu-power",
    });

    expect(result.insert).toBe(true);
    if (!result.insert) throw new Error("insert attendu");
    expect(result.deal.status).toBe("tracked");
    expect(result.deal.isActive).toBe(false);
    expect(result.deal.originalPrice).toBe(result.deal.discountedPrice);
    expect(result.deal.brand).toBe("Luxilon");
  });
});

describe("evictMerchantOffers", () => {
  function fakeSql(countValue: number, evictedIds: string[]) {
    const calls: string[] = [];
    const sql = (async (strings: TemplateStringsArray) => {
      const text = strings.join("");
      calls.push(text);
      if (text.includes("COUNT(*)")) {
        return [{ count: countValue }];
      }
      if (text.includes("UPDATE deals")) {
        return evictedIds.map((id) => ({ id }));
      }
      return [];
    }) as unknown as Parameters<typeof evictMerchantOffers>[0];
    return { sql, calls };
  }

  it("garde-fou : aucune éviction si 0 URL vue", async () => {
    const { sql } = fakeSql(10, []);
    const result = await evictMerchantOffers(sql, "merchant-1", []);
    expect(result).toEqual({ evicted: 0, guard: "aucune_url_vue" });
  });

  it("garde-fou : aucune éviction si moins de la moitié des offres vues (R3-Q5)", async () => {
    const { sql } = fakeSql(100, ["a", "b"]);
    const result = await evictMerchantOffers(sql, "merchant-1", Array.from({ length: 40 }, (_, i) => `url-${i}`));
    expect(result).toEqual({ evicted: 0, guard: "moins_de_moitie" });
  });

  it("évince normalement quand au moins la moitié des offres est vue", async () => {
    const { sql } = fakeSql(100, ["a", "b", "c"]);
    const result = await evictMerchantOffers(
      sql,
      "merchant-1",
      Array.from({ length: 60 }, (_, i) => `url-${i}`)
    );
    expect(result).toEqual({ evicted: 3, guard: null });
  });
});
