"use client";

import { useQuery } from "@tanstack/react-query";

import { GuidedActionForm } from "@/components/data/GuidedActionForm";
import { ModuleWorkspace } from "@/components/layout/ModuleWorkspace";
import { Card } from "@/components/ui/Card";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { apiClient } from "@/lib/api/http-client";
import { useSessionQuery } from "@/modules/auth/useSessionQuery";
import {
  buildContractLookupFields,
  buildFinanceFieldOptions,
  type FinanceReferenceData
} from "@/modules/finance/config";
import {
  buildLotLookupFields,
  buildTraceabilityFieldOptions,
  type TraceabilityReferenceData
} from "@/modules/traceability/config";

export default function ReportsPage(): React.JSX.Element {
  const session = useSessionQuery();
  const role = session.data?.user?.role;
  const canViewProfitability = role === "admin" || role === "finance" || role === "trader";
  const canViewTraceability = role === "admin" || role === "compliance" || role === "trader";
  const financeReferenceQuery = useQuery({
    queryKey: ["profitability", "reference-data", "reports"],
    queryFn: () => apiClient<FinanceReferenceData>("profitability/reference-data"),
    enabled: canViewProfitability
  });
  const traceabilityReferenceQuery = useQuery({
    queryKey: ["traceability", "reference-data", "reports"],
    queryFn: () => apiClient<TraceabilityReferenceData>("traceability/reference-data"),
    enabled: canViewTraceability
  });
  const financeOptions = buildFinanceFieldOptions(
    financeReferenceQuery.data ?? { contracts: [], lots: [], shipments: [] }
  );
  const traceabilityOptions = buildTraceabilityFieldOptions(traceabilityReferenceQuery.data ?? { lots: [] });

  return (
    <>
      <ErrorAlert error={financeReferenceQuery.error} />
      <ErrorAlert error={traceabilityReferenceQuery.error} />

      <Card
        title="Reports Hub"
        description="Generate financial and compliance outputs directly from the API while preserving traceability."
      >
        <div className="inline">
          <span className="tag">Profit per contract</span>
          <span className="tag">Shipment docs</span>
          <span className="tag">Lot trace chain</span>
        </div>
      </Card>

      <ModuleWorkspace
        title="Reports Workspace"
        subtitle="Load one report context at a time."
        sections={[
          ...(canViewProfitability
            ? [
                {
                  id: "profitability",
                  label: "Contract Profitability",
                  hint: "Cost and margin",
                  content: (
                    <GuidedActionForm
                      title="Contract Profitability"
                      description="Review cost, revenue, and margin for a contract."
                      submitLabel="Load profitability"
                      successMessage="Profitability loaded"
                      pathTemplate="profitability/contracts/{contract_id}"
                      pathFields={buildContractLookupFields(financeOptions)}
                      method="GET"
                    />
                  )
                }
              ]
            : []),
          ...(canViewTraceability
            ? [
                {
                  id: "traceability",
                  label: "Lot Traceability",
                  hint: "Origin and movement",
                  content: (
                    <GuidedActionForm
                      title="Lot Traceability"
                      description="Review lot origin, allocations, and shipment movement."
                      submitLabel="Load traceability"
                      successMessage="Traceability loaded"
                      pathTemplate="traceability/lots/{lot_id}"
                      pathFields={buildLotLookupFields(traceabilityOptions)}
                      method="GET"
                    />
                  )
                }
              ]
            : [])
        ]}
      />
    </>
  );
}
