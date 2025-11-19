// middleware.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasSession = !!req.cookies.get("widgets_session")?.value;

  const isPanelPath = pathname.startsWith("/dashboard");
  const isAuthPath = pathname === "/login" || pathname === "/reset-password";

  // لو يحاول يدخل لوحة التحكم وما عنده جلسة → نرجعه للّوجين
  if (isPanelPath && !hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // لو عنده جلسة ويحاول يدخل /login أو /reset-password → رجعه للـ dashboard
  if (isAuthPath && hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/reset-password"],
};
