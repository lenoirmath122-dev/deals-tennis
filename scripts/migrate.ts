import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const sql = neon(process.env.DATABASE_URL);
const migrationsDir = join(import.meta.dirname, "migrations");

const files = readdirSync(migrationsDir)
  .filter((file) => file.endsWith(".sql"))
  .sort();

for (const file of files) {
  console.log(`Applying migration ${file}...`);
  const content = readFileSync(join(migrationsDir, file), "utf-8");

  const statements = content
    .split(/;\s*\n/)
    .map((statement) =>
      statement
        .split("\n")
        .filter((line) => !line.trim().startsWith("--"))
        .join("\n")
        .trim()
    )
    .filter((statement) => statement.length > 0);

  for (const statement of statements) {
    await sql.query(statement);
  }
}

console.log("Migrations applied successfully.");
