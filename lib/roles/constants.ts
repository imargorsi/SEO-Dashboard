export const ROLE_STATUSES = ["active", "inactive"] as const;
export type TRoleStatus = (typeof ROLE_STATUSES)[number];

export function isActiveRoleStatus(status: string | null | undefined): status is "active" {
  return (status ?? "active") === "active";
}
