"use client";

import { useEffect, useId, useState } from "react";
import { useTranslation } from "react-i18next";
import { IoCheckmark, IoChevronDown } from "react-icons/io5";

import { useSelectedProject } from "@/context/selected-project-context";
import { UserAvatar } from "@/components/ui/user-avatar";
import type { TProjectListItem } from "@/features/projects/projects.api";
import { formatProjectHostname } from "@/lib/frontend/projects/project-selector.utils";
import {
  elevatedCardMutedClass,
  elevatedCardSurfaceClass,
  elevatedCardTitleClass,
} from "@/lib/frontend/layout/dashboard-chrome";
import { cn } from "@/lib/utils";

function ProjectLogo({ project, size = "md" }: { project: TProjectListItem; size?: "sm" | "md" }) {
  return (
    <UserAvatar
      name={project.businessName}
      imageUrl={project.imageUrl}
      size={size === "sm" ? "sm" : "md"}
      roundedClassName="rounded-lg"
      className={size === "sm" ? "size-7" : "size-9"}
    />
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
      className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-start transition-colors hover:bg-bg-hover"
    >
      <ProjectLogo project={project} size="sm" />
      <span className="min-w-0 flex-1">
        <span className={cn("block truncate type-body", elevatedCardTitleClass)}>{project.businessName}</span>
        <span className={cn("block truncate type-caption-xs", elevatedCardMutedClass)}>
          {formatProjectHostname(project.websiteUrl)}
        </span>
      </span>
      {isSelected ? (
        <IoCheckmark className="size-4 shrink-0 text-brand" aria-hidden />
      ) : (
        <span className="size-4 shrink-0" aria-hidden />
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
      <div className="shrink-0 px-2 pb-3 pt-1">
        <div
          className="flex items-center justify-center rounded-xl px-1 py-1"
          title={selectedProject.businessName}
          aria-label={t("triggerLabel", { name: selectedProject.businessName })}
        >
          <ProjectLogo project={selectedProject} size="sm" />
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="shrink-0 px-3 pb-3 pt-1">
        <div className={cn(elevatedCardSurfaceClass, "rounded-xl px-2.5 py-2.5")}>
          <p className={cn("type-caption", elevatedCardMutedClass)}>{t("emptyLabel")}</p>
        </div>
      </div>
    );
  }

  if (!selectedProject) {
    return (
      <div className="shrink-0 px-3 pb-3 pt-1">
        <div
          className={cn(
            elevatedCardSurfaceClass,
            "overflow-hidden rounded-xl transition-[border-color] duration-200",
            open && "border-(--accent-border)",
          )}
        >
          <button
            type="button"
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-controls={listId}
            aria-label={t("selectPrompt")}
            onClick={() => setOpen((value) => !value)}
            className="flex w-full items-center gap-2.5 px-2.5 py-2 text-start transition-colors hover:bg-bg-hover/60"
          >
            <span className="min-w-0 flex-1">
              <span className={cn("block truncate type-body", elevatedCardMutedClass)}>{t("selectPrompt")}</span>
            </span>
            <IoChevronDown
              className={cn(
                "size-4 shrink-0 transition-transform duration-300 ease-out",
                elevatedCardMutedClass,
                open && "rotate-180",
              )}
              aria-hidden
            />
          </button>

          <div
            className={cn(
              "grid transition-[grid-template-rows] duration-300 ease-in-out",
              open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
            )}
          >
            <div className="min-h-0 overflow-hidden">
              <div
                id={listId}
                role="listbox"
                aria-label={t("listLabel")}
                className="border-t border-border px-1.5 pb-1.5 pt-1"
              >
                <p className={cn("px-2 pb-1 pt-1 type-caption-xs", elevatedCardMutedClass)}>{t("listHeading")}</p>
                <div className="flex flex-col gap-0.5">
                  {projects.map((project) => (
                    <ProjectOption
                      key={project.id}
                      project={project}
                      isSelected={false}
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

  return (
    <div className="shrink-0 px-3 pb-3 pt-1">
      <div
        className={cn(
          elevatedCardSurfaceClass,
          "overflow-hidden rounded-xl transition-[border-color] duration-200",
          open && "border-(--accent-border)",
        )}
      >
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          aria-label={t("triggerLabel", { name: selectedProject.businessName })}
          onClick={() => setOpen((value) => !value)}
          className="flex w-full items-center gap-2.5 px-2.5 py-2 text-start transition-colors hover:bg-bg-hover/60"
        >
          <ProjectLogo project={selectedProject} />
          <span className="min-w-0 flex-1">
            <span className={cn("block truncate type-body", elevatedCardTitleClass)}>{selectedProject.businessName}</span>
          </span>
          <IoChevronDown
            className={cn(
              "size-4 shrink-0 transition-transform duration-300 ease-out",
              elevatedCardMutedClass,
              open && "rotate-180",
            )}
            aria-hidden
          />
        </button>

        <div
          className={cn(
            "grid transition-[grid-template-rows] duration-300 ease-in-out",
            open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
          )}
        >
          <div className="min-h-0 overflow-hidden">
            <div
              id={listId}
              role="listbox"
              aria-label={t("listLabel")}
              className="border-t border-border px-1.5 pb-1.5 pt-1"
            >
              <p className={cn("px-2 pb-1 pt-1 type-caption-xs", elevatedCardMutedClass)}>{t("listHeading")}</p>
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
