// /js/auth-guard.js
(function () {
  "use strict";

  const sb = SupabaseClient.getClient();

  async function requireAuth() {
    const { data } = await sb.auth.getSession();

    if (!data.session) {
      window.location.href = "login.html";
      return;
    }
  }

  document.addEventListener("DOMContentLoaded", requireAuth);
})();