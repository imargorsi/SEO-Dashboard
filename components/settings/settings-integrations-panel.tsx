"use client";

import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  IoLinkOutline,
  IoRefreshOutline,
  IoUnlinkOutline,
  IoWarningOutline,
} from "react-icons/io5";

import { AlertDialogCancel } from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSelectedProject } from "@/context/selected-project-context";
import {
  useAnalyticsOverviewQuery,
  useConnectGoogleIntegrationMutation,
  useDisconnectGoogleIntegrationMutation,
  useGooglePropertiesQuery,
  useSyncGoogleIntegrationsMutation,
} from "@/features/analytics/analytics.api";
import { ApiError } from "@/lib/frontend/api/errors";
import { notify } from "@/lib/frontend/feedback/notify";
import type { TGoogleIntegrationService } from "@/lib/integrations/constants";
import { defaultAnalyticsDateRange } from "@/lib/integrations/date.utils";
import { cn } from "@/lib/utils";
import type { TProjectIntegrationDto } from "@/types/analytics.types";

type TPendingAction =
  | { type: "connect" | "update"; service: TGoogleIntegrationService; propertyId: string }
  | { type: "disconnect"; service: TGoogleIntegrationService }
  | { type: "refresh" }
  | null;

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
        "inline-flex items-center rounded-md border px-2 py-0.5 type-caption-xs",
        status === "connected" && "border-brand/35 bg-brand/12 text-brand",
        status === "error" && "border-destructive/35 bg-destructive/12 text-destructive",
        status === "disconnected" && "border-border bg-bg-hover text-text-muted",
      )}
    >
      {label}
    </span>
  );
}

