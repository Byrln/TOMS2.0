import { describe, expect, it } from "vitest";
import { formatCurrencyMinor } from "./index";

describe("TOMS presentation formatting", () => {
  it("uses the compact tugrik sign for MNT dashboards", () => {
    expect(formatCurrencyMinor(1_286_650_000)).toBe("₮ 1,286,650,000");
  });

  it("keeps decimal minor-unit semantics for non-MNT currencies", () => {
    expect(formatCurrencyMinor(123_45, "USD", "en-US")).toBe("$123.45");
  });
});
