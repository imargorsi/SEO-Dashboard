import type { TDateRange } from "@/lib/frontend/seo-activities/date-range.utils";

export type TSpreadsheetCell =
  | { type: "String"; value: string }
  | { type: "Number"; value: number };

export type TSpreadsheetSheet = {
  name: string;
  headers: string[];
  rows: TSpreadsheetCell[][];
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

export function formatSpreadsheetPercentRatio(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "";
  return `${(value * 100).toFixed(2)}%`;
}

export function formatSpreadsheetPosition(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "";
  return value.toFixed(2);
}

export function numberOrEmpty(value: number | null | undefined): TSpreadsheetCell {
  if (value == null || Number.isNaN(value)) return { type: "String", value: "" };
  return { type: "Number", value };
}

export function stringCell(value: string): TSpreadsheetCell {
  return { type: "String", value };
}

function renderCell(cell: TSpreadsheetCell): string {
  return `<Cell><Data ss:Type="${cell.type}">${escapeXml(
    cell.type === "Number" ? String(cell.value) : cell.value,
  )}</Data></Cell>`;
}

function renderSheet(sheet: TSpreadsheetSheet): string {
  const headerCells = sheet.headers.map((header) => renderCell(stringCell(header))).join("");
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

export function buildSpreadsheetXml(sheets: readonly TSpreadsheetSheet[]): string {
  const rendered = sheets.map(renderSheet).join("\n ");

  return `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 ${rendered}
</Workbook>`;
}

export function buildDatedExportFilename(
  prefix: string,
  range: TDateRange,
  now = new Date(),
): string {
  const stamp = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("");
  const from = range.from ?? "all";
  const to = range.to ?? "all";
  return `${prefix}_${from}_${to}_${stamp}.xls`;
}
