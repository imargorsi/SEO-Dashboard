"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

import { Heading } from "@/components/heading";
import { Paragraph } from "@/components/paragraph";
import { ProjectCreateForm } from "@/components/forms/project-create-form";
import { LoadingState } from "@/components/ui/loading-state";
import { useProjectAccess } from "@/context/project-access-context";
import { useAuthUserQuery } from "@/features/auth/auth.api";
import { useProjectsQuery } from "@/features/projects/projects.api";
import { hasPermission, mergePermissions } from "@/lib/rbac/access";

export function ProjectsCreateSection() {
  const router = useRouter();
  const { t } = useTranslation("translation", { keyPrefix: "modules.projects" });
  const { data: authUser, isLoading } = useAuthUserQuery();
  const { projectPermissions } = useProjectAccess();
  const { data: projects, isPending: isProjectsPending } = useProjectsQuery({ enabled: Boolean(authUser) });
  const hasProjects = (projects?.length ?? 0) > 0;
  const isVerified = Boolean(authUser?.email_verified_at);

  const canCreate = useMemo(
    () =>
      isVerified &&
      (hasPermission(mergePermissions(authUser?.permissions ?? [], projectPermissions), "projects.create") ||
        !hasProjects),
    [authUser?.permissions, hasProjects, isVerified, projectPermissions],
  );

  useEffect(() => {
    if (!isLoading && authUser && !isVerified) {
      router.replace("/email-verification");
      return;
    }
    if (!isLoading && !isProjectsPending && !canCreate) {
      router.replace("/projects");
    }
  }, [authUser, canCreate, isLoading, isProjectsPending, isVerified, router]);

  if (isLoading || isProjectsPending || !authUser) {
    return <LoadingState className="m-6" />;
  }

  if (!isVerified) return null;
  if (!canCreate) return null;

  return (
    <div className="w-full min-w-0">
      <div className="space-y-5 px-4 py-6 sm:px-6">
        <div className="space-y-1">
          <Heading id="projects-create-title" pageTitle>
            {t("createProjectTitle")}
          </Heading>
          <Paragraph className="text-text-muted">{t("createLead")}</Paragraph>
        </div>
        <ProjectCreateForm authUser={authUser} />
      </div>
    </div>
  );
}
