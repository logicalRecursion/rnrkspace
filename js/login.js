// /js/login.js
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", () => {
    const sb = SupabaseClient.getClient();

    const form = document.getElementById("loginForm");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");

    if (!form || !emailInput || !passwordInput) {
      console.warn("Login form not found");
      return;
    }

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = emailInput.value.trim();
      const password = passwordInput.value;

      if (!email || !password) {
        Util.toast("Missing info", "Please enter email and password.");
        return;
      }

      const { error } = await sb.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        Util.toast("Login failed", error.message);
        return;
      }

      // Success → go home
      window.location.href = "index.html";
    });
  });
})();