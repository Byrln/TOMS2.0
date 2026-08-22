import { withUserRlsContext, type DatabaseClient, type VerifiedRlsClaims } from "@toms/db";
import type { VerifiedAccessToken } from "../../plugins/auth.plugin";
import { ApiError } from "../../shared/errors/api-error";
import { listTravelerBookings, readTravelerTrip } from "./traveler.repository";

function claimsFor(token: VerifiedAccessToken): VerifiedRlsClaims {
  return {
    sub: token.userId,
    role: "authenticated",
    iss: typeof token.claims.iss === "string" ? token.claims.iss : "",
    ...(token.claims.aud ? { aud: token.claims.aud } : {}),
    ...(typeof token.claims.email === "string" ? { email: token.claims.email } : {}),
  };
}

export function createTravelerService(client: DatabaseClient) {
  return {
    async list(token: VerifiedAccessToken, locale: "mn" | "en") {
      void locale;
      const rows = await withUserRlsContext(client.db, claimsFor(token), (tx) => listTravelerBookings(tx, token.userId));
      return { items: rows.map((row) => ({ ...row, totalMinor: Number(row.totalMinor), createdAt: row.createdAt.toISOString() })) };
    },
    async get(token: VerifiedAccessToken, bookingId: string, locale: "mn" | "en") {
      const result = await withUserRlsContext(client.db, claimsFor(token), (tx) => readTravelerTrip(tx, token.userId, bookingId, locale));
      if (!result) throw new ApiError(404, "BOOKING_NOT_FOUND", "Trip not found");
      return result;
    },
  };
}
