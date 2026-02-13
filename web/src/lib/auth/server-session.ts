import { cookies } from "next/headers";

import { SESSION_COOKIE_NAMES } from "@/lib/auth/constants";
import type { SessionUser } from "@/lib/auth/types";

export async function getServerSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const userValue = cookieStore.get(SESSION_COOKIE_NAMES.user)?.value;
  if (!userValue) {
    return null;
  }

  try {
    return JSON.parse(userValue) as SessionUser;
  } catch {
    return null;
  }
}

export async function hasServerAccessToken(): Promise<boolean> {
  const cookieStore = await cookies();
  return Boolean(cookieStore.get(SESSION_COOKIE_NAMES.accessToken)?.value);
}
