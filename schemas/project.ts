import { z } from "zod";

import { SEO_GOAL_SLUGS } from "@/lib/projects/constants";

const optionalText = z.string().trim().max(2000).optional().nullable();
const optionalShortText = z.string().trim().max(255).optional().nullable();

const timeOfDaySchema = z
  .string()
  .trim()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use 24-hour time (HH:mm).")
  .optional()
  .nullable();

const businessHoursSchema = z
  .object({
    opensAt: timeOfDaySchema,
    closesAt: timeOfDaySchema,
  })
  .optional()
  .nullable();

const marketingAccessSchema = z
  .object({
    websiteLogin: optionalText,
    websiteHosting: optionalText,
    googleAnalytics: optionalText,
    googleSearchConsole: optionalText,
    googleBusinessProfile: optionalText,
  })
  .optional()
  .nullable();

const stringListSchema = z.array(z.string().trim().min(1).max(255)).optional().default([]);

/** POST /api/v1/projects — request body. */
export const createProjectSchema = z.object({
  businessName: z.string().trim().min(1, "Business name is required.").max(255),
  websiteUrl: z.string().trim().min(1, "Website URL is required.").max(2048),
  businessAddress: optionalText,
  pocContactNumber: optionalShortText,
  servicesOffered: stringListSchema,
  primaryServiceToPromote: optionalShortText,
  idealCustomerProfile: optionalText,
  targetLocations: stringListSchema,
  businessHours: businessHoursSchema,
  seoGoals: z.array(z.enum(SEO_GOAL_SLUGS)).optional().default([]),
  marketingAccess: marketingAccessSchema,
  competitorUrls: z.array(z.string().trim().min(1).max(2048)).optional().default([]),
  /** `super_admin` only — regular users must omit this. */
  ownerUserId: z.string().trim().min(1).optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
