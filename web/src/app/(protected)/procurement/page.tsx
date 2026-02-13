"use client";

import { GuidedActionForm } from "@/components/data/GuidedActionForm";
import { ResourcePanel } from "@/components/data/ResourcePanel";
import {
  auctionLotFields,
  directAgreementFields,
  directAgreementFilters,
  directDeliveryFields
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

        <GuidedActionForm
          title="Auction Purchase Intake"
          description="Record auction lot details and save directly to inventory."
          submitLabel="Save auction lot"
          successMessage="Auction lot saved"
          pathTemplate="procurement/auction-lots"
          bodyFields={auctionLotFields}
        />
      </div>

      <GuidedActionForm
        title="Direct Delivery Intake"
        description="Capture incoming direct delivery quantities and quality metrics."
        submitLabel="Save delivery"
        successMessage="Direct delivery saved"
        pathTemplate="procurement/direct-deliveries"
        bodyFields={directDeliveryFields}
      />
    </>
  );
}
