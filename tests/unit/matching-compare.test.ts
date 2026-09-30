import { describe, expect, it } from "vitest";
import { compare, normalizeReference, signature } from "@/lib/matching/compare";
import { buildModels, type EngineOffer } from "@/lib/matching/cluster";
import type { ExtractedOffer } from "@/lib/matching";
import type { AttributeSource } from "@/lib/matching/types";

// R4.4 : comparaison, signature et regroupement. Les offres sont construites à la main
// (sans passer par le référentiel) pour tester la logique de comparaison seule ; la
// mesure sur les vrais titres est dans `r4-4-mesure-r1.test.ts`.

type AttrInput = Record<string, string | number | boolean>;

function offer(
  categorie: ExtractedOffer["categorie"],
  familyKey: string | null,
  attrs: AttrInput = {},
  extra: Partial<ExtractedOffer> = {},
): ExtractedOffer {
  const attributes: ExtractedOffer["attributes"] = {};
  for (const [name, value] of Object.entries(attrs)) {
    attributes[name] = { value, source: "titre_description" as AttributeSource };
  }
  return {
    categorie,
    marque: familyKey ? familyKey.split("|")[0] : null,
    familyKey,
    famille: familyKey ? familyKey.split("|")[1] : null,
    subcategory: null,
    alias: null,
    attributes,
    gtin: null,
    referencesFabricant: [],
    nonReconnu: null,
    alertes: [],
    ...extra,
  };
}

const RACKET = "Babolat|Pure Drive|raquettes";
const racket = (attrs: AttrInput = {}, extra: Partial<ExtractedOffer> = {}) => offer("raquettes", RACKET, attrs, extra);
const STRING = "Luxilon|Alu Power|cordages";
const string = (attrs: AttrInput = {}, extra: Partial<ExtractedOffer> = {}) => offer("cordages", STRING, attrs, extra);

describe("étape 1 : GTIN et référence fabricant", () => {
  it("même GTIN = identique, même sans famille reconnue", () => {
    const a = offer("raquettes", null, {}, { gtin: "3324921234567", marque: "Head" });
    const b = offer("raquettes", null, {}, { gtin: "3324921234567", marque: "Head" });
    const result = compare(a, b);
    expect(result).toMatchObject({ niveau: "identique", methode: "gtin", conflit: false });
  });

  it("même GTIN mais familles différentes : conflit, jamais identique", () => {
    const a = racket({}, { gtin: "3324921234567" });
    const b = offer("raquettes", "Babolat|Pure Aero|raquettes", {}, { gtin: "3324921234567" });
    const result = compare(a, b);
    expect(result.conflit).toBe(true);
    expect(result.niveau).toBe("proche");
    expect(result.methode).toBeNull();
  });

  it("même GTIN mais tamis contradictoires : conflit", () => {
    const a = racket({ tamis: 98 }, { gtin: "3324921234567" });
    const b = racket({ tamis: 100 }, { gtin: "3324921234567" });
    expect(compare(a, b)).toMatchObject({ niveau: "proche", conflit: true, methode: null });
  });

  it("référence fabricant partagée (casse et séparateurs ignorés) = identique", () => {
    const a = racket({}, { referencesFabricant: [{ value: "101-474", source: "mpn" }] });
    const b = racket({}, { referencesFabricant: [{ value: "101474", source: "fiche_marchand" }] });
    expect(compare(a, b)).toMatchObject({ niveau: "identique", methode: "reference" });
  });

  it("une référence trop courte ou sans chiffre n'identifie rien", () => {
    expect(normalizeReference("A1")).toBeNull();
    expect(normalizeReference("ABCDEF")).toBeNull();
    expect(normalizeReference("ab-123-45")).toBe("AB12345");
  });

  it("catégories différentes : différent, même avec le même GTIN", () => {
    const a = racket({}, { gtin: "3324921234567" });
    const b = string({}, { gtin: "3324921234567" });
    expect(compare(a, b).niveau).toBe("different");
  });
});

