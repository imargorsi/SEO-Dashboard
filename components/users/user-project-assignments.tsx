"use client";

import { useTranslation } from "react-i18next";

import { ProjectIdentity } from "@/components/projects/project-identity";
import { Badge } from "@/components/ui/badge";
import { StatusChip } from "@/components/ui/status-chip";
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
    return (
      <div className="rounded-2xl border border-dashed border-border/50 bg-bg-card/30 px-3.5 py-5 text-center">
        <p className="type-body text-text-muted">{t("noProjects")}</p>
      </div>
    );
  }

  return (
    <ul className={cn("flex flex-col gap-2.5", className)}>
      {projects.map((project) => {
        const isOwner = project.membership_role === PROJECT_OWNER_ROLE;
        const membershipLabel = isOwner ? t("membershipOwner") : t("membershipMember");
        const projectStatusLabel = t(`projectStatus.${project.status}`);

        return (
          <li
            key={`${project.id}-${project.membership_role}-${project.membership_status}`}
            className="rounded-2xl border border-border/50 bg-bg-card/40 p-3.5 shadow-sm backdrop-blur-md dark:border-text-primary/20 dark:bg-text-primary/6"
          >
            <ProjectIdentity
              name={project.name}
              websiteUrl={project.website_url}
              imageUrl={project.image_url}
              size="md"
              className="min-w-0"
              meta={
                project.membership_status === "invited" ? t("membershipInvited") : null
              }
              trailing={
                <>
                  <StatusChip
                    colorKey={getProjectStatusColorKey(project.status)}
                    label={projectStatusLabel}
                  />
                  <Badge
                    variant="outline"
                    className={cn(
                      "type-caption-xs",
                      getBadgeToneClassName(isOwner ? "warning" : "success"),
                    )}
                  >
                    {project.role_name || membershipLabel}
                  </Badge>
                </>
              }
            />
          </li>
        );
      })}
    </ul>
  );
}
