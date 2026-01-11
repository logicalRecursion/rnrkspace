// /js/login.js
(function () {
  "use strict";

  const sb = SupabaseClient.getClient();
  const form = document.getElementById("loginForm");
  const emailInput = document.getElementById("email");

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();
    if (!email) return;

    const { error } = await sb.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin + "/index.html"
      }
    });

    if (error) {
      Util.toast("Login failed", error.message);
      return;
    }

    Util.toast("Check your email", "We sent you a login link.");
  });
})();