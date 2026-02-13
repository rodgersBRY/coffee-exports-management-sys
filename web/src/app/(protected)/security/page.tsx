"use client";

import { ResourcePanel } from "@/components/data/ResourcePanel";
import { apiKeyFields, apiKeyFilters } from "@/modules/security/config";

export default function SecurityPage(): React.JSX.Element {
  return (
    <ResourcePanel
      title="API Keys"
      description="Create and list API keys for external integrations and automation tools."
      listEndpoint="auth/api-keys"
      createEndpoint="auth/api-keys"
      createFields={apiKeyFields}
      sortBy="created_at"
      filters={apiKeyFilters}
    />
  );
}
