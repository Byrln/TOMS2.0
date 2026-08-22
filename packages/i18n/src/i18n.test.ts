import { describe, expect, it } from "vitest";
import {
  formatDepartureRange,
  normalizeLocale,
  localeCookieValue,
  resolveLocalized,
  statusLabel,
  translate,
  type TranslationKey,
} from "./index";

describe("TOMS localization", () => {
  it("normalizes browser and tenant locale variants", () => {
    expect(normalizeLocale("mn-MN")).toBe("mn");
    expect(normalizeLocale("en-US")).toBe("en");
    expect(normalizeLocale("EN_gb")).toBe("en");
    expect(normalizeLocale(undefined)).toBe("mn");
    expect(localeCookieValue("en")).toBe("toms-locale=en; Path=/; Max-Age=31536000; SameSite=Lax");
  });

  it("returns complete Mongolian and English UI copy", () => {
    const key: TranslationKey = "nav.tours";
    expect(translate("mn", key)).toBe("Аяллууд");
    expect(translate("en", key)).toBe("Tours");
    expect(translate("en", "table.total", { count: 24 })).toBe("24 total");
  });

  it("resolves bilingual tenant content in the selected locale", () => {
    const content = { mn: "Сөүл хотын аялал", en: "Seoul City Experience" } as const;
    expect(resolveLocalized(content, "mn")).toBe("Сөүл хотын аялал");
    expect(resolveLocalized(content, "en")).toBe("Seoul City Experience");
  });

  it("localizes operational status values instead of exposing raw enums", () => {
    expect(statusLabel("mn", "PARTIALLY_PAID")).toBe("Хэсэгчлэн төлсөн");
    expect(statusLabel("en", "PARTIALLY_PAID")).toBe("Partially paid");
    expect(statusLabel("en", "UNKNOWN_STATUS")).toBe("Unknown status");
  });

  it("formats a departure range with the correct Intl locale", () => {
    const mn = formatDepartureRange("2026-10-03", "2026-10-09", "mn", "Asia/Ulaanbaatar");
    const en = formatDepartureRange("2026-10-03", "2026-10-09", "en", "Asia/Ulaanbaatar");
    expect(mn).not.toBe(en);
    expect(en).toContain("2026");
  });
});
