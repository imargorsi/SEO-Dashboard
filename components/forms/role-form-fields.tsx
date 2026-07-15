"use client";

import { Input } from "@/components/input";
import { LoadingState } from "@/components/ui/loading-state";
import { RolePermissionMatrix } from "@/components/roles/role-permission-matrix";
import type { TUseRoleFormResult } from "@/components/forms/hooks/use-role-form.hook";

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
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
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

        <Input
          id="role-form-description"
          label={t("description")}
          placeholder={t("descriptionPh")}
          {...register("description")}
        />
      </div>

      {isSystem ? <p className="type-caption text-text-muted">{t("systemRoleNameLocked")}</p> : null}

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="type-body-strong text-text-primary">{t("permsHeading")}</h3>
          {!isCatalogLoading && !isCatalogError ? (
            <span className="type-caption text-text-muted">
              {t("permsCount", { selected: permissions.length, total: totalPermissions })}
            </span>
          ) : null}
        </div>

        {isCatalogLoading ? (
          <LoadingState label={t("permsLoading")} />
        ) : isCatalogError ? (
          <p className="type-body text-destructive">{t("permsLoadErrorBody")}</p>
        ) : modules.length === 0 ? (
          <p className="type-body text-text-muted">{t("permsEmpty")}</p>
        ) : (
          <RolePermissionMatrix modules={modules} selected={permissions} onChange={onPermissionsChange} />
        )}
      </div>
    </div>
  );
}
