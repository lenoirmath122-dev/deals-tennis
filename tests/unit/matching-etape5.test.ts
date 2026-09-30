import { describe, expect, it } from "vitest";
import { compare, signature } from "@/lib/matching/compare";
import { extractOfferAttributes, type ExtractedOffer, type OfferInput } from "@/lib/matching";

// R4.5, étape 5 (D-2026-09-30-07) : corrections d'extraction, une paire piège par correction.
// Cadrage : `R4_5_etape5_corrections.md` (§2 corrections A1 à A10, §3 règles B1 à B8).

type Extra = Partial<Pick<OfferInput, "merchant_sku" | "mpn" | "raw_attributes" | "subcategory">>;

const extract = (categorie: OfferInput["categorie"], marchand: string, marque: string, titre: string, extra: Extra = {}): ExtractedOffer =>
  extractOfferAttributes({ marchand, titre, marque, categorie, ...extra });

const racket = (marque: string, titre: string, marchand = "Test") => extract("raquettes", marchand, marque, titre);
const shoe = (marque: string, titre: string, marchand = "Test") => extract("chaussures", marchand, marque, titre);
const bag = (marque: string, titre: string, marchand = "Test") => extract("accessoires", marchand, marque, titre, { subcategory: "sacs" });
const textile = (marque: string, titre: string, marchand = "Test") => extract("textile", marchand, marque, titre);

const value = (offer: ExtractedOffer, name: string) => offer.attributes[name]?.value;
const niveau = (a: ExtractedOffer, b: ExtractedOffer) => compare(a, b).niveau;

describe("A1 : « Pure Drive + » n'est pas identique à « Pure Drive » (C-Q3 ne lève pas la longueur écrite)", () => {
  it("« Pure Drive + Gen11 » / « Pure Drive Gen11 » (sans référence) : proche", () => {
    const plus = racket("Babolat", "Raquette de tennis Babolat Pure Drive + Gen11");
    const standard = racket("Babolat", "Raquette de tennis Babolat Pure Drive Gen11");
    expect(plus.attributes.longueur).toEqual({ value: 27.5, source: "titre_marqueur" });
    const result = compare(plus, standard);
    expect(result.niveau).toBe("proche");
    expect(result.differences.map((d) => d.attribut)).toEqual(["longueur"]);
    expect(signature(plus, "a")).not.toBe(signature(standard, "b"));
  });

  it("« Pure Drive + Gen11 » / « Pure Drive Gen11 Spectra » : proche aussi", () => {
    expect(niveau(racket("Babolat", "Babolat Pure Drive + Gen11"), racket("Babolat", "Babolat Pure Drive Gen11 Spectra"))).toBe("proche");
  });

  it("la levée C-Q3 reste valable pour une longueur lue sur la fiche du marchand", () => {
    const sheet = racket("Babolat", "Babolat Pure Drive 98 Gen11", "SportSystem");
    const withLength = extract("raquettes", "SportSystem", "Babolat", "Babolat Pure Drive 98 Gen11", {
      raw_attributes: { features: [{ name: "Longueur", value: "27 in. / 68.5 cm." }] },
    });
    expect(withLength.attributes.longueur.source).toBe("fiche_marchand");
    expect(niveau(sheet, withLength)).toBe("identique");
  });
});

describe("A2, B7 : collaborations et « Leather » des chaussures adidas", () => {
  it("« ASMC Barricade » / « Barricade » : différent", () => {
    const asmc = shoe("adidas", "Chaussures de tennis adidas ASMC Barricade Femme");
    expect(value(asmc, "edition")).toBe("ASMC");
    expect(niveau(asmc, shoe("adidas", "Chaussures de tennis adidas Barricade Femme"))).toBe("different");
  });

  it("« Y-3 Barricade 13 » / « Barricade 13 » : différent (Y-3 lu pour toutes les chaussures adidas)", () => {
    const y3 = shoe("adidas", "Chaussures de tennis adidas Y-3 Femme Barricade 13");
    expect(value(y3, "edition")).toBe("Y-3");
    expect(value(y3, "generation")).toBe("13");
    expect(niveau(y3, shoe("adidas", "Chaussures de tennis adidas Barricade 13 Femme"))).toBe("different");
  });

  it("le « 3 » de « Y-3 » n'est pas la génération 3 de l'Avacourt", () => {
    const y3 = shoe("adidas", "Chaussures de tennis adidas Y-3 Avacourt");
    expect(value(y3, "generation")).toBeUndefined();
    expect(niveau(y3, shoe("adidas", "Chaussures de tennis adidas Avacourt"))).toBe("different");
  });

  it("« Barricade 13 Leather » / « Barricade 13 » : proche (Q16)", () => {
    expect(niveau(shoe("adidas", "Chaussures adidas Barricade 13 Leather"), shoe("adidas", "Chaussures adidas Barricade 13"))).toBe("proche");
  });

  it("une édition de joueur reste une variante", () => {
    expect(niveau(shoe("adidas", "Chaussures adidas Barricade 13 Tsitsipas"), shoe("adidas", "Chaussures adidas Barricade 13"))).toBe("identique");
  });
});

