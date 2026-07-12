/** Panel slide duration — keep in sync with `.auth-reveal-panel` in `app/globals.css`. */
export const AUTH_REVEAL_PANEL_MS = 1500;

/** Dashboard enter stagger — keep in sync with `.dashboard-enter-*` delays in `app/globals.css`. */
export const AUTH_REVEAL_DASHBOARD_ENTER_DELAY_MS = 320;
export const AUTH_REVEAL_DASHBOARD_ENTER_DURATION_MS = 900;

/** Overlay lifetime — ends when the split animation finishes (dashboard shows through the gap). */
export const AUTH_REVEAL_TOTAL_MS = AUTH_REVEAL_PANEL_MS + 50;
