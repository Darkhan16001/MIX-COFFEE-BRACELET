
"use strict";

// MIX BRACELET — Supabase

const db = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

async function checkSupabaseConnection() {
  try {
    const { data, error } = await db
      .from("bracelets")
      .select("id")
      .limit(1);

    if (error) {
      console.error(
        "MIX BRACELET — Supabase error:",
        error.message
      );
      return;
    }

    console.log(
      "MIX BRACELET — Supabase подключён!",
      data
    );

  } catch (error) {
    console.error(
      "Ошибка подключения Supabase:",
      error
    );
  }
}

checkSupabaseConnection();
