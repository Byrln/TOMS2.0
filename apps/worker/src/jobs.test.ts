import { describe, expect, it } from "vitest";
import { processExpiredHolds, runIdempotent } from "./jobs";

describe("worker jobs", () => {
  it("expires active overdue holds and leaves future holds alone", () => {
    const holds = [
      { id: "past", status: "ACTIVE" as const, expiresAt: new Date("2026-08-21T08:00:00Z") },
      { id: "future", status: "ACTIVE" as const, expiresAt: new Date("2026-08-21T10:00:00Z") }
    ];
    expect(processExpiredHolds(holds, new Date("2026-08-21T09:00:00Z"))).toEqual(["past"]);
  });

  it("runs each outbox event once", async () => {
    const processed = new Set<string>();
    let calls = 0;
    await runIdempotent("event-1", processed, async () => { calls += 1; });
    await runIdempotent("event-1", processed, async () => { calls += 1; });
    expect(calls).toBe(1);
  });
});
