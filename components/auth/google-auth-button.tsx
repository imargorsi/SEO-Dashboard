"use client";

import { FcGoogle } from "react-icons/fc";
import { useTranslation } from "react-i18next";

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
    <div className="mt-6">
      <div className="flex items-center gap-3 type-overline text-text-muted">
        <span className="h-px flex-1 bg-border" aria-hidden />
        <span>{t("continueWith")}</span>
        <span className="h-px flex-1 bg-border" aria-hidden />
      </div>

      <div className="mt-4">
        <Button
          type="button"
          variant="outlined"
          size="lg"
          className="w-full"
          disabled={disabled}
          onClick={startGoogleSignIn}
        >
          <FcGoogle className="size-4 shrink-0" aria-hidden />
          <span>{t("continueGoogle")}</span>
        </Button>
      </div>
    </div>
  );
}
