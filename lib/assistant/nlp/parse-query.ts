import { extractAssistantEntities } from "@/lib/assistant/nlp/engine";
import { correctAssistantQuery } from "@/lib/assistant/nlp/correct-query";
import {
  ASSISTANT_LEXICON_TERM_SET,
  ASSISTANT_PHRASE_ENTITIES,
  ASSISTANT_TERM_ENTITIES,
} from "@/lib/assistant/nlp/lexicon";
import { normalizeAssistantQuery } from "@/lib/assistant/nlp/normalize";
import type { TAnalyticsDimensionType, TAnalyticsSource } from "@/lib/integrations/constants";
import type { TDateRangePresetId } from "@/lib/frontend/seo-activities/date-range.utils";
import type { TSeoActivityType } from "@/types/seo-activity.types";
import type {
  TAssistantAnalyticsMetric,
  TAssistantParse,
  TAssistantWindowSpec,
} from "@/types/assistant.types";

type TParsedSlots = {
  domains: Set<"leads" | "analytics" | "seo">;
  metrics: TAssistantAnalyticsMetric[];
  dimensions: TAnalyticsDimensionType[];
  activityTypes: Array<TSeoActivityType | "all">;
  windows: TAssistantWindowSpec[];
  hasTop: boolean;
  source: TAnalyticsSource | null;
};

const METRIC_TYPES: Record<string, TAssistantAnalyticsMetric> = {
  "metric.clicks": "clicks",
  "metric.impressions": "impressions",
  "metric.ctr": "ctr",
  "metric.position": "position",
  "metric.sessions": "sessions",
  "metric.totalUsers": "totalUsers",
  "metric.newUsers": "newUsers",
  "metric.organicSessions": "organicSessions",
  "metric.pageViews": "pageViews",
  "metric.engagementRate": "engagementRate",
  "metric.avgSessionDuration": "avgSessionDuration",
};

const DIMENSION_TYPES: Record<string, TAnalyticsDimensionType> = {
  "dimension.query": "query",
  "dimension.page": "page",
  "dimension.country": "country",
  "dimension.device": "device",
  "dimension.landing_page": "landing_page",
  "dimension.channel_group": "channel_group",
};

const WINDOW_PRESETS: Record<string, TDateRangePresetId> = {
  "window.this_month": "this_month",
  "window.last_month": "last_month",
  "window.this_year": "this_year",
  "window.last_year": "last_year",
  "window.all": "all",
};

const LAST_N_PRESETS: Record<number, TDateRangePresetId> = {
  15: "last_15_days",
  30: "last_30_days",
  90: "last_90_days",
};

function emptyWindow(): TAssistantWindowSpec {
  return { preset: null, lastNDays: null };
}

function unique<T>(values: T[]): T[] {
  return [...new Set(values)];
}

function parseLastNDaysFromText(query: string): TAssistantWindowSpec | null {
  const match = query.match(/\b(?:last|past|previous)\s+(\d+)\s+days?\b/i);
  if (!match) return null;
  const days = Number(match[1]);
  if (!Number.isFinite(days) || days < 1) return null;
  const preset = LAST_N_PRESETS[days];
  if (preset) return { preset, lastNDays: null };
  return { preset: null, lastNDays: days };
}

function applyEntity(slots: TParsedSlots, entityType: string): void {
  if (entityType === "domain.leads") slots.domains.add("leads");
  if (entityType === "domain.analytics") slots.domains.add("analytics");
  if (entityType === "domain.seo") slots.domains.add("seo");

  const metric = METRIC_TYPES[entityType];
  if (metric) slots.metrics.push(metric);

  const dimension = DIMENSION_TYPES[entityType];
  if (dimension) slots.dimensions.push(dimension);

  if (entityType === "activity.blogs") slots.activityTypes.push("blogs");
  if (entityType === "activity.backlinks") slots.activityTypes.push("backlinks");
  if (entityType === "activity.technical_work") {
    slots.activityTypes.push("technical_work");
  }

  const preset = WINDOW_PRESETS[entityType];
  if (preset) slots.windows.push({ preset, lastNDays: null });

  if (entityType === "topic.top") slots.hasTop = true;
  if (entityType === "source.gsc") slots.source = "gsc";
  if (entityType === "source.ga4") slots.source = "ga4";
}

