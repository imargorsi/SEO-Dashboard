"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { IoCopyOutline, IoCreateOutline, IoWarningOutline } from "react-icons/io5";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useSyncSeoActivitiesMutation,
  useUpdateSeoActivitiesSheetMutation,
  type TSeoActivitiesSheetSource,
} from "@/features/seo-activities/seo-activities.api";
import { useSeoActivitiesSyncCooldown } from "@/hooks/use-seo-activities-sync-cooldown.hook";
import { ApiError } from "@/lib/frontend/api/errors";
import { notify } from "@/lib/frontend/feedback/notify";
import { formatSeoActivitySyncCooldownMinutes } from "@/lib/frontend/seo-activities/sync-cooldown.utils";
import { cn } from "@/lib/utils";

type TSeoActivitiesSheetSyncCardProps = {
  sheet: TSeoActivitiesSheetSource;
};

const controlHeightClass = "h-10";

export function SeoActivitiesSheetSyncCard({ sheet }: TSeoActivitiesSheetSyncCardProps) {
  const { t } = useTranslation("translation", { keyPrefix: "settings.seoActivities" });
  const syncCooldown = useSeoActivitiesSyncCooldown();
  const syncMutation = useSyncSeoActivitiesMutation();
  const updateMutation = useUpdateSeoActivitiesSheetMutation();

  /** Null when not editing — readonly view always follows server `sheet.spreadsheetUrl`. */
  const [editDraft, setEditDraft] = useState<string | null>(null);
  const isEditing = editDraft !== null;

  const cooldownMinutes = formatSeoActivitySyncCooldownMinutes(syncCooldown.remainingMs);
  const isServerBusy = sheet.status === "running";
  const isSyncDisabled =
    syncMutation.isPending ||
    syncCooldown.isOnCooldown ||
    isEditing ||
    updateMutation.isPending ||
    isServerBusy;

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(sheet.spreadsheetUrl);
      notify.success(t("copySuccess"));
    } catch {
      notify.error(t("copyError"));
    }
  }

  async function onSaveUrl() {
    if (editDraft == null) return;

    try {
      const result = await updateMutation.mutateAsync(editDraft.trim());
      notify.success(result.message?.trim() || t("urlSaveSuccess"));
      setEditDraft(null);
    } catch (error) {
      notify.error(ApiError.messageFrom(error, t("urlSaveError")));
    }
  }

  async function onSync() {
    if (isServerBusy) {
      notify.error(t("sync.running"));
      return;
    }

    if (!syncCooldown.canSync()) {
      notify.error(
        t("sync.cooldownActive", {
          minutes: formatSeoActivitySyncCooldownMinutes(syncCooldown.remainingMs),
        }),
      );
      return;
    }

    try {
      const result = await syncMutation.mutateAsync();
      syncCooldown.markSuccess();
      notify.success(result.message?.trim() || t("sync.success"));
    } catch (error) {
      notify.error(ApiError.messageFrom(error, t("sync.errorFallback")));
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex items-start gap-3">
        <span
          className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-xl border border-border bg-bg-hover text-brand"
          title={t("warningTooltip")}
          aria-label={t("warningTooltip")}
          role="img"
        >
          <IoWarningOutline className="size-4" aria-hidden />
        </span>
        <div className="min-w-0 space-y-1">
          <h3 className="type-title text-text-primary">{t("cardTitle")}</h3>
          <p className="type-body leading-relaxed text-text-muted">{t("cardLead")}</p>
        </div>
      </div>

      {sheet.lastError ? (
        <p className="rounded-xl border border-border bg-bg-hover px-3.5 py-2.5 type-caption text-text-muted">
          {t("lastError", { message: sheet.lastError })}
        </p>
      ) : null}

      <div className="space-y-3 rounded-2xl border border-border bg-bg-input/40 p-4 sm:p-5">
        <label htmlFor="seo-activities-sheet-url" className="type-label text-text-primary">
          {t("urlLabel")}
        </label>
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
          <Input
            id="seo-activities-sheet-url"
            value={isEditing ? editDraft : sheet.spreadsheetUrl}
            readOnly={!isEditing}
            disabled={updateMutation.isPending || isServerBusy}
            onChange={(event) => setEditDraft(event.target.value)}
            placeholder={t("urlPlaceholder")}
            className={cn(controlHeightClass, "min-w-0 flex-1 rounded-xl")}
          />
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="lg"
              className={controlHeightClass}
              disabled={isEditing || updateMutation.isPending}
              onClick={() => void onCopy()}
            >
              <IoCopyOutline className="size-4" aria-hidden />
              {t("copyButton")}
            </Button>
            {isEditing ? (
              <>
                <Button
                  type="button"
                  variant="gradient"
                  size="lg"
                  className={controlHeightClass}
                  disabled={updateMutation.isPending || !editDraft.trim()}
                  onClick={() => void onSaveUrl()}
                >
                  {updateMutation.isPending ? t("savingUrl") : t("saveUrl")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className={controlHeightClass}
                  disabled={updateMutation.isPending}
                  onClick={() => setEditDraft(null)}
                >
                  {t("cancelEdit")}
                </Button>
              </>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="lg"
                className={controlHeightClass}
                disabled={syncMutation.isPending || isServerBusy}
                onClick={() => setEditDraft(sheet.spreadsheetUrl)}
              >
                <IoCreateOutline className="size-4" aria-hidden />
                {t("editButton")}
              </Button>
            )}
          </div>
        </div>
        <p className="type-caption leading-relaxed text-text-muted">{t("urlHint")}</p>
      </div>

      <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="type-caption text-text-muted">
          {isServerBusy
            ? t("sync.running")
            : sheet.lastSyncedAt
              ? t("lastSynced", { date: new Date(sheet.lastSyncedAt).toLocaleString() })
              : t("neverSynced")}
        </p>
        <Button
          type="button"
          variant="gradient"
          size="md"
          className="w-full sm:w-auto"
          disabled={isSyncDisabled}
          title={
            isServerBusy
              ? t("sync.running")
              : syncCooldown.isOnCooldown
                ? t("sync.cooldownActive", { minutes: cooldownMinutes })
                : t("warningTooltip")
          }
          onClick={() => void onSync()}
        >
          {syncMutation.isPending || isServerBusy
            ? t("sync.syncing")
            : syncCooldown.isOnCooldown
              ? t("sync.cooldownButton", { minutes: cooldownMinutes })
              : t("sync.button")}
        </Button>
      </div>
    </section>
  );
}
