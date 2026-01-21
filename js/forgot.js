// /js/forgot.js
import { supabase } from "./supabaseClient.js";

const form = document.getElementById("forgotForm");
const emailEl = document.getElementById("email");
const msgEl = document.getElementById("msg");
const sendBtn = document.getElementById("sendBtn");

function setMsg(text, kind = "info") {
  msgEl.textContent = text;
  msgEl.className = `ops-msg ops-msg--${kind}`;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = (emailEl.value || "").trim().toLowerCase();
  if (!email) return;

  sendBtn.disabled = true;
  setMsg("Sending…", "info");

  // Make sure this exact URL is in Supabase Auth -> URL Configuration -> Redirect URLs
  const redirectTo = "https://oldpeoplespace.com/reset.html";

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  // Security: respond generically either way
  if (error) {
    console.error("resetPasswordForEmail error:", error);
    setMsg("If that email exists here, you’ll get a reset link shortly.", "info");
  } else {
    setMsg("Check your inbox (and spam). Reset link sent ✅", "success");
  }

  sendBtn.disabled = false;
});