describe("A3 : Head Sprint « 40 » et « 30 »", () => {
  it("« SPRINT COURT 40 JUNIOR » (Sport 2000) et « Sprint Court 4.0 » (Head) : génération 4.0 des deux côtés", () => {
    const sport2000 = shoe("Head", "SPRINT COURT 40 JUNIOR", "Sport 2000");
    const head = shoe("Head", "Head Sprint Court 4.0", "Head");
    expect(value(sport2000, "generation")).toBe("4.0");
    expect(value(head, "generation")).toBe("4.0");
    expect(value(shoe("Head", "SPRINT TEAM 30", "Sport 2000"), "generation")).toBe("3.0");
    expect(niveau(shoe("Head", "SPRINT TEAM 40", "Sport 2000"), shoe("Head", "SPRINT TEAM 30", "Sport 2000"))).toBe("different");
  });
});

describe("A4 : Radical « Palm Tree » = génération 2025", () => {
  const palmTree = racket("Head", "Head Radical MP Palm Tree");
  it("« Radical MP Palm Tree » / « Radical MP 2023 » : différent", () => {
    expect(niveau(palmTree, racket("Head", "Head Radical MP 2023"))).toBe("different");
  });
  it("« Radical MP Palm Tree » / « Radical MP 2025 » : identique", () => {
    expect(value(palmTree, "annee")).toBe(2025);
    expect(niveau(palmTree, racket("Head", "Head Radical MP 2025"))).toBe("identique");
    expect(niveau(racket("Head", "Head Radical MP Palm Tree Crew"), racket("Head", "Head Radical MP 2025"))).toBe("identique");
  });
});

describe("A5 : ordre des mots du nom de modèle textile", () => {
  it("« BREAK II TIE- » (Head) / « Tie-Break II » : identique", () => {
    const head = textile("Head", "BREAK II TIE- T-shirt femme", "Head");
    const other = textile("Head", "Tie-Break II T-shirt Femmes", "Tennis Point FR");
    expect(value(head, "numero")).toBe(2);
    expect(value(other, "numero")).toBe(2);
    expect(niveau(head, other)).toBe("identique");
    expect(signature(head, "a")).toBe(signature(other, "b"));
  });
  it("deux modèles aux mots différents restent distincts", () => {
    expect(niveau(textile("Head", "Tie-Break T-shirt Femmes"), textile("Head", "Club T-shirt Femmes"))).not.toBe("identique");
  });
});

describe("A6 : chiffres romains et arabes", () => {
  it("« Tech IV 7in » / « Tech 4 » (Lotto) : indéterminé, par la longueur écrite d'un seul côté (D-2026-09-30-08, réponse 4)", () => {
    const roman = textile("Lotto", "Short de tennis Lotto Tech IV 7in Homme");
    const arabic = textile("Lotto", "Short de tennis Lotto Tech 4 Homme");
    expect(value(roman, "numero")).toBe(4);
    expect(value(arabic, "numero")).toBe(4);
    expect(niveau(roman, arabic)).toBe("indetermine");
  });
});

describe("A7 : RG = Paris", () => {
  it("« RG Pro Jupe » / « Pro Paris » : plus « différent » par l'édition", () => {
    const rg = textile("Lacoste", "Jupe de tennis Lacoste RG Pro Femme");
    const paris = textile("Lacoste", "Jupe de tennis Lacoste Pro Paris Femme");
    expect(value(rg, "edition")).toBe("rg");
    expect(value(paris, "edition")).toBe("rg");
    expect(niveau(rg, paris)).toBe("identique");
  });
});

