import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Supabase client for Server Components, Server Actions, and Route Handlers.
 *
 * In Next.js 15, `cookies()` is async — it returns a ReadonlyRequestCookies
 * tied to the current request. The Supabase client uses it to read the auth
 * cookie sent by the browser, and to write a refreshed cookie back when
 * needed.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          // Server Components are not allowed to set cookies (Next.js throws).
          // The middleware is responsible for writing refreshed cookies back
          // to the response, so swallowing the error here is correct: we
          // already saw the fresh session in middleware on this same request.
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // ignore — see comment above
          }
        },
      },
    },
  );
}
