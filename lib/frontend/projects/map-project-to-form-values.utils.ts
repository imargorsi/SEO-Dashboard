import type { TProjectCreateFormValues } from "@/components/forms/project-create-form.types";
import type { TProjectDetail } from "@/types/project.types";

function joinCommaSeparated(values: string[]): string {
  return values.filter(Boolean).join(", ");
}

export const EMPTY_PROJECT_FORM_VALUES: TProjectCreateFormValues = {
  ownerUserId: "",
  businessName: "",
  websiteUrl: "",
  businessAddress: "",
  pocContactNumber: "",
  servicesOffered: "",
  primaryServiceToPromote: "",
  idealCustomerProfile: "",
  targetLocations: "",
  opensAt: "",
  closesAt: "",
  seoGoals: [],
  competitorUrls: "",
};

export function mapProjectDetailToFormValues(project: TProjectDetail): TProjectCreateFormValues {
  return {
    ownerUserId: "",
    businessName: project.businessName,
    websiteUrl: project.websiteUrl,
    businessAddress: project.businessAddress ?? "",
    pocContactNumber: project.pocContactNumber ?? "",
    servicesOffered: joinCommaSeparated(project.servicesOffered),
    primaryServiceToPromote: project.primaryServiceToPromote ?? "",
    idealCustomerProfile: project.idealCustomerProfile ?? "",
    targetLocations: joinCommaSeparated(project.targetLocations),
    opensAt: project.businessHours?.opensAt ?? "",
    closesAt: project.businessHours?.closesAt ?? "",
    seoGoals: [...project.seoGoals],
    competitorUrls: joinCommaSeparated(project.competitorUrls),
  };
}
