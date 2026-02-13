"use client";

import { ActionPanel } from "@/components/data/ActionPanel";
import { ResourcePanel } from "@/components/data/ResourcePanel";
import {
  auctionLotSample,
  directAgreementFields,
  directAgreementFilters,
  directDeliverySample
} from "@/modules/procurement/config";

export default function ProcurementPage(): React.JSX.Element {
  return (
    <>
      <div className="grid two">
        <ResourcePanel
          title="Direct Agreements"
          description="Create and list direct procurement agreements."
          listEndpoint="procurement/direct-agreements"
          createEndpoint="procurement/direct-agreements"
          createFields={directAgreementFields}
          sortBy="created_at"
          filters={directAgreementFilters}
        />

        <ActionPanel
          title="Create Auction Lot"
          description="Capture auction procurement details as immutable source lots."
          endpoint="procurement/auction-lots"
          method="POST"
          sampleBody={JSON.stringify(auctionLotSample, null, 2)}
        />
      </div>

      <ActionPanel
        title="Create Direct Delivery"
        description="Attach delivery intake quality to an existing direct agreement and create an inventory lot."
        endpoint="procurement/direct-deliveries"
        method="POST"
        sampleBody={JSON.stringify(directDeliverySample, null, 2)}
      />
    </>
  );
}
