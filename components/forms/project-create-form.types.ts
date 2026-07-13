import type { TSeoGoal } from "@/lib/projects/constants";

export type TProjectCreateFormValues = {
  ownerUserId: string;
  businessName: string;
  websiteUrl: string;
  businessAddress: string;
  pocContactNumber: string;
  servicesOffered: string;
  primaryServiceToPromote: string;
  idealCustomerProfile: string;
  targetLocations: string;
  opensAt: string;
  closesAt: string;
  seoGoals: TSeoGoal[];
  competitorUrls: string;
};
