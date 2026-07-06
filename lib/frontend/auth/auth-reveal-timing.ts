/** Panel slide duration — keep in sync with `.auth-reveal-panel` in `app/globals.css`. */
export const AUTH_REVEAL_PANEL_MS = 1500;

/** Dashboard enter stagger — keep in sync with `.dashboard-enter-*` delays in `app/globals.css`. */
export const AUTH_REVEAL_DASHBOARD_ENTER_DELAY_MS = 780;
export const AUTH_REVEAL_DASHBOARD_ENTER_DURATION_MS = 1050;

/** Overlay + body scroll lock; must cover the longest running animation. */
export const AUTH_REVEAL_TOTAL_MS =
  AUTH_REVEAL_DASHBOARD_ENTER_DELAY_MS + AUTH_REVEAL_DASHBOARD_ENTER_DURATION_MS + 120;
