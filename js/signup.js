// /js/signup.js
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", () => {
    const sb = SupabaseClient.getClient();
    const form = document.getElementById("signupForm");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;
      const username = document.getElementById("username").value.trim();
      const displayName = document.getElementById("displayName").value.trim();
      const location = document.getElementById("location").value.trim();

      if (!email || !password || !username || !displayName) {
        Util.toast("Missing info", "All required fields must be filled.");
        return;
      }

      const { error } = await sb.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            display_name: displayName,
            location
          }
        }
      });

      if (error) {
        Util.toast("Signup failed", error.message);
        return;
      }

      window.location.href = "login.html";
    });
  });
})();