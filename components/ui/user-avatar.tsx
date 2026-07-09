"use client";

import { IoPerson } from "react-icons/io5";

import { cn } from "@/lib/utils";

type UserAvatarSize = "xs" | "sm" | "md" | "lg";

type UserAvatarProps = {
  name: string;
  imageUrl?: string | null;
  size?: UserAvatarSize;
  className?: string;
  roundedClassName?: string;
};

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const SIZE_CLASSES: Record<UserAvatarSize, { box: string; text: string; icon: string }> = {
  xs: { box: "size-7", text: "text-[0.5625rem]", icon: "size-3.5" },
  sm: { box: "size-8", text: "text-[0.625rem]", icon: "size-4" },
  md: { box: "size-10", text: "text-[0.6875rem]", icon: "size-5" },
  lg: { box: "size-16", text: "text-sm", icon: "size-6" },
};

export function UserAvatar({
  name,
  imageUrl,
  size = "md",
  className,
  roundedClassName = "rounded-lg",
}: UserAvatarProps) {
  const initials = initialsFromName(name);
  const sizeClasses = SIZE_CLASSES[size];

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden bg-gradient-primary font-semibold text-text-on-brand shadow-sm",
        sizeClasses.box,
        sizeClasses.text,
        roundedClassName,
        className,
      )}
      aria-hidden
    >
      {imageUrl ? (
        <img src={imageUrl} alt="" className="size-full object-cover" />
      ) : initials !== "?" ? (
        <span className="select-none">{initials}</span>
      ) : (
        <IoPerson className={cn(sizeClasses.icon, "opacity-90")} aria-hidden />
      )}
    </div>
  );
}
