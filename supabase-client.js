
"use strict";

if (!window.supabase) {
  throw new Error("Библиотека Supabase не загружена");
}

if (
  !window.SUPABASE_URL ||
  !window.SUPABASE_ANON_KEY ||
  window.SUPABASE_URL.includes("ВСТАВЬ_")
) {
  throw new Error("Настройте supabase-config.js");
}

window.db = window.supabase.createClient(
  window.SUPABASE_URL,
  window.SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true
    }
  }
);
