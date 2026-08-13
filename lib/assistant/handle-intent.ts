import { defaultAnalyticsDateRange } from "@/lib/integrations/date.utils";
import { getAnalyticsDimensions, getAnalyticsOverview } from "@/lib/integrations/read-analytics";
import { countLeadsInRange } from "@/lib/leads/list-leads";
import {
  rangeQuery,
  resolveAnalyticsWindow,
  resolveLeadsSeoWindow,
} from "@/lib/assistant/nlp/windows";
import { getSeoActivityCounts } from "@/lib/seo-activities/list-seo-activities";
import type { TSeoActivityType } from "@/types/seo-activity.types";
import type {
  TAssistantAction,
  TAssistantAnalyticsMetric,
  TAssistantParse,
} from "@/types/assistant.types";

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

function formatDuration(seconds: number | null | undefined): string {
  if (seconds == null || Number.isNaN(seconds)) return "—";
  const total = Math.round(seconds);
  const minutes = Math.floor(total / 60);
  const remainder = total % 60;
  if (minutes <= 0) return `${total} seconds`;
  if (remainder === 0) return `${minutes} minutes`;
  return `${minutes} minutes ${remainder} seconds`;
}

function noun(count: number, singular: string, plural: string): string {
  return count === 1 ? singular : plural;
}

function leadsCta(from: string | null, to: string | null): TAssistantAction {
  return { label: "View Leads", route: `/leads${rangeQuery(from, to)}` };
}

function analyticsCta(from: string, to: string): TAssistantAction {
  return { label: "View Analytics", route: `/analytics?from=${from}&to=${to}` };
}

function seoCta(
  activityType: TSeoActivityType | "all",
  from: string | null,
  to: string | null,
): TAssistantAction {
  const params = new URLSearchParams();
  if (activityType !== "all") params.set("type", activityType);
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  const qs = params.toString();
  return {
    label: "View SEO Activities",
    route: qs ? `/seo-activities?${qs}` : "/seo-activities",
  };
}

const METRIC_LABELS: Record<TAssistantAnalyticsMetric, string> = {
  clicks: "clicks",
  impressions: "impressions",
  ctr: "CTR",
  position: "average position",
  sessions: "sessions",
  totalUsers: "users",
  newUsers: "new users",
  organicSessions: "organic sessions",
  pageViews: "page views",
  engagementRate: "engagement rate",
  avgSessionDuration: "average session duration",
};

function formatMetricValue(
  metric: TAssistantAnalyticsMetric,
  overview: Awaited<ReturnType<typeof getAnalyticsOverview>>,
): string {
  switch (metric) {
    case "clicks":
      return formatCount(overview.cards.clicks.value ?? 0);
    case "impressions":
      return formatCount(overview.cards.impressions.value ?? 0);
    case "ctr":
      return formatPct(overview.cards.ctr.value);
    case "position":
      return formatPosition(overview.cards.position.value);
    case "sessions":
      return formatCount(overview.ga4.sessions);
    case "totalUsers":
      return formatCount(overview.ga4.totalUsers);
    case "newUsers":
      return formatCount(overview.ga4.newUsers);
    case "organicSessions":
      return formatCount(overview.ga4.organicSessions);
    case "pageViews":
      return overview.engagement.pageViews.value == null
        ? "—"
        : formatCount(overview.engagement.pageViews.value);
    case "engagementRate":
      return formatPct(overview.engagement.engagementRate.value);
    case "avgSessionDuration":
      return formatDuration(overview.engagement.avgSessionDuration.value);
  }
}

function inWindow(label: string): string {
  if (label.startsWith("the last") || label === "all time") return `in ${label}`;
  return label;
}

function metricSentence(
  metric: TAssistantAnalyticsMetric,
  formatted: string,
  label: string,
): string {
  const window = inWindow(label);
  if (metric === "ctr") return `CTR was ${formatted} ${window}.`;
  if (metric === "engagementRate") return `Engagement rate was ${formatted} ${window}.`;
  if (metric === "position") return `Average position was ${formatted} ${window}.`;
  if (metric === "avgSessionDuration") {
    return `Average session duration was ${formatted} ${window}.`;
  }
  return `You had ${formatted} ${METRIC_LABELS[metric]} ${window}.`;
}

const DIMENSION_LABELS: Record<string, string> = {
  query: "queries",
  page: "pages",
  country: "countries",
  device: "devices",
  landing_page: "landing pages",
  channel_group: "channels",
};

function activityLabel(type: TSeoActivityType, count: number): string {
  if (type === "blogs") return noun(count, "blog", "blogs");
  if (type === "backlinks") return noun(count, "backlink", "backlinks");
  return noun(count, "technical work item", "technical work items");
}

