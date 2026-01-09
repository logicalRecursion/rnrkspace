// /js/profile.js
(function () {
  "use strict";

  function renderTop8(host) {
    if (!host) return;

    const names = [
      "Classic Vinyl",
      "Garden Club",
      "Sunday Crossword",
      "Old Photos",
      "Home Cooking",
      "Vintage Movies",
      "Walking Group",
      "Local News",
    ];

    host.innerHTML = names
      .map(
        (n, i) => `
          <div class="post">
            <div class="post-meta">
              <span>#${i + 1}</span>
              <span>Top 8</span>
            </div>
            <div class="post-body">${window.Util.escapeHtml(n)}</div>
          </div>
        `
      )
      .join("");
  }

  async function loadProfileByUserId(sb, userId) {
    const { data, error } = await sb
      .from("ops_profiles")
      .select("display_name,bio,username,user_id")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw error;
    return data || null;
  }

  async function loadProfileByUsername(sb, username) {
    const { data, error } = await sb
      .from("ops_profiles")
      .select("display_name,bio,username,user_id")
      .eq("username", username)
      .maybeSingle();
    if (error) throw error;
    return data || null;
  }

  async function saveProfile(sb, userId, display_name, bio) {
    const { error } = await sb.from("ops_profiles").upsert({
      user_id: userId,
      display_name,
      bio,
    });
    if (error) throw error;
  }

  document.addEventListener("DOMContentLoaded", async () => {
    window.Util.setYear();

    const pageMode = document.body?.dataset?.profileMode || "me";
    const url = new URL(window.location.href);
    const usernameParam = (url.searchParams.get("u") || "").trim();

    window.Util.renderTopbar("profile");

    const sb = window.SupabaseClient.getClient();
    if (!sb) {
      window.Util.toast("Setup needed", "Update /js/config.js with your Supabase URL and anon key.");
      return;
    }

    const top8Host = document.getElementById("top8");
    const myPostsHost = document.getElementById("myPosts");

    const profileName = document.getElementById("profileName");
    const profileSummary = document.getElementById("profileSummary");
    const displayNameEl = document.getElementById("displayName");
    const bioEl = document.getElementById("bio");
    const btnSave = document.getElementById("btnSaveProfile");

    renderTop8(top8Host);

    if (pageMode === "me") {
      window.Util.applyProfileCssFromLocalStorage();

      const ok = await window.AuthGuard.requireAuth();
      if (!ok) return;

      window.Util.renderTopbar("profile");
      const { user } = await window.AuthGuard.getSession();

      if (profileName) profileName.textContent = (user?.email || "user").split("@")[0];
      if (profileSummary) {
        profileSummary.textContent =
`Email: ${user?.email || "(unknown)"}
Created: ${user?.created_at ? window.Util.formatTime(user.created_at) : "(unknown)"}`;
      }

      const localKey = `ops_profile_${user.id}`;
      let profile = { display_name: "", bio: "" };

      try {
        const dbProfile = await loadProfileByUserId(sb, user.id);
        if (dbProfile) profile = dbProfile;
        else {
          const saved = JSON.parse(localStorage.getItem(localKey) || "null");
          if (saved) profile = saved;
        }
      } catch (e) {
        const saved = JSON.parse(localStorage.getItem(localKey) || "null");
        if (saved) profile = saved;
      }

      if (displayNameEl) displayNameEl.value = profile.display_name || "";
      if (bioEl) bioEl.value = profile.bio || "";

      btnSave?.addEventListener("click", async () => {
        const display_name = (displayNameEl?.value || "").trim();
        const bio = (bioEl?.value || "").trim();

        btnSave.disabled = true;
        try {
          await saveProfile(sb, user.id, display_name, bio);
          window.Util.toast("Saved", "Your profile has been updated.");
        } catch (e) {
          localStorage.setItem(localKey, JSON.stringify({ display_name, bio }));
          window.Util.toast("Saved", "Your profile has been updated.");
        } finally {
          btnSave.disabled = false;
        }
      });

      await window.Feed.loadMyPosts(sb, user, myPostsHost);
      return;
    }

    if (pageMode === "public") {
      const { session, user } = await window.AuthGuard.getSession();

      try {
        let profile = null;

        if (usernameParam) profile = await loadProfileByUsername(sb, usernameParam);
        else if (session && user) profile = await loadProfileByUserId(sb, user.id);

        if (!profile) {
          if (profileName) profileName.textContent = "Profile";
          if (profileSummary) profileSummary.textContent = "A Place for Old Faces";
          if (displayNameEl) displayNameEl.value = "";
          if (bioEl) bioEl.value = "";
          return;
        }

        if (profileName) profileName.textContent = profile.username || "Profile";
        if (profileSummary) profileSummary.textContent = "A Place for Old Faces";
        if (displayNameEl) displayNameEl.value = profile.display_name || "";
        if (bioEl) bioEl.value = profile.bio || "";
      } catch (e) {
        console.error(e);
        window.Util.toast("Error", "Unable to load profile.");
      }
    }
  });
})();