describe("étape 2 : famille et attributs discriminants", () => {
  it("familles différentes : différent", () => {
    expect(compare(racket(), offer("raquettes", "Babolat|Pure Aero|raquettes")).niveau).toBe("different");
  });

  it("famille non reconnue sans identifiant : non comparable", () => {
    const result = compare(racket(), offer("raquettes", null));
    expect(result.comparable).toBe(false);
    expect(result.methode).toBeNull();
  });

  it("mêmes attributs et même génération : identique par signature", () => {
    const a = racket({ tamis: 100, poids: 300, generation: "Gen 11", annee: 2025 });
    const b = racket({ tamis: 100, poids: 300, generation: "Gen 11", annee: 2025 });
    expect(compare(a, b)).toMatchObject({ niveau: "identique", methode: "signature" });
  });

  it("caractéristique descriptive connue d'un seul côté : indéterminé, jamais identique (§3 : tamis)", () => {
    // Génération non écrite d'un côté : le blocage B (C-Q3) ne joue pas, le tamis reste bloquant.
    const a = racket({ tamis: 100, generation: "Gen 11", annee: 2025 });
    const b = racket({});
    const result = compare(a, b);
    expect(result.niveau).toBe("indetermine");
    expect(result.differences).toContainEqual({ attribut: "tamis", a: "100", b: null, effet: "inconnu" });
  });

  it("blocage B (C-Q3) : même génération des deux côtés, tamis / poids / plan connus d'un seul côté = identique", () => {
    const a = racket({ tamis: 100, poids: 300, plan_cordage: "16x19", generation: "Gen 11", annee: 2025 });
    const b = racket({ generation: "Gen 11", annee: 2025 });
    expect(compare(a, b)).toMatchObject({ niveau: "identique", methode: "signature", differences: [] });
  });

  it("blocage B : reste bloquant si connu des deux côtés et différent, ou si la version diffère", () => {
    const gen = { generation: "Gen 11", annee: 2025 };
    expect(compare(racket({ tamis: 98, ...gen }), racket({ tamis: 100, ...gen })).niveau).toBe("different");
    expect(compare(racket({ version: "Tour", ...gen }), racket({ ...gen })).niveau).not.toBe("identique");
  });

  it("attribut absent des deux côtés : traité comme égal", () => {
    const a = racket({ generation: "Gen 11", annee: 2025 });
    const b = racket({ generation: "Gen 11", annee: 2025 });
    expect(compare(a, b).niveau).toBe("identique");
  });

  it("poids : même = identique, ≤ 10 g = proche, > 10 g = différent", () => {
    const gen = { generation: "Gen 11", annee: 2025 };
    expect(compare(racket({ poids: 300, ...gen }), racket({ poids: 300, ...gen })).niveau).toBe("identique");
    expect(compare(racket({ poids: 300, ...gen }), racket({ poids: 305, ...gen })).niveau).toBe("proche");
    expect(compare(racket({ poids: 300, ...gen }), racket({ poids: 320, ...gen })).niveau).toBe("different");
  });

  it("tamis, version et âge : différent ; plan de cordage et longueur : proche", () => {
    const gen = { generation: "Gen 11", annee: 2025 };
    expect(compare(racket({ tamis: 98, ...gen }), racket({ tamis: 100, ...gen })).niveau).toBe("different");
    expect(compare(racket({ version: "Lite", ...gen }), racket({ version: "Tour", ...gen })).niveau).toBe("different");
    expect(compare(racket({ age_group: "adulte", ...gen }), racket({ age_group: "enfant", ...gen })).niveau).toBe("different");
    expect(compare(racket({ plan_cordage: "16x19", ...gen }), racket({ plan_cordage: "18x20", ...gen })).niveau).toBe("proche");
    expect(compare(racket({ longueur: 27, ...gen }), racket({ longueur: 27.5, ...gen })).niveau).toBe("proche");
  });

  it("attributs « variante » (cordée, édition, cadeau) : sans effet", () => {
    const gen = { generation: "Gen 11", annee: 2025 };
    const a = racket({ cordee: true, edition: "Wimbledon", cadeau: "sac offert", ...gen });
    const b = racket({ cordee: false, ...gen });
    expect(compare(a, b).niveau).toBe("identique");
  });

  it("lot : différent, l'absence valant 1 article", () => {
    const gen = { generation: "Gen 11", annee: 2025 };
    expect(compare(racket({ lot: 2, ...gen }), racket({ ...gen })).niveau).toBe("different");
    expect(compare(racket({ lot: 2, ...gen }), racket({ lot: 2, ...gen })).niveau).toBe("identique");
  });

  it("édition « Premium » des chaussures : proche face à une édition ordinaire ou absente", () => {
    const shoe = (attrs: AttrInput) => offer("chaussures", "Asics|Gel-Resolution|chaussures", { genre: "homme", generation: "9", ...attrs });
    expect(compare(shoe({ edition: "Premium" }), shoe({})).niveau).toBe("proche");
    expect(compare(shoe({ edition: "Premium" }), shoe({ edition: "Premium" })).niveau).toBe("identique");
    expect(compare(shoe({ edition: "Djokovic" }), shoe({})).niveau).toBe("identique");
  });
});

