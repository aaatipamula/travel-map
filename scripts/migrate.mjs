/**
 * Runs Drizzle migrations against the configured database.
 * Called from docker-entrypoint.sh before the server starts.
 * Uses only production dependencies (drizzle-orm, @libsql/client).
 */
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const url = process.env.TURSO_DATABASE_URL;
if (!url) {
  console.error("TURSO_DATABASE_URL is not set");
  process.exit(1);
}

const client = createClient({
  url,
  authToken: process.env.TURSO_AUTH_TOKEN || undefined,
});

const db = drizzle(client);

console.log("Running database migrations...");
await migrate(db, {
  migrationsFolder: join(__dirname, "../db/migrations"),
});
console.log("Migrations complete.");

await client.close();
