"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { IoFolderOpenOutline } from "react-icons/io5";

import { Heading } from "@/components/heading";
import { Paragraph } from "@/components/paragraph";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NoProjectComponentProps = {
  canCreateProject?: boolean;
};

export function NoProjectComponent({ canCreateProject = false }: NoProjectComponentProps) {
  const { t } = useTranslation("translation", { keyPrefix: "modules.projects" });

  return (
    <div
      className="flex w-full flex-col items-center justify-center px-4 py-12 text-center sm:min-h-[min(28rem,calc(100vh-14rem))] sm:py-16"
      role="status"
      aria-live="polite"
    >
      <div
        className="mb-6 flex size-16 items-center justify-center rounded-2xl border border-border bg-bg-card/60 shadow-sm backdrop-blur-sm"
        aria-hidden
      >
        <IoFolderOpenOutline className="size-8 shrink-0 text-brand" />
      </div>

      <Heading sectionTitle className="text-text-primary">
        {t("emptyTitle")}
      </Heading>

      <Paragraph className="mt-3 max-w-md text-text-muted">{t("emptyBody")}</Paragraph>

      {canCreateProject ? (
        <Link
          href="/projects/new"
          className={cn(buttonVariants({ size: "md", variant: "gradient" }), "mt-8")}
        >
          {t("table.createProject")}
        </Link>
      ) : null}
    </div>
  );
}
