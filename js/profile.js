// /js/profile.js
(function () {
  "use strict";

  const PROFILES_TABLE = "profiles";

  function $(id) {
    return document.getElementById(id);
  }

  function setAvatar(imgEl, url) {
    if (!imgEl) return;
    imgEl.src = url || "logos/oldpeoplespace.png";
    imgEl.alt = "Profile picture";
  }

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

    host.innerHTML = "";
    names.forEach((n, i) => {
      const tile = document.createElement("a");
      tile.className = "top8-tile";
      tile.href = "#";
      tile.innerHTML = `<div class="top8-num">${i + 1}</div><div class="top8-name">${n}</div>`;
      host.appendChild(tile);
    });
  }

  async function loadProfileById(sb, id) {
    const { data, error } = await sb
      .from(PROFILES_TABLE)
      .select("id,username,display_name,bio,avatar_url")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data || null;
  }

  async function loadProfileByUsername(sb, username) {
    const { data, error } = await sb
      .from(PROFILES_TABLE)
      .select("id,username,display_name,bio,avatar_url")
      .eq("username", username)
      .maybeSingle();
    if (error) throw error;
    return data || null;
  }

  async function updateProfile(sb, id, payload) {
    const { error } = await sb.from(PROFILES_TABLE).update(payload).eq("id", id);
    if (error) throw error;
  }

  async function loadTopFriends(sb, userId, limit = 4) {
    const { data: edges, error: e1 } = await sb
      .from("friends")
      .select("friend_user_id,created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
      .limit(limit);

    if (e1) throw e1;

    const ids = (edges || []).map((r) => r.friend_user_id).filter(Boolean);
    if (!ids.length) return [];

    const { data: people, error: e2 } = await sb
      .from(PROFILES_TABLE)
      .select("id,display_name,username,avatar_url")
      .in("id", ids);

    if (e2) throw e2;

    const map = new Map((people || []).map((p) => [p.id, p]));
    return ids.map((id) => map.get(id)).filter(Boolean);
  }

  function renderFriends(host, friends) {
    if (!host) return;

    host.innerHTML = "";
    const items = friends && friends.length ? friends : [];

    const padded = items.slice(0, 4);
    while (padded.length < 4) padded.push(null);

    padded.forEach((f) => {
      const card = document.createElement("div");
      card.className = "friend-card";

      if (!f) {
        card.innerHTML = `
          <div class="friend-avatar-wrap">
            <div class="friend-avatar placeholder"></div>
          </div>
          <div class="friend-name muted">Open spot</div>
        `;
      } else {
        const href = `profile.html?u=${encodeURIComponent(f.username || "")}`;
        const avatar = f.avatar_url || "logos/oldpeoplespace.png";
        const name = f.display_name || "Friend";
        card.innerHTML = `
          <a class="friend-link" href="${href}">
            <div class="friend-avatar-wrap">
              <img class="friend-avatar" src="${avatar}" alt="${name}" />
            </div>
            <div class="friend-name">${name}</div>
          </a>
        `;
      }

      host.appendChild(card);
    });
  }

  function setEditingUI(isEditing) {
    const btnEdit = $("btnEditProfile");
    const btnSave = $("btnSaveProfile");
    const btnCancel = $("btnCancelProfile");
    const displayNameEl = $("displayName");
    const bioEl = $("bio");
    const avatarWrap = $("avatarEditRow");

    if (btnEdit) btnEdit.style.display = isEditing ? "none" : "";
    if (btnSave) btnSave.style.display = isEditing ? "" : "none";
    if (btnCancel) btnCancel.style.display = isEditing ? "" : "none";

    if (displayNameEl) displayNameEl.disabled = !isEditing;
    if (bioEl) bioEl.disabled = !isEditing;

    if (avatarWrap) avatarWrap.style.display = isEditing ? "" : "none";
  }

  async function uploadAvatar(sb, userId, file) {
    if (!file) return null;

    const ext = (file.name.split(".").pop() || "jpg")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");

    const path = `${userId}/avatar.${ext}`;

    const { error: upErr } = await sb.storage.from("avatars").upload(path, file, {
      upsert: true,
      contentType: file.type || "image/jpeg",
    });
    if (upErr) throw upErr;

    const { data } = sb.storage.from("avatars").getPublicUrl(path);
    return data?.publicUrl || null;
  }

  document.addEventListener("DOMContentLoaded", async () => {
    window.Util?.setYear?.();

    const sb = window.SupabaseClient.getClient();
    const pageMode = document.body?.dataset?.profileMode || "me";

    renderTop8($("top8"));

    const profileName = $("profileName");
    const profileSummary = $("profileSummary");
    const displayNameEl = $("displayName");
    const bioEl = $("bio");
    const avatarImg = $("profileAvatar");
    const friendsHost = $("friendsGrid");

    const btnEdit = $("btnEditProfile");
    const btnSave = $("btnSaveProfile");
    const btnCancel = $("btnCancelProfile");
    const avatarFile = $("avatarFile");
    const btnAvatar = $("btnUploadAvatar");

    const url = new URL(window.location.href);
    const usernameParam = (url.searchParams.get("u") || "").trim();

    let isEditing = false;
    let currentProfile = null;
    let pendingAvatarFile = null;

    function applyProfileToUI(p) {
      currentProfile = p;
      if (profileName) profileName.textContent = p?.username || "Profile";
      if (profileSummary) profileSummary.textContent = "A Place for Old Faces";
      if (displayNameEl) displayNameEl.value = p?.display_name || "";
      if (bioEl) bioEl.value = p?.bio || "";
      setAvatar(avatarImg, p?.avatar_url);
    }

    if (pageMode === "me") {
      const ok = await window.AuthGuard.requireAuth();
      if (!ok) return;

      window.Util.renderTopbar("profile");

      const { user } = await window.AuthGuard.getSession();
      if (!user) return;

      isEditing = false;
      setEditingUI(false);

      try {
        const dbProfile = await loadProfileById(sb, user.id);
        if (!dbProfile) {
          window.Util.toast("Profile missing", "We couldn’t find your profile row. Make sure signup creates a profile.");
          return;
        }
        applyProfileToUI(dbProfile);

        const friends = await loadTopFriends(sb, user.id, 4);
        renderFriends(friendsHost, friends);
      } catch (e) {
        console.error(e);
        window.Util.toast("Error", "Unable to load your profile.");
        return;
      }

      btnEdit?.addEventListener("click", () => {
        isEditing = true;
        pendingAvatarFile = null;
        setEditingUI(true);
      });

      btnCancel?.addEventListener("click", () => {
        isEditing = false;
        pendingAvatarFile = null;
        if (currentProfile) applyProfileToUI(currentProfile);
        setEditingUI(false);
        window.Util.toast("Cancelled", "No changes were saved.");
      });

      avatarFile?.addEventListener("change", () => {
        const f = avatarFile.files && avatarFile.files[0];
        if (!f) return;

        if (!/^image\//i.test(f.type || "")) {
          window.Util.toast("Nope", "Please choose an image file.");
          avatarFile.value = "";
          return;
        }
        if (f.size > 5 * 1024 * 1024) {
          window.Util.toast("Too big", "Please keep images under 5 MB.");
          avatarFile.value = "";
          return;
        }

        pendingAvatarFile = f;
        try {
          setAvatar(avatarImg, URL.createObjectURL(f));
        } catch (_) {}
      });

      btnAvatar?.addEventListener("click", async () => {
        if (!pendingAvatarFile) {
          window.Util.toast("Choose a photo", "Pick an image first.");
          return;
        }
        btnAvatar.disabled = true;
        try {
          const avatarUrl = await uploadAvatar(sb, user.id, pendingAvatarFile);
          await updateProfile(sb, user.id, { avatar_url: avatarUrl });
          const fresh = await loadProfileById(sb, user.id);
          if (fresh) applyProfileToUI(fresh);
          pendingAvatarFile = null;
          if (avatarFile) avatarFile.value = "";
          window.Util.toast("Saved", "Profile picture updated.");
        } catch (e) {
          console.error(e);
          window.Util.toast("Upload failed", "Could not upload that image. Try again.");
        } finally {
          btnAvatar.disabled = false;
        }
      });

      btnSave?.addEventListener("click", async () => {
        btnSave.disabled = true;
        try {
          const display_name = (displayNameEl?.value || "").trim();
          const bio = (bioEl?.value || "").trim();

          await updateProfile(sb, user.id, { display_name, bio });

          const fresh = await loadProfileById(sb, user.id);
          if (fresh) applyProfileToUI(fresh);

          isEditing = false;
          setEditingUI(false);
          window.Util.toast("Saved", "Your profile is updated.");
        } catch (e) {
          console.error(e);
          window.Util.toast("Error", "Unable to save profile.");
        } finally {
          btnSave.disabled = false;
        }
      });

      return;
    }

    // Public profile view mode
    window.Util.renderTopbar("");
    setEditingUI(false);

    try {
      const profile = usernameParam ? await loadProfileByUsername(sb, usernameParam) : null;

      if (!profile) {
        if (profileName) profileName.textContent = "Profile";
        if (profileSummary) profileSummary.textContent = "Profile not found.";
        if (displayNameEl) displayNameEl.value = "";
        if (bioEl) bioEl.value = "";
        setAvatar(avatarImg, null);
        renderFriends(friendsHost, []);
        return;
      }

      applyProfileToUI(profile);

      const friends = await loadTopFriends(sb, profile.id, 4);
      renderFriends(friendsHost, friends);
    } catch (e) {
      console.error(e);
      window.Util.toast("Error", "Unable to load profile.");
    }
  });
})();