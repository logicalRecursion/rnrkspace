// /js/supabaseClient.js
// Creates a singleton Supabase client using the global 'supabase' object from the CDN script.

(function () {
  "use strict";

  let _client = null;

  function getClient() {
    const url = window.OPS_SUPABASE_URL;
    const key = window.OPS_SUPABASE_ANON_KEY;

    if (!url || !key || url.includes("YOUR-") || key.includes("YOUR_")) {
      return null;
    }

    if (_client) return _client;

    if (!window.supabase || typeof window.supabase.createClient !== "function") {
      return null;
    }

    _client = window.supabase.createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });

    return _client;
  }

  window.SupabaseClient = { getClient };
})();