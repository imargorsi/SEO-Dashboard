"use client";

import { useEffect, useState } from "react";
import { ToastContainer } from "@tarmiz/web-glass-toast";

/**
 * App-level glass toast host — mount once in providers.
 * Keep a stable wrapper for SSR hydration; only `ToastContainer` is client-gated
 * (it reads `window` in a useState initializer).
 */
export function Toaster() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="app-glass-toaster" data-toaster="glass">
      {mounted ? <ToastContainer /> : null}
    </div>
  );
}
