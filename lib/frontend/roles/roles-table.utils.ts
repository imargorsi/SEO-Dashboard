import { getPaginationRange } from "@/lib/frontend/table/pagination.utils";

export function buildRolesPaginationSummary(
  page: number,
  perPage: number,
  total: number,
  formatter: (values: { from: number; to: number; total: number }) => string,
) {
  const { from, to } = getPaginationRange(page, perPage, total);
  return formatter({ from, to, total });
}
