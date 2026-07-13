"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { IoArrowBackOutline } from "react-icons/io5";

import { Heading } from "@/components/heading";
import { Paragraph } from "@/components/paragraph";
import { ProjectActions } from "@/components/projects/project-actions";
import type { ProjectStatus } from "@/lib/projects/constants";

type ProjectDetailHeaderProps = {
  businessName: string;
  projectId: string;
  status: ProjectStatus;
  canEditProject: boolean;
  isSuperAdmin: boolean;
};

export function ProjectDetailHeader({
  businessName,
  projectId,
  status,
  canEditProject,
  isSuperAdmin,
}: ProjectDetailHeaderProps) {
  const { t } = useTranslation("translation", { keyPrefix: "modules.projects.detail" });

  const showActions = isSuperAdmin || canEditProject;

  return (
    <div className="space-y-4">
      <Link
        href="/projects"
        className="inline-flex items-center gap-2 type-body-strong text-text-secondary transition-colors hover:text-text-primary hover:underline"
      >
        <IoArrowBackOutline className="size-4 shrink-0" aria-hidden />
        {t("backToProjects")}
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 space-y-1">
          <Heading id="project-detail-title" pageTitle>
            {businessName}
          </Heading>
          <Paragraph className="text-text-muted">{t("pageLead")}</Paragraph>
        </div>

        {showActions ? (
          <ProjectActions
            projectId={projectId}
            status={status}
            isSuperAdmin={isSuperAdmin}
            canEditProject={canEditProject}
            canViewDetails={false}
            size="big"
          />
        ) : null}
      </div>
    </div>
  );
}
