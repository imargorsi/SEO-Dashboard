import type { ProjectDocument } from "@/models/Project";

/** Compact shape for project selector / list views. */
export function serializeProjectListItem(project: ProjectDocument) {
  return {
    id: project._id.toString(),
    businessName: project.businessName,
    websiteUrl: project.websiteUrl,
    status: project.status,
  };
}

export function serializeProject(project: ProjectDocument) {
  return {
    id: project._id.toString(),
    businessName: project.businessName,
    websiteUrl: project.websiteUrl,
    businessAddress: project.businessAddress,
    pocContactNumber: project.pocContactNumber,
    pocEmail: project.pocEmail,
    servicesOffered: project.servicesOffered,
    primaryServiceToPromote: project.primaryServiceToPromote,
    idealCustomerProfile: project.idealCustomerProfile,
    targetLocations: project.targetLocations,
    businessHours: project.businessHours,
    seoGoals: project.seoGoals,
    marketingAccess: {
      websiteLogin: project.marketingAccess.websiteLogin,
      websiteHosting: project.marketingAccess.websiteHosting,
      googleAnalytics: project.marketingAccess.googleAnalytics,
      googleSearchConsole: project.marketingAccess.googleSearchConsole,
      googleBusinessProfile: project.marketingAccess.googleBusinessProfile,
    },
    competitorUrls: project.competitorUrls,
    status: project.status,
    createdByUserId: project.createdByUserId.toString(),
    approvedAt: project.approvedAt,
    approvedByUserId: project.approvedByUserId?.toString() ?? null,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  };
}
