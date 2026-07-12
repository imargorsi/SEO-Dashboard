"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

import { Heading } from "@/components/heading";
import { Paragraph } from "@/components/paragraph";
import { NoProjectComponent } from "@/components/projects/no-project-component";
import { ProjectCard } from "@/components/projects/project-card";
import { buttonVariants } from "@/components/ui/button";
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
          </div>

          {canCreateProject && hasProjects ? (
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
          <NoProjectComponent
            variant={isVerified ? "no-projects" : "email-not-verified"}
            canCreateProject={canCreateProject}
            onVerifyEmail={() => void onResendVerification()}
            isVerifyEmailPending={resendMutation.isPending}
          />
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
