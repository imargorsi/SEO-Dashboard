import { getStatusDotClassName, type TStatusColorKey } from "@/lib/frontend/theme/status-colors";
import { cn } from "@/lib/utils";

type TUserStatus = "active" | "invited";

const STATUS_COLOR_KEYS: Record<TUserStatus, TStatusColorKey> = {
  active: "active",
  invited: "invited",
};

type UserStatusIndicatorProps = {
  status: TUserStatus;
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

export function getUserStatusFromVerified(isVerified: boolean): TUserStatus {
  return isVerified ? "active" : "invited";
}
