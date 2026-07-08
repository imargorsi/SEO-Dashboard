"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { FormTextField } from "@/components/form/form-text-field";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Heading } from "@/components/heading";
import { Paragraph } from "@/components/paragraph";
import { useCreateUserMutation } from "@/features/users/users.api";
import { useAuthUserQuery } from "@/features/auth/auth.api";
import { userCanCreate } from "@/lib/frontend/users/acl";
import { ApiError } from "@/lib/frontend/api/errors";
import { notify } from "@/lib/frontend/feedback/notify";

type CreateUserFormValues = {
  name: string;
  email: string;
};

export function UsersCreateSection() {
  const router = useRouter();
  const { data: authUser } = useAuthUserQuery();
  const { t } = useTranslation("translation", { keyPrefix: "modules.users" });
  const createMutation = useCreateUserMutation();

  const canCreate = useMemo(() => userCanCreate(authUser?.permissions), [authUser]);

  useEffect(() => {
    if (!canCreate) router.replace("/users");
  }, [canCreate, router]);

  const form = useForm<CreateUserFormValues>({
    defaultValues: { name: "", email: "" },
    mode: "onSubmit",
  });

  const { control, handleSubmit, reset } = form;

  if (!canCreate) return null;

  async function onSubmit(values: CreateUserFormValues) {
    try {
      await createMutation.mutateAsync({
        name: values.name.trim(),
        email: values.email.trim(),
      });
      notify.success(t("createForm.successFallback"));
      reset();
    } catch (e) {
      notify.error(ApiError.messageFrom(e, t("createForm.errorFallback")));
    }
  }

  return (
    <div className="w-full min-w-0">
      <div className="px-4 py-6 sm:px-6">
        <div className="mx-auto w-full max-w-xl rounded-2xl border border-border bg-bg-card p-6 shadow-(--shadow) sm:p-8">
          <div className="mb-6 space-y-1">
            <Heading id="users-create-title" SmallTitle customHeadingTag="h2">
              {t("createForm.title")}
            </Heading>
            <Paragraph className="text-text-muted">{t("createForm.lead")}</Paragraph>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
            <FormTextField
              control={control}
              name="name"
              label={t("createForm.name")}
              placeholder={t("createForm.namePh")}
              rules={{ required: t("createForm.valRequired") }}
            />
            <FormTextField
              control={control}
              name="email"
              label={t("createForm.email")}
              placeholder={t("createForm.emailPh")}
              type="email"
              autoComplete="email"
              rules={{
                required: t("createForm.valRequired"),
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: t("createForm.valEmail"),
                },
              }}
            />
            <div className="flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
              <Button
                type="submit"
                disabled={createMutation.isPending}
                aria-busy={createMutation.isPending}
                className="h-11 w-full sm:min-w-44 sm:w-auto"
              >
                <span className="inline-flex items-center justify-center gap-2 px-1">
                  {createMutation.isPending ? <Spinner className="size-4 shrink-0" /> : null}
                  {createMutation.isPending ? t("createForm.submitting") : t("createForm.submit")}
                </span>
              </Button>
              <Link href="/users" className="text-center type-body-strong text-brand transition-colors hover:text-brand-orange hover:underline">
                {t("createForm.backToList")}
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
