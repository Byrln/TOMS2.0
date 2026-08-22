import { sql as drizzleSql } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type * as schema from "./schema";

export interface VerifiedRlsClaims {
  sub: string;
  role: "authenticated";
  iss: string;
  aud?: string | string[];
  email?: string;
  app_metadata?: Record<string, unknown>;
}

export async function withUserRlsContext<T>(
  db: PostgresJsDatabase<typeof schema>,
  claims: VerifiedRlsClaims,
  operation: (tx: Parameters<Parameters<typeof db.transaction>[0]>[0]) => Promise<T>,
): Promise<T> {
  return db.transaction(async (tx) => {
    await tx.execute(drizzleSql`set local role authenticated`);
    await tx.execute(drizzleSql`select set_config('request.jwt.claims', ${JSON.stringify(claims)}, true)`);
    await tx.execute(drizzleSql`select set_config('request.jwt.claim.sub', ${claims.sub}, true)`);
    await tx.execute(drizzleSql`select set_config('request.jwt.claim.role', 'authenticated', true)`);
    return operation(tx);
  });
}

export async function withAnonymousRlsContext<T>(
  db: PostgresJsDatabase<typeof schema>,
  operation: (tx: Parameters<Parameters<typeof db.transaction>[0]>[0]) => Promise<T>,
): Promise<T> {
  return db.transaction(async (tx) => {
    await tx.execute(drizzleSql`set local role anon`);
    await tx.execute(drizzleSql`select set_config('request.jwt.claims', '{}', true)`);
    return operation(tx);
  });
}
