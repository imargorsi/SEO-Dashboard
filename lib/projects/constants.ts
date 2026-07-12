export const PROJECT_STATUSES = ["pending", "active", "inactive", "rejected"] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const PROJECT_MEMBER_STATUSES = ["active", "invited", "removed"] as const;
export type ProjectMemberStatus = (typeof PROJECT_MEMBER_STATUSES)[number];

/** Locked v1 goals — Module 2 onboarding (multi-select). */
export const SEO_GOAL_SLUGS = [
  "more_calls",
  "more_leads",
  "more_bookings",
  "more_sales",
  "more_website_traffic",
] as const;
export type SeoGoalSlug = (typeof SEO_GOAL_SLUGS)[number];

export const SEO_GOAL_LABELS: Record<SeoGoalSlug, string> = {
  more_calls: "More calls",
  more_leads: "More leads",
  more_bookings: "More bookings",
  more_sales: "More sales",
  more_website_traffic: "More website traffic",
};

/** Only `active` projects grant module permissions to members. */
export function isActiveProjectStatus(status: string): status is ProjectStatus {
  return status === "active";
}

/** @deprecated Use isActiveProjectStatus */
export function isApprovedProjectStatus(status: string): boolean {
  return isActiveProjectStatus(status);
}

export function isSeoGoalSlug(value: string): value is SeoGoalSlug {
  return (SEO_GOAL_SLUGS as readonly string[]).includes(value);
}
