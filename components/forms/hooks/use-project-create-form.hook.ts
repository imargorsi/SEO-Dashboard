"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { useCreateProjectMutation, type TCreateProjectPayload } from "@/features/projects/projects.api";
import type { AuthUser } from "@/lib/frontend/auth/types";
import { ApiError } from "@/lib/frontend/api/errors";
import { notify } from "@/lib/frontend/feedback/notify";
import type { TProjectCreateFormValues } from "@/components/forms/project-create-form.types";

type UseProjectCreateFormResult = ReturnType<typeof useProjectCreateForm>;

function splitCommaSeparated(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function optionalText(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function toCreatePayload(values: TProjectCreateFormValues, isAdmin: boolean): TCreateProjectPayload {
  const opensAt = optionalText(values.opensAt);
  const closesAt = optionalText(values.closesAt);

  return {
    ...(isAdmin ? { ownerUserId: optionalText(values.ownerUserId) ?? undefined } : {}),
    businessName: values.businessName.trim(),
    websiteUrl: values.websiteUrl.trim(),
    businessAddress: optionalText(values.businessAddress),
    pocContactNumber: optionalText(values.pocContactNumber),
    servicesOffered: splitCommaSeparated(values.servicesOffered),
    primaryServiceToPromote: optionalText(values.primaryServiceToPromote),
    idealCustomerProfile: optionalText(values.idealCustomerProfile),
    targetLocations: splitCommaSeparated(values.targetLocations),
    businessHours: opensAt || closesAt ? { opensAt, closesAt } : null,
    seoGoals: splitCommaSeparated(values.seoGoals),
    marketingAccess: {
      websiteLogin: optionalText(values.websiteLogin),
      websiteHosting: optionalText(values.websiteHosting),
      googleAnalytics: optionalText(values.googleAnalytics),
      googleSearchConsole: optionalText(values.googleSearchConsole),
      googleBusinessProfile: optionalText(values.googleBusinessProfile),
    },
    competitorUrls: splitCommaSeparated(values.competitorUrls),
  };
}

function fieldStepIndex(isAdmin: boolean): Record<keyof TProjectCreateFormValues, number> {
  return {
    ownerUserId: 0,
    businessName: 0,
    websiteUrl: 0,
    businessAddress: 0,
    pocContactNumber: 0,
    servicesOffered: 1,
    primaryServiceToPromote: 1,
    idealCustomerProfile: 1,
    targetLocations: 2,
    opensAt: 2,
    closesAt: 2,
    seoGoals: 3,
    websiteLogin: 3,
    websiteHosting: 3,
    googleAnalytics: 3,
    googleSearchConsole: 3,
    googleBusinessProfile: 3,
    competitorUrls: 4,
  };
}

function stepFields(isAdmin: boolean): Array<Array<keyof TProjectCreateFormValues>> {
  return [
    [
      ...(isAdmin ? (["ownerUserId"] as const) : []),
      "businessName",
      "websiteUrl",
      "businessAddress",
      "pocContactNumber",
    ],
    ["servicesOffered", "primaryServiceToPromote", "idealCustomerProfile"],
    ["targetLocations", "opensAt", "closesAt"],
    ["seoGoals", "websiteLogin", "websiteHosting", "googleAnalytics", "googleSearchConsole", "googleBusinessProfile"],
    ["competitorUrls"],
  ];
}

export function useProjectCreateForm(authUser: AuthUser) {
  const router = useRouter();
  const { t } = useTranslation("translation", { keyPrefix: "modules.projects.createForm" });
  const createMutation = useCreateProjectMutation();
  const [currentStep, setCurrentStep] = useState(0);
  const isAdmin = authUser.roles.includes("super_admin");
  const steps = useMemo(() => stepFields(isAdmin), [isAdmin]);
  const indexMap = useMemo(() => fieldStepIndex(isAdmin), [isAdmin]);

  const form = useForm<TProjectCreateFormValues>({
    defaultValues: {
      ownerUserId: "6a451c72711bf69f27e57cd5",
      businessName: "",
      websiteUrl: "",
      businessAddress: "",
      pocContactNumber: "",
      servicesOffered: "",
      primaryServiceToPromote: "",
      idealCustomerProfile: "",
      targetLocations: "",
      opensAt: "",
      closesAt: "",
      seoGoals: "",
      websiteLogin: "",
      websiteHosting: "",
      googleAnalytics: "",
      googleSearchConsole: "",
      googleBusinessProfile: "",
      competitorUrls: "",
    },
    mode: "onSubmit",
  });

  const {
    handleSubmit,
    setError,
    trigger,
    setFocus,
    formState: { errors },
  } = form;

  const isSubmitting = createMutation.isPending;
  const isLastStep = currentStep === steps.length - 1;

  async function goToNextStep() {
    const fields = steps[currentStep];
    const isValid = await trigger(fields);
    if (!isValid) {
      const firstInvalidField = fields.find((field) => Boolean(errors[field]));
      if (firstInvalidField) setFocus(firstInvalidField);
      notify.error(t("stepValidationError"));
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  }

  function goToPreviousStep() {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }

  function jumpToServerErrorStep(error: ApiError) {
    const keys = Object.keys(error.errors);
    const matched = keys.find((key) => {
      const flat = key.includes(".") ? (key.split(".").at(-1) ?? key) : key;
      return flat in indexMap;
    });
    if (!matched) return;
    const flat = matched.includes(".") ? (matched.split(".").at(-1) ?? matched) : matched;
    const step = indexMap[flat as keyof TProjectCreateFormValues];
    if (step != null) setCurrentStep(step);
  }

  async function onSubmit(values: TProjectCreateFormValues) {
    if (!isLastStep) {
      await goToNextStep();
      return;
    }

    try {
      await createMutation.mutateAsync(toCreatePayload(values, isAdmin));
      notify.success(t("successFallback"));
      router.push("/projects");
    } catch (error) {
      if (error instanceof ApiError) {
        const fieldMap: Partial<Record<keyof TProjectCreateFormValues, string | undefined>> = {
          ownerUserId: error.errors.ownerUserId?.[0],
          businessName: error.errors.businessName?.[0],
          websiteUrl: error.errors.websiteUrl?.[0],
          opensAt: error.errors["businessHours.opensAt"]?.[0],
          closesAt: error.errors["businessHours.closesAt"]?.[0],
        };

        (Object.keys(fieldMap) as Array<keyof TProjectCreateFormValues>).forEach((key) => {
          const message = fieldMap[key];
          if (message) setError(key, { type: "server", message });
        });

        jumpToServerErrorStep(error);
        notify.error(ApiError.messageFrom(error, t("errorFallback")));
        return;
      }

      notify.error(t("errorFallback"));
    }
  }

  return {
    t,
    form,
    currentStep,
    setCurrentStep,
    steps,
    isAdmin,
    isSubmitting,
    isLastStep,
    onSubmit: handleSubmit(onSubmit),
    goToNextStep,
    goToPreviousStep,
  };
}

export type TUseProjectCreateFormResult = UseProjectCreateFormResult;