export type TAssistantIntentAnswer = {
  message: string;
  action?: TAssistantAction;
};

export async function handleAssistantIntent(
  projectId: string,
  parsed: Exclude<TAssistantParse, { kind: "unknown" }>,
): Promise<TAssistantIntentAnswer> {
  if (parsed.kind === "leads_count") {
    const range = resolveLeadsSeoWindow(parsed.window, "this_month");
    const count = await countLeadsInRange(projectId, range.from, range.to);
    const verb = range.from == null && range.to == null ? "have" : "got";
    const window = inWindow(range.label);
    return {
      message:
        count === 1
          ? `You ${verb} 1 lead ${window}.`
          : `You ${verb} ${formatCount(count)} leads ${window}.`,
      action: leadsCta(range.from, range.to),
    };
  }

  if (parsed.kind === "seo_count") {
    const range = resolveLeadsSeoWindow(parsed.window, "all");
    const counts = await getSeoActivityCounts(projectId, range.from, range.to);
    const action = seoCta(parsed.activityType, range.from, range.to);

    if (parsed.activityType === "all") {
      const total = counts.blogs + counts.backlinks + counts.technical_work;
      return {
        message: `You logged ${formatCount(counts.blogs)} ${activityLabel("blogs", counts.blogs)}, ${formatCount(counts.backlinks)} ${activityLabel("backlinks", counts.backlinks)}, and ${formatCount(counts.technical_work)} ${activityLabel("technical_work", counts.technical_work)} ${inWindow(range.label)} (${formatCount(total)} total).`,
        action,
      };
    }

    const count = counts[parsed.activityType];
    return {
      message: `You logged ${formatCount(count)} ${activityLabel(parsed.activityType, count)} ${inWindow(range.label)}.`,
      action,
    };
  }

  const range = resolveAnalyticsWindow(parsed.window);
  const from = range.from ?? defaultAnalyticsDateRange().from;
  const to = range.to ?? defaultAnalyticsDateRange().to;
  const action = analyticsCta(from, to);

  if (parsed.kind === "analytics_overview") {
    const overview = await getAnalyticsOverview(projectId, { from, to });
    const { clicks, impressions, ctr, position } = overview.cards;
    return {
      message: `Search performance for ${range.label}: ${formatCount(clicks.value ?? 0)} clicks, ${formatCount(impressions.value ?? 0)} impressions, ${formatPct(ctr.value)} CTR, average position ${formatPosition(position.value)}. Traffic: ${formatCount(overview.ga4.sessions)} sessions, ${formatCount(overview.ga4.totalUsers)} users, ${overview.engagement.pageViews.value == null ? "—" : formatCount(overview.engagement.pageViews.value)} page views.`,
      action,
    };
  }

  if (parsed.kind === "analytics_metric") {
    const overview = await getAnalyticsOverview(projectId, { from, to });
    const formatted = formatMetricValue(parsed.metric, overview);
    return {
      message: metricSentence(parsed.metric, formatted, range.label),
      action,
    };
  }

  const dimensions = await getAnalyticsDimensions(projectId, {
    from,
    to,
    source: parsed.source,
    dimensionType: parsed.dimensionType,
    limit: 5,
  });
  const dimLabel = DIMENSION_LABELS[parsed.dimensionType] ?? parsed.dimensionType;
  if (dimensions.rows.length === 0) {
    return {
      message: `No top ${dimLabel} are available for ${range.label} yet.`,
      action,
    };
  }
  const useClicks = parsed.source === "gsc";
  const summary = dimensions.rows
    .slice(0, 5)
    .map((row) => {
      const primary = useClicks ? (row.clicks ?? 0) : (row.sessions ?? 0);
      const unit = useClicks ? "clicks" : "sessions";
      return `${row.dimensionValue} (${formatCount(primary)} ${unit})`;
    })
    .join(", ");
  return {
    message: `Top ${dimLabel} for ${range.label}: ${summary}.`,
    action,
  };
}

export function unknownAssistantAnswer(): TAssistantIntentAnswer {
  return {
    message:
      "I couldn’t understand that. Try asking about leads, analytics, or SEO activities for this project.",
  };
}

export function deniedAssistantAnswer(
  moduleLabel: "leads" | "analytics" | "seo_activities",
): TAssistantIntentAnswer {
  if (moduleLabel === "seo_activities") {
    return {
      message: "You do not have permission to view SEO activities for this project.",
    };
  }
  return {
    message: `You do not have permission to view ${moduleLabel} for this project.`,
  };
}
