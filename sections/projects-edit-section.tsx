"use client";

import { useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

import { ProjectCreateForm } from "@/components/forms/project-create-form";
import { Heading } from "@/components/heading";
import { Paragraph } from "@/components/paragraph";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { useProjectAccess } from "@/context/project-access-context";
import { IoFolderOpenOutline, IoLockClosedOutline, IoWarningOutline } from "react-icons/io5";
import { useAuthUserQuery } from "@/features/auth/auth.api";
import { useProjectQuery } from "@/features/projects/projects.api";
import { ApiError } from "@/lib/frontend/api/errors";
import { mapProjectDetailToFormValues } from "@/lib/frontend/projects/map-project-to-form-values.utils";
import { resolveProjectOwnerId } from "@/lib/projects/project-owner-id.utils";
import { canEditProjectCard } from "@/lib/projects/project-card-access.utils";
import { isSuperAdmin, mergePermissions } from "@/lib/rbac/access";

export function ProjectsEditSection() {
  const params = useParams<{ id: string }>();
  const projectId = typeof params.id === "string" ? params.id : "";
  const router = useRouter();
  const { t } = useTranslation("translation", { keyPrefix: "modules.projects" });
  const { t: tForm } = useTranslation("translation", { keyPrefix: "modules.projects.createForm" });
  const { t: tDetail } = useTranslation("translation", { keyPrefix: "modules.projects.detail" });
  const { data: authUser, isLoading: isAuthLoading } = useAuthUserQuery();
  const { projectPermissions } = useProjectAccess();
  const { data: project, isPending, isError, error } = useProjectQuery(projectId, {
    enabled: Boolean(authUser && projectId),
  });

  const permissions = mergePermissions(authUser?.permissions ?? [], projectPermissions);
  const userIsSuperAdmin = isSuperAdmin(authUser?.roles);

  const canEdit = project
    ? canEditProjectCard({
        permissions,
        userId: authUser?.id,
        ownerId: resolveProjectOwnerId(project),
        isSuperAdmin: userIsSuperAdmin,
      })
    : false;

  const initialValues = useMemo(
    () => (project ? mapProjectDetailToFormValues(project) : undefined),
    [project],
  );

  useEffect(() => {
    if (!isAuthLoading && authUser && !authUser.email_verified_at) {
      router.replace("/email-verification");
    }
  }, [authUser, isAuthLoading, router]);

  if (!projectId) {
    return (
      <div className="px-4 py-6 sm:px-6">
        <EmptyState
          title={tDetail("notFoundTitle")}
          description={tDetail("notFoundBody")}
          icon={IoFolderOpenOutline}
        />
      </div>
    );
  }

  if (isAuthLoading || isPending || !authUser) {
    return <LoadingState skeletonVariant="form" />;
  }

  if (isError) {
    const isNotFound = error instanceof ApiError && error.status === 404;
    return (
      <div className="px-4 py-6 sm:px-6">
        <EmptyState
          title={isNotFound ? tDetail("notFoundTitle") : tDetail("loadErrorTitle")}
          description={isNotFound ? tDetail("notFoundBody") : tDetail("loadErrorBody")}
          icon={isNotFound ? IoFolderOpenOutline : IoWarningOutline}
        />
      </div>
    );
  }

  if (!project || !canEdit) {
    return (
      <div className="px-4 py-6 sm:px-6">
        <EmptyState
          title={tForm("editForbiddenTitle")}
          description={tForm("editForbiddenBody")}
          icon={IoLockClosedOutline}
        />
      </div>
    );
  }

  if (project.status === "rejected") {
    return (
      <div className="px-4 py-6 sm:px-6">
        <EmptyState
          title={tForm("editNotAllowedTitle")}
          description={tForm("editNotAllowedBody")}
          icon={IoWarningOutline}
        />
      </div>
    );
  }

  return (
    <div className="w-full min-w-0">
      <div className="space-y-5 px-4 py-6 sm:px-6">
        <div className="type-stack-md">
          <Heading id="projects-edit-title" pageTitle>
            {t("editProjectTitle")}
          </Heading>
          <Paragraph className="text-text-muted">{tForm("editLead")}</Paragraph>
        </div>
        <ProjectCreateForm
          authUser={authUser}
          isEdit
          projectId={project.id}
          initialValues={initialValues}
          initialLogoUrl={project.logoImage}
          readOnlyContactEmail={project.pocEmail}
        />
      </div>
    </div>
  );
}
