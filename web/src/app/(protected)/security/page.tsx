"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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
  key_prefix?: string;
  api_key?: string;
};

type ApiKeyRow = {
  id: string;
  user_id: number;
  name: string;
  key_prefix: string;
  is_active: boolean;
  expires_at: string | null;
  last_used_at: string | null;
  created_at: string;
  revoked_at: string | null;
};

function maskKeyValue(keyPrefix: string, fullKey?: string): string {
  const source = fullKey ?? keyPrefix;
  const start = source.slice(0, 10);
  const end = source.slice(-3);
  return `${start}${"x".repeat(12)}${end}`;
}

export default function SecurityPage(): React.JSX.Element {
  const [newApiKey, setNewApiKey] = useState<string | null>(null);
  const [sessionApiKeys, setSessionApiKeys] = useState<Record<string, string>>({});
  const notify = useToastStore((state) => state.push);
  const queryClient = useQueryClient();

  const usersQuery = useQuery({
    queryKey: ["auth", "users", "lookup"],
    queryFn: () =>
      apiClient<PaginatedResult<SecurityUser>>("auth/users", {
        query: "?page=1&page_size=100&sort_by=full_name&sort_order=asc"
      })
  });
  const options = buildSecurityFieldOptions(usersQuery.data?.data ?? []);

  const revokeMutation = useMutation({
    mutationFn: async (apiKeyId: string) =>
      apiClient(`auth/api-keys/${encodeURIComponent(apiKeyId)}/revoke`, { method: "PATCH" }),
    onSuccess: async () => {
      notify({ type: "success", message: "API key revoked" });
      await queryClient.invalidateQueries({ queryKey: ["list", "auth/api-keys"] });
    },
    onError: (error) => {
      notify({ type: "error", message: error instanceof Error ? error.message : "Failed to revoke key" });
    }
  });

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
        cellRenderers={{
          key_prefix: (value) => {
            const keyPrefix = String(value ?? "");
            const fullKey = sessionApiKeys[keyPrefix];
            const masked = maskKeyValue(keyPrefix, fullKey);

            return (
              <div className="inline">
                <span className="mono">{masked}</span>
                {fullKey ? (
                  <button
                    type="button"
                    className="ghost"
                    onClick={() => {
                      void navigator.clipboard.writeText(fullKey);
                      notify({ type: "success", message: "Full API key copied" });
                    }}
                  >
                    Copy
                  </button>
                ) : null}
              </div>
            );
          }
        }}
        rowActions={(row) => {
          const apiKey = row as ApiKeyRow;
          const isRevoked = apiKey.is_active === false || apiKey.revoked_at !== null;

          return (
            <button
              type="button"
              className={isRevoked ? "ghost" : "danger"}
              disabled={isRevoked || revokeMutation.isPending}
              onClick={() => revokeMutation.mutate(apiKey.id)}
            >
              {isRevoked ? "Revoked" : "Revoke"}
            </button>
          );
        }}
        rowActionsLabel="Key Actions"
        onCreateSuccess={(result) => {
          const payload = result as CreateApiKeyResult | undefined;
          if (payload?.api_key) {
            setNewApiKey(payload.api_key);
          }
          if (payload?.api_key && payload.key_prefix) {
            setSessionApiKeys((previous) => ({
              ...previous,
              [payload.key_prefix as string]: payload.api_key as string
            }));
          }
        }}
      />
    </>
  );
}
