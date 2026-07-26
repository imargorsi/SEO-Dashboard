"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { IoAdd, IoFolderOpenOutline, IoMailOutline } from "react-icons/io5";

import { EmptyState } from "@/components/ui/empty-state";
import { Button, buttonVariants } from "@/components/ui/button";
import { PROJECT_ROUTES } from "@/lib/frontend/projects/project-routes.utils";
import { cn } from "@/lib/utils";

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
        <Link
          href={PROJECT_ROUTES.create}
          className={cn(buttonVariants({ size: "md", variant: "gradient" }))}
        >
          <IoAdd className="size-4" aria-hidden />
          {t("table.createProject")}
        </Link>
      ) : null}
    </EmptyState>
  );
}
