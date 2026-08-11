export const USER_ACCOUNT_STATUSES = ["active", "inactive"] as const;
export type TUserAccountStatus = (typeof USER_ACCOUNT_STATUSES)[number];

export {
  ACCOUNT_SOURCE_ADMIN_VERIFY_WINDOW_MS,
  inferAccountSource,
  isKnownUserAccountSource,
  resolveAccountSource,
  USER_ACCOUNT_SOURCE_KNOWN,
  USER_ACCOUNT_SOURCES,
  type TUserAccountSource,
  type TUserAccountSourceKnown,
} from "@/lib/users/account-source";

export function isActiveUserStatus(status: string | null | undefined): status is "active" {
  return (status ?? "active") === "active";
}
