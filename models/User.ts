import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

import { isActiveUserStatus, USER_ACCOUNT_STATUSES } from "@/lib/users/constants";

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    profileImage: { type: String, default: null },
    /**
     * Password hash. Null for Google-only accounts until they set a password
     * via reset / change-password.
     */
    password: { type: String, default: null },
    /** Google OIDC `sub` — unique when set; sparse so password-only users stay unique on email. */
    googleId: { type: String, default: null, unique: true, sparse: true },
    emailVerifiedAt: { type: Date, default: null },
    roles: { type: [String], default: [] },
    status: { type: String, enum: USER_ACCOUNT_STATUSES, required: true, default: "active" },
    /** UI theme pack slug — see `THEME_PACK_IDS`. */
    themePack: {
      type: String,
      enum: ["default", "glass-aurora", "carbon-ice", "lumen-slate"],
      default: "default",
    },
    /** UI font pack slug — see `FONT_PACK_IDS`. */
    fontPack: {
      type: String,
      enum: ["jakarta", "ubuntu", "nunito", "inter"],
      default: "jakarta",
    },
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

userSchema.methods.hasPassword = function hasPassword(this: UserDocument): boolean {
  return typeof this.password === "string" && this.password.length > 0;
};

export type UserDocument = InferSchemaType<typeof userSchema> &
  mongoose.Document & {
    roles: string[];
    status: (typeof USER_ACCOUNT_STATUSES)[number];
    password: string | null;
    googleId: string | null;
    hasVerifiedEmail(): boolean;
    getEmailForVerification(): string;
    getEmailForPasswordReset(): string;
    isActive(): boolean;
    hasPassword(): boolean;
  };

function attachUserMethods(model: Model<UserDocument>): void {
  model.schema.methods.hasVerifiedEmail = userSchema.methods.hasVerifiedEmail;
  model.schema.methods.getEmailForVerification = userSchema.methods.getEmailForVerification;
  model.schema.methods.getEmailForPasswordReset = userSchema.methods.getEmailForPasswordReset;
  model.schema.methods.isActive = userSchema.methods.isActive;
  model.schema.methods.hasPassword = userSchema.methods.hasPassword;
}

/**
 * Dev HMR reuses `mongoose.models.User`. If the cached schema is stale
 * (e.g. missing `status` / `googleId`), delete and recompile so path/method changes apply.
 */
function registerUserModel(): Model<UserDocument> {
  const existing = mongoose.models.User as Model<UserDocument> | undefined;

  if (
    existing?.schema.path("status") &&
    existing?.schema.path("themePack") &&
    existing?.schema.path("googleId")
  ) {
    attachUserMethods(existing);
    return existing;
  }

  if (existing) {
    mongoose.deleteModel("User");
  }

  return mongoose.model<UserDocument>("User", userSchema);
}

export const User: Model<UserDocument> = registerUserModel();
