export const USER_ACCOUNT_STATUSES = ["active", "inactive"] as const;
export type TUserAccountStatus = (typeof USER_ACCOUNT_STATUSES)[number];

export function isActiveUserStatus(status: string | null | undefined): status is "active" {
  return (status ?? "active") === "active";
}
