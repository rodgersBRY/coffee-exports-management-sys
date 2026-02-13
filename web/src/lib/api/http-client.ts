import { parseApiError } from "@/lib/errors/api-client-error";

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  query?: string;
};

export async function apiClient<T>(path: string, options?: RequestOptions): Promise<T> {
  const method = options?.method ?? "GET";
  const query = options?.query ?? "";
  const isMutation = method === "POST" || method === "PUT" || method === "PATCH" || method === "DELETE";

  const response = await fetch(`/api/bff/${path}${query}`, {
    method,
    credentials: "include",
    headers: {
      "content-type": "application/json",
      "x-requested-with": "XMLHttpRequest",
      ...(isMutation ? { "idempotency-key": crypto.randomUUID() } : {})
    },
    body: options?.body !== undefined ? JSON.stringify(options.body) : undefined,
    cache: "no-store"
  });

  if (!response.ok) {
    throw await parseApiError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return (await response.text()) as T;
  }
  return (await response.json()) as T;
}
