"use client";

import { useQuery } from "@tanstack/react-query";

import { GuidedActionForm } from "@/components/data/GuidedActionForm";
import { ResourcePanel } from "@/components/data/ResourcePanel";
import { ModuleWorkspace } from "@/components/layout/ModuleWorkspace";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { apiClient } from "@/lib/api/http-client";
import {
  buildAuctionLotFields,
  buildDirectAgreementFields,
  buildDirectAgreementFilters,
  buildDirectDeliveryFields,
  buildProcurementFieldOptions,
  type ProcurementReferenceData,
} from "@/modules/procurement/config";

export default function ProcurementPage(): React.JSX.Element {
  const referenceQuery = useQuery({
    queryKey: ["procurement", "reference-data"],
    queryFn: () =>
      apiClient<ProcurementReferenceData>("procurement/reference-data"),
  });
  const options = buildProcurementFieldOptions(
    referenceQuery.data ?? {
      suppliers: [],
      marketing_agents: [],
      warehouses: [],
      grades: [],
      bag_types: [],
      direct_agreements: [],
    },
  );

  return (
    <>
      <ErrorAlert error={referenceQuery.error} />

      <ModuleWorkspace
        title="Procurement Workspace"
        subtitle="Complete one procurement task at a time without crowded screens."
        sections={[
          {
            id: "auction",
            label: "Auction Intake",
            hint: "NCE lot entry",
            content: (
              <GuidedActionForm
                title="Auction Purchase Intake"
                description="Record auction lot details and save directly to inventory."
                submitLabel="Save auction lot"
                successMessage="Auction lot saved"
                pathTemplate="procurement/auction-lots"
                bodyFields={buildAuctionLotFields(options)}
              />
            ),
          },
          {
            id: "agreements",
            label: "Direct Agreements",
            hint: "Supplier contracts",
            content: (
              <ResourcePanel
                title="Direct Agreements"
                description="Create and list direct procurement agreements."
                listEndpoint="procurement/direct-agreements"
                createEndpoint="procurement/direct-agreements"
                createFields={buildDirectAgreementFields(options)}
                sortBy="created_at"
                filters={buildDirectAgreementFilters(options)}
              />
            ),
          },
          {
            id: "deliveries",
            label: "Direct Deliveries",
            hint: "Incoming lots",
            content: (
              <GuidedActionForm
                title="Direct Delivery Intake"
                description="Capture incoming direct delivery quantities and quality metrics."
                submitLabel="Save delivery"
                successMessage="Direct delivery saved"
                pathTemplate="procurement/direct-deliveries"
                bodyFields={buildDirectDeliveryFields(options)}
              />
            ),
          },
        ]}
      />
    </>
  );
}
