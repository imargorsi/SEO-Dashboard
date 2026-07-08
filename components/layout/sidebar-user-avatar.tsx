import { IoAlertCircle, IoCheckmark, IoPerson } from "react-icons/io5";
import { cn } from "@/lib/utils";

type SidebarUserAvatarProps = {
  name: string;
  imageUrl?: string | null;
  verified?: boolean;
  showVerificationBadge?: boolean;
  size?: "sm" | "md";
  className?: string;
};

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function SidebarUserAvatar({
  name,
  imageUrl,
  verified = false,
  showVerificationBadge = false,
  size = "md",
  className,
}: SidebarUserAvatarProps) {
  const initials = initialsFromName(name);
  const box =
    size === "sm" ? "size-8 rounded-md text-[0.5625rem]" : "size-10 rounded-lg text-[0.6875rem]";
  const userIcon = size === "sm" ? "size-4" : "size-5";
  const badgeWrap = size === "sm" ? "size-3.5 -end-px -bottom-px" : "size-4 -end-0.5 -bottom-0.5";
  const badgeIcon = size === "sm" ? "size-2" : "size-2.5";

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden bg-gradient-primary font-semibold text-text-on-brand shadow-sm",
        box,
        className
      )}
      aria-hidden
    >
      {imageUrl ? (
        <img src={imageUrl} alt="" className="size-full object-cover" />
      ) : initials.length > 0 && initials !== "?" ? (
        <span className="select-none">{initials}</span>
      ) : (
        <IoPerson className={cn(userIcon, "opacity-90")} aria-hidden />
      )}
      {showVerificationBadge ? (
        verified ? (
          <span
            className={cn(
              "absolute flex items-center justify-center rounded-full border border-[var(--social-bg)] bg-bg-card text-success",
              badgeWrap
            )}
            aria-hidden
          >
            <IoCheckmark className={cn(badgeIcon, "stroke-[2.5]")} aria-hidden />
          </span>
        ) : (
          <span
            className={cn(
              "absolute flex items-center justify-center rounded-full border border-[var(--social-bg)] bg-bg-card text-warning",
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
