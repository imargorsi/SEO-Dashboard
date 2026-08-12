"use client";

import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  elevatedCardSurfaceClass,
  settingsInsetDividerClass,
  tableGlassChipClass,
  typeStackMdClass,
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

/**
 * Single shell — module rail + permission pane side by side (matches Settings categories layout).
 */
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
        elevatedCardSurfaceClass,
        "flex min-h-80 flex-col overflow-hidden rounded-xl lg:flex-row",
      )}
    >
      <aside
        className={cn(
          "flex w-full shrink-0 flex-col border-b border-border/45 p-3",
          "bg-bg-card/30 sm:p-3.5 lg:w-52 lg:border-b-0 lg:border-e dark:border-text-primary/15 dark:bg-text-primary/3",
        )}
      >
        <nav
          className="themed-scrollbar flex gap-1 overflow-x-auto lg:max-h-[min(32rem,70svh)] lg:flex-col lg:overflow-y-auto"
          aria-label={t("permsModulesHeading")}
        >
          {modules.map((module, index) => {
            const isActive = module.slug === activeModuleSlug;
            const count = moduleSelectedCount(module);
            const ModuleIcon = permissionModuleIcon(module.slug);

            return (
              <div key={module.slug} className="flex shrink-0 flex-col lg:w-full lg:shrink">
                {index > 0 ? (
                  <div
                    className={cn(settingsInsetDividerClass, "my-1.5 hidden lg:block")}
                    aria-hidden
                  />
                ) : null}
                <button
                  type="button"
                  onClick={() => setSelectedModuleSlug(module.slug)}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-start type-label transition-colors",
                    isActive
                      ? "bg-bg-selected text-text-primary shadow-sm"
                      : "text-text-secondary hover:bg-bg-hover/55 hover:text-text-primary",
                  )}
                >
                  <ModuleIcon
                    className={cn(
                      "size-4 shrink-0",
                      isActive ? "text-brand" : "text-text-muted",
                    )}
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1 truncate">{module.label}</span>
                  <span
                    className={cn(
                      tableGlassChipClass,
                      "px-1.5 py-0.5 type-caption-xs",
                      count > 0 ? "border-brand/45 text-brand" : "text-text-muted",
                    )}
                  >
                    {count}/{module.actions.length}
                  </span>
                </button>
              </div>
            );
          })}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex shrink-0 flex-col gap-3 px-4 pt-3 sm:px-5 sm:pt-3.5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <ActiveModuleIcon className="size-4 shrink-0 text-brand" aria-hidden />
              <h3 className="truncate type-title text-text-primary">{activeModule.label}</h3>
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
          <div className={settingsInsetDividerClass} aria-hidden />
        </header>

        <div className="min-w-0 flex-1 px-4 py-4 sm:px-5 sm:py-5">
          <div className={cn(typeStackMdClass, "mb-4")}>
            <p className="type-caption text-text-muted">{t("permsModuleLead")}</p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
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
                    "flex flex-col gap-2.5 rounded-xl border px-3 py-2.5 transition-[border-color,background-color] duration-200",
                    checked
                      ? "border-brand/45 bg-bg-selected/40 text-text-primary"
                      : "border-border/70 bg-transparent text-text-secondary dark:border-text-primary/30",
                    disabled
                      ? "cursor-not-allowed opacity-60"
                      : "cursor-pointer hover:border-border hover:text-text-primary dark:hover:border-text-primary/45",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={cn(
                        "inline-flex size-7 shrink-0 items-center justify-center rounded-lg border text-text-muted",
                        checked
                          ? "border-brand/35 bg-brand/15 text-brand"
                          : "border-border/60 bg-bg-card/40 dark:border-text-primary/40 dark:bg-transparent",
                      )}
                      aria-hidden
                    >
                      {ActionIcon ? <ActionIcon className="size-3.5" /> : null}
                    </span>
                    <Checkbox
                      checked={checked}
                      disabled={disabled}
                      onChange={(event) => togglePermission(permission, event.target.checked)}
                      className="dark:border-text-primary/45"
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
