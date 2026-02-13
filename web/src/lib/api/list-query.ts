export type ListQuery = {
  page?: number;
  page_size?: number;
  sort_by?: string;
  sort_order?: "asc" | "desc";
  search?: string;
  filters?: Record<string, string | number | boolean | undefined | null>;
};

export function toListQueryString(query?: ListQuery): string {
  if (!query) {
    return "";
  }

  const params = new URLSearchParams();
  if (query.page) {
    params.set("page", String(query.page));
  }
  if (query.page_size) {
    params.set("page_size", String(query.page_size));
  }
  if (query.sort_by) {
    params.set("sort_by", query.sort_by);
  }
  if (query.sort_order) {
    params.set("sort_order", query.sort_order);
  }
  if (query.search) {
    params.set("search", query.search);
  }
  if (query.filters) {
    for (const [key, value] of Object.entries(query.filters)) {
      if (value === undefined || value === null || value === "") {
        continue;
      }
      params.set(`filter_${key}`, String(value));
    }
  }

  const serialized = params.toString();
  return serialized.length > 0 ? `?${serialized}` : "";
}
