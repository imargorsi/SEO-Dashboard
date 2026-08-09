import Papa from "papaparse";

import { ValidationError } from "@/lib/api/http-errors";
import {
  LEAD_IMPORT_MAX_FILE_BYTES,
  LEAD_IMPORT_MAX_ROWS,
} from "@/lib/leads/constants";

export type TParsedCsvTable = {
  headers: string[];
  rows: Record<string, string>[];
};

function asRecordRow(row: unknown): Record<string, string> {
  if (!row || typeof row !== "object") return {};
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(row as Record<string, unknown>)) {
    const header = String(key).trim();
    if (!header) continue;
    out[header] = value == null ? "" : String(value).trim();
  }
  return out;
}

export async function readCsvUpload(file: File): Promise<string> {
  if (!file || typeof file.name !== "string") {
    throw new ValidationError({ file: ["CSV file is required."] });
  }

  const lower = file.name.toLowerCase();
  if (!lower.endsWith(".csv")) {
    throw new ValidationError({ file: ["Only CSV files are supported."] });
  }

  if (file.size <= 0) {
    throw new ValidationError({ file: ["CSV file is empty."] });
  }

  if (file.size > LEAD_IMPORT_MAX_FILE_BYTES) {
    throw new ValidationError({
      file: [`CSV file must be at most ${Math.floor(LEAD_IMPORT_MAX_FILE_BYTES / (1024 * 1024))} MB.`],
    });
  }

  return file.text();
}

export function parseLeadCsvText(text: string): TParsedCsvTable {
  const trimmed = text.replace(/^\uFEFF/, "");
  if (!trimmed.trim()) {
    throw new ValidationError({ file: ["CSV file is empty."] });
  }

  const parsed = Papa.parse<Record<string, unknown>>(trimmed, {
    header: true,
    skipEmptyLines: "greedy",
    transformHeader: (header) => header.trim(),
  });

  if (parsed.errors.length > 0) {
    const first = parsed.errors[0];
    throw new ValidationError({
      file: [first?.message ? `Could not parse CSV: ${first.message}` : "Could not parse CSV."],
    });
  }

  const headers = (parsed.meta.fields ?? [])
    .map((header) => header.trim())
    .filter((header) => header.length > 0);

  if (headers.length === 0) {
    throw new ValidationError({ file: ["CSV must include a header row."] });
  }

  const uniqueHeaders = new Set(headers);
  if (uniqueHeaders.size !== headers.length) {
    throw new ValidationError({ file: ["CSV headers must be unique."] });
  }

  const rows = parsed.data.map(asRecordRow).filter((row) =>
    headers.some((header) => (row[header] ?? "").trim().length > 0),
  );

  if (rows.length === 0) {
    throw new ValidationError({ file: ["CSV has no data rows."] });
  }

  if (rows.length > LEAD_IMPORT_MAX_ROWS) {
    throw new ValidationError({
      file: [`CSV may contain at most ${LEAD_IMPORT_MAX_ROWS} data rows.`],
    });
  }

  return { headers, rows };
}
