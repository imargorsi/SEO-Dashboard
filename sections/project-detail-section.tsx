"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { useTranslation } from "react-i18next";

import { DashboardModuleBreadcrumbSection } from "@/components/layout/dashboard-module-breadcrumb-section";
import { ProjectDetailHeader } from "@/components/projects/detail/project-detail-header";
import { ProjectDetailHero } from "@/components/projects/detail/project-detail-hero";
import { ProjectDetailMainContent } from "@/components/projects/detail/project-detail-main-content";
import { ProjectDetailSidebar } from "@/components/projects/detail/project-detail-sidebar";
import { Heading } from "@/components/heading";
import { Paragraph } from "@/components/paragraph";
import { LoadingState } from "@/components/ui/loading-state";
import { useProjectAccess } from "@/context/project-access-context";
import { useAuthUserQuery } from "@/features/auth/auth.api";
import { useProjectQuery } from "@/features/projects/projects.api";
import { ApiError } from "@/lib/frontend/api/errors";
import {
  elevatedCardMutedClass,
  elevatedCardSurfaceClass,
  elevatedCardTitleClass,
} from "@/lib/frontend/layout/dashboard-chrome";
import {
  canEditProjectCard,
  canViewProjectCard,
} from "@/lib/projects/project-card-access.utils";
import { isSuperAdmin, mergePermissions } from "@/lib/rbac/access";
import { cn } from "@/lib/utils";

export function ProjectDetailSection() {
  const params = useParams<{ id: string }>();
  const projectId = typeof params.id === "string" ? params.id : "";
  const { t } = useTranslation("translation", { keyPrefix: "modules.projects.detail" });
  const { t: tRoot } = useTranslation("translation");
  const { data: user } = useAuthUserQuery();
  const { projectPermissions } = useProjectAccess();
  const { data: project, isPending, isError, error } = useProjectQuery(projectId, {
    enabled: Boolean(user && projectId),
  });

  const permissions = mergePermissions(user?.permissions ?? [], projectPermissions);
  const userIsSuperAdmin = isSuperAdmin(user?.roles);

  const listOwner = useMemo(() => {
    if (!project) return null;
    return {
      id: project.createdByUserId,
    };
  }, [project]);

  const canView = project
    ? canViewProjectCard({
        permissions,
        userId: user?.id,
        ownerId: listOwner?.id,
        isSuperAdmin: userIsSuperAdmin,
      })
    : true;

  const canEdit = project
    ? canEditProjectCard({
        permissions,
        userId: user?.id,
        ownerId: listOwner?.id,
        isSuperAdmin: userIsSuperAdmin,
      })
    : false;

  const breadcrumbItems = useMemo(
    () => [
      { id: "dashboard", label: tRoot("breadcrumb.root"), href: "/dashboard" },
      { id: "projects", label: tRoot("modules.projects.title"), href: "/projects" },
      { id: "project-detail", label: project?.businessName ?? t("loading") },
    ],
    [project?.businessName, t, tRoot],
  );

  if (!projectId) {
    return (
      <div className="px-4 py-6 sm:px-6">
        <StateCard title={t("notFoundTitle")} body={t("notFoundBody")} />
      </div>
    );
  }

  if (isPending || !user) {
    return (
      <div className="px-4 py-6 sm:px-6">
        <LoadingState label={t("loading")} />
      </div>
    );
  }

  if (isError) {
    const isNotFound = error instanceof ApiError && error.status === 404;
    return (
      <div className="px-4 py-6 sm:px-6">
        <StateCard
          title={isNotFound ? t("notFoundTitle") : t("loadErrorTitle")}
          body={isNotFound ? t("notFoundBody") : t("loadErrorBody")}
        />
      </div>
    );
  }

  if (!project || !canView) {
    return (
      <div className="px-4 py-6 sm:px-6">
        <StateCard title={t("notFoundTitle")} body={t("notFoundBody")} />
      </div>
    );
  }

  return (
    <div className="w-full min-w-0">
      <DashboardModuleBreadcrumbSection items={breadcrumbItems} />

      <div className="space-y-5 px-4 py-6 sm:px-6">
        <ProjectDetailHeader
          businessName={project.businessName}
          projectId={project.id}
          status={project.status}
          canEditProject={canEdit}
          isSuperAdmin={userIsSuperAdmin}
        />

        <ProjectDetailHero project={project} />

        <div className="grid gap-5 xl:grid-cols-2 xl:items-start">
          <ProjectDetailMainContent project={project} />
          <ProjectDetailSidebar project={project} />
        </div>
      </div>
    </div>
  );
}

function StateCard({ title, body }: { title: string; body: string }) {
  return (
    <div className={cn(elevatedCardSurfaceClass, "rounded-3xl px-6 py-10 text-center")}>
      <Heading sectionTitle className={elevatedCardTitleClass}>
        {title}
      </Heading>
      <Paragraph className={cn("mt-2", elevatedCardMutedClass)}>{body}</Paragraph>
    </div>
  );
}
