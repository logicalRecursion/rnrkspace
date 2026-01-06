(async () => {
  const sb = window.opsSupabase;
  const { $, setMsg, getSession, pageYear } = window.opsUtil;

  pageYear();

  const authStatus = $("authStatus");
  const btnSignOut = $("btnSignOut");

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

  const session = await getSession();
  if (!session) return;

  if (authStatus) authStatus.textContent = `Signed in as ${session.user.email}`;
  if (btnSignOut) {
    btnSignOut.addEventListener("click", async () => {
      await window.opsUtil.signOut();
      window.location.href = "./login.html";
    });
  }

  function renderPreview(p) {
    const dn = p.display_name || "—";
    const un = p.username ? "@" + p.username : "@—";
    const bio = p.bio || "—";

    ppName.textContent = dn;
    ppUser.textContent = un;
    ppBio.textContent = bio;
    profileAvatar.textContent = (p.username || "ops").slice(0, 3).toLowerCase();
    ppMeta.textContent = `User ID: ${session.user.id}`;
  }

  async function ensureProfile() {
    const { data: existing, error: selErr } = await sb
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .maybeSingle();

    if (selErr) throw selErr;
    if (existing) return existing;

    const email = session.user.email || "";
    const fallbackUsername = ("ops_" + session.user.id.slice(0, 8)).toLowerCase();

    const { data: created, error: insErr } = await sb
      .from("profiles")
      .insert({
        id: session.user.id,
        username: fallbackUsername,
        display_name: email.split("@")[0] || "oldpeoplespace user",
        bio: "Just joined oldpeoplespace."
      })
      .select("*")
      .single();

    if (insErr) throw insErr;
    return created;
  }

  async function loadProfile() {
    const p = await ensureProfile();

    inUsername.value = p.username || "";
    inDisplayName.value = p.display_name || "";
    inBio.value = p.bio || "";

    renderPreview(p);
  }

  async function saveProfile() {
    setMsg(profileMsg, "");

    const username = inUsername.value.trim().toLowerCase();
    const displayName = inDisplayName.value.trim();
    const bio = inBio.value.trim();

    if (!username) {
      setMsg(profileMsg, "Username is required.", "err");
      return;
    }
    if (!/^[a-z0-9_]{3,20}$/.test(username)) {
      setMsg(profileMsg, "Username must be 3–20 chars (a-z, 0-9, underscore).", "err");
      return;
    }

    btnSaveProfile.disabled = true;
    setMsg(profileMsg, "Saving…", "");

    const { data, error } = await sb
      .from("profiles")
      .update({
        username,
        display_name: displayName || null,
        bio: bio || null,
        updated_at: new Date().toISOString()
      })
      .eq("id", session.user.id)
      .select("*")
      .single();

    btnSaveProfile.disabled = false;

    if (error) {
      setMsg(profileMsg, `Could not save: ${error.message}`, "err");
      return;
    }

    setMsg(profileMsg, "Saved!", "ok");
    renderPreview(data);
  }

  btnSaveProfile.addEventListener("click", saveProfile);

  await loadProfile();
})();