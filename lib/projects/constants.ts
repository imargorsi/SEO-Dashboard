export const PROJECT_STATUSES = ["pending", "active", "inactive", "rejected"] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const PROJECT_MEMBER_STATUSES = ["active", "invited", "removed"] as const;
export type ProjectMemberStatus = (typeof PROJECT_MEMBER_STATUSES)[number];

/** Locked v1 SEO goals — Module 2 onboarding (multi-select). Single source of truth for API + UI. */
export const SEO_GOALS = [
  "grow_brand_awareness",
  "outrank_competitors",
  "get_more_calls",
  "increase_online_orders",
  "improve_local_visibility",
] as const;

export type TSeoGoal = (typeof SEO_GOALS)[number];

/** Only `active` projects grant module permissions to members. */
export function isActiveProjectStatus(status: string): status is ProjectStatus {
  return status === "active";
}

export function isSeoGoal(value: string): value is TSeoGoal {
  return (SEO_GOALS as readonly string[]).includes(value);
}
