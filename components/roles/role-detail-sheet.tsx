"use client";

import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { RoleScopeBadge } from "@/components/roles/role-scope-badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { LoadingState } from "@/components/ui/loading-state";
import { usePermissionCatalogQuery } from "@/features/permissions/permissions.api";
import { useRoleQuery } from "@/features/roles/roles.api";
import { formatShortDate } from "@/lib/frontend/date/format-relative-date.utils";
import { elevatedCardMutedClass, elevatedCardSurfaceClass } from "@/lib/frontend/layout/dashboard-chrome";
import { actionLabelKey, capitalizeAction, modulePermission } from "@/lib/frontend/roles/permission-labels.utils";
import { cn } from "@/lib/utils";

type TRoleDetailSheetProps = {
  roleId: string | null;
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

export function RoleDetailSheet({ roleId, open, onOpenChange }: TRoleDetailSheetProps) {
  const { t, i18n } = useTranslation("translation", { keyPrefix: "modules.roles.detail" });
  const { t: tTable } = useTranslation("translation", { keyPrefix: "modules.roles.table" });
  const { t: tActions } = useTranslation("translation", { keyPrefix: "modules.roles.actions" });
  const { data: role, isLoading } = useRoleQuery(roleId ?? undefined, { enabled: open });
  const { data: catalog } = usePermissionCatalogQuery({ enabled: open });

  const modules = catalog?.project_modules ?? [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[min(100%,28rem)] sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{t("title")}</SheetTitle>
          <SheetDescription>{t("lead")}</SheetDescription>
        </SheetHeader>

        {isLoading || !role ? (
          <div className="p-5">
            <LoadingState label={t("loading")} />
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-5 py-5">
            <section className={cn(elevatedCardSurfaceClass, "rounded-2xl p-4")}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="type-body-strong text-text-primary">{role.name}</p>
                <div className="flex items-center gap-1.5">
                  {role.is_system ? <Badge variant="outline">{tTable("systemYes")}</Badge> : null}
                  <RoleScopeBadge
                    scope={role.scope}
                    label={role.scope === "platform" ? tTable("scopePlatform") : tTable("scopeProject")}
                  />
                </div>
              </div>
              <p className="mt-1 type-caption text-text-muted">{role.slug}</p>
              {role.description ? (
                <p className="mt-3 type-body text-text-secondary">{role.description}</p>
              ) : null}
            </section>

            <section className="grid grid-cols-2 gap-4">
              <DetailField label={t("members")}>{role.members_count}</DetailField>
              <DetailField label={t("permissionsCount")}>{role.permissions.length}</DetailField>
              <DetailField label={t("createdAt")}>{formatShortDate(role.created_at, i18n.language)}</DetailField>
              <DetailField label={t("updatedAt")}>{formatShortDate(role.updated_at, i18n.language)}</DetailField>
            </section>

            <section className="space-y-3 border-t border-border pt-5">
              <h3 className="type-label text-text-primary">{t("permissionsTitle")}</h3>

              {role.permissions.length === 0 ? (
                <p className="type-body text-text-muted">{t("noPermissions")}</p>
              ) : (
                <div className="space-y-3">
                  {modules.map((module) => {
                    const grantedActions = module.actions.filter((action) =>
                      role.permissions.includes(modulePermission(module.slug, action)),
                    );
                    if (grantedActions.length === 0) return null;

                    return (
                      <div key={module.slug} className="space-y-1.5">
                        <p className="type-body-strong text-text-primary">{module.label}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {grantedActions.map((action) => {
                            const labelKey = actionLabelKey(action);
                            const label = labelKey ? tActions(labelKey) : capitalizeAction(action);

                            return (
                              <Badge key={action} variant="outline" className="type-caption-xs">
                                {label}
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
