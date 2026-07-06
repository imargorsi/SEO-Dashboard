import type { SeoGoalSlug } from "@/lib/projects/constants";
import type { ProjectBusinessHours, ProjectMarketingAccess } from "@/models/Project";

 
export type ProjectOnboardingFields = {
  businessName: string;
  websiteUrl: string;
  businessAddress?: string | null;
  pocContactNumber?: string | null;
  pocEmail?: string | null;
  servicesOffered?: string[];
  primaryServiceToPromote?: string | null;
  idealCustomerProfile?: string | null;
  targetLocations?: string[];
  businessHours?: ProjectBusinessHours | null;
  seoGoals?: SeoGoalSlug[];
  marketingAccess?: Partial<ProjectMarketingAccess> | null;
  competitorUrls?: string[];
};
