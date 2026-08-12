"use client";

import { Input } from "@/components/input";
import { RolePermissionMatrix } from "@/components/roles/role-permission-matrix";
import type { TUseRoleFormResult } from "@/components/forms/hooks/use-role-form.hook";
import { Skeleton } from "@/components/ui/skeleton";
import {
  analyticsHeadingStackClass,
  analyticsPanelClass,
  elevatedCardSurfaceClass,
  settingsInsetDividerClass,
  tableGlassChipClass,
} from "@/lib/frontend/layout/dashboard-chrome";
import { fieldStartIcons } from "@/lib/frontend/forms/input-start-icons";
import { DISPLAY_NAME_MAX_LENGTH } from "@/lib/validation/display-name";
import { cn } from "@/lib/utils";

type TRoleFormFieldsProps = {
  hook: TUseRoleFormResult;
};

export function RoleFormFields({ hook }: TRoleFormFieldsProps) {
  const {
    t,
    register,
    errors,
    isSystem,
    modules,
    isCatalogLoading,
    isCatalogError,
    permissions,
    totalPermissions,
    onPermissionsChange,
  } = hook;

  return (
    <div className="flex flex-col gap-6">
      <section className={cn(elevatedCardSurfaceClass, analyticsPanelClass)}>
        <div className="grid gap-4 sm:grid-cols-2 sm:items-start">
          <div className="flex flex-col gap-2.5">
            <Input
              id="role-form-name"
              label={t("name")}
              placeholder={t("namePh")}
              required
              readOnly={isSystem}
              maxLength={DISPLAY_NAME_MAX_LENGTH}
              startIcon={fieldStartIcons.shield}
              error={errors.name?.message}
              {...register("name", {
                required: t("valRequired"),
                minLength: { value: 2, message: t("valMin") },
                maxLength: { value: DISPLAY_NAME_MAX_LENGTH, message: t("valMax") },
              })}
            />
            {isSystem ? (
              <p className="type-caption text-text-muted">{t("systemRoleNameLocked")}</p>
            ) : null}
          </div>

          <Input
            id="role-form-description"
            label={t("description")}
            placeholder={t("descriptionPh")}
            startIcon={fieldStartIcons.document}
            {...register("description")}
          />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className={cn(analyticsHeadingStackClass, "max-w-2xl")}>
            <h2 className="type-title text-text-primary">{t("permsHeading")}</h2>
            <p className="type-caption text-text-muted">{t("permsLead")}</p>
          </div>
          {!isCatalogLoading && !isCatalogError ? (
            <span className={cn(tableGlassChipClass, "text-text-secondary")}>
              {t("permsCount", { selected: permissions.length, total: totalPermissions })}
            </span>
          ) : null}
        </div>

        {isCatalogLoading ? (
          <div
            className={cn(
              elevatedCardSurfaceClass,
              "flex min-h-80 overflow-hidden rounded-xl",
            )}
            role="status"
            aria-live="polite"
            aria-busy="true"
          >
            <span className="sr-only">{t("permsLoading")}</span>
            <aside
              className={cn(
                "flex w-48 shrink-0 flex-col gap-2 border-e border-border/45 p-3.5",
                "bg-bg-card/30 dark:border-text-primary/15 dark:bg-text-primary/3 sm:w-52",
              )}
            >
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-9 w-full rounded-lg" />
              ))}
            </aside>
            <div className="min-w-0 flex-1 space-y-4 px-5 py-4">
              <Skeleton className="h-5 w-40" />
              <div className={settingsInsetDividerClass} aria-hidden />
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-20 rounded-xl" />
                ))}
              </div>
            </div>
          </div>
        ) : isCatalogError ? (
          <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-5 type-body text-destructive">
            {t("permsLoadErrorBody")}
          </p>
        ) : modules.length === 0 ? (
          <p className={cn(elevatedCardSurfaceClass, "rounded-xl px-4 py-5 type-body text-text-muted")}>
            {t("permsEmpty")}
          </p>
        ) : (
          <RolePermissionMatrix
            modules={modules}
            selected={permissions}
            onChange={onPermissionsChange}
          />
        )}
      </section>
    </div>
  );
}
