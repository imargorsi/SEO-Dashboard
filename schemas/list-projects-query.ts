import { z } from "zod";

import { PROJECT_STATUSES, type ProjectStatus } from "@/lib/projects/constants";

const LIST_PROJECT_STATUS_FILTERS = [...PROJECT_STATUSES, "pending_approval"] as const;

export const listProjectsQuerySchema = z.object({
  status: z.enum(LIST_PROJECT_STATUS_FILTERS).optional(),
});

export type ListProjectsQueryInput = z.infer<typeof listProjectsQuerySchema>;

export function normalizeListProjectsStatus(
  status: ListProjectsQueryInput["status"],
): ProjectStatus | undefined {
  if (!status) return undefined;
  if (status === "pending_approval") return "pending";
  return status;
}

export function parseListProjectsQuery(searchParams: URLSearchParams): ListProjectsQueryInput {
  const statusParam = searchParams.get("status");
  if (!statusParam) {
    return {};
  }

  return listProjectsQuerySchema.parse({ status: statusParam });
}
