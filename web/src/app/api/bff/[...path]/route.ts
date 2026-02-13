import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { backendRequest } from "@/lib/api/backend-client";
import { SESSION_COOKIE_NAMES } from "@/lib/auth/constants";
import { refreshTokens } from "@/lib/auth/refresh";
import { setSessionCookies } from "@/lib/auth/session-cookies";
import type { SessionUser } from "@/lib/auth/types";

const ALLOWED_ROOTS = new Set([
  "auth",
  "master",
  "procurement",
  "inventory",
  "contracts",
  "shipments",
  "costs",
  "profitability",
  "traceability",
  "health"
]);

function buildPath(segments: string[]): string {
  return segments.join("/");
}

function isAuthRefreshable(path: string): boolean {
  return ![
    "auth/login",
    "auth/register",
    "auth/refresh",
    "auth/csrf-token"
  ].includes(path);
}

function parseUserCookie(raw: string | undefined): SessionUser | undefined {
  if (!raw) {
    return undefined;
  }
  try {
    return JSON.parse(raw) as SessionUser;
  } catch {
    return undefined;
  }
}

async function relayResponse(
  backendResponse: Response,
  cookieData?: {
    accessToken: string;
    refreshToken: string;
    csrfToken: string;
    user?: SessionUser;
  }
): Promise<NextResponse> {
  if (backendResponse.status === 204) {
    const response = new NextResponse(null, { status: 204 });
    if (cookieData?.user) {
      setSessionCookies(response, {
        accessToken: cookieData.accessToken,
        refreshToken: cookieData.refreshToken,
        csrfToken: cookieData.csrfToken,
        user: cookieData.user
      });
    }
    return response;
  }

  const contentType = backendResponse.headers.get("content-type") ?? "application/json";
  const rawBody = await backendResponse.text();
  const response = new NextResponse(rawBody, {
    status: backendResponse.status,
    headers: {
      "content-type": contentType
    }
  });

  if (cookieData?.user) {
    setSessionCookies(response, {
      accessToken: cookieData.accessToken,
      refreshToken: cookieData.refreshToken,
      csrfToken: cookieData.csrfToken,
      user: cookieData.user
    });
  }

  const replayed = backendResponse.headers.get("idempotency-replayed");
  if (replayed) {
    response.headers.set("idempotency-replayed", replayed);
  }
  return response;
}

async function handle(request: NextRequest, pathSegments: string[]): Promise<NextResponse> {
  const path = buildPath(pathSegments);
  const root = path.split("/")[0];

  if (!ALLOWED_ROOTS.has(root)) {
    return NextResponse.json({ message: "Endpoint is not allowed" }, { status: 404 });
  }

  const method = request.method as "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  const query = request.nextUrl.search;
  const idempotencyKey = request.headers.get("idempotency-key") ?? undefined;

  const cookieStore = await cookies();
  const accessToken = cookieStore.get(SESSION_COOKIE_NAMES.accessToken)?.value;
  const refreshToken = cookieStore.get(SESSION_COOKIE_NAMES.refreshToken)?.value;
  const csrfToken = cookieStore.get(SESSION_COOKIE_NAMES.csrfToken)?.value;

  let body: unknown;
  if (method === "POST" || method === "PUT" || method === "PATCH" || method === "DELETE") {
    try {
      body = await request.json();
    } catch {
      body = undefined;
    }
  }

  const firstAttempt = await backendRequest({
    path,
    method,
    query,
    body,
    accessToken,
    csrfToken,
    idempotencyKey
  });

  if (firstAttempt.status !== 401 || !refreshToken || !isAuthRefreshable(path)) {
    return relayResponse(firstAttempt);
  }

  const refreshed = await refreshTokens(refreshToken);
  if (!refreshed) {
    return relayResponse(firstAttempt);
  }

  const secondAttempt = await backendRequest({
    path,
    method,
    query,
    body,
    accessToken: refreshed.access_token,
    csrfToken: refreshed.csrf_token,
    idempotencyKey
  });

  const user = parseUserCookie(cookieStore.get(SESSION_COOKIE_NAMES.user)?.value);
  return relayResponse(secondAttempt, {
    accessToken: refreshed.access_token,
    refreshToken: refreshed.refresh_token,
    csrfToken: refreshed.csrf_token,
    user
  });
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
): Promise<NextResponse> {
  const { path } = await context.params;
  return handle(request, path);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
): Promise<NextResponse> {
  const { path } = await context.params;
  return handle(request, path);
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
): Promise<NextResponse> {
  const { path } = await context.params;
  return handle(request, path);
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
): Promise<NextResponse> {
  const { path } = await context.params;
  return handle(request, path);
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
): Promise<NextResponse> {
  const { path } = await context.params;
  return handle(request, path);
}
