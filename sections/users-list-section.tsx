"use client";

import { useTranslation } from "react-i18next";

import { UsersTable } from "@/components/table/users-table";
import { Heading } from "@/components/heading";
import { Paragraph } from "@/components/paragraph";

export function UsersListSection() {
  const { t } = useTranslation("translation", { keyPrefix: "modules.users" });

  return (
    <div className="w-full min-w-0">
      <div className="space-y-5 px-4 py-6 sm:px-6">
        <div className="space-y-1">
          <Heading id="users-list-title" pageTitle>
            {t("title")}
          </Heading>
          <Paragraph className="text-text-muted">{t("subtitle")}</Paragraph>
        </div>
        <UsersTable />
      </div>
    </div>
  );
}
