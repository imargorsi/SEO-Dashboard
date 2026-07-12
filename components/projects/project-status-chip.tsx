"use client";

import type { ProjectStatus } from "@/lib/projects/constants";
import {
  getProjectStatusColorKey,
  getStatusChipClassName,
} from "@/lib/frontend/theme/status-colors";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<ProjectStatus, string> = {
  pending: "Pending Approval",
  active: "Active",
  inactive: "Inactive",
  rejected: "Rejected",
};

type ProjectStatusChipProps = {
  status: ProjectStatus;
  className?: string;
};

export function ProjectStatusChip({ status, className }: ProjectStatusChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 type-overline uppercase tracking-[0.08em]",
        getStatusChipClassName(getProjectStatusColorKey(status)),
        className,
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
