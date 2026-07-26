"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoEyeOutline,
  IoPauseCircleOutline,
  IoPencil,
  IoPersonAddOutline,
  IoPlayCircleOutline,
} from "react-icons/io5";

import type { TAppTableColumn } from "@/components/table/app-table";
import { TableRowIconActions } from "@/components/table/table-row-icon-actions";
import { ProjectStatusChip } from "@/components/projects/project-status-chip";
import { UserAvatar } from "@/components/ui/user-avatar";
import type { TProjectListItem } from "@/features/projects/projects.api";
import {
  buildProjectCardActions,
  type TProjectStatusAction,
} from "@/lib/projects/project-card-actions.utils";

export type TProjectTableRow = TProjectListItem & Record<string, unknown>;

export type TProjectTableAccess = {
  canViewDetails: boolean;
  canEditProject: boolean;
  canInviteMembers: boolean;
};

type TUseProjectsTableColumnsInput = {
  isSuperAdmin: boolean;
  getAccess: (project: TProjectListItem) => TProjectTableAccess;
  onStatusAction: (project: TProjectListItem, action: TProjectStatusAction) => void;
  onInviteUsers: (projectId: string) => void;
  statusActionPendingProjectId?: string | null;
};

export function useProjectsTableColumns({
  isSuperAdmin,
  getAccess,
  onStatusAction,
  onInviteUsers,
  statusActionPendingProjectId = null,
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
          });
          const isStatusPending = statusActionPendingProjectId === item.id;

          return (
            <TableRowIconActions
              actions={actions.map((action) => {
                const icon =
                  action.id === "approve" ? (
                    <IoCheckmarkCircleOutline className="size-4" aria-hidden />
                  ) : action.id === "reject" ? (
                    <IoCloseCircleOutline className="size-4" aria-hidden />
                  ) : action.id === "activate" ? (
                    <IoPlayCircleOutline className="size-4" aria-hidden />
                  ) : action.id === "deactivate" ? (
                    <IoPauseCircleOutline className="size-4" aria-hidden />
                  ) : action.id === "inviteUsers" ? (
                    <IoPersonAddOutline className="size-4" aria-hidden />
                  ) : action.id === "viewDetails" ? (
                    <IoEyeOutline className="size-4" aria-hidden />
                  ) : (
                    <IoPencil className="size-4" aria-hidden />
                  );

                return {
                  key: action.id,
                  icon,
                  label: tActions(action.labelKey),
                  disabled: Boolean(action.action) && isStatusPending,
                  onClick: () => {
                    if (action.id === "inviteUsers") {
                      onInviteUsers(item.id);
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
                };
              })}
            />
          );
        },
      },
    ],
    [
      getAccess,
      isSuperAdmin,
      onInviteUsers,
      onStatusAction,
      router,
      statusActionPendingProjectId,
      t,
      tActions,
      tCard,
    ],
  );
}
