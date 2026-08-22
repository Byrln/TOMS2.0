import { desc, eq } from "drizzle-orm";
import {
  bookings,
  conversations,
  customerAccounts,
  documents,
  invoices,
  organizations,
  payments,
  people,
  promotions,
  travelerProfiles,
  type TomsTransaction,
} from "@toms/db";

export type BackofficeResource = "bookings" | "travelers" | "customers" | "conversations" | "payments" | "invoices" | "documents" | "promotions";

export async function listBackofficeResource(tx: TomsTransaction, tenantId: string, resource: BackofficeResource) {
  switch (resource) {
    case "bookings":
      return tx.select({ id: bookings.id, bookingNumber: bookings.bookingNumber, organizerEmail: bookings.organizerEmail, partySize: bookings.partySize, status: bookings.status, paymentStatus: bookings.paymentStatus, totalMinor: bookings.totalMinor, currency: bookings.currency, createdAt: bookings.createdAt })
        .from(bookings).where(eq(bookings.tenantId, tenantId)).orderBy(desc(bookings.createdAt)).limit(100);
    case "travelers":
      return tx.select({ id: travelerProfiles.id, firstName: people.firstName, lastName: people.lastName, email: people.email, nationality: people.nationality, documentReadiness: travelerProfiles.documentReadiness, visaStatus: travelerProfiles.visaStatus, createdAt: travelerProfiles.createdAt })
        .from(travelerProfiles).innerJoin(people, eq(people.id, travelerProfiles.personId)).where(eq(travelerProfiles.tenantId, tenantId)).orderBy(desc(travelerProfiles.createdAt)).limit(100);
    case "customers":
      return tx.select({ id: customerAccounts.id, firstName: people.firstName, lastName: people.lastName, email: people.email, organization: organizations.legalName, segment: customerAccounts.segment, source: customerAccounts.source, createdAt: customerAccounts.createdAt })
        .from(customerAccounts).leftJoin(people, eq(people.id, customerAccounts.personId)).leftJoin(organizations, eq(organizations.id, customerAccounts.organizationId)).where(eq(customerAccounts.tenantId, tenantId)).orderBy(desc(customerAccounts.createdAt)).limit(100);
    case "conversations":
      return tx.select({ id: conversations.id, subject: conversations.subject, channel: conversations.channel, status: conversations.status, bookingId: conversations.bookingId, updatedAt: conversations.updatedAt })
        .from(conversations).where(eq(conversations.tenantId, tenantId)).orderBy(desc(conversations.updatedAt)).limit(100);
    case "payments":
      return tx.select({ id: payments.id, provider: payments.provider, providerTransactionId: payments.providerTransactionId, status: payments.status, amountMinor: payments.amountMinor, currency: payments.currency, reconciliationStatus: payments.reconciliationStatus, createdAt: payments.createdAt })
        .from(payments).where(eq(payments.tenantId, tenantId)).orderBy(desc(payments.createdAt)).limit(100);
    case "invoices":
      return tx.select({ id: invoices.id, invoiceNumber: invoices.invoiceNumber, status: invoices.status, totalMinor: invoices.totalMinor, paidMinor: invoices.paidMinor, currency: invoices.currency, issuedAt: invoices.issuedAt, dueAt: invoices.dueAt })
        .from(invoices).where(eq(invoices.tenantId, tenantId)).orderBy(desc(invoices.createdAt)).limit(100);
    case "documents":
      return tx.select({ id: documents.id, title: documents.titleI18n, type: documents.type, visibility: documents.visibility, contentType: documents.contentType, expiresAt: documents.expiresAt, createdAt: documents.createdAt })
        .from(documents).where(eq(documents.tenantId, tenantId)).orderBy(desc(documents.createdAt)).limit(100);
    case "promotions":
      return tx.select({ id: promotions.id, code: promotions.code, name: promotions.nameI18n, presentation: promotions.presentation, status: promotions.status, startsAt: promotions.startsAt, endsAt: promotions.endsAt, redemptionLimit: promotions.redemptionLimit })
        .from(promotions).where(eq(promotions.tenantId, tenantId)).orderBy(desc(promotions.createdAt)).limit(100);
  }
}
