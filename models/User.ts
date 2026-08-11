import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

import { FONT_PACK_IDS, resolveFontPackId, resolveThemePackId, THEME_PACK_IDS } from "@/lib/theme/pack-ids";
import { isActiveUserStatus, USER_ACCOUNT_STATUSES } from "@/lib/users/constants";

/** Bump when User schema hooks/enums change so HMR recompiles a stale cached model. */
const USER_MODEL_REVISION = 2;

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
    /** Google OIDC `sub` — unique when set; omit when unset so sparse unique allows many password-only users. */
    googleId: { type: String, unique: true, sparse: true },
    emailVerifiedAt: { type: Date, default: null },
    roles: { type: [String], default: [] },
    status: { type: String, enum: USER_ACCOUNT_STATUSES, required: true, default: "active" },
    /** UI theme pack slug — see `THEME_PACK_IDS`. */
    themePack: {
      type: String,
      enum: [...THEME_PACK_IDS],
      default: "default",
    },
    /** UI font pack slug — see `FONT_PACK_IDS`. */
    fontPack: {
      type: String,
      enum: [...FONT_PACK_IDS],
      default: "jakarta",
    },
  },
  { timestamps: true },
);

(userSchema as Schema & { __crawllexRevision?: number }).__crawllexRevision = USER_MODEL_REVISION;

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

/** Migrate retired pack ids before enum validation (e.g. carbon-ice → verdant-grove). */
userSchema.pre("validate", function migratePackIds(next) {
  this.themePack = resolveThemePackId(this.themePack);
  this.fontPack = resolveFontPackId(this.fontPack);
  next();
});

export type UserDocument = InferSchemaType<typeof userSchema> &
  mongoose.Document & {
    roles: string[];
    status: (typeof USER_ACCOUNT_STATUSES)[number];
    password: string | null;
    googleId?: string | null;
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

/** Read enum values from a cached string path (Mongoose keeps these on the live schema). */
function schemaStringEnumValues(model: Model<UserDocument>, pathName: string): readonly string[] {
  const path = model.schema.path(pathName) as
    | { enumValues?: unknown; caster?: { enumValues?: unknown }; options?: { enum?: unknown } }
    | undefined;
  if (!path) return [];
  const raw = path.enumValues ?? path.options?.enum ?? [];
  return Array.isArray(raw) ? raw.map(String) : [];
}

function hasCurrentPackEnums(model: Model<UserDocument>): boolean {
  const themeEnum = schemaStringEnumValues(model, "themePack");
  const fontEnum = schemaStringEnumValues(model, "fontPack");
  return (
    THEME_PACK_IDS.every((id) => themeEnum.includes(id)) &&
    FONT_PACK_IDS.every((id) => fontEnum.includes(id))
  );
}

/**
 * Dev HMR reuses `mongoose.models.User`. If the cached schema is stale
 * (missing paths or outdated theme/font pack enums), delete and recompile.
 */
function registerUserModel(): Model<UserDocument> {
  const existing = mongoose.models.User as Model<UserDocument> | undefined;
  const existingRevision = (existing?.schema as Schema & { __crawllexRevision?: number } | undefined)
    ?.__crawllexRevision;

  if (
    existing &&
    existingRevision === USER_MODEL_REVISION &&
    existing.schema.path("status") &&
    existing.schema.path("themePack") &&
    existing.schema.path("googleId") &&
    hasCurrentPackEnums(existing)
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
