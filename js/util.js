// /js/util.js
(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);

  function setYear() {
    const y = $("yr");
    if (y) y.textContent = new Date().getFullYear();
  }

  function toast(title, msg) {
    const t = $("toast");
    if (!t) return;

    t.querySelector(".t-title").textContent = title;
    t.querySelector(".t-msg").textContent = msg;
    t.classList.add("show");

    setTimeout(() => t.classList.remove("show"), 4000);
  }

  async function logout() {
    const sb = SupabaseClient.getClient();
    await sb.auth.signOut();
    window.location.href = "login.html";
  }

  function renderTopbar(active = "") {
    const el = $("topbar");
    if (!el) return;

    el.innerHTML = `
      <div class="topbar-inner">
        <div class="brand">
          <img src="logos/oldpeoplespace.png" alt="">
          <div class="brand-text">
            <div class="brand-title">OldPeopleSpace</div>
            <div class="brand-tag">A Place for Old Faces</div>
          </div>
        </div>

        <nav class="topnav">
          <a class="toplink ${active==="home"?"active":""}" href="index.html">Home</a>
          <a class="toplink ${active==="profile"?"active":""}" href="p.html">My Profile</a>
          <a class="toplink ${active==="settings"?"active":""}" href="settings.html">Settings</a>
          <button class="toplink" id="btnLogout">Log Out</button>
        </nav>
      </div>
    `;

    $("btnLogout").onclick = logout;
  }

  window.Util = { setYear, toast, renderTopbar };
})();