"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { DataTable } from "@/components/data/DataTable";
import { PaginationBar } from "@/components/data/PaginationBar";
import { Card } from "@/components/ui/Card";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { toListQueryString } from "@/lib/api/list-query";
import { apiClient } from "@/lib/api/http-client";
import type { PaginatedResult } from "@/lib/auth/types";
import { useToastStore } from "@/lib/state/toast-store";

type SelectOption = {
  label: string;
  value: string;
};

export type FieldConfig = {
  name: string;
  label: string;
  type: "text" | "number" | "date" | "select";
  required?: boolean;
  integer?: boolean;
  options?: SelectOption[];
};

export type FilterConfig = {
  name: string;
  label: string;
};

type Props = {
  title: string;
  description: string;
  listEndpoint: string;
  createEndpoint?: string;
  createFields?: FieldConfig[];
  sortBy: string;
  sortOrder?: "asc" | "desc";
  filters?: FilterConfig[];
};

type GenericRow = Record<string, unknown>;

function parseFieldValue(field: FieldConfig, raw: string): unknown {
  if (field.type === "number") {
    const value = Number(raw);
    if (field.integer) {
      return Math.trunc(value);
    }
    return value;
  }
  return raw;
}

export function ResourcePanel({
  title,
  description,
  listEndpoint,
  createEndpoint,
  createFields = [],
  sortBy,
  sortOrder = "desc",
  filters = []
}: Props): React.JSX.Element {
  const queryClient = useQueryClient();
  const notify = useToastStore((state) => state.push);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [filterState, setFilterState] = useState<Record<string, string>>({});
  const [formState, setFormState] = useState<Record<string, string>>(() =>
    Object.fromEntries(createFields.map((field) => [field.name, ""]))
  );

  const queryString = useMemo(
    () =>
      toListQueryString({
        page,
        page_size: pageSize,
        sort_by: sortBy,
        sort_order: sortOrder,
        search,
        filters: filterState
      }),
    [page, pageSize, sortBy, sortOrder, search, filterState]
  );

  const listQuery = useQuery({
    queryKey: ["list", listEndpoint, queryString],
    queryFn: () => apiClient<PaginatedResult<GenericRow>>(listEndpoint, { query: queryString })
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!createEndpoint || createFields.length === 0) {
        return undefined;
      }

      const payload: Record<string, unknown> = {};
      for (const field of createFields) {
        const raw = (formState[field.name] ?? "").trim();
        if (raw.length === 0) {
          if (field.required) {
            throw new Error(`${field.label} is required`);
          }
          continue;
        }
        payload[field.name] = parseFieldValue(field, raw);
      }

      return apiClient(createEndpoint, {
        method: "POST",
        body: payload
      });
    },
    onSuccess: () => {
      notify({ type: "success", message: `${title} created` });
      setFormState(Object.fromEntries(createFields.map((field) => [field.name, ""])));
      void queryClient.invalidateQueries({ queryKey: ["list", listEndpoint] });
    },
    onError: (error) => {
      notify({ type: "error", message: error instanceof Error ? error.message : "Request failed" });
    }
  });

  return (
    <Card title={title} description={description}>
      {createEndpoint && createFields.length > 0 ? (
        <form
          className="stack"
          onSubmit={(event) => {
            event.preventDefault();
            createMutation.mutate();
          }}
        >
          <div className="inline">
            {createFields.map((field) => (
              <label key={field.name}>
                {field.label}
                {field.type === "select" ? (
                  <select
                    value={formState[field.name] ?? ""}
                    onChange={(event) =>
                      setFormState((previous) => ({
                        ...previous,
                        [field.name]: event.target.value
                      }))
                    }
                  >
                    <option value="">Select...</option>
                    {(field.options ?? []).map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
                    step={field.type === "number" && !field.integer ? "0.001" : undefined}
                    value={formState[field.name] ?? ""}
                    onChange={(event) =>
                      setFormState((previous) => ({
                        ...previous,
                        [field.name]: event.target.value
                      }))
                    }
                  />
                )}
              </label>
            ))}
          </div>
          <div className="inline">
            <button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Submitting..." : "Create"}
            </button>
          </div>
          <ErrorAlert error={createMutation.error} />
        </form>
      ) : null}

      <div className="resource-layout">
        <aside className="filters-panel">
          <h4>Filters</h4>
          <div className="stack">
            <label>
              Search
              <input
                value={search}
                onChange={(event) => {
                  setPage(1);
                  setSearch(event.target.value);
                }}
                placeholder="Lot, contract, reference..."
              />
            </label>

            <label>
              Page size
              <select
                value={String(pageSize)}
                onChange={(event) => {
                  setPage(1);
                  setPageSize(Number(event.target.value));
                }}
              >
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </label>

            {filters.map((filter) => (
              <label key={filter.name}>
                {filter.label}
                <input
                  value={filterState[filter.name] ?? ""}
                  onChange={(event) => {
                    setPage(1);
                    setFilterState((previous) => ({
                      ...previous,
                      [filter.name]: event.target.value
                    }));
                  }}
                />
              </label>
            ))}
          </div>
        </aside>

        <div className="results-panel">
          <ErrorAlert error={listQuery.error} />

          {listQuery.isLoading ? (
            <div className="alert info">Loading...</div>
          ) : (
            <>
              <DataTable rows={(listQuery.data?.data ?? []) as GenericRow[]} />
              {listQuery.data ? (
                <PaginationBar
                  page={listQuery.data.meta.page}
                  pageSize={listQuery.data.meta.page_size}
                  total={listQuery.data.meta.total}
                  hasNext={listQuery.data.meta.has_next}
                  hasPrev={listQuery.data.meta.has_prev}
                  onPageChange={setPage}
                />
              ) : null}
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
