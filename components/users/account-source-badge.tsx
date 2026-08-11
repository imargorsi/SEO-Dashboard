"use client";

import { useTranslation } from "react-i18next";

import {
  ACCOUNT_SOURCE_CHIP_CLASS,
  ACCOUNT_SOURCE_ICON,
} from "@/lib/frontend/users/account-source-display";
import {
  isKnownUserAccountSource,
  type TUserAccountSource,
} from "@/lib/users/account-source";
import { cn } from "@/lib/utils";

type TAccountSourceBadgeProps = {
  source: TUserAccountSource;
  className?: string;
};

/** Compact provenance chip for admin Users surfaces — hidden when source is unknown. */
export function AccountSourceBadge({ source, className }: TAccountSourceBadgeProps) {
  const { t } = useTranslation("translation", { keyPrefix: "modules.users.accountSource" });

  if (!isKnownUserAccountSource(source)) return null;

  const Icon = ACCOUNT_SOURCE_ICON[source];

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 type-caption",
        ACCOUNT_SOURCE_CHIP_CLASS[source],
        className,
      )}
    >
      <Icon className="size-3.5 shrink-0" aria-hidden />
      <span>{t(source)}</span>
    </span>
  );
}
