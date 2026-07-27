import type {
  TAnalyticsDimensionType,
  TAnalyticsSource,
  TGoogleIntegrationService,
  TIntegrationStatus,
} from "@/lib/integrations/constants";

export type TProjectIntegrationDto = {
  id: string;
  projectId: string;
  provider: string;
  service: TGoogleIntegrationService;
  status: TIntegrationStatus;
  externalPropertyId: string | null;
  lastSyncedAt: string | null;
  lastError: string | null;
  connectedAt: string | null;
};

export type TGooglePropertyOption = {
  id: string;
  name: string;
  service: TGoogleIntegrationService;
};

/** One GSC KPI with fixed this-month vs last-month benchmark (not date-filter scoped). */
export type TAnalyticsCardMetricDto = {
  value: number | null;
  previousValue: number | null;
  /** Percent change vs previous period. For position, positive = improved (lower rank). */
  changePercent: number | null;
  /** Daily points for the current card window (This Month) — used for card sparklines. */
  sparkline: number[];
};

export type TAnalyticsOverviewDto = {
  /** Date-filter window used for `series` / filtered GA4 rollups. */
  from: string;
  to: string;
  /**
   * Top 4 GSC cards — always This Month vs Last Month (UTC).
   * Independent of the page date filter.
   */
  cards: {
    benchmark: "this_month_vs_last_month";
    current: { from: string; to: string };
    previous: { from: string; to: string };
    clicks: TAnalyticsCardMetricDto;
    impressions: TAnalyticsCardMetricDto;
    ctr: TAnalyticsCardMetricDto;
    position: TAnalyticsCardMetricDto;
  };
  /** @deprecated Prefer `cards` for summary UI. Kept for filtered range totals. */
  gsc: {
    clicks: number;
    impressions: number;
    ctr: number | null;
    position: number | null;
  };
  ga4: {
    sessions: number;
    totalUsers: number;
    newUsers: number;
    engagedSessions: number;
    organicSessions: number;
  };
  /** Daily series for the performance trend graph (date-filter scoped). */
  series: Array<{
    date: string;
    clicks: number | null;
    impressions: number | null;
    ctr: number | null;
    position: number | null;
    sessions: number | null;
    organicSessions: number | null;
  }>;
  integrations: {
    gsc: TProjectIntegrationDto | null;
    ga4: TProjectIntegrationDto | null;
  };
};

export type TAnalyticsDimensionTrend = "up" | "down" | "flat";

export type TAnalyticsDimensionRowDto = {
  dimensionValue: string;
  clicks: number | null;
  impressions: number | null;
  ctr: number | null;
  position: number | null;
  sessions: number | null;
  totalUsers: number | null;
  /**
   * Direction vs the immediately preceding equal-length window (primary metric:
   * clicks for GSC, sessions for GA4). Null when prior data is missing.
   */
  trend: TAnalyticsDimensionTrend | null;
};

export type TAnalyticsDimensionsDto = {
  from: string;
  to: string;
  source: TAnalyticsSource;
  dimensionType: TAnalyticsDimensionType;
  rows: TAnalyticsDimensionRowDto[];
};

export type TAnalyticsSyncResultDto = {
  projectId: string;
  gsc: { ok: boolean; message: string } | null;
  ga4: { ok: boolean; message: string } | null;
};
