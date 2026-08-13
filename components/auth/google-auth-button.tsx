"use client";

import { useTranslation } from "react-i18next";

import { GoogleBrandMark } from "@/components/auth/google-brand-mark";
import { Button } from "@/components/ui/button";

type GoogleAuthButtonProps = {
  disabled?: boolean;
};

/** Full-page navigate to the OAuth start route (avoids popup blockers). */
export function GoogleAuthButton({ disabled = false }: GoogleAuthButtonProps) {
  const { t } = useTranslation("translation", { keyPrefix: "auth.signIn" });

  function startGoogleSignIn() {
    window.location.assign("/api/v1/auth/google/redirect");
  }

  return (
    <div className="mt-8">
      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-border/70 dark:bg-text-primary/20" aria-hidden />
        <span className="type-caption text-text-muted">{t("continueWith")}</span>
        <span className="h-px flex-1 bg-border/70 dark:bg-text-primary/20" aria-hidden />
      </div>

      <div className="mt-5">
        <Button
          type="button"
          variant="outlined"
          size="lg"
          className="w-full"
          disabled={disabled}
          onClick={startGoogleSignIn}
        >
          <GoogleBrandMark size={20} className="shrink-0" />
          <span>{t("continueGoogle")}</span>
        </Button>
      </div>
    </div>
  );
}
