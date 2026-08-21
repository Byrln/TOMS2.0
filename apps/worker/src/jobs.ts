import { expireHold, type HoldStatus } from "@toms/domain";

export interface ExpirableHold {
  id: string;
  status: HoldStatus;
  expiresAt: Date;
}

export function processExpiredHolds(holds: ReadonlyArray<ExpirableHold>, now: Date): string[] {
  return holds.filter((hold) => expireHold(hold, now) === "EXPIRED" && hold.status === "ACTIVE").map((hold) => hold.id);
}

export async function runIdempotent(
  eventId: string,
  processed: Set<string>,
  handler: () => Promise<void>
): Promise<boolean> {
  if (processed.has(eventId)) return false;
  await handler();
  processed.add(eventId);
  return true;
}

