import mongoose, { Schema, type InferSchemaType, type Model, type Types } from "mongoose";

import { ANALYTICS_SOURCES } from "@/lib/integrations/constants";

const analyticsDailyMetricSchema = new Schema(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    /** Calendar date `YYYY-MM-DD` (UTC). */
    date: { type: String, required: true, trim: true },
    source: { type: String, enum: [...ANALYTICS_SOURCES], required: true },
    // GSC
    clicks: { type: Number, default: null },
    impressions: { type: Number, default: null },
    ctr: { type: Number, default: null },
    position: { type: Number, default: null },
    // GA4
    sessions: { type: Number, default: null },
    totalUsers: { type: Number, default: null },
    newUsers: { type: Number, default: null },
    engagedSessions: { type: Number, default: null },
    organicSessions: { type: Number, default: null },
    /** GA4 averageSessionDuration — seconds per session for that day. */
    averageSessionDuration: { type: Number, default: null },
    /** GA4 screenPageViews — page/screen views for that day. */
    screenPageViews: { type: Number, default: null },
  },
  { timestamps: true },
);

analyticsDailyMetricSchema.index({ projectId: 1, date: 1, source: 1 }, { unique: true });
analyticsDailyMetricSchema.index({ projectId: 1, source: 1, date: -1 });

export type AnalyticsDailyMetricDocument = InferSchemaType<typeof analyticsDailyMetricSchema> &
  mongoose.Document & {
    projectId: Types.ObjectId;
    date: string;
    source: (typeof ANALYTICS_SOURCES)[number];
    clicks: number | null;
    impressions: number | null;
    ctr: number | null;
    position: number | null;
    sessions: number | null;
    totalUsers: number | null;
    newUsers: number | null;
    engagedSessions: number | null;
    organicSessions: number | null;
    averageSessionDuration: number | null;
    screenPageViews: number | null;
  };

export const AnalyticsDailyMetric: Model<AnalyticsDailyMetricDocument> =
  mongoose.models.AnalyticsDailyMetric ??
  mongoose.model<AnalyticsDailyMetricDocument>("AnalyticsDailyMetric", analyticsDailyMetricSchema);
