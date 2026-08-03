import { google } from "googleapis";

import { ANALYTICS_DIMENSION_TOP_N } from "@/lib/integrations/constants";
import {
  createSearchConsoleAuth,
  withGoogleBackoff,
} from "@/lib/integrations/google/auth";

export type TGscDailyTotals = {
  date: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

export type TGscDimensionRow = {
  date: string;
  dimensionValue: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

export async function listGscSites(): Promise<Array<{ id: string; name: string }>> {
  const auth = createSearchConsoleAuth();
  const searchconsole = google.searchconsole({ version: "v1", auth });

  const response = await withGoogleBackoff(() => searchconsole.sites.list({}));
  const entries = response.data.siteEntry ?? [];

  return entries
    .filter((entry) => Boolean(entry.siteUrl))
    .map((entry) => ({
      id: entry.siteUrl!,
      name: entry.siteUrl!,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function fetchGscDailyTotals(
  siteUrl: string,
  startDate: string,
  endDate: string,
): Promise<TGscDailyTotals[]> {
  const auth = createSearchConsoleAuth();
  const searchconsole = google.searchconsole({ version: "v1", auth });

  const response = await withGoogleBackoff(() =>
    searchconsole.searchanalytics.query({
      siteUrl,
      requestBody: {
        startDate,
        endDate,
        dimensions: ["date"],
        rowLimit: 25000,
      },
    }),
  );

  return (response.data.rows ?? [])
    .map((row) => ({
      date: row.keys?.[0] ?? "",
      clicks: row.clicks ?? 0,
      impressions: row.impressions ?? 0,
      ctr: row.ctr ?? 0,
      position: row.position ?? 0,
    }))
    .filter((row) => Boolean(row.date));
}

async function fetchGscDimensionRows(
  siteUrl: string,
  startDate: string,
  endDate: string,
  dimension: "query" | "page" | "country" | "device",
): Promise<TGscDimensionRow[]> {
  const auth = createSearchConsoleAuth();
  const searchconsole = google.searchconsole({ version: "v1", auth });

  const response = await withGoogleBackoff(() =>
    searchconsole.searchanalytics.query({
      siteUrl,
      requestBody: {
        startDate,
        endDate,
        dimensions: ["date", dimension],
        rowLimit: ANALYTICS_DIMENSION_TOP_N * 120,
      },
    }),
  );

  return (response.data.rows ?? [])
    .map((row) => ({
      date: row.keys?.[0] ?? "",
      dimensionValue: row.keys?.[1] ?? "",
      clicks: row.clicks ?? 0,
      impressions: row.impressions ?? 0,
      ctr: row.ctr ?? 0,
      position: row.position ?? 0,
    }))
    .filter((row) => row.date && row.dimensionValue);
}

/**
 * Fetch per-day top rows for a dimension. GSC returns date×dimension rows;
 * we keep the top N by clicks per day.
 */
export async function fetchGscTopDimensionsByDay(
  siteUrl: string,
  startDate: string,
  endDate: string,
  dimension: "query" | "page" | "country" | "device",
): Promise<TGscDimensionRow[]> {
  const rows = await fetchGscDimensionRows(siteUrl, startDate, endDate, dimension);
  const byDate = new Map<string, TGscDimensionRow[]>();

  for (const row of rows) {
    const list = byDate.get(row.date) ?? [];
    list.push(row);
    byDate.set(row.date, list);
  }

  const trimmed: TGscDimensionRow[] = [];
  for (const [, list] of byDate) {
    list.sort((a, b) => b.clicks - a.clicks || b.impressions - a.impressions);
    trimmed.push(...list.slice(0, ANALYTICS_DIMENSION_TOP_N));
  }

  return trimmed;
}
