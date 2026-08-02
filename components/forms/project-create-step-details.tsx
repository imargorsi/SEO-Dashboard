"use client";

import { useEffect } from "react";
import { Controller } from "react-hook-form";

import { Input } from "@/components/input";
import type { TUseProjectCreateFormResult } from "@/components/forms/hooks/use-project-create-form.hook";
import { splitCommaSeparated } from "@/lib/frontend/projects/project-form-payload.utils";

type ProjectCreateStepDetailsProps = {
  hook: TUseProjectCreateFormResult;
};

export function ProjectCreateStepDetails({ hook }: ProjectCreateStepDetailsProps) {
  const {
    t,
    form: { register, control, watch, setValue },
  } = hook;

  const servicesOffered = watch("servicesOffered");
  const primaryServiceToPromote = watch("primaryServiceToPromote");
  const offeredServices = splitCommaSeparated(servicesOffered ?? "");
  const serviceOptions = offeredServices.map((service) => ({
    label: service,
    value: service,
  }));
  const hasServiceOptions = serviceOptions.length > 0;

  useEffect(() => {
    if (!primaryServiceToPromote) return;
    if (splitCommaSeparated(servicesOffered ?? "").includes(primaryServiceToPromote)) return;
    setValue("primaryServiceToPromote", "", { shouldDirty: true, shouldValidate: true });
  }, [servicesOffered, primaryServiceToPromote, setValue]);

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <p className="type-body text-text-muted">{t("sectionServiceLead")}</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-3">
            <Controller
              control={control}
              name="servicesOffered"
              render={({ field }) => (
                <Input
                  id="servicesOffered"
                  chips
                  label={t("servicesOffered")}
                  placeholder={t("servicesOfferedPh")}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
              )}
            />
            <p className="type-caption text-text-muted">{t("servicesOfferedHelp")}</p>
          </div>
          <Controller
            control={control}
            name="primaryServiceToPromote"
            render={({ field }) => (
              <Input
                id="primaryServiceToPromote"
                type="select"
                label={t("primaryServiceToPromote")}
                placeholder={hasServiceOptions ? t("primaryServiceToPromotePh") : t("primaryServiceEmpty")}
                options={serviceOptions}
                disabled={!hasServiceOptions}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
              />
            )}
          />
          <Input
            id="idealCustomerProfile"
            label={t("idealCustomerProfile")}
            placeholder={t("idealCustomerProfilePh")}
            className="sm:col-span-2"
            {...register("idealCustomerProfile")}
          />
        </div>
      </div>

      <div className="space-y-4">
        <p className="type-body text-text-muted">{t("sectionOperationsLead")}</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-3 sm:col-span-2">
            <Controller
              control={control}
              name="targetLocations"
              render={({ field }) => (
                <Input
                  id="targetLocations"
                  chips
                  label={t("targetLocations")}
                  placeholder={t("targetLocationsPh")}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
              )}
            />
            <p className="type-caption text-text-muted">{t("targetLocationsHelp")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
