import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    profileImage: { type: String, default: null },
    password: { type: String, required: true },
    emailVerifiedAt: { type: Date, default: null },
    roles: { type: [String], default: [] },
  },
  { timestamps: true }
);

userSchema.methods.hasVerifiedEmail = function hasVerifiedEmail(this: UserDocument): boolean {
  return this.emailVerifiedAt instanceof Date;
};

userSchema.methods.getEmailForVerification = function getEmailForVerification(this: UserDocument): string {
  return this.email;
};

userSchema.methods.getEmailForPasswordReset = function getEmailForPasswordReset(this: UserDocument): string {
  return this.email;
};

export type UserDocument = InferSchemaType<typeof userSchema> &
  mongoose.Document & {
    roles: string[];
    hasVerifiedEmail(): boolean;
    getEmailForVerification(): string;
    getEmailForPasswordReset(): string;
  };

export const User: Model<UserDocument> = mongoose.models.User ?? mongoose.model<UserDocument>("User", userSchema);
