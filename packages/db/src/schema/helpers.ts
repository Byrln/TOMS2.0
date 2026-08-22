import { jsonb, timestamp, uuid } from "drizzle-orm/pg-core";

export type SupportedContentLocale = "mn" | "en";
export type LocalizedText = Readonly<Record<SupportedContentLocale, string>>;

export const localizedText = (name: string) => jsonb(name).$type<LocalizedText>();
export const tenantIdColumn = () => uuid("tenant_id").notNull();
export const timestamps = () => ({
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
