import type { CurrencyCode, PaymentStatus } from "@toms/domain";

export interface ChargeInput {
  bookingId: string;
  amountMinor: number;
  currency: CurrencyCode;
  idempotencyKey: string;
}

export interface ChargeResult {
  id: string;
  providerReference: string;
  status: PaymentStatus;
  amountMinor: number;
  currency: CurrencyCode;
}

export interface PaymentProvider {
  name: string;
  charge(input: ChargeInput): Promise<ChargeResult>;
  refund(paymentId: string, amountMinor: number, idempotencyKey: string): Promise<ChargeResult>;
}

export class PaymentProviderNotConfiguredError extends Error {
  readonly code = "PAYMENT_PROVIDER_NOT_CONFIGURED";
  constructor() {
    super("A production payment provider must be configured before accepting or refunding funds");
    this.name = "PaymentProviderNotConfiguredError";
  }
}

export function createUnconfiguredPaymentProvider(): PaymentProvider {
  const reject = async (): Promise<never> => { throw new PaymentProviderNotConfiguredError(); };
  return { name: "UNCONFIGURED", charge: reject, refund: reject };
}
