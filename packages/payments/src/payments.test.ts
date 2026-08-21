import { describe, expect, it } from "vitest";
import { createDemoPaymentProvider } from "./index";
describe("payment provider",()=>{it("returns the same successful charge for an idempotency key",async()=>{const provider=createDemoPaymentProvider();const input={bookingId:"booking-1",amountMinor:3030000,currency:"MNT" as const,idempotencyKey:"payment-123456"};const first=await provider.charge(input);const second=await provider.charge(input);expect(second).toEqual(first);expect(first.status).toBe("SUCCEEDED")})});

