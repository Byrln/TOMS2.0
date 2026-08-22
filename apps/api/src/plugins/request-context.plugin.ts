import { randomUUID } from "node:crypto";
import { Elysia } from "elysia";

export const requestContextPlugin = new Elysia({ name: "request-context" })
  .derive(({ request, set }) => {
    const requestId = request.headers.get("x-request-id") ?? randomUUID();
    set.headers["x-request-id"] = requestId;
    return { requestId, requestStartedAt: performance.now() };
  });
