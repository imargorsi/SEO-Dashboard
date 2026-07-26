"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { IoEyeOutline, IoTrashOutline } from "react-icons/io5";
import { PiPencilThin } from "react-icons/pi";

import type { TAppTableColumn } from "@/components/table/app-table";
import { TableRowIconActions } from "@/components/table/table-row-icon-actions";
import { ActiveInactiveToggle } from "@/components/ui/active-inactive-toggle";
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
  onDeleteUser?: (user: TAdminUserListItem) => void;
  canUpdate?: boolean;
  canDelete?: boolean;
  currentUserId?: string | null;
  statusActionPendingUserId?: string | null;
  isStatusMutationPending?: boolean;
};

export function useUsersTableColumns({
  onViewUser,
  onEditUser,
  onToggleUserStatus,
  onDeleteUser,
  canUpdate = false,
  canDelete = false,
  currentUserId = null,
  statusActionPendingUserId = null,
  isStatusMutationPending = false,
}: TUseUsersTableColumnsInput = {}): TAppTableColumn<TUserTableRow>[] {
  const { t } = useTranslation("translation", { keyPrefix: "modules.users.table" });

  return useMemo(
    () => [
      {
        key: "user",
        label: t("colUser"),
        render: (item) => (
          <div className="flex min-w-0 items-center gap-3">
            <UserAvatar name={item.name} imageUrl={item.profile_image} size="md" variant="photo" />
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
          const canToggleStatus =
            Boolean(canUpdate && onToggleUserStatus) &&
            !(isActive && (item.id === currentUserId || item.is_super_admin));

          return (
            <div className="flex items-center justify-end gap-1.5">
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
                    icon: <PiPencilThin className="size-4" aria-hidden />,
                    label: t("editUser", { name: item.name }),
                    onClick: onEditUser ? () => onEditUser(item) : undefined,
                  },
                  ...(canDelete && !isActive && onDeleteUser
                    ? [
                        {
                          key: "delete",
                          icon: <IoTrashOutline className="size-4" aria-hidden />,
                          label: t("deleteUser", { name: item.name }),
                          onClick: () => onDeleteUser(item),
                          className: "text-destructive hover:bg-destructive/10 hover:text-destructive",
                        },
                      ]
                    : []),
                ]}
              />
              {canToggleStatus ? (
                <ActiveInactiveToggle
                  checked={isActive}
                  disabled={isStatusMutationPending}
                  isLoading={isStatusPending}
                  ariaLabel={
                    isActive
                      ? t("deactivateUser", { name: item.name })
                      : t("activateUser", { name: item.name })
                  }
                  onCheckedChange={() => onToggleUserStatus?.(item)}
                />
              ) : null}
            </div>
          );
        },
      },
    ],
    [
      canDelete,
      canUpdate,
      currentUserId,
      isStatusMutationPending,
      onDeleteUser,
      onEditUser,
      onToggleUserStatus,
      onViewUser,
      statusActionPendingUserId,
      t,
    ],
  );
}
