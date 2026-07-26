"use client";

import { useTranslation } from "react-i18next";
import { IoFolderOpenOutline, IoMailOutline } from "react-icons/io5";

import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { CreateActionButton } from "@/components/ui/create-action-button";
import { PROJECT_ROUTES } from "@/lib/frontend/projects/project-routes.utils";

export type NoProjectComponentVariant = "no-projects" | "email-not-verified";

type NoProjectComponentProps = {
  variant?: NoProjectComponentVariant;
  canCreateProject?: boolean;
  onVerifyEmail?: () => void;
  isVerifyEmailPending?: boolean;
};

export function NoProjectComponent({
  variant = "no-projects",
  canCreateProject = false,
  onVerifyEmail,
  isVerifyEmailPending = false,
}: NoProjectComponentProps) {
  const { t } = useTranslation("translation", { keyPrefix: "modules.projects" });
  const isEmailNotVerified = variant === "email-not-verified";

  return (
    <EmptyState
      icon={isEmailNotVerified ? IoMailOutline : IoFolderOpenOutline}
      title={isEmailNotVerified ? t("emailNotVerifiedTitle") : t("emptyTitle")}
      description={isEmailNotVerified ? t("emailNotVerifiedBody") : t("emptyBody")}
      className="sm:min-h-[min(28rem,calc(100vh-14rem))]"
    >
      {isEmailNotVerified ? (
        <Button
          type="button"
          variant="gradient"
          size="md"
          disabled={isVerifyEmailPending}
          aria-busy={isVerifyEmailPending}
          onClick={onVerifyEmail}
        >
          {t("verifyEmailCta")}
        </Button>
      ) : canCreateProject ? (
        <CreateActionButton href={PROJECT_ROUTES.create}>{t("table.createProject")}</CreateActionButton>
      ) : null}
    </EmptyState>
  );
}
