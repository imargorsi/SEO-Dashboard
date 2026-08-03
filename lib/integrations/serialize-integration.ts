import type { ProjectIntegrationDocument } from "@/models/ProjectIntegration";
import type { TProjectIntegrationDto } from "@/types/analytics.types";

export function serializeProjectIntegration(
  doc: ProjectIntegrationDocument,
): TProjectIntegrationDto {
  return {
    id: String(doc._id),
    projectId: String(doc.projectId),
    provider: doc.provider,
    service: doc.service,
    status: doc.status,
    externalPropertyId: doc.externalPropertyId,
    lastSyncedAt: doc.lastSyncedAt ? doc.lastSyncedAt.toISOString() : null,
    lastError: doc.lastError,
    connectedAt: doc.connectedAt ? doc.connectedAt.toISOString() : null,
  };
}
