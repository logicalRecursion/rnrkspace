// /js/profile.js
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", async () => {
    const sb = SupabaseClient.getClient();

    const { data } = await sb.auth.getSession();
    const user = data.session?.user;
    if (!user) return;

    const view = document.getElementById("profileView");
    const edit = document.getElementById("profileEdit");

    const avatarView = document.getElementById("avatarView");
    const displayNameView = document.getElementById("displayNameView");
    const locationView = document.getElementById("locationView");
    const bioView = document.getElementById("bioView");

    const avatarInput = document.getElementById("avatarInput");
    const displayNameInput = document.getElementById("displayNameInput");
    const locationInput = document.getElementById("locationInput");
    const bioInput = document.getElementById("bioInput");

    const editBtn = document.getElementById("editBtn");
    const saveBtn = document.getElementById("saveBtn");
    const cancelBtn = document.getElementById("cancelBtn");

    let profile;

    async function loadProfile() {
      const { data, error } = await sb
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error || !data) {
        Util.toast("Error", "Unable to load profile.");
        return;
      }

      profile = data;

      avatarView.src = profile.avatar_url || "logos/oldpeoplespace.png";
      displayNameView.textContent = profile.display_name;
      locationView.textContent = profile.location || "";
      bioView.textContent = profile.bio || "No bio yet.";

      displayNameInput.value = profile.display_name;
      locationInput.value = profile.location || "";
      bioInput.value = profile.bio || "";
    }

    function showEdit() {
      view.classList.add("hidden");
      edit.classList.remove("hidden");
    }

    function showView() {
      edit.classList.add("hidden");
      view.classList.remove("hidden");
    }

    editBtn.addEventListener("click", showEdit);
    cancelBtn.addEventListener("click", showView);

    saveBtn.addEventListener("click", async () => {
      let avatarUrl = profile.avatar_url;

      if (avatarInput.files.length) {
        const file = avatarInput.files[0];
        const path = `${user.id}/avatar.png`;

        const { error: uploadError } = await sb.storage
          .from("avatars")
          .upload(path, file, { upsert: true });

        if (uploadError) {
          Util.toast("Upload error", uploadError.message);
          return;
        }

        const { data } = sb.storage
          .from("avatars")
          .getPublicUrl(path);

        avatarUrl = data.publicUrl;
      }

      const { error } = await sb
        .from("profiles")
        .update({
          display_name: displayNameInput.value.trim(),
          location: locationInput.value.trim(),
          bio: bioInput.value.trim(),
          avatar_url: avatarUrl
        })
        .eq("id", user.id);

      if (error) {
        Util.toast("Save failed", error.message);
        return;
      }

      showView();
      await loadProfile();
    });

    await loadProfile();
  });
})();