"use client";

import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";

import { ActionResultView } from "@/components/data/ActionResultView";
import { SearchableSelectControl } from "@/components/data/SearchableSelectControl";
import { Card } from "@/components/ui/Card";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { apiClient } from "@/lib/api/http-client";
import { useToastStore } from "@/lib/state/toast-store";

type SelectOption = {
  label: string;
  value: string;
};

export type GuidedField = {
  name: string;
  label: string;
  type:
    | "text"
    | "number"
    | "date"
    | "select"
    | "search-select"
    | "textarea"
    | "number-list"
    | "text-list"
    | "checkbox-group";
  required?: boolean;
  integer?: boolean;
  rows?: number;
  placeholder?: string;
  options?: SelectOption[];
  disabled?: boolean;
};

type Props = {
  title: string;
  description: string;
  submitLabel: string;
  successMessage: string;
  pathTemplate: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  pathFields?: GuidedField[];
  bodyFields?: GuidedField[];
  queryFields?: GuidedField[];
};

type FieldState = string | string[];

function defaultState(fields: GuidedField[]): Record<string, FieldState> {
  return Object.fromEntries(
    fields.map((field) => [field.name, field.type === "checkbox-group" ? [] : ""])
  );
}

function parseValue(field: GuidedField, value: FieldState): unknown {
  if (field.type === "checkbox-group") {
    const selected = Array.isArray(value) ? value : [];
    if (field.required && selected.length === 0) {
      throw new Error(`${field.label} is required`);
    }
    if (field.integer) {
      const numbers = selected.map((entry) => Number(entry));
      if (numbers.some((entry) => !Number.isFinite(entry))) {
        throw new Error(`${field.label} contains an invalid value`);
      }
      return numbers.map((entry) => Math.trunc(entry));
    }
    return selected;
  }

  const raw = String(value ?? "").trim();
  if (!raw) {
    if (field.required) {
      throw new Error(`${field.label} is required`);
    }
    return undefined;
  }

  if (field.type === "number") {
    const numeric = Number(raw);
    if (!Number.isFinite(numeric)) {
      throw new Error(`${field.label} must be a valid number`);
    }
    return field.integer ? Math.trunc(numeric) : numeric;
  }

  if ((field.type === "select" || field.type === "search-select") && field.integer) {
    const numeric = Number(raw);
    if (!Number.isFinite(numeric)) {
      throw new Error(`${field.label} must be a valid value`);
    }
    return Math.trunc(numeric);
  }

  if (field.type === "number-list") {
    const values = raw
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => Number(part));
    if (values.some((value) => !Number.isFinite(value))) {
      throw new Error(`${field.label} contains an invalid number`);
    }
    if (field.required && values.length === 0) {
      throw new Error(`${field.label} is required`);
    }
    return values;
  }

  if (field.type === "text-list") {
    const values = raw
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);
    if (field.required && values.length === 0) {
      throw new Error(`${field.label} is required`);
    }
    return values;
  }

  return raw;
}

function buildPath(template: string, pathValues: Record<string, FieldState>): string {
  return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (_segment, key: string) => {
    const raw = pathValues[key];
    const value = Array.isArray(raw) ? raw.join(",") : String(raw ?? "").trim();
    if (!value) {
      throw new Error(`${key.replaceAll("_", " ")} is required`);
    }
    return encodeURIComponent(value);
  });
}

