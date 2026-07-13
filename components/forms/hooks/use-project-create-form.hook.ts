"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import type { TUseProjectFormOptions } from "@/components/forms/project-form.types";
import type { TProjectCreateFormValues } from "@/components/forms/project-create-form.types";
import { useProjectOwnerOptions } from "@/components/forms/hooks/use-project-owner-options.hook";
import {
  useCreateProjectMutation,
  useUpdateProjectMutation,
} from "@/features/projects/projects.api";
import type { AuthUser } from "@/lib/frontend/auth/types";
import { ApiError } from "@/lib/frontend/api/errors";
import { notify } from "@/lib/frontend/feedback/notify";
import { EMPTY_PROJECT_FORM_VALUES } from "@/lib/frontend/projects/map-project-to-form-values.utils";
import { PROJECT_ROUTES } from "@/lib/frontend/projects/project-routes.utils";
import {
  toCreateProjectPayload,
  toUpdateProjectPayload,
} from "@/lib/frontend/projects/project-form-payload.utils";
import { isSuperAdmin } from "@/lib/rbac/access";

type UseProjectCreateFormResult = ReturnType<typeof useProjectCreateForm>;

function fieldStepIndex(): Record<keyof TProjectCreateFormValues, number> {
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
    competitorUrls: 4,
  };
}

function stepFields(isAdmin: boolean, isEdit: boolean): Array<Array<keyof TProjectCreateFormValues>> {
  return [
    [
      ...(isAdmin && !isEdit ? (["ownerUserId"] as const) : []),
      "businessName",
      "websiteUrl",
      "businessAddress",
      "pocContactNumber",
    ],
    ["servicesOffered", "primaryServiceToPromote", "idealCustomerProfile"],
    ["targetLocations", "opensAt", "closesAt"],
    ["seoGoals"],
    ["competitorUrls"],
  ];
}

