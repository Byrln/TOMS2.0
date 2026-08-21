import { serve } from "@hono/node-server";
import { createApp } from "./app";
import { createDemoRepository } from "./repository";

const port = Number(process.env.API_PORT ?? 4000);
const demoMode = process.env.TOMS_DEMO_MODE !== "0";
if (!demoMode) throw new Error("Production Supabase repository requires server credentials; TOMS_DEMO_MODE must not be disabled without them");

serve({ fetch: createApp({ repository: createDemoRepository() }).fetch, port }, (info) => {
  process.stdout.write(`TOMS API listening on http://localhost:${info.port}\n`);
});