export function GuidedActionForm({
  title,
  description,
  submitLabel,
  successMessage,
  pathTemplate,
  method = "POST",
  pathFields = [],
  bodyFields = [],
  queryFields = []
}: Props): React.JSX.Element {
  const notify = useToastStore((state) => state.push);

  const [pathState, setPathState] = useState<Record<string, FieldState>>(() => defaultState(pathFields));
  const [bodyState, setBodyState] = useState<Record<string, FieldState>>(() => defaultState(bodyFields));
  const [queryState, setQueryState] = useState<Record<string, FieldState>>(() => defaultState(queryFields));
  const [responseData, setResponseData] = useState<unknown | null>(null);

  const hasForm = pathFields.length + bodyFields.length + queryFields.length > 0;

  const mutation = useMutation({
    mutationFn: async () => {
      const path = buildPath(pathTemplate, pathState);

      const queryParams = new URLSearchParams();
      for (const field of queryFields) {
        const parsed = parseValue(field, queryState[field.name]);
        if (parsed === undefined) {
          continue;
        }
        if (Array.isArray(parsed)) {
          if (parsed.length > 0) {
            queryParams.set(field.name, parsed.join(","));
          }
          continue;
        }
        queryParams.set(field.name, String(parsed));
      }

      const bodyPayload: Record<string, unknown> = {};
      for (const field of bodyFields) {
        const parsed = parseValue(field, bodyState[field.name]);
        if (parsed === undefined) {
          continue;
        }
        bodyPayload[field.name] = parsed;
      }

      const query = queryParams.toString();

      return apiClient<unknown>(path, {
        method,
        query: query ? `?${query}` : undefined,
        body: bodyFields.length > 0 ? bodyPayload : undefined
      });
    },
    onSuccess: (result) => {
      setResponseData(result ?? { ok: true });
      notify({ type: "success", message: successMessage });
    },
    onError: (error) => {
      notify({ type: "error", message: error instanceof Error ? error.message : "Request failed" });
    }
  });

  const orderedFieldGroups = useMemo(
    () => [
      { title: "Record", fields: pathFields, state: pathState, setState: setPathState },
      { title: "Details", fields: bodyFields, state: bodyState, setState: setBodyState },
      { title: "View Options", fields: queryFields, state: queryState, setState: setQueryState }
    ],
    [pathFields, bodyFields, queryFields, pathState, bodyState, queryState]
  );

  return (
    <Card title={title} description={description}>
      <form
        className="stack"
        onSubmit={(event) => {
          event.preventDefault();
          mutation.mutate();
        }}
      >
        {orderedFieldGroups.map((group) => {
          if (group.fields.length === 0) {
            return null;
          }
          return (
            <div className="stack" key={group.title}>
              <strong>{group.title}</strong>
              <div className="inline">
                {group.fields.map((field) => {
                  const value = group.state[field.name];

                  if (field.type === "select") {
                    return (
                      <label key={field.name}>
                        {field.label}
                        <select
                          value={Array.isArray(value) ? "" : String(value ?? "")}
                          disabled={field.disabled}
                          onChange={(event) =>
                            group.setState((previous: Record<string, FieldState>) => ({
                              ...previous,
                              [field.name]: event.target.value
                            }))
                          }
                        >
                          <option value="">{field.placeholder ?? "Select..."}</option>
                          {(field.options ?? []).map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </label>
                    );
                  }

                  if (field.type === "search-select") {
                    return (
                      <label key={field.name}>
                        {field.label}
                        <SearchableSelectControl
                          value={Array.isArray(value) ? "" : String(value ?? "")}
                          disabled={field.disabled}
                          options={field.options ?? []}
                          placeholder={field.placeholder ?? "Select..."}
                          onChange={(nextValue) =>
                            group.setState((previous: Record<string, FieldState>) => ({
                              ...previous,
                              [field.name]: nextValue
                            }))
                          }
                        />
                      </label>
                    );
                  }

                  if (field.type === "checkbox-group") {
                    const selected = Array.isArray(value) ? value : [];
                    return (
                      <fieldset key={field.name} className="stack rounded-md border border-[#cfbfa4] p-3">
                        <legend>{field.label}</legend>
                        {(field.options ?? []).map((option) => {
                          const checked = selected.includes(option.value);
                          return (
                            <label key={`${field.name}-${option.value}`} className="inline min-w-0 items-center">
                              <input
                                type="checkbox"
                                checked={checked}
                                disabled={field.disabled}
                                onChange={(event) => {
                                  group.setState((previous: Record<string, FieldState>) => {
                                    const current = Array.isArray(previous[field.name])
                                      ? [...(previous[field.name] as string[])]
                                      : [];
                                    if (event.target.checked) {
                                      if (!current.includes(option.value)) {
                                        current.push(option.value);
                                      }
                                    } else {
                                      const idx = current.indexOf(option.value);
                                      if (idx >= 0) {
                                        current.splice(idx, 1);
                                      }
                                    }
                                    return {
                                      ...previous,
                                      [field.name]: current
                                    };
                                  });
                                }}
                              />
                              <span>{option.label}</span>
                            </label>
                          );
                        })}
                      </fieldset>
                    );
                  }

                  if (field.type === "textarea") {
                    return (
                      <label key={field.name}>
                        {field.label}
                        <textarea
                          rows={field.rows ?? 4}
                          value={Array.isArray(value) ? "" : String(value ?? "")}
                          disabled={field.disabled}
                          onChange={(event) =>
                            group.setState((previous: Record<string, FieldState>) => ({
                              ...previous,
                              [field.name]: event.target.value
                            }))
                          }
                          placeholder={field.placeholder}
                        />
                      </label>
                    );
                  }

                  return (
                    <label key={field.name}>
                      {field.label}
                      <input
                        type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
                        step={field.type === "number" && !field.integer ? "0.001" : undefined}
                        value={Array.isArray(value) ? "" : String(value ?? "")}
                        disabled={field.disabled}
                        onChange={(event) =>
                          group.setState((previous: Record<string, FieldState>) => ({
                            ...previous,
                            [field.name]: event.target.value
                          }))
                        }
                        placeholder={field.placeholder}
                      />
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}

        <div className="inline">
          <button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Working..." : submitLabel}
          </button>
        </div>

        <ErrorAlert error={mutation.error} />

        {!hasForm ? <div className="alert info">No fields are configured for this operation.</div> : null}

        {responseData !== null ? <ActionResultView value={responseData} /> : null}
      </form>
    </Card>
  );
}
