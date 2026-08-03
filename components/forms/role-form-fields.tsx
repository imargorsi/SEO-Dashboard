"use client";

import { Input } from "@/components/input";
import { RolePermissionMatrix } from "@/components/roles/role-permission-matrix";
import type { TUseRoleFormResult } from "@/components/forms/hooks/use-role-form.hook";
import { Skeleton } from "@/components/ui/skeleton";
import {
  analyticsHeadingStackClass,
  analyticsPanelClass,
  elevatedCardSurfaceClass,
} from "@/lib/frontend/layout/dashboard-chrome";
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
              error={errors.name?.message}
              {...register("name", {
                required: t("valRequired"),
                minLength: { value: 2, message: t("valMin") },
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
            <span className="inline-flex items-center rounded-full border border-border/50 bg-bg-card/40 px-3 py-1 type-caption tabular-nums text-text-secondary shadow-sm backdrop-blur-md">
              {t("permsCount", { selected: permissions.length, total: totalPermissions })}
            </span>
          ) : null}
        </div>

        {isCatalogLoading ? (
          <div
            className={cn(
              "grid min-h-80 gap-0 overflow-hidden rounded-3xl border border-border/40",
              "bg-bg-card/45 shadow-(--shadow-elevated) backdrop-blur-md",
              "lg:grid-cols-[240px_1fr]",
            )}
            role="status"
            aria-live="polite"
            aria-busy="true"
          >
            <span className="sr-only">{t("permsLoading")}</span>
            <aside className="space-y-2 border-b border-border/50 p-3 lg:border-b-0 lg:border-e lg:border-border/40">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-11 w-full rounded-xl" />
              ))}
            </aside>
            <div className="space-y-4 p-5">
              <Skeleton className="h-5 w-40" />
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-24 rounded-2xl" />
                ))}
              </div>
            </div>
          </div>
        ) : isCatalogError ? (
          <p className="rounded-3xl border border-destructive/30 bg-destructive/5 px-4 py-5 type-body text-destructive">
            {t("permsLoadErrorBody")}
          </p>
        ) : modules.length === 0 ? (
          <p className="rounded-3xl border border-border/40 bg-bg-card/45 px-4 py-5 type-body text-text-muted">
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
