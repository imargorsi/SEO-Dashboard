"use client";

import { useTranslation } from "react-i18next";
import {
  IoCalendarOutline,
  IoPeopleOutline,
  IoTodayOutline,
  IoTimeOutline,
} from "react-icons/io5";

import {
  formatSummaryMetricCount,
  SummaryMetricCards,
  type TSummaryMetricCard,
} from "@/components/ui/summary-metric-cards";
import type { TLeadSummaryCounts } from "@/types/lead.types";

type TLeadsSummaryCardsProps = {
  counts: TLeadSummaryCounts;
  isLoading?: boolean;
  className?: string;
};

export function LeadsSummaryCards({ counts, isLoading, className }: TLeadsSummaryCardsProps) {
  const { t } = useTranslation("translation", { keyPrefix: "modules.leads.summary" });

  const cards: TSummaryMetricCard[] = [
    {
      id: "total",
      label: t("total"),
      icon: IoPeopleOutline,
      accent: "var(--brand)",
      value: formatSummaryMetricCount(counts.total),
    },
    {
      id: "thisMonth",
      label: t("thisMonth"),
      icon: IoTodayOutline,
      accent: "var(--status-pending)",
      value: formatSummaryMetricCount(counts.this_month),
    },
    {
      id: "lastMonth",
      label: t("lastMonth"),
      icon: IoTimeOutline,
      accent: "var(--status-active)",
      value: formatSummaryMetricCount(counts.last_month),
    },
    {
      id: "thisYear",
      label: t("thisYear"),
      icon: IoCalendarOutline,
      accent: "var(--status-invited)",
      value: formatSummaryMetricCount(counts.this_year),
    },
  ];

  return <SummaryMetricCards cards={cards} isLoading={isLoading} className={className} />;
}
