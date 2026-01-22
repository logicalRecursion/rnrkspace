// /js/reset.js
(function () {
  "use strict";

  function $(id) {
    return document.getElementById(id);
  }

  function showToast(title, message, type) {
    // Prefer your existing toast helper if it exists
    if (window.OPS && typeof window.OPS.toast === "function") {
      window.OPS.toast(title, message, type);
      return;
    }

    // Fallback to the #toast container
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
    setTimeout(() => toast.classList.remove("show"), 4500);
  }

  function setStatus(text) {
    const el = $("status");
    if (el) el.textContent = text;
  }

  function showForm() {
    const form = $("resetForm");
    if (form) form.style.display = "block";
  }

  function hideForm() {
    const form = $("resetForm");
    if (form) form.style.display = "none";
  }

  function getClient() {
    return window.SupabaseClient && typeof window.SupabaseClient.getClient === "function"
      ? window.SupabaseClient.getClient()
      : null;
  }

  // Some Supabase recovery links include tokens in the URL hash.
  // We treat it as a recovery page if type=recovery is present or access_token exists.
  function urlLooksLikeRecovery() {
    const hash = window.location.hash || "";
    const query = window.location.search || "";
    const combined = (hash + "&" + query).toLowerCase();
    return combined.includes("type=recovery") || combined.includes("access_token=");
  }

  async function init() {
    const client = getClient();
    if (!client) {
      setStatus("Setup issue: Supabase is not configured on this page.");
      showToast("Setup issue", "Supabase client not available. Check config.js + script load order.", "error");
      return;
    }

    // Listen for auth changes (recovery links often trigger PASSWORD_RECOVERY)
    client.auth.onAuthStateChange((event, session) => {
      console.log("Auth event:", event, "Session present:", !!session);

      // When the email link is opened, you typically see PASSWORD_RECOVERY.
      if ((event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") && session) {
        setStatus("Reset session opened. Choose a new password.");
        showForm();
      }
    });

    // Give the client a moment to process URL tokens if detectSessionInUrl is true
    // (your supabaseClient.js already sets detectSessionInUrl: true)
    setStatus("Opening your reset session…");

    // Try to get a session directly
    const { data, error } = await client.auth.getSession();
    if (error) console.error("getSession error:", error);

    const session = data && data.session ? data.session : null;

    if (session) {
      setStatus("Choose a new password.");
      showForm();
      return;
    }

    // If no session, we can still be on a recovery URL but token processing failed or link is invalid/expired
    if (urlLooksLikeRecovery()) {
      setStatus("Almost there… If this doesn’t change in a moment, the link may be invalid or expired.");
      // One more attempt after a short delay (sometimes the session lands asynchronously)
      setTimeout(async () => {
        const { data: data2 } = await client.auth.getSession();
        if (data2 && data2.session) {
          setStatus("Choose a new password.");
          showForm();
        } else {
          setStatus("This reset link looks invalid or expired. Please request a new one.");
          hideForm();
        }
      }, 700);
      return;
    }

    // Not even a recovery-looking URL: user may have navigated directly to reset.html
    setStatus("Open the reset link from your email to continue.");
    hideForm();
  }

  document.addEventListener("DOMContentLoaded", function () {
    const form = $("resetForm");
    const newPassEl = $("newPassword");
    const confirmEl = $("confirmPassword");
    const btn = $("resetBtn");

    // Init recovery detection
    init();

    if (!form) return;

    form.addEventListener("submit", async function (e) {
      e.preventDefault();

      const client = getClient();
      if (!client) {
        showToast("Setup issue", "Supabase client not available.", "error");
        return;
      }

      const p1 = (newPassEl && newPassEl.value) ? newPassEl.value : "";
      const p2 = (confirmEl && confirmEl.value) ? confirmEl.value : "";

      if (p1.length < 8) {
        showToast("Try again", "Password must be at least 8 characters.", "error");
        return;
      }
      if (p1 !== p2) {
        showToast("Try again", "Passwords do not match.", "error");
        return;
      }

      if (btn) btn.disabled = true;
      showToast("Working…", "Updating your password.", "info");

      const { error } = await client.auth.updateUser({ password: p1 });

      if (error) {
        console.error("updateUser error:", error);
        showToast("Couldn’t update", error.message || "Request a new reset link and try again.", "error");
        if (btn) btn.disabled = false;
        return;
      }

      showToast("Done ✅", "Password updated. Sending you to login…", "success");

      // Optional: sign out to force a clean login
      await client.auth.signOut();

      setTimeout(function () {
        window.location.href = "login.html";
      }, 900);
    });
  });
})();