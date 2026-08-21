import { describe, expect, it } from "vitest";
import { calculateQuote, formatMoney } from "./index";

describe("pricing", () => {
  it("calculates travelers, fixed add-ons and percentage promotion in integer minor units", () => {
    const quote = calculateQuote({
      currency: "MNT",
      unitPriceMinor: 3_450_000,
      travelers: 2,
      addOns: [{ name: "Airport pickup", unitPriceMinor: 120_000, quantity: 1 }],
      promotion: { kind: "PERCENT", value: 10 }
    });

    expect(quote.subtotalMinor).toBe(7_020_000);
    expect(quote.discountMinor).toBe(702_000);
    expect(quote.totalMinor).toBe(6_318_000);
    expect(formatMoney({ amountMinor: quote.totalMinor, currency: "MNT" }, "mn-MN")).toContain("6,318,000");
  });

  it("never produces a negative total", () => {
    const quote = calculateQuote({
      currency: "USD",
      unitPriceMinor: 10_00,
      travelers: 1,
      addOns: [],
      promotion: { kind: "FIXED", value: 15_00 }
    });
    expect(quote.totalMinor).toBe(0);
  });
});

