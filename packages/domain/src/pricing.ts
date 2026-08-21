export type CurrencyCode = "MNT" | "USD" | "EUR" | "KRW" | "JPY" | "CNY";

export interface Money {
  amountMinor: number;
  currency: CurrencyCode;
}

export interface QuoteInput {
  currency: CurrencyCode;
  unitPriceMinor: number;
  travelers: number;
  addOns: ReadonlyArray<{ name: string; unitPriceMinor: number; quantity: number }>;
  promotion?: { kind: "PERCENT" | "FIXED"; value: number };
}

export interface Quote {
  currency: CurrencyCode;
  subtotalMinor: number;
  discountMinor: number;
  totalMinor: number;
  lines: ReadonlyArray<{ label: string; quantity: number; totalMinor: number }>;
}

function assertInteger(value: number, name: string): void {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new RangeError(`${name} must be a non-negative safe integer`);
  }
}

export function calculateQuote(input: QuoteInput): Quote {
  assertInteger(input.unitPriceMinor, "unitPriceMinor");
  assertInteger(input.travelers, "travelers");
  if (input.travelers < 1) throw new RangeError("travelers must be at least one");

  const lines: Array<{ label: string; quantity: number; totalMinor: number }> = [
    { label: "Travelers", quantity: input.travelers, totalMinor: input.unitPriceMinor * input.travelers }
  ];

  for (const addOn of input.addOns) {
    assertInteger(addOn.unitPriceMinor, `${addOn.name}.unitPriceMinor`);
    assertInteger(addOn.quantity, `${addOn.name}.quantity`);
    lines.push({ label: addOn.name, quantity: addOn.quantity, totalMinor: addOn.unitPriceMinor * addOn.quantity });
  }

  const subtotalMinor = lines.reduce((total, line) => total + line.totalMinor, 0);
  const requestedDiscount = input.promotion?.kind === "PERCENT"
    ? Math.round(subtotalMinor * Math.min(Math.max(input.promotion.value, 0), 100) / 100)
    : Math.max(input.promotion?.value ?? 0, 0);
  const discountMinor = Math.min(requestedDiscount, subtotalMinor);

  return {
    currency: input.currency,
    subtotalMinor,
    discountMinor,
    totalMinor: subtotalMinor - discountMinor,
    lines
  };
}

export function formatMoney(money: Money, locale = "mn-MN"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: money.currency,
    currencyDisplay: "code",
    maximumFractionDigits: money.currency === "MNT" ? 0 : 2
  }).format(money.amountMinor / (money.currency === "MNT" ? 1 : 100));
}

