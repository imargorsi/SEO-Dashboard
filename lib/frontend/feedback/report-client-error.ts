type TClientErrorContext = {
  scope: string;
  digest?: string;
  url?: string;
};

export function reportClientError(error: unknown, context: TClientErrorContext) {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;
  const payload = {
    scope: context.scope,
    message,
    stack,
    digest: context.digest,
    url: context.url ?? (typeof window !== "undefined" ? window.location.href : undefined),
    at: new Date().toISOString(),
  };

  console.error("[client-error]", payload);

  if (typeof window === "undefined") return;

  void fetch("/api/v1/client-errors", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => {
    // Best-effort only — never block the error UI.
  });
}
