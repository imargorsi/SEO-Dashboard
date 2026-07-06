import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

import type { RoleScope } from "@/lib/rbac/roles";

const roleSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    scope: { type: String, enum: ["platform", "project"], required: true },
    isSystem: { type: Boolean, default: false },
    permissions: { type: [String], default: [] },
  },
  { timestamps: true }
);

export type RoleDocument = InferSchemaType<typeof roleSchema> &
  mongoose.Document & {
    slug: string;
    name: string;
    description: string;
    scope: RoleScope;
    isSystem: boolean;
    permissions: string[];
  };

export const Role: Model<RoleDocument> = mongoose.models.Role ?? mongoose.model<RoleDocument>("Role", roleSchema);
