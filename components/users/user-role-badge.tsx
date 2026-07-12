import { cn } from "@/lib/utils";
import { getBadgeToneClassName } from "@/lib/frontend/theme/status-colors";
import {
  formatUserRoleLabel,
  getUserRoleBadgeTone,
} from "@/lib/frontend/users/user-role-display.utils";

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
        getBadgeToneClassName(tone),
        className,
      )}
    >
      {formatUserRoleLabel(role)}
    </span>
  );
}
