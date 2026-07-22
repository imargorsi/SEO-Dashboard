/**
 * Parses a Google Sheets edit/share URL or bare spreadsheet id.
 */
export function extractSpreadsheetId(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  if (/^[a-zA-Z0-9-_]{20,}$/.test(trimmed)) {
    return trimmed;
  }

  const fromPath = /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/.exec(trimmed);
  if (fromPath?.[1]) return fromPath[1];

  return null;
}

export function buildSpreadsheetEditUrl(spreadsheetId: string): string {
  return `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;
}

export function normalizeSpreadsheetUrl(input: string): {
  spreadsheetId: string;
  spreadsheetUrl: string;
} {
  const spreadsheetId = extractSpreadsheetId(input);
  if (!spreadsheetId) {
    throw new Error("Enter A Valid Google Sheets Url Or Spreadsheet Id.");
  }

  return {
    spreadsheetId,
    spreadsheetUrl: buildSpreadsheetEditUrl(spreadsheetId),
  };
}
