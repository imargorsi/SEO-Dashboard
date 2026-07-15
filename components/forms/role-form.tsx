"use client";

import Link from "next/link";

import { RoleFormFields } from "@/components/forms/role-form-fields";
import { useRoleForm } from "@/components/forms/hooks/use-role-form.hook";
import type { TRoleFormProps } from "@/components/forms/role-form.types";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { elevatedCardSurfaceClass } from "@/lib/frontend/layout/dashboard-chrome";
import { ROLE_ROUTES } from "@/lib/frontend/roles/role-routes.utils";
import { cn } from "@/lib/utils";

export function RoleForm(props: TRoleFormProps = {}) {
  const hook = useRoleForm(props);
  const { t, onSubmit, isSubmitting, isEdit } = hook;

  return (
    <form className="space-y-5" onSubmit={onSubmit} noValidate>
      <section className={cn(elevatedCardSurfaceClass, "rounded-2xl p-6 shadow-(--shadow) sm:p-8")}>
        <RoleFormFields hook={hook} />
      </section>

      <div className="p-1">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href={ROLE_ROUTES.list}
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
              {isSubmitting ? (isEdit ? t("editSubmitting") : t("submitting")) : isEdit ? t("editSubmit") : t("submit")}
            </span>
          </Button>
        </div>
      </div>
    </form>
  );
}
