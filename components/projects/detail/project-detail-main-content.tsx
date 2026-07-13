"use client";

import { useTranslation } from "react-i18next";
import { IoCheckmarkCircle } from "react-icons/io5";

import {
  ProjectDetailField,
  ProjectDetailInfoCard,
  ProjectDetailTagList,
} from "@/components/projects/detail/project-detail-info-card";
import type { TProjectDetail } from "@/features/projects/projects.api";
import { SEO_GOALS } from "@/lib/projects/constants";
import {
  displayDetailValue,
  formatBusinessHours,
} from "@/lib/frontend/projects/project-detail-display.utils";
import { SEO_GOAL_ICONS } from "@/lib/frontend/projects/seo-goal-icons";
import {
  elevatedCardBodyClass,
  elevatedCardMutedClass,
  elevatedCardTitleClass,
} from "@/lib/frontend/layout/dashboard-chrome";
import { cn } from "@/lib/utils";

type ProjectDetailMainContentProps = {
  project: TProjectDetail;
};

export function ProjectDetailMainContent({ project }: ProjectDetailMainContentProps) {
  const { t: tForm } = useTranslation("translation", { keyPrefix: "modules.projects.createForm" });
  const { t: tSeoGoals } = useTranslation("translation", { keyPrefix: "modules.projects.seoGoals" });
  const { t: tDetail } = useTranslation("translation", { keyPrefix: "modules.projects.detail" });

  const selectedGoals = new Set(project.seoGoals);

  return (
    <div className="space-y-4">
      <ProjectDetailInfoCard title={tDetail("sectionBusinessTitle")} lead={tDetail("sectionBusinessLead")}>
        <div className="grid gap-5 sm:grid-cols-2">
          <ProjectDetailField label={tForm("websiteUrl")} value={displayDetailValue(project.websiteUrl)} />
          <ProjectDetailField label={tForm("businessAddress")} value={displayDetailValue(project.businessAddress)} />
          <ProjectDetailField label={tForm("pocContactNumber")} value={displayDetailValue(project.pocContactNumber)} />
          <ProjectDetailField label={tForm("pocEmail")} value={displayDetailValue(project.pocEmail)} />
          <ProjectDetailField
            label={tForm("primaryServiceToPromote")}
            value={displayDetailValue(project.primaryServiceToPromote)}
          />
          <ProjectDetailField
            label={tDetail("businessHours")}
            value={formatBusinessHours(project.businessHours, tDetail("noValue"))}
          />
        </div>
      </ProjectDetailInfoCard>

      <ProjectDetailInfoCard title={tDetail("sectionServicesTitle")} lead={tDetail("sectionServicesLead")}>
        <ProjectDetailTagList items={project.servicesOffered} emptyLabel={tDetail("noServices")} />
      </ProjectDetailInfoCard>

      <ProjectDetailInfoCard title={tDetail("sectionSeoGoalsTitle")} lead={tDetail("sectionSeoGoalsLead")}>
        {project.seoGoals.length === 0 ? (
          <p className={cn("type-body", elevatedCardMutedClass)}>{tDetail("noSeoGoals")}</p>
        ) : (
          <ul className="space-y-2">
            {SEO_GOALS.filter((goal) => selectedGoals.has(goal)).map((goal) => {
              const Icon = SEO_GOAL_ICONS[goal];
              const label = tSeoGoals(goal);

              return (
                <li
                  key={goal}
                  className="flex items-center gap-3 rounded-xl border border-border bg-bg-input px-4 py-3"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand/15 text-brand">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <span className={cn("type-body-strong", elevatedCardTitleClass)}>{label}</span>
                  <IoCheckmarkCircle className="ms-auto size-5 shrink-0 text-status-active" aria-hidden />
                </li>
              );
            })}
          </ul>
        )}
      </ProjectDetailInfoCard>

      <ProjectDetailInfoCard title={tDetail("sectionIcpTitle")} lead={tDetail("sectionIcpLead")}>
        <p className={cn("type-body leading-relaxed", elevatedCardBodyClass)}>
          {displayDetailValue(project.idealCustomerProfile, tDetail("noValue"))}
        </p>
      </ProjectDetailInfoCard>
    </div>
  );
}
