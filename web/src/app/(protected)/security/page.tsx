"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { ResourcePanel } from "@/components/data/ResourcePanel";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { apiClient } from "@/lib/api/http-client";
import type { PaginatedResult } from "@/lib/auth/types";
import { useToastStore } from "@/lib/state/toast-store";
import { buildApiKeyFields, buildApiKeyFilters, buildSecurityFieldOptions } from "@/modules/security/config";

type SecurityUser = {
  id: number;
  full_name: string;
  email: string;
};

type CreateApiKeyResult = {
  api_key?: string;
};

export default function SecurityPage(): React.JSX.Element {
  const [newApiKey, setNewApiKey] = useState<string | null>(null);
  const notify = useToastStore((state) => state.push);

  const usersQuery = useQuery({
    queryKey: ["auth", "users", "lookup"],
    queryFn: () =>
      apiClient<PaginatedResult<SecurityUser>>("auth/users", {
        query: "?page=1&page_size=100&sort_by=full_name&sort_order=asc"
      })
  });
  const options = buildSecurityFieldOptions(usersQuery.data?.data ?? []);

  return (
    <>
      <ErrorAlert error={usersQuery.error} />
      {newApiKey ? (
        <section className="card">
          <h2>New API Key</h2>
          <p>Copy and store this key now. For security, the full key is shown only once.</p>
          <div className="inline">
            <input readOnly value={newApiKey} className="mono" />
            <button
              type="button"
              onClick={() => {
                void navigator.clipboard.writeText(newApiKey);
                notify({ type: "success", message: "API key copied" });
              }}
            >
              Copy key
            </button>
            <button type="button" className="ghost" onClick={() => setNewApiKey(null)}>
              Dismiss
            </button>
          </div>
        </section>
      ) : null}
      <ResourcePanel
        title="API Keys"
        description="Create and list API keys for external integrations and automation tools."
        listEndpoint="auth/api-keys"
        createEndpoint="auth/api-keys"
        createFields={buildApiKeyFields(options)}
        sortBy="created_at"
        filters={buildApiKeyFilters(options)}
        hiddenColumns={["id"]}
        onCreateSuccess={(result) => {
          const payload = result as CreateApiKeyResult | undefined;
          if (payload?.api_key) {
            setNewApiKey(payload.api_key);
          }
        }}
      />
    </>
  );
}
