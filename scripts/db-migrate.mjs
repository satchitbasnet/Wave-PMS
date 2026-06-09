/**
 * Run pending Supabase migrations against your remote database.
 *
 * Requires SUPABASE_DB_URL in .env.local (Database password from Supabase Dashboard).
 * Get it: Project Settings → Database → Connection string → URI (copy full string)
 */
import { readFileSync, existsSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

function loadEnvLocal() {
  const path = join(root, ".env.local");
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvLocal();

const dbUrl =
  process.env.SUPABASE_DB_URL?.trim() ||
  process.env.DATABASE_URL?.trim();

if (!dbUrl) {
  console.error(`
Missing database connection string.

1. Open: https://supabase.com/dashboard/project/ussrnqblowtugrjyxqfc/settings/database
2. Under "Connection string" → URI → copy the full string (replace [YOUR-PASSWORD])
3. Add to propflow/.env.local:

   SUPABASE_DB_URL=postgresql://postgres.xxx:YOUR_PASSWORD@...

4. Run again: npm run db:migrate
`);
  process.exit(1);
}

const { default: pg } = await import("pg");
const client = new pg.Client({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false },
});

const migrationsDir = join(root, "supabase", "migrations");
const files = readdirSync(migrationsDir)
  .filter((f) => f.endsWith(".sql"))
  .sort();

await client.connect();

await client.query(`
  CREATE TABLE IF NOT EXISTS public.schema_migrations (
    name TEXT PRIMARY KEY,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );
`);

for (const file of files) {
  const { rows } = await client.query(
    "SELECT 1 FROM public.schema_migrations WHERE name = $1",
    [file]
  );
  if (rows.length > 0) {
    console.log(`Skip (already applied): ${file}`);
    continue;
  }

  const sql = readFileSync(join(migrationsDir, file), "utf8");
  console.log(`Applying: ${file}...`);
  try {
    await client.query("BEGIN");
    await client.query(sql);
    await client.query(
      "INSERT INTO public.schema_migrations (name) VALUES ($1)",
      [file]
    );
    await client.query("COMMIT");
    console.log(`Done: ${file}`);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(`Failed on ${file}:`, err.message);
    process.exit(1);
  }
}

await client.end();
console.log("\nAll migrations applied successfully.");
