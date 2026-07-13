"use client";

import Link from "next/link";
import type { TProjectFormProps } from "@/components/forms/project-form.types";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ProjectCreateStepper } from "@/components/forms/project-create-stepper";
import { ProjectCreateStepContent } from "@/components/forms/project-create-steps";
import { useProjectCreateForm } from "@/components/forms/hooks/use-project-create-form.hook";
import { PROJECT_ROUTES } from "@/lib/frontend/projects/project-routes.utils";
import { elevatedCardSurfaceClass } from "@/lib/frontend/layout/dashboard-chrome";
import { cn } from "@/lib/utils";

export function ProjectCreateForm({
  authUser,
  isEdit = false,
  projectId,
  initialValues,
  initialLogoUrl = null,
  readOnlyContactEmail = null,
}: TProjectFormProps) {
  const hook = useProjectCreateForm(authUser, {
    isEdit,
    projectId,
    initialValues,
    initialLogoUrl,
    readOnlyContactEmail,
  });
  const {
    t,
    onSubmit,
    currentStep,
    steps,
    isLastStep,
    isSubmitting,
    goToNextStep,
    goToPreviousStep,
    isEdit: isEditMode,
    projectId: editProjectId,
  } = hook;

  const backHref = isEditMode && editProjectId ? PROJECT_ROUTES.view(editProjectId) : PROJECT_ROUTES.list;
  const backLabel = isEditMode ? t("backToProject") : t("backToList");
  const submitLabel = isSubmitting
    ? isEditMode
      ? t("editSubmitting")
      : t("submitting")
    : isEditMode
      ? t("editSubmit")
      : t("submit");

  return (
    <form className="space-y-5" onSubmit={onSubmit} noValidate>
      <section className={cn(elevatedCardSurfaceClass, "rounded-2xl p-6 shadow-(--shadow) sm:p-8")}>
        <div className="space-y-6">
          <ProjectCreateStepper total={steps.length} current={currentStep} />
          <ProjectCreateStepContent hook={hook} />
        </div>
      </section>

      <div className="p-1">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full sm:w-auto"
            onClick={goToPreviousStep}
            disabled={currentStep === 0}
          >
            {t("previousStep")}
          </Button>

          <div className="flex w-full justify-end sm:w-auto">
            {isLastStep ? (
              <Button
                key="submit-step"
                type="submit"
                variant="gradient"
                size="lg"
                disabled={isSubmitting}
                aria-busy={isSubmitting}
                className="w-full sm:min-w-52 sm:w-auto"
              >
                <span className="inline-flex items-center justify-center gap-2 px-1">
                  {isSubmitting ? <Spinner className="size-4 shrink-0" /> : null}
                  {submitLabel}
                </span>
              </Button>
            ) : (
              <Button
                key="next-step"
                type="button"
                variant="gradient"
                size="lg"
                className="w-full sm:min-w-52 sm:w-auto"
                onClick={goToNextStep}
              >
                {t("nextStep")}
              </Button>
            )}
          </div>
        </div>
        {currentStep === 0 ? (
          <div className="mt-3">
            <Link
              href={backHref}
              className="inline-flex type-body-strong text-text-secondary transition-colors hover:text-text-primary hover:underline"
            >
              {backLabel}
            </Link>
          </div>
        ) : null}
      </div>
    </form>
  );
}
