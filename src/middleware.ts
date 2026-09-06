import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Lightweight middleware:
 * - Blocks cross-site state-changing API calls (CSRF defense-in-depth, checks Origin).
 * - Redirects /admin and /dashboard unauthenticated users to /login (JWT cookie presence only;
 *   role checks still enforced in layouts + API guards).
 */
const PROTECTED = ["/admin", "/dashboard"];
const MUTATING = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // CSRF: verify Origin header on mutating API requests
  if (pathname.startsWith("/api/") && MUTATING.has(req.method)) {
    const origin = req.headers.get("origin");
    if (origin) {
      const host = req.headers.get("host");
      try {
        if (new URL(origin).host !== host) {
          return NextResponse.json({ error: "درخواست بین‌دامنه‌ای مجاز نیست" }, { status: 403 });
        }
      } catch {
        return NextResponse.json({ error: "درخواست نامعتبر" }, { status: 403 });
      }
    }
  }

  // Cheap auth presence check for protected pages
  if (PROTECTED.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    const token =
      req.cookies.get("next-auth.session-token")?.value ??
      req.cookies.get("__Secure-next-auth.session-token")?.value;
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.search = `?callbackUrl=${encodeURIComponent(pathname)}`;
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*", "/admin/:path*", "/dashboard/:path*"],
};
