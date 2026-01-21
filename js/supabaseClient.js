// /js/supabaseClient.js
(function () {
  "use strict";

  let _client = null;

  function _getConfig() {
    const url = window.OPS_SUPABASE_URL;
    const key = window.OPS_SUPABASE_ANON_KEY;
    return { url, key };
  }

  function isConfigured() {
    const { url, key } = _getConfig();
    return !!(
      url &&
      key &&
      typeof url === "string" &&
      typeof key === "string" &&
      !url.includes("YOUR-") &&
      !key.includes("YOUR_")
    );
  }

  function hasSupabaseLib() {
    return !!(window.supabase && typeof window.supabase.createClient === "function");
  }

  function getClient() {
    const { url, key } = _getConfig();

    // Preserve your current safety behavior:
    // - If config isn't present, return null (do not throw)
    if (!isConfigured()) {
      return null;
    }

    // Reuse singleton if already created
    if (_client) return _client;

    // Preserve your current safety behavior:
    // - If supabase-js isn't loaded on the page, return null
    if (!hasSupabaseLib()) {
      return null;
    }

    // Create singleton client
    _client = window.supabase.createClient(url, key, {
      auth: {
        // Keep your existing auth settings (these are correct for recovery links)
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });

    return _client;
  }

  // Optional helper: same as getClient, but provides a useful error for debugging
  // (Does NOT change existing behavior unless you call it)
  function requireClient() {
    const c = getClient();
    if (c) return c;

    const { url, key } = _getConfig();

    if (!url || !key) {
      throw new Error(
        "Supabase config missing. Ensure window.OPS_SUPABASE_URL and window.OPS_SUPABASE_ANON_KEY are set before supabaseClient.js loads."
      );
    }

    if (!hasSupabaseLib()) {
      throw new Error(
        "Supabase library not loaded. Ensure you included the supabase-js CDN script before supabaseClient.js."
      );
    }

    throw new Error(
      "Supabase client not available. Check that your URL/key are not placeholder values and that scripts load in the correct order."
    );
  }

  // Keep the same global export name you already use
  window.SupabaseClient = {
    getClient,       // existing behavior (returns null if not ready)
    requireClient,   // new: throws helpful errors if not ready
    isConfigured,    // new: quick check for config presence
  };
})();