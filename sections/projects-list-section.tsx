"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { IoAlertCircle, IoInformationCircle } from "react-icons/io5";

import { Heading } from "@/components/heading";
import { Paragraph } from "@/components/paragraph";
import { ProjectCard } from "@/components/projects/project-card";
import { Button, buttonVariants } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/loading-state";
import { useProjectAccess } from "@/context/project-access-context";
import { useAuthUserQuery, useResendEmailVerificationMutation } from "@/features/auth/auth.api";
import { type TProjectListItem, useProjectsQuery } from "@/features/projects/projects.api";
import { ApiError } from "@/lib/frontend/api/errors";
import { notify } from "@/lib/frontend/feedback/notify";
import { hasPermission, mergePermissions } from "@/lib/rbac/access";
import { cn } from "@/lib/utils";

export function ProjectsListSection() {
  const { t } = useTranslation("translation", { keyPrefix: "modules.projects" });
  const { t: tTable } = useTranslation("translation", { keyPrefix: "table" });
  const { t: tVerification } = useTranslation("translation", { keyPrefix: "auth.verification" });
  const router = useRouter();
  const { data: user } = useAuthUserQuery();
  const { projectPermissions } = useProjectAccess();
  const { data: projects, isPending } = useProjectsQuery();
  const resendMutation = useResendEmailVerificationMutation();
  const projectItems = projects ?? [];
  const hasProjects = projectItems.length > 0;
  const isVerified = Boolean(user?.email_verified_at);

  const permissions = mergePermissions(user?.permissions ?? [], projectPermissions);
  const canCreateProject = isVerified && (hasPermission(permissions, "projects.create") || !hasProjects);
  const canViewDetails = hasPermission(permissions, "projects.view");

  async function onResendVerification() {
    try {
      const result = await resendMutation.mutateAsync();
      notify.success(result.message?.trim() || tVerification("resendSuccess"));
      router.push("/email-verification");
    } catch (error) {
      notify.error(ApiError.messageFrom(error, tVerification("resendErrorFallback")));
    }
  }

  return (
    <div className="w-full min-w-0">
      <div className="space-y-5 px-4 py-6 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <Heading id="projects-list-title" pageTitle>
              {t("title")}
            </Heading>
            <Paragraph className="text-text-muted">{t("subtitle")}</Paragraph>
            {!isPending && !isVerified ? (
              <div
                className="mt-3 inline-flex flex-wrap items-center gap-2 rounded-xl border border-warning/40 bg-warning/10 px-3 py-2"
                role="status"
                aria-live="polite"
              >
                <IoAlertCircle className="size-4 shrink-0 text-warning" aria-hidden />
                <p className="type-caption text-text-primary">{t("verifyEmailTooltip")}</p>
                <Button
                  type="button"
                  size="small"
                  variant="outlined"
                  disabled={resendMutation.isPending}
                  aria-busy={resendMutation.isPending}
                  onClick={() => void onResendVerification()}
                >
                  {t("verifyEmailCta")}
                </Button>
              </div>
            ) : null}
            {!isPending && isVerified && !hasProjects ? (
              <div
                className="mt-3 inline-flex items-center gap-2 rounded-xl border border-brand/40 bg-brand/10 px-3 py-2"
                role="status"
                aria-live="polite"
              >
                <IoInformationCircle className="size-4 shrink-0 text-brand" aria-hidden />
                <p className="type-caption text-text-primary">{t("emptyBody")}</p>
              </div>
            ) : null}
          </div>

          {canCreateProject ? (
            <Link
              href="/projects/new"
              className={cn(buttonVariants({ size: "md", variant: "gradient" }))}
            >
              {t("table.createProject")}
            </Link>
          ) : null}
        </div>

        {isPending ? (
          <LoadingState label={tTable("loading")} />
        ) : !hasProjects ? (
          <div className="h-2" aria-hidden />
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3">
            {projectItems.map((project: TProjectListItem) => (
              <ProjectCard key={project.id} project={project} canViewDetails={canViewDetails} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
