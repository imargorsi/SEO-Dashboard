"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

import { Heading } from "@/components/heading";
import { Paragraph } from "@/components/paragraph";
import { NoProjectComponent } from "@/components/projects/no-project-component";
import { ProjectCard } from "@/components/projects/project-card";
import { ProjectStatusFilter } from "@/components/projects/project-status-filter";
import { buttonVariants } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/loading-state";
import { useProjectAccess } from "@/context/project-access-context";
import { useAuthUserQuery, useResendEmailVerificationMutation } from "@/features/auth/auth.api";
import { type TProjectListItem, useProjectsQuery } from "@/features/projects/projects.api";
import { useQueryParams } from "@/hooks/use-query-params.hook";
import { ApiError } from "@/lib/frontend/api/errors";
import { notify } from "@/lib/frontend/feedback/notify";
import {
  countProjectsByStatus,
  parseProjectStatusFilter,
} from "@/lib/projects/project-status-filter.utils";
import type { ProjectStatus } from "@/lib/projects/constants";
import {
  canEditProjectCard,
  canViewProjectCard,
} from "@/lib/projects/project-card-access.utils";
import { hasPermission, isSuperAdmin, mergePermissions } from "@/lib/rbac/access";
import { elevatedCardSurfaceClass, elevatedCardMutedClass, elevatedCardTitleClass } from "@/lib/frontend/layout/dashboard-chrome";
import { cn } from "@/lib/utils";

export function ProjectsListSection() {
  const { t } = useTranslation("translation", { keyPrefix: "modules.projects" });
  const { t: tTable } = useTranslation("translation", { keyPrefix: "table" });
  const { t: tVerification } = useTranslation("translation", { keyPrefix: "auth.verification" });
  const router = useRouter();
  const { data: user } = useAuthUserQuery();
  const { projectPermissions } = useProjectAccess();
  const { queryParams, setQueryParams, deleteQueryParams } = useQueryParams();
  const statusFilter = parseProjectStatusFilter(queryParams.status);
  const { data: allProjects = [], isPending: isAllProjectsPending } = useProjectsQuery({ status: null });
  const { data: filteredProjects = [], isPending: isFilteredProjectsPending } = useProjectsQuery({
    status: statusFilter ?? null,
    enabled: Boolean(statusFilter),
  });
  const resendMutation = useResendEmailVerificationMutation();
  const projectItems = statusFilter ? filteredProjects : allProjects;
  const hasProjects = allProjects.length > 0;
  const hasFilteredResults = projectItems.length > 0;
  const isPending = statusFilter ? isFilteredProjectsPending : isAllProjectsPending;
  const statusCounts = countProjectsByStatus(allProjects);
  const isVerified = Boolean(user?.email_verified_at);

  const permissions = mergePermissions(user?.permissions ?? [], projectPermissions);
  const userIsSuperAdmin = isSuperAdmin(user?.roles);
  const canCreateProject = isVerified && (hasPermission(permissions, "projects.create") || !hasProjects);

  function getProjectCardAccess(project: TProjectListItem) {
    const accessInput = {
      permissions,
      userId: user?.id,
      ownerId: project.owner?.id,
      isSuperAdmin: userIsSuperAdmin,
    };

    return {
      canViewDetails: canViewProjectCard(accessInput),
      canEditProject: canEditProjectCard(accessInput),
    };
  }

  function onStatusFilterChange(nextStatus: ProjectStatus | null) {
    if (!nextStatus) {
      deleteQueryParams(["status"]);
      return;
    }

    setQueryParams({ status: nextStatus });
  }

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

          <div className="flex flex-wrap items-center justify-end gap-3">
            {hasProjects ? (
              <ProjectStatusFilter
                activeStatus={statusFilter ?? null}
                counts={statusCounts}
                onStatusChange={onStatusFilterChange}
              />
            ) : null}

            {canCreateProject && hasProjects ? (
              <Link
                href="/projects/new"
                className={cn(buttonVariants({ size: "md", variant: "gradient" }))}
              >
                {t("table.createProject")}
              </Link>
            ) : null}
          </div>
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
        ) : !hasFilteredResults ? (
          <div className={cn(elevatedCardSurfaceClass, "rounded-3xl px-6 py-10 text-center")}>
            <Heading sectionTitle className={elevatedCardTitleClass}>
              {t("statusFilter.emptyTitle")}
            </Heading>
            <Paragraph className={cn("mt-2", elevatedCardMutedClass)}>{t("statusFilter.emptyBody")}</Paragraph>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3">
            {projectItems.map((project: TProjectListItem) => {
              const { canViewDetails, canEditProject } = getProjectCardAccess(project);

              return (
                <ProjectCard
                  key={project.id}
                  project={project}
                  canViewDetails={canViewDetails}
                  canEditProject={canEditProject}
                  isSuperAdmin={userIsSuperAdmin}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
