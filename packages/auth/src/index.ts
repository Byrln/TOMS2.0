import { z } from "zod";
import type { StaffRole } from "@toms/domain";

const staffRoleSchema = z.enum(["OWNER","ADMIN","SALES","OPERATIONS","FINANCE","CONTENT","GUIDE","VIEWER"]);
const claimsSchema = z.object({
  sub: z.string().min(1),
  email: z.email().optional(),
  app_metadata: z.object({ tenant_id: z.uuid(), role: staffRoleSchema }),
  user_metadata: z.record(z.string(), z.unknown()).optional()
});

export interface StaffIdentity { userId:string; email?:string; tenantId:string; role:StaffRole }

export function staffIdentityFromClaims(input: unknown): StaffIdentity {
  const claims=claimsSchema.parse(input);
  return { userId:claims.sub, ...(claims.email===undefined?{}:{email:claims.email}), tenantId:claims.app_metadata.tenant_id, role:claims.app_metadata.role };
}

export function authorizationHeader(token:string):{Authorization:string}{
  if(token.trim().length<16) throw new Error("A valid access token is required");
  return {Authorization:`Bearer ${token}`};
}

