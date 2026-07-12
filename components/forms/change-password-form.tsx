"use client";

import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/input";
import { Spinner } from "@/components/ui/spinner";
import { useChangePasswordForm } from "@/components/forms/hooks/use-change-password-form";
import { Heading } from "@/components/heading";
import { Paragraph } from "@/components/paragraph";
import {
  elevatedCardMutedClass,
  elevatedCardSurfaceClass,
  elevatedCardTitleClass,
} from "@/lib/frontend/layout/dashboard-chrome";
import { cn } from "@/lib/utils";

export function ChangePasswordForm() {
  const { t } = useTranslation("translation", { keyPrefix: "profile.changePassword" });
  const { register, handleSubmit, watch, errors, isSubmitting, onSubmit } = useChangePasswordForm();
  const newPassword = watch("new_password");

  return (
    <section className={cn(elevatedCardSurfaceClass, "rounded-xl p-5 sm:p-6")}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="mb-5">
          <Heading id="change-password-heading" SmallTitle customHeadingTag="h2" className={elevatedCardTitleClass}>
            {t("title")}
          </Heading>
          <Paragraph className={cn("mt-1", elevatedCardMutedClass)}>{t("lead")}</Paragraph>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Input
              id="current-password"
              type="password"
              label={t("currentPassword")}
              placeholder={t("currentPasswordPh")}
              autoComplete="current-password"
              error={errors.current_password?.message}
              {...register("current_password", {
                required: t("valRequired"),
              })}
            />
          </div>
          <Input
            id="new-password"
            type="password"
            label={t("newPassword")}
            placeholder={t("newPasswordPh")}
            autoComplete="new-password"
            error={errors.new_password?.message}
            {...register("new_password", {
              required: t("valRequired"),
              minLength: { value: 8, message: t("valMin") },
            })}
          />
          <Input
            id="confirm-new-password"
            type="password"
            label={t("confirmPassword")}
            placeholder={t("confirmPasswordPh")}
            autoComplete="new-password"
            error={errors.new_password_confirmation?.message}
            {...register("new_password_confirmation", {
              required: t("valRequired"),
              validate: (value) => value === newPassword || t("valMatch"),
            })}
          />
        </div>

        <div className="mt-5 flex justify-end">
          <Button variant="outlined" size="md" type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>
            <span className="inline-flex items-center gap-2">
              {isSubmitting ? <Spinner className="size-4 shrink-0" /> : null}
              {isSubmitting ? t("submitting") : t("submit")}
            </span>
          </Button>
        </div>
      </form>
    </section>
  );
}
