"use client";

import type { ReactNode } from "react";
import {
  IoCallOutline,
  IoGlobeOutline,
  IoLocationOutline,
  IoMailOutline,
} from "react-icons/io5";
import { useTranslation } from "react-i18next";

import { Heading } from "@/components/heading";
import { ProjectStatusChip } from "@/components/projects/project-status-chip";
import { UserAvatar } from "@/components/ui/user-avatar";
import type { TProjectDetail } from "@/features/projects/projects.api";
import { displayDetailValue } from "@/lib/frontend/projects/project-detail-display.utils";
import {
  elevatedCardBodyClass,
  elevatedCardSurfaceClass,
  elevatedCardTitleClass,
} from "@/lib/frontend/layout/dashboard-chrome";
import { cn } from "@/lib/utils";

type ProjectDetailHeroProps = {
  project: TProjectDetail;
};

function ContactItem({
  icon,
  label,
  value,
  href,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <>
      <span className="text-text-muted" aria-hidden>
        {icon}
      </span>
      <span className="truncate">{value}</span>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "inline-flex min-w-0 max-w-full items-center gap-1.5 type-caption transition-colors hover:text-text-primary",
          elevatedCardBodyClass,
        )}
        aria-label={label}
      >
        {content}
      </a>
    );
  }

  return (
    <span className={cn("inline-flex min-w-0 max-w-full items-center gap-1.5 type-caption", elevatedCardBodyClass)}>
      {content}
    </span>
  );
}

export function ProjectDetailHero({ project }: ProjectDetailHeroProps) {
  const { t } = useTranslation("translation", { keyPrefix: "modules.projects.detail" });

  return (
    <section className={cn(elevatedCardSurfaceClass, "rounded-3xl p-3 sm:p-4")}>
      <div className="flex items-start gap-2.5 sm:gap-3">
        <UserAvatar
          name={project.businessName}
          imageUrl={project.logoImage}
          size="md"
          roundedClassName="rounded-xl"
          className="size-12 shrink-0"
        />

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <Heading sectionTitle className={cn("min-w-0 truncate", elevatedCardTitleClass)}>
              {project.businessName}
            </Heading>
            <ProjectStatusChip status={project.status} className="shrink-0" />
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 sm:flex-nowrap sm:gap-x-4">
            <ContactItem
              icon={<IoGlobeOutline className="size-3.5 shrink-0" />}
              label={t("website")}
              value={displayDetailValue(project.websiteUrl)}
              href={project.websiteUrl}
            />
            <ContactItem
              icon={<IoCallOutline className="size-3.5 shrink-0" />}
              label={t("contactNumber")}
              value={displayDetailValue(project.pocContactNumber)}
            />
            <ContactItem
              icon={<IoMailOutline className="size-3.5 shrink-0" />}
              label={t("contactEmail")}
              value={displayDetailValue(project.pocEmail)}
              href={project.pocEmail ? `mailto:${project.pocEmail}` : undefined}
            />
            <ContactItem
              icon={<IoLocationOutline className="size-3.5 shrink-0" />}
              label={t("address")}
              value={displayDetailValue(project.businessAddress)}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
