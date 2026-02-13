import "server-only";

import { NextResponse } from "next/server";

import {
  SESSION_COOKIE_MAX_AGE_SECONDS,
  SESSION_COOKIE_NAMES
} from "@/lib/auth/constants";
import { serverEnv } from "@/lib/env";
import type { SessionUser } from "@/lib/auth/types";

export function setSessionCookies(response: NextResponse, data: {
  accessToken: string;
  refreshToken: string;
  csrfToken: string;
  user: SessionUser;
}): void {
  const common = {
    httpOnly: true,
    secure: serverEnv.secureCookies,
    sameSite: "strict" as const,
    path: "/"
  };

  response.cookies.set(SESSION_COOKIE_NAMES.accessToken, data.accessToken, {
    ...common,
    maxAge: SESSION_COOKIE_MAX_AGE_SECONDS.accessToken
  });
  response.cookies.set(SESSION_COOKIE_NAMES.refreshToken, data.refreshToken, {
    ...common,
    maxAge: SESSION_COOKIE_MAX_AGE_SECONDS.refreshToken
  });
  response.cookies.set(SESSION_COOKIE_NAMES.csrfToken, data.csrfToken, {
    ...common,
    maxAge: SESSION_COOKIE_MAX_AGE_SECONDS.csrfToken
  });
  response.cookies.set(SESSION_COOKIE_NAMES.user, JSON.stringify(data.user), {
    ...common,
    maxAge: SESSION_COOKIE_MAX_AGE_SECONDS.user
  });
}

export function clearSessionCookies(response: NextResponse): void {
  for (const cookieName of Object.values(SESSION_COOKIE_NAMES)) {
    response.cookies.set(cookieName, "", {
      httpOnly: true,
      secure: serverEnv.secureCookies,
      sameSite: "strict",
      path: "/",
      maxAge: 0
    });
  }
}
