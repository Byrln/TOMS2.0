import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "drizzle-kit";

// Drizzle Kit runs with packages/db as its working directory, while the
// workspace keeps local environment files at the repository root.
const repositoryRoot = fileURLToPath(new URL("../..", import.meta.url));
const rootEnvValues = new Map<string, string>();
for (const fileName of [".env.local", ".env"]) {
  const filePath = resolve(repositoryRoot, fileName);
  if (!existsSync(filePath)) continue;
  try {
    process.loadEnvFile(filePath);
  } catch {
    // Drizzle Kit may evaluate this config in a restricted process context.
  }
  for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    const key = match?.[1];
    const rawValue = match?.[2];
    if (!key || rawValue === undefined || rootEnvValues.has(key)) continue;
    rootEnvValues.set(key, rawValue.replace(/^(["'])(.*)\1$/, "$2"));
  }
}

const databaseUrl = process.env.DATABASE_MIGRATION_URL || process.env.DATABASE_URL
  || rootEnvValues.get("DATABASE_MIGRATION_URL") || rootEnvValues.get("DATABASE_URL");

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/schema/index.ts",
  out: "../../supabase/drizzle",
  dbCredentials: databaseUrl ? { url: databaseUrl } : undefined,
  strict: true,
  verbose: true,
  schemaFilter: ["public"],
  entities: {
    roles: {
      provider: "supabase",
      include: ["anon", "authenticated", "service_role"],
    },
  },
});
