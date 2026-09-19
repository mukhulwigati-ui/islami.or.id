// lib/supabase/admin.ts

import { createClient } from "@supabase/supabase-js";

// =========================================================
// ENVIRONMENT
// =========================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_URL belum tersedia di environment variable"
  );
}

if (!supabaseSecretKey) {
  throw new Error(
    "SUPABASE_SECRET_KEY belum tersedia di environment variable"
  );
}

// =========================================================
// SUPABASE ADMIN CLIENT
// =========================================================
//
// PENTING:
// File ini hanya boleh digunakan di SERVER.
//
// Jangan import file ini ke komponen yang memiliki
// "use client".
//
// =========================================================

export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseSecretKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  }
);