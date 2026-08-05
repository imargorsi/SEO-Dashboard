"use client";

import { Input } from "@/components/input";
import type { TUseUserCreateFormResult } from "@/components/forms/hooks/use-user-create-form.hook";
import { UserProjectMembershipsEditor } from "@/components/users/user-project-memberships-editor";
import { ImageUploadAvatar } from "@/components/ui/image-upload-avatar";
import {
  analyticsPanelClass,
  elevatedCardSurfaceClass,
  glassPanelSurfaceClass,
} from "@/lib/frontend/layout/dashboard-chrome";
import { DISPLAY_NAME_MAX_LENGTH } from "@/lib/validation/display-name";
import { cn } from "@/lib/utils";

type UserCreateFieldsProps = {
  hook: TUseUserCreateFormResult;
};

export function UserCreateFields({ hook }: UserCreateFieldsProps) {
  const {
    t,
    register,
    errors,
    name,
    isEdit,
    userId,
    profilePreviewUrl,
    onProfileImagePicked,
    passwordRules,
    passwordConfirmationRules,
    assignments,
    setAssignments,
    stagedMemberships,
    setStagedMemberships,
  } = hook;

  return (
    <div className="flex flex-col gap-6">
      <section className={cn(elevatedCardSurfaceClass, analyticsPanelClass)}>
        <div className="flex flex-col gap-5">
          <ImageUploadAvatar
            name={name || t("name")}
            imageUrl={profilePreviewUrl}
            onFilePicked={onProfileImagePicked}
            hint={t("profileImageHint")}
            pickLabel={t("profileImageUploadLabel")}
            changeLabel={t("profileImageChangeLabel")}
            variant="photo"
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              id="user-form-name"
              label={t("name")}
              placeholder={t("namePh")}
              required
              maxLength={DISPLAY_NAME_MAX_LENGTH}
              error={errors.name?.message}
              autoComplete="name"
              {...register("name", {
                required: t("valRequired"),
                minLength: { value: 1, message: t("valRequired") },
                maxLength: { value: DISPLAY_NAME_MAX_LENGTH, message: t("valMax") },
              })}
            />

            <Input
              id="user-form-email"
              type="email"
              label={t("email")}
              placeholder={t("emailPh")}
              required
              error={errors.email?.message}
              autoComplete="email"
              {...register("email", {
                required: t("valRequired"),
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: t("valEmail"),
                },
              })}
            />

            <Input
              id="user-form-password"
              type="password"
              label={t("password")}
              placeholder={isEdit ? t("passwordPhEdit") : t("passwordPh")}
              required={!isEdit}
              error={errors.password?.message}
              autoComplete="new-password"
              {...register("password", passwordRules)}
            />

            <Input
              id="user-form-password-confirmation"
              type="password"
              label={t("passwordConfirmation")}
              placeholder={isEdit ? t("passwordConfirmationPhEdit") : t("passwordConfirmationPh")}
              required={!isEdit}
              error={errors.password_confirmation?.message}
              autoComplete="new-password"
              {...register("password_confirmation", passwordConfirmationRules)}
            />
          </div>
        </div>
      </section>

      <section className={cn(glassPanelSurfaceClass, "rounded-3xl p-5 sm:p-6")}>
        <UserProjectMembershipsEditor
          userId={isEdit ? userId : undefined}
          assignments={assignments}
          staged={stagedMemberships}
          onStagedChange={setStagedMemberships}
          onAssignmentsChange={setAssignments}
        />
      </section>
    </div>
  );
}
