import mongoose, { Schema, type InferSchemaType, type Model, type Types } from "mongoose";

import {
  SEO_ACTIVITY_SYNC_TYPES,
  SHEET_CONFIG_STATUSES,
} from "@/lib/seo-activities/constants";
import type { TSeoActivityType } from "@/types/seo-activity.types";

const sheetConfigSchema = new Schema(
  {
    activityType: {
      type: String,
      enum: [...SEO_ACTIVITY_SYNC_TYPES],
      required: true,
      unique: true,
    },
    spreadsheetId: { type: String, required: true, trim: true },
    /** Full Google Sheets edit URL shown to admins (monthly source may change). */
    spreadsheetUrl: { type: String, required: true, trim: true },
    tabName: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: [...SHEET_CONFIG_STATUSES],
      required: true,
      default: "idle",
    },
    /** Set when status becomes `running`; used for lock TTL reclaim. */
    lockAcquiredAt: { type: Date, default: null },
    lastSyncedAt: { type: Date, default: null },
    lastError: { type: String, default: null, trim: true },
    syncedByUserId: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true },
);

export type SheetConfigDocument = InferSchemaType<typeof sheetConfigSchema> &
  mongoose.Document & {
    activityType: TSeoActivityType;
    spreadsheetId: string;
    spreadsheetUrl: string;
    tabName: string;
    status: (typeof SHEET_CONFIG_STATUSES)[number];
    lockAcquiredAt: Date | null;
    lastSyncedAt: Date | null;
    lastError: string | null;
    syncedByUserId: Types.ObjectId | null;
  };

const SHEET_CONFIG_MODEL_NAME = "SheetConfig";

if (mongoose.models[SHEET_CONFIG_MODEL_NAME]) {
  mongoose.deleteModel(SHEET_CONFIG_MODEL_NAME);
}

export const SheetConfig: Model<SheetConfigDocument> = mongoose.model<SheetConfigDocument>(
  SHEET_CONFIG_MODEL_NAME,
  sheetConfigSchema,
);
