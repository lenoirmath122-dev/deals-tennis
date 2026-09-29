import { describe, expect, it } from "vitest";
import fixture from "../fixtures/r4-5-paires-textile.json";
import { compare, signature } from "@/lib/matching/compare";
import { buildModels, type EngineOffer } from "@/lib/matching/cluster";
import { extractOfferAttributes, type ExtractedOffer, type OfferInput } from "@/lib/matching";

// Textile (R4.5-a) : extraction du titre, verdict de l'étape 2 et référence de style (étape 1).
// Les titres sont réels (prod, 2026-09-29). Cadrage : `R4_5_cadrage.md`, D-2026-09-29-04.

type FixtureOffer = (typeof fixture.pairs)[number]["a"] & Partial<Pick<OfferInput, "merchant_sku" | "mpn" | "raw_attributes">>;

const extract = (o: FixtureOffer): ExtractedOffer =>
  extractOfferAttributes({
    marchand: o.marchand,
    titre: o.titre,
    marque: o.marque,
    categorie: "textile",
    merchant_sku: o.merchant_sku ?? null,
    mpn: o.mpn ?? null,
    raw_attributes: o.raw_attributes ?? null,
  });

const value = (offer: ExtractedOffer, name: string) => offer.attributes[name]?.value;

const title = (marchand: string, marque: string, titre: string) => extract({ marchand, marque, categorie: "textile", titre });

describe("paires pièges textile (titres réels)", () => {
  for (const pair of fixture.pairs) {
    it(`${pair.nom} : ${pair.pourquoi}`, () => {
      const result = compare(extract(pair.a), extract(pair.b));
      expect(result.niveau).not.toBe("identique");
      expect(result.niveau).toBe(pair.attendu);
    });
  }
});

describe("référence de style (T-Q1) : identique quels que soient les titres", () => {
  for (const pair of fixture.references) {
    it(`${pair.nom} : ${pair.pourquoi}`, () => {
      const result = compare(extract(pair.a as FixtureOffer), extract(pair.b as FixtureOffer));
      if (pair.attendu === "conflit") {
        expect(result.conflit).toBe(true);
        expect(result.niveau).not.toBe("identique");
      } else {
        expect(result.niveau).toBe("identique");
      }
    });
  }

  it("adidas JG0994 et Lacoste TH8917 sont identiques par la référence, pas par le titre", () => {
    for (const name of ["adidas JG0994 (paire R1 17 de la prod)", "Lacoste TH8917"]) {
      const pair = fixture.references.find((r) => r.nom.startsWith(name))!;
      expect(compare(extract(pair.a as FixtureOffer), extract(pair.b as FixtureOffer)).methode).toBe("reference");
    }
  });

  it("le style ne garde que la partie avant le premier tiret, pour les marques vérifiées seulement", () => {
    const babolat = extract({ marchand: "SportSystem", marque: "Babolat", categorie: "textile", titre: "T-shirt de tennis Babolat Tee-shirt Babolat Play Crew bleu ciel Homme", merchant_sku: "3MP2011-4124", raw_attributes: { variants: [{ reference: "3MP2011-4124" }] } });
    expect(babolat.referencesFabricant.map((r) => r.value)).toEqual(["3MP2011"]);
    // Tecnifibre : la référence mêle style, coloris et taille, la règle n'est pas établie.
    const tecnifibre = extract({ marchand: "Tecnifibre", marque: "Tecnifibre", categorie: "textile", titre: "Polo de tennis Tecnifibre Polo Waffle Homme Marine", merchant_sku: "25POWAMA51" });
    expect(tecnifibre.referencesFabricant).toEqual([]);
    // Tennis Point FR : SKU interne, jamais une référence fabricant.
    const tennisPoint = extract({ marchand: "Tennis Point FR", marque: "adidas", categorie: "textile", titre: "Vêtement de tennis adidas Club Jupe Femmes - blanc", merchant_sku: "0054751976900048" });
    expect(tennisPoint.referencesFabricant).toEqual([]);
  });
});

