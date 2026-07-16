import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from "./env";

export async function createClient() {
  // Read cookies first: it marks the route as dynamic, so pages that need
  // auth are never statically prerendered (which would run without env vars).
  const cookieStore = await cookies();
  if (!isSupabaseConfigured) {
    throw new Error(
      "Supabase is not configured. Copy frontend/.env.example to frontend/.env.local and fill in your project keys."
    );
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from a Server Component where cookies are read-only.
          // Safe to ignore: the proxy refreshes sessions.
        }
      },
    },
  });
}