describe("A8 : « 3 Bandes » = 3-Stripes", () => {
  it("« Club 3 Bandes » (Tennispro.fr) / « Club 3S » : sous-gamme 3stripes des deux côtés", () => {
    const bandes = textile("adidas", "Tee-shirt Garçon adidas Club 3 Bandes", "Tennispro.fr");
    const trois = textile("adidas", "Tee-shirt Garçon adidas Club 3S", "Tennis Point FR");
    expect(value(bandes, "sous_gamme")).toBe("3stripes");
    expect(value(trois, "sous_gamme")).toBe("3stripes");
    expect(value(bandes, "numero")).toBeUndefined();
    expect(value(bandes, "modele")).toBe("club");
    expect(niveau(bandes, trois)).toBe("identique");
  });
});

describe("A9 : débardeur Tecnifibre", () => {
  it("« T-shirt de tennis Tecnifibre Team Tank-top » est un débardeur", () => {
    const tank = textile("Tecnifibre", "T-shirt de tennis Tecnifibre Team Tank-top Femme", "Tecnifibre");
    expect(tank.familyKey).toBe("tecnifibre|debardeur|textile");
    expect(value(tank, "modele")).toBe("team");
  });
  it("un t-shirt Tecnifibre reste un t-shirt", () => {
    expect(textile("Tecnifibre", "T-shirt de tennis Tecnifibre Team Tee Homme", "Tecnifibre").familyKey).toBe("tecnifibre|tshirt|textile");
  });
});

describe("A10 : l'alias n'avale plus la version", () => {
  it("sacs Babolat Pure : « RH12 Pure Aero » / « Pure Drive Rh12 » : différent (Q19)", () => {
    const aero = bag("Babolat", "Sac de tennis Babolat RH12 Pure Aero");
    const drive = bag("Babolat", "Sac de tennis Babolat Pure Drive Rh12");
    expect(value(aero, "version")).toBe("Aero");
    expect(value(drive, "version")).toBe("Drive");
    expect(niveau(aero, drive)).toBe("different");
  });
  it("le même sac reste identique à lui-même quand la collection est écrite des deux côtés", () => {
    const a = bag("Babolat", "Sac de tennis Babolat RH12 Pure Aero 2023");
    const b = bag("Babolat", "Babolat Pure Aero RH12 2023");
    expect(niveau(a, b)).toBe("identique");
  });
  it("T-Fight junior : « T-Fight Tour 26 » / « T-Fight Team 26 » : différent", () => {
    const tour = racket("Tecnifibre", "Raquette de tennis Tecnifibre T-Fight Tour 26");
    const team = racket("Tecnifibre", "Raquette de tennis Tecnifibre T-Fight Team 26");
    expect(value(tour, "version")).toBe("Tour");
    expect(value(team, "version")).toBe("Team");
    expect(niveau(tour, team)).toBe("different");
  });
  it("la version d'un antivibrateur reste « proche » (« S Logo Damp »)", () => {
    const damp = extract("accessoires", "Test", "Tecnifibre", "Antivibrateur Tecnifibre Logo Damp", { subcategory: "antivibrateurs" });
    const small = extract("accessoires", "Test", "Tecnifibre", "Antivibrateur Tecnifibre S Logo Damp", { subcategory: "antivibrateurs" });
    expect(niveau(damp, small)).toBe("proche");
  });
});

