import { describe, expect, it } from "vitest";
import fixture from "../fixtures/r4-4-bis-paires-pieges.json";
import { compare } from "@/lib/matching/compare";
import { extractOfferAttributes, type OfferInput } from "@/lib/matching";

// Paires pièges relevées au contrôle de R4.1 à R4.4 (`R4_4_controle.md`), sur des titres réels de la
// prod. Complète le jeu R1 figé, qui ne contenait aucune paire de ces formes. Aucune ne doit être « identique ».

const extract = (o: (typeof fixture.pairs)[number]["a"]) =>
  extractOfferAttributes({
    marchand: o.marchand,
    titre: o.titre,
    marque: o.marque,
    categorie: o.categorie,
    subcategory: o.subcategory,
  } as OfferInput);

describe("paires pièges R4.4-bis (titres réels)", () => {
  for (const pair of fixture.pairs) {
    it(`${pair.nom} : ${pair.pourquoi}`, () => {
      const result = compare(extract(pair.a), extract(pair.b));
      expect(result.niveau).not.toBe("identique");
      if (pair.attendu === "different") expect(result.niveau).toBe("different");
    });
  }
});
