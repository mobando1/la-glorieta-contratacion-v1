import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { COOKIE_NAME, verifySessionValue } from "@/lib/session";

export const middleware = (request: NextRequest) => {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/admin/login") ||
    pathname.startsWith("/api/auth/login") ||
    pathname.startsWith("/api/auth/logout")
  ) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    const sessionValue = request.cookies.get(COOKIE_NAME)?.value;
    const isValid = verifySessionValue(sessionValue);

    if (!isValid) {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
};

export const config = {
  matcher: ["/admin/:path*", "/api/auth/:path*"],
};