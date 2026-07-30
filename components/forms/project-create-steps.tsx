"use client";

import type { TUseProjectCreateFormResult } from "@/components/forms/hooks/use-project-create-form.hook";
import { ProjectCreateStepBusiness } from "@/components/forms/project-create-step-business";
import { ProjectCreateStepDetails } from "@/components/forms/project-create-step-details";
import { ProjectCreateStepSeo } from "@/components/forms/project-create-step-seo";

type StepProps = {
  hook: TUseProjectCreateFormResult;
};

export function ProjectCreateStepContent({ hook }: StepProps) {
  const { currentStep } = hook;

  if (currentStep === 0) return <ProjectCreateStepBusiness hook={hook} />;
  if (currentStep === 1) return <ProjectCreateStepDetails hook={hook} />;
  if (currentStep === 2) return <ProjectCreateStepSeo hook={hook} />;

  return null;
}
