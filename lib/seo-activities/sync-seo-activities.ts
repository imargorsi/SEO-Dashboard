import mongoose from "mongoose";

import { HttpError, ValidationError } from "@/lib/api/http-errors";
import {
  SEO_ACTIVITY_SYNC_COOLDOWN_MS,
  SEO_ACTIVITY_SYNC_LOCK_TTL_MS,
  SEO_ACTIVITY_SYNC_TYPES,
} from "@/lib/seo-activities/constants";
import { mapCsvRows } from "@/lib/seo-activities/column-mapper";
import {
  buildProjectNameResolver,
  resolveProjectIdForSiteName,
} from "@/lib/seo-activities/project-site-resolver";
import { ensureSheetConfigs } from "@/lib/seo-activities/sheet-source-config";
import { sanitizeHttpUrl } from "@/lib/seo-activities/sanitize-url";
import { fetchSpreadsheetCsv } from "@/lib/seo-activities/spreadsheet-fetcher";
import { SeoActivity, SheetConfig } from "@/models";
import type { TSeoActivityType } from "@/types/seo-activity.types";

export type TSeoActivitySyncTypeResult = {
  activityType: TSeoActivityType;
  fetched: number;
  imported: number;
  skipped: number;
  deleted: number;
};

export type TSeoActivitySyncResult = {
  types: TSeoActivitySyncTypeResult[];
  totals: {
    fetched: number;
    imported: number;
    skipped: number;
    deleted: number;
  };
};

async function assertSyncCooldownAllows(): Promise<void> {
  const latest = await SheetConfig.findOne({
    activityType: { $in: [...SEO_ACTIVITY_SYNC_TYPES] },
    lastSyncedAt: { $ne: null },
  })
    .sort({ lastSyncedAt: -1 })
    .select("lastSyncedAt");

  if (!latest?.lastSyncedAt) return;

  const elapsed = Date.now() - latest.lastSyncedAt.getTime();
  if (elapsed < SEO_ACTIVITY_SYNC_COOLDOWN_MS) {
    const minutes = Math.max(1, Math.ceil((SEO_ACTIVITY_SYNC_COOLDOWN_MS - elapsed) / 60_000));
    throw new HttpError(
      429,
      `Sync Is Limited To Once Per Hour. Try Again In ${minutes} Min.`,
    );
  }
}

async function acquireSyncLock(activityType: TSeoActivityType): Promise<void> {
  const lockExpiredBefore = new Date(Date.now() - SEO_ACTIVITY_SYNC_LOCK_TTL_MS);
  const now = new Date();

  const updated = await SheetConfig.findOneAndUpdate(
    {
      activityType,
      $or: [
        { status: { $ne: "running" } },
        { lockAcquiredAt: null },
        { lockAcquiredAt: { $lt: lockExpiredBefore } },
      ],
    },
    {
      $set: {
        status: "running",
        lockAcquiredAt: now,
        lastError: null,
      },
    },
    { returnDocument: "after" },
  );

  if (!updated) {
    throw new HttpError(409, "SEO Activities Sync Is Already Running.");
  }
}

async function markSyncSuccess(
  activityType: TSeoActivityType,
  syncedByUserId: string,
): Promise<void> {
  await SheetConfig.updateOne(
    { activityType },
    {
      $set: {
        status: "idle",
        lockAcquiredAt: null,
        lastSyncedAt: new Date(),
        lastError: null,
        syncedByUserId: new mongoose.Types.ObjectId(syncedByUserId),
      },
    },
  );
}

async function markSyncError(activityType: TSeoActivityType, message: string): Promise<void> {
  await SheetConfig.updateOne(
    { activityType },
    {
      $set: {
        status: "error",
        lockAcquiredAt: null,
        lastError: message.slice(0, 1000),
      },
    },
  );
}

async function releaseRunningLock(activityType: TSeoActivityType): Promise<void> {
  await SheetConfig.updateOne(
    { activityType, status: "running" },
    { $set: { status: "idle", lockAcquiredAt: null } },
  );
}

