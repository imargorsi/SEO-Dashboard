import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

export const COMPANY_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
} as const;

export type CompanyStatus = (typeof COMPANY_STATUS)[keyof typeof COMPANY_STATUS];

const companySchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    websiteUrl: { type: String, default: null },
    pocName: { type: String, required: true },
    pocEmail: { type: String, required: true, lowercase: true },
    isActive: { type: Boolean, default: true },
    status: {
      type: String,
      enum: Object.values(COMPANY_STATUS),
      default: COMPANY_STATUS.APPROVED,
    },
  },
  { timestamps: true },
);

companySchema.methods.isApproved = function isApproved(this: CompanyDocument): boolean {
  return this.status === COMPANY_STATUS.APPROVED;
};

companySchema.methods.isPending = function isPending(this: CompanyDocument): boolean {
  return this.status === COMPANY_STATUS.PENDING;
};

companySchema.methods.isAccessible = function isAccessible(this: CompanyDocument): boolean {
  return this.isApproved() && this.isActive;
};

export type CompanyDocument = InferSchemaType<typeof companySchema> &
  mongoose.Document & {
    isApproved(): boolean;
    isPending(): boolean;
    isAccessible(): boolean;
  };

export const Company: Model<CompanyDocument> =
  mongoose.models.Company ?? mongoose.model<CompanyDocument>("Company", companySchema);
