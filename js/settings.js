import { supabase } from "./supabaseClient.js";
import { qs, setThemeVars } from "./util.js";

(async () => {
  const guard = qs("guard");
  const msg = qs("msg");

  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) {
    guard.textContent = "Log in first.";
    return;
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, username, display_name, headline, about_me, interests, theme")
    .eq("id", user.id)
    .single();

  if (error) {
    guard.textContent = error.message;
    return;
  }

  qs("username").value = profile.username ?? "";
  qs("displayName").value = profile.display_name ?? "";
  qs("headline").value = profile.headline ?? "";
  qs("aboutMe").value = profile.about_me ?? "";
  qs("interests").value = profile.interests ?? "";

  const theme = profile.theme ?? {};
  qs("t_bg").value = theme.bg ?? "";
  qs("t_panel").value = theme.panel ?? "";
  qs("t_border").value = theme.border ?? "";
  qs("t_accent").value = theme.accent ?? "";
  qs("t_text").value = theme.text ?? "";
  qs("t_font").value = theme.font ?? "";
  setThemeVars(theme);

  qs("view").href = `./p.html?u=${encodeURIComponent(profile.username)}`;

  qs("save").addEventListener("click", async () => {
    msg.textContent = "";

    const payload = {
      username: qs("username").value.trim(),
      display_name: qs("displayName").value.trim(),
      headline: qs("headline").value.trim(),
      about_me: qs("aboutMe").value,
      interests: qs("interests").value,
      theme: {
        bg: qs("t_bg").value.trim(),
        panel: qs("t_panel").value.trim(),
        border: qs("t_border").value.trim(),
        accent: qs("t_accent").value.trim(),
        text: qs("t_text").value.trim(),
        font: qs("t_font").value.trim(),
      },
    };

    setThemeVars(payload.theme);

    const { error: upErr } = await supabase
      .from("profiles")
      .update(payload)
      .eq("id", user.id);

    msg.textContent = upErr ? upErr.message : "Saved!";
    if (!upErr) qs("view").href = `./p.html?u=${encodeURIComponent(payload.username)}`;
  });
})();