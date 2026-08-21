import { describe, expect, it } from "vitest";
import { analyticsEventSchema } from "./index";
describe("typed analytics",()=>{it("accepts a versioned booking funnel event",()=>{const event=analyticsEventSchema.parse({eventId:"42bc3066-0db1-4d4b-b3c4-1ca6d6077475",eventType:"booking.confirmed",tenantId:"42bc3066-0db1-4d4b-b3c4-1ca6d6077476",occurredAt:"2026-08-21T09:00:00Z",schemaVersion:1,properties:{bookingId:"b1",valueMinor:3030000,currency:"MNT"}});expect(event.eventType).toBe("booking.confirmed")});it("rejects random console-style event names",()=>{expect(()=>analyticsEventSchema.parse({eventId:"x",eventType:"clicked thing",tenantId:"x",occurredAt:"now",schemaVersion:1,properties:{}})).toThrow()})});

