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
  "group relative flex items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 type-body-strong transition-[border-color,background-color,box-shadow,transform,color] duration-200 before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:border before:border-border before:opacity-0 before:transition-opacity before:duration-200 hover:before:opacity-100 hover:shadow-[inset_0_1px_0_var(--bg-hover)] active:translate-y-px active:shadow-[inset_0_2px_0_var(--bg-hover)]";

export const sidebarNavLinkActiveClass =
  "border-border bg-bg-card text-text-primary shadow-[inset_0_1px_0_var(--bg-hover)]";

export const sidebarNavLinkInactiveClass =
  "text-text-secondary hover:border-border hover:bg-bg-card hover:text-text-primary";
