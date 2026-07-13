"use client";

import { useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

import { ProjectCreateForm } from "@/components/forms/project-create-form";
import { Heading } from "@/components/heading";
import { Paragraph } from "@/components/paragraph";
import { LoadingState } from "@/components/ui/loading-state";
import { StateCard } from "@/components/ui/state-card";
import { useProjectAccess } from "@/context/project-access-context";
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
        <StateCard title={tDetail("notFoundTitle")} body={tDetail("notFoundBody")} />
      </div>
    );
  }

  if (isAuthLoading || isPending || !authUser) {
    return <LoadingState className="m-6" label={tDetail("loading")} />;
  }

  if (isError) {
    const isNotFound = error instanceof ApiError && error.status === 404;
    return (
      <div className="px-4 py-6 sm:px-6">
        <StateCard
          title={isNotFound ? tDetail("notFoundTitle") : tDetail("loadErrorTitle")}
          body={isNotFound ? tDetail("notFoundBody") : tDetail("loadErrorBody")}
        />
      </div>
    );
  }

  if (!project || !canEdit) {
    return (
      <div className="px-4 py-6 sm:px-6">
        <StateCard title={tForm("editForbiddenTitle")} body={tForm("editForbiddenBody")} />
      </div>
    );
  }

  if (project.status === "rejected") {
    return (
      <div className="px-4 py-6 sm:px-6">
        <StateCard title={tForm("editNotAllowedTitle")} body={tForm("editNotAllowedBody")} />
      </div>
    );
  }

  return (
    <div className="w-full min-w-0">
      <div className="space-y-5 px-4 py-6 sm:px-6">
        <div className="space-y-1">
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