describe("extraction du titre", () => {
  it("SportSystem : type de tête et de fin, marque répétée, coloris et genre retirés", () => {
    const e = title("SportSystem", "Adidas", "Débardeur de tennis Adidas Débardeur tennis femme Club Femme");
    expect(e.familyKey).toBe("adidas|debardeur|textile");
    expect(value(e, "genre")).toBe("femme");
    expect(value(e, "modele")).toBe("club");
    expect(value(e, "age_group")).toBe("adulte");
  });

  it("Tennis Point FR : le coloris après le genre est coupé", () => {
    const e = title("Tennis Point FR", "adidas", "Vêtement de tennis adidas Club Jupe Femmes - bleu foncé, blanc");
    expect(value(e, "modele")).toBe("club");
    expect(value(e, "coloris")).toBeUndefined();
  });

  it("Sport 2000 : le vrai type est le dernier (« T-shirt … POLO ») et les sigles Nike sont lus", () => {
    const e = title("Sport 2000", "NIKE", "Vêtement de tennis NIKE T-shirt Homme M NKCT DF ADVTG POLO Blanc Homme");
    expect(e.familyKey).toBe("nike|polo|textile");
    expect(value(e, "genre")).toBe("homme");
    expect(value(e, "modele")).toBe("advantage");
  });

  it("Sport 2000 : la lettre M / W / G donne le genre quand il n'est pas écrit", () => {
    expect(value(title("Sport 2000", "NIKE", "Vêtement de tennis NIKE Jupe Femme W NKCT DF VCTRY SKRT FLOUNCY Rose"), "genre")).toBe("femme");
    const girl = title("Sport 2000", "NIKE", "Vêtement de tennis NIKE Jupe G NKCT DF VCTRY FLOUNCY SKRT Bleu");
    expect(value(girl, "genre")).toBe("femme");
    expect(value(girl, "age_group")).toBe("enfant");
  });

  it("Head : le nom de la gamme est en tête, le type suit", () => {
    const e = title("Head", "Head", "CLUB ORIGINAL Sweat à capuche zippé femme");
    expect(e.familyKey).toBe("head|sweat_capuche|textile");
    expect(value(e, "modele")).toBe("club original zippe");
  });

  it("garçon / fille : genre et âge enfant", () => {
    const e = title("Babolat", "Babolat", "Vêtement de tennis Babolat Play Crew Neck Tee Garçon");
    expect(value(e, "genre")).toBe("homme");
    expect(value(e, "age_group")).toBe("enfant");
  });

  it("junior sans genre : âge enfant, genre inconnu", () => {
    const e = title("Tennispro.fr", "Adidas", "Short de tennis Adidas Junior Club");
    expect(value(e, "age_group")).toBe("enfant");
    expect(value(e, "genre")).toBeUndefined();
  });

  it("marqueurs : millésime, numéro (chiffres romains compris), longueur, édition", () => {
    const club = title("Head", "Head", "CLUB 25 TECH T-shirt homme");
    expect(value(club, "millesime")).toBe(2025);
    expect(value(club, "modele")).toBe("club tech");
    const tieBreak = title("Tennis Point FR", "Head", "Vêtement de tennis HEAD Tie-Break II T-shirt Femmes - abricot, blanc");
    expect(value(tieBreak, "numero")).toBe(2);
    expect(value(tieBreak, "modele")).toBe("tie break");
    const roman = title("Tennis Point FR", "Lotto", "Vêtement de tennis Lotto Squadra III Jupe Femmes-Bleu");
    const digit = title("SportSystem", "Lotto", "Jupe de tennis Lotto Jupe de tennis femme Lotto Squadra 3 Femme");
    expect(value(roman, "numero")).toBe(3);
    expect(value(digit, "numero")).toBe(3);
    const length = title("Tennis Point FR", "Nike", "Vêtement de tennis Nike Court Advantage 7in Shorts Hommes-noir");
    expect(value(length, "longueur")).toBe(7);
    const edition = title("SportSystem", "Adidas", "Polo de tennis Adidas Polo tennis Adidas Freelift Pro RG Homme");
    expect(value(edition, "edition")).toBe("rg");
    expect(value(edition, "modele")).toBe("freelift pro");
  });

  it("Nike / adidas : un chiffre seul dans un short est une longueur en pouces", () => {
    expect(value(title("SportSystem", "Nike", "Short de tennis Nike Short tennis Dri-Fit NikeCourt 9 Victory Homme"), "longueur")).toBe(9);
    expect(value(title("SportSystem", "Adidas", "Short de tennis Adidas Short Ergo 7 PrimeBlue Homme"), "longueur")).toBe(7);
  });

  it("lot : « Pack de 3 » est un lot, retiré du nom", () => {
    const e = title("Tennis Point FR", "Nike", "Vêtement de tennis Nike Essential Cotton Stretch Trunk Caleçon Pack de 3 Hommes - noir, orange");
    expect(value(e, "lot")).toBe(3);
    expect(value(e, "modele")).toBe("essential cotton stretch trunk");
  });

  it("« Cap Sleeve » n'est pas une casquette", () => {
    const e = title("Babolat", "Babolat", "Vêtement de tennis Babolat Play Cap Sleeve Top Femme");
    expect(e.familyKey).toBe("babolat|tshirt|textile");
    expect(value(e, "modele")).toBe("play capsleeve");
  });

  it("un mot faible d'un autre type reste dans le nom (« Top Ten » d'un polo)", () => {
    const e = title("SportSystem", "Lotto", "Polo de tennis Lotto Polo tennis Top Ten 3 Homme");
    expect(e.familyKey).toBe("lotto|polo|textile");
    expect(value(e, "modele")).toBe("top ten");
  });

  it("« Tecnifibre Tech » de SportSystem est le tissu, pas la gamme", () => {
    const ss = title("SportSystem", "Tecnifibre", "Polo de tennis Tecnifibre Polo waffle homme Tecnifibre Tech bleu marine Homme");
    const site = title("Tecnifibre", "Tecnifibre", "Polo de tennis Tecnifibre Polo Waffle Homme Marine");
    expect(value(ss, "modele")).toBe("waffle");
    expect(value(site, "modele")).toBe("waffle");
    expect(compare(ss, site).niveau).toBe("identique");
  });

  it("type ou marque illisible : offre non reconnue, jamais rapprochée par le titre", () => {
    const noType = title("Head", "Head", "VISION Bonnet");
    expect(noType.familyKey).toBeNull();
    expect(noType.nonReconnu?.reason).toBe("famille_inconnue");
    expect(noType.nonReconnu?.termes).toContain("bonnet");
    const noBrand = extractOfferAttributes({ marchand: "SportSystem", titre: "T-shirt de tennis", marque: "SPORTSYSTEM", categorie: "textile" });
    expect(noBrand.nonReconnu?.reason).toBe("marque_inconnue");
  });
});

