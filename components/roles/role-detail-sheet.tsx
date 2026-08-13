"use client";

import { Icons } from "@/lib/frontend/icons/app-icons";

import { useTranslation } from "react-i18next";

import {
  DetailFieldRow,
  DetailSectionHeading,
  detailSectionClass,
} from "@/components/ui/detail-field-row";
import { SheetContentSkeleton } from "@/components/skeletons/dashboard-page-skeleton";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { StatusChip } from "@/components/ui/status-chip";
import { usePermissionCatalogQuery } from "@/features/permissions/permissions.api";
import { useRoleQuery } from "@/features/roles/roles.api";
import { formatShortDate } from "@/lib/frontend/date/format-relative-date.utils";
import {
  detailBodyClass,
  detailHeroRowClass,
  detailIconWellOutlineClass,
  typeStackIdentityClass,
} from "@/lib/frontend/layout/dashboard-chrome";
import { roleActionIcon } from "@/lib/frontend/roles/permission-action-icon.utils";
import { actionLabelKey, capitalizeAction, modulePermission } from "@/lib/frontend/roles/permission-labels.utils";
import { permissionModuleIcon } from "@/lib/frontend/roles/permission-module-icon.utils";
import { adminPermission, type AdminModuleSlug } from "@/lib/rbac/permission-catalog";
import { isActiveRoleStatus } from "@/lib/roles/constants";
import { cn } from "@/lib/utils";

type TRoleDetailSheetProps = {
  roleId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function PermissionActionChip({ action, label }: { action: string; label: string }) {
  const Icon = roleActionIcon(action);

  return (
    <span
      title={label}
      aria-label={label}
      className={cn(
        "inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-border/60 bg-bg-card/50 text-text-primary shadow-sm backdrop-blur-md transition-colors",
        "dark:border-text-primary/35 dark:bg-text-primary/12",
        "[&_svg]:size-3.5 [&_svg]:shrink-0",
      )}
    >
      {Icon ? <Icon aria-hidden /> : <span className="type-caption-xs font-semibold">{label}</span>}
    </span>
  );
}

type TPermissionModuleGroup = {
  slug: string;
  label: string;
  actions: readonly string[];
};

function GrantedPermissionModules({
  modules,
  permissions,
  scope,
}: {
  modules: TPermissionModuleGroup[];
  permissions: string[];
  scope: "project" | "admin";
}) {
  const { t: tActions } = useTranslation("translation", { keyPrefix: "modules.roles.actions" });

  const rows = modules.flatMap((module) => {
    const grantedActions = module.actions.filter((action) => {
      const key =
        scope === "admin"
          ? adminPermission(module.slug as AdminModuleSlug, action as "view" | "create" | "update" | "delete")
          : modulePermission(module.slug, action);
      return permissions.includes(key);
    });
    if (grantedActions.length === 0) return [];
    return [{ module, grantedActions }];
  });

  if (rows.length === 0) return null;

  return (
    <ul className="flex flex-col gap-2.5">
      {rows.map(({ module, grantedActions }) => {
        const ModuleIcon = permissionModuleIcon(module.slug);
        return (
          <li
            key={module.slug}
            className="flex items-center gap-3 rounded-2xl border border-border/50 bg-bg-card/40 px-3 py-2.5 shadow-sm backdrop-blur-md dark:border-text-primary/20 dark:bg-text-primary/6"
          >
            <span className={cn(detailIconWellOutlineClass, "size-8 shrink-0")} aria-hidden>
              <ModuleIcon className="size-3.5" />
            </span>
            <p className="min-w-0 flex-1 truncate type-label text-text-primary">{module.label}</p>
            <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
              {grantedActions.map((action) => {
                const labelKey = actionLabelKey(action);
                const label = labelKey ? tActions(labelKey) : capitalizeAction(action);
                return <PermissionActionChip key={action} action={action} label={label} />;
              })}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function RoleDetailSheet({ roleId, open, onOpenChange }: TRoleDetailSheetProps) {
  const { t, i18n } = useTranslation("translation", { keyPrefix: "modules.roles.detail" });
  const { t: tTable } = useTranslation("translation", { keyPrefix: "modules.roles.table" });
  const { data: role, isLoading } = useRoleQuery(roleId ?? undefined, { enabled: open && Boolean(roleId) });
  const { data: catalog } = usePermissionCatalogQuery({ enabled: open && Boolean(roleId) });

  const projectModules = catalog?.project_modules ?? [];
  const adminModules = catalog?.admin_modules ?? [];
  const roleStatus = role && isActiveRoleStatus(role.status) ? "active" : "inactive";

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

        {isLoading || !role ? (
          <div className="p-5">
            <SheetContentSkeleton />
          </div>
        ) : (
          <div className={detailBodyClass}>
            <section>
              <div className={detailHeroRowClass}>
                <span className={cn(detailIconWellOutlineClass, "size-12 shrink-0")} aria-hidden>
                  <Icons.security className="size-5" />
                </span>
                <div className="flex min-w-0 flex-1 items-start justify-between gap-3">
                  <div className={cn("min-w-0", typeStackIdentityClass)}>
                    <p className="truncate type-title leading-snug text-text-primary">{role.name}</p>
                    <p className="truncate type-caption leading-snug text-text-muted">{role.slug}</p>
                  </div>
                  <StatusChip
                    className="mt-0.5 shrink-0"
                    colorKey={roleStatus}
                    label={roleStatus === "active" ? tTable("statusActive") : tTable("statusInactive")}
                  />
                </div>
              </div>
            </section>

            <section className={detailSectionClass}>
              <DetailSectionHeading
                title={t("description")}
                description={role.description?.trim() ? role.description : t("noDescription")}
              />
            </section>

            <section className={detailSectionClass}>
              <DetailSectionHeading title={t("overviewTitle")} description={t("overviewLead")} />
              <div>
                <DetailFieldRow icon={Icons.userGroup} label={t("members")}>
                  {role.members_count}
                </DetailFieldRow>
                <DetailFieldRow icon={Icons.lock} label={t("permissionsCount")}>
                  {role.permissions.length}
                </DetailFieldRow>
                <DetailFieldRow icon={Icons.calendar} label={t("createdAt")}>
                  {formatShortDate(role.created_at, i18n.language)}
                </DetailFieldRow>
                <DetailFieldRow icon={Icons.refresh} label={t("updatedAt")}>
                  {formatShortDate(role.updated_at, i18n.language)}
                </DetailFieldRow>
              </div>
            </section>

            <section className={detailSectionClass}>
              <DetailSectionHeading title={t("permissionsTitle")} description={t("permissionsLead")} />
              {role.permissions.length === 0 ? (
                <p className="type-body text-text-muted">{t("noPermissions")}</p>
              ) : (
                <div className="space-y-5">
                  <GrantedPermissionModules
                    modules={projectModules}
                    permissions={role.permissions}
                    scope="project"
                  />
                  <GrantedPermissionModules
                    modules={adminModules}
                    permissions={role.permissions}
                    scope="admin"
                  />
                </div>
              )}
            </section>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
