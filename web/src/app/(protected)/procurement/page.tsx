"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { GuidedActionForm } from "@/components/data/GuidedActionForm";
import { ResourcePanel } from "@/components/data/ResourcePanel";
import { ModuleWorkspace } from "@/components/layout/ModuleWorkspace";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { apiClient } from "@/lib/api/http-client";
import {
  buildAuctionLotFilters,
  buildAuctionLotFields,
  buildDirectDeliveryFilters,
  buildDirectAgreementFields,
  buildDirectAgreementFilters,
  buildDirectDeliveryFields,
  buildProcurementFieldOptions,
  type ProcurementReferenceData,
} from "@/modules/procurement/config";

export default function ProcurementPage(): React.JSX.Element {
  const [showAuctionForm, setShowAuctionForm] = useState(false);
  const [showDeliveryForm, setShowDeliveryForm] = useState(false);

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
              <div className="stack">
                <div className="inline">
                  <button
                    type="button"
                    className="secondary"
                    onClick={() => setShowAuctionForm((previous) => !previous)}
                  >
                    {showAuctionForm ? "Hide auction form" : "Add auction lot"}
                  </button>
                </div>
                {showAuctionForm ? (
                  <GuidedActionForm
                    title="Auction Purchase Intake"
                    description="Record auction lot details and save directly to inventory."
                    submitLabel="Save auction lot"
                    successMessage="Auction lot saved"
                    pathTemplate="procurement/auction-lots"
                    bodyFields={buildAuctionLotFields(options)}
                  />
                ) : null}
                <ResourcePanel
                  title="Saved Auction Lots"
                  description="View auction entries captured in procurement."
                  listEndpoint="procurement/auction-lots"
                  sortBy="created_at"
                  filters={buildAuctionLotFilters(options)}
                />
              </div>
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
              <div className="stack">
                <div className="inline">
                  <button
                    type="button"
                    className="secondary"
                    onClick={() => setShowDeliveryForm((previous) => !previous)}
                  >
                    {showDeliveryForm ? "Hide delivery form" : "Add direct delivery"}
                  </button>
                </div>
                {showDeliveryForm ? (
                  <GuidedActionForm
                    title="Direct Delivery Intake"
                    description="Capture incoming direct delivery quantities and quality metrics."
                    submitLabel="Save delivery"
                    successMessage="Direct delivery saved"
                    pathTemplate="procurement/direct-deliveries"
                    bodyFields={buildDirectDeliveryFields(options)}
                  />
                ) : null}
                <ResourcePanel
                  title="Saved Direct Deliveries"
                  description="View direct delivery entries captured in procurement."
                  listEndpoint="procurement/direct-deliveries"
                  sortBy="created_at"
                  filters={buildDirectDeliveryFilters(options)}
                />
              </div>
            ),
          },
        ]}
      />
    </>
  );
}
