(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", async () => {
    Util.renderTopbar("friends");

    const sb = SupabaseClient.getClient();
    const ok = await AuthGuard.requireAuth();
    if (!ok) return;

    const { user } = await AuthGuard.getSession();
    const grid = document.getElementById("friendsGrid");

    const { data: me } = await sb
      .from("profiles")
      .select("city,state")
      .eq("id", user.id)
      .single();

    const { data: people } = await sb
      .from("profiles")
      .select("id,username,display_name,avatar_url,city,state,location_visibility")
      .neq("id", user.id);

    const ranked = (people || []).sort((a, b) => {
      const score = p =>
        p.city === me.city && p.state === me.state ? 0 :
        p.state === me.state ? 1 :
        p.country === "US" ? 2 : 3;
      return score(a) - score(b);
    });

    grid.innerHTML = "";

    ranked.forEach(p => {
      let locationText = "";
      if (p.location_visibility === "city_state" && p.city && p.state) {
        locationText = `${p.city}, ${p.state}`;
      } else if (p.location_visibility === "state_only" && p.state) {
        locationText = p.state;
      }

      const card = document.createElement("div");
      card.className = "friend-card";
      card.innerHTML = `
        <a href="profile.html?u=${p.username}">
          <div class="friend-avatar-wrap">
            <img class="friend-avatar" src="${p.avatar_url || 'logos/oldpeoplespace.png'}">
          </div>
          <div class="friend-name">${p.display_name || p.username}</div>
          <div class="muted small">${locationText}</div>
        </a>
      `;
      grid.appendChild(card);
    });
  });
})();