"use client";

import { useRef, type ChangeEvent } from "react";
import { useTranslation } from "react-i18next";

import { UserAvatar, type TAvatarSize, type TAvatarVariant } from "@/components/ui/user-avatar";
import { Button } from "@/components/ui/button";
import { notify } from "@/lib/frontend/feedback/notify";
import { cn } from "@/lib/utils";

const DEFAULT_ACCEPT = "image/jpeg,image/png,image/webp,image/gif";

type ImageUploadAvatarProps = {
  name: string;
  imageUrl?: string | null;
  onFilePicked: (file: File) => void;
  label?: string;
  hint?: string;
  pickLabel?: string;
  changeLabel?: string;
  accept?: string;
  maxSizeMb?: number;
  size?: Extract<TAvatarSize, "md" | "lg" | "xl">;
  variant?: TAvatarVariant;
  className?: string;
};

export function ImageUploadAvatar({
  name,
  imageUrl,
  onFilePicked,
  label,
  hint,
  pickLabel,
  changeLabel,
  accept = DEFAULT_ACCEPT,
  maxSizeMb,
  size = "xl",
  variant = "photo",
  className,
}: ImageUploadAvatarProps) {
  const { t } = useTranslation("translation", { keyPrefix: "form" });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasPhoto = Boolean(imageUrl);

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  function handleFilePicked(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    event.target.value = "";
    if (!file) return;

    if (maxSizeMb && file.size > maxSizeMb * 1024 * 1024) {
      notify.error(t("fileTooLarge", { max: maxSizeMb }));
      return;
    }

    onFilePicked(file);
  }

  return (
    <div className={cn("space-y-2", className)}>
      {label ? <span className="block type-label text-text-primary">{label}</span> : null}
      <div className="flex flex-wrap items-center gap-4 sm:gap-5">
        <UserAvatar name={name} imageUrl={imageUrl} size={size} variant={variant} />
        <div className="flex min-w-0 flex-1 flex-col gap-2.5">
          <Button type="button" variant="outlined" size="small" className="w-fit" onClick={openFilePicker}>
            {hasPhoto ? (changeLabel ?? t("changeImage")) : (pickLabel ?? t("pickImage"))}
          </Button>
          {hint ? <p className="type-caption text-text-muted">{hint}</p> : null}
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFilePicked}
            className="sr-only"
            tabIndex={-1}
          />
        </div>
      </div>
    </div>
  );
}
