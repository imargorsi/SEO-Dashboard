import type { TUserAccountStatus } from "@/lib/users/constants";
import {
  isKnownUserAccountSource,
  type TUserAccountSourceKnown,
} from "@/lib/users/account-source";
import { parseUserAccountSourceFilter } from "@/lib/users/account-source-filter.utils";
import { parseUserStatusFilter } from "@/lib/users/user-status-filter.utils";

type TQueryParamValue = string | string[];

export type TUsersListQuery = {
  page: number;
  per_page: number;
  search: string | null;
  newest: boolean;
  status: TUserAccountStatus | null;
  account_source: TUserAccountSourceKnown | null;
};

const DEFAULT_PAGE = 1;
const DEFAULT_PER_PAGE = 15;

function readStringParam(value: TQueryParamValue | undefined): string | undefined {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value[0];
  return undefined;
}

function parsePositiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return Math.floor(parsed);
}

export function parseUsersListQuery(params: Record<string, TQueryParamValue>): TUsersListQuery {
  const page = parsePositiveInt(readStringParam(params.page), DEFAULT_PAGE);
  const perPageRaw = parsePositiveInt(readStringParam(params.per_page), DEFAULT_PER_PAGE);
  const per_page = Math.min(perPageRaw, 100);
  const searchRaw = readStringParam(params.search)?.trim();
  const newestRaw = readStringParam(params.newest);
  const status = parseUserStatusFilter(readStringParam(params.status)) ?? null;
  const parsedSource = parseUserAccountSourceFilter(readStringParam(params.account_source));
  const account_source =
    parsedSource && isKnownUserAccountSource(parsedSource) ? parsedSource : null;

  return {
    page,
    per_page,
    search: searchRaw ? searchRaw : null,
    newest: newestRaw !== "false" && newestRaw !== "0",
    status,
    account_source,
  };
}
