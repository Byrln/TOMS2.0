import type { DatabaseClient } from "@toms/db";
import type { VerifiedAccessToken } from "../../plugins/auth.plugin";
import type { Actor } from "../../shared/actor";
import { ApiError } from "../../shared/errors/api-error";
import { findActiveMembership } from "./identity.repository";

export function createIdentityService(client: DatabaseClient) {
  return {
    async resolveActor(token: VerifiedAccessToken): Promise<Actor> {
      const memberships = await findActiveMembership(client, token);
      if (memberships.length !== 1) {
        throw new ApiError(403, "TENANT_NOT_FOUND", "An active tenant membership is required");
      }
      const membership = memberships[0]!;
      return {
        userId: token.userId,
        tenantId: membership.tenantId,
        role: membership.role,
        ...(typeof token.claims.aal === "string" ? { authLevel: token.claims.aal } : {}),
        claims: token.claims,
      };
    },
  };
}
