import { createHash } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { inventoryHolds, withAnonymousRlsContext, type DatabaseClient } from "@toms/db";
import { ApiError } from "../../shared/errors/api-error";
import { findTenantIdByHost } from "../tenancy/tenant.repository";
import { readCheckoutIdempotency, reserveInventory, writeCheckout } from "./booking.repository";
import { checkoutSchema, createHoldSchema } from "./booking.schemas";

export function createBookingService(client: DatabaseClient, now: () => Date = () => new Date()) {
  const tenantForHost = async (host: string) => {
    const tenantId = await withAnonymousRlsContext(client.db, (tx) => findTenantIdByHost(tx, host));
    if (!tenantId) throw new ApiError(404, "TENANT_NOT_FOUND", "Verified tenant domain not found");
    return tenantId;
  };
  return {
    async createHold(host: string, rawInput: unknown, idempotencyKey: string) {
      const input = createHoldSchema.parse(rawInput);
      const tenantId = await tenantForHost(host);
      const expiresAt = new Date(now().getTime() + 15 * 60 * 1000);
      try {
        const holdId = await withAnonymousRlsContext(client.db, (tx) => reserveInventory(tx, tenantId, input.departureId, input.partySize, expiresAt, idempotencyKey));
        const holds = await client.db.select().from(inventoryHolds).where(and(eq(inventoryHolds.id, holdId), eq(inventoryHolds.tenantId, tenantId))).limit(1);
        const hold = holds[0];
        if (!hold) throw new Error("Created inventory hold could not be read");
        return { id: hold.id, departureId: hold.departureId, partySize: hold.quantity, status: hold.status, expiresAt: hold.expiresAt.toISOString() };
      } catch (error) {
        const message = error instanceof Error ? error.message : "";
        if (message.includes("INSUFFICIENT_INVENTORY")) throw new ApiError(409, "INVENTORY_UNAVAILABLE", "The requested seats are no longer available");
        if (message.includes("DEPARTURE_NOT_AVAILABLE")) throw new ApiError(404, "DEPARTURE_NOT_FOUND", "Published departure not found");
        throw error;
      }
    },
    async checkout(host: string, rawInput: unknown, idempotencyKey: string) {
      const input = checkoutSchema.parse(rawInput);
      const tenantId = await tenantForHost(host);
      const requestHash = createHash("sha256").update(JSON.stringify(input)).digest("hex");
      return client.db.transaction(async (tx) => {
        const existing = await readCheckoutIdempotency(tx, tenantId, idempotencyKey);
        if (existing) {
          if (existing.requestHash !== requestHash) throw new ApiError(409, "CONFLICT", "Idempotency key was already used with different input");
          return existing.result;
        }
        const result = await writeCheckout(tx, { tenantId, requestHash, idempotencyKey, holdId: input.holdId, payer: input.payer, travelers: input.travelers, now: now() });
        if (!result) throw new ApiError(409, "HOLD_EXPIRED", "The inventory hold is missing, expired, or does not match the traveler count");
        return result;
      });
    },
  };
}
