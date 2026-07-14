import { USER_ACCOUNT_STATUSES, type TUserAccountStatus } from "@/lib/users/constants";

export type TUserStatusFilter = TUserAccountStatus | "all";

export type TUserStatusCounts = Record<TUserStatusFilter, number>;

export type TUserStatusFilterLabelKey = TUserStatusFilter;

export const EMPTY_USER_STATUS_COUNTS: TUserStatusCounts = {
  all: 0,
  active: 0,
  inactive: 0,
};

export function parseUserStatusFilter(value: string | string[] | undefined): TUserAccountStatus | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return undefined;
  if ((USER_ACCOUNT_STATUSES as readonly string[]).includes(raw)) {
    return raw as TUserAccountStatus;
  }
  return undefined;
}

export function buildUserStatusCounts(active: number, inactive: number): TUserStatusCounts {
  return {
    all: active + inactive,
    active,
    inactive,
  };
}
