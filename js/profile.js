// /js/profile.js
(function () {
  "use strict";

  const sb = SupabaseClient.getClient();
  const $ = (id) => document.getElementById(id);

  async function loadProfile() {
    Util.renderTopbar("profile");

    const { data } = await sb.auth.getSession();
    if (!data.session) {
      window.location.href = "login.html";
      return;
    }

    const user = data.session.user;

    $("email").textContent = user.email;
    $("displayName").textContent = "Loading profile…";
    $("bio").textContent = "";

    const { data: profile } = await sb
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (!profile) {
      $("displayName").textContent = "Profile not set up yet";
      $("bio").textContent = "You’ll be able to edit this soon.";
      return;
    }

    $("displayName").textContent =
      profile.display_name || "No display name yet";
    $("bio").textContent = profile.bio || "No bio yet.";

    const avatar = $("avatar");
    if (avatar) {
      avatar.src = profile.avatar_url || "logos/oldpeoplespace.png";
    }
  }

  document.addEventListener("DOMContentLoaded", loadProfile);
})();