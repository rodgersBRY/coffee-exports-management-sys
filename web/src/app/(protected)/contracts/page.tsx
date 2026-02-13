"use client";

import { ActionPanel } from "@/components/data/ActionPanel";
import { ResourcePanel } from "@/components/data/ResourcePanel";
import { allocateLotSample, createContractSample } from "@/modules/contracts/config";

export default function ContractsPage(): React.JSX.Element {
  return (
    <>
      <div className="grid two">
        <details className="collapsible" open>
          <summary>Contract Creation</summary>
          <div className="content">
            <ActionPanel
              title="Create Contract"
              description="Open a sales contract with shipment window and terms."
              endpoint="contracts"
              method="POST"
              sampleBody={JSON.stringify(createContractSample, null, 2)}
            />
          </div>
        </details>

        <details className="collapsible" open>
          <summary>Allocation Builder</summary>
          <div className="content">
            <ActionPanel
              title="Allocate Lot to Contract"
              description="Use path like contracts/12/allocations to assign lot quantity."
              endpoint="contracts/1/allocations"
              method="POST"
              sampleBody={JSON.stringify(allocateLotSample, null, 2)}
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
          { name: "status", label: "Filter status" },
          { name: "buyer_id", label: "Filter buyer_id" },
          { name: "shipment_window_from", label: "Filter window start from" },
          { name: "shipment_window_to", label: "Filter window end to" }
        ]}
      />
    </>
  );
}
