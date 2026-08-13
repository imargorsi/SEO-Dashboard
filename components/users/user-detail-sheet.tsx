"use client";

import { Icons } from "@/lib/frontend/icons/app-icons";

import { useTranslation } from "react-i18next";

import {
  DetailFieldRow,
  DetailSectionHeading,
  detailSectionClass,
} from "@/components/ui/detail-field-row";
import { StatusChip } from "@/components/ui/status-chip";
import { UserAvatar } from "@/components/ui/user-avatar";
import { AccountSourceBadge } from "@/components/users/account-source-badge";
import { UserProjectAssignments } from "@/components/users/user-project-assignments";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { formatShortDate } from "@/lib/frontend/date/format-relative-date.utils";
import {
  detailBodyClass,
  detailHeroRowClass,
  typeStackIdentityClass,
} from "@/lib/frontend/layout/dashboard-chrome";
import { isActiveUserStatus, isKnownUserAccountSource } from "@/lib/users/constants";
import { cn } from "@/lib/utils";
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
        className="w-[min(100%,28rem)] sm:max-w-lg"
      >
        <SheetHeader>
          <SheetTitle>{t("title")}</SheetTitle>
          <SheetDescription>{t("lead")}</SheetDescription>
        </SheetHeader>

        {user ? (
          <div className={detailBodyClass}>
            <section>
              <div className={detailHeroRowClass}>
                <UserAvatar
                  name={user.name}
                  imageUrl={user.profile_image}
                  size="lg"
                  variant="photo"
                  className="shrink-0"
                />
                <div className="flex min-w-0 flex-1 items-start justify-between gap-3">
                  <div className={cn("min-w-0", typeStackIdentityClass)}>
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

            <section className={detailSectionClass}>
              <DetailSectionHeading title={t("accountTitle")} description={t("accountLead")} />
              <div>
                <DetailFieldRow icon={Icons.mail} label={t("email")}>
                  {user.email}
                </DetailFieldRow>
                <DetailFieldRow icon={Icons.user} label={t("accountSource")}>
                  {isKnownUserAccountSource(user.account_source) ? (
                    <AccountSourceBadge source={user.account_source} />
                  ) : (
                    t("accountSourceUnknown")
                  )}
                </DetailFieldRow>
                <DetailFieldRow icon={Icons.calendar} label={t("createdAt")}>
                  {formatShortDate(user.created_at, i18n.language)}
                </DetailFieldRow>
                <DetailFieldRow icon={Icons.refresh} label={t("updatedAt")}>
                  {formatShortDate(user.updated_at, i18n.language)}
                </DetailFieldRow>
                <DetailFieldRow icon={Icons.checkCircle} label={t("emailVerifiedAt")}>
                  {user.email_verified_at
                    ? formatShortDate(user.email_verified_at, i18n.language)
                    : t("emailNotVerified")}
                </DetailFieldRow>
              </div>
            </section>

            <section className={detailSectionClass}>
              <DetailSectionHeading title={t("projectsTitle")} description={t("projectsLead")} />
              <UserProjectAssignments projects={user.projects} />
            </section>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
