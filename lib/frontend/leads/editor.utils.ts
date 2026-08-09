import { todayLeadDate } from "@/lib/leads/normalize";
import type { TLeadDto } from "@/types/lead.types";

export type TLeadEditorValues = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  servicesInterestedIn: string;
  message: string;
  leadDate: string;
};

export function emptyLeadEditorValues(): TLeadEditorValues {
  return {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    servicesInterestedIn: "",
    message: "",
    leadDate: todayLeadDate(),
  };
}

export function leadToEditorValues(lead: TLeadDto): TLeadEditorValues {
  return {
    firstName: lead.firstName,
    lastName: lead.lastName,
    email: lead.email,
    phone: lead.phone,
    servicesInterestedIn: lead.servicesInterestedIn ?? "",
    message: lead.message,
    leadDate: lead.leadDate,
  };
}
