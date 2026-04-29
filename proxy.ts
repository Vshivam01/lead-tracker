import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  /**
   * Match all paths *except* static assets and image files.
   *
   * We deliberately do NOT exclude /login and /signup here — the auth-page
   * redirect (logged-in users bouncing back to /leads) lives in updateSession
   * and depends on running there.
   */
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};