describe("règle des générations (R4-Q4)", () => {
  const known = { tamis: 100 };

  it("raquettes : génération non écrite des deux côtés = indéterminé (§3, génération)", () => {
    expect(compare(racket(known), racket(known)).niveau).toBe("indetermine");
  });

  it("chaussures et sacs : règle stricte aussi", () => {
    const shoe = () => offer("chaussures", "Babolat|SFX|chaussures", { genre: "homme" });
    const bag = () => offer("accessoires", "Babolat|Court|accessoires", { type: "sac" }, { subcategory: "sacs" });
    expect(compare(shoe(), shoe()).niveau).toBe("indetermine");
    expect(compare(bag(), bag()).niveau).toBe("indetermine");
  });

  it("cordages et accessoires hors sacs : génération unique par défaut, identique", () => {
    const attrs = { jauge: 1.25, conditionnement: "bobine", longueur: 200 };
    expect(compare(string(attrs), string(attrs)).niveau).toBe("identique");
    const grip = () => offer("accessoires", "Wilson|Pro Overgrip|accessoires", { type: "surgrip" }, { subcategory: "grips_surgrips" });
    expect(compare(grip(), grip()).niveau).toBe("identique");
  });

  it("génération connue d'un seul côté : indéterminé, même pour un cordage (§3, génération)", () => {
    const attrs = { jauge: 1.25, conditionnement: "bobine" };
    expect(compare(string({ ...attrs, generation: "Gen 2" }), string(attrs)).niveau).toBe("indetermine");
  });

  it("génération confirmée identique des deux côtés : identique", () => {
    const a = racket({ generation: "Gen 11", annee: 2025 });
    const b = racket({ generation: "V11", annee: 2025 });
    expect(compare(a, b).niveau).toBe("identique");
  });

  it("génération différente vérifiée des deux côtés : différent", () => {
    const a = racket({ generation: "Gen 11", annee: 2025 });
    const b = racket({ generation: "Gen 10", annee: 2023 });
    expect(compare(a, b).niveau).toBe("different");
  });

  it("une année face à un libellé sans année : inconclusif, indéterminé (§3, génération)", () => {
    const a = racket({ generation: "2025", annee: 2025 });
    const b = racket({ generation: "Gen 11" });
    expect(compare(a, b).niveau).toBe("indetermine");
  });
});

describe("cordages : attributs requis et garniture", () => {
  const gen = {};

  it("jauge absente des deux côtés : indéterminé (§3, attribut requis absent ; la jauge est un choix de la fiche, paire R1 25)", () => {
    const attrs = { conditionnement: "garniture", longueur: 12, ...gen };
    const result = compare(string(attrs), string(attrs));
    expect(result.niveau).toBe("indetermine");
    expect(result.differences[0]).toMatchObject({ attribut: "jauge", effet: "inconnu" });
  });

  it("garniture de 12 m et de 12,2 m : même garniture (paire R1 66)", () => {
    const a = string({ jauge: 1.25, conditionnement: "garniture", longueur: 12 });
    const b = string({ jauge: 1.25, conditionnement: "garniture", longueur: 12.2 });
    expect(compare(a, b).niveau).toBe("identique");
  });

  it("bobine de 200 m face à une garniture de 12 m : différent", () => {
    const a = string({ jauge: 1.25, conditionnement: "bobine", longueur: 200 });
    const b = string({ jauge: 1.25, conditionnement: "garniture", longueur: 12 });
    expect(compare(a, b).niveau).toBe("different");
  });

  it("jauges au choix : ne prouvent pas la même jauge", () => {
    const base = { conditionnement: "bobine", longueur: 200 };
    const a = string({ ...base, jauge: 1.25 }, { alertes: ["jauges_multiples"] });
    const b = string({ ...base, jauge: 1.25 });
    expect(compare(a, b).niveau).toBe("proche");
  });
});

