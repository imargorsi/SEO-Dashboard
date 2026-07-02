import { IoCheckmark, IoPencil, IoPerson } from "react-icons/io5";
import { useEffect, useState, type ChangeEvent, type ChangeEventHandler } from "react";
import { cn } from "@/lib/utils";

type SidebarUserAvatarProps = {
  name: string;
  imageUrl?: string | null;
  uploadMode?: "display" | "upload";
  uploadInputId?: string;
  uploadAccept?: string;
  onUploadChange?: ChangeEventHandler<HTMLInputElement>;
  verified?: boolean;
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
  uploadMode = "display",
  uploadInputId = "profile-image",
  uploadAccept = "image/*",
  onUploadChange,
  verified = false,
  size = "md",
  className,
}: SidebarUserAvatarProps) {
  const [localImageUrl, setLocalImageUrl] = useState<string | null>(null);
  const initials = initialsFromName(name);
  const currentImageUrl = imageUrl ?? localImageUrl;

  useEffect(() => {
    return () => {
      if (localImageUrl) URL.revokeObjectURL(localImageUrl);
    };
  }, [localImageUrl]);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    onUploadChange?.(event);
    if (onUploadChange) return;

    const file = event.target.files?.[0];
    if (!file) return;

    if (localImageUrl) URL.revokeObjectURL(localImageUrl);
    const nextUrl = URL.createObjectURL(file);
    setLocalImageUrl(nextUrl);
  }

  const box =
    size === "sm" ? "size-8 rounded-md text-[0.5625rem]" : "size-10 rounded-lg text-[0.6875rem]";
  const userIcon = size === "sm" ? "size-4" : "size-5";
  const badgeWrap = size === "sm" ? "size-3.5 -end-px -bottom-px" : "size-4 -end-0.5 -bottom-0.5";
  const checkIcon = size === "sm" ? "size-2" : "size-2.5";

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden bg-gradient-to-br from-[var(--brand)] via-[#6366f1] to-[#1e3a8a] font-semibold text-[var(--text-on-strong)] shadow-sm",
        box,
        className
      )}
      aria-hidden
    >
      {currentImageUrl ? (
        <img src={currentImageUrl} alt="" className="size-full object-cover" />
      ) : initials.length > 0 && initials !== "?" ? (
        <span className="select-none">{initials}</span>
      ) : (
        <IoPerson className={cn(userIcon, "opacity-90")} aria-hidden />
      )}
      {uploadMode === "upload" ? (
        <label
          htmlFor={uploadInputId}
          className="absolute -end-1 -bottom-1 inline-flex size-6 cursor-pointer items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-h)] shadow-sm"
          aria-label="Upload profile image"
        >
          <IoPencil className="size-3.5" aria-hidden />
          <input
            id={uploadInputId}
            name="profile_image"
            type="file"
            accept={uploadAccept}
            onChange={handleFileChange}
            className="sr-only"
          />
        </label>
      ) : null}
      {verified ? (
        <span
          className={cn(
            "absolute flex items-center justify-center rounded-full border border-[var(--social-bg)] bg-[var(--bg-elevated)] text-[var(--text-h)]",
            badgeWrap
          )}
          aria-hidden
        >
          <IoCheckmark className={cn(checkIcon, "stroke-[2.5]")} aria-hidden />
        </span>
      ) : null}
    </div>
  );
}
