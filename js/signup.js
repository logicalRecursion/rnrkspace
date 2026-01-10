(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", async () => {
    window.Util.setYear();
    window.Util.renderTopbar("");

    const sb = window.SupabaseClient.getClient();
    if (!sb) {
      window.Util.toast("Setup needed", "Supabase is not configured.");
      return;
    }

    const btn = document.getElementById("btnCreate");

    btn.addEventListener("click", async () => {
      const username = document.getElementById("username").value.trim();
      const displayName = document.getElementById("displayName").value.trim();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();

      if (!username || !displayName || !email || !password) {
        window.Util.toast("Missing info", "All fields are required.");
        return;
      }

      btn.disabled = true;

      const { data, error } = await sb.auth.signUp({
        email,
        password,
      });

      if (error) {
        window.Util.toast("Signup failed", error.message);
        btn.disabled = false;
        return;
      }

      const user = data.user;

      await sb.from("ops_profiles").insert({
        user_id: user.id,
        username,
        display_name: displayName,
        bio: "",
      });

      window.location.href = "tour.html";
    });
  });
})();