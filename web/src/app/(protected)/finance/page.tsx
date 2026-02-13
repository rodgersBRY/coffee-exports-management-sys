"use client";

import { ActionPanel } from "@/components/data/ActionPanel";
import { createCostEntrySample } from "@/modules/finance/config";

export default function FinancePage(): React.JSX.Element {
  return (
    <div className="grid two">
      <ActionPanel
        title="Create Cost Entry"
        description="Attach lot- or shipment-level costs for profitability."
        endpoint="costs/entries"
        method="POST"
        sampleBody={JSON.stringify(createCostEntrySample, null, 2)}
      />

      <ActionPanel
        title="Contract Profitability"
        description="Use GET path like profitability/contracts/8."
        endpoint="profitability/contracts/1"
        method="GET"
        sampleBody="{}"
      />
    </div>
  );
}
