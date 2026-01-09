// /js/auth-guard.js
(function () {
  "use strict";

  async function getSession() {
    const sb = window.SupabaseClient?.getClient?.();
    if (!sb) return { sb: null, session: null, user: null };

    const { data } = await sb.auth.getSession();
    const session = data?.session || null;
    return { sb, session, user: session?.user || null };
  }

  async function requireAuth() {
    const { session } = await getSession();
    if (!session) {
      window.location.href = "login.html";
      return false;
    }
    return true;
  }

  window.AuthGuard = { getSession, requireAuth };
})();