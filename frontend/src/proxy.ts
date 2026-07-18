import { NextResponse, type NextRequest } from "next/server";

/**
 * Optimistic auth gate (Next 16 proxy — formerly middleware). Checks only
 * that a Django session cookie EXISTS: cheap, no network, catches the
 * common logged-out case at the edge. Cookie validity is enforced by the
 * protected page's server-side session check — a stale cookie passes here
 * but bounces there.
 *
 * Works locally because :3001 and :8001 share the localhost cookie scope;
 * in production the frontend and API must share a registrable domain for
 * the session cookie to be visible to the proxy.
 */
export function proxy(request: NextRequest) {
  if (!request.cookies.has("sessionid")) {
    const { pathname } = request.nextUrl;
    const loginUrl = new URL(
      `/login?next=${encodeURIComponent(pathname)}`,
      request.url,
    );
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/create"],
};
