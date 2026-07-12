"use client";

import type { ProjectStatus } from "@/lib/projects/constants";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<ProjectStatus, string> = {
  pending: "Pending Approval",
  active: "Active",
  inactive: "Inactive",
  rejected: "Rejected",
};

const STATUS_CLASSES: Record<ProjectStatus, string> = {
  pending: "border-warning/40 bg-warning/10 text-warning",
  active: "border-success/40 bg-success/10 text-success",
  inactive: "border-border bg-bg-hover text-text-muted",
  rejected: "border-border bg-bg-card text-text-muted",
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
        STATUS_CLASSES[status],
        className,
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
