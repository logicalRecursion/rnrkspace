// /js/util.js
(function () {
  "use strict";

  function qs(sel, root = document) {
    return root.querySelector(sel);
  }

  function escapeHtml(str = "") {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function formatTime(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  function setYear() {
    const yr = document.getElementById("yr");
    if (yr) yr.textContent = String(new Date().getFullYear());
  }

  function toast(title, msg) {
    const el = qs("#toast");
    if (!el) return;

    const titleEl = qs(".t-title", el);
    const msgEl = qs(".t-msg", el);

    if (titleEl) titleEl.textContent = title || "Notice";
    if (msgEl) msgEl.textContent = msg || "";

    el.classList.add("show");
    clearTimeout(window.__toastTimer);
    window.__toastTimer = setTimeout(() => el.classList.remove("show"), 3500);
  }

  async function signOut() {
    const sb = window.SupabaseClient?.getClient?.();
    if (!sb) {
      toast("Setup needed", "Update /js/config.js with your Supabase URL and anon key.");
      return;
    }
    await sb.auth.signOut();
    window.location.href = "login.html";
  }

  function renderTopbar(active = "") {
    const host = qs("#topbar");
    if (!host) return;

    const link = (href, label, key) => {
      const cls = key === active ? "toplink active" : "toplink";
      return `<a class="${cls}" href="${href}">${label}</a>`;
    };

    host.innerHTML = `
      <div class="topbar-inner">
        <a class="brand" href="index.html" aria-label="OldPeopleSpace">
          <img src="logos/oldpeoplespace.png" alt="OldPeopleSpace logo" />
          <div class="brand-text">
            <div class="brand-title">OldPeopleSpace</div>
            <div class="brand-tag">A Place for Old Faces</div>
          </div>
        </a>

        <div class="topnav">
          ${link("index.html", "Home", "home")}
          ${link("p.html", "Profile", "profile")}
          ${link("settings.html", "Settings", "settings")}
          <button class="toplink" id="btnSignOut" type="button">Sign out</button>
        </div>
      </div>

      <div class="topbar-sub">
        <div class="topbar-sub-inner">
          <span class="submsg">No pressure. No noise. Just familiar faces.</span>
        </div>
      </div>
    `;

    const btn = qs("#btnSignOut");
    if (btn) btn.addEventListener("click", signOut);
  }

  function applyProfileCssFromLocalStorage() {
    const css = localStorage.getItem("ops_custom_css") || "";
    if (!css.trim()) return;

    const style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);
  }

  window.Util = {
    qs,
    escapeHtml,
    formatTime,
    toast,
    setYear,
    renderTopbar,
    signOut,
    applyProfileCssFromLocalStorage,
  };
})();