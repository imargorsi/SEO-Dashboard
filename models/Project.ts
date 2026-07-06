import mongoose, { Schema, type InferSchemaType, type Model, type Types } from "mongoose";

import { PROJECT_STATUSES, SEO_GOAL_SLUGS } from "@/lib/projects/constants";

const businessHoursSchema = new Schema(
  {
    /** Local time, e.g. `09:00` (24h). */
    opensAt: { type: String, default: null, trim: true },
    /** Local time, e.g. `17:00` (24h). */
    closesAt: { type: String, default: null, trim: true },
  },
  { _id: false },
);

const marketingAccessSchema = new Schema(
  {
    websiteLogin: { type: String, default: null, trim: true },
    websiteHosting: { type: String, default: null, trim: true },
    googleAnalytics: { type: String, default: null, trim: true },
    googleSearchConsole: { type: String, default: null, trim: true },
    googleBusinessProfile: { type: String, default: null, trim: true },
  },
  { _id: false },
);

const projectSchema = new Schema(
  {
    // --- Required (Module 2) ---
    businessName: { type: String, required: true, trim: true },
    websiteUrl: { type: String, required: true, trim: true },

    // --- Optional business information ---
    businessAddress: { type: String, default: null, trim: true },
    /** Stored as string to preserve country codes and formatting. */
    pocContactNumber: { type: String, default: null, trim: true },
    /** Set from the creator's user email on create; not user-editable in onboarding UI. */
    pocEmail: { type: String, default: null, trim: true, lowercase: true },

    // --- Optional business details ---
    servicesOffered: { type: [String], default: [] },
    primaryServiceToPromote: { type: String, default: null, trim: true },
    idealCustomerProfile: { type: String, default: null, trim: true },
    targetLocations: { type: [String], default: [] },
    businessHours: { type: businessHoursSchema, default: null },

    // --- Business goals (multi-select enum) ---
    seoGoals: {
      type: [String],
      enum: SEO_GOAL_SLUGS,
      default: [],
    },

    // --- Website & marketing access (optional free-text / URLs) ---
    marketingAccess: { type: marketingAccessSchema, default: () => ({}) },

    // --- Competitors (URLs or names) ---
    competitorUrls: { type: [String], default: [] },

    // --- Workflow ---
    status: { type: String, enum: PROJECT_STATUSES, required: true, default: "pending" },
    createdByUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    approvedAt: { type: Date, default: null },
    approvedByUserId: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true },
);

projectSchema.index({ status: 1, createdAt: -1 });
projectSchema.index({ createdByUserId: 1 });

export type ProjectBusinessHours = InferSchemaType<typeof businessHoursSchema>;
export type ProjectMarketingAccess = InferSchemaType<typeof marketingAccessSchema>;

export type ProjectDocument = InferSchemaType<typeof projectSchema> &
  mongoose.Document & {
    businessName: string;
    websiteUrl: string;
    businessAddress: string | null;
    pocContactNumber: string | null;
    pocEmail: string | null;
    servicesOffered: string[];
    primaryServiceToPromote: string | null;
    idealCustomerProfile: string | null;
    targetLocations: string[];
    businessHours: ProjectBusinessHours | null;
    seoGoals: (typeof SEO_GOAL_SLUGS)[number][];
    marketingAccess: ProjectMarketingAccess;
    competitorUrls: string[];
    status: (typeof PROJECT_STATUSES)[number];
    createdByUserId: Types.ObjectId;
    approvedAt: Date | null;
    approvedByUserId: Types.ObjectId | null;
  };

export const Project: Model<ProjectDocument> =
  mongoose.models.Project ?? mongoose.model<ProjectDocument>("Project", projectSchema);
