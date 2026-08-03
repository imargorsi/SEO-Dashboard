"use client";

import { StatusChip } from "@/components/ui/status-chip";
import type { ProjectStatus } from "@/lib/projects/constants";
import { getProjectStatusColorKey } from "@/lib/frontend/theme/status-colors";

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
    <StatusChip
      colorKey={getProjectStatusColorKey(status)}
      label={STATUS_LABELS[status]}
      className={className}
    />
  );
}
