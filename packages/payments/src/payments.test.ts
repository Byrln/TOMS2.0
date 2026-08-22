import { describe, expect, it } from "vitest";
import { createUnconfiguredPaymentProvider } from "./index";

describe("payment provider boundary", () => {
  it("never fabricates a successful charge when no production adapter is configured", async () => {
    const provider = createUnconfiguredPaymentProvider();
    const input = { bookingId: "booking-1", amountMinor: 3_030_000, currency: "MNT" as const, idempotencyKey: "payment-123456" };
    await expect(provider.charge(input)).rejects.toMatchObject({ code: "PAYMENT_PROVIDER_NOT_CONFIGURED" });
  });
});
