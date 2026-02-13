import "server-only";

import type { LoginResponse } from "@/lib/auth/types";
import { backendRequest, cloneJsonOrText } from "@/lib/api/backend-client";

export async function refreshTokens(refreshToken: string): Promise<LoginResponse | null> {
  const response = await backendRequest({
    path: "auth/refresh",
    method: "POST",
    body: {
      refresh_token: refreshToken
    }
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await cloneJsonOrText(response)) as Partial<LoginResponse>;
  if (!payload.access_token || !payload.refresh_token || !payload.csrf_token) {
    return null;
  }

  return {
    access_token: payload.access_token,
    refresh_token: payload.refresh_token,
    csrf_token: payload.csrf_token,
    token_type: payload.token_type ?? "Bearer",
    user: payload.user as LoginResponse["user"]
  };
}
