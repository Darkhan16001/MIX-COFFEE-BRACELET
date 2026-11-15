
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
        "Отсутствует адрес или публичный ключ Supabase"
      );
    }

    window.db = window.supabase.createClient(
      url,
      key,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true
        }
      }
    );

    console.log("Supabase клиент создан успешно");

  } catch (error) {
    window.supabaseError = error.message;
    console.error("Ошибка Supabase:", error);
  }
})();
