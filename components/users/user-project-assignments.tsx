"use client";

import { useTranslation } from "react-i18next";

import { Badge } from "@/components/ui/badge";
import { getBadgeToneClassName } from "@/lib/frontend/theme/status-colors";
import { elevatedCardSurfaceClass } from "@/lib/frontend/layout/dashboard-chrome";
import { PROJECT_OWNER_ROLE } from "@/lib/rbac/roles";
import type { TAdminUserProjectAssignment } from "@/types/admin-user.types";
import { cn } from "@/lib/utils";

type UserProjectAssignmentsProps = {
  projects: TAdminUserProjectAssignment[];
  variant?: "plain" | "cards";
  className?: string;
};

export function UserProjectAssignments({
  projects,
  variant = "plain",
  className,
}: UserProjectAssignmentsProps) {
  const { t } = useTranslation("translation", { keyPrefix: "modules.users.assignments" });

  if (projects.length === 0) {
    return <p className="type-body text-text-muted">{t("noProjects")}</p>;
  }

  return (
    <ul className={cn("flex flex-col gap-3", className)}>
      {projects.map((project) => {
        const isOwner = project.membership_role === PROJECT_OWNER_ROLE;
        const membershipLabel = isOwner ? t("membershipOwner") : t("membershipMember");
        const projectStatusLabel = t(`projectStatus.${project.status}`);

        return (
          <li
            key={`${project.id}-${project.membership_role}-${project.membership_status}`}
            className={cn(
              "min-w-0",
              variant === "cards" && cn(elevatedCardSurfaceClass, "rounded-xl p-3.5"),
            )}
          >
            <p className="truncate type-body-strong text-text-primary">{project.name}</p>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <Badge
                variant="outline"
                className={cn(
                  "type-caption-xs",
                  getBadgeToneClassName(isOwner ? "warning" : "success"),
                )}
              >
                {membershipLabel}
              </Badge>
              <span className="type-caption text-text-muted">{projectStatusLabel}</span>
              {project.membership_status === "invited" ? (
                <span className="type-caption text-text-muted">· {t("membershipInvited")}</span>
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
