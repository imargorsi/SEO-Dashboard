"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

import { DashboardModuleBreadcrumbSection } from "@/components/layout/dashboard-module-breadcrumb-section";
import { ProjectDetailHeader } from "@/components/projects/detail/project-detail-header";
import { ProjectDetailHero } from "@/components/projects/detail/project-detail-hero";
import { ProjectDetailMainContent } from "@/components/projects/detail/project-detail-main-content";
import { ProjectDetailSidebar } from "@/components/projects/detail/project-detail-sidebar";
import { ProjectInviteUsersQuickAdd } from "@/components/projects/project-invite-users-quick-add";
import {
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { buttonVariants } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { IoFolderOpenOutline, IoTrashOutline, IoWarningOutline } from "react-icons/io5";
import { useAuthUserQuery } from "@/features/auth/auth.api";
import {
  useDeleteProjectMutation,
  useProjectAccessQuery,
  useProjectQuery,
} from "@/features/projects/projects.api";
import { ApiError } from "@/lib/frontend/api/errors";
import { notify } from "@/lib/frontend/feedback/notify";
import { PROJECT_ROUTES } from "@/lib/frontend/projects/project-routes.utils";
import { resolveProjectOwnerId } from "@/lib/projects/project-owner-id.utils";
import {
  canDeleteProjectCard,
  canEditProjectCard,
  canInviteProjectMembers,
  canViewProjectCard,
} from "@/lib/projects/project-card-access.utils";
import { isSuperAdmin, mergePermissions } from "@/lib/rbac/access";
import { cn } from "@/lib/utils";

export function ProjectDetailSection() {
  const params = useParams<{ id: string }>();
  const projectId = typeof params.id === "string" ? params.id : "";
  const router = useRouter();
  const { t } = useTranslation("translation", { keyPrefix: "modules.projects.detail" });
  const { t: tRoot } = useTranslation("translation");
  const { t: tTable } = useTranslation("translation", { keyPrefix: "modules.projects.table" });
  const { data: user } = useAuthUserQuery();
  const userIsSuperAdmin = isSuperAdmin(user?.roles);
  const { data: projectAccess } = useProjectAccessQuery(projectId, {
    enabled: Boolean(user && projectId) && !userIsSuperAdmin,
  });
  const { data: project, isPending, isError, error } = useProjectQuery(projectId, {
    enabled: Boolean(user && projectId),
  });
  const deleteMutation = useDeleteProjectMutation();
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const permissions = mergePermissions(user?.permissions ?? [], projectAccess?.permissions ?? []);

  const projectOwnerId = project ? resolveProjectOwnerId(project) : null;

  const canView = project
    ? canViewProjectCard({
        permissions,
        userId: user?.id,
        ownerId: projectOwnerId,
        isSuperAdmin: userIsSuperAdmin,
      })
    : true;

  const canEdit = project
    ? canEditProjectCard({
        permissions,
        userId: user?.id,
        ownerId: projectOwnerId,
        isSuperAdmin: userIsSuperAdmin,
      })
    : false;

  const canInvite = project
    ? canInviteProjectMembers({
        permissions,
        userId: user?.id,
        ownerId: projectOwnerId,
        isSuperAdmin: userIsSuperAdmin,
        status: project.status,
      })
    : false;

  const canDelete = project
    ? canDeleteProjectCard({
        platformPermissions: user?.permissions ?? [],
        isSuperAdmin: userIsSuperAdmin,
        status: project.status,
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

  async function confirmDelete() {
    if (!project) return;
    try {
      const result = await deleteMutation.mutateAsync(project.id);
      setIsDeleteOpen(false);
      notify.success(result.message?.trim() || tTable("deleteSuccessFallback"));
      router.push(PROJECT_ROUTES.list);
    } catch (err) {
      notify.error(ApiError.messageFrom(err, tTable("deleteErrorTitle")));
    }
  }

  if (!projectId) {
    return (
      <div className="px-4 py-6 sm:px-6">
        <EmptyState
          title={t("notFoundTitle")}
          description={t("notFoundBody")}
          icon={IoFolderOpenOutline}
        />
      </div>
    );
  }

  if (isPending || !user) {
    return <LoadingState skeletonVariant="detail" />;
  }

  if (isError) {
    const isNotFound = error instanceof ApiError && error.status === 404;
    return (
      <div className="px-4 py-6 sm:px-6">
        <EmptyState
          title={isNotFound ? t("notFoundTitle") : t("loadErrorTitle")}
          description={isNotFound ? t("notFoundBody") : t("loadErrorBody")}
          icon={isNotFound ? IoFolderOpenOutline : IoWarningOutline}
        />
      </div>
    );
  }

  if (!project || !canView) {
    return (
      <div className="px-4 py-6 sm:px-6">
        <EmptyState
          title={t("notFoundTitle")}
          description={t("notFoundBody")}
          icon={IoFolderOpenOutline}
        />
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
          canInviteMembers={canInvite}
          canDeleteProject={canDelete}
          isSuperAdmin={userIsSuperAdmin}
          onInviteUsers={() => setIsInviteOpen(true)}
          onDeleteProject={() => setIsDeleteOpen(true)}
        />

        <ProjectDetailHero project={project} isSuperAdmin={userIsSuperAdmin} />

        <div className="grid gap-5 xl:grid-cols-2 xl:items-start">
          <ProjectDetailMainContent project={project} />
          <ProjectDetailSidebar project={project} />
        </div>
      </div>

      <ProjectInviteUsersQuickAdd
        open={isInviteOpen}
        projectId={project.id}
        canInvite={canInvite}
        onOpenChange={setIsInviteOpen}
      />

      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        icon={IoTrashOutline}
        title={tTable("deleteConfirmTitle")}
        description={tTable("deleteConfirmDescription", { name: project.businessName })}
        action={
          <>
            <AlertDialogCancel>{tTable("deleteConfirmCancel")}</AlertDialogCancel>
            <button
              type="button"
              className={cn(buttonVariants({ variant: "destructive", size: "md" }))}
              onClick={() => void confirmDelete()}
              disabled={deleteMutation.isPending}
            >
              {tTable("deleteConfirmAction")}
            </button>
          </>
        }
      />
    </div>
  );
}
