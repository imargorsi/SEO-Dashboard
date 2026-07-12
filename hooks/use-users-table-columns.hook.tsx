"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { IoEyeOutline, IoPencil } from "react-icons/io5";

import type { TAppTableColumn } from "@/components/table/app-table";
import { TableRowIconActions } from "@/components/table/table-row-icon-actions";
import { UserRoleBadge } from "@/components/users/user-role-badge";
import { UserStatusIndicator, getUserStatusFromVerified } from "@/components/users/user-status-indicator";
import { UserAvatar } from "@/components/ui/user-avatar";
import { formatLastActionTime } from "@/lib/frontend/date/format-relative-date.utils";
import type { TAdminUserListItem } from "@/types/admin-user.types";

export type TUserTableRow = TAdminUserListItem & Record<string, unknown>;

type TUseUsersTableColumnsInput = {
  onViewUser?: (userId: string) => void;
  onEditUser?: (userId: string) => void;
};

export function useUsersTableColumns({
  onViewUser,
  onEditUser,
}: TUseUsersTableColumnsInput = {}): TAppTableColumn<TUserTableRow>[] {
  const { t } = useTranslation("translation", { keyPrefix: "modules.users.table" });

  return useMemo(
    () => [
      {
        key: "user",
        label: t("colUser"),
        render: (item) => (
          <div className="flex min-w-0 items-center gap-3">
            <UserAvatar name={item.name} size="md" roundedClassName="rounded-full" />
            <div className="min-w-0">
              <p className="truncate type-body-strong text-text-primary">{item.name}</p>
              <p className="truncate type-caption text-text-muted">{item.email}</p>
            </div>
          </div>
        ),
      },
      {
        key: "roles",
        label: t("colRole"),
        render: (item) => (
          <div className="flex flex-wrap gap-1.5">
            {item.roles.length > 0 ? (
              item.roles.map((role) => <UserRoleBadge key={role} role={role} />)
            ) : (
              <span className="type-caption text-text-muted">{t("noRoles")}</span>
            )}
          </div>
        ),
      },
      {
        key: "status",
        label: t("colStatus"),
        render: (item) => {
          const isVerified = Boolean(item.email_verified_at);
          const status = getUserStatusFromVerified(isVerified);

          return (
            <UserStatusIndicator
              status={status}
              label={status === "active" ? t("statusActive") : t("statusInvited")}
            />
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
        render: (item) => (
          <TableRowIconActions
            actions={[
              {
                key: "view",
                icon: <IoEyeOutline className="size-4" aria-hidden />,
                label: t("viewUser", { name: item.name }),
                onClick: onViewUser ? () => onViewUser(item.id) : undefined,
              },
              {
                key: "edit",
                icon: <IoPencil className="size-4" aria-hidden />,
                label: t("editUser", { name: item.name }),
                onClick: onEditUser ? () => onEditUser(item.id) : undefined,
              },
            ]}
          />
        ),
      },
    ],
    [onEditUser, onViewUser, t],
  );
}
