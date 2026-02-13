"use client";

import { GuidedActionForm } from "@/components/data/GuidedActionForm";
import { Card } from "@/components/ui/Card";
import { contractLookupFields } from "@/modules/finance/config";
import { lotLookupFields } from "@/modules/traceability/config";

export default function ReportsPage(): React.JSX.Element {
  return (
    <>
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

      <div className="grid two">
        <GuidedActionForm
          title="Contract Profitability"
          description="Review cost, revenue, and margin for a contract."
          submitLabel="Load profitability"
          successMessage="Profitability loaded"
          pathTemplate="profitability/contracts/{contract_id}"
          pathFields={contractLookupFields}
          method="GET"
        />

        <GuidedActionForm
          title="Lot Traceability"
          description="Review lot origin, allocations, and shipment movement."
          submitLabel="Load traceability"
          successMessage="Traceability loaded"
          pathTemplate="traceability/lots/{lot_id}"
          pathFields={lotLookupFields}
          method="GET"
        />
      </div>
    </>
  );
}