describe("B1 : taille d'une raquette junior lue comme longueur", () => {
  it("« Speed Jr.25 » (Head) / « Junior IG Speed 21 » (Tennispro.fr) : proche", () => {
    const jr = racket("Head", "Head Speed Jr.25", "Head");
    const ig = racket("Head", "Head Junior IG Speed 21", "Tennispro.fr");
    expect(jr.attributes.longueur).toEqual({ value: 25, source: "titre_marqueur" });
    expect(ig.attributes.longueur).toEqual({ value: 21, source: "titre_marqueur" });
    expect(niveau(jr, ig)).toBe("proche");
  });
  it("« Speed Jr.25 » / une Speed junior sans taille écrite : proche, C-Q3 ne lève pas la taille", () => {
    const jr = racket("Head", "Head Speed Jr.25 2026");
    const sans = racket("Head", "Head Speed Junior 2026");
    expect(value(jr, "generation")).toBe("2026");
    expect(value(sans, "generation")).toBe("2026");
    expect(niveau(jr, sans)).toBe("proche");
  });
  it("même taille des deux côtés : identique", () => {
    expect(niveau(racket("Head", "Head Speed Jr.25 2026"), racket("Head", "Head Junior Speed 25 2026"))).toBe("identique");
  });
  it("« Boom Jr.25 » : taille lue, collée à « Jr. »", () => {
    expect(value(racket("Head", "Head Boom Jr.25"), "longueur")).toBe(25);
    expect(value(racket("Head", "Head Boom Jr. 25"), "longueur")).toBe(25);
  });
  it("Drive Junior, Carlitos Junior : la taille est la longueur, plus une version", () => {
    for (const [titre, taille] of [["Babolat Drive Junior 25", 25], ["Babolat Carlitos Junior 19", 19]] as const) {
      const r = racket("Babolat", titre);
      expect(value(r, "longueur")).toBe(taille);
      expect(value(r, "version")).toBeUndefined();
    }
    expect(niveau(racket("Babolat", "Babolat Drive Junior 23"), racket("Babolat", "Babolat Drive Junior 25"))).toBe("proche");
  });
  it("T-Fight junior : Club 17, Club 25 = proche ; la version reste Club / Team / Tour", () => {
    const club17 = racket("Tecnifibre", "Tecnifibre T-Fight Club 17");
    expect(value(club17, "version")).toBe("Club");
    expect(value(club17, "longueur")).toBe(17);
    expect(niveau(club17, racket("Tecnifibre", "Tecnifibre T-Fight Club 25"))).toBe("proche");
  });
  it("une raquette adulte ne lit pas un nombre comme une taille", () => {
    expect(racket("Head", "Head Speed MP 2026").attributes.longueur).toBeUndefined();
    expect(racket("Head", "Head Speed MP 285 g 16x19 2026").attributes.longueur).toBeUndefined();
  });
  it("les tailles-versions des autres familles junior (Novak 19 / 25) restent différentes (R1 paire 11)", () => {
    expect(niveau(racket("Head", "Head Novak 19"), racket("Head", "Head Novak 25"))).toBe("different");
  });
});

describe("B2 : « Pure Drive Junior » à part de « Drive Junior »", () => {
  it("familles séparées", () => {
    const pure = racket("Babolat", "Babolat Pure Drive Junior 26 Gen11");
    const entry = racket("Babolat", "Babolat Drive Junior 25");
    expect(pure.famille).toBe("Pure Drive Junior");
    expect(entry.famille).toBe("Drive Junior");
    expect(niveau(pure, entry)).toBe("different");
    expect(value(pure, "longueur")).toBe(26);
    expect(value(pure, "generation")).toBe("Gen 11");
  });
});

describe("B3 : Extreme « MP UL » et « MP XL »", () => {
  it("versions distinctes de « MP »", () => {
    const ul = racket("Head", "Head Extreme MP UL 2024");
    const xl = racket("Head", "Head Extreme MP XL 2024");
    const mp = racket("Head", "Head Extreme MP 2024");
    expect(value(ul, "version")).toBe("MP UL");
    expect(value(xl, "version")).toBe("MP XL");
    expect(value(mp, "version")).toBe("MP");
    expect(niveau(ul, mp)).toBe("different");
    expect(niveau(xl, mp)).toBe("different");
    expect(niveau(ul, xl)).toBe("different");
  });
});

