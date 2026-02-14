"use client";

import { useQuery } from "@tanstack/react-query";

import { GuidedActionForm } from "@/components/data/GuidedActionForm";
import { ModuleWorkspace } from "@/components/layout/ModuleWorkspace";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { apiClient } from "@/lib/api/http-client";
import {
  buildContractLookupFields,
  buildCostEntryFields,
  buildFinanceFieldOptions,
  type FinanceReferenceData
} from "@/modules/finance/config";

export default function FinancePage(): React.JSX.Element {
  const referenceQuery = useQuery({
    queryKey: ["profitability", "reference-data"],
    queryFn: () => apiClient<FinanceReferenceData>("profitability/reference-data")
  });
  const options = buildFinanceFieldOptions(
    referenceQuery.data ?? { contracts: [], lots: [], shipments: [] }
  );

  return (
    <>
      <ErrorAlert error={referenceQuery.error} />
      <ModuleWorkspace
        title="Finance Workspace"
        subtitle="Record costs and evaluate contract profitability in separate steps."
        sections={[
          {
            id: "costs",
            label: "Cost Entry",
            hint: "Capture expenses",
            content: (
              <GuidedActionForm
                title="Record Cost"
                description="Capture lot-level or shipment-level operational costs."
                submitLabel="Save cost"
                successMessage="Cost saved"
                pathTemplate="costs/entries"
                bodyFields={buildCostEntryFields(options)}
              />
            )
          },
          {
            id: "profitability",
            label: "Profitability",
            hint: "Contract margin",
            content: (
              <GuidedActionForm
                title="Contract Profitability"
                description="View margin and total cost for a selected contract."
                submitLabel="View profitability"
                successMessage="Profitability loaded"
                pathTemplate="profitability/contracts/{contract_id}"
                pathFields={buildContractLookupFields(options)}
                method="GET"
              />
            )
          }
        ]}
      />
    </>
  );
}
