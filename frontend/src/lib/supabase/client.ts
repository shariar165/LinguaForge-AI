"use client";

import { createBrowserClient } from "@supabase/ssr";
import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from "./env";

export function createClient() {
  if (!isSupabaseConfigured) {
    throw new Error(
      "Supabase is not configured. Copy frontend/.env.example to frontend/.env.local and fill in your project keys."
    );
  }
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
