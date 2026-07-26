"use client";

import { IoGlobeOutline } from "react-icons/io5";
import { useTranslation } from "react-i18next";

import { ProjectActions } from "@/components/projects/project-actions";
import { ProjectStatusChip } from "@/components/projects/project-status-chip";
import { ActiveInactiveToggle } from "@/components/ui/active-inactive-toggle";
import { UserAvatar } from "@/components/ui/user-avatar";
import type { TProjectListItem } from "@/features/projects/projects.api";
import { useProjectActions } from "@/features/projects/use-project-actions.hook";
import {
  elevatedCardBodyClass,
  elevatedCardMutedClass,
  elevatedCardSurfaceClass,
  elevatedCardTitleClass,
} from "@/lib/frontend/layout/dashboard-chrome";
import { cn } from "@/lib/utils";

type ProjectCardProps = {
  project: TProjectListItem;
  canViewDetails: boolean;
  canEditProject: boolean;
  canInviteMembers?: boolean;
  canDeleteProject?: boolean;
  isSuperAdmin: boolean;
  onInviteUsers?: () => void;
  onDeleteProject?: () => void;
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

export function ProjectCard({
  project,
  canViewDetails,
  canEditProject,
  canInviteMembers = false,
  canDeleteProject = false,
  isSuperAdmin,
  onInviteUsers,
  onDeleteProject,
}: ProjectCardProps) {
  const { t } = useTranslation("translation", { keyPrefix: "modules.projects.listCard" });
  const { t: tStatus } = useTranslation("translation", { keyPrefix: "modules.projects.statusFilter" });
  const { t: tActions } = useTranslation("translation", { keyPrefix: "modules.projects.cardActions" });
  const { isPending, handleStatusAction } = useProjectActions(project.id);
  const ownerName = project.owner?.name?.trim() || t("projectOwnerFallback");
  const canToggleActiveInactive =
    isSuperAdmin && (project.status === "active" || project.status === "inactive");
  const isActive = project.status === "active";

  return (
    <article className={cn(elevatedCardSurfaceClass, "rounded-3xl p-5 sm:p-6")}>
      <div className="flex items-start justify-between gap-3">
        <ProjectImage imageUrl={project.imageUrl} businessName={project.businessName} />
        <ProjectStatusChip status={project.status} />
      </div>

      <div className="mt-4 space-y-1.5">
        <h3 className={cn("type-title", elevatedCardTitleClass)}>{project.businessName}</h3>
        <p className={cn("flex items-center gap-1.5 type-body", elevatedCardBodyClass)}>
          <IoGlobeOutline className="size-3.5 shrink-0" aria-hidden />
          <span className="truncate">{project.websiteUrl}</span>
        </p>
      </div>

      <div className="mt-6 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className={cn("type-caption-xs uppercase tracking-[0.08em]", elevatedCardMutedClass)}>
            {t("projectOwnerLabel")}
          </p>
          <div className="mt-2.5 flex items-center gap-2">
            <UserAvatar
              name={ownerName}
              imageUrl={project.owner?.profileImage ?? null}
              size="sm"
              roundedClassName="rounded-full"
            />
            <p className={cn("truncate type-body", elevatedCardTitleClass)}>{ownerName}</p>
          </div>
        </div>

        {canToggleActiveInactive ? (
          <ActiveInactiveToggle
            checked={isActive}
            isLoading={isPending}
            label={isActive ? tStatus("active") : tStatus("inactive")}
            ariaLabel={isActive ? tActions("inactive") : tActions("active")}
            onCheckedChange={(nextChecked) =>
              void handleStatusAction(nextChecked ? "activate" : "deactivate")
            }
          />
        ) : null}
      </div>

      <ProjectActions
        projectId={project.id}
        status={project.status}
        isSuperAdmin={isSuperAdmin}
        canViewDetails={canViewDetails}
        canEditProject={canEditProject}
        canInviteMembers={canInviteMembers}
        canDeleteProject={canDeleteProject}
        onInviteUsers={onInviteUsers}
        onDeleteProject={onDeleteProject}
        includeActiveInactiveToggle={false}
        withCardFooter
      />
    </article>
  );
}
