// R4.6-d — dossier de bascule à partir du résultat R4.6-c
// Objectifs :
// 1) appliquer les règles de bascule pour traiter les non-reconnus
//    (famille_inconnue / sans_famille_prevue / marque_inconnue)
// 2) intégrer l'arrêt sur la décision : dry-run/readonly puis écriture en prod
//    UNIQUEMENT si l'utilisateur accorde explicitement.
//
// Hypothèse de repo : la bascule R4.x correspond à la matérialisation de
// décisions dans les tables de match_* déjà introduites (match_models / match_offer_links)
// puis au recalcul côté site via la lecture de ces tables.
//
// Usage :
//   npm run match:shadow -- --dry-run (existant)
//   node --env-file=.env.local scripts/matching/bascule-r4.6-d.ts --dry-run --out <dir>
//   node --env-file=.env.local scripts/matching/bascule-r4.6-d.ts --apply --run-id <uuid>
//
// Le mode dry-run produit une fiche de revue par offre non reconnue ; il ne propose
// ni ne crée de modèle automatique. Le mode apply est distinct et explicitement gardé.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { neon } from "@neondatabase/serverless";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const apply = args.includes("--apply");
const runIdIndex = args.indexOf("--run-id");
const runId = runIdIndex >= 0 ? args[runIdIndex + 1] : null;
const outIndex = args.indexOf("--out");
const outDir = outIndex >= 0 ? args[outIndex + 1] : "rapport-bascule-r4.6-d";
const decisionTokenIndex = args.indexOf("--decision-token");
const decisionToken = decisionTokenIndex >= 0 ? args[decisionTokenIndex + 1] : null;
const inputIndex = args.indexOf("--input");
const inputCsv = inputIndex >= 0 ? args[inputIndex + 1] : null;

if (!dryRun && !apply) {
  throw new Error("Specify --dry-run or --apply");
}
if (dryRun && apply) throw new Error("Use only one of --dry-run/--apply");
if (apply && !runId) throw new Error("--apply requires --run-id <uuid> (run to base bascule on)");
if (apply && inputCsv) throw new Error("--apply is refused for local CSV input");

const sql = !inputCsv && process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;

// "Décision" : arrêt sur accord explicite.
// On exige un token littéral (réduit le risque d'oubli), car le repo ne
// gère pas d'interactivité.
const REQUIRED_DECISION_TOKEN = "ACCORD_R4_6_D_2026-10-01";
if (apply) {
  if (decisionToken !== REQUIRED_DECISION_TOKEN) {
    throw new Error(
      `Refus d'écriture : --apply exige --decision-token ${REQUIRED_DECISION_TOKEN}`,
    );
  }
} else if (dryRun) {
  // Pas de décision attendue en dry-run : on produit seulement summary/proposed.
}

type NonReconnuMotif = "famille_inconnue" | "sans_famille_prevue" | "marque_inconnue";

type OfferRow = {
  deal_id: string;
  categorie: string;
  marchand: string;
  marque?: string;
  termes?: string;
  titre?: string;
  statut: string;
  motif: NonReconnuMotif | string;
};

// (volontairement supprimé : on ne fait que typer/filtrer des motifs connus via SQL)

