
"use strict";

/* MIX COFFEE BRACELET — SUPABASE CLIENT */

(function () {
  window.db = null;
  window.supabaseError = "";

  try {
    if (
      !window.supabase ||
      typeof window.supabase.createClient !== "function"
    ) {
      throw new Error(
        "Библиотека Supabase не загрузилась"
      );
    }

    const url = window.SUPABASE_URL;
    const key = window.SUPABASE_ANON_KEY;

    if (!url || !key) {
      throw new Error(
        "Не указан URL или публичный ключ Supabase"
      );
    }

    if (
      key.includes("ОСЫНДА_") ||
      key.includes("ВСТАВЬ_")
    ) {
      throw new Error(
        "В supabase-config.js нужно вставить настоящий публичный ключ"
      );
    }

    window.db = window.supabase.createClient(
      url,
      key,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      }
    );

    console.log(
      "MIX COFFEE BRACELET: Supabase создан"
    );

  } catch (error) {
    window.supabaseError = error.message;
    console.error("Supabase:", error);
  }
})();
