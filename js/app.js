// /js/app.js
(function () {
  "use strict";

  /**
   * App-level bootstrapping:
   * - Sets footer year
   * - Renders topbar if a #topbar container exists (pages that use it)
   * - Adds lightweight global error handling (toast)
   * - Handles internal navigation links consistently
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

    // Global error surfacing (kept user-friendly)
    window.addEventListener("error", () => {
      window.Util?.toast?.("Oops", "Something went wrong. Try refreshing the page.");
    });

    window.addEventListener("unhandledrejection", () => {
      window.Util?.toast?.("Oops", "Something went wrong. Try refreshing the page.");
    });

    // ------------------------------------------------------------
    // Internal navigation handling
    // ------------------------------------------------------------
    document.addEventListener("click", (event) => {
      const link = event.target.closest("a");
      if (!link) return;

      const href = link.getAttribute("href");
      if (!href) return;

      // Allow:
      // - external links
      // - mailto / tel
      // - anchors
      // - explicit new-tab
      if (
        href.startsWith("http") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("#") ||
        link.target === "_blank"
      ) {
        return;
      }

      // Allow full page loads for known real HTML pages
      // (profile editor, settings, etc.)
      const fullPageAllowList = [
        "p.html",
        "profile.html",
        "settings.html"
      ];

      if (fullPageAllowList.some(page => href.endsWith(page))) {
        return;
      }

      // At this point, treat as internal navigation
      event.preventDefault();

      // Normalize path
      let next = href.replace(/^\.\//, "");

      // Home
      if (next === "/" || next === "index.html") {
        window.location.href = "/";
        return;
      }

      // Known app pages
      if (
        next === "login.html" ||
        next === "signup.html" ||
        next === "tour.html"
      ) {
        window.location.href = next;
        return;
      }

      // Fallback: allow browser to handle it
      window.location.href = next;
    });
  });
})();