/* oldpeoplespace app (vanilla JS + Supabase) */
(() => {
  const sb = window.opsSupabase;

  // ---- DOM
  const $ = (id) => document.getElementById(id);

  const viewAuth = $("viewAuth");
  const viewApp = $("viewApp");

  const authStatus = $("authStatus");
  const btnSignOut = $("btnSignOut");
  const btnSignOut2 = $("btnSignOut2");

  const routes = {
    feed: $("routeFeed"),
    profile: $("routeProfile"),
    friends: $("routeFriends"),
    settings: $("routeSettings"),
  };

  // Auth inputs
  const inSignInEmail = $("inSignInEmail");
  const inSignInPassword = $("inSignInPassword");
  const btnSignIn = $("btnSignIn");
  const signInMsg = $("signInMsg");

  const inSignUpEmail = $("inSignUpEmail");
  const inSignUpPassword = $("inSignUpPassword");
  const btnSignUp = $("btnSignUp");
  const signUpMsg = $("signUpMsg");

  // Feed
  const inPostBody = $("inPostBody");
  const btnCreatePost = $("btnCreatePost");
  const postMsg = $("postMsg");
  const feedList = $("feedList");

  // Profile
  const inUsername = $("inUsername");
  const inDisplayName = $("inDisplayName");
  const inBio = $("inBio");
  const btnSaveProfile = $("btnSaveProfile");
  const profileMsg = $("profileMsg");

  const ppName = $("ppName");
  const ppUser = $("ppUser");
  const ppBio = $("ppBio");
  const ppMeta = $("ppMeta");
  const profileAvatar = $("profileAvatar");

  // Friends
  const inFriendSearch = $("inFriendSearch");
  const btnFriendSearch = $("btnFriendSearch");
  const friendSearchMsg = $("friendSearchMsg");
  const friendSearchResults = $("friendSearchResults");
  const friendsList = $("friendsList");
  const friendsMsg = $("friendsMsg");

  // Settings
  const setEmail = $("setEmail");
  const setUserId = $("setUserId");

  // Footer year
  $("year").textContent = String(new Date().getFullYear());

  // ---- helpers
  function setMsg(el, text, kind = "") {
    el.textContent = text || "";
    el.className = "msg" + (kind ? " " + kind : "");
  }

  function show(el) { el.classList.remove("hidden"); }
  function hide(el) { el.classList.add("hidden"); }

  function escapeHtml(str) {
    return String(str ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function formatDate(iso) {
    try {
      const d = new Date(iso);
      return d.toLocaleString();
    } catch {
      return iso;
    }
  }

  function getRoute() {
    const hash = window.location.hash || "#/feed";
    const m = hash.match(/^#\/([a-zA-Z0-9_-]+)/);
    return (m?.[1] || "feed").toLowerCase();
  }

  function setActiveNav(route) {
    document.querySelectorAll(".nav-link").forEach((a) => {
      a.classList.toggle("active", a.dataset.route === route);
    });
  }

  function showRoute(route) {
    Object.values(routes).forEach(hide);
    const target = routes[route] || routes.feed;
    show(target);
    setActiveNav(route);
  }

  async function requireSession() {
    const { data } = await sb.auth.getSession();
    return data.session;
  }

  // ---- Supabase data ops
  async function ensureProfile(user) {
    // Profiles are stored in public.profiles keyed by auth.users.id
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
        bio: "Just joined oldpeoplespace.",
      })
      .select("*")
      .single();

    if (insErr) throw insErr;
    return created;
  }

  async function loadMyProfile() {
    const session = await requireSession();
    if (!session) return;

    const user = session.user;
    const p = await ensureProfile(user);

    inUsername.value = p.username || "";
    inDisplayName.value = p.display_name || "";
    inBio.value = p.bio || "";

    renderProfilePreview(p, user);
  }

  function renderProfilePreview(p, user) {
    const dn = p.display_name || "—";
    const un = p.username ? "@" + p.username : "@—";
    const bio = p.bio || "—";

    ppName.textContent = dn;
    ppUser.textContent = un;
    ppBio.textContent = bio;

    profileAvatar.textContent = (p.username || "ops").slice(0, 3).toLowerCase();

    ppMeta.textContent = `User ID: ${user.id}`;
  }

  async function saveMyProfile() {
    const session = await requireSession();
    if (!session) return;

    const username = inUsername.value.trim().toLowerCase();
    const displayName = inDisplayName.value.trim();
    const bio = inBio.value.trim();

    if (!username) {
      setMsg(profileMsg, "Username is required.", "err");
      return;
    }

    // basic username validation
    if (!/^[a-z0-9_]{3,20}$/.test(username)) {
      setMsg(profileMsg, "Username must be 3–20 chars (a-z, 0-9, underscore).", "err");
      return;
    }

    setMsg(profileMsg, "Saving...", "");

    const { data, error } = await sb
      .from("profiles")
      .update({
        username,
        display_name: displayName || null,
        bio: bio || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", session.user.id)
      .select("*")
      .single();

    if (error) {
      // If username is unique, you'll see a constraint error here
      setMsg(profileMsg, `Could not save: ${error.message}`, "err");
      return;
    }

    setMsg(profileMsg, "Saved!", "ok");
    renderProfilePreview(data, session.user);
  }

  async function createPost() {
    const session = await requireSession();
    if (!session) return;

    const body = inPostBody.value.trim();
    if (!body) {
      setMsg(postMsg, "Write something first.", "err");
      return;
    }
    if (body.length > 500) {
      setMsg(postMsg, "Keep it under 500 characters.", "err");
      return;
    }

    btnCreatePost.disabled = true;
    setMsg(postMsg, "Posting...", "");

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

  async function loadFeed() {
    const session = await requireSession();
    if (!session) return;

    feedList.innerHTML = `<div class="muted small">Loading…</div>`;

    // show posts from everyone (public) with profile info
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
          <div class="meta">
            <div><strong>${name}</strong> <span class="muted">${user}</span></div>
            <div>${when}</div>
          </div>
          <div class="body">${body}</div>
        </div>
      `;
    }).join("");
  }

  async function loadFriends() {
    const session = await requireSession();
    if (!session) return;

    friendsList.innerHTML = `<div class="muted small">Loading…</div>`;
    setMsg(friendsMsg, "");

    // accepted friends where user is either side
    const uid = session.user.id;

    const { data, error } = await sb
      .from("friends")
      .select("id, user_id, friend_id, status, created_at, profiles_user:profiles!friends_user_id_fkey(username, display_name), profiles_friend:profiles!friends_friend_id_fkey(username, display_name)")
      .or(`user_id.eq.${uid},friend_id.eq.${uid}`)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      friendsList.innerHTML = `<div class="msg err">Could not load friends: ${escapeHtml(error.message)}</div>`;
      return;
    }

    const accepted = (data || []).filter((r) => r.status === "accepted");

    if (!accepted.length) {
      friendsList.innerHTML = `<div class="muted">No friends yet. Search and add someone!</div>`;
      return;
    }

    friendsList.innerHTML = accepted.map((r) => {
      const otherId = r.user_id === uid ? r.friend_id : r.user_id;

      // Pick the “other” profile display
      const otherProfile =
        (r.user_id === uid ? r.profiles_friend : r.profiles_user) || {};

      const title = escapeHtml(otherProfile.display_name || otherProfile.username || "oldpeoplespace user");
      const sub = escapeHtml(otherProfile.username ? "@" + otherProfile.username : otherId.slice(0, 8));

      return `
        <div class="list-item">
          <div>
            <div class="title">${title}</div>
            <div class="sub">${sub}</div>
          </div>
          <div class="muted small">friend</div>
        </div>
      `;
    }).join("");
  }

  async function searchUsers() {
    const session = await requireSession();
    if (!session) return;

    const q = inFriendSearch.value.trim().toLowerCase();
    friendSearchResults.innerHTML = "";
    setMsg(friendSearchMsg, "");

    if (!q) {
      setMsg(friendSearchMsg, "Type a username to search.", "err");
      return;
    }

    setMsg(friendSearchMsg, "Searching…", "");

    const { data, error } = await sb
      .from("profiles")
      .select("id, username, display_name")
      .ilike("username", `%${q}%`)
      .limit(10);

    if (error) {
      setMsg(friendSearchMsg, `Search failed: ${error.message}`, "err");
      return;
    }

    const results = (data || []).filter((p) => p.id !== session.user.id);

    if (!results.length) {
      setMsg(friendSearchMsg, "No matches.", "err");
      return;
    }

    setMsg(friendSearchMsg, `Found ${results.length}.`, "ok");

    friendSearchResults.innerHTML = results.map((p) => {
      const title = escapeHtml(p.display_name || p.username);
      const sub = escapeHtml("@" + p.username);
      return `
        <div class="list-item">
          <div>
            <div class="title">${title}</div>
            <div class="sub">${sub}</div>
          </div>
          <button class="btn btn-secondary" data-addfriend="${p.id}">Add</button>
        </div>
      `;
    }).join("");

    friendSearchResults.querySelectorAll("[data-addfriend]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-addfriend");
        await addFriend(id);
      });
    });
  }

  async function addFriend(otherUserId) {
    const session = await requireSession();
    if (!session) return;

    setMsg(friendSearchMsg, "Sending request…", "");

    // Create a row as pending. You can keep it simple: auto-accept for now.
    // We'll mark accepted immediately to keep UX simple.
    const uid = session.user.id;

    // prevent duplicates (either direction)
    const { data: existing, error: exErr } = await sb
      .from("friends")
      .select("id")
      .or(`and(user_id.eq.${uid},friend_id.eq.${otherUserId}),and(user_id.eq.${otherUserId},friend_id.eq.${uid})`)
      .maybeSingle();

    if (exErr) {
      setMsg(friendSearchMsg, `Could not check existing: ${exErr.message}`, "err");
      return;
    }
    if (existing) {
      setMsg(friendSearchMsg, "Already connected (or pending).", "err");
      return;
    }

    const { error } = await sb.from("friends").insert({
      user_id: uid,
      friend_id: otherUserId,
      status: "accepted"
    });

    if (error) {
      setMsg(friendSearchMsg, `Could not add: ${error.message}`, "err");
      return;
    }

    setMsg(friendSearchMsg, "Added on oldpeoplespace.", "ok");
    await loadFriends();
  }

  // ---- auth UI
  async function refreshAuthUI() {
    const { data } = await sb.auth.getSession();
    const session = data.session;

    if (!session) {
      authStatus.textContent = "Not signed in";
      hide(btnSignOut);
      hide(viewApp);
      show(viewAuth);
      return;
    }

    authStatus.textContent = `Signed in as ${session.user.email}`;
    show(btnSignOut);
    hide(viewAuth);
    show(viewApp);

    // Settings
    setEmail.textContent = session.user.email || "—";
    setUserId.textContent = session.user.id;

    // Ensure profile exists, load data
    await ensureProfile(session.user);
    await loadMyProfile();
    await loadFeed();
    await loadFriends();
  }

  async function signUp() {
    setMsg(signUpMsg, "");
    const email = inSignUpEmail.value.trim();
    const password = inSignUpPassword.value;

    if (!email || !password) {
      setMsg(signUpMsg, "Email + password required.", "err");
      return;
    }

    btnSignUp.disabled = true;
    setMsg(signUpMsg, "Creating account…", "");

    // For GitHub Pages, redirect should point to your Pages URL, including repo path.
    // Example: https://YOURUSER.github.io/oldpeoplespace/
    const redirectTo = window.location.origin + window.location.pathname;

    const { error } = await sb.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: redirectTo }
    });

    btnSignUp.disabled = false;

    if (error) {
      setMsg(signUpMsg, error.message, "err");
      return;
    }

    setMsg(signUpMsg, "Account created. If confirmation is on, check your email.", "ok");
  }

  async function signIn() {
    setMsg(signInMsg, "");
    const email = inSignInEmail.value.trim();
    const password = inSignInPassword.value;

    if (!email || !password) {
      setMsg(signInMsg, "Email + password required.", "err");
      return;
    }

    btnSignIn.disabled = true;
    setMsg(signInMsg, "Signing in…", "");

    const { error } = await sb.auth.signInWithPassword({ email, password });

    btnSignIn.disabled = false;

    if (error) {
      setMsg(signInMsg, error.message, "err");
      return;
    }

    setMsg(signInMsg, "Signed in.", "ok");
    window.location.hash = "#/feed";
    await refreshAuthUI();
    showRoute("feed");
  }

  async function signOut() {
    await sb.auth.signOut();
    window.location.hash = "#/feed";
    await refreshAuthUI();
  }

  // ---- routing
  function onRouteChange() {
    const r = getRoute();
    showRoute(r);
  }

  // ---- events
  btnSignUp.addEventListener("click", signUp);
  btnSignIn.addEventListener("click", signIn);

  btnSignOut.addEventListener("click", signOut);
  btnSignOut2.addEventListener("click", signOut);

  btnSaveProfile.addEventListener("click", saveMyProfile);
  btnCreatePost.addEventListener("click", createPost);

  btnFriendSearch.addEventListener("click", searchUsers);

  window.addEventListener("hashchange", onRouteChange);

  sb.auth.onAuthStateChange(async () => {
    await refreshAuthUI();
  });

  // ---- init
  (async function init() {
    await refreshAuthUI();
    onRouteChange();
  })();
})();