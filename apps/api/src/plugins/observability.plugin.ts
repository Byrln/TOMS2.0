import { opentelemetry } from "@elysia/opentelemetry";
import { Elysia } from "elysia";
import pino, { type LevelWithSilent, type Logger } from "pino";

const redactPaths = [
  "req.headers.authorization",
  "req.headers.cookie",
  "authorization",
  "cookie",
  "accessToken",
  "refreshToken",
  "password",
  "passportNumber",
  "cardNumber",
  "cvv",
] as const;

export function createApiLogger(level: LevelWithSilent): Logger {
  return pino({
    name: "toms-api",
    level,
    base: { service: "toms-api" },
    redact: { paths: [...redactPaths], censor: "[REDACTED]" },
  });
}

export function observabilityPlugin(level: LevelWithSilent) {
  const logger = createApiLogger(level);
  const requestStarts = new WeakMap<Request, number>();
  return new Elysia({ name: "observability" })
    .use(opentelemetry({
      serviceName: "toms-api",
      recordBody: false,
      spanUrlRedaction: { stripCredentials: true, sensitiveQueryParams: ["token", "code", "email"] },
      headersToSpanAttributes: { request: ["x-request-id"], response: ["x-request-id"] },
      checkIfShouldTrace: () => level !== "silent",
    }))
    .decorate("logger", logger)
    .onRequest(({ request }) => {
      requestStarts.set(request, performance.now());
      logger.debug({ method: request.method, path: new URL(request.url).pathname }, "request.started");
    })
    .onAfterResponse(({ request, set }) => {
      const requestId = String(set.headers["x-request-id"] ?? request.headers.get("x-request-id") ?? "unknown");
      const requestStartedAt = requestStarts.get(request) ?? performance.now();
      logger.info({
        requestId,
        method: request.method,
        path: new URL(request.url).pathname,
        status: Number(set.status || 200),
        durationMs: Math.round((performance.now() - requestStartedAt) * 100) / 100,
      }, "request.completed");
    })
    .onError(({ request, error, set }) => {
      const requestId = String(set.headers["x-request-id"] ?? request.headers.get("x-request-id") ?? "unknown");
      logger.error({
        requestId,
        method: request.method,
        path: new URL(request.url).pathname,
        errorName: error instanceof Error ? error.name : "UnknownError",
      }, "request.failed");
    });
}
