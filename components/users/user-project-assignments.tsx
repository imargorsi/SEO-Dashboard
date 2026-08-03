"use client";

import { useTranslation } from "react-i18next";

import { Badge } from "@/components/ui/badge";
import { StatusChip } from "@/components/ui/status-chip";
import { UserAvatar } from "@/components/ui/user-avatar";
import {
  getBadgeToneClassName,
  getProjectStatusColorKey,
} from "@/lib/frontend/theme/status-colors";
import { PROJECT_OWNER_ROLE } from "@/lib/rbac/roles";
import type { TAdminUserProjectAssignment } from "@/types/admin-user.types";
import { cn } from "@/lib/utils";

type UserProjectAssignmentsProps = {
  projects: TAdminUserProjectAssignment[];
  className?: string;
};

export function UserProjectAssignments({ projects, className }: UserProjectAssignmentsProps) {
  const { t } = useTranslation("translation", { keyPrefix: "modules.users.assignments" });

  if (projects.length === 0) {
    return <p className="type-body text-text-muted">{t("noProjects")}</p>;
  }

  return (
    <ul className={cn("flex flex-col gap-4", className)}>
      {projects.map((project) => {
        const isOwner = project.membership_role === PROJECT_OWNER_ROLE;
        const membershipLabel = isOwner ? t("membershipOwner") : t("membershipMember");
        const projectStatusLabel = t(`projectStatus.${project.status}`);

        return (
          <li
            key={`${project.id}-${project.membership_role}-${project.membership_status}`}
            className="min-w-0"
          >
            <div className="flex items-start gap-3">
              <UserAvatar
                name={project.name}
                imageUrl={project.image_url}
                size="lg"
                variant="logo"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 space-y-0.5">
                    <p className="truncate type-body-strong text-text-primary">{project.name}</p>
                    <p className="truncate type-caption text-text-muted">{project.website_url}</p>
                  </div>
                  <StatusChip
                    className="shrink-0"
                    colorKey={getProjectStatusColorKey(project.status)}
                    label={projectStatusLabel}
                  />
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <Badge
                    variant="outline"
                    className={cn(
                      "type-caption-xs",
                      getBadgeToneClassName(isOwner ? "warning" : "success"),
                    )}
                  >
                    {membershipLabel}
                  </Badge>
                  {project.membership_status === "invited" ? (
                    <span className="type-caption text-text-muted">{t("membershipInvited")}</span>
                  ) : null}
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
