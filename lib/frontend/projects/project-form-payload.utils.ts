import type { TCreateProjectPayload, TUpdateProjectPayload } from "@/features/projects/projects.api";
import type { TProjectCreateFormValues } from "@/components/forms/project-create-form.types";
import { normalizeWebsiteUrl } from "@/lib/projects/website-url.utils";

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

/** Dial-code-only values (e.g. "+966") mean the user never entered a number. */
export function optionalPhone(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^\+\d{1,4}$/.test(trimmed)) return null;
  return trimmed;
}

export function toCreateProjectPayload(
  values: TProjectCreateFormValues,
  isAdmin: boolean,
): TCreateProjectPayload {
  return {
    ...(isAdmin ? { ownerUserId: optionalText(values.ownerUserId) ?? undefined } : {}),
    businessName: values.businessName.trim(),
    websiteUrl: normalizeWebsiteUrl(values.websiteUrl),
    businessAddress: optionalText(values.businessAddress),
    pocContactNumber: optionalPhone(values.pocContactNumber),
    servicesOffered: splitCommaSeparated(values.servicesOffered),
    primaryServiceToPromote: optionalText(values.primaryServiceToPromote),
    idealCustomerProfile: optionalText(values.idealCustomerProfile),
    targetLocations: splitCommaSeparated(values.targetLocations),
    seoGoals: values.seoGoals,
    competitorUrls: splitCommaSeparated(values.competitorUrls),
  };
}

export function toUpdateProjectPayload(values: TProjectCreateFormValues): TUpdateProjectPayload {
  return {
    websiteUrl: normalizeWebsiteUrl(values.websiteUrl),
    businessAddress: optionalText(values.businessAddress),
    pocContactNumber: optionalPhone(values.pocContactNumber),
    servicesOffered: splitCommaSeparated(values.servicesOffered),
    primaryServiceToPromote: optionalText(values.primaryServiceToPromote),
    idealCustomerProfile: optionalText(values.idealCustomerProfile),
    targetLocations: splitCommaSeparated(values.targetLocations),
    seoGoals: values.seoGoals,
    competitorUrls: splitCommaSeparated(values.competitorUrls),
  };
}
