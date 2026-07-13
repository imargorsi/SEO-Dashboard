"use client";

import { useTranslation } from "react-i18next";

import { Input } from "@/components/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ImageUploadAvatar } from "@/components/ui/image-upload-avatar";
import type { TUseProjectCreateFormResult } from "@/components/forms/hooks/use-project-create-form.hook";
import { SEO_GOALS } from "@/lib/projects/constants";
import { SEO_GOAL_ICONS } from "@/lib/frontend/projects/seo-goal-icons";
import { cn } from "@/lib/utils";

type StepProps = {
  hook: TUseProjectCreateFormResult;
};

export function ProjectCreateStepContent({ hook }: StepProps) {
  const { t: tSeoGoals } = useTranslation("translation", { keyPrefix: "modules.projects.seoGoals" });
  const {
    t,
    form: {
      register,
      formState: { errors },
    },
    currentStep,
    isAdmin,
    isEdit,
    logoPreviewUrl,
    onLogoPicked,
    businessName,
    selectedSeoGoals,
    toggleSeoGoal,
    contactEmail,
    ownerOptions,
    isOwnerOptionsPending,
    isOwnerOptionsError,
    isOwnerOptionsEmpty,
  } = hook;

  if (currentStep === 0) {
    return (
      <div className="space-y-4">
        <div className="space-y-1">
          <h2 className="type-title text-text-primary">{t("sectionBusinessTitle")}</h2>
          <p className="type-body text-text-muted">{t("sectionBusinessLead")}</p>
        </div>
        <ImageUploadAvatar
          name={businessName || t("businessName")}
          imageUrl={logoPreviewUrl}
          onFilePicked={onLogoPicked}
          label={t("companyLogo")}
          hint={t("companyLogoHint")}
          className="sm:col-span-2"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            id="businessName"
            label={t("businessName")}
            placeholder={t("businessNamePh")}
            required
            disabled={isEdit}
            readOnly={isEdit}
            error={errors.businessName?.message}
            {...register("businessName", {
              required: t("valRequired"),
              minLength: { value: 2, message: t("valMin") },
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
              validate: (value) => {
                try {
                  const url = new URL(value.trim());
                  return ["http:", "https:"].includes(url.protocol) || t("valUrl");
                } catch {
                  return t("valUrl");
                }
              },
            })}
          />
          <Input
            id="businessAddress"
            label={t("businessAddress")}
            placeholder={t("businessAddressPh")}
            className="sm:col-span-2"
            {...register("businessAddress")}
          />
          <Input
            id="pocContactNumber"
            label={t("pocContactNumber")}
            placeholder={t("pocContactNumberPh")}
            {...register("pocContactNumber")}
          />
          {isAdmin && !isEdit ? (
            <>
              <Input
                id="ownerUserId"
                type="select"
                label={t("ownerUserId")}
                options={ownerOptions}
                required
                disabled={isOwnerOptionsPending || isOwnerOptionsEmpty}
                error={
                  errors.ownerUserId?.message ??
                  (isOwnerOptionsError
                    ? t("ownerUserLoadError")
                    : isOwnerOptionsEmpty
                      ? t("ownerUserEmpty")
                      : undefined)
                }
                {...register("ownerUserId", {
                  required: t("valRequired"),
                })}
              />
            </>
          ) : (
            <Input id="pocEmail" label={t("pocEmail")} value={contactEmail} readOnly disabled />
          )}
        </div>
      </div>
    );
  }

  if (currentStep === 1) {
    return (
      <div className="space-y-4">
        <div className="space-y-1">
          <h3 className="type-title text-text-primary">{t("sectionServiceTitle")}</h3>
          <p className="type-body text-text-muted">{t("sectionServiceLead")}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            id="servicesOffered"
            label={t("servicesOffered")}
            placeholder={t("servicesOfferedPh")}
            className="sm:col-span-2"
            {...register("servicesOffered")}
          />
          <Input
            id="primaryServiceToPromote"
            label={t("primaryServiceToPromote")}
            placeholder={t("primaryServiceToPromotePh")}
            {...register("primaryServiceToPromote")}
          />
          <Input
            id="idealCustomerProfile"
            label={t("idealCustomerProfile")}
            placeholder={t("idealCustomerProfilePh")}
            {...register("idealCustomerProfile")}
          />
        </div>
      </div>
    );
  }

  if (currentStep === 2) {
    return (
      <div className="space-y-4">
        <div className="space-y-1">
          <h3 className="type-title text-text-primary">{t("sectionOperationsTitle")}</h3>
          <p className="type-body text-text-muted">{t("sectionOperationsLead")}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            id="targetLocations"
            label={t("targetLocations")}
            placeholder={t("targetLocationsPh")}
            className="sm:col-span-2"
            {...register("targetLocations")}
          />
          <Input
            id="opensAt"
            label={t("opensAt")}
            type="time"
            placeholder="09:00"
            error={errors.opensAt?.message}
            {...register("opensAt", {
              validate: (value) =>
                !value.trim() || /^([01]\d|2[0-3]):[0-5]\d$/.test(value.trim()) || t("valTime"),
            })}
          />
          <Input
            id="closesAt"
            label={t("closesAt")}
            type="time"
            placeholder="17:00"
            error={errors.closesAt?.message}
            {...register("closesAt", {
              validate: (value) =>
                !value.trim() || /^([01]\d|2[0-3]):[0-5]\d$/.test(value.trim()) || t("valTime"),
            })}
          />
        </div>
      </div>
    );
  }

  if (currentStep === 3) {
    return (
      <div className="space-y-4">
        <div className="space-y-1">
          <h3 className="type-title text-text-primary">{t("sectionSeoTitle")}</h3>
          <p className="type-body text-text-muted">{t("sectionSeoLead")}</p>
        </div>

        <div className="space-y-2">
          {SEO_GOALS.map((goal) => {
            const checked = selectedSeoGoals.includes(goal);
            const inputId = `seo-goal-${goal}`;
            const Icon = SEO_GOAL_ICONS[goal];

            return (
              <label
                key={goal}
                htmlFor={inputId}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors",
                  checked
                    ? "border-[color-mix(in_srgb,var(--brand)_55%,var(--border))] bg-bg-selected"
                    : "border-border bg-bg-input hover:bg-bg-hover",
                )}
              >
                <Checkbox
                  id={inputId}
                  checked={checked}
                  onChange={() => toggleSeoGoal(goal)}
                  className="shrink-0"
                />
                <span
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-lg",
                    checked ? "bg-brand/15 text-brand" : "bg-bg-card text-text-muted",
                  )}
                  aria-hidden
                >
                  <Icon className="size-5" />
                </span>
                <span className="type-body-strong text-text-primary">{tSeoGoals(goal)}</span>
              </label>
            );
          })}
        </div>

        {errors.seoGoals?.message ? (
          <p className="type-caption text-status-rejected">{errors.seoGoals.message}</p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h3 className="type-title text-text-primary">{t("sectionCompetitorsTitle")}</h3>
        <p className="type-body text-text-muted">{t("sectionCompetitorsLead")}</p>
      </div>
      <Input
        id="competitorUrls"
        label={t("competitorUrls")}
        placeholder={t("competitorUrlsPh")}
        {...register("competitorUrls")}
      />
    </div>
  );
}
