"use client";

import { useLayoutEffect } from "react";

/** Marks the document as hydrated so the boot watchdog does not show the fallback UI. */
export function AppHydrationMarker() {
  useLayoutEffect(() => {
    document.documentElement.setAttribute("data-app-hydrated", "true");
    const fallback = document.getElementById("crawllex-boot-fallback");
    if (fallback) fallback.hidden = true;
  }, []);

  return null;
}
