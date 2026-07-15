"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import type { TRoleFormProps, TRoleFormValues } from "@/components/forms/role-form.types";
import { usePermissionCatalogQuery } from "@/features/permissions/permissions.api";
import { useCreateRoleMutation, useUpdateRoleMutation } from "@/features/roles/roles.api";
import { ApiError } from "@/lib/frontend/api/errors";
import { notify } from "@/lib/frontend/feedback/notify";
import { ROLE_ROUTES } from "@/lib/frontend/roles/role-routes.utils";

const DEFAULT_VALUES: TRoleFormValues = {
  name: "",
  description: "",
};

export function useRoleForm({
  isEdit = false,
  roleId,
  isSystem = false,
  initialValues,
  initialPermissions,
}: TRoleFormProps = {}) {
  const router = useRouter();
  const { t } = useTranslation("translation", { keyPrefix: "modules.roles.createForm" });
  const { data: catalog, isLoading: isCatalogLoading, isError: isCatalogError } = usePermissionCatalogQuery();
  const createMutation = useCreateRoleMutation();
  const updateMutation = useUpdateRoleMutation();
  const [permissions, setPermissions] = useState<string[]>(initialPermissions ?? []);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<TRoleFormValues>({
    defaultValues: initialValues ?? DEFAULT_VALUES,
    mode: "onSubmit",
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const modules = catalog?.project_modules ?? [];
  const totalPermissions = modules.reduce((sum, module) => sum + module.actions.length, 0);

  const onSubmit = handleSubmit(async (values) => {
    const payload = {
      name: values.name.trim(),
      description: values.description.trim(),
      permissions,
    };

    try {
      if (isEdit) {
        if (!roleId) {
          notify.error(t("editErrorFallback"));
          return;
        }

        await updateMutation.mutateAsync({ roleId, payload });
        notify.success(t("editSuccessFallback"));
        router.push(ROLE_ROUTES.list);
        return;
      }

      await createMutation.mutateAsync(payload);
      notify.success(t("successFallback"));
      router.push(ROLE_ROUTES.list);
    } catch (error) {
      if (error instanceof ApiError) {
        const nameError = error.errors.name?.[0];
        if (nameError) setError("name", { type: "server", message: nameError });

        notify.error(ApiError.messageFrom(error, isEdit ? t("editErrorFallback") : t("errorFallback")));
        return;
      }

      notify.error(isEdit ? t("editErrorFallback") : t("errorFallback"));
    }
  });

  const onPermissionsChange = useCallback((next: string[]) => {
    setPermissions(next);
  }, []);

  return {
    t,
    register,
    errors,
    isEdit,
    isSystem,
    isSubmitting,
    modules,
    isCatalogLoading,
    isCatalogError,
    permissions,
    totalPermissions,
    onPermissionsChange,
    onSubmit,
  };
}

export type TUseRoleFormResult = ReturnType<typeof useRoleForm>;
