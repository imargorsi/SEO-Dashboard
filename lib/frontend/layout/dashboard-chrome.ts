/** Shared dashboard chrome classes — keep sidebar brand row and top bar aligned. */
export const dashboardHeaderRowClass =
  "flex h-14 shrink-0 items-center border-b border-border";

export const dashboardHeaderTitleClass = "text-sm font-semibold leading-none text-text-primary";

export const dashboardNavIconClass =
  "inline-flex size-9 shrink-0 items-center justify-center rounded-lg border-0 bg-transparent p-0 text-text-muted transition-colors hover:bg-bg-hover hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-border)] focus-visible:ring-offset-2 focus-visible:ring-offset-bg-card active:scale-[0.98]";

/** Elevated card/panel surface — tuned in globals.css (`--bg-card-elevated`, `--border-elevated`, `--shadow-elevated`). */
export const elevatedCardSurfaceClass =
  "border border-(--border-elevated) bg-bg-card-elevated text-(--text-on-elevated) shadow-(--shadow-elevated) backdrop-blur-md transition-shadow duration-200 hover:shadow-[0_0_0_1px_var(--accent-border)]";

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
  "group hidden w-full items-center gap-3 rounded-2xl px-2.5 py-2 type-label text-text-muted transition-colors hover:bg-bg-hover hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--accent-border) focus-visible:ring-offset-2 focus-visible:ring-offset-bg-sidebar md:inline-flex";

export const sidebarCollapseToggleCollapsedClass = "md:justify-center md:px-0";

/** Circular icon well inside sidebar nav rows. */
export const sidebarNavIconWellClass =
  "inline-flex size-8 shrink-0 items-center justify-center rounded-full border transition-[background-color,border-color,color] duration-200";

export const sidebarNavIconWellActiveClass =
  "border-transparent bg-text-on-brand/20 text-text-on-brand";

export const sidebarNavIconWellInactiveClass =
  "border-border/80 bg-bg-card text-text-muted group-hover:border-accent-border group-hover:bg-bg-hover group-hover:text-text-primary";

/** Nav link: soft pill + circular icon wells. */
export const sidebarNavLinkClass =
  "group relative flex items-center gap-3 rounded-2xl px-2.5 py-2 type-label transition-[border-color,background-color,background-image,color] duration-200";

export const sidebarNavLinkCollapsedClass = "md:justify-center md:gap-0 md:px-0";

/** Keep gradient as background-image only — avoid border/bg-color utilities that punch holes in it. */
export const sidebarNavLinkActiveClass =
  "border-0 bg-gradient-button text-text-on-brand shadow-none hover:bg-gradient-button";

export const sidebarNavLinkInactiveClass =
  "border border-transparent bg-transparent text-text-secondary hover:border-border hover:bg-bg-card/80 hover:text-text-primary";

export const sidebarNavItemDividerClass = "border-b border-border/40";

export const sidebarNavGroupClass = "flex flex-col gap-1";

export const sidebarNavGroupLabelClass =
  "px-2.5 pb-0.5 pt-1 type-caption-xs text-text-muted";
