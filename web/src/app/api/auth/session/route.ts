import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { backendRequest, cloneJsonOrText } from "@/lib/api/backend-client";
import { SESSION_COOKIE_NAMES } from "@/lib/auth/constants";
import { refreshTokens } from "@/lib/auth/refresh";
import { setSessionCookies } from "@/lib/auth/session-cookies";
import type { SessionUser } from "@/lib/auth/types";

function parseUserCookie(raw: string | undefined): SessionUser | null {
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}

export async function GET(): Promise<NextResponse> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(SESSION_COOKIE_NAMES.accessToken)?.value;
  const refreshToken = cookieStore.get(SESSION_COOKIE_NAMES.refreshToken)?.value;
  const csrfToken = cookieStore.get(SESSION_COOKIE_NAMES.csrfToken)?.value;
  const user = parseUserCookie(cookieStore.get(SESSION_COOKIE_NAMES.user)?.value);

  if (!accessToken || !user) {
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }

  const meResponse = await backendRequest({
    path: "auth/me",
    method: "GET",
    accessToken,
    csrfToken
  });

  if (meResponse.ok) {
    const payload = await cloneJsonOrText(meResponse);
    return NextResponse.json({ authenticated: true, user: payload }, { status: 200 });
  }

  if (meResponse.status !== 401 || !refreshToken) {
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }

  const refreshed = await refreshTokens(refreshToken);
  if (!refreshed) {
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }

  const retryMe = await backendRequest({
    path: "auth/me",
    method: "GET",
    accessToken: refreshed.access_token,
    csrfToken: refreshed.csrf_token
  });
  if (!retryMe.ok) {
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }

  const resolvedUser = (await cloneJsonOrText(retryMe)) as SessionUser;
  const response = NextResponse.json({ authenticated: true, user: resolvedUser }, { status: 200 });
  setSessionCookies(response, {
    accessToken: refreshed.access_token,
    refreshToken: refreshed.refresh_token,
    csrfToken: refreshed.csrf_token,
    user: resolvedUser
  });
  return response;
}