async function main() {
  if (apply) {
    throw new Error("R4.6-d apply has no approved model/link rules; refusing all writes");
  }
  if (!dryRun) throw new Error("Specify --dry-run or --apply");
  if (!inputCsv && !sql) throw new Error("DATABASE_URL is not set (or provide --input <csv>)");

  let offers: OfferRow[];
  let targetRunId: string;
  let source: string;
  if (inputCsv) {
    const text = readFileSync(inputCsv, "utf8").replace(/^\uFEFF/, "");
    const lines = text.split(/\r?\n/).filter((line) => line.length > 0);
    const parseRow = (line: string): string[] => {
      const fields: string[] = [];
      let field = "";
      let quoted = false;
      for (let i = 0; i < line.length; i += 1) {
        const char = line[i];
        if (char === '"') {
          if (quoted && line[i + 1] === '"') { field += '"'; i += 1; }
          else quoted = !quoted;
        } else if (char === ";" && !quoted) { fields.push(field); field = ""; }
        else field += char;
      }
      if (quoted) throw new Error("Malformed CSV: unterminated quoted field");
      fields.push(field);
      return fields;
    };
    if (lines.length < 1) throw new Error("Input CSV is empty");
    const headers = parseRow(lines[0]);
    const required = ["deal_id", "marchand", "categorie", "motif"];
    if (required.some((header) => !headers.includes(header))) {
      throw new Error(`Input CSV must contain columns: ${required.join(", ")}`);
    }
    const csvRows = lines.slice(1).map((line, index) => {
      const fields = parseRow(line);
      if (fields.length !== headers.length) throw new Error(`Malformed CSV row ${index + 2}: column count mismatch`);
      return Object.fromEntries(headers.map((header, column) => [header, fields[column]]));
    });
    offers = csvRows.map((row) => ({
    deal_id: row.deal_id,
    marchand: row.marchand,
    marque: row.marque ?? "",
    categorie: row.categorie,
    motif: row.motif,
    termes: row.termes ?? "",
    titre: row.titre ?? "",
    statut: row.statut || "non fourni",
    }));
    if (offers.some((offer) => !offer.deal_id || !offer.marchand || !offer.categorie ||
      !["famille_inconnue", "sans_famille_prevue", "marque_inconnue"].includes(offer.motif))) {
      throw new Error("Input CSV contains missing required values or an unsupported motif");
    }
    targetRunId = runId ?? "local-csv";
    source = `CSV local: ${inputCsv}`;
  } else {
    if (!sql) throw new Error("DATABASE_URL is not set");
    targetRunId = runId ?? (await (async () => {
      const res = await sql`SELECT id FROM match_runs WHERE engine_version = 'r4.6-b' AND finished_at IS NOT NULL ORDER BY finished_at DESC, started_at DESC LIMIT 1`;
      if (!res[0]?.id) throw new Error("No completed match_run found for engine_version r4.6-b");
      return res[0].id as string;
    })());
    offers = (await sql`
      SELECT o.id AS deal_id, o.category AS categorie, m.name AS marchand,
             o.brand AS marque, ao.attributes AS termes, o.title AS titre,
             o.status AS statut, ao.unrecognized_reason AS motif
      FROM match_offer_attributes ao
      JOIN deals o ON o.id = ao.deal_id
      JOIN merchants m ON m.id = o.merchant_id
      WHERE ao.run_id = ${targetRunId}
        AND ao.unrecognized_reason IN ('famille_inconnue','sans_famille_prevue','marque_inconnue')
    `) as unknown as OfferRow[];
    source = `match_run ${targetRunId}`;
  }
  mkdirSync(outDir, { recursive: true });

  // Les non-reconnus sont seulement inventoriés pour revue : aucun modèle ni lien
  // offre-modèle n'est proposé, conformément au dossier R4.6-d.
  const review = offers.map((o) => ({
    deal_id: o.deal_id,
    marchand: o.marchand,
    marque: o.marque ?? "non fourni",
    categorie: o.categorie,
    motif: String(o.motif),
    termes: o.termes ?? "non fourni",
    titre: o.titre ?? "non fourni",
    statut: o.statut || "non fourni",
  }));

  const summary = {
    base_run_id: targetRunId,
    source,
    portee_validation: inputCsv
      ? "Inventaire des non-reconnus uniquement; ne valide pas les métriques complètes, conflits, textile, deals actuels ni une décision de bascule."
      : "Inventaire des non-reconnus du match_run r4.6-b; ne valide pas à lui seul une décision de bascule.",
    offers_non_reconnues: offers.length,
    count_by_motif: {
      famille_inconnue: offers.filter((o) => o.motif === "famille_inconnue").length,
      sans_famille_prevue: offers.filter((o) => o.motif === "sans_famille_prevue").length,
      marque_inconnue: offers.filter((o) => o.motif === "marque_inconnue").length,
    },
    dry_run: dryRun,
    apply: apply,
  };

  writeFileSync(join(outDir, "summary.json"), JSON.stringify(summary, null, 2));
  writeFileSync(join(outDir, "review-non-reconnues.json"), JSON.stringify(review, null, 2));

  if (dryRun) {
    console.log("--dry-run : proposition écrite.");
    console.log(`base_run_id=${targetRunId} non_reconnues=${offers.length}`);
    console.log("Rien n'est écrit en base.");
    return;
  }

  throw new Error("R4.6-d apply has no approved model/link rules; refusing all writes");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
