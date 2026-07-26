import type { AnalyticsDimensionsQuery, AnalyticsOverviewQuery } from "@/schemas/analytics";
import { AnalyticsDailyMetric, AnalyticsDimensionRow } from "@/models";
import { getProjectIntegrationsMap } from "@/lib/integrations/sync-analytics";
import type {
  TAnalyticsDimensionRowDto,
  TAnalyticsDimensionsDto,
  TAnalyticsOverviewDto,
} from "@/types/analytics.types";

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export async function getAnalyticsOverview(
  projectId: string,
  query: AnalyticsOverviewQuery,
): Promise<TAnalyticsOverviewDto> {
  const [metrics, integrations] = await Promise.all([
    AnalyticsDailyMetric.find({
      projectId,
      date: { $gte: query.from, $lte: query.to },
    }).sort({ date: 1 }),
    getProjectIntegrationsMap(projectId),
  ]);

  let clicks = 0;
  let impressions = 0;
  const ctrValues: number[] = [];
  const positionValues: number[] = [];
  let sessions = 0;
  let totalUsers = 0;
  let newUsers = 0;
  let engagedSessions = 0;
  let organicSessions = 0;

  const seriesMap = new Map<
    string,
    {
      date: string;
      clicks: number | null;
      impressions: number | null;
      sessions: number | null;
      organicSessions: number | null;
    }
  >();

  for (const metric of metrics) {
    const entry = seriesMap.get(metric.date) ?? {
      date: metric.date,
      clicks: null,
      impressions: null,
      sessions: null,
      organicSessions: null,
    };

    if (metric.source === "gsc") {
      clicks += metric.clicks ?? 0;
      impressions += metric.impressions ?? 0;
      if (metric.ctr != null) ctrValues.push(metric.ctr);
      if (metric.position != null) positionValues.push(metric.position);
      entry.clicks = metric.clicks;
      entry.impressions = metric.impressions;
    }

    if (metric.source === "ga4") {
      sessions += metric.sessions ?? 0;
      totalUsers += metric.totalUsers ?? 0;
      newUsers += metric.newUsers ?? 0;
      engagedSessions += metric.engagedSessions ?? 0;
      organicSessions += metric.organicSessions ?? 0;
      entry.sessions = metric.sessions;
      entry.organicSessions = metric.organicSessions;
    }

    seriesMap.set(metric.date, entry);
  }

  const weightedCtr =
    impressions > 0
      ? metrics
          .filter((m) => m.source === "gsc")
          .reduce((sum, m) => sum + (m.ctr ?? 0) * (m.impressions ?? 0), 0) / impressions
      : average(ctrValues);

  const gscWithPosition = metrics.filter((m) => m.source === "gsc" && m.position != null);
  const positionWeight = gscWithPosition.reduce((sum, m) => sum + (m.impressions ?? 0), 0);
  const weightedPosition =
    positionWeight > 0
      ? gscWithPosition.reduce((sum, m) => sum + (m.position ?? 0) * (m.impressions ?? 0), 0) /
        positionWeight
      : average(positionValues);

  return {
    from: query.from,
    to: query.to,
    gsc: {
      clicks,
      impressions,
      ctr: weightedCtr,
      position: weightedPosition,
    },
    ga4: {
      sessions,
      totalUsers,
      newUsers,
      engagedSessions,
      organicSessions,
    },
    series: [...seriesMap.values()].sort((a, b) => a.date.localeCompare(b.date)),
    integrations,
  };
}

export async function getAnalyticsDimensions(
  projectId: string,
  query: AnalyticsDimensionsQuery,
): Promise<TAnalyticsDimensionsDto> {
  const rows = await AnalyticsDimensionRow.find({
    projectId,
    source: query.source,
    dimensionType: query.dimensionType,
    date: { $gte: query.from, $lte: query.to },
  });

  const aggregated = new Map<string, TAnalyticsDimensionRowDto>();

  for (const row of rows) {
    const existing = aggregated.get(row.dimensionValue) ?? {
      dimensionValue: row.dimensionValue,
      clicks: 0,
      impressions: 0,
      ctr: null,
      position: null,
      sessions: 0,
      totalUsers: 0,
    };

    existing.clicks = (existing.clicks ?? 0) + (row.clicks ?? 0);
    existing.impressions = (existing.impressions ?? 0) + (row.impressions ?? 0);
    existing.sessions = (existing.sessions ?? 0) + (row.sessions ?? 0);
    existing.totalUsers = (existing.totalUsers ?? 0) + (row.totalUsers ?? 0);

    if (row.position != null) {
      existing.position = (existing.position ?? 0) + row.position * (row.impressions ?? 1);
    }
    if (row.ctr != null) {
      existing.ctr = (existing.ctr ?? 0) + row.ctr * (row.impressions ?? 1);
    }

    aggregated.set(row.dimensionValue, existing);
  }

  const result = [...aggregated.values()].map((row) => {
    const impressions = row.impressions ?? 0;
    return {
      ...row,
      ctr: impressions > 0 && row.ctr != null ? row.ctr / impressions : null,
      position: impressions > 0 && row.position != null ? row.position / impressions : row.position,
    };
  });

  result.sort((a, b) => {
    const aPrimary = (a.clicks ?? 0) || (a.sessions ?? 0);
    const bPrimary = (b.clicks ?? 0) || (b.sessions ?? 0);
    return bPrimary - aPrimary;
  });

  return {
    from: query.from,
    to: query.to,
    source: query.source,
    dimensionType: query.dimensionType,
    rows: result.slice(0, query.limit),
  };
}
