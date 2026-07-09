"use client";

import type { TProjectCardStatus } from "@/features/projects/projects.api";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<TProjectCardStatus, string> = {
  pending_approval: "Pending Approval",
  active: "Active",
  deactive: "Deactive",
};

const STATUS_CLASSES: Record<TProjectCardStatus, string> = {
  pending_approval: "border-warning/40 bg-warning/10 text-warning",
  active: "border-success/40 bg-success/10 text-success",
  deactive: "border-destructive/40 bg-destructive/10 text-destructive",
};

type ProjectStatusChipProps = {
  status: TProjectCardStatus;
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
