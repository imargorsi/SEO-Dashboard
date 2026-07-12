/** Auth layout + form card — tokens in `app/globals.css` (`--auth-*`). */

export const authFormPanelClass = "relative z-10 flex min-h-0 flex-1 flex-col";

export const authHeroPanelClass = "relative z-10 flex min-h-0 flex-1 flex-col";

export const authFormCardSurfaceClass =
  "relative overflow-hidden rounded-2xl border border-(--auth-form-border) bg-(--auth-form-bg) shadow-(--auth-form-shadow) before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-0.5 before:bg-(--auth-form-highlight)";
