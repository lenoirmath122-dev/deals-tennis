import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({ sql: { query: vi.fn() } }));

import { getMatchRunId, getFamilyOtherModels, getModelOffers } from "@/lib/match-read";
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
  it("getFamilyOtherModels regroupe les offres par modèle", async () => {
    vi.mocked(sql.query).mockResolvedValueOnce([
      { model_id: "m1", canonical_attributes: { annee: 2023 }, id: "a" },
      { model_id: "m1", canonical_attributes: { annee: 2023 }, id: "b" },
      { model_id: "m2", canonical_attributes: { annee: 2021 }, id: "c" },
    ] as never);
    const out = await getFamilyOtherModels(RUN, "deal-1");
    expect(out.map((m) => [m.modelId, m.offers.length])).toEqual([["m1", 2], ["m2", 1]]);
    expect(out[0].offers[0]).toEqual({ id: "a" });
  });
});
