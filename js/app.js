// /js/app.js
(function () {
  "use strict";

  /**
   * App-level bootstrapping:
   * - Sets footer year
   * - Renders topbar if a #topbar container exists (pages that use it)
   * - Adds lightweight global error handling (toast) without exposing technical internals in UI
   */
  document.addEventListener("DOMContentLoaded", () => {
    // Footer year
    window.Util?.setYear?.();

    // Render topbar on pages that include a #topbar placeholder.
    // Page-specific scripts (index.js/settings.js/profile.js) can re-render with the active tab.
    const hasTopbar = document.getElementById("topbar");
    if (hasTopbar && window.Util?.renderTopbar) {
      window.Util.renderTopbar("");
    }

    // Optional: basic global error surfacing (kept user-friendly).
    window.addEventListener("error", () => {
      window.Util?.toast?.("Oops", "Something went wrong. Try refreshing the page.");
    });

    window.addEventListener("unhandledrejection", () => {
      window.Util?.toast?.("Oops", "Something went wrong. Try refreshing the page.");
    });
  });
})();