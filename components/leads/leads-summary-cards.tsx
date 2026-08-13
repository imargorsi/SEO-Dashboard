"use client";

import { Icons } from "@/lib/frontend/icons/app-icons";

import { useTranslation } from "react-i18next";

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
      icon: Icons.userGroup,
      accent: "var(--brand)",
      value: formatSummaryMetricCount(counts.total),
    },
    {
      id: "thisMonth",
      label: t("thisMonth"),
      icon: Icons.calendar,
      accent: "var(--status-pending)",
      value: formatSummaryMetricCount(counts.this_month),
    },
    {
      id: "lastMonth",
      label: t("lastMonth"),
      icon: Icons.clock,
      accent: "var(--status-active)",
      value: formatSummaryMetricCount(counts.last_month),
    },
    {
      id: "thisYear",
      label: t("thisYear"),
      icon: Icons.calendar,
      accent: "var(--status-invited)",
      value: formatSummaryMetricCount(counts.this_year),
    },
  ];

  return <SummaryMetricCards cards={cards} isLoading={isLoading} className={className} />;
}
