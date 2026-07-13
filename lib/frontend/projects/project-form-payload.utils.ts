import type { TCreateProjectPayload, TUpdateProjectPayload } from "@/features/projects/projects.api";
import type { TProjectCreateFormValues } from "@/components/forms/project-create-form.types";

export function splitCommaSeparated(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function optionalText(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export function toCreateProjectPayload(
  values: TProjectCreateFormValues,
  isAdmin: boolean,
): TCreateProjectPayload {
  const opensAt = optionalText(values.opensAt);
  const closesAt = optionalText(values.closesAt);

  return {
    ...(isAdmin ? { ownerUserId: optionalText(values.ownerUserId) ?? undefined } : {}),
    businessName: values.businessName.trim(),
    websiteUrl: values.websiteUrl.trim(),
    businessAddress: optionalText(values.businessAddress),
    pocContactNumber: optionalText(values.pocContactNumber),
    servicesOffered: splitCommaSeparated(values.servicesOffered),
    primaryServiceToPromote: optionalText(values.primaryServiceToPromote),
    idealCustomerProfile: optionalText(values.idealCustomerProfile),
    targetLocations: splitCommaSeparated(values.targetLocations),
    businessHours: opensAt || closesAt ? { opensAt, closesAt } : null,
    seoGoals: values.seoGoals,
    competitorUrls: splitCommaSeparated(values.competitorUrls),
  };
}

export function toUpdateProjectPayload(values: TProjectCreateFormValues): TUpdateProjectPayload {
  const opensAt = optionalText(values.opensAt);
  const closesAt = optionalText(values.closesAt);

  return {
    websiteUrl: values.websiteUrl.trim(),
    businessAddress: optionalText(values.businessAddress),
    pocContactNumber: optionalText(values.pocContactNumber),
    servicesOffered: splitCommaSeparated(values.servicesOffered),
    primaryServiceToPromote: optionalText(values.primaryServiceToPromote),
    idealCustomerProfile: optionalText(values.idealCustomerProfile),
    targetLocations: splitCommaSeparated(values.targetLocations),
    businessHours: opensAt || closesAt ? { opensAt, closesAt } : null,
    seoGoals: values.seoGoals,
    competitorUrls: splitCommaSeparated(values.competitorUrls),
  };
}
