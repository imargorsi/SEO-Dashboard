import { downloadBrowserFile } from "@/lib/frontend/seo-activities/export.utils";
import type { TDateRange } from "@/lib/frontend/seo-activities/date-range.utils";
import {
  buildDatedExportFilename,
  buildSpreadsheetXml,
  formatSpreadsheetPercentRatio,
  formatSpreadsheetPosition,
  numberOrEmpty,
  stringCell,
  type TSpreadsheetSheet,
} from "@/lib/frontend/export/spreadsheet-xml.utils";
import type {
  TAnalyticsDimensionRowDto,
  TAnalyticsOverviewDto,
} from "@/types/analytics.types";

export type TAnalyticsExportLabels = {
  sheets: {
    summary: string;
    dailyTrend: string;
    topQueries: string;
    topPages: string;
    trafficSources: string;
    countries: string;
  };
  metric: string;
  value: string;
  date: string;
  clicks: string;
  impressions: string;
  ctr: string;
  position: string;
  sessions: string;
  users: string;
  channel: string;
  country: string;
  query: string;
  page: string;
  totalClicks: string;
  totalImpressions: string;
  avgCtr: string;
  avgPosition: string;
  totalSessions: string;
  totalUsers: string;
};

export type TAnalyticsExportPayload = {
  overview: TAnalyticsOverviewDto;
  queries: TAnalyticsDimensionRowDto[];
  pages: TAnalyticsDimensionRowDto[];
  channels: TAnalyticsDimensionRowDto[];
  countries: TAnalyticsDimensionRowDto[];
};

function buildGscDimensionRows(
  rows: readonly TAnalyticsDimensionRowDto[],
): TSpreadsheetSheet["rows"] {
  return rows.map((row) => [
    stringCell(row.dimensionValue),
    numberOrEmpty(row.clicks),
    numberOrEmpty(row.impressions),
    stringCell(formatSpreadsheetPercentRatio(row.ctr)),
    stringCell(formatSpreadsheetPosition(row.position)),
  ]);
}

function buildSheets(
  payload: TAnalyticsExportPayload,
  labels: TAnalyticsExportLabels,
): TSpreadsheetSheet[] {
  const { overview } = payload;

  return [
    {
      name: labels.sheets.summary,
      headers: [labels.metric, labels.value],
      rows: [
        [stringCell(labels.totalClicks), numberOrEmpty(overview.cards.clicks.value)],
        [
          stringCell(labels.totalImpressions),
          numberOrEmpty(overview.cards.impressions.value),
        ],
        [
          stringCell(labels.avgCtr),
          stringCell(formatSpreadsheetPercentRatio(overview.cards.ctr.value)),
        ],
        [
          stringCell(labels.avgPosition),
          stringCell(formatSpreadsheetPosition(overview.cards.position.value)),
        ],
        [stringCell(labels.totalSessions), numberOrEmpty(overview.ga4.sessions)],
        [stringCell(labels.totalUsers), numberOrEmpty(overview.ga4.totalUsers)],
      ],
    },
    {
      name: labels.sheets.dailyTrend,
      headers: [
        labels.date,
        labels.clicks,
        labels.impressions,
        labels.ctr,
        labels.position,
        labels.sessions,
      ],
      rows: overview.series.map((point) => [
        stringCell(point.date),
        numberOrEmpty(point.clicks),
        numberOrEmpty(point.impressions),
        stringCell(formatSpreadsheetPercentRatio(point.ctr)),
        stringCell(formatSpreadsheetPosition(point.position)),
        numberOrEmpty(point.sessions),
      ]),
    },
    {
      name: labels.sheets.topQueries,
      headers: [
        labels.query,
        labels.clicks,
        labels.impressions,
        labels.ctr,
        labels.position,
      ],
      rows: buildGscDimensionRows(payload.queries),
    },
    {
      name: labels.sheets.topPages,
      headers: [
        labels.page,
        labels.clicks,
        labels.impressions,
        labels.ctr,
        labels.position,
      ],
      rows: buildGscDimensionRows(payload.pages),
    },
    {
      name: labels.sheets.trafficSources,
      headers: [labels.channel, labels.sessions, labels.users],
      rows: payload.channels.map((row) => [
        stringCell(row.dimensionValue),
        numberOrEmpty(row.sessions),
        numberOrEmpty(row.totalUsers),
      ]),
    },
    {
      name: labels.sheets.countries,
      headers: [labels.country, labels.users, labels.sessions],
      rows: payload.countries.map((row) => [
        stringCell(row.dimensionValue),
        numberOrEmpty(row.totalUsers),
        numberOrEmpty(row.sessions),
      ]),
    },
  ];
}

export function buildAnalyticsExcelXml(
  payload: TAnalyticsExportPayload,
  labels: TAnalyticsExportLabels,
): string {
  return buildSpreadsheetXml(buildSheets(payload, labels));
}

export function buildAnalyticsExportFilename(range: TDateRange, now = new Date()): string {
  return buildDatedExportFilename("analytics-report", range, now);
}

export function hasAnalyticsExportSignal(payload: TAnalyticsExportPayload): boolean {
  const { overview } = payload;
  const hasCards =
    (overview.cards.clicks.value ?? 0) > 0 ||
    (overview.cards.impressions.value ?? 0) > 0 ||
    (overview.ga4.sessions ?? 0) > 0 ||
    (overview.ga4.totalUsers ?? 0) > 0;
  const hasSeries = overview.series.some(
    (point) =>
      (point.clicks ?? 0) > 0 ||
      (point.impressions ?? 0) > 0 ||
      (point.sessions ?? 0) > 0,
  );
  const hasDimensions =
    payload.queries.length > 0 ||
    payload.pages.length > 0 ||
    payload.channels.length > 0 ||
    payload.countries.length > 0;
  return hasCards || hasSeries || hasDimensions;
}

export function downloadAnalyticsExcel(input: {
  payload: TAnalyticsExportPayload;
  range: TDateRange;
  labels: TAnalyticsExportLabels;
}) {
  const content = buildAnalyticsExcelXml(input.payload, input.labels);
  const filename = buildAnalyticsExportFilename(input.range);
  downloadBrowserFile(filename, content, "application/vnd.ms-excel;charset=utf-8");
}