describe("B4, B5 : taille et types de sac", () => {
  it("« Base L » / « Racquet Base S » : différent", () => {
    const l = bag("Head", "Sac de tennis Head Base L");
    const s = bag("Head", "Sac de tennis Head Racquet Base S");
    expect(value(l, "taille_sac")).toBe("l");
    expect(value(s, "taille_sac")).toBe("s");
    expect(niveau(l, s)).toBe("different");
  });
  it("la taille est distincte de la contenance : « Tour Racquet S 3 Raquettes »", () => {
    const s = bag("Head", "Sac Head Tour Racquet S 3 Raquettes");
    expect(value(s, "taille_sac")).toBe("s");
    expect(value(s, "contenance")).toBe("3 raquettes");
  });
  it("« 25 L » (litres) n'est pas la taille L", () => {
    const litres = bag("Head", "Sac à dos Head Tour 25 L");
    expect(value(litres, "contenance")).toBe("25 l");
    expect(value(litres, "taille_sac")).toBeUndefined();
  });
  it("« Pro X L » / « Pro X XL » : différent", () => {
    expect(niveau(bag("Head", "Sac Head Pro X L"), bag("Head", "Sac Head Pro X XL"))).toBe("different");
  });
  it("Babolat Court : la taille est lue une seule fois, « Evo Court L » = « Court L » (refus de Mathieu)", () => {
    const evo = bag("Babolat", "Sac Babolat Evo Court L");
    const court = bag("Babolat", "Sac Babolat Court L");
    expect(evo.famille).toBe(court.famille);
    expect(value(evo, "taille_sac")).toBe("l");
    expect(value(evo, "version")).toBeUndefined();
    expect(compare(evo, court).differences.some((d) => d.attribut === "famille")).toBe(false);
    expect(niveau(evo, bag("Babolat", "Sac Babolat Court M"))).toBe("different");
  });
  it("« Tour sac à chaussures » / « Tour Bag XL » : différent", () => {
    const chaussures = bag("Head", "Head Tour sac à chaussures");
    expect(value(chaussures, "type_sac")).toBe("sac_chaussures");
    expect(niveau(chaussures, bag("Head", "Head Tour Bag XL"))).toBe("different");
  });
  it("types de sac ajoutés", () => {
    const types: [string, string][] = [
      ["Head Tour Key Holder", "porte_cles"],
      ["Head Tour Gym sac", "gym"],
      ["Head Tour sac de voyage", "voyage"],
      ["Head Tour Court Bag", "court_bag"],
      ["Head Tour Sport Bag", "sport_bag"],
    ];
    for (const [titre, type] of types) expect(value(bag("Head", titre), "type_sac"), titre).toBe(type);
  });
  it("« Tour Endurance Backpack » / « Rackpack » (Tecnifibre) : différent", () => {
    const backpack = bag("Tecnifibre", "Sac Tecnifibre Tour Endurance Backpack");
    const rackpack = bag("Tecnifibre", "Sac Tecnifibre Tour Endurance Rackpack");
    expect(value(backpack, "type_sac")).toBe("sac_a_dos");
    expect(value(rackpack, "type_sac")).toBe("rackpack");
    expect(niveau(backpack, rackpack)).toBe("different");
  });
});

describe("B8 : longueur des shorts, toutes marques", () => {
  it("« Asics Match 7 », « Club 7 », « Flex 8.0 », « Hypercourt 8 », « Squadra 7 » : longueur, sans numéro", () => {
    const cases: [string, string, string, number][] = [
      ["Asics", "Short de tennis Asics Match 7 Homme", "match", 7],
      ["adidas", "Short de tennis adidas Club 7 Homme", "club", 7],
      ["Mizuno", "Short de tennis Mizuno Release Amplify 8 Homme", "release amplify", 8],
      ["Mizuno", "Short de tennis Mizuno Flex 8.0 Homme", "flex", 8],
      ["K-Swiss", "Short de tennis K-Swiss Hypercourt 8 Homme", "hypercourt", 8],
      ["Lotto", "Short de tennis Lotto Squadra 7 Homme", "squadra", 7],
    ];
    for (const [marque, titre, modele, longueur] of cases) {
      const e = textile(marque, titre);
      expect(value(e, "longueur"), titre).toBe(longueur);
      expect(value(e, "numero"), titre).toBeUndefined();
      expect(value(e, "modele"), titre).toBe(modele);
    }
  });
  it("les numéros 1 à 4 restent des numéros", () => {
    expect(value(textile("Lotto", "Short de tennis Lotto Tech 4 Homme"), "numero")).toBe(4);
    expect(value(textile("Lotto", "Short de tennis Lotto Squadra 3 Homme"), "numero")).toBe(3);
  });
  it("« Match 7 » / « Match 9 » : proche (longueur), plus une génération écrite d'un seul côté", () => {
    expect(niveau(textile("Asics", "Short de tennis Asics Match 7 Homme"), textile("Asics", "Short de tennis Asics Match 9 Homme"))).toBe("proche");
  });
});

describe("« Pat Patrouille » : lexique enfant du moteur", () => {
  it("un sac à dos Head « Pat Patrouille » est lu enfant", () => {
    expect(value(bag("Head", "Sac à dos Head Pat Patrouille"), "age_group")).toBe("enfant");
    expect(value(bag("Head", "Sac à dos Head Tour"), "age_group")).toBe("adulte");
  });
});
