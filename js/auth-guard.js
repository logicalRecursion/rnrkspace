// /js/auth-guard.js
(function () {
  "use strict";

  const sb = SupabaseClient.getClient();

  // Pages that do NOT require auth
  const PUBLIC_PAGES = [
    "login.html",
    "signup.html",
    "congrats.html",
    "404.html"
  ];

  function isPublicPage() {
    const path = window.location.pathname;
    return PUBLIC_PAGES.some(p => path.endsWith(p));
  }

  async function requireAuth() {
    if (isPublicPage()) return;

    const { data } = await sb.auth.getSession();

    if (!data.session) {
      window.location.href = "login.html";
    }
  }

  document.addEventListener("DOMContentLoaded", requireAuth);
})();