describe("balles : nombre non écrit", () => {
  const balls = (attrs: AttrInput = {}) =>
    offer("accessoires", "Wilson|US Open|accessoires", { type: "balles", niveau: "standard", ...attrs }, { subcategory: "balles" });

  it("nombre de balles inconnu des deux côtés ou d'un seul : indéterminé (§3, lot)", () => {
    expect(compare(balls(), balls()).niveau).toBe("indetermine");
    expect(compare(balls({ lot: 3 }), balls()).niveau).toBe("indetermine");
  });

  it("même nombre = identique, nombre différent = différent", () => {
    expect(compare(balls({ lot: 3 }), balls({ lot: 3 })).niveau).toBe("identique");
    expect(compare(balls({ lot: 3 }), balls({ lot: 4 })).niveau).toBe("different");
  });
});

describe("cordages : version (C-Q1, D1)", () => {
  it("versions différentes (Blast / Soft) : différent", () => {
    const a = string({ version: "Rough", jauge: 1.25, conditionnement: "bobine", longueur: 220 });
    const b = string({ version: "Soft", jauge: 1.25, conditionnement: "bobine", longueur: 220 });
    expect(compare(a, b).niveau).toBe("different");
  });

  it("version écrite d'un seul côté : proche, jamais identique", () => {
    const a = string({ version: "Rough", jauge: 1.25, conditionnement: "bobine", longueur: 220 });
    const b = string({ jauge: 1.25, conditionnement: "bobine", longueur: 220 });
    expect(compare(a, b).niveau).toBe("proche");
  });
});

describe("signature", () => {
  it("nulle sans famille reconnue", () => {
    expect(signature(offer("raquettes", null), "d1")).toBeNull();
  });

  it("identique pour deux offres que compare() juge identiques à l'étape 2", () => {
    const a = racket({ tamis: 100, generation: "Gen 11", annee: 2025, cordee: true });
    const b = racket({ tamis: 100, generation: "Gen 11", annee: 2025 });
    expect(compare(a, b).methode).toBe("signature");
    expect(signature(a, "d1")).toBe(signature(b, "d2"));
  });

  it("une offre sans génération en catégorie stricte est seule de son modèle", () => {
    expect(signature(racket(), "d1")).not.toBe(signature(racket(), "d2"));
  });

  it("un cordage sans jauge est seul de son modèle", () => {
    expect(signature(string(), "d1")).not.toBe(signature(string(), "d2"));
  });
});

