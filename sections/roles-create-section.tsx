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
import { analyticsHeadingStackClass } from "@/lib/frontend/layout/dashboard-chrome";
import { ROLE_ROUTES } from "@/lib/frontend/roles/role-routes.utils";
import { cn } from "@/lib/utils";

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
    return <LoadingState skeletonVariant="form" />;
  }

  if (!canCreate) return null;

  return (
    <div className="w-full min-w-0">
      <div className="flex flex-col gap-6 px-4 py-6 sm:gap-7 sm:px-6 sm:py-7">
        <div className={cn(analyticsHeadingStackClass, "max-w-2xl")}>
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
