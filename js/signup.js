// /js/signup.js
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", () => {
    console.log("Signup JS loaded");

    const sb = SupabaseClient.getClient();
    const form = document.getElementById("signupForm");

    if (!form) {
      console.error("signupForm not found");
      return;
    }

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      console.log("Signup submit triggered");

      const email = document.getElementById("email")?.value.trim();
      const password = document.getElementById("password")?.value;
      const username = document.getElementById("username")?.value.trim();
      const displayName = document.getElementById("displayName")?.value.trim();
      const location = document.getElementById("location")?.value.trim();

      if (!email || !password || !username || !displayName) {
        Util.toast("Missing info", "Please fill in all required fields.");
        return;
      }

      const { data, error } = await sb.auth.signUp({
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
        console.error("Signup error:", error);
        Util.toast("Signup failed", error.message);
        return;
      }

      console.log("Signup success:", data);

      window.location.href = "congrats.html";
    });
  });
})();