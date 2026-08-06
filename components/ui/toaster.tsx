"use client";

import { ToastContainer } from "@tarmiz/web-glass-toast";

/** App-level glass toast host — mount once in providers. */
export function Toaster() {
  return (
    <div className="app-glass-toaster" data-toaster="glass">
      <ToastContainer />
    </div>
  );
}
