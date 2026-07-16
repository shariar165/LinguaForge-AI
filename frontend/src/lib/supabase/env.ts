export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** True once the developer has wired up a Supabase project in .env.local. */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