export function useProjectCreateForm(authUser: AuthUser, options: TUseProjectFormOptions = {}) {
  const {
    isEdit = false,
    projectId,
    initialValues,
    initialLogoUrl = null,
    readOnlyContactEmail = null,
  } = options;

  const router = useRouter();
  const { t } = useTranslation("translation", { keyPrefix: "modules.projects.createForm" });
  const createMutation = useCreateProjectMutation();
  const updateMutation = useUpdateProjectMutation();
  const [currentStep, setCurrentStep] = useState(0);
  const logoFileRef = useRef<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(initialLogoUrl);
  const isAdmin = isSuperAdmin(authUser.roles);
  const ownerOptionsQuery = useProjectOwnerOptions(isAdmin && !isEdit);
  const steps = useMemo(() => stepFields(isAdmin, isEdit), [isAdmin, isEdit]);
  const indexMap = useMemo(() => fieldStepIndex(), []);

  const form = useForm<TProjectCreateFormValues>({
    defaultValues: initialValues ?? EMPTY_PROJECT_FORM_VALUES,
    mode: "onSubmit",
  });

  const {
    handleSubmit,
    setError,
    clearErrors,
    trigger,
    setFocus,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = form;

  useEffect(() => {
    if (!initialValues) return;
    reset(initialValues);
  }, [initialValues, reset]);

  useEffect(() => {
    setLogoPreviewUrl(initialLogoUrl);
  }, [initialLogoUrl]);

  const isSubmitting = isEdit ? updateMutation.isPending : createMutation.isPending;
  const isLastStep = currentStep === steps.length - 1;
  const selectedSeoGoals = watch("seoGoals");
  const contactEmail = readOnlyContactEmail ?? authUser.email;

  function toggleSeoGoal(goal: TProjectCreateFormValues["seoGoals"][number]) {
    const current = watch("seoGoals");
    const next = current.includes(goal) ? current.filter((item) => item !== goal) : [...current, goal];
    setValue("seoGoals", next, { shouldDirty: true, shouldValidate: true });
    if (next.length > 0) clearErrors("seoGoals");
  }

  async function goToNextStep() {
    const fields = steps[currentStep];
    const isValid = await trigger(fields);

    if (!isValid) {
      const firstInvalidField = fields.find((field) => Boolean(errors[field]));
      if (firstInvalidField) setFocus(firstInvalidField);
      notify.error(t("stepValidationError"));
      return;
    }

    if (currentStep === 3 && watch("seoGoals").length === 0) {
      setError("seoGoals", { type: "manual", message: t("valSeoGoals") });
      notify.error(t("valSeoGoals"));
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
      if (flat === "seoGoals") return true;
      return flat in indexMap;
    });
    if (!matched) return;
    const flat = matched.includes(".") ? (matched.split(".").at(-1) ?? matched) : matched;
    const step = indexMap[flat as keyof TProjectCreateFormValues];
    if (step != null) setCurrentStep(step);
  }

  function onLogoPicked(file: File) {
    if (logoPreviewUrl?.startsWith("blob:")) URL.revokeObjectURL(logoPreviewUrl);
    logoFileRef.current = file;
    setLogoPreviewUrl(URL.createObjectURL(file));
  }

  async function onSubmit(values: TProjectCreateFormValues) {
    if (!isLastStep) {
      await goToNextStep();
      return;
    }

    if (values.seoGoals.length === 0) {
      setError("seoGoals", { type: "manual", message: t("valSeoGoals") });
      setCurrentStep(3);
      notify.error(t("valSeoGoals"));
      return;
    }

    try {
      if (isEdit) {
        if (!projectId) {
          notify.error(t("editErrorFallback"));
          return;
        }

        await updateMutation.mutateAsync({
          projectId,
          payload: toUpdateProjectPayload(values),
          companyLogoFile: logoFileRef.current,
        });
        notify.success(t("editSuccessFallback"));
        router.push(PROJECT_ROUTES.view(projectId));
        return;
      }

      await createMutation.mutateAsync({
        payload: toCreateProjectPayload(values, isAdmin),
        companyLogoFile: logoFileRef.current,
      });
      notify.success(t("successFallback"));
      router.push(PROJECT_ROUTES.list);
    } catch (error) {
      if (error instanceof ApiError) {
        const fieldMap: Partial<Record<keyof TProjectCreateFormValues, string | undefined>> = {
          ownerUserId: error.errors.ownerUserId?.[0],
          businessName: error.errors.businessName?.[0],
          websiteUrl: error.errors.websiteUrl?.[0],
          opensAt: error.errors["businessHours.opensAt"]?.[0],
          closesAt: error.errors["businessHours.closesAt"]?.[0],
          seoGoals: error.errors["seoGoals.0"]?.[0] ?? error.errors.seoGoals?.[0],
        };

        (Object.keys(fieldMap) as Array<keyof TProjectCreateFormValues>).forEach((key) => {
          const message = fieldMap[key];
          if (message) setError(key, { type: "server", message });
        });

        jumpToServerErrorStep(error);
        notify.error(ApiError.messageFrom(error, isEdit ? t("editErrorFallback") : t("errorFallback")));
        return;
      }

      notify.error(isEdit ? t("editErrorFallback") : t("errorFallback"));
    }
  }

  return {
    t,
    form,
    currentStep,
    setCurrentStep,
    steps,
    isAdmin,
    isEdit,
    isSubmitting,
    isLastStep,
    onSubmit: handleSubmit(onSubmit),
    goToNextStep,
    goToPreviousStep,
    logoPreviewUrl,
    onLogoPicked,
    businessName: form.watch("businessName"),
    selectedSeoGoals,
    toggleSeoGoal,
    contactEmail,
    projectId,
    ownerOptions: ownerOptionsQuery.options,
    isOwnerOptionsPending: ownerOptionsQuery.isPending,
    isOwnerOptionsError: ownerOptionsQuery.isError,
    isOwnerOptionsEmpty: ownerOptionsQuery.isEmpty,
  };
}

export type TUseProjectCreateFormResult = UseProjectCreateFormResult;
