"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { IoEyeOutline, IoPauseCircleOutline, IoPencil, IoPlayCircleOutline } from "react-icons/io5";

import type { TAppTableColumn } from "@/components/table/app-table";
import { TableRowIconActions } from "@/components/table/table-row-icon-actions";
import { Badge } from "@/components/ui/badge";
import { StatusIndicator } from "@/components/ui/status-indicator";
import { getBadgeToneClassName } from "@/lib/frontend/theme/status-colors";
import { isActiveRoleStatus } from "@/lib/roles/constants";
import type { TAdminRoleListItem } from "@/types/admin-role.types";
import { cn } from "@/lib/utils";

export type TRoleTableRow = TAdminRoleListItem & Record<string, unknown>;

type TUseRolesTableColumnsInput = {
  onViewRole?: (roleId: string) => void;
  onEditRole?: (roleId: string) => void;
  onToggleRoleStatus?: (role: TAdminRoleListItem) => void;
  canUpdate?: boolean;
  statusActionPendingRoleId?: string | null;
};

export function useRolesTableColumns({
  onViewRole,
  onEditRole,
  onToggleRoleStatus,
  canUpdate = false,
  statusActionPendingRoleId = null,
}: TUseRolesTableColumnsInput = {}): TAppTableColumn<TRoleTableRow>[] {
  const { t } = useTranslation("translation", { keyPrefix: "modules.roles.table" });

  return useMemo(
    () => [
      {
        key: "role",
        label: t("colRole"),
        render: (item) => (
          <div className="min-w-0">
            <p className="type-body-strong text-text-primary truncate">{item.name}</p>
            <p className="type-caption text-text-muted truncate">{item.slug}</p>
          </div>
        ),
      },
      {
        key: "permissions",
        label: t("colPermissions"),
        render: (item) => (
          <Badge variant="outline" className="type-caption-xs tabular-nums">
            {t("permissionsCount", { count: item.permissions_count })}
          </Badge>
        ),
      },
      {
        key: "members",
        label: t("colMembers"),
        render: (item) => <span className="type-body text-text-primary tabular-nums">{item.members_count}</span>,
      },
      {
        key: "system",
        label: t("colSystem"),
        render: (item) =>
          item.is_system ? (
            <Badge variant="outline" className={cn(getBadgeToneClassName("warning"), "type-caption-xs")}>
              {t("systemYes")}
            </Badge>
          ) : (
            <span className="type-caption text-text-muted">{t("systemNo")}</span>
          ),
      },
      {
        key: "status",
        label: t("colStatus"),
        render: (item) => {
          const status = isActiveRoleStatus(item.status) ? "active" : "inactive";

          return (
            <StatusIndicator status={status} label={status === "active" ? t("statusActive") : t("statusInactive")} />
          );
        },
      },
      {
        key: "actions",
        label: t("colActions"),
        align: "end",
        render: (item) => {
          const isActive = isActiveRoleStatus(item.status);
          const isStatusPending = statusActionPendingRoleId === item.id;

          return (
            <TableRowIconActions
              actions={[
                {
                  key: "view",
                  icon: <IoEyeOutline className="size-4" aria-hidden />,
                  label: t("viewRole", { name: item.name }),
                  onClick: onViewRole ? () => onViewRole(item.id) : undefined,
                },
                {
                  key: "edit",
                  icon: <IoPencil className="size-4" aria-hidden />,
                  label: t("editRole", { name: item.name }),
                  onClick: onEditRole ? () => onEditRole(item.id) : undefined,
                },
                ...(canUpdate && onToggleRoleStatus
                  ? [
                      {
                        key: isActive ? "deactivate" : "activate",
                        icon: isActive ? (
                          <IoPauseCircleOutline className="size-4" aria-hidden />
                        ) : (
                          <IoPlayCircleOutline className="size-4" aria-hidden />
                        ),
                        label: isActive
                          ? t("deactivateRole", { name: item.name })
                          : t("activateRole", { name: item.name }),
                        onClick: () => onToggleRoleStatus(item),
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
    [canUpdate, onEditRole, onToggleRoleStatus, onViewRole, statusActionPendingRoleId, t]
  );
}
