export type UserRole = "admin" | "trader" | "warehouse" | "finance" | "compliance";

export type SessionUser = {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
};

export type LoginResponse = {
  access_token: string;
  refresh_token: string;
  csrf_token: string;
  token_type: string;
  user: SessionUser;
};

export type ApiErrorPayload = {
  message?: string;
  detail?: string | null;
  issues?: Array<{ message?: string; path?: Array<string | number> }>;
  request_id?: string | null;
};

export type PaginatedMeta = {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
  sort_by: string;
  sort_order: "asc" | "desc";
  search?: string;
  filters: Record<string, string>;
};

export type PaginatedResult<T> = {
  data: T[];
  meta: PaginatedMeta;
};
