"use client";

import { useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { IoSparklesOutline } from "react-icons/io5";

import { Button, buttonVariants } from "@/components/ui/button";
import { Heading } from "@/components/heading";
import { Input } from "@/components/ui/input";
import { Paragraph } from "@/components/paragraph";
import {
  useAssistantHistoryQuery,
  useAssistantQueryMutation,
} from "@/features/assistant/assistant.api";
import { ApiError } from "@/lib/frontend/api/errors";
import { notify } from "@/lib/frontend/feedback/notify";
import {
  elevatedCardSurfaceClass,
  metricIconWellClass,
  toolbarFilterChipClass,
  typeStackMdClass,
} from "@/lib/frontend/layout/dashboard-chrome";
import { cn } from "@/lib/utils";
import type { TAssistantIntent, TAssistantQueryResult } from "@/types/assistant.types";

type TSuggestion = {
  id: string;
  intent: Exclude<TAssistantIntent, "unknown">;
  label: string;
  query: string;
  permission: "leads.view" | "analytics.view";
};

type TDashboardAssistantPanelProps = {
  projectId: string;
  canViewLeads: boolean;
  canViewAnalytics: boolean;
  className?: string;
  /** Tighter chrome for no-scroll `/dashboard` layout. */
  compact?: boolean;
};

export function DashboardAssistantPanel({
  projectId,
  canViewLeads,
  canViewAnalytics,
  className,
  compact = false,
}: TDashboardAssistantPanelProps) {
  const { t } = useTranslation("translation", { keyPrefix: "home.assistant" });
  const [draft, setDraft] = useState("");
  const [answer, setAnswer] = useState<TAssistantQueryResult | null>(null);

  const historyQuery = useAssistantHistoryQuery(projectId);
  const queryMutation = useAssistantQueryMutation(projectId);

  const suggestions = useMemo<TSuggestion[]>(() => {
    const all: TSuggestion[] = [
      {
        id: "leadsThisMonth",
        intent: "leads_this_month",
        label: t("suggestions.leadsThisMonth"),
        query: "How many leads this month?",
        permission: "leads.view",
      },
      {
        id: "leadsLastMonth",
        intent: "leads_last_month",
        label: t("suggestions.leadsLastMonth"),
        query: "How many leads last month?",
        permission: "leads.view",
      },
      {
        id: "analyticsOverview",
        intent: "analytics_overview",
        label: t("suggestions.analyticsOverview"),
        query: "Show analytics overview",
        permission: "analytics.view",
      },
      {
        id: "topQueries",
        intent: "analytics_top_queries",
        label: t("suggestions.topQueries"),
        query: "What are the top queries?",
        permission: "analytics.view",
      },
      {
        id: "topPages",
        intent: "analytics_top_pages",
        label: t("suggestions.topPages"),
        query: "What are the top pages?",
        permission: "analytics.view",
      },
      {
        id: "leadsThisYear",
        intent: "leads_this_year",
        label: t("suggestions.leadsThisYear"),
        query: "How many leads this year?",
        permission: "leads.view",
      },
    ];

    const filtered = all.filter((item) => {
      if (item.permission === "leads.view") return canViewLeads;
      return canViewAnalytics;
    });

    return compact ? filtered.slice(0, 4) : filtered;
  }, [canViewAnalytics, canViewLeads, compact, t]);

  async function runQuery(query: string) {
    const trimmed = query.trim();
    if (!trimmed || queryMutation.isPending) return;

    setDraft(trimmed);
    try {
      const result = await queryMutation.mutateAsync({ query: trimmed });
      setAnswer(result);
    } catch (error) {
      notify.error(ApiError.messageFrom(error, t("queryError")));
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    void runQuery(draft);
  }

  const historyItems = (historyQuery.data?.items ?? answer?.history ?? []).slice(
    0,
    compact ? 3 : 5,
  );

  return (
    <section
      className={cn(
        elevatedCardSurfaceClass,
        "flex h-full min-h-0 flex-col overflow-hidden",
        compact ? "rounded-2xl p-3 sm:p-4" : "rounded-3xl p-5 sm:p-6",
        className,
      )}
      aria-labelledby="dashboard-assistant-title"
    >
      <div className={cn("flex shrink-0 items-start gap-3", compact ? "mb-3" : "mb-5")}>
        <span className={metricIconWellClass} aria-hidden>
          <IoSparklesOutline className="size-5" />
        </span>
        <div className={typeStackMdClass}>
          <Heading id="dashboard-assistant-title" SmallTitle>
            {t("title")}
          </Heading>
          {compact ? null : (
            <Paragraph className="text-text-secondary">{t("description")}</Paragraph>
          )}
        </div>
      </div>

      {suggestions.length > 0 ? (
        <div className={cn("flex shrink-0 flex-wrap gap-2", compact ? "mb-3" : "mb-4")} role="list">
          {suggestions.map((item) => (
            <button
              key={item.id}
              type="button"
              role="listitem"
              disabled={queryMutation.isPending}
              onClick={() => void runQuery(item.query)}
              className={cn(
                toolbarFilterChipClass,
                "border border-border/50 bg-bg-card/30 text-text-secondary hover:border-accent-border/50 hover:bg-bg-hover/60 hover:text-text-primary disabled:opacity-50 dark:border-text-primary/25",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}

      <form
        onSubmit={handleSubmit}
        className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center"
      >
        <Input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={t("placeholder")}
          aria-label={t("placeholder")}
          disabled={queryMutation.isPending}
          className={cn("flex-1", compact ? "h-10" : "h-11")}
        />
        <Button
          type="submit"
          variant="primary"
          size={compact ? "md" : "lg"}
          disabled={queryMutation.isPending || !draft.trim()}
          className="w-full sm:w-auto"
        >
          {queryMutation.isPending ? t("asking") : t("submit")}
        </Button>
      </form>

      <div className={cn("flex min-h-0 flex-1 flex-col overflow-hidden", compact ? "mt-3" : "mt-4")}>
        {historyItems.length > 0 ? (
          <div className="shrink-0">
            <p className="mb-2 type-caption text-text-muted">{t("historyLabel")}</p>
            <div className="flex flex-wrap gap-2">
              {historyItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  disabled={queryMutation.isPending}
                  onClick={() => void runQuery(item.query)}
                  className={cn(
                    toolbarFilterChipClass,
                    "max-w-full truncate border border-border/40 bg-transparent text-text-muted hover:border-accent-border/40 hover:text-text-secondary disabled:opacity-50 dark:border-text-primary/20",
                  )}
                  title={item.query}
                >
                  {item.query}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {answer ? (
          <div
            className={cn(
              "mt-auto overflow-y-auto rounded-2xl border border-border/40 bg-bg-card/15 dark:border-text-primary/20 dark:bg-text-primary/4",
              compact ? "mt-3 max-h-28 px-3 py-3" : "px-4 py-4",
            )}
          >
            <p className="type-body text-text-primary">{answer.message}</p>
            {answer.action ? (
              <div className="mt-2">
                <Link
                  href={answer.action.route}
                  className={cn(buttonVariants({ variant: "outlined", size: "sm" }), "inline-flex")}
                >
                  {answer.action.label}
                </Link>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="mt-auto min-h-0 flex-1" aria-hidden />
        )}
      </div>
    </section>
  );
}
