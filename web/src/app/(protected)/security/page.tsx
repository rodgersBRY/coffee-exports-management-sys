"use client";

import { useQuery } from "@tanstack/react-query";

import { ResourcePanel } from "@/components/data/ResourcePanel";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { apiClient } from "@/lib/api/http-client";
import type { PaginatedResult } from "@/lib/auth/types";
import { buildApiKeyFields, buildApiKeyFilters, buildSecurityFieldOptions } from "@/modules/security/config";

type SecurityUser = {
  id: number;
  full_name: string;
  email: string;
};

export default function SecurityPage(): React.JSX.Element {
  const usersQuery = useQuery({
    queryKey: ["auth", "users", "lookup"],
    queryFn: () =>
      apiClient<PaginatedResult<SecurityUser>>("auth/users", {
        query: "?page=1&page_size=200&sort_by=full_name&sort_order=asc"
      })
  });
  const options = buildSecurityFieldOptions(usersQuery.data?.data ?? []);

  return (
    <>
      <ErrorAlert error={usersQuery.error} />
      <ResourcePanel
        title="API Keys"
        description="Create and list API keys for external integrations and automation tools."
        listEndpoint="auth/api-keys"
        createEndpoint="auth/api-keys"
        createFields={buildApiKeyFields(options)}
        sortBy="created_at"
        filters={buildApiKeyFilters(options)}
      />
    </>
  );
}
