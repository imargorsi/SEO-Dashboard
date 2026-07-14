"use client";

import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { UserAvatar } from "@/components/ui/user-avatar";
import { UserProjectAssignments } from "@/components/users/user-project-assignments";
import { UserStatusIndicator } from "@/components/users/user-status-indicator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { formatShortDate } from "@/lib/frontend/date/format-relative-date.utils";
import { elevatedCardMutedClass, elevatedCardSurfaceClass } from "@/lib/frontend/layout/dashboard-chrome";
import { isActiveUserStatus } from "@/lib/users/constants";
import type { TAdminUserListItem } from "@/types/admin-user.types";
import { cn } from "@/lib/utils";

type UserDetailSheetProps = {
  user: TAdminUserListItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function DetailField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1">
      <p className={cn("type-caption-xs uppercase tracking-[0.08em]", elevatedCardMutedClass)}>{label}</p>
      <div className="type-body text-text-primary">{children}</div>
    </div>
  );
}

export function UserDetailSheet({ user, open, onOpenChange }: UserDetailSheetProps) {
  const { t, i18n } = useTranslation("translation", { keyPrefix: "modules.users.detail" });
  const { t: tTable } = useTranslation("translation", { keyPrefix: "modules.users.table" });

  const accountStatus = isActiveUserStatus(user?.status) ? "active" : "inactive";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[min(100%,28rem)] sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{t("title")}</SheetTitle>
          <SheetDescription>{t("lead")}</SheetDescription>
        </SheetHeader>

        {user ? (
          <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-5 py-5">
            <section className={cn(elevatedCardSurfaceClass, "rounded-2xl p-4")}>
              <div className="flex items-start gap-3">
                <UserAvatar
                  name={user.name}
                  imageUrl={user.profile_image}
                  size="lg"
                  roundedClassName="rounded-xl"
                />
                <div className="min-w-0 space-y-1">
                  <p className="truncate type-body-strong text-text-primary">{user.name}</p>
                  <p className="truncate type-caption text-text-muted">{user.email}</p>
                  <UserStatusIndicator
                    status={accountStatus}
                    label={accountStatus === "active" ? tTable("statusActive") : tTable("statusInactive")}
                    className="mt-1"
                  />
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <DetailField label={t("email")}>{user.email}</DetailField>
              <DetailField label={t("createdAt")}>
                {formatShortDate(user.created_at, i18n.language)}
              </DetailField>
              <DetailField label={t("updatedAt")}>
                {formatShortDate(user.updated_at, i18n.language)}
              </DetailField>
              <DetailField label={t("emailVerifiedAt")}>
                {user.email_verified_at
                  ? formatShortDate(user.email_verified_at, i18n.language)
                  : t("emailNotVerified")}
              </DetailField>
            </section>

            <section className="space-y-3 border-t border-border pt-5">
              <div className="space-y-1">
                <h3 className="type-label text-text-primary">{t("projectsTitle")}</h3>
                <p className="type-caption text-text-muted">{t("projectsLead")}</p>
              </div>
              <UserProjectAssignments projects={user.projects} variant="cards" />
            </section>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
