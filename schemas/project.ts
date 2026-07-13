import { z } from "zod";

import { SEO_GOALS } from "@/lib/projects/constants";

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
  seoGoals: z.array(z.enum(SEO_GOALS)).optional().default([]),
  competitorUrls: z.array(z.string().trim().min(1).max(2048)).optional().default([]),
  /** `super_admin` only — regular users must omit this. */
  ownerUserId: z.string().trim().min(1).optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

const updateStringListSchema = z.array(z.string().trim().min(1).max(255)).nullable().optional();

/** PATCH /api/v1/projects/{id} — partial body (business name, owner, and POC email are locked). */
export const updateProjectSchema = z.object({
  websiteUrl: z.string().trim().min(1, "Website URL is required.").max(2048).optional(),
  businessAddress: optionalText,
  pocContactNumber: optionalShortText,
  servicesOffered: updateStringListSchema,
  primaryServiceToPromote: optionalShortText,
  idealCustomerProfile: optionalText,
  targetLocations: updateStringListSchema,
  businessHours: businessHoursSchema,
  seoGoals: z.array(z.enum(SEO_GOALS)).nullable().optional(),
  competitorUrls: z.array(z.string().trim().min(1).max(2048)).nullable().optional(),
});

export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

export const LOCKED_PROJECT_UPDATE_FIELDS = ["businessName", "pocEmail", "ownerUserId"] as const;
