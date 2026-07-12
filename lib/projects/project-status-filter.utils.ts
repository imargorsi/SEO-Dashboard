import { PROJECT_STATUSES, type ProjectStatus } from "@/lib/projects/constants";

export type TProjectStatusFilter = ProjectStatus | "all";

export type TProjectStatusCounts = Record<TProjectStatusFilter, number>;

export type TProjectStatusFilterLabelKey = TProjectStatusFilter;

const EMPTY_COUNTS: TProjectStatusCounts = {
  all: 0,
  pending: 0,
  active: 0,
  inactive: 0,
  rejected: 0,
};

export function parseProjectStatusFilter(value: string | string[] | undefined): ProjectStatus | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return undefined;
  if (raw === "pending_approval") return "pending";
  if ((PROJECT_STATUSES as readonly string[]).includes(raw)) {
    return raw as ProjectStatus;
  }
  return undefined;
}

export function countProjectsByStatus(projects: Array<{ status: ProjectStatus }>): TProjectStatusCounts {
  const counts = { ...EMPTY_COUNTS, all: projects.length };

  for (const project of projects) {
    counts[project.status] += 1;
  }

  return counts;
}
