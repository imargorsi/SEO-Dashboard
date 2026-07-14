/** Shared dashboard chrome classes — keep sidebar brand row and top bar aligned. */
export const dashboardHeaderRowClass =
  "flex h-14 shrink-0 items-center border-b border-border";

export const dashboardHeaderTitleClass = "text-sm font-semibold leading-none text-text-primary";

export const dashboardNavIconClass =
  "inline-flex size-9 shrink-0 items-center justify-center rounded-lg border-0 bg-transparent p-0 text-text-muted transition-colors hover:bg-bg-hover hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-border)] focus-visible:ring-offset-2 focus-visible:ring-offset-bg-card active:scale-[0.98]";

/** Elevated card/panel surface — tuned in globals.css (`--bg-card-elevated`, `--border-elevated`, `--shadow-elevated`). */
export const elevatedCardSurfaceClass =
  "border border-(--border-elevated) bg-bg-card-elevated text-(--text-on-elevated) shadow-(--shadow-elevated)";

export const elevatedCardTitleClass = "text-(--text-on-elevated)";

export const elevatedCardBodyClass = "text-(--text-on-elevated-secondary)";

export const elevatedCardMutedClass = "text-(--text-on-elevated-muted)";

/** Sidebar shell — wider than content chrome, distinct surface from main modules. */
export const sidebarShellClass =
  "flex h-full max-h-svh w-full shrink-0 flex-col border-b border-border bg-bg-sidebar transition-[width] duration-200 ease-out md:border-b-0 md:border-e";

export const sidebarShellExpandedClass = "md:w-60";

export const sidebarShellCollapsedClass = "md:w-[4.5rem]";

/** RankRadar logo mark + wordmark in the sidebar header. */
export const sidebarBrandRowClass =
  "relative flex h-[4.25rem] shrink-0 items-center justify-center px-4";

export const sidebarBrandRowCollapsedClass = "md:px-2";

/** Desktop collapse/expand control. */
export const sidebarCollapseToggleClass =
  "hidden w-full items-center gap-3 rounded-xl px-3 py-2.5 type-body-strong text-text-muted transition-colors hover:bg-bg-hover hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--accent-border) focus-visible:ring-offset-2 focus-visible:ring-offset-bg-sidebar md:inline-flex";

export const sidebarCollapseToggleCollapsedClass = "md:justify-center md:px-0";

/** Nav link: gradient pill for active / hover. */
export const sidebarNavLinkClass =
  "group relative flex items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 type-body-strong transition-[border-color,background-color,box-shadow,transform,color] duration-200 before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:border before:border-border before:opacity-0 before:transition-opacity before:duration-200 hover:before:opacity-100 hover:shadow-[inset_0_1px_0_var(--bg-hover)] active:translate-y-px active:shadow-[inset_0_2px_0_var(--bg-hover)]";

export const sidebarNavLinkCollapsedClass = "md:justify-center md:gap-0 md:px-0";

export const sidebarNavLinkActiveClass =
  "border-0 bg-gradient-button text-text-on-brand shadow-none before:opacity-0 hover:before:opacity-0";

export const sidebarNavLinkInactiveClass =
  "text-text-secondary hover:border-border hover:bg-bg-card hover:text-text-primary";
