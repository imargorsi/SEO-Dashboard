"use client";

import { Icons } from "@/lib/frontend/icons/app-icons";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { AccountSourceBadge } from "@/components/users/account-source-badge";
import type { TAppTableColumn } from "@/components/table/app-table";
import { TableRowIconActions } from "@/components/table/table-row-icon-actions";
import { ActiveInactiveToggle } from "@/components/ui/active-inactive-toggle";
import { StatusChip } from "@/components/ui/status-chip";
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
        headerIcon: Icons.user,
        render: (item) => (
          <div className="flex min-w-0 items-center gap-3">
            <UserAvatar name={item.name} imageUrl={item.profile_image} size="md" variant="photo" />
            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-2">
                <p className="truncate type-body-strong text-text-primary">{item.name}</p>
                <AccountSourceBadge source={item.account_source} />
              </div>
              <p className="truncate type-caption text-text-muted">{item.email}</p>
            </div>
          </div>
        ),
      },
      {
        key: "projects",
        label: t("colProjects"),
        headerIcon: Icons.folderOpen,
        render: (item) => {
          const count = item.projects.length;

          return (
            <span className="inline-flex items-baseline gap-1.5 type-body text-text-primary">
              <span className="tabular-nums">{count}</span>
              <span>{t("projectsLabel", { count })}</span>
            </span>
          );
        },
      },
      {
        key: "status",
        label: t("colStatus"),
        headerIcon: Icons.checkCircle,
        render: (item) => {
          const status = isActiveUserStatus(item.status) ? "active" : "inactive";

          return (
            <StatusChip
              colorKey={status}
              label={status === "active" ? t("statusActive") : t("statusInactive")}
            />
          );
        },
      },
      {
        key: "lastAction",
        label: t("colLastAction"),
        headerIcon: Icons.clock,
        render: (item) => {
          const isVerified = Boolean(item.email_verified_at);
          const lastActionAt = isVerified ? item.updated_at : item.created_at;

          return (
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                {isVerified ? (
                  <Icons.checkCircle className="size-4 shrink-0 text-status-active" aria-hidden />
                ) : (
                  <Icons.clock className="size-4 shrink-0 text-text-muted" aria-hidden />
                )}
                <p className="type-body text-text-primary">
                  {isVerified ? t("lastActionVerified") : t("lastActionCreated")}
                </p>
              </div>
              <p className="type-caption text-text-muted ps-6">{formatLastActionTime(lastActionAt)}</p>
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
                    icon: <Icons.view className="size-4" aria-hidden />,
                    label: t("viewUser", { name: item.name }),
                    onClick: onViewUser ? () => onViewUser(item) : undefined,
                  },
                  {
                    key: "edit",
                    icon: <Icons.pencil className="size-4" aria-hidden />,
                    label: t("editUser", { name: item.name }),
                    onClick: onEditUser ? () => onEditUser(item) : undefined,
                  },
                  ...(canDelete && !isActive && onDeleteUser
                    ? [
                        {
                          key: "delete",
                          icon: <Icons.delete className="size-4" aria-hidden />,
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
