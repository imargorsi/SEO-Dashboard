"use client";

import { Input } from "@/components/input";
import { ImageUploadAvatar } from "@/components/ui/image-upload-avatar";
import type { TUseUserCreateFormResult } from "@/components/forms/hooks/use-user-create-form.hook";

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
    profilePreviewUrl,
    onProfileImagePicked,
    passwordRules,
    passwordConfirmationRules,
  } = hook;

  return (
    <div className="space-y-4">
      <ImageUploadAvatar
        name={name || t("name")}
        imageUrl={profilePreviewUrl}
        onFilePicked={onProfileImagePicked}
        label={t("profileImage")}
        hint={t("profileImageHint")}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          id="user-form-name"
          label={t("name")}
          placeholder={t("namePh")}
          required
          error={errors.name?.message}
          autoComplete="name"
          {...register("name", {
            required: t("valRequired"),
            minLength: { value: 1, message: t("valRequired") },
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
  );
}
