import { eq } from "drizzle-orm";
import { tenantDomains, type TomsTransaction } from "@toms/db";

export async function findTenantIdByHost(tx: TomsTransaction, host: string): Promise<string | null> {
  const rows = await tx.select({ tenantId: tenantDomains.tenantId }).from(tenantDomains)
    .where(eq(tenantDomains.host, host)).limit(1);
  return rows[0]?.tenantId ?? null;
}
