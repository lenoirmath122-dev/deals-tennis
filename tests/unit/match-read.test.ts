import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({ sql: { query: vi.fn() } }));

import {
  generationLabel,
  getMatchRunId,
  getFamilyOtherModels,
  getModelOffers,
  isOtherGeneration,
} from "@/lib/match-read";
import { sql } from "@/lib/db";

const RUN = "f07bcbab-8f53-4820-ad4d-1aec9eed6759";
const env = (o: Record<string, string>) => o as unknown as NodeJS.ProcessEnv;

describe("getMatchRunId", () => {
  it("est null par défaut (flag désactivé)", () => {
    expect(getMatchRunId(env({}))).toBeNull();
    expect(getMatchRunId(env({ MATCH_RUN_ID: RUN }))).toBeNull();
  });
  it("est null si le flag est actif sans identifiant valide", () => {
    expect(getMatchRunId(env({ MATCH_DISPLAY_ENABLED: "true" }))).toBeNull();
    expect(getMatchRunId(env({ MATCH_DISPLAY_ENABLED: "true", MATCH_RUN_ID: "latest" }))).toBeNull();
  });
  it("retourne l'identifiant quand flag actif et UUID valide", () => {
    expect(getMatchRunId(env({ MATCH_DISPLAY_ENABLED: "true", MATCH_RUN_ID: ` ${RUN} ` }))).toBe(RUN);
  });
});

describe("requêtes", () => {
  it("getModelOffers passe passage et offre en paramètres", async () => {
    vi.mocked(sql.query).mockResolvedValueOnce([{ id: "a" }] as never);
    const out = await getModelOffers(RUN, "deal-1");
    expect(out).toEqual([{ id: "a" }]);
    expect(vi.mocked(sql.query).mock.calls[0][1]).toEqual([RUN, "deal-1"]);
  });
  it("getFamilyOtherModels regroupe les offres par modèle et écarte les non-générations", async () => {
    const own = { genre: { value: "homme" }, generation: { value: "Gen 9" } };
    const gen = (g: string, genre = "homme") => ({
      genre: { value: genre },
      generation: { value: g },
    });
    vi.mocked(sql.query).mockResolvedValueOnce([
      { model_id: "m1", canonical_attributes: gen("Gen 8"), own_attributes: own, id: "a" },
      { model_id: "m1", canonical_attributes: gen("Gen 8"), own_attributes: own, id: "b" },
      { model_id: "m2", canonical_attributes: gen("Gen 7"), own_attributes: own, id: "c" },
      { model_id: "m3", canonical_attributes: gen("Gen 8", "femme"), own_attributes: own, id: "d" },
    ] as never);
    const out = await getFamilyOtherModels(RUN, "deal-1");
    expect(out.map((m) => [m.modelId, m.offers.length])).toEqual([["m1", 2], ["m2", 1]]);
    expect(out[0].offers[0]).toEqual({ id: "a" });
  });
});

describe("isOtherGeneration / generationLabel", () => {
  const base = { genre: { value: "femme" }, age_group: { value: "adulte" } };
  const an = (n: number) => ({ annee: { value: n } });
  it("exige une génération différente et le reste identique", () => {
    expect(isOtherGeneration({ ...base, ...an(2024) }, { ...base, ...an(2023) })).toBe(true);
    expect(isOtherGeneration({ ...base, ...an(2024) }, { ...base, ...an(2024) })).toBe(false);
    expect(
      isOtherGeneration({ ...base, ...an(2024) }, { ...base, ...an(2023), version: { value: "Lite" } })
    ).toBe(false);
    expect(isOtherGeneration(base, { ...base, modele: { value: "crew" } })).toBe(false);
  });
  it("libelle la génération", () => {
    expect(generationLabel({ generation: { value: "Gen 9" }, annee: { value: 2026 } })).toBe("Gen 9");
    expect(generationLabel({ annee: { value: 2023 } })).toBe("2023");
    expect(generationLabel({ genre: { value: "homme" } })).toBeNull();
  });
});
