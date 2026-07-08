/** Shared dashboard chrome classes — keep sidebar brand row and top bar aligned. */
export const dashboardHeaderRowClass =
  "flex h-14 shrink-0 items-center border-b border-border";

export const dashboardHeaderTitleClass = "text-sm font-semibold leading-none text-text-primary";

export const dashboardNavIconClass =
  "inline-flex size-9 shrink-0 items-center justify-center rounded-lg border-0 bg-transparent p-0 text-text-muted transition-colors hover:bg-bg-hover hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-border)] focus-visible:ring-offset-2 focus-visible:ring-offset-bg-card active:scale-[0.98]";

/** Sidebar shell — wider than content chrome, distinct surface from main modules. */
export const sidebarShellClass =
  "flex w-full shrink-0 flex-col border-b border-border bg-bg-sidebar md:min-h-svh md:w-60 md:border-b-0 md:border-e";

/** RankRadar logo mark + wordmark in the sidebar header. */
export const sidebarBrandRowClass =
  "relative flex h-[4.25rem] shrink-0 items-center justify-center px-4";

/** Nav link: gradient pill for active / hover. */
export const sidebarNavLinkClass =
  "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-[background-image,background-color,color,filter] duration-200";

export const sidebarNavLinkActiveClass =
  "bg-gradient-button font-semibold text-text-on-brand shadow-[0_0_20px_var(--glow-purple)]";

export const sidebarNavLinkInactiveClass =
  "text-text-muted hover:bg-gradient-button hover:font-semibold hover:text-text-on-brand hover:shadow-[0_0_16px_var(--glow-purple)]";
