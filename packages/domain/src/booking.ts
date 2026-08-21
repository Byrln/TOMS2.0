export type HoldStatus = "ACTIVE" | "CONSUMED" | "EXPIRED" | "RELEASED";
export type BookingStatus = "DRAFT" | "HELD" | "PENDING_PAYMENT" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
export type PaymentStatus = "PENDING" | "AUTHORIZED" | "SUCCEEDED" | "FAILED" | "REFUNDED";

export class BookingConflictError extends Error {
  override name = "BookingConflictError";
}

export interface Hold {
  id: string;
  departureId: string;
  partySize: number;
  status: HoldStatus;
  createdAt: Date;
  expiresAt: Date;
}

export function createHold(input: {
  departureId: string;
  capacity: number;
  confirmed: number;
  activeHeld: number;
  requested: number;
  now: Date;
  ttlMinutes?: number;
}): Hold {
  for (const [name, value] of Object.entries({ capacity: input.capacity, confirmed: input.confirmed, activeHeld: input.activeHeld, requested: input.requested })) {
    if (!Number.isSafeInteger(value) || value < 0) throw new RangeError(`${name} must be a non-negative safe integer`);
  }
  if (input.requested < 1) throw new RangeError("requested must be at least one");
  if (input.confirmed + input.activeHeld + input.requested > input.capacity) {
    throw new BookingConflictError("The selected departure no longer has enough availability");
  }

  const ttlMinutes = input.ttlMinutes ?? 15;
  return {
    id: globalThis.crypto.randomUUID(),
    departureId: input.departureId,
    partySize: input.requested,
    status: "ACTIVE",
    createdAt: new Date(input.now),
    expiresAt: new Date(input.now.getTime() + ttlMinutes * 60_000)
  };
}

export function expireHold(hold: Pick<Hold, "status" | "expiresAt">, now: Date): HoldStatus {
  return hold.status === "ACTIVE" && hold.expiresAt.getTime() <= now.getTime() ? "EXPIRED" : hold.status;
}

const bookingTransitions: Readonly<Record<BookingStatus, ReadonlyArray<BookingStatus>>> = {
  DRAFT: ["HELD", "CANCELLED"],
  HELD: ["PENDING_PAYMENT", "CONFIRMED", "CANCELLED"],
  PENDING_PAYMENT: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["CANCELLED", "COMPLETED"],
  CANCELLED: [],
  COMPLETED: []
};

const paymentTransitions: Readonly<Record<PaymentStatus, ReadonlyArray<PaymentStatus>>> = {
  PENDING: ["AUTHORIZED", "SUCCEEDED", "FAILED"],
  AUTHORIZED: ["SUCCEEDED", "FAILED"],
  SUCCEEDED: ["REFUNDED"],
  FAILED: ["PENDING"],
  REFUNDED: []
};

export function transitionBooking(current: BookingStatus, next: BookingStatus): BookingStatus {
  if (!bookingTransitions[current].includes(next)) throw new BookingConflictError(`Booking cannot transition from ${current} to ${next}`);
  return next;
}

export function transitionPayment(current: PaymentStatus, next: PaymentStatus): PaymentStatus {
  if (!paymentTransitions[current].includes(next)) throw new BookingConflictError(`Payment cannot transition from ${current} to ${next}`);
  return next;
}
