"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { IoFolderOpenOutline, IoMailOutline } from "react-icons/io5";

import { Heading } from "@/components/heading";
import { Paragraph } from "@/components/paragraph";
import { Button, buttonVariants } from "@/components/ui/button";
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
  const Icon = isEmailNotVerified ? IoMailOutline : IoFolderOpenOutline;

  return (
    <div
      className="flex w-full flex-col items-center justify-center px-4 py-12 text-center sm:min-h-[min(28rem,calc(100vh-14rem))] sm:py-16"
      role="status"
      aria-live="polite"
    >
      <div
        className="mb-6 flex size-16 items-center justify-center rounded-2xl border border-border bg-bg-card/60 shadow-sm backdrop-blur-sm"
        aria-hidden
      >
        <Icon className="size-8 shrink-0 text-brand" />
      </div>

      <Heading sectionTitle className="text-text-primary">
        {isEmailNotVerified ? t("emailNotVerifiedTitle") : t("emptyTitle")}
      </Heading>

      <Paragraph className="mt-3 max-w-md text-text-muted">
        {isEmailNotVerified ? t("emailNotVerifiedBody") : t("emptyBody")}
      </Paragraph>

      {(isEmailNotVerified || canCreateProject) ? (
        isEmailNotVerified ? (
          <Button
            type="button"
            variant="gradient"
            size="md"
            className="mt-8"
            disabled={isVerifyEmailPending}
            aria-busy={isVerifyEmailPending}
            onClick={onVerifyEmail}
          >
            {t("verifyEmailCta")}
          </Button>
        ) : (
          <Link
            href="/projects/new"
            className={cn(buttonVariants({ size: "md", variant: "gradient" }), "mt-8")}
          >
            {t("table.createProject")}
          </Link>
        )
      ) : null}
    </div>
  );
}
