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

      /* -------------------------------------------------
         1) Create Auth User
      ------------------------------------------------- */
      const { data, error: authError } = await sb.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/congrats.html`,
        },
      });

      if (authError || !data?.user) {
        btn.disabled = false;
        window.Util.toast(
          "Signup failed",
          authError?.message || "Unable to create account."
        );
        return;
      }

      const user = data.user;

      /* -------------------------------------------------
         2) Create Profile Row
      ------------------------------------------------- */
      const { error: profileError } = await sb
        .from("ops_profiles")
        .insert({
          user_id: user.id,
          username,
          display_name: displayName,
          bio: "",
        });

      if (profileError) {
        console.error("Profile insert failed:", profileError);

        // Make the reason clear to the user
        if (profileError.code === "23505") {
          window.Util.toast(
            "Username taken",
            "That username is already in use. Please choose another."
          );
        } else if (profileError.message?.includes("row-level security")) {
          window.Util.toast(
            "Almost there",
            "Your email needs to be confirmed before finishing setup."
          );
        } else {
          window.Util.toast(
            "Profile error",
            "Your account was created, but your profile could not be saved."
          );
        }

        btn.disabled = false;
        return;
      }

      /* -------------------------------------------------
         3) SUCCESS → Redirect
      ------------------------------------------------- */
      window.location.href = "congrats.html";
    });
  });
})();