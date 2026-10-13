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
  it("getFamilyOtherModels regroupe par génération, dédoublonne et écarte les non-générations", async () => {
    const own = { genre: { value: "homme" }, generation: { value: "5" } };
    const gen = (g: string, genre = "homme") => ({ genre: { value: genre }, generation: { value: g } });
    const fk = "Wilson|Rush|chaussures";
    vi.mocked(sql.query).mockResolvedValueOnce([
      { model_id: "m1", family_key: fk, canonical_attributes: gen("4.5"), own_attributes: own, id: "a", discounted_price: 90 },
      { model_id: "m1", family_key: fk, canonical_attributes: gen("4.5"), own_attributes: own, id: "b", discounted_price: 70 },
      { model_id: "m1b", family_key: fk, canonical_attributes: gen("4.5"), own_attributes: own, id: "b", discounted_price: 70 },
      { model_id: "m2", family_key: fk, canonical_attributes: gen("4.0"), own_attributes: own, id: "c", discounted_price: 50 },
      { model_id: "m3", family_key: fk, canonical_attributes: gen("4.5", "femme"), own_attributes: own, id: "d", discounted_price: 40 },
    ] as never);
    const out = await getFamilyOtherModels(RUN, "deal-1");
    expect(out.map((m) => [m.modelId, m.label, m.offers.map((o) => o.id)])).toEqual([
      ["m1", "Wilson Rush, génération 4.5", ["b", "a"]],
      ["m2", "Wilson Rush, génération 4.0", ["c"]],
    ]);
  });
});

describe("isOtherGeneration / generationLabel", () => {
  const base = { genre: { value: "femme" }, age_group: { value: "adulte" } };
  const an = (n: number) => ({ annee: { value: n } });
  const g = (v: string) => ({ generation: { value: v } });
  it("exige une génération différente connue des deux côtés et le reste identique", () => {
    expect(isOtherGeneration({ ...base, ...an(2024) }, { ...base, ...an(2023) })).toBe(true);
    expect(isOtherGeneration({ ...base, ...an(2024) }, { ...base, ...an(2024) })).toBe(false);
    expect(
      isOtherGeneration({ ...base, ...an(2024) }, { ...base, ...an(2023), version: { value: "Lite" } })
    ).toBe(false);
    expect(isOtherGeneration(base, { ...base, modele: { value: "crew" } })).toBe(false);
    expect(isOtherGeneration({ ...base, ...g("4.5") }, { ...base, ...g("5") })).toBe(true);
  });
  it("une génération absente d'un côté ou de nature différente n'est pas une preuve", () => {
    expect(isOtherGeneration(base, { ...base, ...g("5") })).toBe(false);
    expect(isOtherGeneration({ ...base, ...an(2025), ...g("2025") }, { ...base, ...g("3") })).toBe(false);
    expect(isOtherGeneration({ ...base, ...g("2021") }, { ...base, ...g("2021 (Graphene 360+)") })).toBe(false);
  });
  it("édition et millésime sont des variantes, pas des générations", () => {
    const ed = (v: string) => ({ edition: { value: v } });
    expect(isOtherGeneration({ ...base, ...ed("rg") }, { ...base, ...ed("new york") })).toBe(false);
    expect(isOtherGeneration(base, { ...base, ...ed("alcaraz") })).toBe(false);
    expect(
      isOtherGeneration({ ...base, millesime: { value: 2024 } }, { ...base, millesime: { value: 2025 } })
    ).toBe(false);
  });
  it("libelle la génération", () => {
    expect(generationLabel({ generation: { value: "5" }, annee: { value: 2026 } })).toBe("5");
    expect(generationLabel({ annee: { value: 2023 } })).toBe("2023");
    expect(generationLabel({ edition: { value: "rg" } })).toBeNull();
  });
});
