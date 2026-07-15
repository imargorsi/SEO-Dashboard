import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

import { isActiveUserStatus, USER_ACCOUNT_STATUSES } from "@/lib/users/constants";

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    profileImage: { type: String, default: null },
    password: { type: String, required: true },
    emailVerifiedAt: { type: Date, default: null },
    roles: { type: [String], default: [] },
    status: { type: String, enum: USER_ACCOUNT_STATUSES, required: true, default: "active" },
  },
  { timestamps: true },
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

userSchema.methods.isActive = function isActive(this: UserDocument): boolean {
  return isActiveUserStatus(this.status);
};

export type UserDocument = InferSchemaType<typeof userSchema> &
  mongoose.Document & {
    roles: string[];
    status: (typeof USER_ACCOUNT_STATUSES)[number];
    hasVerifiedEmail(): boolean;
    getEmailForVerification(): string;
    getEmailForPasswordReset(): string;
    isActive(): boolean;
  };

function attachUserMethods(model: Model<UserDocument>): void {
  model.schema.methods.hasVerifiedEmail = userSchema.methods.hasVerifiedEmail;
  model.schema.methods.getEmailForVerification = userSchema.methods.getEmailForVerification;
  model.schema.methods.getEmailForPasswordReset = userSchema.methods.getEmailForPasswordReset;
  model.schema.methods.isActive = userSchema.methods.isActive;
}

/**
 * Dev HMR reuses `mongoose.models.User`. If the cached schema is stale
 * (e.g. missing `status`), delete and recompile so path/method changes apply.
 */
function registerUserModel(): Model<UserDocument> {
  const existing = mongoose.models.User as Model<UserDocument> | undefined;

  if (existing?.schema.path("status")) {
    attachUserMethods(existing);
    return existing;
  }

  if (existing) {
    mongoose.deleteModel("User");
  }

  return mongoose.model<UserDocument>("User", userSchema);
}

export const User: Model<UserDocument> = registerUserModel();
