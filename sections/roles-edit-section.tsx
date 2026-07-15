"use client";

import { useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

import { RoleForm } from "@/components/forms/role-form";
import type { TRoleFormValues } from "@/components/forms/role-form.types";
import { Heading } from "@/components/heading";
import { Paragraph } from "@/components/paragraph";
import { LoadingState } from "@/components/ui/loading-state";
import { useAuthUserQuery } from "@/features/auth/auth.api";
import { useRoleQuery } from "@/features/roles/roles.api";
import { roleCanUpdate } from "@/lib/frontend/roles/acl";
import { ROLE_ROUTES } from "@/lib/frontend/roles/role-routes.utils";

export function RolesEditSection() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const roleId = typeof params.id === "string" ? params.id : undefined;
  const { t } = useTranslation("translation", { keyPrefix: "modules.roles" });
  const { data: authUser, isLoading: isAuthLoading } = useAuthUserQuery();
  const canUpdate = useMemo(() => roleCanUpdate(authUser?.permissions), [authUser?.permissions]);

  const {
    data: role,
    isLoading: isRoleLoading,
    isError,
  } = useRoleQuery(roleId, { enabled: Boolean(roleId) && canUpdate });

  const initialValues = useMemo<TRoleFormValues | undefined>(() => {
    if (!role) return undefined;
    return { name: role.name, description: role.description };
  }, [role]);

  useEffect(() => {
    if (isAuthLoading) return;
    if (!authUser || !canUpdate) {
      router.replace(ROLE_ROUTES.list);
    }
  }, [authUser, canUpdate, isAuthLoading, router]);

  useEffect(() => {
    if (isRoleLoading || !canUpdate) return;
    if (isError || (!isRoleLoading && roleId && !role)) {
      router.replace(ROLE_ROUTES.list);
    }
  }, [canUpdate, isError, isRoleLoading, role, roleId, router]);

  if (isAuthLoading || !authUser || isRoleLoading || !role || !initialValues) {
    return <LoadingState className="m-6" />;
  }

  if (!canUpdate) return null;

  return (
    <div className="w-full min-w-0">
      <div className="space-y-5 px-4 py-6 sm:px-6">
        <div className="space-y-1">
          <Heading id="roles-edit-title" pageTitle>
            {t("createForm.editTitle")}
          </Heading>
          <Paragraph className="text-text-muted">{t("createForm.editLead")}</Paragraph>
        </div>
        <RoleForm
          isEdit
          roleId={role.id}
          isSystem={role.is_system}
          initialValues={initialValues}
          initialPermissions={role.permissions}
        />
      </div>
    </div>
  );
}
