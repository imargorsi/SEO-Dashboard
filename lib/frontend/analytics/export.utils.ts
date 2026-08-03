import { downloadBrowserFile } from "@/lib/frontend/seo-activities/export.utils";
import type { TDateRange } from "@/lib/frontend/seo-activities/date-range.utils";
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

type TCell =
  | { type: "String"; value: string }
  | { type: "Number"; value: number };

type TSheet = {
  name: string;
  headers: string[];
  rows: TCell[][];
};

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function sanitizeSheetName(name: string): string {
  const cleaned = name.replace(/[\\/?*[\]:]/g, " ").trim() || "Sheet";
  return cleaned.slice(0, 31);
}

function formatPercentRatio(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "";
  return `${(value * 100).toFixed(2)}%`;
}

function formatPosition(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "";
  return value.toFixed(2);
}

function numberOrEmpty(value: number | null | undefined): TCell {
  if (value == null || Number.isNaN(value)) return { type: "String", value: "" };
  return { type: "Number", value };
}

function stringCell(value: string): TCell {
  return { type: "String", value };
}

function renderCell(cell: TCell): string {
  return `<Cell><Data ss:Type="${cell.type}">${escapeXml(
    cell.type === "Number" ? String(cell.value) : cell.value,
  )}</Data></Cell>`;
}

function renderSheet(sheet: TSheet): string {
  const headerCells = sheet.headers
    .map((header) => renderCell(stringCell(header)))
    .join("");
  const bodyRows = sheet.rows
    .map((row) => `<Row>${row.map(renderCell).join("")}</Row>`)
    .join("");

  return `<Worksheet ss:Name="${escapeXml(sanitizeSheetName(sheet.name))}">
  <Table>
   <Row>${headerCells}</Row>
   ${bodyRows}
  </Table>
 </Worksheet>`;
}

function buildGscDimensionRows(
  rows: readonly TAnalyticsDimensionRowDto[],
): TSheet["rows"] {
  return rows.map((row) => [
    stringCell(row.dimensionValue),
    numberOrEmpty(row.clicks),
    numberOrEmpty(row.impressions),
    stringCell(formatPercentRatio(row.ctr)),
    stringCell(formatPosition(row.position)),
  ]);
}

function buildSheets(
  payload: TAnalyticsExportPayload,
  labels: TAnalyticsExportLabels,
): TSheet[] {
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
        [stringCell(labels.avgCtr), stringCell(formatPercentRatio(overview.cards.ctr.value))],
        [
          stringCell(labels.avgPosition),
          stringCell(formatPosition(overview.cards.position.value)),
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
        stringCell(formatPercentRatio(point.ctr)),
        stringCell(formatPosition(point.position)),
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
  const sheets = buildSheets(payload, labels)
    .map(renderSheet)
    .join("\n ");

  return `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 ${sheets}
</Workbook>`;
}

export function buildAnalyticsExportFilename(range: TDateRange, now = new Date()): string {
  const stamp = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("");
  const from = range.from ?? "all";
  const to = range.to ?? "all";
  return `analytics-report_${from}_${to}_${stamp}.xls`;
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
