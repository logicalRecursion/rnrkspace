import { supabase } from "./supabaseClient.js";
import { qs, getParam, setThemeVars, escapeHtml } from "./util.js";

(async () => {
  const u = getParam("u");
  if (!u) {
    qs("msg").textContent = "Missing ?u=username";
    return;
  }

  const { data: auth } = await supabase.auth.getUser();
  const me = auth.user;
  qs("commentGuard").textContent = me ? `Commenting as ${me.email}` : "Log in to post comments.";

  const { data: profile, error: pe } = await supabase
    .from("profiles")
    .select("id, username, display_name, headline, about_me, interests, theme")
    .eq("username", u)
    .single();

  if (pe) {
    qs("msg").textContent = pe.message;
    return;
  }

  setThemeVars(profile.theme ?? {});

  const title = profile.display_name?.trim()
    ? `${profile.display_name} (${profile.username})`
    : profile.username;

  qs("nameBox").textContent = title;
  qs("headline").textContent = profile.headline ?? "";
  qs("profileUrl").textContent = `URL: p.html?u=${profile.username}`;
  qs("interests").innerHTML = escapeHtml(profile.interests ?? "").replaceAll("\n", "<br>");
  qs("aboutMe").innerHTML = escapeHtml(profile.about_me ?? "").replaceAll("\n", "<br>");

  async function loadComments() {
    const { data: comments, error: ce } = await supabase
      .from("profile_comments")
      .select("id, body, created_at, author")
      .eq("profile_owner", profile.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (ce) {
      qs("msg").textContent = ce.message;
      return;
    }

    const authorIds = Array.from(new Set((comments ?? []).map(c => c.author)));
    const { data: authors } = await supabase
      .from("profiles")
      .select("id, username, display_name")
      .in("id", authorIds);

    const byId = new Map((authors ?? []).map(a => [a.id, a]));

    const list = qs("commentList");
    list.innerHTML = "";

    for (const c of (comments ?? [])) {
      const a = byId.get(c.author);
      const fromName = a?.display_name?.trim() ? a.display_name : (a?.username ?? c.author);

      const div = document.createElement("div");
      div.className = "comment";
      div.innerHTML = `
        <div class="comment-meta">
          From <a class="link" href="./p.html?u=${encodeURIComponent(a?.username ?? "")}">${escapeHtml(fromName)}</a>
          on ${new Date(c.created_at).toLocaleString()}
        </div>
        <div class="small">${escapeHtml(c.body).replaceAll("\n","<br>")}</div>
      `;
      list.appendChild(div);
    }

    if (!comments?.length) {
      const empty = document.createElement("div");
      empty.className = "small muted";
      empty.textContent = "No comments yet.";
      list.appendChild(empty);
    }
  }

  await loadComments();

  qs("post").addEventListener("click", async () => {
    qs("msg").textContent = "";
    if (!me) return (qs("msg").textContent = "Log in to comment.");

    const body = qs("commentBody").value.trim();
    if (!body) return;

    const { error } = await supabase.from("profile_comments").insert({
      profile_owner: profile.id,
      author: me.id,
      body
    });

    qs("msg").textContent = error ? error.message : "Posted!";
    if (!error) {
      qs("commentBody").value = "";
      await loadComments();
    }
  });
})();