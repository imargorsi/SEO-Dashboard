import { IoAlertCircle, IoCheckmark } from "react-icons/io5";
import { UserAvatar } from "@/components/ui/user-avatar";
import { getStatusTextClassName } from "@/lib/frontend/theme/status-colors";
import { cn } from "@/lib/utils";

type SidebarUserAvatarProps = {
  name: string;
  imageUrl?: string | null;
  verified?: boolean;
  showVerificationBadge?: boolean;
  size?: "sm" | "md";
  className?: string;
};

export function SidebarUserAvatar({
  name,
  imageUrl,
  verified = false,
  showVerificationBadge = false,
  size = "md",
  className,
}: SidebarUserAvatarProps) {
  const badgeWrap = size === "sm" ? "size-3.5 -end-px -bottom-px" : "size-4 -end-0.5 -bottom-0.5";
  const badgeIcon = size === "sm" ? "size-2" : "size-2.5";

  return (
    <div className="relative">
      <UserAvatar
        name={name}
        imageUrl={imageUrl}
        size={size}
        className={className}
        roundedClassName={size === "sm" ? "rounded-md" : "rounded-lg"}
      />
      {showVerificationBadge ? (
        verified ? (
          <span
            className={cn(
              "absolute flex items-center justify-center rounded-full border border-(--social-bg) bg-bg-card",
              getStatusTextClassName("active"),
              badgeWrap
            )}
            aria-hidden
          >
            <IoCheckmark className={cn(badgeIcon, "stroke-[2.5]")} aria-hidden />
          </span>
        ) : (
          <span
            className={cn(
              "absolute flex items-center justify-center rounded-full border border-(--social-bg) bg-bg-card",
              getStatusTextClassName("pending"),
              badgeWrap
            )}
            aria-hidden
          >
            <IoAlertCircle className={badgeIcon} aria-hidden />
          </span>
        )
      ) : null}
    </div>
  );
}
