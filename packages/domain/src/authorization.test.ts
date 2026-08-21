import { describe, expect, it } from "vitest";
import { can, projectTravelerItinerary } from "./index";

describe("permissions", () => {
  it("separates finance, content and sensitive traveler access", () => {
    expect(can("FINANCE", "payment:read")).toBe(true);
    expect(can("FINANCE", "passport:read")).toBe(false);
    expect(can("CONTENT", "storefront:publish")).toBe(true);
    expect(can("CONTENT", "payment:read")).toBe(false);
  });

  it("exposes only traveler-visible itinerary fields", () => {
    const projected = projectTravelerItinerary([
      { id: "e1", title: "Airport pickup", startsAt: "2026-10-03T07:30:00Z", visibility: "TRAVELER", internalNote: "supplier cost 20" },
      { id: "e2", title: "Guide briefing", startsAt: "2026-10-03T06:00:00Z", visibility: "STAFF", internalNote: "private" }
    ]);
    expect(projected).toEqual([{ id: "e1", title: "Airport pickup", startsAt: "2026-10-03T07:30:00Z" }]);
  });
});