describe("regroupement en modèles", () => {
  const engine = (dealId: string, marchand: string, extracted: ExtractedOffer, statut = "active"): EngineOffer => ({
    dealId,
    marchand,
    statut,
    titre: dealId,
    extracted,
  });
  const gen = { generation: "Gen 11", annee: 2025 };

  it("réunit deux marchands de même signature", () => {
    const result = buildModels([
      engine("b", "Tennispro.fr", racket({ tamis: 100, ...gen })),
      engine("a", "SportSystem", racket({ tamis: 100, ...gen })),
    ]);
    expect(result.models).toHaveLength(1);
    expect(result.models[0].members).toEqual(["a", "b"]);
    expect(result.links.get("a")).toMatchObject({ method: "signature", score: 1 });
  });

  it("le GTIN réunit des offres de signatures différentes et prime dans la méthode", () => {
    const result = buildModels([
      engine("a", "SportSystem", racket({ tamis: 100, ...gen }, { gtin: "3324921234567" })),
      engine("b", "Tennis Point FR", racket({ tamis: 100 }, { gtin: "3324921234567" })),
    ]);
    expect(result.models).toHaveLength(1);
    expect(result.links.get("a")?.method).toBe("gtin");
    expect(result.links.get("b")?.method).toBe("gtin");
  });

  it("un GTIN partagé avec des familles différentes est un conflit : pas de fusion", () => {
    const result = buildModels([
      engine("a", "SportSystem", racket({ ...gen }, { gtin: "3324921234567" })),
      engine("b", "Tennispro.fr", offer("raquettes", "Babolat|Pure Aero|raquettes", { ...gen }, { gtin: "3324921234567" })),
    ]);
    expect(result.models).toHaveLength(2);
    expect(result.conflicts).toEqual([expect.objectContaining({ kind: "gtin", a: "a", b: "b" })]);
  });

  it("une offre sans famille reconnue et sans identifiant partagé n'a pas de modèle", () => {
    const result = buildModels([engine("a", "Head", offer("raquettes", null))]);
    expect(result.models).toHaveLength(0);
    expect(result.links.has("a")).toBe(false);
  });

  it("deux offres sans famille mais avec la même référence font un modèle", () => {
    const refs = { referencesFabricant: [{ value: "233612", source: "mpn" as AttributeSource }] };
    const result = buildModels([
      engine("a", "Head", offer("raquettes", null, {}, refs)),
      engine("b", "Tennispro.fr", offer("raquettes", null, {}, refs)),
    ]);
    expect(result.models).toHaveLength(1);
    expect(result.models[0].familyKey).toBeNull();
    expect(result.links.get("a")?.method).toBe("reference");
  });

  it("chaque offre de famille reconnue a un modèle, seule si besoin", () => {
    const result = buildModels([engine("a", "SportSystem", racket({ tamis: 100 }))]);
    expect(result.models).toHaveLength(1);
    expect(result.links.get("a")?.modelIndex).toBe(0);
  });

  it("déterministe : l'ordre d'entrée ne change pas les modèles", () => {
    const offers = [
      engine("c", "Head", racket({ tamis: 100, ...gen })),
      engine("a", "SportSystem", racket({ tamis: 100, ...gen })),
      engine("b", "Tennispro.fr", racket({ tamis: 98, ...gen })),
    ];
    const one = buildModels(offers);
    const two = buildModels([...offers].reverse());
    expect(two.models).toEqual(one.models);
  });

  it("blocage B : réunit deux raquettes dont une seule a le poids, mais pas si une troisième contredit", () => {
    const one = buildModels([
      engine("a", "M1", racket({ poids: 300, tamis: 100, ...gen })),
      engine("b", "M2", racket({ ...gen })),
    ]);
    expect(one.models).toHaveLength(1);
    // c (290 g) est « proche » de a (300 g) : b ne doit pas les relier.
    const three = buildModels([
      engine("a", "M1", racket({ poids: 300, ...gen })),
      engine("b", "M2", racket({ ...gen })),
      engine("c", "M3", racket({ poids: 290, ...gen })),
    ]);
    expect(three.models.length).toBeGreaterThan(1);
  });

  it("D5 : signale les modèles dont les membres ont des valeurs différentes pour un attribut", () => {
    const ref = { referencesFabricant: [{ value: "233612", source: "mpn" as AttributeSource }] };
    const result = buildModels([
      engine("a", "M1", racket({ version: "Tour", ...gen }, { gtin: "3324921234567" })),
      engine("b", "M2", racket({ ...gen }, { gtin: "3324921234567", ...ref })),
      engine("c", "M3", racket({ version: "Lite", ...gen }, ref)),
    ]);
    expect(result.divergences).toEqual([expect.objectContaining({ attribut: "version", valeurs: ["lite", "tour"] })]);
  });

  it("signale un modèle incohérent : deux identifiants réunissent deux offres qui se contredisent", () => {
    // a-b par GTIN, b-c par référence : a (tamis 98) et c (tamis 100) ne sont jamais comparées.
    const ref = { referencesFabricant: [{ value: "233612", source: "mpn" as AttributeSource }] };
    const result = buildModels([
      engine("a", "M1", racket({ tamis: 98, ...gen }, { gtin: "3324921234567" })),
      engine("b", "M2", racket({ ...gen }, { gtin: "3324921234567", ...ref })),
      engine("c", "M3", racket({ tamis: 100, ...gen }, ref)),
    ]);
    expect(result.models).toHaveLength(1);
    expect(result.incoherent).toEqual([expect.objectContaining({ a: "a", b: "c" })]);
  });
});
