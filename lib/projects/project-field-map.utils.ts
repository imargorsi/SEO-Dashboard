import type { CreateProjectInput, UpdateProjectInput } from "@/schemas/project";
import { normalizeWebsiteUrl } from "@/lib/projects/website-url.utils";

export function emptyToNull(value: string | null | undefined): string | null {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

export function mapCreateProjectFields(input: CreateProjectInput) {
  return {
    businessName: input.businessName.trim(),
    websiteUrl: normalizeWebsiteUrl(input.websiteUrl),
    businessAddress: emptyToNull(input.businessAddress),
    pocContactNumber: emptyToNull(input.pocContactNumber),
    servicesOffered: input.servicesOffered ?? [],
    primaryServiceToPromote: emptyToNull(input.primaryServiceToPromote),
    idealCustomerProfile: emptyToNull(input.idealCustomerProfile),
    targetLocations: input.targetLocations ?? [],
    seoGoals: input.seoGoals ?? [],
    competitorUrls: input.competitorUrls ?? [],
  };
}

export function mapUpdateProjectFields(
  input: UpdateProjectInput,
  presentFields: ReadonlySet<string>,
): Record<string, unknown> {
  const update: Record<string, unknown> = {};

  if (presentFields.has("websiteUrl") && input.websiteUrl !== undefined) {
    update.websiteUrl = normalizeWebsiteUrl(input.websiteUrl);
  }

  if (presentFields.has("businessAddress")) {
    update.businessAddress = emptyToNull(input.businessAddress);
  }

  if (presentFields.has("pocContactNumber")) {
    update.pocContactNumber = emptyToNull(input.pocContactNumber);
  }

  if (presentFields.has("servicesOffered")) {
    update.servicesOffered = input.servicesOffered ?? [];
  }

  if (presentFields.has("primaryServiceToPromote")) {
    update.primaryServiceToPromote = emptyToNull(input.primaryServiceToPromote);
  }

  if (presentFields.has("idealCustomerProfile")) {
    update.idealCustomerProfile = emptyToNull(input.idealCustomerProfile);
  }

  if (presentFields.has("targetLocations")) {
    update.targetLocations = input.targetLocations ?? [];
  }

  if (presentFields.has("seoGoals")) {
    update.seoGoals = input.seoGoals ?? [];
  }

  if (presentFields.has("competitorUrls")) {
    update.competitorUrls = input.competitorUrls ?? [];
  }

  return update;
}
