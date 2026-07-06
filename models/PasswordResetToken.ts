import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const passwordResetTokenSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    tokenHash: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

export type PasswordResetTokenDocument = InferSchemaType<typeof passwordResetTokenSchema> & mongoose.Document;

export const PasswordResetToken: Model<PasswordResetTokenDocument> =
  mongoose.models.PasswordResetToken ??
  mongoose.model<PasswordResetTokenDocument>("PasswordResetToken", passwordResetTokenSchema);
