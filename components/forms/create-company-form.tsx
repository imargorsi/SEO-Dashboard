"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { IoAlertCircle, IoCheckmarkCircle } from "react-icons/io5";

import { FormCheckboxField } from "@/components/form/form-checkbox-field";
import { FormTextField } from "@/components/form/form-text-field";
import type { CreateCompanyFormValues } from "@/components/forms/create-company-form.types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useCreateCompanyMutation, useUpdateCompanyMutation } from "@/features/companies/companies.api";
import { ApiError } from "@/lib/frontend/api/errors";

const emptyValues: CreateCompanyFormValues = {
  company_name: "",
  poc_name: "",
  poc_email: "",
  status_active: true,
};

function toPayload(values: CreateCompanyFormValues) {
  return {
    company_name: values.company_name.trim(),
    poc_name: values.poc_name.trim(),
    poc_email: values.poc_email.trim(),
    is_active: values.status_active,
  };
}

type CreateCompanyFormProps = {
  companyId?: string;
  initialValues?: CreateCompanyFormValues;
};

export function CreateCompanyForm({ companyId, initialValues }: CreateCompanyFormProps) {
  const isEdit = Boolean(companyId);
  const router = useRouter();
  const { t } = useTranslation("translation", { keyPrefix: "modules.companies" });
  const createMutation = useCreateCompanyMutation();
  const updateMutation = useUpdateCompanyMutation();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const [formAlert, setFormAlert] = useState<
    | { variant: "default"; title: string; description?: string }
    | { variant: "destructive"; title: string; description?: string }
    | null
  >(null);

  const form = useForm<CreateCompanyFormValues>({
    defaultValues: initialValues ?? emptyValues,
    mode: "onSubmit",
  });

  const { control, handleSubmit, reset } = form;

  useEffect(() => {
    if (initialValues) reset(initialValues);
  }, [initialValues, reset]);

  async function onSubmit(values: CreateCompanyFormValues) {
    setFormAlert(null);
    try {
      const payload = toPayload(values);
      if (isEdit && companyId) {
        await updateMutation.mutateAsync({ id: companyId, payload });
        sessionStorage.setItem(
          "companies-list-feedback",
          JSON.stringify({
            variant: "default",
            title: t("createForm.editSuccessTitle"),
            description: t("createForm.editSuccessFallback"),
          })
        );
        router.replace("/companies");
        return;
      }

      await createMutation.mutateAsync(payload);
      setFormAlert({
        variant: "default",
        title: t("createForm.successTitle"),
        description: t("createForm.successFallback"),
      });
      reset(emptyValues);
    } catch (e) {
      setFormAlert({
        variant: "destructive",
        title: isEdit ? t("createForm.editErrorTitle") : t("createForm.errorTitle"),
        description: ApiError.messageFrom(
          e,
          isEdit ? t("createForm.editErrorFallback") : t("createForm.errorFallback")
        ),
      });
    }
  }

  return (
    <div className="mx-auto w-[100%] max-w-full rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] p-6 shadow-[var(--shadow)] sm:p-8">
      <div className="mb-8 space-y-1">
        <h2 className="text-lg font-semibold text-[var(--text-h)]">
          {isEdit ? t("createForm.editTitle") : t("createForm.title")}
        </h2>
        <p className="text-sm text-[var(--text-muted)]">
          {isEdit ? t("createForm.editLead") : t("createForm.lead")}
        </p>
      </div>

      {formAlert ? (
        <Alert variant={formAlert.variant} className="mb-6">
          {formAlert.variant === "destructive" ? (
            <IoAlertCircle className="size-4 shrink-0" aria-hidden />
          ) : (
            <IoCheckmarkCircle className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden />
          )}
          <AlertTitle>{formAlert.title}</AlertTitle>
          {formAlert.description ? <AlertDescription>{formAlert.description}</AlertDescription> : null}
        </Alert>
      ) : null}

      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <FormTextField
              control={control}
              name="company_name"
              label={t("createForm.companyName")}
              placeholder={t("createForm.companyNamePh")}
              rules={{
                required: t("createForm.valRequired"),
                minLength: { value: 2, message: t("createForm.valCompanyMin") },
              }}
            />
          </div>
          <FormTextField
            control={control}
            name="poc_name"
            label={t("createForm.pocName")}
            placeholder={t("createForm.pocNamePh")}
            rules={{ required: t("createForm.valRequired") }}
          />
          <FormTextField
            control={control}
            name="poc_email"
            label={t("createForm.pocEmail")}
            placeholder={t("createForm.pocEmailPh")}
            type="email"
            autoComplete="email"
            rules={{
              required: t("createForm.valRequired"),
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: t("createForm.valEmail"),
              },
            }}
          />
        </div>

        <FormCheckboxField
          control={control}
          name="status_active"
          label={t("createForm.statusLabel")}
          description={t("createForm.statusDescription")}
        />

        <div className="flex flex-col gap-4 border-t border-[var(--border)] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="submit"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
            className="h-11 w-full max-w-full sm:w-auto sm:min-w-[11rem]"
          >
            <span className="inline-flex items-center justify-center gap-2 px-1">
              {isSubmitting ? <Spinner className="size-4 shrink-0" /> : null}
              {isSubmitting
                ? isEdit
                  ? t("createForm.editSubmitting")
                  : t("createForm.submitting")
                : isEdit
                  ? t("createForm.editSubmit")
                  : t("createForm.submit")}
            </span>
          </Button>
          <Link
            href="/companies"
            className="text-center text-sm font-medium text-[var(--brand)] hover:underline sm:text-end"
          >
            {t("createForm.backToList")}
          </Link>
        </div>
      </form>
    </div>
  );
}
