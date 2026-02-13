import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { backendRequest } from "@/lib/api/backend-client";
import { SESSION_COOKIE_NAMES } from "@/lib/auth/constants";
import { clearSessionCookies } from "@/lib/auth/session-cookies";

export async function POST(): Promise<NextResponse> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(SESSION_COOKIE_NAMES.accessToken)?.value;
  const refreshToken = cookieStore.get(SESSION_COOKIE_NAMES.refreshToken)?.value;
  const csrfToken = cookieStore.get(SESSION_COOKIE_NAMES.csrfToken)?.value;

  if (accessToken && refreshToken) {
    await backendRequest({
      path: "auth/logout",
      method: "POST",
      accessToken,
      csrfToken,
      body: {
        refresh_token: refreshToken
      }
    }).catch(() => undefined);
  }

  const response = NextResponse.json({ ok: true });
  clearSessionCookies(response);
  return response;
}
