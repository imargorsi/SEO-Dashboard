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

export type TAnalyticsOverviewDto = {
  from: string;
  to: string;
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
  series: Array<{
    date: string;
    clicks: number | null;
    impressions: number | null;
    sessions: number | null;
    organicSessions: number | null;
  }>;
  integrations: {
    gsc: TProjectIntegrationDto | null;
    ga4: TProjectIntegrationDto | null;
  };
};

export type TAnalyticsDimensionRowDto = {
  dimensionValue: string;
  clicks: number | null;
  impressions: number | null;
  ctr: number | null;
  position: number | null;
  sessions: number | null;
  totalUsers: number | null;
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
