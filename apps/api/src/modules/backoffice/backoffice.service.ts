import { withUserRlsContext, type DatabaseClient, type VerifiedRlsClaims } from "@toms/db";
import type { Actor } from "../../shared/actor";
import { listBackofficeResource, type BackofficeResource } from "./backoffice.repository";
import type { PageQuery } from "../../services";

function claims(actor: Actor): VerifiedRlsClaims {
  return { sub: actor.userId, role: "authenticated", iss: typeof actor.claims.iss === "string" ? actor.claims.iss : "", ...(actor.claims.aud ? { aud: actor.claims.aud as string | string[] } : {}), app_metadata: { tenant_id: actor.tenantId } };
}

function serialize(value: unknown, locale: "mn" | "en"): unknown {
  if (typeof value === "bigint") return Number(value);
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map((item) => serialize(item, locale));
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    if (typeof record.mn === "string" && typeof record.en === "string") return record[locale];
    return Object.fromEntries(Object.entries(record).map(([key, item]) => [key, serialize(item, locale)]));
  }
  return value;
}

export function createBackofficeService(client: DatabaseClient) {
  return {
    async list(actor: Actor, resource: BackofficeResource, locale: "mn" | "en", query?: PageQuery) {
      const rows = await withUserRlsContext(client.db, claims(actor), (tx) => listBackofficeResource(tx, actor.tenantId, resource));
      const serialized = serialize(rows, locale) as Array<Record<string, unknown>>;
      const normalizedQuery = query?.q?.toLocaleLowerCase();
      const filtered = normalizedQuery ? serialized.filter((row) => JSON.stringify(row).toLocaleLowerCase().includes(normalizedQuery)) : serialized;
      const page = query?.page ?? 1; const pageSize = query?.pageSize ?? 25; const items = filtered.slice((page - 1) * pageSize, page * pageSize);
      return { data: items, items, page: { page, pageSize, total: filtered.length, pageCount: Math.ceil(filtered.length / pageSize) }, summary: { total: filtered.length } };
    },
  };
}
