"use client";

import { GuidedActionForm } from "@/components/data/GuidedActionForm";
import { ResourcePanel } from "@/components/data/ResourcePanel";
import {
  allocationFields,
  allocationPathFields,
  contractFields
} from "@/modules/contracts/config";

export default function ContractsPage(): React.JSX.Element {
  return (
    <>
      <div className="grid two">
        <details className="collapsible" open>
          <summary>Contract Creation</summary>
          <div className="content">
            <GuidedActionForm
              title="New Sales Contract"
              description="Capture buyer terms and shipment window for a new contract."
              submitLabel="Save contract"
              successMessage="Contract saved"
              pathTemplate="contracts"
              bodyFields={contractFields}
            />
          </div>
        </details>

        <details className="collapsible" open>
          <summary>Allocation Builder</summary>
          <div className="content">
            <GuidedActionForm
              title="Allocate Lot Quantity"
              description="Assign lot quantity to a selected contract."
              submitLabel="Save allocation"
              successMessage="Allocation saved"
              pathTemplate="contracts/{contract_id}/allocations"
              pathFields={allocationPathFields}
              bodyFields={allocationFields}
            />
          </div>
        </details>
      </div>

      <ResourcePanel
        title="Contracts Dashboard"
        description="View open contracts, fulfillment progress, and filter/search by buyer/status/window."
        listEndpoint="contracts/dashboard"
        sortBy="created_at"
        filters={[
          { name: "status", label: "Status" },
          { name: "buyer_id", label: "Buyer ID" },
          { name: "shipment_window_from", label: "Shipment window from" },
          { name: "shipment_window_to", label: "Shipment window to" }
        ]}
      />
    </>
  );
}
