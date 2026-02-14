"use client";

import { useQuery } from "@tanstack/react-query";

import { GuidedActionForm } from "@/components/data/GuidedActionForm";
import { ResourcePanel } from "@/components/data/ResourcePanel";
import { ModuleWorkspace } from "@/components/layout/ModuleWorkspace";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { apiClient } from "@/lib/api/http-client";
import {
  buildAllocationFields,
  buildAllocationPathFields,
  buildContractFields,
  buildContractsFieldOptions,
  type ContractsReferenceData
} from "@/modules/contracts/config";

export default function ContractsPage(): React.JSX.Element {
  const referenceQuery = useQuery({
    queryKey: ["contracts", "reference-data"],
    queryFn: () => apiClient<ContractsReferenceData>("contracts/reference-data")
  });
  const options = buildContractsFieldOptions(
    referenceQuery.data ?? { buyers: [], grades: [], contracts: [], lots: [] }
  );

  return (
    <>
      <ErrorAlert error={referenceQuery.error} />
      <ModuleWorkspace
        title="Contracts Workspace"
        subtitle="Manage contract lifecycle in focused stages."
        sections={[
          {
            id: "new-contract",
            label: "New Contract",
            hint: "Buyer and terms",
            content: (
              <GuidedActionForm
                title="New Sales Contract"
                description="Capture buyer terms and shipment window for a new contract."
                submitLabel="Save contract"
                successMessage="Contract saved"
                pathTemplate="contracts"
                bodyFields={buildContractFields(options)}
              />
            )
          },
          {
            id: "allocation",
            label: "Allocation",
            hint: "Assign lots",
            content: (
              <GuidedActionForm
                title="Allocate Lot Quantity"
                description="Assign lot quantity to a selected contract."
                submitLabel="Save allocation"
                successMessage="Allocation saved"
                pathTemplate="contracts/{contract_id}/allocations"
                pathFields={buildAllocationPathFields(options)}
                bodyFields={buildAllocationFields(options)}
              />
            )
          },
          {
            id: "dashboard",
            label: "Dashboard",
            hint: "Fulfillment view",
            content: (
              <ResourcePanel
                title="Contracts Dashboard"
                description="View open contracts, fulfillment progress, and filter/search by buyer/status/window."
                listEndpoint="contracts/dashboard"
                sortBy="created_at"
                filters={[
                  { name: "status", label: "Status" },
                  { name: "buyer_id", label: "Buyer", type: "search-select", options: options.buyers },
                  { name: "shipment_window_from", label: "Shipment window from" },
                  { name: "shipment_window_to", label: "Shipment window to" }
                ]}
              />
            )
          }
        ]}
      />
    </>
  );
}
