import { getStatusDotClassName, type TStatusColorKey } from "@/lib/frontend/theme/status-colors";
import type { TUserAccountStatus } from "@/lib/users/constants";
import { cn } from "@/lib/utils";

const STATUS_COLOR_KEYS: Record<TUserAccountStatus, TStatusColorKey> = {
  active: "active",
  inactive: "inactive",
};

type UserStatusIndicatorProps = {
  status: TUserAccountStatus;
  label: string;
  className?: string;
};

export function UserStatusIndicator({ status, label, className }: UserStatusIndicatorProps) {
  return (
    <span className={cn("inline-flex items-center gap-2 type-body text-text-primary", className)}>
      <span
        className={cn("size-2 shrink-0 rounded-full", getStatusDotClassName(STATUS_COLOR_KEYS[status]))}
        aria-hidden
      />
      <span>{label}</span>
    </span>
  );
}
