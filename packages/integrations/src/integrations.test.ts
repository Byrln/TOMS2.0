import { describe, expect, it } from "vitest";
import { paymentProviderCapabilities } from "./index";
describe("integration routing",()=>{it("models QPay as MNT-first with refunds and verification",()=>{expect(paymentProviderCapabilities.QPAY.currencies).toContain("MNT");expect(paymentProviderCapabilities.QPAY.supportsRefunds).toBe(true);expect(paymentProviderCapabilities.QPAY.requiresVerification).toBe(true)})});

