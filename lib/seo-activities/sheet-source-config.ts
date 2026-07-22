import { ValidationError } from "@/lib/api/http-errors";
import {
  DEFAULT_SEO_ACTIVITIES_SPREADSHEET_ID,
  DEFAULT_SEO_ACTIVITIES_SPREADSHEET_URL,
  SEO_ACTIVITY_SHEET_TABS,
  SEO_ACTIVITY_SYNC_TYPES,
} from "@/lib/seo-activities/constants";
import {
  buildSpreadsheetEditUrl,
  normalizeSpreadsheetUrl,
} from "@/lib/seo-activities/spreadsheet-url.utils";
import { SheetConfig } from "@/models";
import type { TSheetConfigStatus } from "@/lib/seo-activities/constants";

export type TSeoActivitiesSheetSource = {
  spreadsheetId: string;
  spreadsheetUrl: string;
  lastSyncedAt: string | null;
  status: TSheetConfigStatus;
  lastError: string | null;
};

function resolveDefaultSpreadsheetSource(): { spreadsheetId: string; spreadsheetUrl: string } {
  const fromEnv = process.env.SEO_ACTIVITIES_SPREADSHEET_ID?.trim();
  const spreadsheetId = fromEnv || DEFAULT_SEO_ACTIVITIES_SPREADSHEET_ID;
  return {
    spreadsheetId,
    spreadsheetUrl: buildSpreadsheetEditUrl(spreadsheetId),
  };
}

/**
 * Ensures per-type sheet configs exist. Does not overwrite an admin-saved spreadsheet URL.
 */
export async function ensureSheetConfigs(): Promise<void> {
  const defaults = resolveDefaultSpreadsheetSource();

  for (const activityType of SEO_ACTIVITY_SYNC_TYPES) {
    const tabName = SEO_ACTIVITY_SHEET_TABS[activityType].tabName;
    const existing = await SheetConfig.findOne({ activityType });

    if (!existing) {
      await SheetConfig.create({
        activityType,
        spreadsheetId: defaults.spreadsheetId,
        spreadsheetUrl: defaults.spreadsheetUrl,
        tabName,
        status: "idle",
      });
      continue;
    }

    let dirty = false;

    if (existing.tabName !== tabName) {
      existing.tabName = tabName;
      dirty = true;
    }

    if (!existing.spreadsheetUrl?.trim()) {
      existing.spreadsheetUrl = buildSpreadsheetEditUrl(existing.spreadsheetId);
      dirty = true;
    }

    if (dirty) {
      await existing.save();
    }
  }
}

export async function getSeoActivitiesSheetSource(): Promise<TSeoActivitiesSheetSource> {
  await ensureSheetConfigs();

  const configs = await SheetConfig.find({
    activityType: { $in: [...SEO_ACTIVITY_SYNC_TYPES] },
  }).sort({ activityType: 1 });

  const primary = configs[0];
  if (!primary) {
    return {
      spreadsheetId: DEFAULT_SEO_ACTIVITIES_SPREADSHEET_ID,
      spreadsheetUrl: DEFAULT_SEO_ACTIVITIES_SPREADSHEET_URL,
      lastSyncedAt: null,
      status: "idle",
      lastError: null,
    };
  }

  let lastSyncedAt: Date | null = null;
  let status: TSheetConfigStatus = "idle";
  let lastError: string | null = null;

  for (const config of configs) {
    if (config.status === "running") status = "running";
    else if (status !== "running" && config.status === "error") status = "error";

    if (config.lastError && !lastError) lastError = config.lastError;

    if (config.lastSyncedAt && (!lastSyncedAt || config.lastSyncedAt > lastSyncedAt)) {
      lastSyncedAt = config.lastSyncedAt;
    }
  }

  return {
    spreadsheetId: primary.spreadsheetId,
    spreadsheetUrl: primary.spreadsheetUrl || buildSpreadsheetEditUrl(primary.spreadsheetId),
    lastSyncedAt: lastSyncedAt?.toISOString() ?? null,
    status,
    lastError,
  };
}

export async function updateSeoActivitiesSheetSource(rawUrl: string): Promise<TSeoActivitiesSheetSource> {
  let normalized;
  try {
    normalized = normalizeSpreadsheetUrl(rawUrl);
  } catch (error) {
    throw ValidationError.fromFieldErrors({
      spreadsheetUrl: [error instanceof Error ? error.message : "Invalid Spreadsheet Url."],
    });
  }

  await ensureSheetConfigs();

  const running = await SheetConfig.exists({
    activityType: { $in: [...SEO_ACTIVITY_SYNC_TYPES] },
    status: "running",
  });
  if (running) {
    throw new ValidationError(
      { spreadsheetUrl: ["Cannot Change Spreadsheet Url While Sync Is Running."] },
      "Cannot Change Spreadsheet Url While Sync Is Running.",
    );
  }

  // Update URL only — never force status to idle (would clear a concurrent lock).
  await SheetConfig.updateMany(
    { activityType: { $in: [...SEO_ACTIVITY_SYNC_TYPES] } },
    {
      $set: {
        spreadsheetId: normalized.spreadsheetId,
        spreadsheetUrl: normalized.spreadsheetUrl,
        lastError: null,
      },
    },
  );

  return getSeoActivitiesSheetSource();
}
