import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const roleSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    guardName: { type: String, required: true, default: "web" },
  },
  { timestamps: true },
);

export type RoleDocument = InferSchemaType<typeof roleSchema> & mongoose.Document;

export const Role: Model<RoleDocument> =
  mongoose.models.Role ?? mongoose.model<RoleDocument>("Role", roleSchema);
