// /js/index.js
(function () {
  "use strict";

  const sb = SupabaseClient.getClient();
  const $ = (id) => document.getElementById(id);

  async function initHome() {
    Util.renderTopbar("home");

    const card = $("myCardText");
    const badge = $("userBadge");

    // Immediately clear placeholders
    if (card) card.textContent = "Welcome back.";
    if (badge) badge.textContent = "Member";

    const { data } = await sb.auth.getSession();
    if (!data.session) return;

    const user = data.session.user;

    if (card) {
      card.textContent = `Logged in as ${user.email}`;
    }
  }

  document.addEventListener("DOMContentLoaded", initHome);
})();