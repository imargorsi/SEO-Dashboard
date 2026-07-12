type TQueryParamValue = string | string[];

export type TRolesListQuery = {
  page: number;
  per_page: number;
  search: string | null;
  newest: boolean;
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

export function parseRolesListQuery(params: Record<string, TQueryParamValue>): TRolesListQuery {
  const page = parsePositiveInt(readStringParam(params.page), DEFAULT_PAGE);
  const perPageRaw = parsePositiveInt(readStringParam(params.per_page), DEFAULT_PER_PAGE);
  const per_page = Math.min(perPageRaw, 100);
  const searchRaw = readStringParam(params.search)?.trim();
  const newestRaw = readStringParam(params.newest);

  return {
    page,
    per_page,
    search: searchRaw ? searchRaw : null,
    newest: newestRaw !== "false" && newestRaw !== "0",
  };
}
