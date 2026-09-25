import { describe, expect, it } from "vitest";
import {
  extractAgeGroup,
  extractColor,
  extractModel,
  normalizeProductKey,
} from "@/lib/product-matching";

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
    ).toBe("Eclipsion 5 Homme");

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
  it("retire la couleur du modèle (D-2026-09-23-06), français comme anglais", () => {
    expect(
      extractModel(
        "Chaussures de tennis Adidas Barricade 14 Homme Blanc Bleu",
        "Adidas",
        "chaussures"
      )
    ).toBe("Barricade 14 Homme");

    expect(
      extractModel(
        "Chaussures de tennis Adidas Barricade 14 Homme White And Black",
        "Adidas",
        "chaussures"
      )
    ).toBe("Barricade 14 Homme");
  });
});

describe("extractColor", () => {
  it("retourne null si aucune couleur reconnue n'est présente", () => {
    expect(extractColor("Raquette de tennis Babolat Pure Strike Lite")).toBeNull();
  });

  it("reconnaît une couleur simple, française ou anglaise", () => {
    expect(
      extractColor("Chaussures de tennis Wilson Rush Pro 4.5 Homme Noir")
    ).toBe("Noir");
    expect(
      extractColor("Adizero Ubersonic 5 Homme White Dark Blue")
    ).toBe("Blanc Bleu");
  });

  it("combine plusieurs couleurs dans l'ordre d'apparition, sans doublon", () => {
    expect(extractColor("Barricade 14 Homme Blanc Bleu")).toBe("Blanc Bleu");
    expect(extractColor("Barricade 14 Homme White And Black")).toBe("Blanc Noir");
  });
});

describe("extractAgeGroup", () => {
  it("détecte enfant via mot-clé, quelle que soit la catégorie", () => {
    expect(extractAgeGroup("Raquette de tennis Babolat Pure Aero Junior 26", "raquettes")).toBe(
      "enfant"
    );
    expect(extractAgeGroup("Chaussures de tennis Nike Enfant", "chaussures")).toBe("enfant");
  });

  it("détecte enfant via taille de manche en pouces pour une raquette sans mot-clé (D-2026-09-25-19)", () => {
    expect(extractAgeGroup("Raquette de tennis Tecnifibre T-Fight Club 25", "raquettes")).toBe(
      "enfant"
    );
    expect(extractAgeGroup("Raquette de tennis Head Coco 25", "raquettes")).toBe("enfant");
    expect(extractAgeGroup("Raquette de tennis Babolat Pure Drive 19", "raquettes")).toBe(
      "enfant"
    );
  });

  it("ne déclenche pas la taille en pouces hors catégorie raquettes", () => {
    expect(extractAgeGroup("Cordage de tennis Luxilon 25", "cordages")).toBe("adulte");
    expect(extractAgeGroup("Chaussures de tennis Asics 25", "chaussures")).toBe("adulte");
    expect(extractAgeGroup("Raquette de tennis Babolat Pure Drive 25", undefined)).toBe("adulte");
  });

  it("reste adulte par défaut pour une raquette sans mot-clé ni taille junior", () => {
    expect(extractAgeGroup("Raquette de tennis Babolat Pure Drive 100", "raquettes")).toBe(
      "adulte"
    );
    expect(extractAgeGroup("Raquette de tennis Head Radical Pro 2023", "raquettes")).toBe(
      "adulte"
    );
  });

  it("ne matche pas un nombre imbriqué dans un plus grand nombre", () => {
    expect(extractAgeGroup("Raquette de tennis Wilson Blade 98 v9 125", "raquettes")).toBe(
      "adulte"
    );
  });

  it("détecte enfant via mot-clé présent uniquement dans la description (D-2026-09-25-19, étape 2)", () => {
    expect(
      extractAgeGroup(
        "Sac de tennis Tecnifibre Team",
        "accessoires",
        "<p>Sac de tennis conçu pour les joueurs <strong>junior</strong>.</p>"
      )
    ).toBe("enfant");
  });

  it("détecte enfant via taille en pouces présente uniquement dans la description, catégorie raquettes", () => {
    expect(
      extractAgeGroup(
        "Raquette de tennis Tecnifibre TFight",
        "raquettes",
        "<p>Manche 25, cordée d'origine.</p>"
      )
    ).toBe("enfant");
  });

  it("ignore la description quand elle est absente ou undefined", () => {
    expect(extractAgeGroup("Raquette de tennis Babolat Pure Drive 100", "raquettes", undefined)).toBe(
      "adulte"
    );
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
