"use client";

import { useTranslation } from "react-i18next";
import { IoMailOutline } from "react-icons/io5";

import { Heading } from "@/components/heading";
import { Paragraph } from "@/components/paragraph";
import { Button } from "@/components/ui/button";
import { useResendEmailVerificationMutation } from "@/features/auth/auth.api";
import { ApiError } from "@/lib/frontend/api/errors";
import { notify } from "@/lib/frontend/feedback/notify";
import {
  elevatedCardBodyClass,
  elevatedCardMutedClass,
  elevatedCardSurfaceClass,
} from "@/lib/frontend/layout/dashboard-chrome";
import { cn } from "@/lib/utils";

export function EmailVerificationSection() {
  const { t } = useTranslation("translation", { keyPrefix: "auth.verification" });
  const resendMutation = useResendEmailVerificationMutation();

  async function onResend() {
    try {
      const result = await resendMutation.mutateAsync();
      notify.success(result.message?.trim() || t("resendSuccess"));
    } catch (error) {
      notify.error(ApiError.messageFrom(error, t("resendErrorFallback")));
    }
  }

  return (
    <div className="w-full min-w-0">
      <div className="space-y-5 px-4 py-6 sm:px-6">
        <div className="space-y-1">
          <Heading pageTitle>{t("title")}</Heading>
          <Paragraph className="text-text-muted">{t("description")}</Paragraph>
        </div>

        <section className={cn(elevatedCardSurfaceClass, "rounded-2xl p-6 shadow-(--shadow)")}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-bg-hover">
                <IoMailOutline className="size-4 text-(--text-on-elevated)" aria-hidden />
              </span>
              <p className={cn("type-body leading-6", elevatedCardBodyClass)}>{t("description")}</p>
            </div>
            <Button
              type="button"
              variant="gradient"
              size="md"
              disabled={resendMutation.isPending}
              aria-busy={resendMutation.isPending}
              onClick={() => void onResend()}
            >
              {t("resendCta")}
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
