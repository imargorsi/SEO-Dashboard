"use client";

import { useEffect, useState } from "react";
import { I18nextProvider } from "react-i18next";
import type { i18n as I18nInstance } from "i18next";

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [i18n, setI18n] = useState<I18nInstance | null>(null);

  useEffect(() => {
    void import("@/i18n/config").then((mod) => {
      setI18n(mod.initI18n());
    });
  }, []);

  if (!i18n) {
    return children;
  }

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