function ServiceCard({
  service,
  integration,
  propertyOptions,
  onRequestConnectOrUpdate,
  onRequestDisconnect,
  isBusy,
}: {
  service: TGoogleIntegrationService;
  integration: TProjectIntegrationDto | null | undefined;
  propertyOptions: Array<{ id: string; name: string }>;
  onRequestConnectOrUpdate: (propertyId: string, mode: "connect" | "update") => void;
  onRequestDisconnect: () => void;
  isBusy: boolean;
}) {
  const { t } = useTranslation("translation", { keyPrefix: "settings.integrations" });
  const [propertyId, setPropertyId] = useState(integration?.externalPropertyId ?? "");
  const status = resolveStatusKey(integration);
  const isLinked = status === "connected" || status === "error";

  return (
    <section className="space-y-4 rounded-2xl border border-border bg-bg-main p-5">
      <div className="space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
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

      <div className="space-y-2">
        <Label htmlFor={`settings-integration-${service}`}>{t("propertyLabel")}</Label>
        {propertyOptions.length > 0 ? (
          <select
            id={`settings-integration-${service}`}
            className="flex h-10 w-full rounded-xl border border-border bg-bg-input px-3 text-sm text-text-primary outline-none focus-visible:border-[var(--accent-border)] focus-visible:ring-2 focus-visible:ring-brand/25"
            value={propertyId}
            onChange={(event) => setPropertyId(event.target.value)}
            disabled={isBusy}
          >
            <option value="">{t("propertyPlaceholder")}</option>
            {propertyOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
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

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="gradient"
          size="md"
          disabled={isBusy}
          onClick={() => onRequestConnectOrUpdate(propertyId, isLinked ? "update" : "connect")}
        >
          <IoLinkOutline className="size-4" aria-hidden />
          {isLinked ? t("update") : t("connect")}
        </Button>
        {isLinked ? (
          <Button
            type="button"
            variant="outline"
            size="md"
            disabled={isBusy}
            onClick={onRequestDisconnect}
          >
            <IoUnlinkOutline className="size-4" aria-hidden />
            {t("disconnect")}
          </Button>
        ) : null}
      </div>
    </section>
  );
}

export function SettingsIntegrationsPanel() {
  const { t } = useTranslation("translation", { keyPrefix: "settings.integrations" });
  const { selectedProject } = useSelectedProject();
  const projectId = selectedProject?.id ?? null;
  const dateRange = useMemo(() => defaultAnalyticsDateRange(), []);

  const overviewQuery = useAnalyticsOverviewQuery(projectId, dateRange, {
    enabled: Boolean(projectId),
  });
  const propertiesQuery = useGooglePropertiesQuery(projectId, { enabled: Boolean(projectId) });
  const connectMutation = useConnectGoogleIntegrationMutation(projectId);
  const disconnectMutation = useDisconnectGoogleIntegrationMutation(projectId);
  const syncMutation = useSyncGoogleIntegrationsMutation(projectId);

  const gsc = overviewQuery.data?.integrations.gsc ?? null;
  const ga4 = overviewQuery.data?.integrations.ga4 ?? null;
  const [pending, setPending] = useState<TPendingAction>(null);

  const gscOptions = useMemo(
    () => (propertiesQuery.data ?? []).filter((item) => item.service === "gsc"),
    [propertiesQuery.data],
  );
  const ga4Options = useMemo(
    () => (propertiesQuery.data ?? []).filter((item) => item.service === "ga4"),
    [propertiesQuery.data],
  );

  const isBusy =
    connectMutation.isPending || disconnectMutation.isPending || syncMutation.isPending;

  function requestConnectOrUpdate(
    service: TGoogleIntegrationService,
    propertyId: string,
    mode: "connect" | "update",
  ) {
    const trimmed = propertyId.trim();
    if (!trimmed) {
      notify.error(t("propertyRequired"));
      return;
    }
    setPending({ type: mode, service, propertyId: trimmed });
  }

  async function runPending() {
    if (!pending || !projectId) return;

    try {
      if (pending.type === "refresh") {
        await syncMutation.mutateAsync();
        notify.success(t("syncSuccess"));
      } else if (pending.type === "disconnect") {
        await disconnectMutation.mutateAsync(pending.service);
        notify.success(t("disconnectSuccess"));
      } else {
        await connectMutation.mutateAsync({
          service: pending.service,
          externalPropertyId: pending.propertyId,
        });
        notify.success(pending.type === "update" ? t("updateSuccess") : t("connectSuccess"));
      }
      setPending(null);
    } catch (error) {
      const fallback =
        pending.type === "refresh"
          ? t("syncError")
          : pending.type === "disconnect"
            ? t("disconnectError")
            : pending.type === "update"
              ? t("updateError")
              : t("connectError");
      notify.error(error instanceof ApiError ? error.message : fallback);
    }
  }

  if (!projectId) {
    return (
      <EmptyState title={t("selectProjectTitle")} description={t("selectProjectBody")} />
    );
  }

  const confirmTitle =
    pending?.type === "refresh"
      ? t("confirmRefreshTitle")
      : pending?.type === "disconnect"
        ? t("confirmDisconnectTitle")
        : pending?.type === "update"
          ? t("confirmUpdateTitle")
          : t("confirmConnectTitle");

  const confirmBody =
    pending?.type === "refresh"
      ? t("confirmRefreshBody")
      : pending?.type === "disconnect"
        ? t("confirmDisconnectBody", {
            service: t(`services.${pending.service}`),
          })
        : pending?.type === "update"
          ? t("confirmUpdateBody", {
              service: t(`services.${pending.service}`),
            })
          : pending
            ? t("confirmConnectBody", {
                service: t(`services.${pending.service}`),
              })
            : "";

  const confirmLabel =
    pending?.type === "refresh"
      ? t("confirmRefresh")
      : pending?.type === "disconnect"
        ? t("confirmDisconnect")
        : pending?.type === "update"
          ? t("confirmUpdate")
          : t("confirmConnect");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="type-caption text-text-muted">
            {t("projectContext", { name: selectedProject?.businessName ?? "—" })}
          </p>
          <p className="type-caption max-w-2xl text-text-muted">{t("lead")}</p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="md"
          disabled={isBusy}
          onClick={() => setPending({ type: "refresh" })}
        >
          <IoRefreshOutline className="size-4" aria-hidden />
          {t("refresh")}
        </Button>
      </div>

      <div className="grid gap-4">
        <ServiceCard
          key={`gsc-${projectId}-${gsc?.externalPropertyId ?? "none"}-${gsc?.status ?? "out"}`}
          service="gsc"
          integration={gsc}
          propertyOptions={gscOptions}
          onRequestConnectOrUpdate={(propertyId, mode) =>
            requestConnectOrUpdate("gsc", propertyId, mode)
          }
          onRequestDisconnect={() => setPending({ type: "disconnect", service: "gsc" })}
          isBusy={isBusy}
        />
        <ServiceCard
          key={`ga4-${projectId}-${ga4?.externalPropertyId ?? "none"}-${ga4?.status ?? "out"}`}
          service="ga4"
          integration={ga4}
          propertyOptions={ga4Options}
          onRequestConnectOrUpdate={(propertyId, mode) =>
            requestConnectOrUpdate("ga4", propertyId, mode)
          }
          onRequestDisconnect={() => setPending({ type: "disconnect", service: "ga4" })}
          isBusy={isBusy}
        />
      </div>

      <ConfirmDialog
        open={Boolean(pending)}
        onOpenChange={(open) => !open && setPending(null)}
        icon={pending?.type === "disconnect" ? IoUnlinkOutline : IoWarningOutline}
        tone={pending?.type === "disconnect" ? "destructive" : "default"}
        title={confirmTitle}
        description={confirmBody}
        action={
          <>
            <AlertDialogCancel>{t("confirmCancel")}</AlertDialogCancel>
            <button
              type="button"
              className={cn(
                buttonVariants({
                  variant: pending?.type === "disconnect" ? "destructive" : "gradient",
                  size: "md",
                }),
              )}
              disabled={isBusy}
              onClick={() => void runPending()}
            >
              {confirmLabel}
            </button>
          </>
        }
      />
    </div>
  );
}
