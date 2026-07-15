"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { IoEyeOutline, IoPauseCircleOutline, IoPencil, IoPlayCircleOutline } from "react-icons/io5";

import type { TAppTableColumn } from "@/components/table/app-table";
import { TableRowIconActions } from "@/components/table/table-row-icon-actions";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { UserAvatar } from "@/components/ui/user-avatar";
import { formatLastActionTime } from "@/lib/frontend/date/format-relative-date.utils";
import { isActiveUserStatus } from "@/lib/users/constants";
import type { TAdminUserListItem } from "@/types/admin-user.types";

export type TUserTableRow = TAdminUserListItem & Record<string, unknown>;

type TUseUsersTableColumnsInput = {
  onViewUser?: (user: TAdminUserListItem) => void;
  onEditUser?: (user: TAdminUserListItem) => void;
  onToggleUserStatus?: (user: TAdminUserListItem) => void;
  canUpdate?: boolean;
  statusActionPendingUserId?: string | null;
};

export function useUsersTableColumns({
  onViewUser,
  onEditUser,
  onToggleUserStatus,
  canUpdate = false,
  statusActionPendingUserId = null,
}: TUseUsersTableColumnsInput = {}): TAppTableColumn<TUserTableRow>[] {
  const { t } = useTranslation("translation", { keyPrefix: "modules.users.table" });

  return useMemo(
    () => [
      {
        key: "user",
        label: t("colUser"),
        render: (item) => (
          <div className="flex min-w-0 items-center gap-3">
            <UserAvatar name={item.name} imageUrl={item.profile_image} size="md" roundedClassName="rounded-full" />
            <div className="min-w-0">
              <p className="type-body-strong text-text-primary truncate">{item.name}</p>
              <p className="type-caption text-text-muted truncate">{item.email}</p>
            </div>
          </div>
        ),
      },
      {
        key: "projects",
        label: t("colProjects"),
        render: (item) => (
          <span className="type-body text-text-primary tabular-nums">
            {t("projectsCount", { count: item.projects.length })}
          </span>
        ),
      },
      {
        key: "status",
        label: t("colStatus"),
        render: (item) => {
          const status = isActiveUserStatus(item.status) ? "active" : "inactive";

          return (
            <StatusIndicator status={status} label={status === "active" ? t("statusActive") : t("statusInactive")} />
          );
        },
      },
      {
        key: "lastAction",
        label: t("colLastAction"),
        render: (item) => {
          const isVerified = Boolean(item.email_verified_at);
          const lastActionAt = isVerified ? item.updated_at : item.created_at;

          return (
            <div className="min-w-0">
              <p className="type-body text-text-primary">
                {isVerified ? t("lastActionVerified") : t("lastActionCreated")}
              </p>
              <p className="type-caption text-text-muted">{formatLastActionTime(lastActionAt)}</p>
            </div>
          );
        },
      },
      {
        key: "actions",
        label: t("colActions"),
        align: "end",
        render: (item) => {
          const isActive = isActiveUserStatus(item.status);
          const isStatusPending = statusActionPendingUserId === item.id;

          return (
            <TableRowIconActions
              actions={[
                {
                  key: "view",
                  icon: <IoEyeOutline className="size-4" aria-hidden />,
                  label: t("viewUser", { name: item.name }),
                  onClick: onViewUser ? () => onViewUser(item) : undefined,
                },
                {
                  key: "edit",
                  icon: <IoPencil className="size-4" aria-hidden />,
                  label: t("editUser", { name: item.name }),
                  onClick: onEditUser ? () => onEditUser(item) : undefined,
                },
                ...(canUpdate && onToggleUserStatus
                  ? [
                      {
                        key: isActive ? "deactivate" : "activate",
                        icon: isActive ? (
                          <IoPauseCircleOutline className="size-4" aria-hidden />
                        ) : (
                          <IoPlayCircleOutline className="size-4" aria-hidden />
                        ),
                        label: isActive
                          ? t("deactivateUser", { name: item.name })
                          : t("activateUser", { name: item.name }),
                        onClick: () => onToggleUserStatus(item),
                        disabled: isStatusPending,
                      },
                    ]
                  : []),
              ]}
            />
          );
        },
      },
    ],
    [canUpdate, onEditUser, onToggleUserStatus, onViewUser, statusActionPendingUserId, t]
  );
}
