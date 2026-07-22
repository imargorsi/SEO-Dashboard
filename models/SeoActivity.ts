import mongoose, { Schema, type InferSchemaType, type Model, type Types } from "mongoose";

import { SEO_ACTIVITY_SYNC_TYPES } from "@/lib/seo-activities/constants";
import type { TSeoActivityType } from "@/types/seo-activity.types";

const seoActivitySchema = new Schema(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true, index: true },
    activityType: {
      type: String,
      enum: [...SEO_ACTIVITY_SYNC_TYPES],
      required: true,
      index: true,
    },
    /** CSV line number (header is row 1; data starts at 2). */
    sourceRowNumber: { type: Number, required: true },
    siteCode: { type: String, required: true, trim: true },
    title: { type: String, default: null, trim: true },
    url: { type: String, default: null, trim: true },
    details: { type: String, default: null, trim: true },
    anchorText: { type: String, default: null, trim: true },
    occurredOn: { type: Date, default: null },
    /** Original sheet date string when parsing fails or for display fallback. */
    occurredOnRaw: { type: String, default: null, trim: true },
  },
  { timestamps: true },
);

seoActivitySchema.index({ activityType: 1, sourceRowNumber: 1 }, { unique: true });
seoActivitySchema.index({ projectId: 1, activityType: 1, occurredOn: -1 });

export type SeoActivityDocument = InferSchemaType<typeof seoActivitySchema> &
  mongoose.Document & {
    projectId: Types.ObjectId;
    activityType: TSeoActivityType;
    sourceRowNumber: number;
    siteCode: string;
    title: string | null;
    url: string | null;
    details: string | null;
    anchorText: string | null;
    occurredOn: Date | null;
    occurredOnRaw: string | null;
  };

const SEO_ACTIVITY_MODEL_NAME = "SeoActivity";

if (mongoose.models[SEO_ACTIVITY_MODEL_NAME]) {
  mongoose.deleteModel(SEO_ACTIVITY_MODEL_NAME);
}

export const SeoActivity: Model<SeoActivityDocument> = mongoose.model<SeoActivityDocument>(
  SEO_ACTIVITY_MODEL_NAME,
  seoActivitySchema,
);
