import { cn } from "@/lib/utils";

type TUserStatus = "active" | "invited";

const STATUS_STYLES: Record<TUserStatus, { dotClassName: string; labelKey: TUserStatus }> = {
  active: { dotClassName: "bg-success", labelKey: "active" },
  invited: { dotClassName: "bg-warning", labelKey: "invited" },
};

type UserStatusIndicatorProps = {
  status: TUserStatus;
  label: string;
  className?: string;
};

export function UserStatusIndicator({ status, label, className }: UserStatusIndicatorProps) {
  const styles = STATUS_STYLES[status];

  return (
    <span className={cn("inline-flex items-center gap-2 type-body text-text-primary", className)}>
      <span className={cn("size-2 shrink-0 rounded-full", styles.dotClassName)} aria-hidden />
      <span>{label}</span>
    </span>
  );
}

export function getUserStatusFromVerified(isVerified: boolean): TUserStatus {
  return isVerified ? "active" : "invited";
}
