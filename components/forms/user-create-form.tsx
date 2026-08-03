"use client";

import Link from "next/link";

import { UserCreateFields } from "@/components/forms/user-create-fields";
import { useUserCreateForm } from "@/components/forms/hooks/use-user-create-form.hook";
import type { TUserFormProps } from "@/components/forms/user-create-form.types";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { USER_ROUTES } from "@/lib/frontend/users/user-routes.utils";

export function UserCreateForm(props: TUserFormProps = {}) {
  const hook = useUserCreateForm(props);
  const { t, onSubmit, isSubmitting, isEdit } = hook;

  return (
    <form className="flex flex-col gap-6" onSubmit={onSubmit} noValidate>
      <UserCreateFields hook={hook} />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href={USER_ROUTES.list}
          className="inline-flex type-body-strong text-text-secondary transition-colors hover:text-text-primary hover:underline"
        >
          {t("backToList")}
        </Link>

        <Button
          type="submit"
          variant="gradient"
          size="lg"
          disabled={isSubmitting}
          aria-busy={isSubmitting}
          className="w-full sm:min-w-52 sm:w-auto"
        >
          <span className="inline-flex items-center justify-center gap-2 px-1">
            {isSubmitting ? <Spinner className="size-4 shrink-0" /> : null}
            {isSubmitting
              ? isEdit
                ? t("editSubmitting")
                : t("submitting")
              : isEdit
                ? t("editSubmit")
                : t("submit")}
          </span>
        </Button>
      </div>
    </form>
  );
}
