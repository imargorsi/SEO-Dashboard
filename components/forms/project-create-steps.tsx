"use client";

import { Input } from "@/components/input";
import { ImageUploadAvatar } from "@/components/ui/image-upload-avatar";
import type { AuthUser } from "@/lib/frontend/auth/types";
import type { TUseProjectCreateFormResult } from "@/components/forms/hooks/use-project-create-form.hook";

type StepProps = {
  hook: TUseProjectCreateFormResult;
  authUser: AuthUser;
};

export function ProjectCreateStepContent({ hook, authUser }: StepProps) {
  const {
    t,
    form: {
      register,
      formState: { errors },
    },
    currentStep,
    isAdmin,
    logoPreviewUrl,
    onLogoPicked,
    businessName,
  } = hook;

  const contactEmail = authUser.email;

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
          {isAdmin ? (
            <Input
              id="ownerUserId"
              label={t("ownerUserId")}
              placeholder={t("ownerUserIdPh")}
              required
              error={errors.ownerUserId?.message}
              {...register("ownerUserId", {
                required: t("valRequired"),
              })}
            />
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
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-1">
            <h3 className="type-title text-text-primary">{t("sectionSeoTitle")}</h3>
            <p className="type-body text-text-muted">{t("sectionSeoLead")}</p>
          </div>
          <Input
            id="seoGoals"
            label={t("seoGoalsInput")}
            placeholder={t("seoGoalsInputPh")}
            {...register("seoGoals")}
          />
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <h3 className="type-title text-text-primary">{t("sectionMarketingTitle")}</h3>
            <p className="type-body text-text-muted">{t("sectionMarketingLead")}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              id="websiteLogin"
              label={t("websiteLogin")}
              placeholder={t("websiteLoginPh")}
              {...register("websiteLogin")}
            />
            <Input
              id="websiteHosting"
              label={t("websiteHosting")}
              placeholder={t("websiteHostingPh")}
              {...register("websiteHosting")}
            />
            <Input
              id="googleAnalytics"
              label={t("googleAnalytics")}
              placeholder={t("googleAnalyticsPh")}
              {...register("googleAnalytics")}
            />
            <Input
              id="googleSearchConsole"
              label={t("googleSearchConsole")}
              placeholder={t("googleSearchConsolePh")}
              {...register("googleSearchConsole")}
            />
            <Input
              id="googleBusinessProfile"
              label={t("googleBusinessProfile")}
              placeholder={t("googleBusinessProfilePh")}
              className="sm:col-span-2"
              {...register("googleBusinessProfile")}
            />
          </div>
        </div>
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
