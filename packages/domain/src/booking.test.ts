import { describe, expect, it } from "vitest";
import { BookingConflictError, createHold, expireHold, transitionBooking, transitionPayment } from "./index";

describe("inventory holds", () => {
  it("creates an active hold only when requested seats are available", () => {
    const hold = createHold({ departureId: "dep-1", capacity: 32, confirmed: 29, activeHeld: 1, requested: 2, now: new Date("2026-08-21T08:00:00Z") });
    expect(hold.status).toBe("ACTIVE");
    expect(hold.expiresAt.toISOString()).toBe("2026-08-21T08:15:00.000Z");
  });

  it("rejects overselling", () => {
    expect(() => createHold({ departureId: "dep-1", capacity: 32, confirmed: 30, activeHeld: 1, requested: 2, now: new Date() })).toThrow(BookingConflictError);
  });

  it("expires only active overdue holds", () => {
    expect(expireHold({ status: "ACTIVE", expiresAt: new Date("2026-08-21T08:00:00Z") }, new Date("2026-08-21T08:01:00Z"))).toBe("EXPIRED");
  });
});

describe("state transitions", () => {
  it("allows held bookings to confirm after payment", () => {
    expect(transitionPayment("PENDING", "SUCCEEDED")).toBe("SUCCEEDED");
    expect(transitionBooking("HELD", "CONFIRMED")).toBe("CONFIRMED");
  });

  it("rejects invalid terminal transitions", () => {
    expect(() => transitionBooking("CANCELLED", "CONFIRMED")).toThrow(BookingConflictError);
    expect(() => transitionPayment("REFUNDED", "SUCCEEDED")).toThrow(BookingConflictError);
  });
});

