"use client";

import { Icons } from "@/lib/frontend/icons/app-icons";

import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type TLeadsImportExportMenuProps = {
  canImport: boolean;
  canExport: boolean;
  onImport: () => void;
  onExport: () => void;
};

export function LeadsImportExportMenu({
  canImport,
  canExport,
  onImport,
  onExport,
}: TLeadsImportExportMenuProps) {
  const { t } = useTranslation("translation", { keyPrefix: "modules.leads.importExport" });

  if (!canImport && !canExport) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="outline" size="md" className="shrink-0 gap-1.5">
          {t("trigger")}
          <Icons.arrowDown className="size-3.5 opacity-70" aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44">
        {canImport ? (
          <DropdownMenuItem
            onClick={() => {
              onImport();
            }}
          >
            <Icons.cloudUpload className="size-4" aria-hidden />
            {t("import")}
          </DropdownMenuItem>
        ) : null}
        {canExport ? (
          <DropdownMenuItem
            onClick={() => {
              onExport();
            }}
          >
            <Icons.cloudDownload className="size-4" aria-hidden />
            {t("export")}
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
