import { supabase } from "./supabaseClient.js";
import { qs } from "./util.js";

(async () => {
  const msg = qs("msg");

  async function refresh() {
    const { data } = await supabase.auth.getUser();
    msg.textContent = data.user ? `Logged in as ${data.user.email}` : "Not logged in.";
  }

  qs("signup").addEventListener("click", async () => {
    msg.textContent = "";
    const { error } = await supabase.auth.signUp({
      email: qs("email").value.trim(),
      password: qs("pw").value
    });
    msg.textContent = error ? error.message : "Signed up! Go to Settings.";
    await refresh();
  });

  qs("login").addEventListener("click", async () => {
    msg.textContent = "";
    const { error } = await supabase.auth.signInWithPassword({
      email: qs("email").value.trim(),
      password: qs("pw").value
    });
    msg.textContent = error ? error.message : "Logged in! Go to Settings.";
    await refresh();
  });

  qs("logout").addEventListener("click", async () => {
    await supabase.auth.signOut();
    msg.textContent = "Logged out.";
    await refresh();
  });

  await refresh();
})();