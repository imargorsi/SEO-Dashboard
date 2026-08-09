import mongoose from "mongoose";
import { NextResponse } from "next/server";

import { NotFoundError } from "@/lib/api/http-errors";
import { ApiResponse } from "@/lib/api/response";
import { Lead } from "@/models";

export async function deleteLead(projectId: string, leadId: string): Promise<void> {
  if (!mongoose.isValidObjectId(leadId)) {
    throw new NotFoundError("Lead");
  }

  const result = await Lead.deleteOne({ _id: leadId, projectId });
  if (result.deletedCount === 0) {
    throw new NotFoundError("Lead");
  }
}

export function buildDeleteLeadResponse(): NextResponse {
  return ApiResponse.success(null, "Lead deleted.");
}
