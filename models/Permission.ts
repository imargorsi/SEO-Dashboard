import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const permissionSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    guardName: { type: String, required: true, default: "web" },
  },
  { timestamps: true }
);

export type PermissionDocument = InferSchemaType<typeof permissionSchema> & mongoose.Document;

export const Permission: Model<PermissionDocument> =
  mongoose.models.Permission ?? mongoose.model<PermissionDocument>("Permission", permissionSchema);
