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

      // 1️⃣ Create auth user
      const { data, error: authError } = await sb.auth.signUp({
        email,
        password,
      });

      if (authError || !data?.user) {
        btn.disabled = false;
        window.Util.toast("Signup failed", authError?.message || "Unable to create account.");
        return;
      }

      const user = data.user;

      // 2️⃣ Create profile row
      const { error: profileError } = await sb
        .from("ops_profiles")
        .insert({
          user_id: user.id,
          username,
          display_name: displayName,
          bio: "",
        });

      if (profileError) {
        btn.disabled = false;
        window.Util.toast(
          "Profile error",
          "Your account was created, but your profile could not be saved."
        );
        console.error(profileError);
        return;
      }

      // 3️⃣ Success → onboarding
      window.location.href = "tour.html";
    });
  });
})();