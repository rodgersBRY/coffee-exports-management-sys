import { parseApiError } from "@/lib/errors/api-client-error";
import type { SessionUser } from "@/lib/auth/types";

export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterInput = {
  email: string;
  password: string;
  full_name: string;
  role?: "admin" | "trader" | "warehouse" | "finance" | "compliance";
};

export async function login(input: LoginInput): Promise<{ user: SessionUser }> {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    credentials: "include",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify(input)
  });
  if (!response.ok) {
    throw await parseApiError(response);
  }
  return (await response.json()) as { user: SessionUser };
}

export async function register(input: RegisterInput): Promise<SessionUser> {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    credentials: "include",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify(input)
  });
  if (!response.ok) {
    throw await parseApiError(response);
  }
  return (await response.json()) as SessionUser;
}

export async function logout(): Promise<void> {
  const response = await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include"
  });
  if (!response.ok) {
    throw await parseApiError(response);
  }
}

export async function getSession(): Promise<{ authenticated: boolean; user?: SessionUser }> {
  const response = await fetch("/api/auth/session", {
    method: "GET",
    credentials: "include",
    cache: "no-store"
  });
  if (!response.ok) {
    throw await parseApiError(response);
  }
  return (await response.json()) as { authenticated: boolean; user?: SessionUser };
}
