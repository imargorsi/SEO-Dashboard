import { NextResponse } from "next/server";

import { ApiResponse } from "@/lib/api/response";
import { suggestLeadColumnMapping } from "@/lib/leads/column-aliases";
import { parseLeadCsvText, readCsvUpload } from "@/lib/leads/parse-csv";
import type { TLeadsImportPreview } from "@/types/lead.types";

export async function previewLeadsImport(file: File): Promise<TLeadsImportPreview> {
  const text = await readCsvUpload(file);
  const { headers, rows } = parseLeadCsvText(text);

  return {
    headers,
    rowCount: rows.length,
    suggestedMapping: suggestLeadColumnMapping(headers),
  };
}

export function buildPreviewLeadsImportResponse(payload: TLeadsImportPreview): NextResponse {
  return ApiResponse.success(payload);
}
