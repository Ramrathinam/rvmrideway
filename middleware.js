// /middleware.js
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  const url = req.nextUrl.clone();

  // Publicly allowed routes
  if (
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/favicon.ico") ||
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/register"
  ) {
    return NextResponse.next();
  }

  // Require auth
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Admin-only area
  if (pathname.startsWith("/admin")) {
    if (token.role !== "admin") {
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  // Customer-only area
  if (pathname.startsWith("/bookings") || pathname.startsWith("/profile")) {
    if (token.role !== "customer") {
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|gif|webp|ico)).*)",
  ],
};

