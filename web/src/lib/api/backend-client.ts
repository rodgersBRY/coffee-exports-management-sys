import "server-only";

import { serverEnv } from "@/lib/env";

export type BackendRequestOptions = {
  path: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  query?: string;
  body?: unknown;
  accessToken?: string;
  csrfToken?: string;
  idempotencyKey?: string;
};

export async function backendRequest(options: BackendRequestOptions): Promise<Response> {
  const url = new URL(`/api/v1/${options.path}${options.query ?? ""}`, serverEnv.apiUrl);
  const method = options.method ?? "GET";

  const headers = new Headers();
  headers.set("accept", "application/json");
  if (options.body !== undefined) {
    headers.set("content-type", "application/json");
  }

  if (options.accessToken) {
    headers.set("authorization", `Bearer ${options.accessToken}`);
  }

  const isMutation = method === "POST" || method === "PUT" || method === "PATCH" || method === "DELETE";
  if (isMutation && options.csrfToken) {
    headers.set("x-csrf-token", options.csrfToken);
    headers.set("cookie", `ceoms_csrf=${options.csrfToken}`);
  }
  
  if (isMutation && options.idempotencyKey) {
    headers.set("idempotency-key", options.idempotencyKey);
  }

  try {
    return await fetch(url, {
      method,
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      cache: "no-store"
    });
  } catch (error) {
    const cause = error as { cause?: { code?: string } };
    const code = cause.cause?.code ?? "FETCH_FAILED";

    return new Response(
      JSON.stringify({
        message: "CEOMS API is unreachable",
        detail: `Could not connect to ${url.origin}. Confirm API is running and CEOMS_API_URL is correct.`,
        code
      }),
      {
        status: 503,
        headers: {
          "content-type": "application/json"
        }
      }
    );
  }
}

export async function cloneJsonOrText(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return response.json();
  }
  
  return response.text();
}
