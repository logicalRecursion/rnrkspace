// /js/auth-guard.js
(function () {
  "use strict";

  const sb = SupabaseClient.getClient();

  // Prevent multiple redirects in a single page lifecycle
  let redirecting = false;

  async function requireAuth() {
    // Never run on login-related pages
    const path = window.location.pathname;

    if (
      path.endsWith("/login.html") ||
      path.endsWith("/signup.html") ||
      path.endsWith("/congrats.html") ||
      path.endsWith("/404.html") ||
      path === "/" && document.getElementById("loginForm")
    ) {
      return;
    }

    // Wait for Supabase to fully hydrate session
    const { data, error } = await sb.auth.getSession();

    if (error) {
      console.warn("Auth guard error:", error);
      return;
    }

    // If no session, redirect ONCE
    if (!data.session && !redirecting) {
      redirecting = true;

      // Small delay prevents Safari hard-loop behavior
      setTimeout(() => {
        window.location.replace("login.html");
      }, 50);
    }
  }

  document.addEventListener("DOMContentLoaded", requireAuth);
})();