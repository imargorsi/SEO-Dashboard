import type { TAssistantIntent } from "@/types/assistant.types";

type TIntentRule = {
  intent: Exclude<TAssistantIntent, "unknown">;
  patterns: RegExp[];
};

/** More specific patterns first (e.g. last month before this month). */
const INTENT_RULES: TIntentRule[] = [
  {
    intent: "leads_last_month",
    patterns: [
      /\bleads?\b.*\blast\s+month\b/i,
      /\blast\s+month\b.*\bleads?\b/i,
      /\blast\s+month'?s?\s+leads?\b/i,
    ],
  },
  {
    intent: "leads_this_year",
    patterns: [
      /\bleads?\b.*\bthis\s+year\b/i,
      /\bthis\s+year\b.*\bleads?\b/i,
      /\bytd\b.*\bleads?\b/i,
      /\bleads?\b.*\bytd\b/i,
      /\bleads?\b.*\byear\s+to\s+date\b/i,
    ],
  },
  {
    intent: "leads_this_month",
    patterns: [
      /\bleads?\b.*\bthis\s+month\b/i,
      /\bthis\s+month\b.*\bleads?\b/i,
      /\bhow\s+many\s+leads?\b/i,
      /\blead\s+count\b/i,
      /\bleads?\s+count\b/i,
    ],
  },
  {
    intent: "analytics_top_queries",
    patterns: [
      /\btop\s+quer(?:y|ies)\b/i,
      /\bsearch\s+quer(?:y|ies)\b/i,
      /\bbest\s+quer(?:y|ies)\b/i,
      /\bkeyword\b/i,
    ],
  },
  {
    intent: "analytics_top_pages",
    patterns: [
      /\btop\s+pages?\b/i,
      /\bbest\s+pages?\b/i,
      /\btop\s+landing\s+pages?\b/i,
      /\bhighest\s+(?:traffic\s+)?pages?\b/i,
    ],
  },
  {
    intent: "analytics_overview",
    patterns: [
      /\banalytics\b/i,
      /\bsearch\s+console\b/i,
      /\bgsc\b/i,
      /\bclicks?\b/i,
      /\bimpressions?\b/i,
      /\bctr\b/i,
      /\btraffic\b/i,
      /\bperformance\b/i,
      /\boverview\b/i,
    ],
  },
];

export function detectAssistantIntent(query: string): TAssistantIntent {
  const normalized = query.trim().replace(/\s+/g, " ");
  if (!normalized) return "unknown";

  for (const rule of INTENT_RULES) {
    if (rule.patterns.some((pattern) => pattern.test(normalized))) {
      return rule.intent;
    }
  }

  return "unknown";
}

export function permissionForAssistantIntent(
  intent: TAssistantIntent,
): "leads.view" | "analytics.view" | null {
  switch (intent) {
    case "leads_this_month":
    case "leads_last_month":
    case "leads_this_year":
      return "leads.view";
    case "analytics_overview":
    case "analytics_top_queries":
    case "analytics_top_pages":
      return "analytics.view";
    default:
      return null;
  }
}
