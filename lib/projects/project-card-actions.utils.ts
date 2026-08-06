import type { ProjectStatus } from "@/lib/projects/constants";
import { PROJECT_ROUTES } from "@/lib/frontend/projects/project-routes.utils";

export type TProjectStatusAction = "approve" | "reject" | "activate" | "deactivate";

export type TProjectCardActionId =
  | TProjectStatusAction
  | "viewDetails"
  | "edit"
  | "inviteUsers"
  | "delete";

export type TProjectCardActionTone = "success" | "warning" | "destructive" | "muted" | "brand" | "default";

export type TProjectCardActionConfig = {
  id: TProjectCardActionId;
  group: "status" | "general";
  tone: TProjectCardActionTone;
  labelKey: TProjectCardActionLabelKey;
  action?: TProjectStatusAction;
  href?: string;
};

export type TProjectCardActionLabelKey =
  | "approve"
  | "decline"
  | "active"
  | "inactive"
  | "pending"
  | "viewDetails"
  | "editProject"
  | "inviteUsers"
  | "deleteProject";

type TBuildProjectCardActionsInput = {
  status: ProjectStatus;
  projectId: string;
  isSuperAdmin: boolean;
  canViewDetails: boolean;
  canEditProject: boolean;
  canInviteMembers?: boolean;
  canDeleteProject?: boolean;
};

export function buildProjectCardActions({
  status,
  projectId,
  isSuperAdmin,
  canViewDetails,
  canEditProject,
  canInviteMembers = false,
  canDeleteProject = false,
}: TBuildProjectCardActionsInput): TProjectCardActionConfig[] {
  const statusActions = buildStatusActions(status, isSuperAdmin);
  const generalActions = buildGeneralActions(
    projectId,
    status,
    canViewDetails,
    canEditProject,
    canInviteMembers,
    canDeleteProject,
  );

  return [...statusActions, ...generalActions];
}

function buildStatusActions(status: ProjectStatus, isSuperAdmin: boolean): TProjectCardActionConfig[] {
  if (!isSuperAdmin) return [];

  if (status === "pending") {
    return [
      { id: "approve", group: "status", tone: "success", labelKey: "approve", action: "approve" },
      { id: "reject", group: "status", tone: "destructive", labelKey: "decline", action: "reject" },
    ];
  }

  if (status === "active") {
    return [
      {
        id: "deactivate",
        group: "status",
        tone: "destructive",
        labelKey: "inactive",
        action: "deactivate",
      },
    ];
  }

  if (status === "inactive") {
    return [
      {
        id: "activate",
        group: "status",
        tone: "success",
        labelKey: "active",
        action: "activate",
      },
    ];
  }

  return [];
}

function buildGeneralActions(
  projectId: string,
  status: ProjectStatus,
  canViewDetails: boolean,
  canEditProject: boolean,
  canInviteMembers: boolean,
  canDeleteProject: boolean,
): TProjectCardActionConfig[] {
  const actions: TProjectCardActionConfig[] = [];

  if (canInviteMembers && status !== "rejected") {
    actions.push({
      id: "inviteUsers",
      group: "general",
      tone: "brand",
      labelKey: "inviteUsers",
    });
  }

  if (canViewDetails) {
    actions.push({
      id: "viewDetails",
      group: "general",
      tone: "brand",
      labelKey: "viewDetails",
      href: PROJECT_ROUTES.view(projectId),
    });
  }

  // Rejected projects are read-only on the detail page — no edit CTA.
  if (canEditProject && status !== "rejected") {
    actions.push({
      id: "edit",
      group: "general",
      tone: "default",
      labelKey: "editProject",
      href: PROJECT_ROUTES.edit(projectId),
    });
  }

  if (canDeleteProject) {
    actions.push({
      id: "delete",
      group: "general",
      tone: "destructive",
      labelKey: "deleteProject",
    });
  }

  return actions;
}
