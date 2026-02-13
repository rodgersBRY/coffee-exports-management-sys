import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import type { LoginResponse } from "@/lib/auth/types";
import { backendRequest, cloneJsonOrText } from "@/lib/api/backend-client";
import { setSessionCookies } from "@/lib/auth/session-cookies";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: z.infer<typeof loginSchema>;
  try {
    body = loginSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ message: "Invalid login payload" }, { status: 400 });
  }

  const backendResponse = await backendRequest({
    path: "auth/login",
    method: "POST",
    body
  });

  const payload = await cloneJsonOrText(backendResponse);
  if (!backendResponse.ok) {
    return NextResponse.json(payload, { status: backendResponse.status });
  }

  const login = payload as LoginResponse;
  const response = NextResponse.json({
    user: login.user,
    token_type: login.token_type
  });

  setSessionCookies(response, {
    accessToken: login.access_token,
    refreshToken: login.refresh_token,
    csrfToken: login.csrf_token,
    user: login.user
  });

  return response;
}
