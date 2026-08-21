import { describe, expect, it } from "vitest";
import { staffIdentityFromClaims } from "./index";

describe("auth claims", () => {
  it("uses immutable app metadata rather than user metadata for tenant authorization", () => {
    const identity = staffIdentityFromClaims({ sub:"user-1", email:"owner@toms.mn", app_metadata:{tenant_id:"11111111-1111-4111-8111-111111111111",role:"OWNER"}, user_metadata:{tenant_id:"evil",role:"OWNER"} });
    expect(identity.tenantId).toBe("11111111-1111-4111-8111-111111111111");
    expect(identity.role).toBe("OWNER");
  });
  it("rejects missing immutable authorization claims", () => { expect(()=>staffIdentityFromClaims({sub:"user-1",app_metadata:{}})).toThrow(); });
});

