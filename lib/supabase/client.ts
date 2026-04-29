import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase client for Client Components ("use client").
 * Reads/writes the auth cookie via document.cookie under the hood.
 *
 * Use this when:
 *   - You need realtime subscriptions in a Client Component.
 *   - A Client Component needs to call supabase.auth directly (rare — prefer a Server Action).
 *
 * Do NOT use in Server Components or Server Actions — use ./server instead.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
