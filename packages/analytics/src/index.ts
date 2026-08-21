import { z } from "zod";

export const analyticsEventTypeSchema=z.enum([
  "storefront.viewed","tour.viewed","departure.selected","promotion.exposed","promotion.engaged","checkout.started","booking.hold_created","booking.confirmed","payment.succeeded","add_on.purchased","trip.completed","review.submitted"
]);
export const analyticsEventSchema=z.object({
  eventId:z.uuid(),eventType:analyticsEventTypeSchema,tenantId:z.uuid(),occurredAt:z.iso.datetime({offset:true}),schemaVersion:z.literal(1),anonymousId:z.string().max(128).optional(),userId:z.string().max(128).optional(),properties:z.record(z.string(),z.union([z.string(),z.number(),z.boolean(),z.null()]))
});
export type AnalyticsEvent=z.infer<typeof analyticsEventSchema>;
export interface AnalyticsSink{write(event:AnalyticsEvent):Promise<void>}
export async function track(sink:AnalyticsSink,input:unknown):Promise<void>{await sink.write(analyticsEventSchema.parse(input))}

