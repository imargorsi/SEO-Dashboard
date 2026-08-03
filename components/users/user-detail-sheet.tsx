"use client";

import { useTranslation } from "react-i18next";
import {
  IoCalendarOutline,
  IoCheckmarkCircleOutline,
  IoMailOutline,
  IoRefreshOutline,
} from "react-icons/io5";

import { DetailFieldRow, DetailSectionHeading } from "@/components/ui/detail-field-row";
import { StatusChip } from "@/components/ui/status-chip";
import { UserAvatar } from "@/components/ui/user-avatar";
import { UserProjectAssignments } from "@/components/users/user-project-assignments";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { formatShortDate } from "@/lib/frontend/date/format-relative-date.utils";
import { isActiveUserStatus } from "@/lib/users/constants";
import type { TAdminUserListItem } from "@/types/admin-user.types";

type UserDetailSheetProps = {
  user: TAdminUserListItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function UserDetailSheet({ user, open, onOpenChange }: UserDetailSheetProps) {
  const { t, i18n } = useTranslation("translation", { keyPrefix: "modules.users.detail" });
  const { t: tTable } = useTranslation("translation", { keyPrefix: "modules.users.table" });

  const accountStatus = isActiveUserStatus(user?.status) ? "active" : "inactive";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-[min(100%,28rem)] border-border/60 bg-bg-card/85 shadow-(--shadow-elevated) backdrop-blur-xl sm:max-w-lg dark:border-text-primary/20 dark:bg-bg-card/90"
      >
        <SheetHeader className="border-border/50 bg-transparent dark:border-text-primary/12">
          <SheetTitle>{t("title")}</SheetTitle>
          <SheetDescription>{t("lead")}</SheetDescription>
        </SheetHeader>

        {user ? (
          <div className="themed-scrollbar flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-5 py-5">
            <section>
              <div className="flex items-center gap-3.5">
                <UserAvatar
                  name={user.name}
                  imageUrl={user.profile_image}
                  size="lg"
                  variant="photo"
                  className="shrink-0"
                />
                <div className="flex min-w-0 flex-1 items-start justify-between gap-3">
                  <div className="min-w-0 space-y-1">
                    <p className="truncate type-title leading-snug text-text-primary">{user.name}</p>
                    <p className="truncate type-caption leading-snug text-text-muted">{user.email}</p>
                  </div>
                  <StatusChip
                    className="mt-0.5 shrink-0"
                    colorKey={accountStatus}
                    label={accountStatus === "active" ? tTable("statusActive") : tTable("statusInactive")}
                  />
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <DetailSectionHeading title={t("accountTitle")} description={t("accountLead")} />
              <div>
                <DetailFieldRow icon={IoMailOutline} label={t("email")}>
                  {user.email}
                </DetailFieldRow>
                <DetailFieldRow icon={IoCalendarOutline} label={t("createdAt")}>
                  {formatShortDate(user.created_at, i18n.language)}
                </DetailFieldRow>
                <DetailFieldRow icon={IoRefreshOutline} label={t("updatedAt")}>
                  {formatShortDate(user.updated_at, i18n.language)}
                </DetailFieldRow>
                <DetailFieldRow icon={IoCheckmarkCircleOutline} label={t("emailVerifiedAt")}>
                  {user.email_verified_at
                    ? formatShortDate(user.email_verified_at, i18n.language)
                    : t("emailNotVerified")}
                </DetailFieldRow>
              </div>
            </section>

            <section className="space-y-3">
              <DetailSectionHeading title={t("projectsTitle")} description={t("projectsLead")} />
              <UserProjectAssignments projects={user.projects} />
            </section>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