/** Fill slots from wink (best-effort), then lexicon tokens/phrases, then last-N regex. */
function collectSlots(query: string): TParsedSlots {
  const slots: TParsedSlots = {
    domains: new Set(),
    metrics: [],
    dimensions: [],
    activityTypes: [],
    windows: [],
    hasTop: false,
    source: null,
  };

  for (const entity of extractAssistantEntities(query)) {
    applyEntity(slots, entity.type);
  }

  for (const token of query.toLowerCase().split(/\s+/)) {
    const entityType = ASSISTANT_TERM_ENTITIES[token];
    if (entityType) applyEntity(slots, entityType);
  }

  const lowered = query.toLowerCase().replace(/-/g, " ");
  for (const item of ASSISTANT_PHRASE_ENTITIES) {
    if (lowered.includes(item.phrase)) applyEntity(slots, item.entity);
  }

  const lastN = parseLastNDaysFromText(query);
  if (lastN) slots.windows.push(lastN);

  if (/\b(?:total|all)\s+leads\b/i.test(query)) {
    slots.domains.add("leads");
    slots.windows.push({ preset: "all", lastNDays: null });
  }

  slots.metrics = unique(slots.metrics);
  slots.dimensions = unique(slots.dimensions);
  slots.activityTypes = unique(slots.activityTypes);

  return slots;
}

function pickWindow(windows: TAssistantWindowSpec[]): TAssistantWindowSpec | null {
  if (windows.length === 0) return emptyWindow();
  const serialized = unique(
    windows.map((window) => `${window.preset ?? ""}:${window.lastNDays ?? ""}`),
  );
  if (serialized.length > 1) return null;
  return windows[0] ?? emptyWindow();
}

function inferDomain(slots: TParsedSlots): "leads" | "analytics" | "seo" | null {
  const explicit = [...slots.domains];
  const fromTopics = new Set<"leads" | "analytics" | "seo">();
  if (slots.metrics.length > 0 || slots.dimensions.length > 0) fromTopics.add("analytics");
  if (slots.activityTypes.length > 0) fromTopics.add("seo");

  if (fromTopics.size > 1) return null;

  if (fromTopics.size === 1) {
    const topic = [...fromTopics][0]!;
    if (explicit.some((domain) => domain !== topic)) return null;
    return topic;
  }

  if (explicit.length === 1) return explicit[0] ?? null;
  return null;
}

function preferDimension(dimensions: TAnalyticsDimensionType[]): TAnalyticsDimensionType | null {
  if (dimensions.length === 0) return null;
  if (dimensions.includes("landing_page")) return "landing_page";
  if (dimensions.includes("channel_group")) return "channel_group";
  if (dimensions.length > 1) return null;
  return dimensions[0] ?? null;
}

function preferMetric(metrics: TAssistantAnalyticsMetric[]): TAssistantAnalyticsMetric | null {
  if (metrics.length === 0) return null;
  const order: TAssistantAnalyticsMetric[] = [
    "avgSessionDuration",
    "organicSessions",
    "pageViews",
    "newUsers",
    "engagementRate",
    "ctr",
    "position",
    "impressions",
    "totalUsers",
    "sessions",
    "clicks",
  ];
  return order.find((metric) => metrics.includes(metric)) ?? metrics[0] ?? null;
}

function dimensionSource(
  dimension: TAnalyticsDimensionType,
  source: TAnalyticsSource | null,
): TAnalyticsSource {
  if (source) {
    if (dimension === "query" || dimension === "device") return "gsc";
    if (dimension === "landing_page" || dimension === "channel_group") return "ga4";
    return source;
  }
  if (dimension === "landing_page" || dimension === "channel_group") return "ga4";
  return "gsc";
}

export function parseAssistantQuery(query: string): TAssistantParse {
  const normalized = correctAssistantQuery(
    normalizeAssistantQuery(query),
    ASSISTANT_LEXICON_TERM_SET,
  );
  if (!normalized) return { kind: "unknown" };

  const slots = collectSlots(normalized);
  const window = pickWindow(slots.windows);
  if (window == null) return { kind: "unknown" };

  const domain = inferDomain(slots);
  if (domain == null) return { kind: "unknown" };

  if (domain === "leads") {
    return { kind: "leads_count", window };
  }

  if (domain === "seo") {
    const activityType =
      slots.activityTypes.length === 1 ? slots.activityTypes[0]! : "all";
    if (slots.activityTypes.length > 1) return { kind: "unknown" };
    return { kind: "seo_count", activityType, window };
  }

  const metric = preferMetric(slots.metrics);
  const dimension = preferDimension(slots.dimensions);

  if (slots.hasTop && dimension == null && metric != null) {
    return { kind: "analytics_metric", metric, window };
  }

  if (slots.hasTop || dimension != null) {
    if (metric === "pageViews" && dimension === "page" && !slots.hasTop) {
      return { kind: "analytics_metric", metric, window };
    }
    const topDimension = dimension ?? (slots.hasTop ? "query" : null);
    if (topDimension == null) {
      return { kind: "analytics_overview", window };
    }
    return {
      kind: "analytics_top",
      source: dimensionSource(topDimension, slots.source),
      dimensionType: topDimension,
      window,
    };
  }

  if (metric != null) {
    return { kind: "analytics_metric", metric, window };
  }

  return { kind: "analytics_overview", window };
}
