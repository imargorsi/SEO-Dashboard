"use client";

import { useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { IoArrowForward, IoSearchOutline, IoTimeOutline } from "react-icons/io5";

import { AssistantNeonOutline } from "@/components/dashboard/assistant-neon-outline";
import { AssistantSparkleIcon } from "@/components/dashboard/assistant-sparkle-icon";
import { Button, buttonVariants } from "@/components/ui/button";
import { Heading } from "@/components/heading";
import { Paragraph } from "@/components/paragraph";
import {
  useAssistantHistoryQuery,
  useAssistantQueryMutation,
} from "@/features/assistant/assistant.api";
import { useTypingPlaceholder } from "@/hooks/use-typing-placeholder.hook";
import { ApiError } from "@/lib/frontend/api/errors";
import { notify } from "@/lib/frontend/feedback/notify";
import {
  formFieldControlClass,
  glassPanelSurfaceClass,
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
  /** English query string — intent detection is English-only in MVP. */
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

/** English phrases for typewriter — aligned with chip queries / `detect-intent` (MVP). */
const TYPING_PHRASES = {
  leadsThisMonth: "How many leads this month?",
  leadsLastMonth: "How many leads last month?",
  clicksOverview: "Show analytics overview",
  topQueries: "What are the top queries?",
  topPages: "What are the top pages?",
} as const;

export function DashboardAssistantPanel({
  projectId,
  canViewLeads,
  canViewAnalytics,
  className,
  compact = false,
}: TDashboardAssistantPanelProps) {
  const { t } = useTranslation("translation", { keyPrefix: "home.assistant" });
  const [draft, setDraft] = useState("");
  const [isFocused, setIsFocused] = useState(false);
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

  const typingPhrases = useMemo(() => {
    const phrases: string[] = [];
    if (canViewLeads) {
      phrases.push(TYPING_PHRASES.leadsThisMonth, TYPING_PHRASES.leadsLastMonth);
    }
    if (canViewAnalytics) {
      phrases.push(
        TYPING_PHRASES.clicksOverview,
        TYPING_PHRASES.topQueries,
        TYPING_PHRASES.topPages,
      );
    }
    return phrases.length > 0 ? phrases : [t("placeholder")];
  }, [canViewAnalytics, canViewLeads, t]);

  const typingEnabled = !draft && !isFocused && !queryMutation.isPending;
  const typingPlaceholder = useTypingPlaceholder({
    phrases: typingPhrases,
    enabled: typingEnabled,
  });

  const historyItems = (historyQuery.data?.items ?? answer?.history ?? []).slice(
    0,
    compact ? 3 : 5,
  );

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

  return (
    <section
      className={cn(
        glassPanelSurfaceClass,
        "relative flex h-full min-h-0 flex-col overflow-visible border-0 shadow-none",
        "motion-reduce:border motion-reduce:border-border/50 dark:motion-reduce:border-text-primary/30",
        compact ? "rounded-2xl p-3.5 sm:p-4" : "rounded-3xl p-6 sm:p-7",
        className,
      )}
      aria-labelledby="dashboard-assistant-title"
    >
      <AssistantNeonOutline radius={compact ? 16 : 24} />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className={cn("flex shrink-0 items-center", compact ? "gap-2.5" : "gap-3")}>
          <span
            className={cn(metricIconWellClass, compact ? "size-10" : "size-12")}
            aria-hidden
          >
            <AssistantSparkleIcon />
          </span>
          <div className={cn(typeStackMdClass, "min-w-0")}>
            <Heading id="dashboard-assistant-title" SmallTitle className="leading-tight">
              {t("title")}
            </Heading>
            <Paragraph className="leading-snug text-text-secondary">
              {compact ? t("descriptionShort") : t("description")}
            </Paragraph>
          </div>
        </div>

        {suggestions.length > 0 ? (
          <div
            className={cn(
              "flex shrink-0 flex-wrap justify-end gap-2",
              compact ? "mt-3" : "mt-6",
            )}
            role="list"
            aria-label={t("suggestionsLabel")}
          >
            {suggestions.map((item) => (
              <button
                key={item.id}
                type="button"
                role="listitem"
                disabled={queryMutation.isPending}
                onClick={() => void runQuery(item.query)}
                className={cn(
                  toolbarFilterChipClass,
                  "border border-border/50 bg-transparent text-text-secondary",
                  "hover:border-border hover:bg-bg-hover/40 hover:text-text-primary",
                  "disabled:opacity-50 dark:border-text-primary/20",
                )}
              >
                <IoSearchOutline className="size-3.5 shrink-0 opacity-70" aria-hidden />
                {item.label}
              </button>
            ))}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className={cn("shrink-0", compact ? "mt-3" : "mt-4")}>
          <div
            className={cn(
              formFieldControlClass,
              "flex items-center gap-2 rounded-xl bg-transparent p-1.5 ps-3",
              "focus-within:border-border/50 focus-within:ring-0 dark:focus-within:border-text-primary/18",
            )}
          >
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={
                typingEnabled ? typingPlaceholder || t("placeholder") : t("placeholder")
              }
              aria-label={t("inputLabel")}
              disabled={queryMutation.isPending}
              className={cn(
                "min-w-0 flex-1 bg-transparent type-body text-text-primary outline-none",
                "placeholder:text-text-placeholder",
                "disabled:cursor-not-allowed disabled:opacity-50",
                compact ? "h-9" : "h-10",
              )}
            />
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={queryMutation.isPending || !draft.trim()}
              className="shrink-0 rounded-lg px-4"
            >
              {queryMutation.isPending ? t("asking") : t("submit")}
            </Button>
          </div>
        </form>

        <div className={cn("min-h-0 shrink-0", compact ? "mt-4" : "mt-8")} aria-live="polite">
          {answer ? (
            <div
              className={cn(
                "space-y-2 rounded-xl border border-border/40 bg-bg-card/25 p-3",
                "shadow-sm backdrop-blur-md dark:border-text-primary/20 dark:bg-text-primary/5",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="type-caption text-text-muted">{t("answerLabel")}</p>
                {answer.action ? (
                  <Link
                    href={answer.action.route}
                    className={cn(
                      buttonVariants({ variant: "ghost", size: "xs" }),
                      "inline-flex gap-1 text-brand",
                    )}
                  >
                    {answer.action.label}
                    <IoArrowForward className="size-3.5" aria-hidden />
                  </Link>
                ) : null}
              </div>
              <p className="max-h-24 overflow-y-auto type-body text-text-primary">
                {answer.message}
              </p>
            </div>
          ) : historyQuery.isLoading ? (
            <p className="type-caption text-text-muted">{t("historyLoading")}</p>
          ) : historyItems.length > 0 ? (
            <div
              className="flex flex-wrap gap-1.5"
              role="list"
              aria-label={t("historyLabel")}
            >
              {historyItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="listitem"
                  disabled={queryMutation.isPending}
                  onClick={() => void runQuery(item.query)}
                  className={cn(
                    "inline-flex max-w-full items-center gap-1.5 truncate rounded-lg border border-transparent px-2.5 py-1.5 type-caption",
                    "text-text-muted transition-colors hover:border-border/40 hover:bg-bg-hover/50 hover:text-text-secondary",
                    "disabled:opacity-50",
                  )}
                  title={item.query}
                >
                  <IoTimeOutline className="size-3.5 shrink-0" aria-hidden />
                  <span className="truncate">{item.query}</span>
                </button>
              ))}
            </div>
          ) : (
            <p className="type-caption text-text-muted">{t("emptyAnswer")}</p>
          )}
        </div>
      </div>
    </section>
  );
}
