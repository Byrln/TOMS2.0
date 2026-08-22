export type ApiErrorCode =
  | "AUTH_REQUIRED"
  | "FORBIDDEN"
  | "TENANT_NOT_FOUND"
  | "TOUR_NOT_FOUND"
  | "DESTINATION_NOT_FOUND"
  | "DEPARTURE_NOT_FOUND"
  | "BOOKING_NOT_FOUND"
  | "PAGE_NOT_FOUND"
  | "PROFILE_NOT_FOUND"
  | "INVENTORY_UNAVAILABLE"
  | "HOLD_EXPIRED"
  | "IDEMPOTENCY_KEY_REQUIRED"
  | "PAYMENT_NOT_CONFIRMED"
  | "VALIDATION_FAILED"
  | "CONFLICT"
  | "SERVICE_UNAVAILABLE"
  | "INTERNAL_ERROR";

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: ApiErrorCode,
    message: string,
    readonly fieldErrors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function errorBody(error: ApiError, requestId: string) {
  return {
    error: {
      code: error.code,
      message: error.message,
      ...(error.fieldErrors ? { fieldErrors: error.fieldErrors } : {}),
      requestId,
    },
  };
}
