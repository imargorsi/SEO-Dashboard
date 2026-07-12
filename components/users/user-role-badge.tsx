import { cn } from "@/lib/utils";
import {
  formatUserRoleLabel,
  getUserRoleBadgeTone,
  type TUserRoleBadgeTone,
} from "@/lib/frontend/users/user-role-display.utils";

const TONE_CLASSES: Record<TUserRoleBadgeTone, string> = {
  brand: "border-brand/35 bg-brand/12 text-brand",
  info: "border-accent-border bg-accent-bg text-text-primary",
  warning: "border-warning/35 bg-warning/12 text-warning",
  success: "border-success/35 bg-success/12 text-success",
  muted: "border-border bg-bg-hover text-text-muted",
};

type UserRoleBadgeProps = {
  role: string;
  className?: string;
};

export function UserRoleBadge({ role, className }: UserRoleBadgeProps) {
  const tone = getUserRoleBadgeTone(role);

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg border px-2.5 py-1 type-caption-xs font-semibold capitalize",
        TONE_CLASSES[tone],
        className,
      )}
    >
      {formatUserRoleLabel(role)}
    </span>
  );
}
