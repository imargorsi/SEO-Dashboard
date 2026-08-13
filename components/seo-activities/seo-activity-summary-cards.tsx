"use client";

import type { TAppIconComponent } from "@/components/ui/app-icon";
import { Icons } from "@/lib/frontend/icons/app-icons";

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
  icon: TAppIconComponent;
  accent: string;
};

const METRIC_THEME: Record<TSeoActivitySummaryMetric["id"], TMetricTheme> = {
  blogs: {
    icon: Icons.file,
    accent: "var(--brand)",
  },
  backlinks: {
    icon: Icons.link,
    accent: "var(--status-pending)",
  },
  technical_work: {
    icon: Icons.wrench,
    accent: "var(--status-active)",
  },
  total: {
    icon: Icons.calendar,
    accent: "var(--status-invited)",
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
