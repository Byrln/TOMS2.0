import { describe, expect, it } from "vitest";
import { formatDepartureRange } from "./index";
describe("localization",()=>{it("formats a departure in the tenant timezone",()=>{expect(formatDepartureRange("2026-10-03","2026-10-09","mn-MN","Asia/Ulaanbaatar")).toContain("2026")})});

