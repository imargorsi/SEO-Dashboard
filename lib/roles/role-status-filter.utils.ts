import { ROLE_STATUSES, type TRoleStatus } from "@/lib/roles/constants";

export type TRoleStatusFilter = TRoleStatus | "all";

export type TRoleStatusCounts = Record<TRoleStatusFilter, number>;

export type TRoleStatusFilterLabelKey = TRoleStatusFilter;

export const EMPTY_ROLE_STATUS_COUNTS: TRoleStatusCounts = {
  all: 0,
  active: 0,
  inactive: 0,
};

export function parseRoleStatusFilter(value: string | string[] | undefined): TRoleStatus | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return undefined;
  if ((ROLE_STATUSES as readonly string[]).includes(raw)) {
    return raw as TRoleStatus;
  }
  return undefined;
}

export function buildRoleStatusCounts(active: number, inactive: number): TRoleStatusCounts {
  return {
    all: active + inactive,
    active,
    inactive,
  };
}
