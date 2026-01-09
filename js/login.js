// /js/login.js
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", async () => {
    window.Util.setYear();

    const sb = window.SupabaseClient.getClient();
    if (!sb) {
      window.Util.toast("Setup needed", "Update /js/config.js with your Supabase URL and anon key.");
      return;
    }

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
        window.Util.toast("Missing info", "Email and password are required.");
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
        window.Util.toast("Missing info", "Email and password are required.");
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

      window.Util.toast("Welcome", "Account created. If email confirmation is enabled, check your inbox.");
    });

    btnMagic?.addEventListener("click", async () => {
      const email = (emailEl?.value || "").trim();
      if (!email) {
        window.Util.toast("Missing info", "Enter your email first.");
        return;
      }

      btnMagic.disabled = true;

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

      window.Util.toast("Check your email", "Your magic link is on the way.");
    });
  });
})();