import { NextResponse } from "next/server";
import type { Types } from "mongoose";

import { ValidationError } from "@/lib/api/http-errors";
import { ApiResponse } from "@/lib/api/response";
import type { AuthContext } from "@/lib/auth/guards";
import { assertProjectActiveForLeads } from "@/lib/leads/assert-project-active";
import { LEAD_DATE_USE_TODAY } from "@/lib/leads/constants";
import { buildLeadExtras } from "@/lib/leads/extras.utils";
import { normalizeLeadEmail, normalizeLeadPhone } from "@/lib/leads/normalize";
import { parseLeadCsvText, readCsvUpload } from "@/lib/leads/parse-csv";
import { Lead } from "@/models";
import {
  leadImportRowSchema,
  resolveImportLeadDate,
  type LeadImportMappingInput,
} from "@/schemas/lead";
import type { TLeadsImportResult } from "@/types/lead.types";

function cellValue(row: Record<string, string>, header: string): string {
  if (!header) return "";
  return (row[header] ?? "").trim();
}

export async function commitLeadsImport(
  auth: AuthContext,
  projectId: string,
  file: File,
  mapping: LeadImportMappingInput,
): Promise<TLeadsImportResult> {
  await assertProjectActiveForLeads(projectId);

  const text = await readCsvUpload(file);
  const { headers, rows } = parseLeadCsvText(text);

  const requiredMapped = [
    mapping.firstName,
    mapping.email,
    mapping.phone,
    mapping.message,
  ];
  for (const header of requiredMapped) {
    if (!headers.includes(header)) {
      throw new ValidationError({
        mapping: [`Mapped column "${header}" was not found in the CSV.`],
      });
    }
  }
  if (mapping.lastName && !headers.includes(mapping.lastName)) {
    throw new ValidationError({
      mapping: [`Mapped column "${mapping.lastName}" was not found in the CSV.`],
    });
  }
  if (mapping.servicesInterestedIn && !headers.includes(mapping.servicesInterestedIn)) {
    throw new ValidationError({
      mapping: [`Mapped column "${mapping.servicesInterestedIn}" was not found in the CSV.`],
    });
  }
  if (
    mapping.leadDate &&
    mapping.leadDate !== LEAD_DATE_USE_TODAY &&
    !headers.includes(mapping.leadDate)
  ) {
    throw new ValidationError({
      mapping: [`Mapped column "${mapping.leadDate}" was not found in the CSV.`],
    });
  }
  for (const header of mapping.extras ?? []) {
    if (!headers.includes(header)) {
      throw new ValidationError({
        extras: [`Extra column "${header}" was not found in the CSV.`],
      });
    }
  }

  const existing = await Lead.find({ projectId }).select("normalizedEmail normalizedPhone");
  const seen = new Set(
    existing.map((doc) => `${doc.normalizedEmail}::${doc.normalizedPhone}`),
  );

  const userId = auth.user._id as Types.ObjectId;
  const toInsert: Array<{
    projectId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    servicesInterestedIn: string | null;
    message: string;
    leadDate: string;
    extras: Record<string, string>;
    normalizedEmail: string;
    normalizedPhone: string;
    origin: "csv_import";
    createdBy: Types.ObjectId;
    updatedBy: Types.ObjectId;
  }> = [];

  let skippedDuplicates = 0;
  let skippedInvalid = 0;

  for (const row of rows) {
    const leadDate = resolveImportLeadDate(mapping, row);
    if (!leadDate) {
      skippedInvalid += 1;
      continue;
    }

    const candidate = {
      firstName: cellValue(row, mapping.firstName),
      lastName: cellValue(row, mapping.lastName),
      email: cellValue(row, mapping.email),
      phone: cellValue(row, mapping.phone),
      servicesInterestedIn: cellValue(row, mapping.servicesInterestedIn ?? ""),
      message: cellValue(row, mapping.message),
      leadDate,
    };

    const parsed = leadImportRowSchema.safeParse(candidate);
    if (!parsed.success) {
      skippedInvalid += 1;
      continue;
    }

    const normalizedEmail = normalizeLeadEmail(parsed.data.email);
    const normalizedPhone = normalizeLeadPhone(parsed.data.phone);
    const key = `${normalizedEmail}::${normalizedPhone}`;

    if (seen.has(key)) {
      skippedDuplicates += 1;
      continue;
    }

    seen.add(key);
    toInsert.push({
      projectId,
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      email: parsed.data.email,
      phone: parsed.data.phone,
      servicesInterestedIn: parsed.data.servicesInterestedIn,
      message: parsed.data.message,
      leadDate: parsed.data.leadDate,
      extras: buildLeadExtras(row, mapping.extras ?? []),
      normalizedEmail,
      normalizedPhone,
      origin: "csv_import",
      createdBy: userId,
      updatedBy: userId,
    });
  }

  let imported = 0;
  if (toInsert.length > 0) {
    try {
      const inserted = await Lead.insertMany(toInsert, { ordered: false });
      imported = inserted.length;
    } catch (error) {
      // Concurrent imports can hit the unique index after our in-memory check.
      const bulk = error as { insertedDocs?: unknown[]; writeErrors?: unknown[] };
      const insertedCount = Array.isArray(bulk.insertedDocs) ? bulk.insertedDocs.length : 0;
      const writeErrorCount = Array.isArray(bulk.writeErrors) ? bulk.writeErrors.length : 0;
      // All rows duplicate (or only writeErrors) → count as skips, not a 500.
      if (insertedCount === 0 && writeErrorCount === 0) throw error;
      imported = insertedCount;
      skippedDuplicates +=
        writeErrorCount > 0 ? writeErrorCount : Math.max(0, toInsert.length - insertedCount);
    }
  }

  return {
    imported,
    skippedDuplicates,
    skippedInvalid,
  };
}

export function buildCommitLeadsImportResponse(result: TLeadsImportResult): NextResponse {
  return ApiResponse.success(result, "Leads imported.");
}
