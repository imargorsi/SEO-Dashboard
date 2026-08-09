"use client";

import type { IconType } from "react-icons";
import {
  IoCalendarOutline,
  IoConstructOutline,
  IoDocumentTextOutline,
  IoLinkOutline,
} from "react-icons/io5";
import { useTranslation } from "react-i18next";

import {
  formatSummaryMetricCount,
  SummaryMetricCards,
  type TSummaryMetricCard,
} from "@/components/ui/summary-metric-cards";
import type { TSeoActivitySummaryMetric } from "@/lib/frontend/seo-activities/summary.utils";

type TSeoActivitySummaryCardsProps = {
  metrics: TSeoActivitySummaryMetric[];
  isLoading?: boolean;
  className?: string;
};

type TMetricTheme = {
  icon: IconType;
  accent: string;
};

const METRIC_THEME: Record<TSeoActivitySummaryMetric["id"], TMetricTheme> = {
  blogs: {
    icon: IoDocumentTextOutline,
    accent: "var(--brand)",
  },
  backlinks: {
    icon: IoLinkOutline,
    accent: "var(--status-pending)",
  },
  technical_work: {
    icon: IoConstructOutline,
    accent: "var(--status-invited)",
  },
  total: {
    icon: IoCalendarOutline,
    accent: "var(--status-active)",
  },
};

export function SeoActivitySummaryCards({
  metrics,
  isLoading,
  className,
}: TSeoActivitySummaryCardsProps) {
  const { t } = useTranslation("translation", { keyPrefix: "modules.seoActivities.summary" });

  const cards: TSummaryMetricCard[] = metrics.map((metric) => {
    const theme = METRIC_THEME[metric.id];
    return {
      id: metric.id,
      label: t(`cards.${metric.id}`),
      icon: theme.icon,
      accent: theme.accent,
      value: formatSummaryMetricCount(metric.value),
    };
  });

  return <SummaryMetricCards cards={cards} isLoading={isLoading} className={className} />;
}
