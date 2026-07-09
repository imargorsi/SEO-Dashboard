"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";

import { Heading } from "@/components/heading";
import { Paragraph } from "@/components/paragraph";
import { ProjectCard } from "@/components/projects/project-card";
import { buttonVariants } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/loading-state";
import { useProjectAccess } from "@/context/project-access-context";
import { useAuthUserQuery } from "@/features/auth/auth.api";
import { type TProjectListItem, useProjectsQuery } from "@/features/projects/projects.api";
import { hasPermission, mergePermissions } from "@/lib/rbac/access";
import { cn } from "@/lib/utils";

export function ProjectsListSection() {
  const { t } = useTranslation("translation", { keyPrefix: "modules.projects" });
  const { t: tTable } = useTranslation("translation", { keyPrefix: "table" });
  const { data: user } = useAuthUserQuery();
  const { projectPermissions } = useProjectAccess();
  const { data: projects, isPending } = useProjectsQuery();

  const permissions = mergePermissions(user?.permissions ?? [], projectPermissions);
  const canCreateProject = hasPermission(permissions, "projects.create");
  const canViewDetails = hasPermission(permissions, "projects.view");

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
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3">
            {(projects ?? []).map((project: TProjectListItem) => (
              <ProjectCard key={project.id} project={project} canViewDetails={canViewDetails} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
