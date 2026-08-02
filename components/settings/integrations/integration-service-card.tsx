"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { IconType } from "react-icons";
import { IoLinkOutline, IoUnlinkOutline } from "react-icons/io5";
import { SiGoogleanalytics, SiGooglesearchconsole } from "react-icons/si";

import { IntegrationPropertySelect } from "@/components/settings/integrations/integration-property-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  analyticsHeadingStackClass,
  analyticsPanelClass,
  elevatedCardSurfaceClass,
} from "@/lib/frontend/layout/dashboard-chrome";
import { getStatusChipClassName } from "@/lib/frontend/theme/status-colors";
import type { TGoogleIntegrationService } from "@/lib/integrations/constants";
import { cn } from "@/lib/utils";
import type { TProjectIntegrationDto } from "@/types/analytics.types";

const SERVICE_ICONS: Record<TGoogleIntegrationService, IconType> = {
  gsc: SiGooglesearchconsole,
  ga4: SiGoogleanalytics,
};

function resolveStatusKey(
  integration: TProjectIntegrationDto | null | undefined,
): "disconnected" | "error" | "connected" {
  if (!integration || integration.status === "disconnected") return "disconnected";
  if (integration.status === "error") return "error";
  return "connected";
}

function StatusPill({
  status,
  label,
}: {
  status: "disconnected" | "error" | "connected";
  label: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 type-caption-xs font-medium",
        status === "connected" && getStatusChipClassName("active"),
        status === "error" && getStatusChipClassName("rejected"),
        status === "disconnected" && getStatusChipClassName("inactive"),
      )}
    >
      {label}
    </span>
  );
}

type TIntegrationServiceCardProps = {
  service: TGoogleIntegrationService;
  integration: TProjectIntegrationDto | null | undefined;
  propertyOptions: Array<{ id: string; name: string }>;
  onRequestConnectOrUpdate: (propertyId: string, mode: "connect" | "update") => void;
  onRequestDisconnect: () => void;
  isBusy: boolean;
};

export function IntegrationServiceCard({
  service,
  integration,
  propertyOptions,
  onRequestConnectOrUpdate,
  onRequestDisconnect,
  isBusy,
}: TIntegrationServiceCardProps) {
  const { t } = useTranslation("translation", { keyPrefix: "settings.integrations" });
  const [propertyId, setPropertyId] = useState(integration?.externalPropertyId ?? "");
  const [selectOpen, setSelectOpen] = useState(false);
  const status = resolveStatusKey(integration);
  const isLinked = status === "connected" || status === "error";
  const ServiceIcon = SERVICE_ICONS[service];

  return (
    <section
      className={cn(
        elevatedCardSurfaceClass,
        analyticsPanelClass,
        "h-full border-border/40 bg-bg-card/40",
        selectOpen && "relative z-30",
      )}
    >
      <div className="flex flex-col gap-5">
        <div className={analyticsHeadingStackClass}>
          <div className="flex flex-wrap items-center gap-2.5">
            <span
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl border border-border/50 bg-bg-card/60 text-text-primary shadow-sm"
              aria-hidden
            >
              <ServiceIcon className="size-5" />
            </span>
            <h3 className="type-title text-text-primary">{t(`services.${service}`)}</h3>
            <StatusPill status={status} label={t(`status.${status}`)} />
          </div>
          <p className="type-caption text-text-muted">{t(`serviceLead.${service}`)}</p>
          {integration?.lastSyncedAt ? (
            <p className="type-caption text-text-muted">
              {t("lastSynced", { value: new Date(integration.lastSyncedAt).toLocaleString() })}
            </p>
          ) : null}
          {integration?.lastError ? (
            <p className="type-caption text-destructive">{integration.lastError}</p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
          <div className="min-w-0 flex-1">
            {propertyOptions.length > 0 ? (
              <IntegrationPropertySelect
                id={`settings-integration-${service}`}
                value={propertyId}
                options={propertyOptions}
                placeholder={t("propertyPlaceholder")}
                disabled={isBusy}
                onChange={setPropertyId}
                onOpenChange={setSelectOpen}
              />
            ) : (
              <Input
                id={`settings-integration-${service}`}
                value={propertyId}
                onChange={(event) => setPropertyId(event.target.value)}
                disabled={isBusy}
                placeholder={
                  service === "gsc" ? t("gscPropertyPlaceholder") : t("ga4PropertyPlaceholder")
                }
              />
            )}
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="gradient"
              size="md"
              disabled={isBusy}
              onClick={() =>
                onRequestConnectOrUpdate(propertyId, isLinked ? "update" : "connect")
              }
            >
              <IoLinkOutline className="size-4" aria-hidden />
              {isLinked ? t("update") : t("connect")}
            </Button>
            {isLinked ? (
              <Button
                type="button"
                variant="outlined"
                size="md"
                disabled={isBusy}
                onClick={onRequestDisconnect}
              >
                <IoUnlinkOutline className="size-4" aria-hidden />
                {t("disconnect")}
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
