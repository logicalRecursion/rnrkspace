// /js/app.js
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", async () => {
    // footer year
    window.Util?.setYear?.();

    const sb = SupabaseClient.getClient();

    // render topbar if present
    const hasTopbar = document.getElementById("topbar");
    if (hasTopbar && window.Util?.renderTopbar) {
      window.Util.renderTopbar("");
    }

    // ensure profile exists AFTER login
    const { data } = await sb.auth.getSession();
    const user = data.session?.user;
    if (!user) return;

    const { data: existing } = await sb
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (existing) return;

    const meta = user.user_metadata || {};

    const { error } = await sb.from("profiles").insert({
      id: user.id,
      email: user.email,
      username: meta.username || user.email.split("@")[0],
      display_name: meta.display_name || "New Member",
      location: meta.location || ""
    });

    if (error) {
      console.error("Profile auto-create failed:", error);
      Util.toast(
        "Profile error",
        "Your account exists, but your profile needs attention."
      );
    }
  });
})();