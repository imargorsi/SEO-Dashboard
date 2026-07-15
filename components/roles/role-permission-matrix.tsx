"use client";

import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { actionLabelKey, capitalizeAction, modulePermission } from "@/lib/frontend/roles/permission-labels.utils";
import { cn } from "@/lib/utils";
import type { TPermissionModule } from "@/types/permission-catalog.types";

type TRolePermissionMatrixProps = {
  modules: TPermissionModule[];
  selected: string[];
  onChange: (permissions: string[]) => void;
  disabled?: boolean;
};

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

  const activeModulePermissions = activeModule.actions.map((action) => modulePermission(activeModule.slug, action));
  const isAllSelected = activeModulePermissions.every((permission) => selectedSet.has(permission));

  return (
    <div className="grid gap-4 rounded-xl border border-border bg-bg-input/40 p-3 lg:grid-cols-[220px_1fr]">
      <nav className="flex gap-1.5 overflow-x-auto lg:flex-col lg:overflow-visible" aria-label={t("permsHeading")}>
        {modules.map((module) => {
          const isActive = module.slug === activeModuleSlug;
          const count = moduleSelectedCount(module);

          return (
            <button
              key={module.slug}
              type="button"
              onClick={() => setSelectedModuleSlug(module.slug)}
              aria-current={isActive}
              className={cn(
                "flex shrink-0 items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-start type-body-strong transition-colors lg:shrink",
                isActive
                  ? "bg-bg-selected text-text-primary"
                  : "text-text-secondary hover:bg-bg-hover hover:text-text-primary",
              )}
            >
              <span className="truncate">{module.label}</span>
              <span
                className={cn(
                  "shrink-0 rounded-full px-1.5 py-0.5 type-caption-xs tabular-nums",
                  count > 0 ? "bg-brand/15 text-brand" : "text-text-muted",
                )}
              >
                {count}/{module.actions.length}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="rounded-lg border border-border bg-bg-card p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h4 className="type-body-strong text-text-primary">{activeModule.label}</h4>
          <Button
            type="button"
            variant="outline"
            size="xs"
            disabled={disabled}
            onClick={() => toggleSelectAllForModule(activeModule)}
          >
            {isAllSelected ? t("permsClearAll") : t("permsSelectAll")}
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {activeModule.actions.map((action) => {
            const permission = modulePermission(activeModule.slug, action);
            const checked = selectedSet.has(permission);
            const labelKey = actionLabelKey(action);
            const label = labelKey ? tActions(labelKey) : capitalizeAction(action);

            return (
              <label
                key={permission}
                className={cn(
                  "flex items-center gap-2 rounded-lg border px-3 py-2.5 type-body transition-colors",
                  checked ? "border-brand/35 bg-brand/10 text-text-primary" : "border-border bg-bg-input",
                  disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:bg-bg-hover",
                )}
              >
                <Checkbox
                  checked={checked}
                  disabled={disabled}
                  onChange={(event) => togglePermission(permission, event.target.checked)}
                />
                {label}
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}
