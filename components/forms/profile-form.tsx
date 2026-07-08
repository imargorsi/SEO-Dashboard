"use client";

import { useTranslation } from "react-i18next";

import { SidebarUserAvatar } from "@/components/layout/sidebar-user-avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/input";
import { Spinner } from "@/components/ui/spinner";
import { useProfileForm } from "@/components/forms/hooks/use-profile-form";
import type { AuthUser } from "@/lib/frontend/auth/types";
import { Heading } from "../heading";

type ProfileFormProps = {
  user: AuthUser;
};

export function ProfileForm({ user }: ProfileFormProps) {
  const { t } = useTranslation("translation", { keyPrefix: "profile.edit" });
  const {
    register,
    handleSubmit,
    errors,
    isSubmitting,
    onSubmit,
    fileInputRef,
    openFilePicker,
    onFilePicked,
    avatarImageUrl,
    name,
    hasPhoto,
  } = useProfileForm(user);

  return (
    <section className="rounded-xl border border-border bg-bg-card p-5 sm:p-6">
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="mb-5">
          <Heading id="profile-heading" SmallTitle customHeadingTag="h2">
            {t("title")}
          </Heading>
          <p className="mt-1 type-body text-text-muted">{t("lead")}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <span className="mb-2 block type-label text-text-primary">{t("photoLabel")}</span>
            <div className="flex flex-wrap items-start gap-4">
              <SidebarUserAvatar
                name={name || user.name}
                imageUrl={avatarImageUrl}
                size="md"
                className="size-16 rounded-xl text-sm"
              />
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <Button type="button" variant="outlined" size="small" className="w-fit" onClick={openFilePicker}>
                  {hasPhoto ? t("photoChange") : t("photoPick")}
                </Button>
                <p className="type-caption text-text-muted">{t("photoHint")}</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={onFilePicked}
                  className="sr-only"
                  tabIndex={-1}
                />
              </div>
            </div>
          </div>

          <Input
            id="profile-name"
            label={t("nameLabel")}
            placeholder={t("namePh")}
            error={errors.name?.message}
            {...register("name", {
              required: t("valRequired"),
              minLength: { value: 2, message: t("valMin") },
            })}
          />
          <Input
            id="profile-email"
            label={t("emailLabel")}
            type="email"
            value={user.email}
            disabled
            readOnly
          />
        </div>

        <div className="mt-5 flex justify-end">
          <Button variant="outlined" size="md" type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>
            <span className="inline-flex items-center gap-2">
              {isSubmitting ? <Spinner className="size-4 shrink-0" /> : null}
              {isSubmitting ? t("saving") : t("save")}
            </span>
          </Button>
        </div>
      </form>
    </section>
  );
}
