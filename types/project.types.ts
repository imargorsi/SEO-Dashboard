import type { ProjectStatus, TSeoGoal } from "@/lib/projects/constants";

export type TProjectOwnerSummary = {
  id: string;
  name: string;
  profileImage: string | null;
};

export type TProjectBusinessHours = {
  opensAt: string | null;
  closesAt: string | null;
} | null;

export type TProjectListItem = {
  id: string;
  businessName: string;
  websiteUrl: string;
  status: ProjectStatus;
  imageUrl: string | null;
  owner: TProjectOwnerSummary | null;
  createdByUserId: string;
};

export type TProjectDetail = {
  id: string;
  businessName: string;
  websiteUrl: string;
  businessAddress: string | null;
  logoImage: string | null;
  pocContactNumber: string | null;
  pocEmail: string | null;
  servicesOffered: string[];
  primaryServiceToPromote: string | null;
  idealCustomerProfile: string | null;
  targetLocations: string[];
  businessHours: TProjectBusinessHours;
  seoGoals: TSeoGoal[];
  competitorUrls: string[];
  status: ProjectStatus;
  owner: TProjectOwnerSummary | null;
  createdByUserId: string;
  approvedAt: string | null;
  approvedByUserId: string | null;
  rejectedAt: string | null;
  rejectedByUserId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TProjectOwnerRef = Pick<TProjectDetail, "owner" | "createdByUserId">;

export type TProjectListOwnerRef = Pick<TProjectListItem, "owner" | "createdByUserId">;
