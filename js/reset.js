// /js/reset.js
import { supabase } from "./supabaseClient.js";

const statusEl = document.getElementById("status");
const formEl = document.getElementById("resetForm");
const msgEl = document.getElementById("msg");
const newPassEl = document.getElementById("newPassword");
const confirmPassEl = document.getElementById("confirmPassword");
const resetBtn = document.getElementById("resetBtn");

function setMsg(text, kind = "info") {
  msgEl.textContent = text;
  msgEl.className = `ops-msg ops-msg--${kind}`;
}

function showForm() {
  formEl.style.display = "block";
}

function hideForm() {
  formEl.style.display = "none";
}

function setStatus(text) {
  statusEl.textContent = text;
}

// Supabase parses the recovery tokens from the URL and emits PASSWORD_RECOVERY.
// We listen for it and then allow the user to set a new password.
const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
  // Expected when user clicks email link:
  // event: "PASSWORD_RECOVERY" and a valid session object
  if (event === "PASSWORD_RECOVERY" && session) {
    setStatus("Reset session opened. Choose a new password.");
    showForm();
  }
});

// Also handle the case where the session is already present (page refresh, etc.)
(async function init() {
  const { data } = await supabase.auth.getSession();
  const session = data?.session;

  // If there’s a session and URL tokens were processed, allow reset
  if (session) {
    setStatus("Choose a new password.");
    showForm();
    return;
  }

  // No session yet—could be invalid/expired link or redirect not allow-listed
  setStatus("This reset link may be expired or invalid. Try requesting a new one.");
  hideForm();
})();

formEl.addEventListener("submit", async (e) => {
  e.preventDefault();

  const p1 = newPassEl.value || "";
  const p2 = confirmPassEl.value || "";

  if (p1.length < 8) {
    setMsg("Password must be at least 8 characters.", "error");
    return;
  }
  if (p1 !== p2) {
    setMsg("Passwords do not match.", "error");
    return;
  }

  resetBtn.disabled = true;
  setMsg("Updating password…", "info");

  const { error } = await supabase.auth.updateUser({ password: p1 });

  if (error) {
    console.error("updateUser error:", error);
    setMsg("Couldn’t update password. Request a new reset link and try again.", "error");
    resetBtn.disabled = false;
    return;
  }

  setMsg("Password updated ✅ Sending you back to login…", "success");

  // Optional: sign out so user lands at login cleanly
  await supabase.auth.signOut();

  setTimeout(() => {
    window.location.href = "login.html";
  }, 900);
});