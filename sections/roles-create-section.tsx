"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

import { RoleForm } from "@/components/forms/role-form";
import { Heading } from "@/components/heading";
import { Paragraph } from "@/components/paragraph";
import { LoadingState } from "@/components/ui/loading-state";
import { useAuthUserQuery } from "@/features/auth/auth.api";
import { roleCanCreate } from "@/lib/frontend/roles/acl";
import { ROLE_ROUTES } from "@/lib/frontend/roles/role-routes.utils";

export function RolesCreateSection() {
  const router = useRouter();
  const { t } = useTranslation("translation", { keyPrefix: "modules.roles" });
  const { data: authUser, isLoading } = useAuthUserQuery();
  const canCreate = useMemo(() => roleCanCreate(authUser?.permissions), [authUser?.permissions]);

  useEffect(() => {
    if (isLoading) return;
    if (!authUser || !canCreate) {
      router.replace(ROLE_ROUTES.list);
    }
  }, [authUser, canCreate, isLoading, router]);

  if (isLoading || !authUser) {
    return <LoadingState className="m-6" />;
  }

  if (!canCreate) return null;

  return (
    <div className="w-full min-w-0">
      <div className="space-y-5 px-4 py-6 sm:px-6">
        <div className="space-y-1">
          <Heading id="roles-create-title" pageTitle>
            {t("createForm.title")}
          </Heading>
          <Paragraph className="text-text-muted">{t("createForm.lead")}</Paragraph>
        </div>
        <RoleForm />
      </div>
    </div>
  );
}
