"use client";

import Link from "next/link";
import { IoArrowForward, IoGlobeOutline } from "react-icons/io5";

import { ProjectStatusChip } from "@/components/projects/project-status-chip";
import { UserAvatar } from "@/components/ui/user-avatar";
import type { TProjectListItem } from "@/features/projects/projects.api";

type ProjectCardProps = {
  project: TProjectListItem;
  canViewDetails: boolean;
};

function ProjectImage({ imageUrl, businessName }: { imageUrl: string | null; businessName: string }) {
  return (
    <UserAvatar
      name={businessName}
      imageUrl={imageUrl}
      size="md"
      roundedClassName="rounded-xl"
      className="size-12"
    />
  );
}

export function ProjectCard({ project, canViewDetails }: ProjectCardProps) {
  const ownerName = project.owner?.name?.trim() || "Project Owner";

  return (
    <article className="rounded-3xl border border-border bg-bg-card p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <ProjectImage imageUrl={project.imageUrl} businessName={project.businessName} />
        <ProjectStatusChip status={project.status} />
      </div>

      <div className="mt-4 space-y-1.5">
        <h3 className="type-h2 text-text-primary">{project.businessName}</h3>
        <p className="flex items-center gap-1.5 type-body text-text-secondary">
          <IoGlobeOutline className="size-3.5 shrink-0" aria-hidden />
          <span className="truncate">{project.websiteUrl}</span>
        </p>
      </div>

      <div className="mt-6 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="type-caption-xs uppercase tracking-[0.08em] text-text-muted">Project Owner</p>
          <div className="mt-2.5 flex items-center gap-2">
            <UserAvatar
              name={ownerName}
              imageUrl={project.owner?.profileImage ?? null}
              size="sm"
              roundedClassName="rounded-full"
            />
            <p className="truncate type-body text-text-primary">{ownerName}</p>
          </div>
        </div>

        {canViewDetails ? (
          <Link
            href={`/projects/${project.id}`}
            className="inline-flex items-center gap-1.5 type-body-strong text-text-primary transition-colors hover:text-brand"
          >
            View Details
            <IoArrowForward className="size-4" aria-hidden />
          </Link>
        ) : null}
      </div>
    </article>
  );
}
