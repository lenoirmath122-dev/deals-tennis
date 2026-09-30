/**
 * Rapport de passage du moteur en mode fantôme (R4-Q5), fonction pure : compteurs,
 * couverture publiée deux fois (R4-Q3), blocages du rappel, non-reconnus (GAP-2026-09-27-01),
 * conflits. Produit un objet de compteurs (`match_runs.counters`), un Markdown et des CSV.
 */

import { compare } from "./compare.ts";
import type { ClusterResult, EngineOffer } from "./cluster.ts";

export interface UnsupportedOffer {
  categorie: string;
  statut: string;
}

export interface ReportInput {
  engineVersion: string;
  offers: EngineOffer[];
  /** Offres d'une catégorie que l'extraction ne couvre pas encore (aucune depuis R4.5-a). */
  unsupported: UnsupportedOffer[];
  result: ClusterResult;
  /** Marque de chaque offre (pour les non-reconnus par marque). */
  brandOf: (dealId: string) => string;
}

export interface PassReport {
  counters: Record<string, unknown>;
  markdown: string;
  csv: { nonReconnus: string; proches: string; indetermines: string; conflits: string };
}

const PAIR_CAP_PER_FAMILY = 300;
const PROCHES_CSV_LIMIT = 5000;
const INDETERMINES_CSV_LIMIT = 5000;

function count<T>(items: T[], key: (item: T) => string): Record<string, number> {
  const out: Record<string, number> = {};
  for (const item of items) out[key(item)] = (out[key(item)] ?? 0) + 1;
  return out;
}

const pct = (n: number, d: number) => (d === 0 ? "n/a" : `${((100 * n) / d).toFixed(1)} %`);

