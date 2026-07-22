import type { TSeoActivityType } from "@/types/seo-activity.types";

/** Public master spreadsheet used for SEO activity CSV sync. */
export const DEFAULT_SEO_ACTIVITIES_SPREADSHEET_ID =
  "1aCBQ30d9r3VSUbVxlrq4HC4t8x2CZaNCqjKehSgAXU4";

export const DEFAULT_SEO_ACTIVITIES_SPREADSHEET_URL = `https://docs.google.com/spreadsheets/d/${DEFAULT_SEO_ACTIVITIES_SPREADSHEET_ID}/edit`;

export const SEO_ACTIVITY_SHEET_TABS: Record<
  TSeoActivityType,
  { tabName: string; label: string }
> = {
  blogs: { tabName: "Blog", label: "Blogs" },
  backlinks: { tabName: "GP", label: "Backlinks" },
  web_changes: { tabName: "Service", label: "Web Changes" },
};

export const SEO_ACTIVITY_SYNC_TYPES = ["blogs", "backlinks", "web_changes"] as const;

export const SEO_ACTIVITY_LIST_DEFAULT_PER_PAGE = 6;
export const SEO_ACTIVITY_LIST_MAX_PER_PAGE = 50;

/** Prevent stuck locks after crash/deploy mid-sync. */
export const SEO_ACTIVITY_SYNC_LOCK_TTL_MS = 15 * 60 * 1000;

/** Server-side minimum interval between successful full syncs. */
export const SEO_ACTIVITY_SYNC_COOLDOWN_MS = 60 * 60 * 1000;

/** Reject oversized public CSV payloads. */
export const SEO_ACTIVITY_CSV_MAX_BYTES = 5 * 1024 * 1024;

export const SHEET_CONFIG_STATUSES = ["idle", "running", "error"] as const;
export type TSheetConfigStatus = (typeof SHEET_CONFIG_STATUSES)[number];
