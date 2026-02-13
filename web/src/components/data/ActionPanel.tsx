"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";

import { Card } from "@/components/ui/Card";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { apiClient } from "@/lib/api/http-client";
import { useToastStore } from "@/lib/state/toast-store";

type Props = {
  title: string;
  description: string;
  endpoint: string;
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  sampleBody: string;
};

export function ActionPanel({
  title,
  description,
  endpoint,
  method = "POST",
  sampleBody
}: Props): React.JSX.Element {
  const notify = useToastStore((state) => state.push);
  const [path, setPath] = useState(endpoint);
  const [payload, setPayload] = useState(sampleBody);
  const [responseBody, setResponseBody] = useState<string>("");

  const mutation = useMutation({
    mutationFn: async () => {
      let body: unknown = undefined;
      if (method !== "DELETE" && method !== "GET") {
        body = payload.trim().length > 0 ? JSON.parse(payload) : undefined;
      }
      return apiClient(path, {
        method,
        body
      });
    },
    onSuccess: (result) => {
      setResponseBody(JSON.stringify(result ?? { ok: true }, null, 2));
      notify({ type: "success", message: `${title} succeeded` });
    },
    onError: (error) => {
      notify({ type: "error", message: error instanceof Error ? error.message : "Action failed" });
    }
  });

  return (
    <Card title={title} description={description}>
      <form
        className="stack"
        onSubmit={(event) => {
          event.preventDefault();
          mutation.mutate();
        }}
      >
        <label>
          Endpoint path (relative to /api/v1)
          <input value={path} onChange={(event) => setPath(event.target.value)} />
        </label>

        {method !== "DELETE" && method !== "GET" ? (
          <label>
            JSON payload
            <textarea
              className="mono"
              rows={8}
              value={payload}
              onChange={(event) => setPayload(event.target.value)}
            />
          </label>
        ) : null}

        <div className="inline">
          <button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Submitting..." : `${method} request`}
          </button>
        </div>

        <ErrorAlert error={mutation.error} />

        {responseBody ? (
          <label>
            Response
            <textarea className="mono" rows={10} value={responseBody} readOnly />
          </label>
        ) : null}
      </form>
    </Card>
  );
}
