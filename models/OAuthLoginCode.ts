import crypto from "crypto";
import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

/**
 * Short-lived one-time codes after Google OAuth callback.
 * Browser exchanges the code for a normal bearer access token (never put tokens in the URL).
 */
const oauthLoginCodeSchema = new Schema(
  {
    codeHash: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    expiresAt: { type: Date, required: true },
    usedAt: { type: Date, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

oauthLoginCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type OAuthLoginCodeDocument = InferSchemaType<typeof oauthLoginCodeSchema> & mongoose.Document;

export const OAuthLoginCode: Model<OAuthLoginCodeDocument> =
  (mongoose.models.OAuthLoginCode as Model<OAuthLoginCodeDocument> | undefined) ??
  mongoose.model<OAuthLoginCodeDocument>("OAuthLoginCode", oauthLoginCodeSchema);

export function hashOAuthLoginCode(plain: string): string {
  return crypto.createHash("sha256").update(plain).digest("hex");
}

export async function createOAuthLoginCode(userId: mongoose.Types.ObjectId): Promise<string> {
  const plain = crypto.randomBytes(32).toString("base64url");
  await OAuthLoginCode.create({
    codeHash: hashOAuthLoginCode(plain),
    userId,
    expiresAt: new Date(Date.now() + 2 * 60 * 1000),
  });
  return plain;
}

export async function consumeOAuthLoginCode(
  plain: string,
): Promise<mongoose.Types.ObjectId | null> {
  const codeHash = hashOAuthLoginCode(plain);
  const doc = await OAuthLoginCode.findOneAndUpdate(
    {
      codeHash,
      usedAt: null,
      expiresAt: { $gt: new Date() },
    },
    { $set: { usedAt: new Date() } },
    { returnDocument: "after" },
  );
  return doc?.userId ?? null;
}
