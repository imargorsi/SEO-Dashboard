"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

import { UserCreateForm } from "@/components/forms/user-create-form";
import { Heading } from "@/components/heading";
import { Paragraph } from "@/components/paragraph";
import { LoadingState } from "@/components/ui/loading-state";
import { useAuthUserQuery } from "@/features/auth/auth.api";
import { analyticsHeadingStackClass } from "@/lib/frontend/layout/dashboard-chrome";
import { userCanCreate } from "@/lib/frontend/users/acl";
import { USER_ROUTES } from "@/lib/frontend/users/user-routes.utils";
import { cn } from "@/lib/utils";

export function UsersCreateSection() {
  const router = useRouter();
  const { t } = useTranslation("translation", { keyPrefix: "modules.users" });
  const { data: authUser, isLoading } = useAuthUserQuery();
  const canCreate = useMemo(() => userCanCreate(authUser?.permissions), [authUser?.permissions]);

  useEffect(() => {
    if (isLoading) return;
    if (!authUser || !canCreate) {
      router.replace(USER_ROUTES.list);
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
          <Heading id="users-create-title" pageTitle>
            {t("createUserTitle")}
          </Heading>
          <Paragraph className="text-text-muted">{t("createLead")}</Paragraph>
        </div>
        <UserCreateForm />
      </div>
    </div>
  );
}
