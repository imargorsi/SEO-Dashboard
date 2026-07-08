"use client";

import { useEffect, useId, useState } from "react";
import { useTranslation } from "react-i18next";
import { IoCheckmark, IoChevronDown } from "react-icons/io5";

import { useSelectedProject } from "@/context/selected-project-context";
import {
  formatProjectHostname,
  type WorkspaceProject,
} from "@/lib/dummy-data/workspace-projects";
import { cn } from "@/lib/utils";

function ProjectLogo({
  project,
  size = "md",
}: {
  project: Pick<WorkspaceProject, "logoLabel" | "logoGradientFrom" | "logoGradientTo">;
  size?: "sm" | "md";
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-lg font-semibold text-text-on-brand",
        size === "sm" ? "size-7 type-overline" : "size-9 type-caption-xs"
      )}
      style={{
        background: `linear-gradient(135deg, ${project.logoGradientFrom} 0%, ${project.logoGradientTo} 100%)`,
      }}
      aria-hidden
    >
      {project.logoLabel}
    </span>
  );
}

function ProjectOption({
  project,
  isSelected,
  onSelect,
}: {
  project: WorkspaceProject;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={isSelected}
      onClick={onSelect}
      className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-start transition-colors hover:bg-bg-hover"
    >
      <ProjectLogo project={project} size="sm" />
      <span className="min-w-0 flex-1">
        <span className="block truncate type-body text-text-primary">{project.name}</span>
        <span className="block truncate type-caption-xs text-text-muted">
          {formatProjectHostname(project.url)}
        </span>
      </span>
      {isSelected ? (
        <IoCheckmark className="size-4 shrink-0 text-brand-orange" aria-hidden />
      ) : (
        <span className="size-4 shrink-0" aria-hidden />
      )}
    </button>
  );
}

export function ProjectSelector() {
  const { t } = useTranslation("translation", { keyPrefix: "projectSelector" });
  const { projects, selectedProject, setSelectedProjectId } = useSelectedProject();
  const [open, setOpen] = useState(false);
  const listId = useId();

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <div className="shrink-0 px-3 pb-3 pt-1">
      <div
        className={cn(
          "overflow-hidden rounded-xl border border-border bg-bg-card transition-[border-color] duration-200",
          open && "border-(--accent-border)"
        )}
      >
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          aria-label={t("triggerLabel", { name: selectedProject.name })}
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center gap-2.5 px-2.5 py-2 text-start transition-colors hover:bg-bg-hover/60"
        >
          <ProjectLogo project={selectedProject} />
          <span className="min-w-0 flex-1">
            <span className="block truncate type-body text-text-primary">
              {selectedProject.name}
            </span>
          </span>
          <IoChevronDown
            className={cn(
              "size-4 shrink-0 text-text-muted transition-transform duration-300 ease-out",
              open && "rotate-180"
            )}
            aria-hidden
          />
        </button>

        <div
          className={cn(
            "grid transition-[grid-template-rows] duration-300 ease-in-out",
            open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          )}
        >
          <div className="min-h-0 overflow-hidden">
            <div
              id={listId}
              role="listbox"
              aria-label={t("listLabel")}
              className="border-t border-border px-1.5 pb-1.5 pt-1"
            >
              <p className="px-2 pb-1 pt-1 type-caption-xs text-text-muted">
                {t("listHeading")}
              </p>
              <div className="flex flex-col gap-0.5">
                {projects.map((project) => (
                  <ProjectOption
                    key={project.id}
                    project={project}
                    isSelected={project.id === selectedProject.id}
                    onSelect={() => {
                      setSelectedProjectId(project.id);
                      setOpen(false);
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
