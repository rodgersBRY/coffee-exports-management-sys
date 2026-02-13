import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { backendRequest, cloneJsonOrText } from "@/lib/api/backend-client";
import { SESSION_COOKIE_NAMES } from "@/lib/auth/constants";
import { refreshTokens } from "@/lib/auth/refresh";

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid register payload" }, { status: 400 });
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get(SESSION_COOKIE_NAMES.accessToken)?.value;
  const refreshToken = cookieStore.get(SESSION_COOKIE_NAMES.refreshToken)?.value;
  const csrfToken = cookieStore.get(SESSION_COOKIE_NAMES.csrfToken)?.value;

  let backendResponse = await backendRequest({
    path: "auth/register",
    method: "POST",
    body,
    accessToken,
    csrfToken
  });

  if (backendResponse.status === 401 && refreshToken) {
    const refreshed = await refreshTokens(refreshToken);
    if (refreshed) {
      backendResponse = await backendRequest({
        path: "auth/register",
        method: "POST",
        body,
        accessToken: refreshed.access_token,
        csrfToken: refreshed.csrf_token
      });
    }
  }

  const payload = await cloneJsonOrText(backendResponse);

  if (typeof payload === "string") {
    return new NextResponse(payload, {
      status: backendResponse.status,
      headers: { "content-type": "text/plain" }
    });
  }

  return NextResponse.json(payload, { status: backendResponse.status });
}
