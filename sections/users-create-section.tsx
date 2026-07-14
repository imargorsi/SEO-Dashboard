"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

import { UserCreateForm } from "@/components/forms/user-create-form";
import { Heading } from "@/components/heading";
import { Paragraph } from "@/components/paragraph";
import { LoadingState } from "@/components/ui/loading-state";
import { useAuthUserQuery } from "@/features/auth/auth.api";
import { userCanCreate } from "@/lib/frontend/users/acl";
import { USER_ROUTES } from "@/lib/frontend/users/user-routes.utils";

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
    return <LoadingState className="m-6" />;
  }

  if (!canCreate) return null;

  return (
    <div className="w-full min-w-0">
      <div className="space-y-5 px-4 py-6 sm:px-6">
        <div className="space-y-1">
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
