import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres, { type Sql } from "postgres";
import * as schema from "./schema";

export type TomsDatabase = PostgresJsDatabase<typeof schema>;
export type TomsTransaction = Parameters<Parameters<TomsDatabase["transaction"]>[0]>[0];

export interface DatabaseClient {
  readonly db: TomsDatabase;
  readonly sql: Sql;
  close(): Promise<void>;
}

export function createDatabaseClient(databaseUrl: string): DatabaseClient {
  if (!databaseUrl.startsWith("postgres://") && !databaseUrl.startsWith("postgresql://")) {
    throw new Error("DATABASE_URL must be a PostgreSQL connection string");
  }

  const sql = postgres(databaseUrl, {
    prepare: false,
    max: 12,
    idle_timeout: 20,
    connect_timeout: 10,
  });

  return {
    db: drizzle(sql, { schema, casing: "snake_case" }),
    sql,
    close: async () => sql.end({ timeout: 5 }),
  };
}