function csvCell(value: unknown): string {
  const text = String(value ?? "");
  return /[",\n;]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}
const csv = (rows: unknown[][]) => rows.map((row) => row.map(csvCell).join(";")).join("\n") + "\n";

function table(headers: string[], rows: (string | number)[][]): string {
  const line = (cells: (string | number)[]) => `| ${cells.join(" | ")} |`;
  return [line(headers), line(headers.map(() => "---")), ...rows.map(line)].join("\n");
}

export function buildReport(input: ReportInput): PassReport {
  const { offers, unsupported, result } = input;
  const byId = new Map(offers.map((o) => [o.dealId, o]));

  // Reconnaissance.
  const recognized = offers.filter((o) => o.extracted.familyKey !== null);
  const notRecognized = offers.filter((o) => o.extracted.familyKey === null);
  const reasons = count(notRecognized, (o) => o.extracted.nonReconnu?.reason ?? "inconnu");
  const byCategory: Record<string, { lues: number; reconnues: number }> = {};
  for (const o of offers) {
    const c = (byCategory[o.extracted.categorie] ??= { lues: 0, reconnues: 0 });
    c.lues++;
    if (o.extracted.familyKey) c.reconnues++;
  }
  for (const u of unsupported) (byCategory[u.categorie] ??= { lues: 0, reconnues: 0 }).lues++;

  // Modèles et couverture.
  const merchantsOf = (members: string[], onlyActive: boolean) =>
    new Set(members.map((id) => byId.get(id)!).filter((o) => !onlyActive || o.statut === "active").map((o) => o.marchand));
  const multi = result.models.filter((m) => merchantsOf(m.members, false).size >= 2);
  const multiActive = result.models.filter((m) => merchantsOf(m.members, true).size >= 2);
  const linksByMethod = count([...result.links.values()], (l) => l.method);
  const multiByCategory = count(multi, (m) => m.category);

  // Plafond au niveau famille : familles présentes chez ≥ 2 marchands, et part qui a un modèle multi-marchands.
  const families = new Map<string, EngineOffer[]>();
  for (const o of recognized) {
    const list = families.get(o.extracted.familyKey!) ?? [];
    list.push(o);
    families.set(o.extracted.familyKey!, list);
  }
  const multiFamilies = [...families.entries()].filter(([, list]) => new Set(list.map((o) => o.marchand)).size >= 2);
  const multiModelFamilies = new Set(multi.map((m) => m.familyKey));
  const familiesReached = multiFamilies.filter(([key]) => multiModelFamilies.has(key)).length;

  // Blocages : paires inter-marchands d'une même famille, par cause (plafonné par famille).
  const pairLevels: Record<string, number> = {};
  const blockers: Record<string, number> = {};
  const pairHeader = ["famille", "marchand_a", "titre_a", "marchand_b", "titre_b", "causes"];
  const proches: unknown[][] = [pairHeader];
  // D-2026-09-30-08 : mêmes colonnes que `proches.csv`, plus les attributs absents d'un côté (ou des deux).
  const indetermines: unknown[][] = [[...pairHeader, "manques"]];
  for (const [key, list] of multiFamilies) {
    let pairs = 0;
    outer: for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        if (list[i].marchand === list[j].marchand) continue;
        if (++pairs > PAIR_CAP_PER_FAMILY) break outer;
        const r = compare(list[i].extracted, list[j].extracted);
        pairLevels[r.niveau] = (pairLevels[r.niveau] ?? 0) + 1;
        if (r.niveau === "identique") continue;
        for (const d of r.differences) {
          const cause = `${d.effet} : ${d.attribut}`;
          blockers[cause] = (blockers[cause] ?? 0) + 1;
        }
        const row = [
          key,
          list[i].marchand,
          list[i].titre,
          list[j].marchand,
          list[j].titre,
          r.differences.map((d) => `${d.attribut}: ${d.a ?? "?"} | ${d.b ?? "?"}`).join(" ; "),
        ];
        if (r.niveau === "proche" && proches.length <= PROCHES_CSV_LIMIT) proches.push(row);
        if (r.niveau === "indetermine" && indetermines.length <= INDETERMINES_CSV_LIMIT) {
          const manques = [...new Set(r.differences.filter((d) => d.effet === "inconnu").map((d) => d.attribut))].sort();
          indetermines.push([...row, manques.join(" ")]);
        }
      }
    }
  }

  // Non-reconnus par marque et catégorie, avec les termes les plus fréquents.
  const groups = new Map<string, EngineOffer[]>();
  for (const o of notRecognized) {
    if (o.extracted.nonReconnu?.reason === "sans_famille_prevue") continue;
    const key = `${input.brandOf(o.dealId) || "(sans marque)"}|${o.extracted.categorie}`;
    const list = groups.get(key) ?? [];
    list.push(o);
    groups.set(key, list);
  }
  const unrecognizedRows = [...groups.entries()]
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 25)
    .map(([key, list]) => {
      const terms = count(list.flatMap((o) => [...new Set(o.extracted.nonReconnu?.termes ?? [])]), (t) => t);
      const top = Object.entries(terms).sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1)).slice(0, 6);
      const [brand, category] = key.split("|");
      return [brand, category, list.length, top.map(([t, n]) => `${t} (${n})`).join(", ")];
    });

  const counters = {
    offres_lues: offers.length + unsupported.length,
    offres_extraites: offers.length,
    offres_non_prises_en_charge: unsupported.length,
    reconnues: recognized.length,
    non_reconnues: reasons,
    par_categorie: byCategory,
    liens_par_methode: linksByMethod,
    modeles: result.models.length,
    modeles_multi_marchands: multi.length,
    modeles_multi_marchands_actifs: multiActive.length,
    modeles_multi_marchands_par_categorie: multiByCategory,
    familles_multi_marchands: multiFamilies.length,
    familles_multi_marchands_atteintes: familiesReached,
    conflits: result.conflicts.length,
    modeles_incoherents: result.incoherent.length,
    modeles_divergents: new Set(result.divergences.map((d) => d.model)).size,
    paires_famille_inter_marchands: pairLevels,
    textile_sans_reference_ambigues: result.ambiguousWithoutReference.length,
  };

  const alertCounts = count(offers.flatMap((o) => o.extracted.alertes), (a) => a);
  const markdown = [
    `# Rapport de passage du moteur fantôme — ${input.engineVersion}`,
    "",
    "## 1. Compteurs",
    "",
    `- Offres lues : **${counters.offres_lues}** (extraites ${offers.length}, catégorie non prise en charge ${unsupported.length}).`,
    `- Famille reconnue : **${recognized.length} / ${offers.length}** (${pct(recognized.length, offers.length)}). Non reconnues : ${Object.entries(reasons).map(([k, v]) => `${k} ${v}`).join(", ") || "aucune"}.`,
    "",
    table(
      ["Catégorie", "Offres lues", "Famille reconnue"],
      Object.entries(byCategory).map(([k, v]) => [k, v.lues, v.reconnues]),
    ),
    "",
    "## 2. Couverture (R4-Q3)",
    "",
    `- Modèles : **${result.models.length}** (liens : ${Object.entries(linksByMethod).map(([k, v]) => `${k} ${v}`).join(", ") || "aucun"}).`,
    `- **Modèles avec ≥ 2 marchands (active + tracked) : ${multi.length}** (référence actuelle : 5 produits multi-marchands).`,
    `- **Modèles avec ≥ 2 marchands en active seulement : ${multiActive.length}** (ce que le site pourra montrer).`,
    `- Par catégorie (active + tracked) : ${Object.entries(multiByCategory).map(([k, v]) => `${k} ${v}`).join(", ") || "aucune"}.`,
    `- Plafond famille : ${multiFamilies.length} familles chez ≥ 2 marchands ; ${familiesReached} ont au moins un modèle commun (${pct(familiesReached, multiFamilies.length)}).`,
    "",
    "## 3. Pourquoi les autres paires ne fusionnent pas",
    "",
    `Paires inter-marchands d'une même famille (${PAIR_CAP_PER_FAMILY} au plus par famille) : ${Object.entries(pairLevels).map(([k, v]) => `${k} ${v}`).join(", ") || "aucune"}.`,
    "",
    table(
      ["Cause (effet : attribut)", "Paires"],
      Object.entries(blockers).sort((a, b) => b[1] - a[1]).slice(0, 15),
    ),
    "",
    "« indetermine » : aucune différence connue, seulement des informations manquantes (D-2026-09-30-08). Listes : `proches.csv` (paires « proche »), `indetermines.csv` (paires « indetermine », avec les attributs manquants).",
    "",
    "## 4. Non reconnus (GAP-2026-09-27-01)",
    "",
    unrecognizedRows.length > 0
      ? table(["Marque", "Catégorie", "Offres", "Termes les plus fréquents"], unrecognizedRows as (string | number)[][])
      : "Aucun.",
    "",
    "Liste complète : `non-reconnus.csv`.",
    "",
    "## 5. Conflits et incohérences",
    "",
    `- Conflits (même GTIN ou même référence mais familles ou attributs contradictoires, jamais fusionnés) : **${result.conflicts.length}** — \`conflits.csv\`.`,
    `- Modèles incohérents (deux membres « différents » réunis par un identifiant) : **${result.incoherent.length}**.`,
    `- Modèles divergents (contrôle indépendant de \`compare()\` : valeurs extraites différentes pour un même attribut chez deux membres) : **${counters.modeles_divergents}** — \`conflits.csv\`.`,
    `- Alertes d'extraction : ${Object.entries(alertCounts).map(([k, v]) => `${k} ${v}`).join(", ") || "aucune"}.`,
    "",
  ].join("\n");

  const nonReconnus = csv([
    ["deal_id", "marchand", "marque", "categorie", "motif", "termes", "titre"],
    ...notRecognized.map((o) => [
      o.dealId,
      o.marchand,
      input.brandOf(o.dealId),
      o.extracted.categorie,
      o.extracted.nonReconnu?.reason ?? "",
      (o.extracted.nonReconnu?.termes ?? []).join(" "),
      o.titre,
    ]),
  ]);
  const conflits = csv([
    ["type", "deal_a", "titre_a", "deal_b", "titre_b", "detail"],
    ...result.conflicts.map((c) => [c.kind, c.a, byId.get(c.a)?.titre, c.b, byId.get(c.b)?.titre, c.detail]),
    ...result.incoherent.map((c) => ["incoherent", c.a, byId.get(c.a)?.titre, c.b, byId.get(c.b)?.titre, c.detail]),
    ...result.divergences.map((d) => {
      const first = result.models[d.model].members[0];
      return ["divergent", first, byId.get(first)?.titre, "", "", `${d.attribut} (${d.valeurs.join(" | ")})`];
    }),
  ]);

  return { counters, markdown, csv: { nonReconnus, proches: csv(proches), indetermines: csv(indetermines), conflits } };
}
