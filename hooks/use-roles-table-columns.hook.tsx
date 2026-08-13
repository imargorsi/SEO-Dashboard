"use client";

import { Icons } from "@/lib/frontend/icons/app-icons";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import type { TAppTableColumn } from "@/components/table/app-table";
import { TableRowIconActions } from "@/components/table/table-row-icon-actions";
import { ActiveInactiveToggle } from "@/components/ui/active-inactive-toggle";
import { Badge } from "@/components/ui/badge";
import { StatusChip } from "@/components/ui/status-chip";
import { tableGlassChipClass } from "@/lib/frontend/layout/dashboard-chrome";
import { roleActionIcon } from "@/lib/frontend/roles/permission-action-icon.utils";
import { getBadgeToneClassName } from "@/lib/frontend/theme/status-colors";
import { isActiveRoleStatus } from "@/lib/roles/constants";
import type { TAdminRoleListItem } from "@/types/admin-role.types";
import { cn } from "@/lib/utils";

export type TRoleTableRow = TAdminRoleListItem & Record<string, unknown>;

type TUseRolesTableColumnsInput = {
  onViewRole?: (roleId: string) => void;
  onEditRole?: (roleId: string) => void;
  onToggleRoleStatus?: (role: TAdminRoleListItem) => void;
  onDeleteRole?: (role: TAdminRoleListItem) => void;
  canUpdate?: boolean;
  canDelete?: boolean;
  statusActionPendingRoleId?: string | null;
  isStatusMutationPending?: boolean;
};

function RoleActionGlyph({ action }: { action: string }) {
  const Icon = roleActionIcon(action);
  if (!Icon) return null;
  return <Icon className="size-4" aria-hidden />;
}

export function useRolesTableColumns({
  onViewRole,
  onEditRole,
  onToggleRoleStatus,
  onDeleteRole,
  canUpdate = false,
  canDelete = false,
  statusActionPendingRoleId = null,
  isStatusMutationPending = false,
}: TUseRolesTableColumnsInput = {}): TAppTableColumn<TRoleTableRow>[] {
  const { t } = useTranslation("translation", { keyPrefix: "modules.roles.table" });

  return useMemo(
    () => [
      {
        key: "role",
        label: t("colRole"),
        headerIcon: Icons.security,
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
        headerIcon: Icons.key,
        render: (item) => (
          <span className={tableGlassChipClass}>
            {t("permissionsCount", { count: item.permissions_count })}
          </span>
        ),
      },
      {
        key: "members",
        label: t("colMembers"),
        headerIcon: Icons.userGroup,
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
        headerIcon: Icons.checkCircle,
        render: (item) => {
          const status = isActiveRoleStatus(item.status) ? "active" : "inactive";

          return (
            <StatusChip
              colorKey={status}
              label={status === "active" ? t("statusActive") : t("statusInactive")}
            />
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
          const canToggleStatus =
            Boolean(canUpdate && onToggleRoleStatus) &&
            !item.is_system &&
            !(isActive && item.members_count > 0);

          return (
            <div className="flex items-center justify-end gap-1.5">
              <TableRowIconActions
                actions={[
                  {
                    key: "view",
                    icon: <RoleActionGlyph action="view" />,
                    label: t("viewRole", { name: item.name }),
                    onClick: onViewRole ? () => onViewRole(item.id) : undefined,
                  },
                  {
                    key: "edit",
                    icon: <RoleActionGlyph action="edit" />,
                    label: t("editRole", { name: item.name }),
                    onClick: onEditRole ? () => onEditRole(item.id) : undefined,
                  },
                  ...(canDelete && !isActive && !item.is_system && onDeleteRole
                    ? [
                        {
                          key: "delete",
                          icon: <RoleActionGlyph action="delete" />,
                          label: t("deleteRole", { name: item.name }),
                          onClick: () => onDeleteRole(item),
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
                      ? t("deactivateRole", { name: item.name })
                      : t("activateRole", { name: item.name })
                  }
                  onCheckedChange={() => onToggleRoleStatus?.(item)}
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
      isStatusMutationPending,
      onDeleteRole,
      onEditRole,
      onToggleRoleStatus,
      onViewRole,
      statusActionPendingRoleId,
      t,
    ],
  );
}
