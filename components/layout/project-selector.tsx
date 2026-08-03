"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { IoCheckmark, IoChevronDown } from "react-icons/io5";

import { useSelectedProject } from "@/context/selected-project-context";
import { UserAvatar } from "@/components/ui/user-avatar";
import type { TProjectListItem } from "@/features/projects/projects.api";
import { formatProjectHostname } from "@/lib/frontend/projects/project-selector.utils";
import {
  sidebarProjectSelectorExpandClass,
  sidebarProjectSelectorListClass,
  sidebarProjectSelectorOptionClass,
  sidebarProjectSelectorShellClass,
  sidebarProjectSelectorShellOpenClass,
  sidebarProjectSelectorTriggerClass,
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
      className={cn(
        sidebarProjectSelectorOptionClass,
        isSelected
          ? "bg-brand/12 text-text-primary"
          : "text-text-primary hover:bg-bg-hover/45",
      )}
    >
      <ProjectLogo project={project} />
      <span className="flex min-w-0 flex-1 flex-col gap-1 text-start">
        <span className="truncate type-label leading-snug">{project.businessName}</span>
        <span className="truncate type-caption-xs leading-snug text-text-muted">
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
  const [prevIsCollapsed, setPrevIsCollapsed] = useState(isCollapsed);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  if (isCollapsed !== prevIsCollapsed) {
    setPrevIsCollapsed(isCollapsed);
    if (isCollapsed) setOpen(false);
  }

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    function onPointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (rootRef.current?.contains(target)) return;
      setOpen(false);
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  if (isLoading) return null;

  if (isCollapsed) {
    if (!selectedProject) return null;

    return (
      <div className="shrink-0 px-3 pb-3 pt-1">
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
      <div className="shrink-0 px-3 pb-3 pt-1">
        <div className={cn(sidebarProjectSelectorShellClass, "px-3 py-2.5")}>
          <p className="truncate type-caption text-text-muted">{t("emptyLabel")}</p>
        </div>
      </div>
    );
  }

  const triggerLabel = selectedProject
    ? t("triggerLabel", { name: selectedProject.businessName })
    : t("selectPrompt");

  function renderTriggerContent() {
    return (
      <>
        {selectedProject ? <ProjectLogo project={selectedProject} /> : null}
        <span className="min-w-0 flex-1 truncate text-start">
          {selectedProject ? selectedProject.businessName : t("selectPrompt")}
        </span>
        <IoChevronDown
          className={cn(
            "size-3.5 shrink-0 text-text-muted transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </>
    );
  }

  return (
    <div ref={rootRef} className="relative z-30 shrink-0 px-3 pb-3 pt-1">
      {/* Reserves closed height so expanding shell overlays nav instead of pushing it. */}
      <div className={cn(sidebarProjectSelectorShellClass, "invisible")} aria-hidden>
        <div className={sidebarProjectSelectorTriggerClass}>{renderTriggerContent()}</div>
      </div>

      <div
        className={cn(
          sidebarProjectSelectorShellClass,
          "absolute inset-x-3 top-1 z-40",
          open && sidebarProjectSelectorShellOpenClass,
        )}
      >
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          aria-label={triggerLabel}
          onClick={() => setOpen((value) => !value)}
          className={sidebarProjectSelectorTriggerClass}
        >
          {renderTriggerContent()}
        </button>

        <div
          className={cn(
            sidebarProjectSelectorExpandClass,
            open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
          )}
        >
          <div className="min-h-0 overflow-hidden">
            <div
              id={listId}
              role="listbox"
              aria-label={t("listLabel")}
              className="border-t border-border/50 dark:border-text-primary/15"
            >
              <p className="px-3 pb-2 pt-2.5 type-overline tracking-wide text-text-muted">
                {t("listHeading")}
              </p>
              <div className={sidebarProjectSelectorListClass}>
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
      </div>
    </div>
  );
}
