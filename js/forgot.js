// /js/forgot.js
(function () {
  "use strict";

  function $(id) {
    return document.getElementById(id);
  }

  function showToast(title, message, type) {
    // If your util.js/app.js already provides a toast helper, use it.
    // Otherwise, this fallback uses the #toast container structure in your HTML.
    if (window.OPS && typeof window.OPS.toast === "function") {
      window.OPS.toast(title, message, type);
      return;
    }

    const toast = $("toast");
    if (!toast) {
      alert(title + "\n\n" + message);
      return;
    }

    const tTitle = toast.querySelector(".t-title");
    const tMsg = toast.querySelector(".t-msg");
    if (tTitle) tTitle.textContent = title || "";
    if (tMsg) tMsg.textContent = message || "";

    toast.classList.add("show");
    // If your CSS uses different show/hide mechanics, this is still harmless.
    setTimeout(() => toast.classList.remove("show"), 4500);
  }

  document.addEventListener("DOMContentLoaded", function () {
    const form = $("forgotForm");
    const emailEl = $("email");
    const sendBtn = $("sendBtn");

    if (!form || !emailEl) return;

    form.addEventListener("submit", async function (e) {
      e.preventDefault();

      const email = (emailEl.value || "").trim().toLowerCase();
      if (!email) return;

      const client = window.SupabaseClient && window.SupabaseClient.getClient
        ? window.SupabaseClient.getClient()
        : null;

      if (!client) {
        showToast(
          "Setup issue",
          "Supabase is not configured on this page. Check config.js and script load order.",
          "error"
        );
        return;
      }

      if (sendBtn) sendBtn.disabled = true;

      // Make sure this exact URL is allow-listed in Supabase Auth -> URL Configuration -> Redirect URLs
      const redirectTo = "https://oldpeoplespace.com/reset.html";

      try {
        const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo });

        // Security best practice: always respond generically
        if (error) {
          console.error("resetPasswordForEmail error:", error);
        }

        showToast(
          "Check your inbox",
          "If that email exists here, you’ll get a reset link shortly (check spam too).",
          "success"
        );
      } catch (err) {
        console.error(err);
        showToast(
          "Couldn’t send link",
          "Something went sideways. Try again in a minute.",
          "error"
        );
      } finally {
        if (sendBtn) sendBtn.disabled = false;
      }
    });
  });
})();