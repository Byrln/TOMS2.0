import { describe, expect, it } from "vitest";
import { bookingHoldRequestSchema, checkoutRequestSchema } from "./index";

describe("commerce contracts", () => {
  it("accepts a valid hold request and rejects non-positive party sizes", () => {
    expect(bookingHoldRequestSchema.parse({ departureId: "42bc3066-0db1-4d4b-b3c4-1ca6d6077475", partySize: 2, idempotencyKey: "hold-customer-123456" }).partySize).toBe(2);
    expect(() => bookingHoldRequestSchema.parse({ departureId: "42bc3066-0db1-4d4b-b3c4-1ca6d6077475", partySize: 0, idempotencyKey: "bad" })).toThrow();
  });

  it("models payer separately from travelers", () => {
    const parsed = checkoutRequestSchema.parse({
      holdId: "42bc3066-0db1-4d4b-b3c4-1ca6d6077475",
      payer: { fullName: "Bat-Orgil Munkhbat", email: "bat@example.com" },
      travelers: [{ fullName: "Bat-Orgil Munkhbat", nationality: "MN" }, { fullName: "Enkhjin Munkhbat", nationality: "MN" }],
      paymentMethod: "DEMO",
      termsAccepted: true,
      idempotencyKey: "checkout-123456789"
    });
    expect(parsed.travelers).toHaveLength(2);
    expect(parsed.payer.email).toBe("bat@example.com");
  });
});