describe("verdicts de l'étape 2", () => {
  const headClub = (marchand: string, titre: string) => title(marchand, "Head", titre);

  it("modèle sans nom lisible : jamais « identique » (le modèle n'est pas identifié)", () => {
    const a = title("Tennis Point FR", "Lacoste", "Vêtement de tennis Lacoste T-shirt Hommes - abricot, orange");
    const b = title("Tennis Point FR", "Lacoste", "Vêtement de tennis Lacoste T-shirt Hommes - jaune lemon, vert");
    expect(value(a, "modele")).toBeUndefined();
    expect(compare(a, b).niveau).toBe("proche");
    expect(signature(a, "a")).not.toBe(signature(b, "b"));
  });

  it("mêmes marque, type, genre, âge et nom : identique, couleurs différentes ou non", () => {
    const a = headClub("Tennis Point FR", "Vêtement de tennis HEAD Power Shorts Hommes - bleu, blanc");
    const b = headClub("Tennis Point FR", "Vêtement de tennis HEAD Power Shorts Hommes-Noir");
    expect(compare(a, b).niveau).toBe("identique");
    expect(signature(a, "a")).toBe(signature(b, "b"));
  });

  it("genre ou âge différents : différent, toujours", () => {
    const homme = headClub("Tennis Point FR", "Vêtement de tennis HEAD Power Shorts Hommes - bleu");
    const femme = headClub("Tennis Point FR", "Vêtement de tennis HEAD Power Shorts Femmes - bleu");
    const garcon = headClub("Tennis Point FR", "Vêtement de tennis HEAD Power Shorts Garçons - bleu");
    expect(compare(homme, femme).niveau).toBe("different");
    expect(compare(homme, garcon).niveau).toBe("different");
  });

  it("genre écrit d'un seul côté : jamais identique", () => {
    const a = title("SportSystem", "Lacoste", "T-shirt de tennis Lacoste Tee-shirt Lacoste Sport Ultra Dry bleu clair");
    const b = title("SportSystem", "Lacoste", "T-shirt de tennis Lacoste Tee-shirt Lacoste Sport Ultra Dry bleu clair Homme");
    expect(compare(a, b).niveau).toBe("proche");
  });

  it("un lot n'est pas l'unité", () => {
    const one = title("Tennis Point FR", "Nike", "Vêtement de tennis Nike Essential Cotton Caleçon Hommes - noir");
    const three = title("Tennis Point FR", "Nike", "Vêtement de tennis Nike Essential Cotton Caleçon Pack de 3 Hommes - noir");
    expect(compare(one, three).niveau).toBe("different");
  });

  it("marques différentes : différent", () => {
    const a = title("Tennis Point FR", "Nike", "Vêtement de tennis Nike Club Jupe Femmes - blanc");
    const b = title("Tennis Point FR", "adidas", "Vêtement de tennis adidas Club Jupe Femmes - blanc");
    expect(compare(a, b).niveau).toBe("different");
  });
});

