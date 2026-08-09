import mongoose, { Schema, type InferSchemaType, type Model, type Types } from "mongoose";

import { LEAD_ORIGINS } from "@/lib/leads/constants";

const leadSchema = new Schema(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true, index: true },
    firstName: { type: String, required: true },
    lastName: { type: String, default: "" },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    servicesInterestedIn: { type: String, default: null },
    message: { type: String, required: true },
    /** Calendar date for the lead (YYYY-MM-DD) — from CSV match or today. */
    leadDate: { type: String, required: true },
    /**
     * Extra CSV / form columns that are not core Crawllex fields.
     * Keys are source headers; values are trimmed strings.
     */
    extras: { type: Schema.Types.Mixed, default: () => ({}) },
    normalizedEmail: { type: String, required: true },
    normalizedPhone: { type: String, required: true },
    origin: { type: String, enum: LEAD_ORIGINS, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

leadSchema.index({ projectId: 1, leadDate: -1 });
leadSchema.index({ projectId: 1, createdAt: -1 });
leadSchema.index({ projectId: 1, normalizedEmail: 1, normalizedPhone: 1 }, { unique: true });

export type LeadDocument = InferSchemaType<typeof leadSchema> &
  mongoose.Document & {
    projectId: Types.ObjectId;
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
    origin: (typeof LEAD_ORIGINS)[number];
    createdBy: Types.ObjectId;
    updatedBy: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
  };

/**
 * Dev HMR reuses `mongoose.models.Lead`. If the cached schema is stale
 * (still has `name` / missing core paths), delete and recompile so imports persist.
 */
function registerLeadModel(): Model<LeadDocument> {
  const existing = mongoose.models.Lead as Model<LeadDocument> | undefined;

  if (
    existing?.schema.path("firstName") &&
    existing.schema.path("lastName") &&
    existing.schema.path("extras")?.instance === "Mixed" &&
    !existing.schema.path("name")
  ) {
    return existing;
  }

  if (existing) {
    mongoose.deleteModel("Lead");
  }

  return mongoose.model<LeadDocument>("Lead", leadSchema);
}

export const Lead: Model<LeadDocument> = registerLeadModel();
