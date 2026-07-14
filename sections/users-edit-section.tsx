"use client";

import { useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

import { UserCreateForm } from "@/components/forms/user-create-form";
import type { TUserCreateFormValues } from "@/components/forms/user-create-form.types";
import { Heading } from "@/components/heading";
import { Paragraph } from "@/components/paragraph";
import { LoadingState } from "@/components/ui/loading-state";
import { useAuthUserQuery } from "@/features/auth/auth.api";
import { useUserQuery } from "@/features/users/users.api";
import { userCanUpdate } from "@/lib/frontend/users/acl";
import { USER_ROUTES } from "@/lib/frontend/users/user-routes.utils";

export function UsersEditSection() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const userId = typeof params.id === "string" ? params.id : undefined;
  const { t } = useTranslation("translation", { keyPrefix: "modules.users" });
  const { data: authUser, isLoading: isAuthLoading } = useAuthUserQuery();
  const canUpdate = useMemo(() => userCanUpdate(authUser?.permissions), [authUser?.permissions]);

  const {
    data: user,
    isLoading: isUserLoading,
    isError,
  } = useUserQuery(userId, { enabled: Boolean(userId) && canUpdate });

  const initialValues = useMemo<TUserCreateFormValues | undefined>(() => {
    if (!user) return undefined;
    return {
      name: user.name,
      email: user.email,
      password: "",
      password_confirmation: "",
    };
  }, [user]);

  useEffect(() => {
    if (isAuthLoading) return;
    if (!authUser || !canUpdate) {
      router.replace(USER_ROUTES.list);
    }
  }, [authUser, canUpdate, isAuthLoading, router]);

  useEffect(() => {
    if (isUserLoading || !canUpdate) return;
    if (isError || (!isUserLoading && userId && !user)) {
      router.replace(USER_ROUTES.list);
    }
  }, [canUpdate, isError, isUserLoading, router, user, userId]);

  if (isAuthLoading || !authUser || isUserLoading || !user || !initialValues) {
    return <LoadingState className="m-6" />;
  }

  if (!canUpdate) return null;

  return (
    <div className="w-full min-w-0">
      <div className="space-y-5 px-4 py-6 sm:px-6">
        <div className="space-y-1">
          <Heading id="users-edit-title" pageTitle>
            {t("editUserTitle")}
          </Heading>
          <Paragraph className="text-text-muted">{t("editLead")}</Paragraph>
        </div>
        <UserCreateForm
          isEdit
          userId={user.id}
          initialValues={initialValues}
          initialProfileImageUrl={user.profile_image}
        />
      </div>
    </div>
  );
}
