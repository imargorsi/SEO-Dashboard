import type { IconType } from "react-icons";
import { FcGoogle } from "react-icons/fc";
import { IoPersonAddOutline, IoPersonOutline } from "react-icons/io5";

import type { TUserAccountSourceKnown } from "@/lib/users/account-source";

/** Shared icons for account-source chips and admin filter dropdown. */
export const ACCOUNT_SOURCE_ICON: Record<TUserAccountSourceKnown, IconType> = {
  admin: IoPersonAddOutline,
  self_register: IoPersonOutline,
  google: FcGoogle,
};

/** Glass + brand-tinted chrome — aligns with dashboard frosted chips, not solid status fills. */
export const ACCOUNT_SOURCE_CHIP_CLASS: Record<TUserAccountSourceKnown, string> = {
  admin:
    "border-brand/40 bg-brand/10 text-brand shadow-sm backdrop-blur-md dark:border-brand/45 dark:bg-brand/14",
  self_register:
    "border-brand/30 bg-brand/[0.06] text-text-primary shadow-sm backdrop-blur-md dark:border-brand/35 dark:bg-brand/10 dark:text-text-primary",
  google:
    "border-brand/35 bg-brand/[0.08] text-text-primary shadow-sm backdrop-blur-md dark:border-brand/40 dark:bg-brand/12",
};
