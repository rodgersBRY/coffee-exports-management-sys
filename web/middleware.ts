import { NextRequest, NextResponse } from "next/server";

import { SESSION_COOKIE_NAMES } from "./src/lib/auth/constants";
import { isPathAllowedForRole } from "./src/lib/auth/permissions";
import type { UserRole } from "./src/lib/auth/types";

function isPublicPath(pathname: string): boolean {
  return pathname === "/login" || pathname === "/register";
}

function isBypassedPath(pathname: string): boolean {
  return (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/robots") ||
    pathname.startsWith("/sitemap") ||
    pathname.includes(".")
  );
}

function parseRoleFromCookie(raw: string | undefined): UserRole | undefined {
  if (!raw) {
    return undefined;
  }
  try {
    const parsed = JSON.parse(raw) as { role?: UserRole };
    return parsed.role;
  } catch {
    return undefined;
  }
}

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  if (isBypassedPath(pathname)) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get(SESSION_COOKIE_NAMES.accessToken)?.value;
  const role = parseRoleFromCookie(request.cookies.get(SESSION_COOKIE_NAMES.user)?.value);

  if (isPublicPath(pathname)) {
    if (accessToken && role) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  if (!accessToken || !role) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (!isPathAllowedForRole(pathname, role)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"]
};
