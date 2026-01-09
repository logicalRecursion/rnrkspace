// /js/settings.js
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", async () => {
    window.Util.setYear();
    window.Util.renderTopbar("settings");

    const ok = await window.AuthGuard.requireAuth();
    if (!ok) return;

    window.Util.renderTopbar("settings");

    const { user } = await window.AuthGuard.getSession();

    const acctBadge = document.getElementById("acctBadge");
    const acctInfo = document.getElementById("acctInfo");
    const btnSignOut2 = document.getElementById("btnSignOut2");

    if (acctBadge) acctBadge.textContent = user?.email || "Signed in";
    if (acctInfo) {
      acctInfo.textContent =
`Email: ${user?.email || "(unknown)"}
User ID: ${user?.id || "(unknown)"}
Created: ${user?.created_at ? window.Util.formatTime(user.created_at) : "(unknown)"}`;
    }

    btnSignOut2?.addEventListener("click", window.Util.signOut);

    const cssEl = document.getElementById("customCss");
    const btnSave = document.getElementById("btnSaveCss");
    const btnReset = document.getElementById("btnResetCss");

    if (cssEl) cssEl.value = localStorage.getItem("ops_custom_css") || "";

    btnSave?.addEventListener("click", () => {
      localStorage.setItem("ops_custom_css", cssEl?.value || "");
      window.Util.toast("Saved", "Your profile style has been updated.");
    });

    btnReset?.addEventListener("click", () => {
      localStorage.removeItem("ops_custom_css");
      if (cssEl) cssEl.value = "";
      window.Util.toast("Reset", "Profile style cleared.");
    });
  });
})();