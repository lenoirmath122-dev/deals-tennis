// R4.4 : passage du moteur de rapprochement en mode fantôme (D-2026-09-29-01, R4-Q2).
//
// Lancé à la main, recalcul complet : lit les offres `active` et `tracked` de `deals`
// (R4-Q3), extrait les attributs, regroupe en modèles (`lib/matching/cluster.ts`), écrit
// dans les quatre tables `match_*` (migration 008) et produit le rapport de passage
// (Markdown + CSV). Ne touche ni à `deals`, ni à `products`, ni au site.
//
// Usage : npm run match:shadow -- [--dry-run] [--out <dossier>] [--keep-runs]
//   --dry-run    lit et calcule, écrit le rapport, n'écrit rien en base
//   --out        dossier du rapport (défaut : rapport-passage/)
//   --keep-runs  garde les passages précédents (défaut : supprimés une fois le nouveau terminé)
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { neon } from "@neondatabase/serverless";
import { buildModels, type EngineOffer } from "../../lib/matching/cluster.ts";
import { extractOfferAttributes, isSupportedCategory } from "../../lib/matching/index.ts";
import { buildReport } from "../../lib/matching/report.ts";
import { buildTextileReview } from "../../lib/matching/textile-review.ts";
import type { AccessorySubcategory } from "../../config/accessory-subcategories.ts";
import type { DealCategory } from "../../types/database.ts";

/** Version du moteur écrite dans `match_runs.engine_version`. */
const ENGINE_VERSION = "r4.5-b-textile";
const BATCH = 500;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}
const sql = neon(process.env.DATABASE_URL);

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const keepRuns = args.includes("--keep-runs");
const outIndex = args.indexOf("--out");
const outDir = outIndex >= 0 ? args[outIndex + 1] : "rapport-passage";

interface DealRow {
  id: string;
  title: string;
  brand: string;
  category: DealCategory;
  subcategory: string | null;
  status: string;
  gtin: string | null;
  mpn: string | null;
  merchant_sku: string | null;
  original_price: string | number | null;
  raw_attributes: Record<string, unknown> | null;
  merchant: string;
}

const rows = (await sql`
  SELECT d.id, d.title, d.brand, d.category, d.subcategory, d.status, d.gtin, d.mpn,
         d.merchant_sku, d.original_price, d.raw_attributes, m.name AS merchant
  FROM deals d
  JOIN merchants m ON m.id = d.merchant_id
  WHERE d.status IN ('active', 'tracked')
  ORDER BY d.id
`) as DealRow[];
console.log(`${rows.length} offres lues (active + tracked).`);

const brands = new Map<string, string>();
const engineOffers: EngineOffer[] = [];
const unsupported: { categorie: string; statut: string }[] = [];
for (const row of rows) {
  brands.set(row.id, row.brand);
  if (!isSupportedCategory(row.category)) {
    unsupported.push({ categorie: row.category, statut: row.status });
    continue;
  }
  engineOffers.push({
    dealId: row.id,
    marchand: row.merchant,
    statut: row.status,
    titre: row.title,
    prixOrigine: row.original_price === null ? null : Number(row.original_price),
    extracted: extractOfferAttributes({
      marchand: row.merchant,
      titre: row.title,
      marque: row.brand,
      categorie: row.category,
      subcategory: row.subcategory as AccessorySubcategory | null,
      gtin: row.gtin,
      mpn: row.mpn,
      merchant_sku: row.merchant_sku,
      raw_attributes: row.raw_attributes,
    }),
  });
}

const result = buildModels(engineOffers);
const report = buildReport({
  engineVersion: ENGINE_VERSION,
  offers: engineOffers,
  unsupported,
  result,
  brandOf: (id) => brands.get(id) ?? "",
});

mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "rapport.md"), report.markdown);
writeFileSync(join(outDir, "non-reconnus.csv"), report.csv.nonReconnus);
writeFileSync(join(outDir, "proches.csv"), report.csv.proches);
writeFileSync(join(outDir, "conflits.csv"), report.csv.conflits);
// Relecture des modèles réunissant au moins deux marchands (une ligne par offre).
const byDealId = new Map(engineOffers.map((o) => [o.dealId, o]));
const quote = (v: string | number) => `"${String(v).replaceAll('"', '""')}"`;
const multiLines = ["modele;categorie;signature;marchand;statut;methode;prix_origine;titre"];
result.models.forEach((model, index) => {
  const members = model.members.map((id) => byDealId.get(id)!);
  if (new Set(members.map((m) => m.marchand)).size < 2) return;
  for (const m of members) {
    multiLines.push([index, model.category, quote(model.signature), quote(m.marchand), m.statut, result.links.get(m.dealId)?.method ?? "", m.prixOrigine ?? "", quote(m.titre)].join(";"));
  }
});
writeFileSync(join(outDir, "modeles-multi-marchands.csv"), multiLines.join("\n"));
// Textile, étape 3 (R4.5-b) : file de revue, aucune fusion (T-Q4).
const review = buildTextileReview(engineOffers, result);
const reviewCell = (v: string | number | null) => quote(v ?? "");
writeFileSync(
  join(outDir, "revue-textile.csv"),
  [
    "score;famille;marchand_a;titre_a;prix_a;marchand_b;titre_b;prix_b;mots_communs;mots_en_plus_a;mots_en_plus_b;raison;decision_mathieu",
    ...review.map((r) =>
      [
        r.score.toFixed(2),
        reviewCell(r.famille),
        reviewCell(r.marchandA),
        reviewCell(r.titreA),
        r.prixA ?? "",
        reviewCell(r.marchandB),
        reviewCell(r.titreB),
        r.prixB ?? "",
        reviewCell(r.motsCommuns.join(" ")),
        reviewCell(r.motsEnPlusA.join(" ")),
        reviewCell(r.motsEnPlusB.join(" ")),
        reviewCell(r.raison),
        "",
      ].join(";"),
    ),
  ].join("\n"),
);
console.log(`Rapport écrit dans ${outDir}/ (rapport.md, non-reconnus.csv, proches.csv, conflits.csv, modeles-multi-marchands.csv, revue-textile.csv : ${review.length} paires).`);

if (dryRun) {
  console.log("--dry-run : rien n'est écrit en base.");
  process.exit(0);
}

// Écriture : un nouveau passage complet ; les lignes filles partent en cascade avec le passage.
const [run] = (await sql`
  INSERT INTO match_runs (engine_version) VALUES (${ENGINE_VERSION}) RETURNING id
`) as { id: string }[];

async function inBatches<T>(items: T[], write: (batch: T[]) => Promise<unknown>) {
  for (let i = 0; i < items.length; i += BATCH) await write(items.slice(i, i + BATCH));
}

try {
  await inBatches(
    engineOffers.map((o) => ({
      deal_id: o.dealId,
      family_key: o.extracted.familyKey,
      attributes: o.extracted.attributes,
      unrecognized_reason: o.extracted.nonReconnu?.reason ?? null,
    })),
    (batch) => sql`
      INSERT INTO match_offer_attributes (run_id, deal_id, family_key, attributes, unrecognized_reason)
      SELECT ${run.id}::uuid, x.deal_id, x.family_key, x.attributes, x.unrecognized_reason
      FROM jsonb_to_recordset(${JSON.stringify(batch)}::jsonb)
        AS x(deal_id uuid, family_key text, attributes jsonb, unrecognized_reason text)
    `,
  );

  const modelIds: string[] = [];
  await inBatches(
    result.models.map((m, index) => ({
      index,
      family_key: m.familyKey,
      category: m.category,
      canonical_attributes: m.canonical,
      signature: m.signature,
    })),
    async (batch) => {
      const inserted = (await sql`
        INSERT INTO match_models (run_id, family_key, category, canonical_attributes, signature)
        SELECT ${run.id}::uuid, x.family_key, x.category, x.canonical_attributes, x.signature
        FROM jsonb_to_recordset(${JSON.stringify(batch)}::jsonb)
          AS x(idx int, family_key text, category text, canonical_attributes jsonb, signature text)
        ORDER BY x.idx
        RETURNING id, signature
      `) as { id: string; signature: string }[];
      const idBySignature = new Map(inserted.map((r) => [r.signature, r.id]));
      for (const m of batch) modelIds[m.index] = idBySignature.get(m.signature)!;
    },
  );

  await inBatches(
    [...result.links.entries()].map(([dealId, link]) => ({
      deal_id: dealId,
      model_id: modelIds[link.modelIndex],
      method: link.method,
      score: link.score,
    })),
    (batch) => sql`
      INSERT INTO match_offer_links (run_id, deal_id, model_id, method, score)
      SELECT ${run.id}::uuid, x.deal_id, x.model_id, x.method, x.score
      FROM jsonb_to_recordset(${JSON.stringify(batch)}::jsonb)
        AS x(deal_id uuid, model_id uuid, method text, score numeric)
    `,
  );

  await sql`
    UPDATE match_runs SET finished_at = NOW(), counters = ${JSON.stringify(report.counters)}::jsonb
    WHERE id = ${run.id}
  `;
} catch (error) {
  // Passage incomplet : on le supprime (cascade) plutôt que de laisser un état à moitié écrit.
  await sql`DELETE FROM match_runs WHERE id = ${run.id}`;
  throw error;
}

if (!keepRuns) {
  await sql`DELETE FROM match_runs WHERE id <> ${run.id}`;
}
console.log(`Passage ${run.id} écrit : ${result.models.length} modèles, ${result.links.size} liens.`);
