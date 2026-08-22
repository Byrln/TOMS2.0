import type { StaffRole } from "@toms/domain";

export interface Actor {
  userId: string;
  tenantId: string;
  role: StaffRole;
  authLevel?: string;
  claims: Record<string, unknown>;
}
