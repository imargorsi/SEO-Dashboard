"use client";

import { useEffect, useId, useState } from "react";
import { useTranslation } from "react-i18next";
import { IoCheckmark, IoChevronDown } from "react-icons/io5";

import { useSelectedProject } from "@/context/selected-project-context";
import { UserAvatar } from "@/components/ui/user-avatar";
import type { TProjectListItem } from "@/features/projects/projects.api";
import { formatProjectHostname } from "@/lib/frontend/projects/project-selector.utils";
import {
  sidebarProjectSelectorClass,
  sidebarProjectSelectorOpenClass,
} from "@/lib/frontend/layout/dashboard-chrome";
import { cn } from "@/lib/utils";

function ProjectLogo({ project }: { project: TProjectListItem }) {
  return (
    <UserAvatar name={project.businessName} imageUrl={project.imageUrl} size="sm" variant="logo" />
  );
}

function ProjectOption({
  project,
  isSelected,
  onSelect,
}: {
  project: TProjectListItem;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={isSelected}
      onClick={onSelect}
      className="flex w-full items-center gap-2 rounded-full px-2.5 py-1.5 text-start transition-colors hover:bg-bg-hover"
    >
      <ProjectLogo project={project} />
      <span className="min-w-0 flex-1">
        <span className="block truncate type-label text-text-primary">{project.businessName}</span>
        <span className="block truncate type-caption-xs text-text-muted">
          {formatProjectHostname(project.websiteUrl)}
        </span>
      </span>
      {isSelected ? (
        <IoCheckmark className="size-3.5 shrink-0 text-brand" aria-hidden />
      ) : (
        <span className="size-3.5 shrink-0" aria-hidden />
      )}
    </button>
  );
}

type ProjectSelectorProps = {
  isCollapsed?: boolean;
};

export function ProjectSelector({ isCollapsed = false }: ProjectSelectorProps) {
  const { t } = useTranslation("translation", { keyPrefix: "projectSelector" });
  const { projects, selectedProject, setSelectedProjectId, isLoading } = useSelectedProject();
  const [open, setOpen] = useState(false);
  const listId = useId();

  useEffect(() => {
    if (isCollapsed) setOpen(false);
  }, [isCollapsed]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  if (isLoading) return null;

  if (isCollapsed) {
    if (!selectedProject) return null;

    return (
      <div className="shrink-0 px-2 pb-2 pt-0.5">
        <div
          className="flex items-center justify-center rounded-full px-1 py-1"
          title={selectedProject.businessName}
          aria-label={t("triggerLabel", { name: selectedProject.businessName })}
        >
          <ProjectLogo project={selectedProject} />
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="shrink-0 px-3 pb-2 pt-0.5">
        <div className={cn(sidebarProjectSelectorClass, "cursor-default")}>
          <p className="truncate type-caption text-text-muted">{t("emptyLabel")}</p>
        </div>
      </div>
    );
  }

  const triggerLabel = selectedProject
    ? t("triggerLabel", { name: selectedProject.businessName })
    : t("selectPrompt");

  return (
    <div className="relative shrink-0 px-3 pb-2 pt-0.5">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={triggerLabel}
        onClick={() => setOpen((value) => !value)}
        className={cn(sidebarProjectSelectorClass, open && sidebarProjectSelectorOpenClass)}
      >
        {selectedProject ? <ProjectLogo project={selectedProject} /> : null}
        <span className="min-w-0 flex-1 truncate text-start">
          {selectedProject ? selectedProject.businessName : t("selectPrompt")}
        </span>
        <IoChevronDown
          className={cn(
            "size-3.5 shrink-0 text-text-muted transition-transform duration-300 ease-out",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>

      <div
        className={cn(
          "absolute inset-x-3 z-20 mt-1.5 overflow-hidden rounded-2xl border border-border/60 bg-bg-card/90 shadow-sm backdrop-blur-md transition-[opacity,transform] duration-200 dark:border-text-on-brand/25 dark:bg-bg-card/95",
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-1 opacity-0",
        )}
      >
        <div id={listId} role="listbox" aria-label={t("listLabel")} className="max-h-64 overflow-y-auto p-1.5">
          <p className="px-2.5 pb-1 pt-0.5 type-caption-xs text-text-muted">{t("listHeading")}</p>
          <div className="flex flex-col gap-0.5">
            {projects.map((project) => (
              <ProjectOption
                key={project.id}
                project={project}
                isSelected={project.id === selectedProject?.id}
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
  );
}