async function syncOneType(
  activityType: TSeoActivityType,
  syncedByUserId: string,
  siteResolver: Map<string, string>,
): Promise<TSeoActivitySyncTypeResult> {
  await acquireSyncLock(activityType);

  try {
    const config = await SheetConfig.findOne({ activityType });
    if (!config) {
      throw new Error(`Sheet Config Missing For ${activityType}.`);
    }

    const csvRows = await fetchSpreadsheetCsv(config.spreadsheetId, config.tabName);
    const mappedRows = mapCsvRows(csvRows);

    if (mappedRows.length === 0) {
      await markSyncSuccess(activityType, syncedByUserId);
      return {
        activityType,
        fetched: 0,
        imported: 0,
        skipped: 0,
        deleted: 0,
      };
    }

    const incomingRowNumbers = mappedRows.map((row) => row.sourceRowNumber);
    const unresolvedRowNumbers: number[] = [];
    const resolvedRows: Array<{
      row: (typeof mappedRows)[number];
      projectId: string;
      siteName: string;
    }> = [];

    for (const row of mappedRows) {
      const projectId = resolveProjectIdForSiteName(row.siteName, siteResolver);
      if (!projectId || !row.siteName) {
        unresolvedRowNumbers.push(row.sourceRowNumber);
        continue;
      }
      resolvedRows.push({ row, projectId, siteName: row.siteName });
    }

    const imported = resolvedRows.length;
    const skipped = unresolvedRowNumbers.length;

    if (imported === 0 && skipped > 0) {
      throw new ValidationError(
        {
          sync: [
            "No Rows Were Imported. Update The Sheet Site Column To Match Project Business Names.",
          ],
        },
        "No Rows Were Imported. Update The Sheet Site Column To Match Project Business Names.",
      );
    }

    const bulkOps = resolvedRows.map(({ row, projectId, siteName }) => ({
      updateOne: {
        filter: { activityType, sourceRowNumber: row.sourceRowNumber },
        update: {
          $set: {
            projectId: new mongoose.Types.ObjectId(projectId),
            activityType,
            sourceRowNumber: row.sourceRowNumber,
            siteCode: siteName,
            title: row.title,
            url: sanitizeHttpUrl(row.url),
            details: row.details,
            anchorText: row.anchorText,
            occurredOn: row.occurredOn,
            occurredOnRaw: row.occurredOnRaw,
          },
        },
        upsert: true,
      },
    }));

    if (bulkOps.length > 0) {
      await SeoActivity.bulkWrite(bulkOps, { ordered: false });
    }

    const deleteMissing = await SeoActivity.deleteMany({
      activityType,
      sourceRowNumber: { $nin: incomingRowNumbers },
    });

    const deleteUnresolved =
      unresolvedRowNumbers.length > 0
        ? await SeoActivity.deleteMany({
            activityType,
            sourceRowNumber: { $in: unresolvedRowNumbers },
          })
        : { deletedCount: 0 };

    const deleted = (deleteMissing.deletedCount ?? 0) + (deleteUnresolved.deletedCount ?? 0);

    await markSyncSuccess(activityType, syncedByUserId);

    return {
      activityType,
      fetched: mappedRows.length,
      imported,
      skipped,
      deleted,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await markSyncError(activityType, message);
    throw error;
  } finally {
    await releaseRunningLock(activityType);
  }
}

/**
 * Admin-only public CSV sync for Blog / GP / Service tabs into MongoDB.
 * Uses the spreadsheet URL saved in SheetConfig (editable in Settings).
 */
export async function syncSeoActivities(syncedByUserId: string): Promise<TSeoActivitySyncResult> {
  await ensureSheetConfigs();
  await assertSyncCooldownAllows();

  const siteResolver = await buildProjectNameResolver();

  if (siteResolver.size === 0) {
    throw new ValidationError(
      {
        sync: ["No Projects Found. Create Projects Before Syncing Sheet Rows."],
      },
      "No Projects Found. Create Projects Before Syncing Sheet Rows.",
    );
  }

  const types: TSeoActivitySyncTypeResult[] = [];

  for (const activityType of SEO_ACTIVITY_SYNC_TYPES) {
    const result = await syncOneType(activityType, syncedByUserId, siteResolver);
    types.push(result);
  }

  return {
    types,
    totals: {
      fetched: types.reduce((sum, item) => sum + item.fetched, 0),
      imported: types.reduce((sum, item) => sum + item.imported, 0),
      skipped: types.reduce((sum, item) => sum + item.skipped, 0),
      deleted: types.reduce((sum, item) => sum + item.deleted, 0),
    },
  };
}
