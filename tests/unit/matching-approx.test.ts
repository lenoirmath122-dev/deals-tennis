import { describe, expect, it } from "vitest";
import { scoreModelNames, reviewTextilePairs } from "@/lib/matching/approx";
import { buildReport } from "@/lib/matching/report";
import { buildModels, type EngineOffer } from "@/lib/matching/cluster";
import { extractOfferAttributes } from "@/lib/matching";

// Étape 3 du textile (R4.5-b) : score et file de revue, sans aucune fusion (T-Q4).

let n = 0;
const offer = (marchand: string, marque: string, titre: string, prixOrigine: number | null = null): EngineOffer => ({
  dealId: `00000000-0000-0000-0000-${String(++n).padStart(12, "0")}`,
  marchand,
  statut: "active",
  titre,
  prixOrigine,
  extracted: extractOfferAttributes({ marchand, titre, marque, categorie: "textile" }),
});

const review = (offers: EngineOffer[]) => reviewTextilePairs(offers, buildModels(offers));

describe("scoreModelNames", () => {
  it("un mot distinctif connu (Pleat, Slam) fait tomber le score", () => {
    expect(scoreModelNames("club", "club pleat", null, null).score).toBeLessThan(0.2);
    expect(scoreModelNames("advantage", "advantage slam", null, null).score).toBeLessThan(0.2);
  });

  it("un mot en plus inconnu d'un seul côté donne un score moyen", () => {
    const { score, motsEnPlus } = scoreModelNames("club", "club tech", null, null);
    expect(score).toBe(0.5);
    expect(motsEnPlus).toEqual(["tech"]);
  });

  it("le prix d'origine n'est qu'un indice (T-Q5) : ±, jamais éliminatoire", () => {
    const base = scoreModelNames("club", "club tech", null, null).score;
    expect(scoreModelNames("club", "club tech", 40, 40).score).toBeGreaterThan(base);
    const far = scoreModelNames("club", "club tech", 20, 45).score;
    expect(far).toBeLessThan(base);
    expect(far).toBeGreaterThan(0);
  });

  it("aucun mot commun : score nul", () => {
    expect(scoreModelNames("santana", "shiva", null, null).score).toBe(0);
  });
});

describe("file de revue textile", () => {
  it("Club / Club Tech (Head) entre dans la file et n'est pas fusionné", () => {
    const offers = [
      offer("Tennis Point FR", "HEAD", "Vêtement de tennis HEAD Club T-shirt Hommes-blanc", 45),
      offer("SportSystem", "Head", "T-shirt de tennis Head Tee-shirt de tennis homme Head Club Tech rouge Homme", 40),
    ];
    const result = buildModels(offers);
    expect(result.models).toHaveLength(2);
    expect([...result.links.values()].every((l) => l.score === 1)).toBe(true);
    const pairs = reviewTextilePairs(offers, result);
    expect(pairs).toHaveLength(1);
    expect(pairs[0].motsEnPlus).toEqual(["tech"]);
  });

  it("Club / Club Pleat (mot distinctif) n'entre pas dans la file", () => {
    const offers = [
      offer("Tennispro.fr", "Adidas", "Jupe de tennis Adidas Femme Club", 40),
      offer("Tennis Point FR", "adidas", "Vêtement de tennis adidas Club Pleat Jupe Femmes - noir", 50),
    ];
    expect(review(offers)).toHaveLength(0);
  });

  it("genre ou type différents : jamais dans la file", () => {
    const offers = [
      offer("Tennis Point FR", "HEAD", "Vêtement de tennis HEAD Club T-shirt Hommes-blanc"),
      offer("SportSystem", "Head", "T-shirt de tennis Head Tee-shirt de tennis femme Head Club Tech Femme"),
      offer("SportSystem", "Head", "Short de tennis Head Short de tennis homme Head Club Tech Homme"),
    ];
    expect(review(offers)).toHaveLength(0);
  });

  it("deux modèles d'un seul et même marchand ne sont pas proposés", () => {
    const offers = [
      offer("Tennis Point FR", "HEAD", "Vêtement de tennis HEAD Club T-shirt Hommes-blanc"),
      offer("Tennis Point FR", "HEAD", "Vêtement de tennis HEAD Club Tech T-shirt Hommes-blanc"),
    ];
    expect(review(offers)).toHaveLength(0);
  });

  it("le rapport publie revue-textile.csv, triée par score décroissant", () => {
    const offers = [
      offer("Tennis Point FR", "HEAD", "Vêtement de tennis HEAD Club T-shirt Hommes-blanc"),
      offer("SportSystem", "Head", "T-shirt de tennis Head Tee-shirt de tennis homme Head Club Tech rouge Homme"),
    ];
    const report = buildReport({ engineVersion: "test", offers, unsupported: [], result: buildModels(offers), brandOf: () => "Head" });
    const lines = report.csv.revueTextile.trim().split("\n");
    expect(lines[0].startsWith("score;famille")).toBe(true);
    expect(lines).toHaveLength(2);
    expect(report.counters.revue_textile_paires).toBe(1);
  });
});

describe("Tie Break II (D-2026-09-29-05)", () => {
  it("« TIE-BREAK » / « BREAK II TIE- » : autre génération, refusée avant la file de revue", () => {
    const offers = [
      offer("Tennis Point FR", "Head", "Vêtement de tennis HEAD Tie-Break T-shirt Femmes - bleu clair, blanc"),
      offer("Head", "Head", "BREAK II TIE- T-shirt de tennis femme"),
    ];
    expect(review(offers)).toEqual([]);
  });
});
