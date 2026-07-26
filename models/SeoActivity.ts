import mongoose, { Schema, type InferSchemaType, type Model, type Types } from "mongoose";

import { SEO_ACTIVITY_TYPES } from "@/lib/seo-activities/constants";

const seoActivitySchema = new Schema(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true, index: true },
    activityType: { type: String, enum: SEO_ACTIVITY_TYPES, required: true },
    url: { type: String, required: true },
    occurredOn: { type: String, required: true },
    title: { type: String, default: null },
    anchorText: { type: String, default: null },
    details: { type: String, default: null },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

seoActivitySchema.index({ projectId: 1, activityType: 1, occurredOn: -1 });

export type SeoActivityDocument = InferSchemaType<typeof seoActivitySchema> &
  mongoose.Document & {
    projectId: Types.ObjectId;
    activityType: (typeof SEO_ACTIVITY_TYPES)[number];
    url: string;
    occurredOn: string;
    title: string | null;
    anchorText: string | null;
    details: string | null;
    createdBy: Types.ObjectId;
    updatedBy: Types.ObjectId;
  };

export const SeoActivity: Model<SeoActivityDocument> =
  mongoose.models.SeoActivity ??
  mongoose.model<SeoActivityDocument>("SeoActivity", seoActivitySchema);
