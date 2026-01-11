// /js/util.js
(function () {
  "use strict";

  function $(id) {
    return document.getElementById(id);
  }

  function setYear() {
    const el = $("yr");
    if (el) el.textContent = new Date().getFullYear();
  }

  function toast(title, msg) {
    const t = $("toast");
    if (!t) return;

    t.querySelector(".t-title").textContent = title;
    t.querySelector(".t-msg").textContent = msg;

    t.classList.add("show");
    setTimeout(() => t.classList.remove("show"), 4200);
  }

  function renderTopbar(active) {
    const host = $("topbar");
    if (!host) return;

    host.innerHTML = `
      <div class="topbar">
        <div class="topbar-inner">
          <a class="brand" href="index.html">
            <img src="logos/oldpeoplespace.png" alt="">
            <div class="brand-text">
              <div class="brand-title">OldPeopleSpace</div>
              <div class="brand-tag">A Place for Old Faces</div>
            </div>
          </a>

          <nav class="topnav">
            <a class="toplink ${active === 'home' ? 'active' : ''}" href="index.html">Home</a>
            <a class="toplink ${active === 'profile' ? 'active' : ''}" href="p.html">My Profile</a>
            <a class="toplink ${active === 'friends' ? 'active' : ''}" href="friends.html">Find Friends</a>
            <a class="toplink ${active === 'settings' ? 'active' : ''}" href="settings.html">Settings</a>
          </nav>
        </div>
      </div>
    `;
  }

  window.Util = { setYear, toast, renderTopbar };
})();