// /js/feed.js
(function () {
  "use strict";

  function localPostsKey(user) {
    return `ops_posts_${user?.id || "anon"}`;
  }

  async function addPost(sb, user, content) {
    if (sb) {
      const { error } = await sb.from("ops_posts").insert({
        user_id: user.id,
        content: content,
      });
      if (!error) return;
    }

    const k = localPostsKey(user);
    const arr = JSON.parse(localStorage.getItem(k) || "[]");
    arr.unshift({
      id: crypto.randomUUID(),
      user_id: user.id,
      content,
      created_at: new Date().toISOString(),
    });
    localStorage.setItem(k, JSON.stringify(arr));
  }

  async function loadFeed(sb, user, hostEl) {
    if (!hostEl) return;

    hostEl.innerHTML = "";
    let items = [];

    if (sb) {
      const { data, error } = await sb
        .from("ops_posts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(25);

      if (!error && Array.isArray(data)) items = data;
    }

    if (!items.length) {
      const k = localPostsKey(user);
      items = JSON.parse(localStorage.getItem(k) || "[]");
    }

    if (!items.length) {
      hostEl.innerHTML = `<div class="cardline">No updates yet. Be the first to post something classic.</div>`;
      return;
    }

    const handle = (user?.email || "user").split("@")[0];

    hostEl.innerHTML = items
      .map(
        (p) => `
          <div class="post">
            <div class="post-meta">
              <span>@${window.Util.escapeHtml(handle)}</span>
              <span>${window.Util.escapeHtml(window.Util.formatTime(p.created_at))}</span>
            </div>
            <div class="post-body">${window.Util.escapeHtml(p.content)}</div>
          </div>
        `
      )
      .join("");
  }

  async function loadMyPosts(sb, user, hostEl) {
    if (!hostEl) return;

    hostEl.innerHTML = "";
    let items = [];

    if (sb) {
      const { data, error } = await sb
        .from("ops_posts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (!error && Array.isArray(data)) items = data;
    }

    if (!items.length) {
      const k = localPostsKey(user);
      items = JSON.parse(localStorage.getItem(k) || "[]").slice(0, 10);
    }

    if (!items.length) {
      hostEl.innerHTML = `<div class="cardline">No posts yet. Drop a quick update on the home page.</div>`;
      return;
    }

    const handle = (user?.email || "user").split("@")[0];

    hostEl.innerHTML = items
      .map(
        (p) => `
          <div class="post">
            <div class="post-meta">
              <span>@${window.Util.escapeHtml(handle)}</span>
              <span>${window.Util.escapeHtml(window.Util.formatTime(p.created_at))}</span>
            </div>
            <div class="post-body">${window.Util.escapeHtml(p.content)}</div>
          </div>
        `
      )
      .join("");
  }

  window.Feed = { addPost, loadFeed, loadMyPosts };
})();