import { Elysia } from "elysia";
import type { VerifyAccessToken } from "../../plugins/auth.plugin";
import type { ApiServices } from "../../services";
import { ApiError } from "../../shared/errors/api-error";

const localeFrom = (value: unknown) => value === "en" ? "en" as const : "mn" as const;

export function travelerModule(services: ApiServices | undefined, verifyAccessToken: VerifyAccessToken) {
  const authenticate = async (headers: Headers) => {
    const token = await verifyAccessToken(headers.get("authorization"));
    if (!services) throw new ApiError(503, "SERVICE_UNAVAILABLE", "Database services are unavailable");
    return token;
  };
  return new Elysia({ name: "module.traveler" })
    .get("/api/v1/me", async ({ request, query }) => {
      const token = await authenticate(request.headers);
      return services!.traveler.profile(token, localeFrom(query.locale));
    }, { detail: { tags: ["Travelers"], summary: "Read authenticated traveler identity" } })
    .get("/api/v1/me/dashboard", async ({ request, query }) => {
      const token = await authenticate(request.headers);
      return services!.traveler.dashboard(token, localeFrom(query.locale));
    }, { detail: { tags: ["Travelers"], summary: "Read traveler portal dashboard" } })
    .get("/api/v1/me/trips", async ({ request, query }) => {
      const token = await authenticate(request.headers);
      return services!.traveler.list(token, localeFrom(query.locale));
    }, { detail: { tags: ["Travelers"], summary: "List authenticated traveler trips" } })
    .get("/api/v1/me/trips/:id", async ({ request, params, query }) => {
      const token = await authenticate(request.headers);
      return services!.traveler.get(token, params.id, localeFrom(query.locale));
    }, { detail: { tags: ["Travelers"], summary: "Read authenticated traveler trip" } })
    .get("/api/v1/me/trips/:id/timeline", async ({ request, params, query }) => {
      const token = await authenticate(request.headers);
      return services!.traveler.timeline(token, params.id, localeFrom(query.locale));
    }, { detail: { tags: ["Travelers"], summary: "Read traveler-visible trip timeline" } })
    .get("/api/v1/me/trips/:id/documents", async ({ request, params, query }) => {
      const token = await authenticate(request.headers);
      return services!.traveler.documents(token, params.id, localeFrom(query.locale));
    }, { detail: { tags: ["Travelers", "Documents"], summary: "Read traveler trip documents" } })
    .get("/api/v1/me/trips/:id/payments", async ({ request, params, query }) => {
      const token = await authenticate(request.headers);
      return services!.traveler.payments(token, params.id, localeFrom(query.locale));
    }, { detail: { tags: ["Travelers", "Finance"], summary: "Read traveler trip payments" } })
    .get("/api/v1/me/messages", async ({ request, query }) => {
      const token = await authenticate(request.headers);
      return services!.traveler.messages(token, localeFrom(query.locale));
    }, { detail: { tags: ["Travelers", "Messaging"], summary: "Read traveler messages" } })
    .get("/api/v1/me/profile", async ({ request, query }) => {
      const token = await authenticate(request.headers);
      return services!.traveler.profile(token, localeFrom(query.locale));
    }, { detail: { tags: ["Travelers"], summary: "Read traveler profile" } })
    .patch("/api/v1/me/profile", async ({ request, body, query }) => {
      const token = await authenticate(request.headers);
      return services!.traveler.updateProfile(token, body, localeFrom(query.locale));
    }, { detail: { tags: ["Travelers"], summary: "Update traveler profile" } });
}
