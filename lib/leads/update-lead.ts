import mongoose, { type Types } from "mongoose";
import { NextResponse } from "next/server";

import { NotFoundError, ValidationError } from "@/lib/api/http-errors";
import { ApiResponse } from "@/lib/api/response";
import type { AuthContext } from "@/lib/auth/guards";
import { findDuplicateLead } from "@/lib/leads/create-lead";
import { normalizeLeadEmail, normalizeLeadPhone } from "@/lib/leads/normalize";
import { serializeLead } from "@/lib/leads/serialize-lead";
import { isDuplicateKeyError } from "@/lib/roles/role-mutation.utils";
import { Lead, type LeadDocument } from "@/models";
import type { UpdateLeadInput } from "@/schemas/lead";

const DUPLICATE_LEAD_MESSAGE = "A lead with this email and phone already exists.";

export async function updateLead(
  auth: AuthContext,
  projectId: string,
  leadId: string,
  input: UpdateLeadInput,
): Promise<{ lead: LeadDocument }> {
  if (!mongoose.isValidObjectId(leadId)) {
    throw new NotFoundError("Lead");
  }

  const lead = await Lead.findOne({ _id: leadId, projectId });
  if (!lead) {
    throw new NotFoundError("Lead");
  }

  const normalizedEmail = normalizeLeadEmail(input.email);
  const normalizedPhone = normalizeLeadPhone(input.phone);

  const duplicate = await findDuplicateLead(projectId, normalizedEmail, normalizedPhone, leadId);
  if (duplicate) {
    throw new ValidationError({ email: [DUPLICATE_LEAD_MESSAGE] }, DUPLICATE_LEAD_MESSAGE);
  }

  lead.firstName = input.firstName;
  lead.lastName = input.lastName;
  lead.email = input.email;
  lead.phone = input.phone;
  lead.servicesInterestedIn = input.servicesInterestedIn;
  lead.message = input.message;
  lead.leadDate = input.leadDate;
  lead.normalizedEmail = normalizedEmail;
  lead.normalizedPhone = normalizedPhone;
  lead.updatedBy = auth.user._id as Types.ObjectId;

  try {
    await lead.save();
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw new ValidationError({ email: [DUPLICATE_LEAD_MESSAGE] }, DUPLICATE_LEAD_MESSAGE);
    }
    throw error;
  }

  return { lead };
}

export function buildUpdateLeadResponse(lead: LeadDocument): NextResponse {
  return ApiResponse.success(serializeLead(lead), "Lead updated.");
}
