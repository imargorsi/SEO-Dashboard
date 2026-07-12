/** Shared chrome / overlay classes — tokens live in `app/globals.css`. */

export const chromeControlToneClass = {
  default:
    "border-border bg-(--social-bg) text-text-primary shadow-(--shadow) hover:border-accent-border hover:bg-accent-bg hover:text-text-primary focus-visible:ring-accent-border focus-visible:ring-offset-bg-main",
  inverse:
    "border-0 bg-(--surface-inverse) text-(--text-inverse) shadow-none hover:bg-(--surface-inverse-hover) hover:text-(--text-inverse) focus-visible:ring-(--ring-inverse) focus-visible:ring-offset-0",
  ghost:
    "border-transparent bg-transparent text-(--text-ghost) shadow-none hover:bg-(--surface-ghost-hover) hover:text-(--text-ghost-hover) focus-visible:ring-(--ring-ghost) focus-visible:ring-offset-0",
} as const;

export const overlayClass = "bg-(--overlay)";
export const overlayStrongClass = "bg-(--overlay-strong)";
export const breadcrumbPageClass =
  "border-(--border-chrome-pill) bg-(--surface-chrome-pill) shadow-(--shadow-chrome-pill)";
export const breadcrumbChromeMutedClass = "text-(--text-chrome-muted)";
export const surfacePanelHeaderClass = "bg-(--surface-panel-header)";
