// /js/index.js
// Home page behavior (requires auth).

(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", async () => {
    window.Util.setYear();
    window.Util.renderTopbar("home");

    const ok = await window.AuthGuard.requireAuth();
    if (!ok) return;

    window.Util.renderTopbar("home");

    const { sb, user } = await window.AuthGuard.getSession();

    const badge = document.getElementById("userBadge");
    const card = document.getElementById("myCardText");
    const feedHost = document.getElementById("feed");

    if (badge) badge.textContent = user?.email || "Signed in";
    if (card) {
      card.textContent =
`Email: ${user?.email || "(unknown)"}
Member since: ${user?.created_at ? window.Util.formatTime(user.created_at) : "(unknown)"}`;
    }

    const btnPost = document.getElementById("btnPost");
    const btnRefresh = document.getElementById("btnRefresh");
    const postText = document.getElementById("postText");

    btnPost?.addEventListener("click", async () => {
      const text = (postText?.value || "").trim();
      if (!text) {
        window.Util.toast("Validation", "Please enter text before posting.");
        return;
      }

      btnPost.disabled = true;
      try {
        await window.Feed.addPost(sb, user, text);
        if (postText) postText.value = "";
        window.Util.toast("Success", "Post submitted.");
        await window.Feed.loadFeed(sb, user, feedHost);
      } catch (e) {
        console.error(e);
        window.Util.toast("Error", "Failed to submit post.");
      } finally {
        btnPost.disabled = false;
      }
    });

    btnRefresh?.addEventListener("click", async () => {
      btnRefresh.disabled = true;
      await window.Feed.loadFeed(sb, user, feedHost);
      btnRefresh.disabled = false;
    });

    await window.Feed.loadFeed(sb, user, feedHost);
  });
})();