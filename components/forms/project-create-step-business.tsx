"use client";

import { Controller } from "react-hook-form";

import { Input } from "@/components/input";
import { ImageUploadAvatar } from "@/components/ui/image-upload-avatar";
import { PhoneNumberInput } from "@/components/ui/phone-number-input";
import type { TUseProjectCreateFormResult } from "@/components/forms/hooks/use-project-create-form.hook";
import { WEBSITE_URL_PATTERN } from "@/lib/projects/website-url.utils";
import { DISPLAY_NAME_MAX_LENGTH } from "@/lib/validation/display-name";

type ProjectCreateStepBusinessProps = {
  hook: TUseProjectCreateFormResult;
};

export function ProjectCreateStepBusiness({ hook }: ProjectCreateStepBusinessProps) {
  const {
    t,
    form: {
      register,
      control,
      formState: { errors },
    },
    isAdmin,
    isEdit,
    logoPreviewUrl,
    onLogoPicked,
    businessName,
    contactEmail,
    ownerOptions,
    isOwnerOptionsPending,
    isOwnerOptionsError,
    isOwnerOptionsEmpty,
  } = hook;

  return (
    <div className="space-y-6">
      <p className="type-body text-text-muted">{t("sectionBusinessLead")}</p>
      <ImageUploadAvatar
        name={businessName || t("businessName")}
        imageUrl={logoPreviewUrl}
        onFilePicked={onLogoPicked}
        hint={t("companyLogoHint")}
        pickLabel={t("companyLogoUploadLabel")}
        accept="image/jpeg,image/png,image/webp,image/gif"
        maxSizeMb={5}
        variant="logo"
        className="sm:col-span-2 mt-4"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          id="businessName"
          label={t("businessName")}
          placeholder={t("businessNamePh")}
          required
          disabled={isEdit}
          readOnly={isEdit}
          maxLength={DISPLAY_NAME_MAX_LENGTH}
          error={errors.businessName?.message}
          {...register("businessName", {
            required: t("valRequired"),
            minLength: { value: 2, message: t("valMin") },
            maxLength: { value: DISPLAY_NAME_MAX_LENGTH, message: t("valMax") },
          })}
        />
        <Input
          id="websiteUrl"
          label={t("websiteUrl")}
          placeholder={t("websiteUrlPh")}
          required
          error={errors.websiteUrl?.message}
          {...register("websiteUrl", {
            required: t("valRequired"),
            validate: (value) => WEBSITE_URL_PATTERN.test(value.trim()) || t("valUrl"),
          })}
        />
        <Input
          id="businessAddress"
          label={t("businessAddress")}
          placeholder={t("businessAddressPh")}
          className="sm:col-span-2"
          {...register("businessAddress")}
        />
        <Controller
          control={control}
          name="pocContactNumber"
          render={({ field }) => (
            <PhoneNumberInput
              id="pocContactNumber"
              label={t("pocContactNumber")}
              placeholder={t("pocContactNumberPh")}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
            />
          )}
        />
        {isAdmin ? (
          <Controller
            control={control}
            name="ownerUserId"
            rules={{ required: t("valRequired") }}
            render={({ field }) => (
              <Input
                id="ownerUserId"
                type="select"
                label={t("ownerUserId")}
                placeholder={t("ownerUserPlaceholder")}
                options={ownerOptions}
                required
                disabled={isOwnerOptionsPending || isOwnerOptionsEmpty}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={
                  errors.ownerUserId?.message ??
                  (isOwnerOptionsError
                    ? t("ownerUserLoadError")
                    : isOwnerOptionsEmpty
                      ? t("ownerUserEmpty")
                      : undefined)
                }
              />
            )}
          />
        ) : (
          <Input
            id="pocEmail"
            type="email"
            label={t("pocEmail")}
            placeholder={t("pocEmailPh")}
            value={contactEmail}
            readOnly
          />
        )}
      </div>
    </div>
  );
}
