"use client";

import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  analyticsHeadingStackClass,
  detailIconWellClass,
} from "@/lib/frontend/layout/dashboard-chrome";
import { roleActionIcon } from "@/lib/frontend/roles/permission-action-icon.utils";
import {
  actionLabelKey,
  capitalizeAction,
  modulePermission,
} from "@/lib/frontend/roles/permission-labels.utils";
import { permissionModuleIcon } from "@/lib/frontend/roles/permission-module-icon.utils";
import { cn } from "@/lib/utils";
import type { TPermissionModule } from "@/types/permission-catalog.types";

type TRolePermissionMatrixProps = {
  modules: TPermissionModule[];
  selected: string[];
  onChange: (permissions: string[]) => void;
  disabled?: boolean;
};

const panelHeaderClass = "flex h-14 items-center border-b border-border/50 px-4 sm:px-5";

export function RolePermissionMatrix({
  modules,
  selected,
  onChange,
  disabled = false,
}: TRolePermissionMatrixProps) {
  const { t } = useTranslation("translation", { keyPrefix: "modules.roles.createForm" });
  const { t: tActions } = useTranslation("translation", { keyPrefix: "modules.roles.actions" });
  const [selectedModuleSlug, setSelectedModuleSlug] = useState<string | null>(null);

  const activeModuleSlug =
    selectedModuleSlug && modules.some((module) => module.slug === selectedModuleSlug)
      ? selectedModuleSlug
      : (modules[0]?.slug ?? null);

  const selectedSet = useMemo(() => new Set(selected), [selected]);

  const activeModule = modules.find((module) => module.slug === activeModuleSlug) ?? null;

  const moduleSelectedCount = (module: TPermissionModule) =>
    module.actions.filter((action) => selectedSet.has(modulePermission(module.slug, action))).length;

  function togglePermission(permission: string, checked: boolean) {
    if (disabled) return;
    const next = new Set(selected);
    if (checked) {
      next.add(permission);
    } else {
      next.delete(permission);
    }
    onChange([...next]);
  }

  function toggleSelectAllForModule(module: TPermissionModule) {
    if (disabled) return;
    const modulePermissions = module.actions.map((action) => modulePermission(module.slug, action));
    const allSelected = modulePermissions.every((permission) => selectedSet.has(permission));
    const next = new Set(selected);

    if (allSelected) {
      modulePermissions.forEach((permission) => next.delete(permission));
    } else {
      modulePermissions.forEach((permission) => next.add(permission));
    }

    onChange([...next]);
  }

  if (!activeModule) return null;

  const activeModulePermissions = activeModule.actions.map((action) =>
    modulePermission(activeModule.slug, action),
  );
  const isAllSelected = activeModulePermissions.every((permission) => selectedSet.has(permission));
  const ActiveModuleIcon = permissionModuleIcon(activeModule.slug);

  return (
    <div
      className={cn(
        "grid min-h-80 gap-0 overflow-hidden rounded-3xl border border-border/40",
        "bg-bg-card/45 shadow-(--shadow-elevated) backdrop-blur-md",
        "lg:grid-cols-[240px_1fr]",
      )}
    >
      <aside className="border-b border-border/50 bg-bg-card/25 lg:border-b-0 lg:border-e lg:border-border/40">
        <div className={panelHeaderClass}>
          <h3 className="type-title text-text-primary">{t("permsModulesHeading")}</h3>
        </div>

        <nav
          className="themed-scrollbar flex gap-1.5 overflow-x-auto p-3 lg:max-h-[min(32rem,70svh)] lg:flex-col lg:overflow-y-auto"
          aria-label={t("permsHeading")}
        >
          {modules.map((module) => {
            const isActive = module.slug === activeModuleSlug;
            const count = moduleSelectedCount(module);
            const ModuleIcon = permissionModuleIcon(module.slug);

            return (
              <button
                key={module.slug}
                type="button"
                onClick={() => setSelectedModuleSlug(module.slug)}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex shrink-0 items-center gap-2.5 rounded-xl border px-3 py-2.5 text-start transition-colors lg:w-full lg:shrink",
                  isActive
                    ? "border-border/50 bg-bg-selected text-text-primary shadow-sm"
                    : "border-transparent text-text-secondary hover:border-border/40 hover:bg-bg-hover/60 hover:text-text-primary",
                )}
              >
                <ModuleIcon className="size-4 shrink-0" aria-hidden />
                <span className="min-w-0 flex-1 truncate type-body-strong">{module.label}</span>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2 py-0.5 type-caption-xs tabular-nums",
                    count > 0
                      ? "border border-brand/25 bg-brand/12 text-brand"
                      : "border border-border/40 text-text-muted",
                  )}
                >
                  {count}/{module.actions.length}
                </span>
              </button>
            );
          })}
        </nav>
      </aside>

      <div className="min-w-0">
        <div className={cn(panelHeaderClass, "justify-between gap-3")}>
          <div className="flex min-w-0 items-center gap-2.5">
            <span className={cn(detailIconWellClass, "size-8")} aria-hidden>
              <ActiveModuleIcon className="size-3.5" />
            </span>
            <h4 className="truncate type-title text-text-primary">{activeModule.label}</h4>
          </div>
          <Button
            type="button"
            variant="outline"
            size="xs"
            disabled={disabled}
            onClick={() => toggleSelectAllForModule(activeModule)}
            className="shrink-0"
          >
            {isAllSelected ? t("permsClearAll") : t("permsSelectAll")}
          </Button>
        </div>

        <div className="p-4 sm:p-5">
          <div className={cn(analyticsHeadingStackClass, "mb-4")}>
            <p className="type-caption text-text-muted">{t("permsModuleLead")}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {activeModule.actions.map((action) => {
              const permission = modulePermission(activeModule.slug, action);
              const checked = selectedSet.has(permission);
              const labelKey = actionLabelKey(action);
              const label = labelKey ? tActions(labelKey) : capitalizeAction(action);
              const ActionIcon = roleActionIcon(action);

              return (
                <label
                  key={permission}
                  className={cn(
                    "flex flex-col gap-3 rounded-2xl border p-3.5 transition-[border-color,background-color,box-shadow] duration-200",
                    checked
                      ? "border-brand/40 bg-brand/10 text-text-primary shadow-sm"
                      : "border-border/50 bg-bg-card/40 text-text-secondary",
                    disabled
                      ? "cursor-not-allowed opacity-60"
                      : "cursor-pointer hover:border-border hover:bg-bg-hover/50 hover:text-text-primary",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={cn(
                        detailIconWellClass,
                        "size-8",
                        checked && "border-brand/35 bg-brand/15 text-brand",
                      )}
                      aria-hidden
                    >
                      {ActionIcon ? <ActionIcon className="size-3.5" /> : null}
                    </span>
                    <Checkbox
                      checked={checked}
                      disabled={disabled}
                      onChange={(event) => togglePermission(permission, event.target.checked)}
                    />
                  </div>
                  <span className="type-label text-text-primary">{label}</span>
                </label>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
