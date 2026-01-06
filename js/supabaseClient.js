(() => {
  const cfg = window.OLDPEOPLESPACE_CONFIG;
  if (!cfg?.SUPABASE_URL || !cfg?.SUPABASE_ANON_KEY) {
    console.error("oldpeoplespace config missing. Check js/config.js");
  }

  // Global client
  window.opsSupabase = supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });
})();