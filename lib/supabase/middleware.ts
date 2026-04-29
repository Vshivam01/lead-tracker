import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_PREFIXES = ["/leads", "/upload"];
const AUTH_PAGES = ["/login", "/signup"];

/**
 * Runs on every matched request before any route renders.
 *
 * Two responsibilities:
 *   1. Refresh the Supabase auth cookie if the access token has expired.
 *      Without this, sessions silently die after ~1 hour.
 *   2. Enforce route protection: redirect logged-out users away from
 *      protected paths, and bounce logged-in users off /login and /signup.
 */
export async function updateSession(request: NextRequest) {
  // Build the response shell up front. We mutate it as cookies refresh.
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Write refreshed cookies into the *inbound* request so any
          // Server Component running later in this same request sees the
          // new session...
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          // ...and rebuild the response so the *outbound* Set-Cookie header
          // tells the browser to persist the new cookie.
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // getUser() validates the JWT against Supabase's auth server.
  // NEVER use getSession() here — it trusts the cookie blindly.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Logged-out user trying to access a protected route → redirect to login.
  if (!user && PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Logged-in user landing on /login or /signup → send them to the app.
  if (user && AUTH_PAGES.includes(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/leads";
    return NextResponse.redirect(url);
  }

  return response;
}
