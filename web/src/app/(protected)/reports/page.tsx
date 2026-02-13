"use client";

import { GuidedActionForm } from "@/components/data/GuidedActionForm";
import { Card } from "@/components/ui/Card";
import { useSessionQuery } from "@/modules/auth/useSessionQuery";
import { contractLookupFields } from "@/modules/finance/config";
import { lotLookupFields } from "@/modules/traceability/config";

export default function ReportsPage(): React.JSX.Element {
  const session = useSessionQuery();
  const role = session.data?.user?.role;
  const canViewProfitability = role === "admin" || role === "finance" || role === "trader";
  const canViewTraceability = role === "admin" || role === "compliance" || role === "trader";

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
        {canViewProfitability ? (
          <GuidedActionForm
            title="Contract Profitability"
            description="Review cost, revenue, and margin for a contract."
            submitLabel="Load profitability"
            successMessage="Profitability loaded"
            pathTemplate="profitability/contracts/{contract_id}"
            pathFields={contractLookupFields}
            method="GET"
          />
        ) : null}

        {canViewTraceability ? (
          <GuidedActionForm
            title="Lot Traceability"
            description="Review lot origin, allocations, and shipment movement."
            submitLabel="Load traceability"
            successMessage="Traceability loaded"
            pathTemplate="traceability/lots/{lot_id}"
            pathFields={lotLookupFields}
            method="GET"
          />
        ) : null}
      </div>
    </>
  );
}
