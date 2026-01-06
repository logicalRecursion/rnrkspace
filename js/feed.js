(async () => {
  const sb = window.opsSupabase;
  const { $, setMsg, escapeHtml, formatDate, getSession, pageYear } = window.opsUtil;

  pageYear();

  const authStatus = $("authStatus");
  const btnSignOut = $("btnSignOut");

  const inPostBody = $("inPostBody");
  const btnCreatePost = $("btnCreatePost");
  const postMsg = $("postMsg");
  const feedList = $("feedList");

  const session = await getSession();
  if (!session) return;

  if (authStatus) authStatus.textContent = `Signed in as ${session.user.email}`;
  if (btnSignOut) {
    btnSignOut.addEventListener("click", async () => {
      await window.opsUtil.signOut();
      window.location.href = "./login.html";
    });
  }

  async function ensureProfile() {
    const user = session.user;

    const { data: existing, error: selErr } = await sb
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (selErr) throw selErr;
    if (existing) return existing;

    const email = user.email || "";
    const fallbackUsername = ("ops_" + user.id.slice(0, 8)).toLowerCase();

    const { data: created, error: insErr } = await sb
      .from("profiles")
      .insert({
        id: user.id,
        username: fallbackUsername,
        display_name: email.split("@")[0] || "oldpeoplespace user",
        bio: "Just joined oldpeoplespace."
      })
      .select("*")
      .single();

    if (insErr) throw insErr;
    return created;
  }

  async function loadFeed() {
    feedList.innerHTML = `<div class="muted small">Loading…</div>`;

    const { data, error } = await sb
      .from("posts")
      .select("id, body, created_at, user_id, profiles(username, display_name)")
      .order("created_at", { ascending: false })
      .limit(30);

    if (error) {
      feedList.innerHTML = `<div class="msg err">Could not load feed: ${escapeHtml(error.message)}</div>`;
      return;
    }

    if (!data?.length) {
      feedList.innerHTML = `<div class="muted">No posts yet. Be the first oldpeoplespace legend.</div>`;
      return;
    }

    feedList.innerHTML = data.map((p) => {
      const prof = p.profiles || {};
      const name = escapeHtml(prof.display_name || prof.username || "oldpeoplespace user");
      const user = escapeHtml(prof.username ? "@" + prof.username : p.user_id.slice(0, 8));
      const body = escapeHtml(p.body);
      const when = escapeHtml(formatDate(p.created_at));

      return `
        <div class="post">
          <div class="postMeta">
            <div><strong>${name}</strong> <span class="muted">${user}</span></div>
            <div>${when}</div>
          </div>
          <div class="postBody">${body}</div>
        </div>
      `;
    }).join("");
  }

  async function createPost() {
    const body = inPostBody.value.trim();

    if (!body) { setMsg(postMsg, "Write something first.", "err"); return; }
    if (body.length > 500) { setMsg(postMsg, "Keep it under 500 characters.", "err"); return; }

    btnCreatePost.disabled = true;
    setMsg(postMsg, "Posting…", "");

    const { error } = await sb.from("posts").insert({
      user_id: session.user.id,
      body
    });

    btnCreatePost.disabled = false;

    if (error) {
      setMsg(postMsg, `Could not post: ${error.message}`, "err");
      return;
    }

    inPostBody.value = "";
    setMsg(postMsg, "Posted to oldpeoplespace.", "ok");
    await loadFeed();
  }

  btnCreatePost.addEventListener("click", createPost);

  // init
  await ensureProfile();
  await loadFeed();
})();
