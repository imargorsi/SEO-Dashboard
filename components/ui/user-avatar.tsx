"use client";

import { Icons } from "@/lib/frontend/icons/app-icons";
import { getStatusTextClassName } from "@/lib/frontend/theme/status-colors";
import { cn } from "@/lib/utils";

export type TAvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

/** `photo` crops to fill (people). `logo` contains with padding so company marks stay readable. */
export type TAvatarVariant = "photo" | "logo";

type TUserAvatarProps = {
  name: string;
  imageUrl?: string | null;
  size?: TAvatarSize;
  variant?: TAvatarVariant;
  verified?: boolean;
  showVerificationBadge?: boolean;
  className?: string;
};

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

const SIZE_CLASSES: Record<TAvatarSize, { box: string; text: string; icon: string; badge: string; badgeIcon: string }> =
  {
    xs: {
      box: "size-7",
      text: "text-[0.5625rem]",
      icon: "size-3.5",
      badge: "size-3 -end-px -bottom-px",
      badgeIcon: "size-2",
    },
    sm: {
      box: "size-8",
      text: "text-[0.625rem]",
      icon: "size-4",
      badge: "size-3.5 -end-px -bottom-px",
      badgeIcon: "size-2",
    },
    md: {
      box: "size-10",
      text: "text-[0.6875rem]",
      icon: "size-5",
      badge: "size-4 -end-0.5 -bottom-0.5",
      badgeIcon: "size-2.5",
    },
    lg: {
      box: "size-12",
      text: "text-xs",
      icon: "size-6",
      badge: "size-4 -end-0.5 -bottom-0.5",
      badgeIcon: "size-2.5",
    },
    xl: {
      box: "size-16",
      text: "text-sm",
      icon: "size-7",
      badge: "size-5 -end-0.5 -bottom-0.5",
      badgeIcon: "size-3",
    },
  };

/**
 * Single circular avatar for people and company logos.
 * Use `variant="logo"` for brand marks so they are not cropped.
 */
export function UserAvatar({
  name,
  imageUrl,
  size = "md",
  variant = "photo",
  verified = false,
  showVerificationBadge = false,
  className,
}: TUserAvatarProps) {
  const initials = initialsFromName(name);
  const sizeClasses = SIZE_CLASSES[size];
  const hasImage = Boolean(imageUrl);
  const isLogo = variant === "logo";

  const avatar = (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold shadow-sm",
        sizeClasses.box,
        sizeClasses.text,
        hasImage
          ? isLogo
            ? "border border-border bg-bg-card"
            : "bg-bg-hover"
          : "bg-brand text-text-on-brand",
        className,
      )}
      aria-hidden
    >
      {hasImage ? (
        <img
          src={imageUrl!}
          alt=""
          className={cn(
            "size-full",
            isLogo ? "object-contain p-[14%]" : "object-cover",
          )}
        />
      ) : initials !== "?" ? (
        <span className="select-none">{initials}</span>
      ) : (
        <Icons.user className={cn(sizeClasses.icon, "opacity-90")} aria-hidden />
      )}
    </div>
  );

  if (!showVerificationBadge) return avatar;

  return (
    <div className="relative inline-flex shrink-0">
      {avatar}
      {verified ? (
        <span
          className={cn(
            "absolute flex items-center justify-center rounded-full border border-border bg-bg-card",
            getStatusTextClassName("active"),
            sizeClasses.badge,
          )}
          aria-hidden
        >
          <Icons.tick className={cn(sizeClasses.badgeIcon, "stroke-[2.5]")} aria-hidden />
        </span>
      ) : (
        <span
          className={cn(
            "absolute flex items-center justify-center rounded-full border border-border bg-bg-card",
            getStatusTextClassName("pending"),
            sizeClasses.badge,
          )}
          aria-hidden
        >
          <Icons.alert className={sizeClasses.badgeIcon} aria-hidden />
        </span>
      )}
    </div>
  );
}
