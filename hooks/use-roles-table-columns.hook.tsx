"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { IoEyeOutline, IoPencil } from "react-icons/io5";

import type { TAppTableColumn } from "@/components/table/app-table";
import { TableRowIconActions } from "@/components/table/table-row-icon-actions";
import { Badge } from "@/components/ui/badge";
import { getBadgeToneClassName } from "@/lib/frontend/theme/status-colors";
import type { TAdminRoleListItem } from "@/types/admin-role.types";
import { cn } from "@/lib/utils";

export type TRoleTableRow = TAdminRoleListItem & Record<string, unknown>;

type TUseRolesTableColumnsInput = {
  onViewRole?: (roleId: string) => void;
  onEditRole?: (roleId: string) => void;
};

export function useRolesTableColumns({
  onViewRole,
  onEditRole,
}: TUseRolesTableColumnsInput = {}): TAppTableColumn<TRoleTableRow>[] {
  const { t } = useTranslation("translation", { keyPrefix: "modules.roles.table" });

  return useMemo(
    () => [
      {
        key: "role",
        label: t("colRole"),
        render: (item) => (
          <div className="min-w-0">
            <p className="truncate type-body-strong text-text-primary">{item.name}</p>
            <p className="truncate type-caption text-text-muted">{item.slug}</p>
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
        render: (item) => (
          <span className="type-body tabular-nums text-text-primary">{item.members_count}</span>
        ),
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
        key: "actions",
        label: t("colActions"),
        align: "end",
        render: (item) => (
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
            ]}
          />
        ),
      },
    ],
    [onEditRole, onViewRole, t],
  );
}
