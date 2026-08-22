import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { node } from "@elysia/node";
import { createDatabaseClient, type DatabaseClient } from "@toms/db";
import { createApp } from "./app";
import { readEnv } from "./env";
import { createJwtVerifier } from "./plugins/auth.plugin";
import { createProductionServices } from "./production-services";

// The API package runs from apps/api, while workspace environment files live at the repository root.
for (const fileName of [".env.local", ".env"]) {
  const filePath = fileURLToPath(new URL(`../../../${fileName}`, import.meta.url));
  if (existsSync(filePath)) {
    try {
      process.loadEnvFile(filePath);
    } catch {
      // Keep process-provided environment variables usable in runtimes without loadEnvFile.
    }
  }
}

const env = readEnv();

let databaseClient: DatabaseClient | undefined;
if (env.DATABASE_URL) databaseClient = createDatabaseClient(env.DATABASE_URL);
if (env.NODE_ENV === "production" && !databaseClient) {
  throw new Error("DATABASE_URL is required in production");
}

const jwksUrl = env.SUPABASE_JWKS_URL ?? (env.NEXT_PUBLIC_SUPABASE_URL
  ? `${env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/.well-known/jwks.json`
  : undefined);
const issuer = env.SUPABASE_JWT_ISSUER ?? (env.NEXT_PUBLIC_SUPABASE_URL
  ? `${env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1`
  : undefined);

const app = createApp({
  adapter: node(),
  ...(databaseClient ? { services: createProductionServices(databaseClient) } : {}),
  ...(jwksUrl && issuer
    ? { verifyAccessToken: createJwtVerifier({ jwksUrl, issuer, audience: env.SUPABASE_JWT_AUDIENCE }) }
    : {}),
  logLevel: env.LOG_LEVEL,
});

app.listen(env.API_PORT, ({ hostname, port }) => {
  process.stdout.write(JSON.stringify({ service: "toms-api", status: "ready", hostname, port }) + "\n");
});

const shutdown = async () => {
  app.stop();
  await databaseClient?.close();
};

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);

export type { App } from "./app";
