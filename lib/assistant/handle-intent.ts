import { defaultAnalyticsDateRange } from "@/lib/integrations/date.utils";
import { getAnalyticsDimensions, getAnalyticsOverview } from "@/lib/integrations/read-analytics";
import {
  buildSummaryCounts,
  getLeadSummaryWindowBounds,
  type TLeadSummaryWindow,
} from "@/lib/leads/list-leads";
import type { TAssistantAction, TAssistantIntent } from "@/types/assistant.types";

function formatCount(value: number): string {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(value);
}

function formatPct(ratio: number | null | undefined): string {
  if (ratio == null || Number.isNaN(ratio)) return "—";
  return `${(ratio * 100).toFixed(1)}%`;
}

function formatPosition(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  return value.toFixed(1);
}

function leadWindowFromIntent(intent: TAssistantIntent): TLeadSummaryWindow | null {
  if (intent === "leads_this_month") return "this_month";
  if (intent === "leads_last_month") return "last_month";
  if (intent === "leads_this_year") return "this_year";
  return null;
}

function leadWindowLabel(window: TLeadSummaryWindow): string {
  if (window === "this_month") return "this month";
  if (window === "last_month") return "last month";
  return "this year";
}

export type TAssistantIntentAnswer = {
  message: string;
  action?: TAssistantAction;
};

export async function handleAssistantIntent(
  projectId: string,
  intent: Exclude<TAssistantIntent, "unknown">,
): Promise<TAssistantIntentAnswer> {
  if (intent === "leads_this_month" || intent === "leads_last_month" || intent === "leads_this_year") {
    const window = leadWindowFromIntent(intent)!;
    const counts = await buildSummaryCounts(projectId);
    const count =
      window === "this_month"
        ? counts.this_month
        : window === "last_month"
          ? counts.last_month
          : counts.this_year;
    const bounds = getLeadSummaryWindowBounds(window);
    const label = leadWindowLabel(window);

    return {
      message:
        count === 1
          ? `You got 1 lead ${label}.`
          : `You got ${formatCount(count)} leads ${label}.`,
      action: {
        label: "View Leads",
        route: `/leads?from=${bounds.from}&to=${bounds.to}`,
      },
    };
  }

  const range = defaultAnalyticsDateRange();

  if (intent === "analytics_overview") {
    const overview = await getAnalyticsOverview(projectId, range);
    const { clicks, impressions, ctr, position } = overview.cards;
    return {
      message: `Search performance for the last 30 days: ${formatCount(clicks.value ?? 0)} clicks, ${formatCount(impressions.value ?? 0)} impressions, ${formatPct(ctr.value)} CTR, average position ${formatPosition(position.value)}.`,
      action: {
        label: "View Analytics",
        route: `/analytics?from=${range.from}&to=${range.to}`,
      },
    };
  }

  if (intent === "analytics_top_queries") {
    const dimensions = await getAnalyticsDimensions(projectId, {
      ...range,
      source: "gsc",
      dimensionType: "query",
      limit: 5,
    });
    if (dimensions.rows.length === 0) {
      return {
        message: "No top queries are available for the last 30 days yet.",
        action: {
          label: "View Analytics",
          route: `/analytics?from=${range.from}&to=${range.to}`,
        },
      };
    }
    const summary = dimensions.rows
      .slice(0, 5)
      .map((row) => `${row.dimensionValue} (${formatCount(row.clicks ?? 0)} clicks)`)
      .join(", ");
    return {
      message: `Top queries for the last 30 days: ${summary}.`,
      action: {
        label: "View Analytics",
        route: `/analytics?from=${range.from}&to=${range.to}`,
      },
    };
  }

  const dimensions = await getAnalyticsDimensions(projectId, {
    ...range,
    source: "gsc",
    dimensionType: "page",
    limit: 5,
  });
  if (dimensions.rows.length === 0) {
    return {
      message: "No top pages are available for the last 30 days yet.",
      action: {
        label: "View Analytics",
        route: `/analytics?from=${range.from}&to=${range.to}`,
      },
    };
  }
  const summary = dimensions.rows
    .slice(0, 5)
    .map((row) => `${row.dimensionValue} (${formatCount(row.clicks ?? 0)} clicks)`)
    .join(", ");
  return {
    message: `Top pages for the last 30 days: ${summary}.`,
    action: {
      label: "View Analytics",
      route: `/analytics?from=${range.from}&to=${range.to}`,
    },
  };
}

export function unknownAssistantAnswer(): TAssistantIntentAnswer {
  return {
    message:
      "I couldn’t understand that. Try asking about leads or analytics for this project.",
  };
}

export function deniedAssistantAnswer(moduleLabel: "leads" | "analytics"): TAssistantIntentAnswer {
  return {
    message: `You do not have permission to view ${moduleLabel} for this project.`,
  };
}
