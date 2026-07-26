import type { Types } from "mongoose";
import { after } from "next/server";

import type { AuthContext } from "@/lib/auth/guards";
import type { TGoogleIntegrationService } from "@/lib/integrations/constants";
import { serializeProjectIntegration } from "@/lib/integrations/serialize-integration";
import { syncProjectIntegrations } from "@/lib/integrations/sync-analytics";
import { AnalyticsDailyMetric, AnalyticsDimensionRow, ProjectIntegration } from "@/models";
import type { ConnectGoogleIntegrationInput } from "@/schemas/analytics";
import type { TProjectIntegrationDto } from "@/types/analytics.types";

function normalizeExternalPropertyId(
  service: TGoogleIntegrationService,
  value: string,
): string {
  const trimmed = value.trim();
  if (service === "ga4" && !trimmed.startsWith("properties/")) {
    return `properties/${trimmed}`;
  }
  return trimmed;
}

/** Remove cached rows for one project + source so a property change cannot mix histories. */
export async function purgeAnalyticsCacheForService(
  projectId: string | Types.ObjectId,
  service: TGoogleIntegrationService,
): Promise<void> {
  await Promise.all([
    AnalyticsDailyMetric.deleteMany({ projectId, source: service }),
    AnalyticsDimensionRow.deleteMany({ projectId, source: service }),
  ]);
}

function scheduleServiceSync(projectId: string, service: TGoogleIntegrationService): void {
  after(async () => {
    try {
      await syncProjectIntegrations(projectId, [service]);
    } catch {
      // Errors are persisted on the integration document by the sync service.
    }
  });
}

export async function connectGoogleIntegration(
  auth: AuthContext,
  projectId: string,
  service: TGoogleIntegrationService,
  input: ConnectGoogleIntegrationInput,
): Promise<TProjectIntegrationDto> {
  const externalPropertyId = normalizeExternalPropertyId(service, input.externalPropertyId);
  const connectedByUserId = auth.user._id as Types.ObjectId;

  const existing = await ProjectIntegration.findOne({
    projectId,
    provider: "google",
    service,
  });

  const propertyChanged =
    !existing ||
    existing.status === "disconnected" ||
    existing.externalPropertyId !== externalPropertyId;

  if (propertyChanged) {
    await purgeAnalyticsCacheForService(projectId, service);
  }

  const doc = await ProjectIntegration.findOneAndUpdate(
    { projectId, provider: "google", service },
    {
      $set: {
        status: "connected",
        externalPropertyId,
        lastError: null,
        connectedByUserId,
        connectedAt: new Date(),
        ...(propertyChanged ? { lastSyncedAt: null } : {}),
      },
      $setOnInsert: {
        projectId,
        provider: "google",
        service,
      },
    },
    { upsert: true, new: true },
  );

  // Always kick a sync after connect/update. Property changes force a full backfill
  // because lastSyncedAt was cleared above.
  scheduleServiceSync(projectId, service);

  return serializeProjectIntegration(doc);
}

export async function disconnectGoogleIntegration(
  projectId: string,
  service: TGoogleIntegrationService,
): Promise<TProjectIntegrationDto | null> {
  await purgeAnalyticsCacheForService(projectId, service);

  const doc = await ProjectIntegration.findOneAndUpdate(
    { projectId, provider: "google", service },
    {
      $set: {
        status: "disconnected",
        externalPropertyId: null,
        lastError: null,
        lastSyncedAt: null,
        connectedAt: null,
        connectedByUserId: null,
      },
    },
    { new: true },
  );

  return doc ? serializeProjectIntegration(doc) : null;
}

export async function getGoogleIntegration(
  projectId: string,
  service: TGoogleIntegrationService,
): Promise<TProjectIntegrationDto | null> {
  const doc = await ProjectIntegration.findOne({ projectId, provider: "google", service });
  return doc ? serializeProjectIntegration(doc) : null;
}
