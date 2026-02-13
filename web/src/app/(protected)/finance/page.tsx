"use client";

import { GuidedActionForm } from "@/components/data/GuidedActionForm";
import { contractLookupFields, costEntryFields } from "@/modules/finance/config";

export default function FinancePage(): React.JSX.Element {
  return (
    <div className="grid two">
      <GuidedActionForm
        title="Record Cost"
        description="Capture lot-level or shipment-level operational costs."
        submitLabel="Save cost"
        successMessage="Cost saved"
        pathTemplate="costs/entries"
        bodyFields={costEntryFields}
      />

      <GuidedActionForm
        title="Contract Profitability"
        description="View margin and total cost for a selected contract."
        submitLabel="View profitability"
        successMessage="Profitability loaded"
        pathTemplate="profitability/contracts/{contract_id}"
        pathFields={contractLookupFields}
        method="GET"
      />
    </div>
  );
}
