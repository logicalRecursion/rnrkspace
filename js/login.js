// /js/login.js
// Login page behavior.

(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", async () => {
    window.Util.setYear();

    const sb = window.SupabaseClient.getClient();
    if (!sb) {
      window.Util.toast("Configuration required", "Update /js/config.js with your Supabase URL and anon key.");
      return;
    }

    // If already authenticated, redirect to home.
    const { session } = await window.AuthGuard.getSession();
    if (session) {
      window.location.href = "index.html";
      return;
    }

    const emailEl = document.getElementById("email");
    const passEl = document.getElementById("password");

    const btnLogin = document.getElementById("btnLogin");
    const btnSignup = document.getElementById("btnSignup");
    const btnMagic = document.getElementById("btnMagic");

    btnLogin?.addEventListener("click", async () => {
      const email = (emailEl?.value || "").trim();
      const password = (passEl?.value || "").trim();

      if (!email || !password) {
        window.Util.toast("Validation", "Email and password are required.");
        return;
      }

      btnLogin.disabled = true;
      const { error } = await sb.auth.signInWithPassword({ email, password });
      btnLogin.disabled = false;

      if (error) {
        console.error(error);
        window.Util.toast("Login failed", error.message);
        return;
      }

      window.location.href = "index.html";
    });

    btnSignup?.addEventListener("click", async () => {
      const email = (emailEl?.value || "").trim();
      const password = (passEl?.value || "").trim();

      if (!email || !password) {
        window.Util.toast("Validation", "Email and password are required.");
        return;
      }

      btnSignup.disabled = true;
      const { error } = await sb.auth.signUp({ email, password });
      btnSignup.disabled = false;

      if (error) {
        console.error(error);
        window.Util.toast("Signup failed", error.message);
        return;
      }

      window.Util.toast(
        "Account created",
        "If email confirmation is enabled, confirm your email before logging in."
      );
    });

    btnMagic?.addEventListener("click", async () => {
      const email = (emailEl?.value || "").trim();
      if (!email) {
        window.Util.toast("Validation", "Email is required.");
        return;
      }

      btnMagic.disabled = true;

      // Redirect to index.html after the email link completes authentication.
      const redirectTo = `${window.location.origin}${window.location.pathname.replace("login.html", "index.html")}`;

      const { error } = await sb.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirectTo },
      });

      btnMagic.disabled = false;

      if (error) {
        console.error(error);
        window.Util.toast("Magic link failed", error.message);
        return;
      }

      window.Util.toast("Magic link sent", "Please check your email.");
    });
  });
})();