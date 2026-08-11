"use client";

import { useTranslation } from "react-i18next";
import type { IconType } from "react-icons";
import { SiGoogleanalytics, SiGooglesearchconsole } from "react-icons/si";

import { getStatusDotClassName } from "@/lib/frontend/theme/status-colors";
import type { TGoogleIntegrationService, TIntegrationStatus } from "@/lib/integrations/constants";
import { cn } from "@/lib/utils";
import type { TProjectListIntegrations } from "@/types/project.types";

const SERVICE_ICONS: Record<TGoogleIntegrationService, IconType> = {
  gsc: SiGooglesearchconsole,
  ga4: SiGoogleanalytics,
};

const SERVICES: TGoogleIntegrationService[] = ["gsc", "ga4"];

function resolveListStatus(status: TIntegrationStatus | undefined): TIntegrationStatus {
  if (status === "connected" || status === "error") return status;
  return "disconnected";
}

function statusDotTone(status: TIntegrationStatus): "active" | "rejected" | "inactive" {
  if (status === "connected") return "active";
  if (status === "error") return "rejected";
  return "inactive";
}

type TProjectIntegrationStatusIconsProps = {
  integrations: TProjectListIntegrations;
  className?: string;
};

/**
 * Compact GSC / GA4 connection indicators for project list.
 * Glass chips + brand icon + status dot (modern SaaS link-state pattern).
 */
export function ProjectIntegrationStatusIcons({
  integrations,
  className,
}: TProjectIntegrationStatusIconsProps) {
  const { t } = useTranslation("translation", { keyPrefix: "settings.integrations" });
  const { t: tList } = useTranslation("translation", {
    keyPrefix: "modules.projects.listIntegrations",
  });

  return (
    <div
      className={cn("inline-flex max-w-full items-center gap-1.5", className)}
      role="group"
      aria-label={tList("ariaLabel")}
    >
      {SERVICES.map((service) => {
        const status = resolveListStatus(integrations[service]);
        const isLinked = status === "connected" || status === "error";
        const Icon = SERVICE_ICONS[service];
        const serviceLabel = t(`services.${service}`);
        const statusLabel = t(`status.${status}`);
        const title = tList("tooltip", { service: serviceLabel, status: statusLabel });

        return (
          <span
            key={service}
            title={title}
            aria-label={title}
            className={cn(
              "inline-flex min-w-0 items-center gap-1.5 rounded-full border px-2.5 py-1 type-caption shadow-sm backdrop-blur-md transition-[background-color,opacity,color,border-color] duration-200",
              isLinked
                ? "border-brand/35 bg-brand/10 text-text-primary dark:border-brand/40 dark:bg-brand/14"
                : "border-border/70 bg-bg-card/40 text-text-muted opacity-80 dark:border-text-primary/30 dark:bg-text-primary/8",
              status === "error" &&
                "border-status-rejected/40 bg-status-rejected/10 text-text-primary dark:border-status-rejected/45 dark:bg-status-rejected/14",
            )}
          >
            <span className="relative inline-flex shrink-0">
              <Icon
                className={cn("size-3.5", isLinked ? "text-text-primary" : "text-text-muted")}
                aria-hidden
              />
              <span
                className={cn(
                  "absolute -bottom-0.5 -end-0.5 size-1.5 rounded-full ring-2 ring-bg-card dark:ring-bg-main",
                  getStatusDotClassName(statusDotTone(status)),
                  status === "disconnected" && "opacity-70",
                )}
                aria-hidden
              />
            </span>
            <span className="truncate">{tList(`short.${service}`)}</span>
          </span>
        );
      })}
    </div>
  );
}
