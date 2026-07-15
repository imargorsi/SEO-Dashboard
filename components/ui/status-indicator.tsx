import { getStatusDotClassName, type TStatusColorKey } from "@/lib/frontend/theme/status-colors";
import { cn } from "@/lib/utils";

type TActiveInactiveStatus = "active" | "inactive";

const STATUS_COLOR_KEYS: Record<TActiveInactiveStatus, TStatusColorKey> = {
  active: "active",
  inactive: "inactive",
};

type StatusIndicatorProps = {
  status: TActiveInactiveStatus;
  label: string;
  className?: string;
};

/** Active/inactive dot + label — shared by any admin list (users, roles) with an account-style status. */
export function StatusIndicator({ status, label, className }: StatusIndicatorProps) {
  return (
    <span className={cn("type-body text-text-primary inline-flex items-center gap-2", className)}>
      <span
        className={cn("size-2 shrink-0 rounded-full", getStatusDotClassName(STATUS_COLOR_KEYS[status]))}
        aria-hidden
      />
      <span>{label}</span>
    </span>
  );
}
