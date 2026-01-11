// /js/profile.js
(function () {
  "use strict";

  const sb = SupabaseClient.getClient();
  const $ = (id) => document.getElementById(id);

  async function loadProfile() {
    const { data: session } = await sb.auth.getSession();
    if (!session.session) {
      window.location.href = "login.html";
      return;
    }

    const user = session.session.user;

    Util.renderTopbar("profile");

    const { data, error } = await sb
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error || !data) {
      Util.toast("Error", "Profile not found");
      return;
    }

    $("avatar").src = data.avatar_url || "logos/oldpeoplespace.png";
    $("displayName").textContent = data.display_name || "(no display name)";
    $("email").textContent = user.email;
    $("bio").textContent = data.bio || "No bio yet.";
  }

  document.addEventListener("DOMContentLoaded", loadProfile);
})();