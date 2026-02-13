"use client";

import { ActionPanel } from "@/components/data/ActionPanel";
import { Card } from "@/components/ui/Card";

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
        <ActionPanel
          title="Contract Profitability"
          description="Use GET path like profitability/contracts/8."
          endpoint="profitability/contracts/1"
          method="GET"
          sampleBody="{}"
        />

        <ActionPanel
          title="Lot Traceability"
          description="Use GET path like traceability/lots/14 to audit full origin chain."
          endpoint="traceability/lots/1"
          method="GET"
          sampleBody="{}"
        />
      </div>
    </>
  );
}
