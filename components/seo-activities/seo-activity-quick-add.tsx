"use client";

import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { IoClose } from "react-icons/io5";

import { Input } from "@/components/input";
import { Button } from "@/components/ui/button";
import { SEO_ACTIVITY_TYPE_OPTIONS } from "@/lib/frontend/seo-activities/constants";
import { isValidIsoDate } from "@/lib/frontend/seo-activities/date-range.utils";
import {
  buildSeoActivityFromQuickAdd,
  emptyQuickAddValues,
  type TSeoActivityQuickAddValues,
} from "@/lib/frontend/seo-activities/quick-add.utils";
import { sanitizeHttpUrl } from "@/lib/frontend/seo-activities/sanitize-url.utils";
import { overlayClass } from "@/lib/frontend/theme/chrome-tones";
import type {
  TSeoActivityBacklink,
  TSeoActivityBlog,
  TSeoActivityType,
  TSeoActivityWebChange,
} from "@/types/seo-activity.types";
import { cn } from "@/lib/utils";

type TSeoActivityQuickAddProps = {
  open: boolean;
  initialType: TSeoActivityType;
  onOpenChange: (open: boolean) => void;
  onCreate: (
    type: TSeoActivityType,
    row: TSeoActivityBlog | TSeoActivityBacklink | TSeoActivityWebChange,
  ) => void;
};

export function SeoActivityQuickAdd({
  open,
  initialType,
  onOpenChange,
  onCreate,
}: TSeoActivityQuickAddProps) {
  const { t } = useTranslation("translation", { keyPrefix: "modules.seoActivities.quickAdd" });
  const titleId = useId();
  const descriptionId = useId();
  const [type, setType] = useState<TSeoActivityType>(initialType);
  const [mounted, setMounted] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TSeoActivityQuickAddValues>({
    defaultValues: emptyQuickAddValues(),
    mode: "onSubmit",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    setType(initialType);
    reset(emptyQuickAddValues());
  }, [open, initialType, reset]);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onOpenChange(false);
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onOpenChange]);

  function onTypeChange(next: TSeoActivityType) {
    setType(next);
    reset(emptyQuickAddValues());
  }

  function onSubmit(values: TSeoActivityQuickAddValues) {
    const row = buildSeoActivityFromQuickAdd(type, values);
    onCreate(type, row);
    onOpenChange(false);
  }

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-center sm:p-6">
      <button
        type="button"
        aria-label={t("close")}
        className={cn("absolute inset-0 backdrop-blur-[2px]", overlayClass)}
        onClick={() => onOpenChange(false)}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="relative z-10 flex max-h-[min(92vh,40rem)] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-border bg-bg-card shadow-(--shadow)"
      >
        <header className="relative shrink-0 border-b border-border px-5 pb-4 pt-5 sm:px-6">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="absolute inset-e-3 top-3 rounded-lg p-1.5 text-text-muted transition-colors hover:bg-bg-hover hover:text-text-primary"
          >
            <IoClose className="size-4" aria-hidden />
            <span className="sr-only">{t("close")}</span>
          </button>

          <h2 id={titleId} className="type-title text-text-primary pe-8">
            {t("title")}
          </h2>
          <p id={descriptionId} className="mt-1 type-caption text-text-muted">
            {t("lead")}
          </p>

          <div
            className="mt-4 inline-flex w-full max-w-full flex-wrap items-center gap-1 rounded-2xl border border-border bg-bg-input p-1"
            role="tablist"
            aria-label={t("tabsAriaLabel")}
          >
            {SEO_ACTIVITY_TYPE_OPTIONS.map((option) => {
              const isActive = type === option;
              return (
                <button
                  key={option}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => onTypeChange(option)}
                  className={cn(
                    "min-w-0 flex-1 rounded-xl px-3 py-2 type-label transition-colors",
                    isActive
                      ? "bg-brand text-text-on-brand"
                      : "text-text-secondary hover:bg-bg-hover hover:text-text-primary",
                  )}
                >
                  {t(`tabs.${option}`)}
                </button>
              );
            })}
          </div>
        </header>

        <form
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5 sm:px-6">
            {type === "blogs" ? (
              <Input
                id="seo-quick-add-title"
                label={t("fields.title")}
                placeholder={t("fields.titlePh")}
                required
                error={errors.title?.message}
                {...register("title", {
                  required: t("validation.required"),
                  minLength: { value: 3, message: t("validation.minTitle") },
                })}
              />
            ) : null}

            {type === "backlinks" ? (
              <Input
                id="seo-quick-add-anchor"
                label={t("fields.anchorText")}
                placeholder={t("fields.anchorTextPh")}
                required
                error={errors.anchorText?.message}
                {...register("anchorText", {
                  required: t("validation.required"),
                  minLength: { value: 2, message: t("validation.minAnchor") },
                })}
              />
            ) : null}

            {type === "web_changes" ? (
              <Input
                id="seo-quick-add-details"
                type="textarea"
                rows={3}
                label={t("fields.details")}
                placeholder={t("fields.detailsPh")}
                required
                error={errors.details?.message}
                {...register("details", {
                  required: t("validation.required"),
                  minLength: { value: 4, message: t("validation.minDetails") },
                })}
              />
            ) : null}

            <Input
              id="seo-quick-add-url"
              type="url"
              label={t("fields.url")}
              placeholder={t("fields.urlPh")}
              required
              error={errors.url?.message}
              {...register("url", {
                required: t("validation.required"),
                validate: (value) =>
                  Boolean(sanitizeHttpUrl(value)) || t("validation.url"),
              })}
            />

            <Input
              id="seo-quick-add-date"
              type="date"
              label={t("fields.occurredOn")}
              required
              error={errors.occurredOn?.message}
              {...register("occurredOn", {
                required: t("validation.required"),
                validate: (value) => isValidIsoDate(value) || t("validation.date"),
              })}
            />
          </div>

          <footer className="flex shrink-0 flex-col-reverse gap-2 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-6">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto"
            >
              {t("cancel")}
            </Button>
            <Button
              type="submit"
              variant="gradient"
              size="md"
              disabled={isSubmitting}
              className="w-full sm:min-w-36 sm:w-auto"
            >
              {t("submit")}
            </Button>
          </footer>
        </form>
      </div>
    </div>,
    document.body,
  );
}
