import { supabase } from "./supabaseClient.js";
import { qs } from "./util.js";

(async () => {
  const { data } = await supabase.auth.getUser();
  qs("authStatus").textContent = data.user ? `Logged in as ${data.user.email}` : "Not logged in.";

  qs("go").addEventListener("click", () => {
    const u = qs("username").value.trim();
    if (u) window.location.href = `./p.html?u=${encodeURIComponent(u)}`;
  });
})();