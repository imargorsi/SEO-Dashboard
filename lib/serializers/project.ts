import type { ProjectDocument } from "@/models/Project";
import { serializeStoredImageUrl } from "@/lib/serializers/stored-image";
import type {
  TProjectBusinessHours,
  TProjectDetail,
  TProjectListItem,
  TProjectOwnerSummary,
} from "@/types/project.types";

export type ProjectListItemDto = TProjectListItem;
export type ProjectDetailDto = TProjectDetail;

function serializeTimestamp(value: Date | null | undefined): string | null {
  if (!value) return null;
  return value.toISOString();
}

function serializeBusinessHours(
  value: ProjectDocument["businessHours"],
): TProjectBusinessHours {
  if (!value) return null;
  return {
    opensAt: value.opensAt ?? null,
    closesAt: value.closesAt ?? null,
  };
}

/** Compact shape for project selector / list views. */
export function serializeProjectListItem(
  project: ProjectDocument,
  owner?: TProjectOwnerSummary | null,
): TProjectListItem {
  return {
    id: project._id.toString(),
    businessName: project.businessName,
    websiteUrl: project.websiteUrl,
    status: project.status,
    imageUrl: serializeStoredImageUrl(project.logoImage),
    owner: owner ?? null,
    createdByUserId: project.createdByUserId.toString(),
  };
}

export function serializeProject(
  project: ProjectDocument,
  owner?: TProjectOwnerSummary | null,
): TProjectDetail {
  return {
    id: project._id.toString(),
    businessName: project.businessName,
    websiteUrl: project.websiteUrl,
    businessAddress: project.businessAddress,
    logoImage: serializeStoredImageUrl(project.logoImage),
    pocContactNumber: project.pocContactNumber,
    pocEmail: project.pocEmail,
    servicesOffered: project.servicesOffered,
    primaryServiceToPromote: project.primaryServiceToPromote,
    idealCustomerProfile: project.idealCustomerProfile,
    targetLocations: project.targetLocations,
    businessHours: serializeBusinessHours(project.businessHours),
    seoGoals: project.seoGoals,
    competitorUrls: project.competitorUrls,
    status: project.status,
    owner: owner ?? null,
    createdByUserId: project.createdByUserId.toString(),
    approvedAt: serializeTimestamp(project.approvedAt),
    approvedByUserId: project.approvedByUserId?.toString() ?? null,
    rejectedAt: serializeTimestamp(project.rejectedAt),
    rejectedByUserId: project.rejectedByUserId?.toString() ?? null,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
  };
}
