import type { LeadDocument } from "@/models";
import { extrasRecordFromDoc } from "@/lib/leads/extras.utils";
import type { TLeadDto } from "@/types/lead.types";

export function formatLeadDisplayName(firstName: string, lastName: string): string {
  return `${firstName.trim()} ${lastName.trim()}`.trim();
}

export function serializeLead(doc: LeadDocument): TLeadDto {
  return {
    id: String(doc._id),
    firstName: doc.firstName,
    lastName: doc.lastName,
    email: doc.email,
    phone: doc.phone,
    servicesInterestedIn: doc.servicesInterestedIn ?? null,
    message: doc.message,
    leadDate: doc.leadDate,
    extras: extrasRecordFromDoc(doc.extras),
    origin: doc.origin,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}
