(function () {
  "use strict";

  const sb = SupabaseClient.getClient();
  const $ = id => document.getElementById(id);

  async function addFriend(currentUserId, friendId) {
    const { error } = await sb
      .from("friends")
      .insert({
        user_id: currentUserId,
        friend_user_id: friendId
      });

    if (error) {
      Util.toast("Error", "Could not add friend");
      return false;
    }

    return true;
  }

  async function alreadyFriends(currentUserId, friendId) {
    const { data } = await sb
      .from("friends")
      .select("id")
      .eq("user_id", currentUserId)
      .eq("friend_user_id", friendId)
      .maybeSingle();

    return !!data;
  }

  async function loadPublicProfile() {
    const ok = await AuthGuard.requireAuth();
    if (!ok) return;

    Util.renderTopbar();

    const url = new URL(window.location.href);
    const username = url.searchParams.get("u");

    const { user } = await AuthGuard.getSession();

    const { data: profile } = await sb
      .from("profiles")
      .select("*")
      .eq("username", username)
      .single();

    if (!profile) {
      Util.toast("Error", "Profile not found");
      return;
    }

    $("profileAvatar").src = profile.avatar_url || "logos/oldpeoplespace.png";
    $("displayName").textContent = profile.display_name || profile.username;
    $("bio").textContent = profile.bio || "";

    const isFriend = await alreadyFriends(user.id, profile.id);
    const btn = $("btnAddFriend");

    if (isFriend) {
      btn.textContent = "✓ Friends";
      btn.disabled = true;
    }

    btn.onclick = async () => {
      const success = await addFriend(user.id, profile.id);
      if (success) {
        btn.textContent = "✓ Friends";
        btn.disabled = true;
        Util.toast("Added", "You are now friends");
      }
    };
  }

  async function loadMyTop4() {
    const { user } = await AuthGuard.getSession();
    if (!user) return;

    const { data: edges } = await sb
      .from("friends")
      .select("friend_user_id")
      .eq("user_id", user.id)
      .order("created_at")
      .limit(4);

    const ids = edges.map(e => e.friend_user_id);

    const { data: friends } = await sb
      .from("profiles")
      .select("username,display_name,avatar_url")
      .in("id", ids);

    const grid = $("friendsGrid");
    if (!grid) return;

    grid.innerHTML = "";

    friends.forEach(f => {
      const div = document.createElement("div");
      div.className = "friend-card";
      div.innerHTML = `
        <img class="friend-avatar" src="${f.avatar_url || 'logos/oldpeoplespace.png'}">
        <div class="friend-name">${f.display_name || f.username}</div>
      `;
      grid.appendChild(div);
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    const mode = document.body.dataset.profileMode;
    if (mode === "public") loadPublicProfile();
    else loadMyTop4();
  });
})();