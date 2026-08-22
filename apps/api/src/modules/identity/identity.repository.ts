import { and, eq } from "drizzle-orm";
import { tenantMemberships, withUserRlsContext, type DatabaseClient, type VerifiedRlsClaims } from "@toms/db";
import type { VerifiedAccessToken } from "../../plugins/auth.plugin";

function rlsClaims(token: VerifiedAccessToken): VerifiedRlsClaims {
  return {
    sub: token.userId,
    role: "authenticated",
    iss: token.claims.iss ?? "",
    ...(token.claims.aud ? { aud: token.claims.aud } : {}),
    ...(typeof token.claims.email === "string" ? { email: token.claims.email } : {}),
    ...(token.claims.app_metadata && typeof token.claims.app_metadata === "object"
      ? { app_metadata: token.claims.app_metadata as Record<string, unknown> }
      : {}),
  };
}

export async function findActiveMembership(client: DatabaseClient, token: VerifiedAccessToken) {
  const requestedTenant = token.claims.app_metadata && typeof token.claims.app_metadata === "object"
    ? (token.claims.app_metadata as Record<string, unknown>).tenant_id
    : undefined;

  return withUserRlsContext(client.db, rlsClaims(token), async (tx) => {
    const predicates = [
      eq(tenantMemberships.userId, token.userId),
      eq(tenantMemberships.status, "ACTIVE"),
    ];
    if (typeof requestedTenant === "string") predicates.push(eq(tenantMemberships.tenantId, requestedTenant));

    return tx.select({
      tenantId: tenantMemberships.tenantId,
      role: tenantMemberships.role,
    }).from(tenantMemberships).where(and(...predicates)).limit(2);
  });
}
