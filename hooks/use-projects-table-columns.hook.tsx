"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoEyeOutline,
  IoPencil,
  IoPersonAddOutline,
  IoTrashOutline,
} from "react-icons/io5";

import type { TAppTableColumn } from "@/components/table/app-table";
import { TableRowIconActions } from "@/components/table/table-row-icon-actions";
import { ProjectStatusChip } from "@/components/projects/project-status-chip";
import { ActiveInactiveToggle } from "@/components/ui/active-inactive-toggle";
import { UserAvatar } from "@/components/ui/user-avatar";
import type { TProjectListItem } from "@/features/projects/projects.api";
import {
  buildProjectCardActions,
  type TProjectCardActionId,
  type TProjectStatusAction,
} from "@/lib/projects/project-card-actions.utils";

export type TProjectTableRow = TProjectListItem & Record<string, unknown>;

export type TProjectTableAccess = {
  canViewDetails: boolean;
  canEditProject: boolean;
  canInviteMembers: boolean;
  canDeleteProject: boolean;
};

type TUseProjectsTableColumnsInput = {
  isSuperAdmin: boolean;
  getAccess: (project: TProjectListItem) => TProjectTableAccess;
  onStatusAction: (project: TProjectListItem, action: TProjectStatusAction) => void;
  onInviteUsers: (projectId: string) => void;
  onDeleteProject: (project: TProjectListItem) => void;
  statusActionPendingProjectId?: string | null;
  isStatusMutationPending?: boolean;
};

function actionIcon(actionId: TProjectCardActionId) {
  if (actionId === "approve") return <IoCheckmarkCircleOutline className="size-4" aria-hidden />;
  if (actionId === "reject") return <IoCloseCircleOutline className="size-4" aria-hidden />;
  if (actionId === "inviteUsers") return <IoPersonAddOutline className="size-4" aria-hidden />;
  if (actionId === "viewDetails") return <IoEyeOutline className="size-4" aria-hidden />;
  if (actionId === "delete") return <IoTrashOutline className="size-4" aria-hidden />;
  return <IoPencil className="size-4" aria-hidden />;
}

export function useProjectsTableColumns({
  isSuperAdmin,
  getAccess,
  onStatusAction,
  onInviteUsers,
  onDeleteProject,
  statusActionPendingProjectId = null,
  isStatusMutationPending = false,
}: TUseProjectsTableColumnsInput): TAppTableColumn<TProjectTableRow>[] {
  const { t } = useTranslation("translation", { keyPrefix: "modules.projects" });
  const { t: tActions } = useTranslation("translation", { keyPrefix: "modules.projects.cardActions" });
  const { t: tCard } = useTranslation("translation", { keyPrefix: "modules.projects.listCard" });
  const router = useRouter();

  return useMemo(
    () => [
      {
        key: "project",
        label: t("table.colBusinessName"),
        render: (item) => (
          <div className="flex min-w-0 items-center gap-3">
            <UserAvatar
              name={item.businessName}
              imageUrl={item.imageUrl}
              size="md"
              roundedClassName="rounded-xl"
            />
            <div className="min-w-0">
              <p className="truncate type-body-strong text-text-primary">{item.businessName}</p>
              <p className="truncate type-caption text-text-muted">{item.websiteUrl}</p>
            </div>
          </div>
        ),
      },
      {
        key: "owner",
        label: tCard("projectOwnerLabel"),
        render: (item) => {
          const ownerName = item.owner?.name?.trim() || tCard("projectOwnerFallback");
          return (
            <div className="flex min-w-0 items-center gap-2.5">
              <UserAvatar
                name={ownerName}
                imageUrl={item.owner?.profileImage ?? null}
                size="sm"
                roundedClassName="rounded-full"
              />
              <span className="truncate type-body text-text-primary">{ownerName}</span>
            </div>
          );
        },
      },
      {
        key: "status",
        label: t("table.colStatus"),
        render: (item) => <ProjectStatusChip status={item.status} />,
      },
      {
        key: "actions",
        label: t("table.colActions"),
        align: "end",
        render: (item) => {
          const access = getAccess(item);
          const actions = buildProjectCardActions({
            status: item.status,
            projectId: item.id,
            isSuperAdmin,
            canViewDetails: access.canViewDetails,
            canEditProject: access.canEditProject,
            canInviteMembers: access.canInviteMembers,
            canDeleteProject: access.canDeleteProject,
          });
          const isStatusPending = statusActionPendingProjectId === item.id;
          const canToggleActiveInactive =
            isSuperAdmin && (item.status === "active" || item.status === "inactive");
          const iconActions = actions.filter(
            (action) => action.id !== "activate" && action.id !== "deactivate",
          );

          return (
            <div className="flex items-center justify-end gap-1.5">
              <TableRowIconActions
                actions={iconActions.map((action) => ({
                  key: action.id,
                  icon: actionIcon(action.id),
                  label: tActions(action.labelKey),
                  disabled: Boolean(action.action) && (isStatusPending || isStatusMutationPending),
                  className:
                    action.id === "delete"
                      ? "text-destructive hover:bg-destructive/10 hover:text-destructive"
                      : undefined,
                  onClick: () => {
                    if (action.id === "inviteUsers") {
                      onInviteUsers(item.id);
                      return;
                    }
                    if (action.id === "delete") {
                      onDeleteProject(item);
                      return;
                    }
                    if (action.href) {
                      router.push(action.href);
                      return;
                    }
                    if (action.action) {
                      onStatusAction(item, action.action);
                    }
                  },
                }))}
              />
              {canToggleActiveInactive ? (
                <ActiveInactiveToggle
                  checked={item.status === "active"}
                  disabled={isStatusMutationPending}
                  isLoading={isStatusPending}
                  ariaLabel={item.status === "active" ? tActions("inactive") : tActions("active")}
                  onCheckedChange={(nextChecked) =>
                    onStatusAction(item, nextChecked ? "activate" : "deactivate")
                  }
                />
              ) : null}
            </div>
          );
        },
      },
    ],
    [
      getAccess,
      isSuperAdmin,
      onDeleteProject,
      onInviteUsers,
      onStatusAction,
      router,
      statusActionPendingProjectId,
      isStatusMutationPending,
      t,
      tActions,
      tCard,
    ],
  );
}