describe("regroupement en modèles (textile)", () => {
  const offers: EngineOffer[] = (
    [
      ["1", "Tennis Point FR", "adidas", "Vêtement de tennis adidas Club Jupe Femmes - blanc"],
      ["2", "Tennis Point FR", "adidas", "Vêtement de tennis adidas Club Jupe Femmes-noir"],
      ["3", "Tennispro.fr", "Adidas", "Jupe de tennis Adidas Femme Club"],
      ["4", "Tennis Point FR", "adidas", "Vêtement de tennis adidas Club Pleat Jupe Femmes - noir"],
      ["5", "Tennis Point FR", "Head", "Vêtement de tennis HEAD Tie-Break T-shirt Femmes - bleu clair, blanc"],
      ["6", "Tennis Point FR", "Head", "Vêtement de tennis HEAD Tie-Break II T-shirt Femmes - abricot, blanc"],
    ] as const
  ).map(([dealId, marchand, marque, titre]) => ({
    dealId,
    marchand,
    statut: "active",
    titre,
    extracted: title(marchand, marque, titre),
  }));
  const result = buildModels(offers);
  const modelOf = (id: string) => result.links.get(id)?.modelIndex;

  it("regroupe les couleurs d'un même marchand et les marchands entre eux", () => {
    expect(modelOf("1")).toBe(modelOf("2"));
    expect(modelOf("1")).toBe(modelOf("3"));
  });

  it("ne regroupe ni le sous-modèle ni la génération suivante", () => {
    expect(modelOf("4")).not.toBe(modelOf("1"));
    expect(modelOf("6")).not.toBe(modelOf("5"));
  });

  it("aucun conflit ni modèle incohérent", () => {
    expect(result.conflicts).toEqual([]);
    expect(result.incoherent).toEqual([]);
    expect(result.divergences).toEqual([]);
  });
});
