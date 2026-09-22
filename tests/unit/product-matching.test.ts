import { describe, expect, it } from "vitest";
import { extractModel, normalizeProductKey } from "@/lib/product-matching";

describe("extractModel", () => {
  it("retire le préfixe de catégorie et la marque pour une raquette", () => {
    expect(
      extractModel(
        "Raquette de tennis Babolat Pure Strike Lite",
        "Babolat",
        "raquettes"
      )
    ).toBe("Pure Strike Lite");
  });

  it("retire la mention de cordage sans casser le reste du modèle", () => {
    expect(
      extractModel(
        "Raquette de tennis Lacoste L23 300 gr Non Cordée",
        "Lacoste",
        "raquettes"
      )
    ).toBe("L23 300 gr");

    expect(
      extractModel(
        "Raquette de tennis Head Radical Pro Cordée 2023",
        "Head",
        "raquettes"
      )
    ).toBe("Radical Pro 2023");
  });

  it("ne retire pas de préfixe pour les catégories sans préfixe connu", () => {
    expect(
      extractModel("Babolat Antivibrateur x2", "Babolat", "accessoires")
    ).toBe("Antivibrateur x2");

    expect(
      extractModel(
        "Wilson Tour Sac de tennis 9 raquettes",
        "Wilson",
        "accessoires"
      )
    ).toBe("Tour Sac de tennis 9 raquettes");
  });

  it("préserve le grammage/la longueur, qui distinguent des variantes réelles", () => {
    expect(
      extractModel(
        "Raquette de tennis Tecnifibre TF X1 V2 285 Cordée 2024",
        "Tecnifibre",
        "raquettes"
      )
    ).toBe("TF X1 V2 285 2024");

    expect(
      extractModel(
        "Raquette de tennis Tecnifibre TF X1 V2 300 Non Cordée 2024",
        "Tecnifibre",
        "raquettes"
      )
    ).toBe("TF X1 V2 300 2024");
  });

  it("gère les cordages sans mot 'cordée' à retirer", () => {
    expect(
      extractModel(
        "Babolat RPM Blast 1.30mm (12m)",
        "Babolat",
        "cordages"
      )
    ).toBe("RPM Blast 1.30mm (12m)");
  });

  it("retire le préfixe réel des cordages (élargissement toutes catégories)", () => {
    expect(
      extractModel(
        "Cordage de tennis Babolat Xalt 125 bobine 200m",
        "Babolat",
        "cordages"
      )
    ).toBe("Xalt 125 bobine 200m");
  });

  it("retire le préfixe réel des chaussures, singulier ou pluriel", () => {
    expect(
      extractModel(
        "Chaussures de tennis Yonex Eclipsion 5 Homme White/Brown",
        "Yonex",
        "chaussures"
      )
    ).toBe("Eclipsion 5 Homme White/Brown");

    expect(
      extractModel(
        "Chaussure de tennis Wilson Rush Pro 4.5 Homme",
        "Wilson",
        "chaussures"
      )
    ).toBe("Rush Pro 4.5 Homme");
  });

  it("retire le préfixe réel des balles et de la bagagerie, rattachées à accessoires", () => {
    expect(
      extractModel(
        "Balles de tennis Carton Tecnifibre X One 36 Tubes de 4 balles",
        "Tecnifibre",
        "accessoires"
      )
    ).toBe("X One 36 Tubes de 4 balles");

    expect(
      extractModel("Balles de tennis Babolat Team Tubes de 3 Balles", "Babolat", "accessoires")
    ).toBe("Team Tubes de 3 Balles");

    expect(
      extractModel(
        "Sac de tennis Babolat 9 raquettes Pure Drive Spectra Gen11",
        "Babolat",
        "accessoires"
      )
    ).toBe("9 raquettes Pure Drive Spectra Gen11");
  });
});

describe("normalizeProductKey", () => {
  it("est insensible à la casse", () => {
    expect(
      normalizeProductKey({ brand: "Babolat", model: "Pure Strike Lite", category: "raquettes" })
    ).toBe(
      normalizeProductKey({ brand: "babolat", model: "pure strike lite", category: "raquettes" })
    );
  });
});
