import type { ApiErrorPayload } from "@/lib/auth/types";

export class ApiClientError extends Error {
  status: number;
  requestId?: string;
  detail?: string;
  issues?: ApiErrorPayload["issues"];

  constructor(
    message: string,
    status: number,
    options?: { requestId?: string; detail?: string; issues?: ApiErrorPayload["issues"] }
  ) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.requestId = options?.requestId;
    this.detail = options?.detail;
    this.issues = options?.issues;
  }
}

export async function parseApiError(response: Response): Promise<ApiClientError> {
  let payload: ApiErrorPayload | null = null;
  try {
    payload = (await response.json()) as ApiErrorPayload;
  } catch {
    payload = null;
  }

  return new ApiClientError(payload?.message ?? "Request failed", response.status, {
    requestId: payload?.request_id ?? undefined,
    detail: payload?.detail ?? undefined,
    issues: payload?.issues
  });
}
